// XP thresholds and level definitions
export const LEVELS = [
  { name: "Nybörjare", min: 0, max: 499, color: "text-slate-500" },
  { name: "Elev", min: 500, max: 1499, color: "text-blue-500" },
  { name: "Student", min: 1500, max: 2999, color: "text-violet-500" },
  { name: "Avancerad", min: 3000, max: 5999, color: "text-amber-500" },
  { name: "Medborgare", min: 6000, max: Infinity, color: "text-emerald-500" },
];

export const XP_REWARDS = {
  learn_complete: 5,
  practice_pass: 15,
  produce_complete: 30,
  cloze_correct: 15,
  cloze_wrong: 5,
  flashcard_good: 10,
  flashcard_hard: 5,
  quiz_correct: 20,
  daily_goal_met: 25,
  streak_7days: 50,
};

export function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

export function getLevelProgress(xp) {
  const level = getLevel(xp);
  if (level.max === Infinity) return { level, progress: 100, xpInLevel: xp - level.min, xpNeeded: 0 };
  const xpInLevel = xp - level.min;
  const xpNeeded = level.max - level.min + 1;
  return { level, progress: Math.round((xpInLevel / xpNeeded) * 100), xpInLevel, xpNeeded };
}

export function getNextLevel(xp) {
  const idx = LEVELS.findIndex(l => xp >= l.min && xp <= l.max);
  return LEVELS[idx + 1] || null;
}

// Call this after any activity to award XP and update streak
export async function awardXP(base44, xpAmount) {
  const user = await base44.auth.me();
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  const lastActive = user.last_active_date;

  let newStreak = user.streak_days || 0;
  let bonusXP = 0;

  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1; // reset streak
    }

    if (newStreak > 0 && newStreak % 7 === 0) {
      bonusXP += XP_REWARDS.streak_7days;
    }
  }

  const newXP = (user.xp_total || 0) + xpAmount + bonusXP;

  await base44.auth.updateMe({
    xp_total: newXP,
    streak_days: newStreak,
    last_active_date: today,
  });

  return { newXP, newStreak, bonusXP };
}