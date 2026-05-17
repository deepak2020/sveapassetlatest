import { useEffect, useState } from "react";

const KEY_LAST = "svenska:last_lesson";
const KEY_PROGRESS_PREFIX = "svenska:lesson_progress:";

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

// Save and restore the list of completed activity keys per lesson
export function useLessonCompletion(lessonId) {
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    if (!lessonId) return;
    try {
      const raw = localStorage.getItem(KEY_PROGRESS_PREFIX + lessonId);
      if (raw) setCompleted(JSON.parse(raw));
    } catch (_) {}
  }, [lessonId]);

  const markComplete = (key) => {
    setCompleted((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key];
      try {
        localStorage.setItem(KEY_PROGRESS_PREFIX + lessonId, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  return { completed, markComplete };
}