import { useEffect, useState } from "react";

const KEY_LAST = "svenska:last_lesson";
const KEY_PROGRESS_PREFIX = "svenska:lesson_progress:";
const KEY_SCORES_PREFIX = "svenska:lesson_scores:";

// Track the most recently visited lesson (used by the Continue Learning card)
export function setLastLesson(lesson) {
  if (!lesson?.id) return;
  try {
    localStorage.setItem(
      KEY_LAST,
      JSON.stringify({
        id: lesson.id,
        title: lesson.title,
        title_sv: lesson.title_sv,
        sfi_course: lesson.sfi_course,
        topic: lesson.topic,
        skill: lesson.skill || lesson.category,
        at: Date.now(),
      })
    );
  } catch (_) {}
}

export function useLastLesson() {
  const [last, setLast] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_LAST);
      if (raw) setLast(JSON.parse(raw));
    } catch (_) {}
  }, []);

  return last;
}

// Save and restore the list of completed activity keys + per-skill last scores
export function useLessonCompletion(lessonId) {
  const [completed, setCompleted] = useState([]);
  const [scores, setScores] = useState({}); // { [activityKey]: { score, total, percentage, at } }

  useEffect(() => {
    if (!lessonId) return;
    try {
      const raw = localStorage.getItem(KEY_PROGRESS_PREFIX + lessonId);
      if (raw) setCompleted(JSON.parse(raw));
      const rawScores = localStorage.getItem(KEY_SCORES_PREFIX + lessonId);
      if (rawScores) setScores(JSON.parse(rawScores));
    } catch (_) {}
  }, [lessonId]);

  const markComplete = (key, scoreInfo) => {
    setCompleted((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      try {
        localStorage.setItem(KEY_PROGRESS_PREFIX + lessonId, JSON.stringify(next));
      } catch (_) {}
      return next;
    });

    // Always overwrite the latest score for this skill (even if already completed)
    if (scoreInfo && typeof scoreInfo.score === "number" && typeof scoreInfo.total === "number") {
      setScores((prev) => {
        const percentage = scoreInfo.total > 0
          ? Math.round((scoreInfo.score / scoreInfo.total) * 100)
          : 0;
        const next = {
          ...prev,
          [key]: {
            score: scoreInfo.score,
            total: scoreInfo.total,
            percentage,
            at: Date.now(),
          },
        };
        try {
          localStorage.setItem(KEY_SCORES_PREFIX + lessonId, JSON.stringify(next));
        } catch (_) {}
        return next;
      });
    }
  };

  return { completed, scores, markComplete };
}