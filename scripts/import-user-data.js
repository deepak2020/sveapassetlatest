#!/usr/bin/env node
/**
 * Import user data from Base44 into Supabase.
 * Fetches directly from Base44 — no artifact file needed.
 * Users MUST have logged in via Google at least once first.
 *
 * Prerequisites: Node 18+
 *
 * Usage — single user:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js user@example.com
 *
 * Usage — all users who have already logged in:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js --all
 */

import { createClient } from '@supabase/supabase-js';

const BASE44_APP_ID = '6a05a8cd3d89f28998abebbd';
const BASE44_BASE   = `https://svensk-path-goal.base44.app/api/apps/${BASE44_APP_ID}`;
const BASE44_HEADERS = {
  'api_key':      '7043976fee8e434299b13b22a5ee9fa1',
  'Content-Type': 'application/json',
};

const SUPABASE_URL = 'https://zpuaksuhvgwvnvopjaov.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Base44 fetch ──────────────────────────────────────────────────────────────

async function b44Fetch(entity) {
  const url = `${BASE44_BASE}/entities/${entity}?limit=5000`;
  const resp = await fetch(url, { headers: BASE44_HEADERS });
  if (!resp.ok) throw new Error(`Base44 ${entity} → HTTP ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data) ? data : (data.data ?? data.results ?? []);
}

// ── Build cloze mapping: Base44 ID → Supabase UUID ────────────────────────────
// Matches by sentence_sv + answer since we don't store Base44 IDs in Supabase.

async function buildClozeMapping() {
  process.stdout.write('  Building cloze sentence ID mapping…');

  const [b44Sentences, { data: supaSentences }] = await Promise.all([
    b44Fetch('ClozeSentence'),
    supabase.from('cloze_sentences').select('id, sentence_sv, answer'),
  ]);

  const supaLookup = {};
  for (const s of (supaSentences ?? [])) {
    supaLookup[`${s.sentence_sv}|||${s.answer}`] = s.id;
  }

  const mapping = {};
  for (const s of b44Sentences) {
    const key = `${s.sentence_sv}|||${s.answer}`;
    if (supaLookup[key]) mapping[s.id] = supaLookup[key];
  }

  console.log(` ${Object.keys(mapping).length}/${b44Sentences.length} matched`);
  return mapping;
}

// ── Import one user ───────────────────────────────────────────────────────────

async function importUser(supaUser, userData, clozemap) {
  const userId = supaUser.id;
  const email  = supaUser.email;

  console.log(`  ${email}`);

  // Profile
  const { error: profErr } = await supabase
    .from('profiles')
    .update({
      full_name:           userData.full_name           ?? null,
      sfi_level:           userData.sfi_level           ?? null,
      goal:                userData.goal                ?? null,
      daily_goal_minutes:  userData.daily_goal_minutes  ?? 10,
      xp_total:            userData.xp_total            ?? 0,
      streak_days:         userData.streak_days         ?? 0,
      last_active_date:    userData.last_active_date    ?? null,
      onboarding_complete: userData.onboarding_complete ?? false,
      role:                userData.role                || 'user',
    })
    .eq('id', userId);
  if (profErr) throw new Error(`Profile: ${profErr.message}`);

  // Quiz results
  if (userData.quiz_results.length > 0) {
    const rows = userData.quiz_results.map(r => ({
      user_id:      userId,
      quiz_type:    r.quiz_type    || 'language',
      source_id:    r.source_id    ?? null,
      source_title: r.source_title ?? null,
      sfi_course:   r.sfi_course   ?? null,
      skill:        r.skill        ?? null,
      score:        r.score        ?? 0,
      total:        r.total        ?? 0,
      percentage:   r.percentage   ?? 0,
      description:  r.description  ?? null,
      created_at:   r.created_date ?? new Date().toISOString(),
    }));
    const { error } = await supabase.from('quiz_results').insert(rows);
    if (error) throw new Error(`quiz_results: ${error.message}`);
    console.log(`    ✓ ${rows.length} quiz results`);
  }

  // Vocabulary
  if (userData.vocabulary.length > 0) {
    const rows = userData.vocabulary.map(r => ({
      user_id:          userId,
      swedish:          r.swedish,
      english:          r.english,
      lesson_id:        r.lesson_id        ?? null,
      lesson_title:     r.lesson_title     ?? null,
      example_sentence: r.example_sentence ?? null,
      notes:            r.notes            ?? null,
      created_at:       r.created_date     ?? new Date().toISOString(),
    }));
    const { error } = await supabase.from('user_vocabulary').insert(rows);
    if (error) throw new Error(`user_vocabulary: ${error.message}`);
    console.log(`    ✓ ${rows.length} vocabulary entries`);
  }

  // SRS cards
  const validCards = userData.srs_cards
    .map(c => ({ ...c, supabase_cloze_id: clozemap[c.cloze_sentence_id] }))
    .filter(c => c.supabase_cloze_id);

  if (validCards.length > 0) {
    const rows = validCards.map(c => ({
      user_id:             userId,
      cloze_sentence_id:   c.supabase_cloze_id,
      interval_days:       c.interval_days       ?? 1,
      due_date:            c.due_date            ?? null,
      ease_factor:         c.ease_factor         ?? 2.5,
      times_seen:          c.times_seen          ?? 0,
      times_correct:       c.times_correct       ?? 0,
      correct_streak:      c.correct_streak      ?? 0,
      last_answer_correct: c.last_answer_correct ?? null,
      mastery_percentage:  c.mastery_percentage  ?? 0,
      status:              c.status              || 'new',
      description:         c.description         ?? null,
      created_at:          c.created_date        ?? new Date().toISOString(),
    }));
    const { error } = await supabase.from('user_srs_cards').insert(rows);
    if (error) throw new Error(`user_srs_cards: ${error.message}`);
    console.log(`    ✓ ${rows.length} SRS cards`);
  }

  const skipped = userData.srs_cards.length - validCards.length;
  if (skipped > 0) console.log(`    ⚠  ${skipped} SRS cards skipped (no Supabase match)`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage:');
    console.error('  node scripts/import-user-data.js user@example.com');
    console.error('  node scripts/import-user-data.js --all');
    process.exit(1);
  }

  console.log('Fetching user data from Base44…');
  const [b44Users, quizResults, vocabulary, srsCards] = await Promise.all([
    b44Fetch('User'),
    b44Fetch('QuizResult'),
    b44Fetch('UserVocabulary'),
    b44Fetch('UserSRSCard'),
  ]);
  console.log(`  ${b44Users.length} users, ${quizResults.length} quiz results, ${vocabulary.length} vocabulary, ${srsCards.length} SRS cards`);

  // Build per-user lookup keyed by Base44 user ID
  const b44ById = {};
  for (const u of b44Users) {
    b44ById[u.id] = {
      ...u,
      quiz_results: quizResults.filter(r => r.user_id === u.id),
      vocabulary:   vocabulary.filter(r => r.user_id === u.id),
      srs_cards:    srsCards.filter(r => r.user_id === u.id),
    };
  }
  const b44ByEmail = {};
  for (const u of b44Users) {
    if (u.email) b44ByEmail[u.email.toLowerCase()] = b44ById[u.id];
  }

  const clozemap = await buildClozeMapping();

  // Fetch Supabase auth users
  const { data: { users: supaUsers }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const targets = arg === '--all'
    ? supaUsers.filter(u => u.email && b44ByEmail[u.email.toLowerCase()])
    : supaUsers.filter(u => u.email?.toLowerCase() === arg.toLowerCase());

  if (targets.length === 0) {
    console.log(arg === '--all'
      ? 'No Supabase users match any Base44 account. Have users log in first.'
      : `${arg} not found in Supabase. Have them log in first.`);
    process.exit(0);
  }

  console.log(`\nImporting ${targets.length} user(s)…\n`);
  let ok = 0;
  for (const supaUser of targets) {
    const userData = b44ByEmail[supaUser.email.toLowerCase()];
    await importUser(supaUser, userData, clozemap);
    ok++;
  }

  console.log(`\n✓ Done — ${ok} user(s) imported`);
}

main().catch(err => {
  console.error('\n✗ FATAL:', err.message);
  process.exit(1);
});
