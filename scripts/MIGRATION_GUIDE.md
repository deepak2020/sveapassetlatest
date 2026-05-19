# Base44 to Supabase Data Migration

This directory contains scripts and data files for migrating from Base44 to Supabase.

## Step 1: Export Data from Base44

1. Log into your Base44 dashboard
2. Go to each entity and export the data as JSON:
   - **Lessons** → Save as `data/lessons.json`
   - **CivicTopic** → Save as `data/civic_topics.json`
   - **ClozeSentence** → Save as `data/cloze_sentences.json`
   - **User** → Save as `data/users.json`
   - **UserVocabulary** → Save as `data/user_vocabulary.json`
   - **UserSRSCard** → Save as `data/user_srs_cards.json`
   - **QuizResult** → Save as `data/quiz_results.json`

## Step 2: Import Content Data

Run the main import script to import lessons, civic topics, and cloze sentences:

```bash
node --env-file-if-exists=/vercel/share/.env.project scripts/import-data.js
```

This will:
- Import all lessons, civic topics, and cloze sentences
- Create a `user_migration_mapping.json` file listing all your Base44 users

## Step 3: Migrate Users

Users need to sign up fresh with Supabase Auth (they'll need to create new passwords).

**Option A: Send password reset emails**
1. After users sign up, their profiles are auto-created
2. Update `data/user_migration_mapping.json` with their new Supabase UUIDs

**Option B: Invite users via Supabase**
1. Use Supabase Auth to send invite emails to your users
2. When they accept and set passwords, profiles are created
3. Update the mapping file with their UUIDs

## Step 4: Import User Data

Once users have signed up and you've updated `user_migration_mapping.json`:

```bash
node --env-file-if-exists=/vercel/share/.env.project scripts/import-user-data.js
```

This will:
- Update user profiles with their Base44 data (XP, streaks, levels)
- Import their vocabulary lists
- Import their SRS cards with progress
- Import their quiz history

## File Format for user_migration_mapping.json

After Step 2, you'll have a file like this:

```json
[
  {
    "base44_id": "abc123",
    "email": "user@example.com",
    "sfi_level": "B",
    "xp_total": 1500,
    "streak_days": 7,
    "supabase_id": null,  // ← Fill this in after user signs up
    "migrated": false
  }
]
```

To get a user's Supabase UUID:
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user by email
3. Copy their UUID
4. Paste it into `supabase_id`

## Notes

- The import scripts use the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
- All Base44 IDs are preserved in `base44_id` columns for reference
- Foreign key relationships (lesson_id, etc.) are automatically mapped
- Run imports in order: content first, then user data
