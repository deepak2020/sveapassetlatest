/**
 * Import User-Specific Data from Base44 to Supabase
 * 
 * Run this AFTER users have signed up in Supabase and you've updated
 * the user_migration_mapping.json file with their new Supabase IDs.
 * 
 * Usage: node --env-file-if-exists=/vercel/share/.env.project scripts/import-user-data.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DATA_DIR = path.join(__dirname, 'data');

function readJsonFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`[SKIP] ${filename} not found`);
    return null;
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

async function batchInsert(tableName, records, batchSize = 100) {
  if (!records || records.length === 0) {
    return { inserted: 0, errors: 0 };
  }

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { data, error } = await supabase.from(tableName).insert(batch).select();
    
    if (error) {
      console.error(`[ERROR] ${tableName} batch ${i / batchSize + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += data.length;
    }
  }

  return { inserted, errors };
}

async function main() {
  console.log('='.repeat(50));
  console.log('User Data Import (Base44 -> Supabase)');
  console.log('='.repeat(50));

  // Load user migration mapping
  const mappingFile = path.join(DATA_DIR, 'user_migration_mapping.json');
  if (!fs.existsSync(mappingFile)) {
    console.error('[ERROR] user_migration_mapping.json not found!');
    console.log('Run import-data.js first to generate the mapping file.');
    return;
  }

  const userMapping = JSON.parse(fs.readFileSync(mappingFile, 'utf-8'));
  
  // Build Base44 ID -> Supabase ID map
  const userIdMap = new Map();
  let mappedUsers = 0;
  
  for (const user of userMapping) {
    if (user.supabase_id && user.base44_id) {
      userIdMap.set(user.base44_id, user.supabase_id);
      mappedUsers++;
    }
  }

  console.log(`\nFound ${mappedUsers}/${userMapping.length} users with Supabase IDs`);

  if (mappedUsers === 0) {
    console.log('\n[ERROR] No users have been mapped yet!');
    console.log('Update user_migration_mapping.json with Supabase user IDs first.');
    return;
  }

  // Load lesson and civic topic mappings (if available)
  const lessonIdMap = new Map();
  const civicTopicIdMap = new Map();

  // Fetch existing lessons with base44_id
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, base44_id')
    .not('base44_id', 'is', null);
  
  if (lessons) {
    lessons.forEach(l => lessonIdMap.set(l.base44_id, l.id));
    console.log(`Loaded ${lessons.length} lesson ID mappings`);
  }

  // Fetch existing civic topics with base44_id
  const { data: civicTopics } = await supabase
    .from('civic_topics')
    .select('id, base44_id')
    .not('base44_id', 'is', null);
  
  if (civicTopics) {
    civicTopics.forEach(t => civicTopicIdMap.set(t.base44_id, t.id));
    console.log(`Loaded ${civicTopics.length} civic topic ID mappings`);
  }

  // Update user profiles with Base44 data
  console.log('\n--- Updating User Profiles ---');
  const usersData = readJsonFile('users.json');
  if (usersData) {
    const users = Array.isArray(usersData) ? usersData : usersData.data || [];
    let updated = 0;
    
    for (const base44User of users) {
      const base44Id = base44User.id || base44User._id;
      const supabaseId = userIdMap.get(base44Id);
      
      if (!supabaseId) continue;

      const { error } = await supabase
        .from('profiles')
        .update({
          sfi_level: base44User.sfi_level || base44User.sfiLevel,
          goal: base44User.goal,
          daily_goal_minutes: base44User.daily_goal_minutes || base44User.dailyGoalMinutes || 10,
          xp_total: base44User.xp_total || base44User.xpTotal || 0,
          streak_days: base44User.streak_days || base44User.streakDays || 0,
          onboarding_complete: base44User.onboarding_complete || base44User.onboardingComplete || false,
          base44_user_id: base44Id,
        })
        .eq('id', supabaseId);

      if (!error) updated++;
    }
    console.log(`[OK] Updated ${updated} user profiles`);
  }

  // Import User Vocabulary
  console.log('\n--- Importing User Vocabulary ---');
  const vocabData = readJsonFile('user_vocabulary.json');
  if (vocabData) {
    const vocabItems = (Array.isArray(vocabData) ? vocabData : vocabData.data || [])
      .map(v => {
        const base44UserId = v.created_by || v.createdBy || v.user_id || v.userId;
        const userId = userIdMap.get(base44UserId);
        if (!userId) return null;

        const base44LessonId = v.lesson_id || v.lessonId;
        return {
          user_id: userId,
          word: v.word,
          translation: v.translation,
          example_sentence: v.example_sentence || v.exampleSentence,
          example_translation: v.example_translation || v.exampleTranslation,
          notes: v.notes,
          category: v.category,
          level: v.level,
          mastery_level: v.mastery_level || v.masteryLevel || 0,
          times_reviewed: v.times_reviewed || v.timesReviewed || 0,
          times_correct: v.times_correct || v.timesCorrect || 0,
          last_reviewed_at: v.last_reviewed_at || v.lastReviewedAt,
          next_review_at: v.next_review_at || v.nextReviewAt,
          lesson_id: base44LessonId ? lessonIdMap.get(base44LessonId) : null,
          base44_id: v.id || v._id,
        };
      })
      .filter(Boolean);

    const result = await batchInsert('user_vocabulary', vocabItems);
    console.log(`[DONE] Vocabulary: ${result.inserted} inserted, ${result.errors} errors`);
  }

  // Import User SRS Cards
  console.log('\n--- Importing User SRS Cards ---');
  const srsData = readJsonFile('user_srs_cards.json');
  if (srsData) {
    const srsCards = (Array.isArray(srsData) ? srsData : srsData.data || [])
      .map(card => {
        const base44UserId = card.created_by || card.createdBy || card.user_id || card.userId;
        const userId = userIdMap.get(base44UserId);
        if (!userId) return null;

        return {
          user_id: userId,
          card_type: card.card_type || card.cardType || 'vocabulary',
          content_id: null,
          front: card.front,
          back: card.back,
          level: card.level,
          ease_factor: card.ease_factor || card.easeFactor || 2.5,
          interval_days: card.interval_days || card.intervalDays || 1,
          repetitions: card.repetitions || 0,
          next_review_at: card.next_review_at || card.nextReviewAt,
          last_reviewed_at: card.last_reviewed_at || card.lastReviewedAt,
          last_quality: card.last_quality || card.lastQuality,
          base44_id: card.id || card._id,
        };
      })
      .filter(Boolean);

    const result = await batchInsert('user_srs_cards', srsCards);
    console.log(`[DONE] SRS Cards: ${result.inserted} inserted, ${result.errors} errors`);
  }

  // Import Quiz Results
  console.log('\n--- Importing Quiz Results ---');
  const quizData = readJsonFile('quiz_results.json');
  if (quizData) {
    const quizResults = (Array.isArray(quizData) ? quizData : quizData.data || [])
      .map(result => {
        const base44UserId = result.created_by || result.createdBy || result.user_id || result.userId;
        const userId = userIdMap.get(base44UserId);
        if (!userId) return null;

        const base44LessonId = result.lesson_id || result.lessonId;
        const base44CivicTopicId = result.civic_topic_id || result.civicTopicId;
        const score = result.score || 0;
        const totalQuestions = result.total_questions || result.totalQuestions || 1;

        return {
          user_id: userId,
          quiz_type: result.quiz_type || result.quizType || 'lesson',
          lesson_id: base44LessonId ? lessonIdMap.get(base44LessonId) : null,
          civic_topic_id: base44CivicTopicId ? civicTopicIdMap.get(base44CivicTopicId) : null,
          score: score,
          total_questions: totalQuestions,
          percentage: Math.round((score / totalQuestions) * 100 * 100) / 100,
          time_spent_seconds: result.time_spent_seconds || result.timeSpentSeconds,
          answers: result.answers,
          xp_earned: result.xp_earned || result.xpEarned || 0,
          base44_id: result.id || result._id,
          created_at: result.created_date || result.createdDate || new Date().toISOString(),
        };
      })
      .filter(Boolean);

    const importResult = await batchInsert('quiz_results', quizResults);
    console.log(`[DONE] Quiz Results: ${importResult.inserted} inserted, ${importResult.errors} errors`);
  }

  // Update mapping file to mark users as migrated
  for (const user of userMapping) {
    if (user.supabase_id) {
      user.migrated = true;
    }
  }
  fs.writeFileSync(mappingFile, JSON.stringify(userMapping, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('User data import complete!');
  console.log('='.repeat(50));
}

main().catch(console.error);
