/**
 * Base44 to Supabase Data Import Script
 * 
 * Usage:
 * 1. Export data from Base44 dashboard as JSON files
 * 2. Place them in the scripts/data/ directory with these names:
 *    - lessons.json
 *    - civic_topics.json
 *    - cloze_sentences.json
 *    - users.json (for user profiles)
 *    - user_vocabulary.json
 *    - user_srs_cards.json
 *    - quiz_results.json
 * 
 * 3. Run: node --env-file-if-exists=/vercel/share/.env.project scripts/import-data.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DATA_DIR = path.join(__dirname, 'data');

// Helper to read JSON file
function readJsonFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`[SKIP] ${filename} not found`);
    return null;
  }
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

// Helper to batch insert with error handling
async function batchInsert(tableName, records, batchSize = 100) {
  if (!records || records.length === 0) {
    console.log(`[SKIP] No records for ${tableName}`);
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
      console.log(`[OK] ${tableName}: inserted batch ${i / batchSize + 1} (${data.length} records)`);
    }
  }

  return { inserted, errors };
}

// Transform Base44 Lesson to Supabase format
function transformLesson(base44Lesson) {
  return {
    title: base44Lesson.title,
    description: base44Lesson.description,
    level: base44Lesson.level,
    category: base44Lesson.category,
    order_index: base44Lesson.order_index || base44Lesson.orderIndex || 0,
    content: base44Lesson.content,
    vocabulary: base44Lesson.vocabulary,
    exercises: base44Lesson.exercises,
    estimated_minutes: base44Lesson.estimated_minutes || base44Lesson.estimatedMinutes || 10,
    xp_reward: base44Lesson.xp_reward || base44Lesson.xpReward || 10,
    is_published: base44Lesson.is_published !== false,
    base44_id: base44Lesson.id || base44Lesson._id,
  };
}

// Transform Base44 CivicTopic to Supabase format
function transformCivicTopic(base44Topic) {
  return {
    title: base44Topic.title,
    title_sv: base44Topic.title_sv || base44Topic.titleSv,
    description: base44Topic.description,
    description_sv: base44Topic.description_sv || base44Topic.descriptionSv,
    category: base44Topic.category,
    content: base44Topic.content,
    key_facts: base44Topic.key_facts || base44Topic.keyFacts,
    quiz_questions: base44Topic.quiz_questions || base44Topic.quizQuestions,
    order_index: base44Topic.order_index || base44Topic.orderIndex || 0,
    is_published: base44Topic.is_published !== false,
    base44_id: base44Topic.id || base44Topic._id,
  };
}

// Transform Base44 ClozeSentence to Supabase format
function transformClozeSentence(base44Cloze, lessonIdMap) {
  const base44LessonId = base44Cloze.lesson_id || base44Cloze.lessonId;
  return {
    sentence: base44Cloze.sentence,
    answer: base44Cloze.answer,
    alternatives: base44Cloze.alternatives,
    hint: base44Cloze.hint,
    translation: base44Cloze.translation,
    level: base44Cloze.level,
    category: base44Cloze.category,
    lesson_id: base44LessonId ? lessonIdMap.get(base44LessonId) : null,
    base44_id: base44Cloze.id || base44Cloze._id,
  };
}

// Transform Base44 User to Supabase profile format
// Note: Users need to be created in auth.users first, then profiles are linked
function transformUserProfile(base44User) {
  return {
    email: base44User.email,
    role: base44User.role || 'user',
    sfi_level: base44User.sfi_level || base44User.sfiLevel,
    goal: base44User.goal,
    daily_goal_minutes: base44User.daily_goal_minutes || base44User.dailyGoalMinutes || 10,
    xp_total: base44User.xp_total || base44User.xpTotal || 0,
    streak_days: base44User.streak_days || base44User.streakDays || 0,
    last_active_date: base44User.last_active_date || base44User.lastActiveDate,
    onboarding_complete: base44User.onboarding_complete || base44User.onboardingComplete || false,
    base44_user_id: base44User.id || base44User._id,
  };
}

// Transform Base44 UserVocabulary to Supabase format
function transformUserVocabulary(base44Vocab, userIdMap, lessonIdMap) {
  const base44UserId = base44Vocab.created_by || base44Vocab.createdBy || base44Vocab.user_id || base44Vocab.userId;
  const base44LessonId = base44Vocab.lesson_id || base44Vocab.lessonId;
  
  const userId = userIdMap.get(base44UserId);
  if (!userId) {
    return null; // Skip if user not found
  }

  return {
    user_id: userId,
    word: base44Vocab.word,
    translation: base44Vocab.translation,
    example_sentence: base44Vocab.example_sentence || base44Vocab.exampleSentence,
    example_translation: base44Vocab.example_translation || base44Vocab.exampleTranslation,
    notes: base44Vocab.notes,
    category: base44Vocab.category,
    level: base44Vocab.level,
    mastery_level: base44Vocab.mastery_level || base44Vocab.masteryLevel || 0,
    times_reviewed: base44Vocab.times_reviewed || base44Vocab.timesReviewed || 0,
    times_correct: base44Vocab.times_correct || base44Vocab.timesCorrect || 0,
    last_reviewed_at: base44Vocab.last_reviewed_at || base44Vocab.lastReviewedAt,
    next_review_at: base44Vocab.next_review_at || base44Vocab.nextReviewAt,
    lesson_id: base44LessonId ? lessonIdMap.get(base44LessonId) : null,
    base44_id: base44Vocab.id || base44Vocab._id,
  };
}

// Transform Base44 UserSRSCard to Supabase format
function transformUserSRSCard(base44Card, userIdMap) {
  const base44UserId = base44Card.created_by || base44Card.createdBy || base44Card.user_id || base44Card.userId;
  
  const userId = userIdMap.get(base44UserId);
  if (!userId) {
    return null; // Skip if user not found
  }

  return {
    user_id: userId,
    card_type: base44Card.card_type || base44Card.cardType || 'vocabulary',
    content_id: null, // Will need to map separately if needed
    front: base44Card.front,
    back: base44Card.back,
    level: base44Card.level,
    ease_factor: base44Card.ease_factor || base44Card.easeFactor || 2.5,
    interval_days: base44Card.interval_days || base44Card.intervalDays || 1,
    repetitions: base44Card.repetitions || 0,
    next_review_at: base44Card.next_review_at || base44Card.nextReviewAt,
    last_reviewed_at: base44Card.last_reviewed_at || base44Card.lastReviewedAt,
    last_quality: base44Card.last_quality || base44Card.lastQuality,
    base44_id: base44Card.id || base44Card._id,
  };
}

// Transform Base44 QuizResult to Supabase format
function transformQuizResult(base44Result, userIdMap, lessonIdMap, civicTopicIdMap) {
  const base44UserId = base44Result.created_by || base44Result.createdBy || base44Result.user_id || base44Result.userId;
  const base44LessonId = base44Result.lesson_id || base44Result.lessonId;
  const base44CivicTopicId = base44Result.civic_topic_id || base44Result.civicTopicId;
  
  const userId = userIdMap.get(base44UserId);
  if (!userId) {
    return null; // Skip if user not found
  }

  const score = base44Result.score || 0;
  const totalQuestions = base44Result.total_questions || base44Result.totalQuestions || 1;

  return {
    user_id: userId,
    quiz_type: base44Result.quiz_type || base44Result.quizType || 'lesson',
    lesson_id: base44LessonId ? lessonIdMap.get(base44LessonId) : null,
    civic_topic_id: base44CivicTopicId ? civicTopicIdMap.get(base44CivicTopicId) : null,
    score: score,
    total_questions: totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100 * 100) / 100,
    time_spent_seconds: base44Result.time_spent_seconds || base44Result.timeSpentSeconds,
    answers: base44Result.answers,
    xp_earned: base44Result.xp_earned || base44Result.xpEarned || 0,
    base44_id: base44Result.id || base44Result._id,
    created_at: base44Result.created_date || base44Result.createdDate || new Date().toISOString(),
  };
}

async function main() {
  console.log('='.repeat(50));
  console.log('Base44 to Supabase Data Import');
  console.log('='.repeat(50));

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`\nCreated data directory: ${DATA_DIR}`);
    console.log('Please place your Base44 export JSON files there and run again.');
    console.log('\nExpected files:');
    console.log('  - lessons.json');
    console.log('  - civic_topics.json');
    console.log('  - cloze_sentences.json');
    console.log('  - users.json');
    console.log('  - user_vocabulary.json');
    console.log('  - user_srs_cards.json');
    console.log('  - quiz_results.json');
    return;
  }

  // Maps to track Base44 ID -> Supabase UUID mappings
  const lessonIdMap = new Map();
  const civicTopicIdMap = new Map();
  const userIdMap = new Map(); // Base44 user ID -> Supabase auth.users UUID

  // 1. Import Lessons (content table)
  console.log('\n--- Importing Lessons ---');
  const lessonsData = readJsonFile('lessons.json');
  if (lessonsData) {
    const lessons = (Array.isArray(lessonsData) ? lessonsData : lessonsData.data || [])
      .map(transformLesson);
    
    const { data: insertedLessons } = await supabase
      .from('lessons')
      .insert(lessons)
      .select('id, base44_id');
    
    if (insertedLessons) {
      insertedLessons.forEach(lesson => {
        if (lesson.base44_id) {
          lessonIdMap.set(lesson.base44_id, lesson.id);
        }
      });
      console.log(`[OK] Imported ${insertedLessons.length} lessons`);
    }
  }

  // 2. Import Civic Topics (content table)
  console.log('\n--- Importing Civic Topics ---');
  const civicTopicsData = readJsonFile('civic_topics.json');
  if (civicTopicsData) {
    const civicTopics = (Array.isArray(civicTopicsData) ? civicTopicsData : civicTopicsData.data || [])
      .map(transformCivicTopic);
    
    const { data: insertedTopics } = await supabase
      .from('civic_topics')
      .insert(civicTopics)
      .select('id, base44_id');
    
    if (insertedTopics) {
      insertedTopics.forEach(topic => {
        if (topic.base44_id) {
          civicTopicIdMap.set(topic.base44_id, topic.id);
        }
      });
      console.log(`[OK] Imported ${insertedTopics.length} civic topics`);
    }
  }

  // 3. Import Cloze Sentences (content table, depends on lessons)
  console.log('\n--- Importing Cloze Sentences ---');
  const clozeSentencesData = readJsonFile('cloze_sentences.json');
  if (clozeSentencesData) {
    const clozeSentences = (Array.isArray(clozeSentencesData) ? clozeSentencesData : clozeSentencesData.data || [])
      .map(cloze => transformClozeSentence(cloze, lessonIdMap));
    
    const result = await batchInsert('cloze_sentences', clozeSentences);
    console.log(`[DONE] Cloze sentences: ${result.inserted} inserted, ${result.errors} errors`);
  }

  // 4. Handle Users - THIS IS THE TRICKY PART
  // Users need to be invited/created in Supabase Auth, then we can create profiles
  console.log('\n--- Processing Users ---');
  const usersData = readJsonFile('users.json');
  if (usersData) {
    const users = Array.isArray(usersData) ? usersData : usersData.data || [];
    console.log(`Found ${users.length} users to process`);
    console.log('\n[IMPORTANT] User Migration Steps:');
    console.log('1. Users need to sign up fresh or be invited via Supabase Auth');
    console.log('2. We\'ll create a mapping file for you to track migrations');
    console.log('3. Once users sign up, their profiles will be auto-created');
    
    // Save user mapping for reference
    const userMappingFile = path.join(DATA_DIR, 'user_migration_mapping.json');
    const userMapping = users.map(u => ({
      base44_id: u.id || u._id,
      email: u.email,
      sfi_level: u.sfi_level || u.sfiLevel,
      xp_total: u.xp_total || u.xpTotal || 0,
      streak_days: u.streak_days || u.streakDays || 0,
      // Supabase user ID will be filled after users sign up
      supabase_id: null,
      migrated: false,
    }));
    
    fs.writeFileSync(userMappingFile, JSON.stringify(userMapping, null, 2));
    console.log(`\nSaved user mapping to: ${userMappingFile}`);
    console.log('Update this file with Supabase user IDs after users sign up.');
    
    // For now, skip user data import (vocabulary, SRS cards, quiz results)
    // These will need to be imported after users are created in Supabase Auth
    console.log('\n[SKIPPING] User-specific data (vocabulary, SRS cards, quiz results)');
    console.log('Run import-user-data.js after users have signed up to migrate their data.');
  }

  console.log('\n' + '='.repeat(50));
  console.log('Content import complete!');
  console.log('='.repeat(50));
  console.log('\nNext steps:');
  console.log('1. Invite users to sign up with Supabase Auth');
  console.log('2. Update user_migration_mapping.json with their new Supabase IDs');
  console.log('3. Run: node scripts/import-user-data.js');
}

main().catch(console.error);
