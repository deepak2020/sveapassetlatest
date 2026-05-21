// Vercel Cron — fires daily at 07:00 UTC (08-09 Swedish time)
// Sends personalised learning emails to all active users.
// Uses Claude to generate SFI-level + goal specific content once per level,
// then personalises each email with the user's name, streak, and due cards.

export const config = { runtime: 'edge' };

const SUPABASE_URL = 'https://zpuaksuhvgwvnvopjaov.supabase.co';
const SITE_URL     = 'https://sveapassetlatest.vercel.app';

export default async function handler(req) {
  // Vercel sets Authorization: Bearer <CRON_SECRET> on scheduled invocations
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('Authorization') !== `Bearer ${secret}`) {
    return resp({ error: 'Unauthorized' }, 401);
  }

  const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY;
  const BREVO_KEY       = process.env.BREVO_API_KEY;

  if (!SERVICE_KEY || !BREVO_KEY) {
    return resp({ error: 'Missing env vars' }, 500);
  }

  // ── 1. Fetch all profiles + emails ───────────────────────────────────────
  const [authUsersRaw, profilesRaw, dueCardsRaw] = await Promise.all([
    supaFetch(SERVICE_KEY, 'GET', `${SUPABASE_URL}/auth/v1/admin/users?per_page=500`),
    supaFetch(SERVICE_KEY, 'GET', `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,sfi_level,goal,streak_days,daily_goal_minutes,onboarding_complete`),
    supaFetch(SERVICE_KEY, 'GET', `${SUPABASE_URL}/rest/v1/user_srs_cards?select=user_id&due_date=lte.${today()}&status=neq.mastered`),
  ]);

  const authUsers  = authUsersRaw.users ?? [];
  const profiles   = Array.isArray(profilesRaw) ? profilesRaw : [];
  const dueCards   = Array.isArray(dueCardsRaw) ? dueCardsRaw : [];

  // Build lookup maps
  const emailById = Object.fromEntries(authUsers.map(u => [u.id, u.email]));
  const dueCount  = dueCards.reduce((acc, c) => {
    acc[c.user_id] = (acc[c.user_id] || 0) + 1;
    return acc;
  }, {});

  // Only email users who completed onboarding
  const users = profiles
    .filter(p => p.onboarding_complete && emailById[p.id])
    .map(p => ({ ...p, email: emailById[p.id], due: dueCount[p.id] || 0 }));

  if (users.length === 0) return resp({ sent: 0 });

  // ── 2. Generate daily topics once per SFI level via Claude ───────────────
  const levels  = [...new Set(users.map(u => u.sfi_level || 'A'))];
  const topics  = {};

  await Promise.all(levels.map(async level => {
    const goals = [...new Set(
      users.filter(u => (u.sfi_level || 'A') === level && u.goal).map(u => u.goal)
    )].slice(0, 5);

    topics[level] = ANTHROPIC_KEY
      ? await generateTopic(ANTHROPIC_KEY, level, goals)
      : fallbackTopic(level);
  }));

  // ── 3. Send one email per user ────────────────────────────────────────────
  let sent = 0, failed = 0;
  for (const user of users) {
    const topic = topics[user.sfi_level || 'A'];
    const ok = await sendDailyEmail(BREVO_KEY, user, topic);
    ok ? sent++ : failed++;
    // Brevo free tier: 300/day — small delay to stay polite
    await sleep(120);
  }

  return resp({ sent, failed, users: users.length });
}

// ── Claude topic generation ───────────────────────────────────────────────────

