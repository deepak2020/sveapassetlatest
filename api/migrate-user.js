// Vercel Edge Function — auto-migrates a user's Base44 data into Supabase
// on their first login. Called from AuthContext after SIGNED_IN event.
// Idempotent: checks for existing data before importing.

export const config = { runtime: 'edge' };

const BASE44_APP_ID  = '6a05a8cd3d89f28998abebbd';
const BASE44_BASE    = `https://svensk-path-goal.base44.app/api/apps/${BASE44_APP_ID}`;
const BASE44_HEADERS = { 'api_key': '7043976fee8e434299b13b22a5ee9fa1', 'Content-Type': 'application/json' };

async function b44Fetch(entity) {
  const resp = await fetch(`${BASE44_BASE}/entities/${entity}?limit=5000`, { headers: BASE44_HEADERS });
  if (!resp.ok) throw new Error(`Base44 ${entity}: HTTP ${resp.status}`);
  const data = await resp.json();
  return Array.isArray(data) ? data : (data.data ?? data.results ?? []);
}

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL  = process.env.VITE_SUPABASE_URL;
  const ANON_KEY      = process.env.VITE_SUPABASE_ANON_KEY;
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_KEY) return json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, 500);

  // Verify the caller's Supabase JWT
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!jwt) return json({ error: 'Unauthorized' }, 401);

  const userResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: ANON_KEY },
  });
  if (!userResp.ok) return json({ error: 'Unauthorized' }, 401);
  const { email, id: userId } = await userResp.json();

  // Already imported? Check for any existing user-owned rows.
  const [qrResp, srsResp] = await Promise.all([
    supa(SUPABASE_URL, SERVICE_KEY, 'GET', `quiz_results?user_id=eq.${userId}&select=id&limit=1`),
    supa(SUPABASE_URL, SERVICE_KEY, 'GET', `user_srs_cards?user_id=eq.${userId}&select=id&limit=1`),
  ]);
  if (qrResp.length > 0 || srsResp.length > 0) {
    return json({ status: 'already_imported' });
  }

  // Find this user in Base44 by email
  const b44Users = await b44Fetch('User');
  const b44User  = b44Users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!b44User) return json({ status: 'not_in_base44' });

  // Fetch all user-owned data from Base44 in parallel
  const [quizResults, vocabulary, srsCards] = await Promise.all([
    b44Fetch('QuizResult'),
    b44Fetch('UserVocabulary'),
    b44Fetch('UserSRSCard'),
  ]);

  const myQR   = quizResults.filter(r => r.user_id === b44User.id);
  const myVoc  = vocabulary.filter(r => r.user_id === b44User.id);
  const mySRS  = srsCards.filter(r => r.user_id === b44User.id);

  // Build cloze mapping only if user has SRS cards
  let clozemap = {};
  if (mySRS.length > 0) {
    const [b44Cloze, supaClozeParsed] = await Promise.all([
      b44Fetch('ClozeSentence'),
      supa(SUPABASE_URL, SERVICE_KEY, 'GET', 'cloze_sentences?select=id,sentence_sv,answer&limit=10000'),
    ]);
    const lookup = {};
    for (const s of supaClozeParsed) lookup[`${s.sentence_sv}|||${s.answer}`] = s.id;
    for (const s of b44Cloze) {
      const key = `${s.sentence_sv}|||${s.answer}`;
      if (lookup[key]) clozemap[s.id] = lookup[key];
    }
  }

  // Update profile
  await supa(SUPABASE_URL, SERVICE_KEY, 'PATCH', `profiles?id=eq.${userId}`, {
    full_name:           b44User.full_name           ?? null,
    sfi_level:           b44User.sfi_level           ?? null,
    goal:                b44User.goal                ?? null,
    daily_goal_minutes:  b44User.daily_goal_minutes  ?? 10,
    xp_total:            b44User.xp_total            ?? 0,
    streak_days:         b44User.streak_days         ?? 0,
    last_active_date:    b44User.last_active_date     ?? null,
    onboarding_complete: b44User.onboarding_complete ?? false,
    role:                b44User.role                || 'user',
  });

  // Insert quiz results
  if (myQR.length > 0) {
    await supa(SUPABASE_URL, SERVICE_KEY, 'POST', 'quiz_results', myQR.map(r => ({
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
    })));
  }

  // Insert vocabulary
  if (myVoc.length > 0) {
    await supa(SUPABASE_URL, SERVICE_KEY, 'POST', 'user_vocabulary', myVoc.map(r => ({
      user_id:          userId,
      swedish:          r.swedish,
      english:          r.english,
      lesson_id:        r.lesson_id        ?? null,
      lesson_title:     r.lesson_title     ?? null,
      example_sentence: r.example_sentence ?? null,
      notes:            r.notes            ?? null,
      created_at:       r.created_date     ?? new Date().toISOString(),
    })));
  }

  // Insert SRS cards
  const validSRS = mySRS
    .filter(c => c.cloze_sentence_id && clozemap[c.cloze_sentence_id])
    .map(c => ({
      user_id:             userId,
      cloze_sentence_id:   clozemap[c.cloze_sentence_id],
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
  if (validSRS.length > 0) {
    await supa(SUPABASE_URL, SERVICE_KEY, 'POST', 'user_srs_cards', validSRS);
  }

  return json({
    status:      'imported',
    quiz_results: myQR.length,
    vocabulary:   myVoc.length,
    srs_cards:    validSRS.length,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function supa(url, serviceKey, method, path, body) {
  const resp = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey:         serviceKey,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Supabase ${path}: HTTP ${resp.status} — ${err}`);
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : [];
}
