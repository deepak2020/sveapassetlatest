#!/usr/bin/env node
/**
 * Import one user's Base44 data into Supabase after they've logged in via Google.
 * Must run AFTER migrate-from-base44.js has produced the export files.
 *
 * Prerequisites: Node 18+
 *
 * Usage — single user:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js user@example.com
 *
 * Usage — all users who have already logged in:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/import-user-data.js --all
 *
 * The user MUST have logged in via Google at least once before you run this,
 * so their auth.users row exists in Supabase.
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zpuaksuhvgwvnvopjaov.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Load export ───────────────────────────────────────────────────────────────

function loadExport() {
  try {
    return JSON.parse(readFileSync('scripts/base44-export/users-by-email.json', 'utf8'));
  } catch {
    console.error('ERROR: scripts/base44-export/users-by-email.json not found.');
    console.error('Run migrate-from-base44.js first.');
    process.exit(1);
  }
}

// ── Import one user ───────────────────────────────────────────────────────────

async function importUser(email, allData, supaUsers) {
  const key      = email.toLowerCase();
  const userData = allData[key];

  if (!userData) {
    console.log(`  ⚠  No Base44 data for ${email} — skipping`);
    return false;
  }

  const supaUser = supaUsers.find(u => u.email?.toLowerCase() === key);
  if (!supaUser) {
    console.log(`  ⚠  ${email} hasn't logged in yet — skipping`);
    return false;
  }

  const userId = supaUser.id;
  console.log(`  Importing ${email} (Supabase ID: ${userId})`);

  // Profile
  const { error: profErr } = await supabase
    .from('profiles')
    .update({
      full_name:           userData.profile.full_name,
      sfi_level:           userData.profile.sfi_level,
      goal:                userData.profile.goal,
      daily_goal_minutes:  userData.profile.daily_goal_minutes,
      xp_total:            userData.profile.xp_total,
      streak_days:         userData.profile.streak_days,
      last_active_date:    userData.profile.last_active_date,
      onboarding_complete: userData.profile.onboarding_complete,
      role:                userData.profile.role,
    })
    .eq('id', userId);
  if (profErr) throw new Error(`Profile update failed: ${profErr.message}`);

  // Quiz results
  if (userData.quiz_results.length > 0) {
    const rows = userData.quiz_results.map(({ _base44_user_id, ...r }) => ({
      ...r, user_id: userId,
    }));
    const { error } = await supabase.from('quiz_results').insert(rows);
    if (error) throw new Error(`quiz_results insert: ${error.message}`);
    console.log(`    ✓ ${rows.length} quiz results`);
  }

  // Vocabulary
  if (userData.vocabulary.length > 0) {
    const rows = userData.vocabulary.map(({ _base44_user_id, ...r }) => ({
      ...r, user_id: userId,
    }));
    const { error } = await supabase.from('user_vocabulary').insert(rows);
    if (error) throw new Error(`user_vocabulary insert: ${error.message}`);
    console.log(`    ✓ ${rows.length} vocabulary entries`);
  }

  // SRS cards (skip cards whose cloze_sentence_id wasn't migrated)
  const validCards = userData.srs_cards.filter(c => c.cloze_sentence_id);
  if (validCards.length > 0) {
    const rows = validCards.map(({ _base44_user_id, ...c }) => ({
      ...c, user_id: userId,
    }));
    const { error } = await supabase.from('user_srs_cards').insert(rows);
    if (error) throw new Error(`user_srs_cards insert: ${error.message}`);
    console.log(`    ✓ ${rows.length} SRS cards`);
  }

  const skipped = userData.srs_cards.length - validCards.length;
  if (skipped > 0) {
    console.log(`    ⚠  ${skipped} SRS cards skipped (cloze_sentence_id not found)`);
  }

  return true;
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

  const allData = loadExport();

  // Fetch all Supabase auth users once
  const { data: { users: supaUsers }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  if (arg === '--all') {
    console.log(`Importing all users who have logged in (${supaUsers.length} Supabase accounts)…\n`);
    let ok = 0, skipped = 0;
    for (const u of supaUsers) {
      const result = await importUser(u.email, allData, supaUsers);
      result ? ok++ : skipped++;
    }
    console.log(`\n✓ Done — ${ok} imported, ${skipped} skipped`);
  } else {
    const ok = await importUser(arg, allData, supaUsers);
    if (ok) console.log(`\n✓ Import complete for ${arg}`);
  }
}

main().catch(err => {
  console.error('\n✗ FATAL:', err.message);
  process.exit(1);
});