async function generateTopic(apiKey, level, goals) {
  const goalText = goals.length ? goals.join(', ') : 'general Swedish proficiency';
  const prompt   = `You are a Swedish SFI teacher. Generate today's learning focus for Course ${level} students.
Common goals among these students: ${goalText}.

Return ONLY valid JSON (no markdown):
{
  "topic": "Short topic title in English (e.g. Shopping and prices)",
  "topic_sv": "Same topic in Swedish",
  "description": "2 sentences: what to practise today and why it matters for their goals",
  "word_of_day": {
    "swedish": "ett ord",
    "english": "a word",
    "example_sv": "Example sentence in Swedish",
    "example_en": "English translation of example"
  },
  "tip": "One practical grammar or pronunciation tip for this level",
  "emoji": "One relevant emoji"
}`;

  try {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages:   [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    return JSON.parse(text.replace(/^```json\n?|\n?```$/g, ''));
  } catch {
    return fallbackTopic(level);
  }
}

function fallbackTopic(level) {
  const topics = {
    A: { topic: 'Everyday greetings', topic_sv: 'Vardagshälsningar', emoji: '👋',
         description: 'Practise saying hello, goodbye and introducing yourself. These basics build confidence fast.',
         word_of_day: { swedish: 'hej då', english: 'goodbye', example_sv: 'Hej då, vi ses imorgon!', example_en: 'Goodbye, see you tomorrow!' },
         tip: 'Swedish uses "du" (you) informally with almost everyone — even strangers.' },
    B: { topic: 'Shopping and prices', topic_sv: 'Shopping och priser', emoji: '🛍️',
         description: 'Learn to ask for prices, sizes and help in a Swedish shop. Very useful in daily life.',
         word_of_day: { swedish: 'hur mycket kostar', english: 'how much does it cost', example_sv: 'Hur mycket kostar den här jackan?', example_en: 'How much does this jacket cost?' },
         tip: 'Prices in Swedish: use "kronor" (kr) — "det kostar tjugo kronor" = it costs 20 kr.' },
    C: { topic: 'Work and employment', topic_sv: 'Arbete och anställning', emoji: '💼',
         description: 'Practise job interview phrases and workplace vocabulary. Essential for your career in Sweden.',
         word_of_day: { swedish: 'arbetsgivare', english: 'employer', example_sv: 'Min arbetsgivare heter Anna.', example_en: 'My employer is called Anna.' },
         tip: 'Swedes value punctuality — "i tid" (on time) is very important at work.' },
    D: { topic: 'Swedish society and democracy', topic_sv: 'Det svenska samhället', emoji: '🏛️',
         description: 'Deepen your understanding of how Sweden is governed and civic rights. Useful for the citizenship process.',
         word_of_day: { swedish: 'rösträtt', english: 'right to vote', example_sv: 'Alla medborgare har rösträtt.', example_en: 'All citizens have the right to vote.' },
         tip: 'Sweden has 349 seats in the Riksdag — a useful fact for civic tests.' },
  };
  return topics[level] || topics['A'];
}

// ── Email sending ─────────────────────────────────────────────────────────────

async function sendDailyEmail(apiKey, user, topic) {
  const firstName = user.full_name?.split(' ')[0] || 'there';
  const streakMsg = user.streak_days > 1
    ? `🔥 ${user.streak_days}-day streak — keep it going!`
    : user.streak_days === 1 ? '🌱 Day 1 — great start!' : '✨ Start your streak today!';

  const dueMsg = user.due > 0
    ? `<tr><td style="padding:12px 16px;background:#fef3c7;border-radius:8px;margin-bottom:16px">
        <strong>🗂 ${user.due} review card${user.due > 1 ? 's' : ''} due today</strong> —
        <a href="${SITE_URL}/srs-review" style="color:#b45309">Review now →</a>
       </td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px">
    <table width="100%"><tr>
      <td><h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">🇸🇪 Sveapasset</h1>
          <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px">Din dagliga svenska</p></td>
      <td align="right"><span style="background:rgba(255,255,255,.15);color:#fff;font-size:13px;font-weight:600;padding:6px 14px;border-radius:20px">${streakMsg}</span></td>
    </tr></table>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:32px 40px 0">
    <p style="margin:0;font-size:18px;color:#1e293b;font-weight:600">God morgon, ${firstName}! ${topic.emoji}</p>
    <p style="margin:8px 0 0;font-size:14px;color:#64748b">SFI Kurs ${user.sfi_level || 'A'} · Mål: ${user.daily_goal_minutes || 10} min today</p>
  </td></tr>

  <!-- Today's topic -->
  <tr><td style="padding:24px 40px 0">
    <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:20px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.5px">Today's focus</p>
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1e3a5f">${topic.topic} <span style="font-size:14px;color:#64748b;font-weight:400">/ ${topic.topic_sv}</span></p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6">${topic.description}</p>
    </div>
  </td></tr>

  <!-- Word of the day -->
  <tr><td style="padding:20px 40px 0">
    <div style="background:#f0fdf4;border-radius:8px;padding:20px">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.5px">📖 Word of the day</p>
      <table width="100%"><tr>
        <td><span style="font-size:22px;font-weight:700;color:#14532d">${topic.word_of_day.swedish}</span>
            <span style="font-size:14px;color:#64748b;margin-left:8px">= ${topic.word_of_day.english}</span></td>
      </tr></table>
      <p style="margin:12px 0 4px;font-size:14px;color:#1e293b;font-style:italic">"${topic.word_of_day.example_sv}"</p>
      <p style="margin:0;font-size:13px;color:#64748b">${topic.word_of_day.example_en}</p>
    </div>
  </td></tr>

  <!-- Tip -->
  <tr><td style="padding:16px 40px 0">
    <div style="background:#fdf4ff;border-radius:8px;padding:16px 20px">
      <p style="margin:0;font-size:14px;color:#581c87"><strong>💡 Tips:</strong> ${topic.tip}</p>
    </div>
  </td></tr>

  <!-- Due cards -->
  ${dueMsg ? `<tr><td style="padding:16px 40px 0"><table width="100%">${dueMsg}</table></td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:28px 40px;text-align:center">
    <a href="${SITE_URL}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 40px;border-radius:8px">
      Börja lära dig idag →
    </a>
    <p style="margin:12px 0 0;font-size:13px;color:#94a3b8">Dagligt mål: ${user.daily_goal_minutes || 10} minuter</p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center">
    <p style="margin:0;font-size:12px;color:#94a3b8">
      © ${new Date().getFullYear()} Sveapasset &nbsp;·&nbsp;
      <a href="${SITE_URL}" style="color:#64748b;text-decoration:none">sveapasset.se</a> &nbsp;·&nbsp;
      <a href="${SITE_URL}/profile" style="color:#64748b;text-decoration:none">Avprenumerera</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: 'Sveapasset', email: 'hello@sveapasset.se' },
        to:          [{ email: user.email, name: user.full_name || '' }],
        subject:     `${topic.emoji} Dagens svenska: ${topic.topic_sv} | Sveapasset`,
        htmlContent: html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function resp(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function supaFetch(serviceKey, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization:  `Bearer ${serviceKey}`,
      apikey:         serviceKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}
