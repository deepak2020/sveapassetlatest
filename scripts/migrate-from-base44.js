#!/usr/bin/env node
/**
 * Migrate content from Base44 → Supabase.
 * Run this on your LOCAL machine (this environment can't reach Base44).
 *
 * Prerequisites: Node 18+  (uses built-in fetch + crypto)
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> node scripts/migrate-from-base44.js
 *
 * Get the service role key from:
 *   Supabase Dashboard → Project Settings → API → service_role (secret)
 *
 * What this does:
 *   1. Fetches Lessons, CivicTopics, ClozeSentences from Base44 and inserts them
 *      into Supabase (these are public-content tables — no user association).
 *   2. Exports Users + user-owned data (QuizResults, UserVocabulary, UserSRSCards)
 *      to scripts/base44-export/users-by-email.json  — NOT inserted yet.
 *   3. Saves Base44-ID → Supabase-UUID mappings to id-mappings.json.
 *
 * After running, use scripts/import-user-data.js to import one user at a time
 * once they've logged in via Google OAuth.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { createClient }             from '@supabase/supabase-js';

// ── Config ───────────────────────────────────────────────────────────────────

const BASE44_APP_ID = '6a05a8cd3d89f28998abebbd';
const BASE44_BASE   = `https://svensk-path-goal.base44.app/api/apps/${BASE44_APP_ID}`;
const BASE44_HEADERS = {
  'api_key':      '7043976fee8e434299b13b22a5ee9fa1',
  'Content-Type': 'application/json',
};

const SUPABASE_URL = 'https://zpuaksuhvgwvnvopjaov.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN      = process.env.DRY_RUN === 'true';

if (!SERVICE_KEY && !DRY_RUN) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY before running.');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY=<your-key>');
  console.error('  node scripts/migrate-from-base44.js');
  process.exit(1);
}

if (DRY_RUN) console.log('DRY RUN — Supabase inserts will be skipped.\n');

const supabase = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
}) : null;

// ── ID mapping (Base44 string id → deterministic UUID for idempotency) ────────
const idMap = {};
function mapId(base44Id) {
  if (!base44Id) return null;
  if (!idMap[base44Id]) idMap[base44Id] = crypto.randomUUID();
  return idMap[base44Id];
}

// ── Base44 helpers ────────────────────────────────────────────────────────────

let _debugDone = false;
async function b44Fetch(entity, params = {}) {
  const url = new URL(`${BASE44_BASE}/entities/${entity}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const resp = await fetch(url.toString(), { headers: BASE44_HEADERS });
  const text = await resp.text();
  if (!_debugDone) {
    _debugDone = true;
    console.log(`[debug] GET ${url}`);
    console.log(`[debug] HTTP ${resp.status} — first 500 chars: ${text.slice(0, 500)}`);
  }
  if (!resp.ok) throw new Error(`Base44 ${entity} → HTTP ${resp.status}: ${text}`);
  return JSON.parse(text);
}

async function fetchAll(entity, transform) {
  const rows   = [];
  let   offset = 0;
  const limit  = 100;

  while (true) {
    process.stdout.write(`  Fetching ${entity} (offset=${offset})…\r`);
    const page = await b44Fetch(entity, { limit, offset });
    const batch = Array.isArray(page) ? page : (page.data ?? page.results ?? []);
    if (batch.length === 0) break;
    rows.push(...(transform ? batch.map(transform) : batch));
    if (batch.length < limit) break;
    offset += limit;
    await new Promise(r => setTimeout(r, 250)); // avoid hammering the API
  }

  process.stdout.write(`\r\x1B[K`); // clear line
  return rows;
}

// ── Supabase upsert (in chunks to stay within request limits) ─────────────────

async function upsert(table, rows) {
  if (rows.length === 0) { console.log(`  ✓ ${table}: 0 rows (nothing to insert)`); return; }
  if (DRY_RUN) { console.log(`  [dry-run] ${table}: would insert ${rows.length} rows`); return; }
  const CHUNK = 50;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) throw new Error(`Upsert ${table} at offset ${i}: ${error.message}`);
    process.stdout.write(`  ${table}: ${Math.min(i + CHUNK, rows.length)}/${rows.length}\r`);
  }
  console.log(`  ✓ ${table}: ${rows.length} rows inserted/updated`);
}

// ── Entity transformers ───────────────────────────────────────────────────────

function mapLesson(r) {
  return {
    id:                mapId(r.id),
    title:             r.title,
    title_sv:          r.title_sv           ?? null,
    topic:             r.topic              ?? null,
    sfi_course:        r.sfi_course         ?? null,
    category:          r.category           ?? null,
    skill:             r.skill              ?? null,
    level:             r.level              || 'beginner',
    content:           r.content            ?? null,
    word_pairs:        r.word_pairs         ?? [],
    fill_in_blanks:    r.fill_in_blanks     ?? [],
    writing_prompts:   r.writing_prompts    ?? [],
    speaking_phrases:  r.speaking_phrases   ?? [],
    listening_phrases: r.listening_phrases  ?? [],
    quiz_questions:    r.quiz_questions     ?? [],
    review_questions:  r.review_questions   ?? [],
    match_pairs:       r.match_pairs        ?? [],
    order:             r.order              ?? 0,
    created_at:        r.created_date       ?? new Date().toISOString(),
  };
}

function mapCivicTopic(r) {
  return {
    id:             mapId(r.id),
    title:          r.title,
    subtitle:       r.subtitle       ?? null,
    chapter:        r.chapter        || 'General',
    category:       r.category       || 'government',
    content:        r.content        ?? null,
    key_facts:      r.key_facts      ?? [],
    quiz_questions: r.quiz_questions ?? [],
    order:          r.order          ?? 0,
    created_at:     r.created_date   ?? new Date().toISOString(),
  };
}

function mapClozeSentence(r) {
  return {
    id:                  mapId(r.id),
    sentence_sv:         r.sentence_sv,
    sentence_en:         r.sentence_en         ?? null,
    answer:              r.answer,
    distractors:         r.distractors         ?? [],
    sfi_level:           r.sfi_level           || 'A',
    topic:               r.topic               ?? null,
    word_frequency_rank: r.word_frequency_rank ?? null,
    grammar_note:        r.grammar_note        ?? null,
    pronunciation_tip:   r.pronunciation_tip   ?? null,
    source:              r.source              || 'manual',
    description:         r.description         ?? null,
    created_at:          r.created_date        ?? new Date().toISOString(),
  };
}

// These keep _base44_user_id for grouping; stripped before Supabase insert.
function mapQuizResult(r) {
  return {
    _base44_user_id: r.user_id,
    source_id:       r.source_id    ? mapId(r.source_id) : null,
    source_title:    r.source_title ?? null,
    quiz_type:       r.quiz_type    || 'language',
    sfi_course:      r.sfi_course   ?? null,
    skill:           r.skill        ?? null,
    score:           r.score        ?? 0,
    total:           r.total        ?? 0,
    percentage:      r.percentage   ?? 0,
    description:     r.description  ?? null,
    created_at:      r.created_date ?? new Date().toISOString(),
  };
}

function mapVocabulary(r) {
  return {
    _base44_user_id:  r.user_id,
    swedish:          r.swedish,
    english:          r.english,
    lesson_id:        r.lesson_id        ?? null,
    lesson_title:     r.lesson_title     ?? null,
    example_sentence: r.example_sentence ?? null,
    notes:            r.notes            ?? null,
    created_at:       r.created_date     ?? new Date().toISOString(),
  };
}

function mapSRSCard(r) {
  return {
    _base44_user_id:     r.user_id,
    cloze_sentence_id:   r.cloze_sentence_id ? mapId(r.cloze_sentence_id) : null,
    interval_days:       r.interval_days      ?? 1,
    due_date:            r.due_date           ?? null,
    ease_factor:         r.ease_factor        ?? 2.5,
    times_seen:          r.times_seen         ?? 0,
    times_correct:       r.times_correct      ?? 0,
    correct_streak:      r.correct_streak     ?? 0,
    last_answer_correct: r.last_answer_correct ?? null,
    mastery_percentage:  r.mastery_percentage  ?? 0,
    status:              r.status             || 'new',
    description:         r.description        ?? null,
    created_at:          r.created_date       ?? new Date().toISOString(),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║  Base44 → Supabase Migration Script  ║');
  console.log('╚══════════════════════════════════════╝\n');

  mkdirSync('scripts/base44-export', { recursive: true });

  // ── Step 1: Content tables → Supabase ──────────────────────────────────────
  console.log('── Step 1: Migrate content tables ──────────────────────────────\n');

  console.log('Fetching Lessons…');
  const lessons = await fetchAll('Lesson', mapLesson);
  console.log(`  → ${lessons.length} lessons fetched`);
  await upsert('lessons', lessons);

  console.log('\nFetching CivicTopics…');
  const civics = await fetchAll('CivicTopic', mapCivicTopic);
  console.log(`  → ${civics.length} civic topics fetched`);
  await upsert('civic_topics', civics);

  console.log('\nFetching ClozeSentences…');
  const clozes = await fetchAll('ClozeSentence', mapClozeSentence);
  console.log(`  → ${clozes.length} cloze sentences fetched`);
  await upsert('cloze_sentences', clozes);

  // ── Step 2: User data → JSON export ────────────────────────────────────────
  console.log('\n── Step 2: Export user data ─────────────────────────────────────\n');

  console.log('Fetching Users…');
  const users = await fetchAll('User');
  console.log(`  → ${users.length} users`);

  console.log('Fetching QuizResults…');
  const quizResults = await fetchAll('QuizResult', mapQuizResult);
  console.log(`  → ${quizResults.length} quiz results`);

  console.log('Fetching UserVocabulary…');
  const vocabulary = await fetchAll('UserVocabulary', mapVocabulary);
  console.log(`  → ${vocabulary.length} vocabulary entries`);

  console.log('Fetching UserSRSCards…');
  const srsCards = await fetchAll('UserSRSCard', mapSRSCard);
  console.log(`  → ${srsCards.length} SRS cards`);

  // ── Step 3: Build per-email export ─────────────────────────────────────────
  const byEmail = {};
  for (const u of users) {
    if (!u.email) continue;
    const key = u.email.toLowerCase();
    byEmail[key] = {
      profile: {
        full_name:           u.full_name           ?? null,
        sfi_level:           u.sfi_level           ?? null,
        goal:                u.goal                ?? null,
        daily_goal_minutes:  u.daily_goal_minutes  ?? 10,
        xp_total:            u.xp_total            ?? 0,
        streak_days:         u.streak_days         ?? 0,
        last_active_date:    u.last_active_date    ?? null,
        onboarding_complete: u.onboarding_complete ?? false,
        role:                u.role                || 'user',
        _base44_id:          u.id,
      },
      quiz_results: quizResults.filter(r => r._base44_user_id === u.id),
      vocabulary:   vocabulary.filter(r => r._base44_user_id === u.id),
      srs_cards:    srsCards.filter(r => r._base44_user_id === u.id),
    };
  }

  writeFileSync(
    'scripts/base44-export/users-by-email.json',
    JSON.stringify(byEmail, null, 2),
  );
  writeFileSync(
    'scripts/base44-export/id-mappings.json',
    JSON.stringify(idMap, null, 2),
  );

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n── Summary ──────────────────────────────────────────────────────\n');
  console.log(`  Lessons inserted:         ${lessons.length}`);
  console.log(`  Civic topics inserted:    ${civics.length}`);
  console.log(`  Cloze sentences inserted: ${clozes.length}`);
  console.log(`  Users exported:           ${users.length}`);
  console.log(`  Quiz results exported:    ${quizResults.length}`);
  console.log(`  Vocabulary exported:      ${vocabulary.length}`);
  console.log(`  SRS cards exported:       ${srsCards.length}`);
  console.log('\n  Files written:');
  console.log('    scripts/base44-export/users-by-email.json');
  console.log('    scripts/base44-export/id-mappings.json');

  console.log('\n── Next steps ───────────────────────────────────────────────────\n');
  console.log('  1. Test the site at https://sveapassetlatest.vercel.app');
  console.log('  2. Have users log in with Google (same email as their Base44 account)');
  console.log('  3. For each user, run:');
  console.log('       SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js <email>');
  console.log('  4. To import ALL users at once:');
  console.log('       SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js --all');
  console.log('     (only imports data for users who have already logged in)');
  console.log('\n  ⚠  Keep scripts/base44-export/ private — it contains user PII.');
}

main().catch(err => {
  console.error('\n✗ FATAL:', err.message);
  process.exit(1);
});
