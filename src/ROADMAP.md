# 🇸🇪 Swedish Learning Platform — Future Development Roadmap

_Last updated: 2026-05-18_

A backlog of ideas to improve the learning experience, grouped by impact area.
Items are not yet prioritized for sprints — pick from here when planning the next feature.

---

## 🎯 High-impact (quick wins)
1. **Daily streak + reminders** — push/email nudge at the user's chosen time (streaks already exist; add reminders).
2. **"Continue where you left off"** banner — resume the exact tab of the last lesson, not just the lesson.
3. **Audio everywhere** — auto-play Swedish on flashcards & cloze answers; slow-down button for listening.
4. **Mistake review queue** — every wrong answer feeds a "Today's mistakes" mini-session at the end of the day.
5. **XP shop / cosmetic rewards** — spend XP on themes, avatar frames. Cheap dopamine, big retention boost.

## 📚 Content depth
6. **Dialogues / conversations** — short A↔B scripts with role-play (user reads role A, app speaks role B).
7. **Story mode** — graded readers per SFI level (200–500 word stories) with tap-to-translate words → auto-save to vocab.
8. **Grammar drills with explanation cards** — verb conjugation tables, en/ett trainer, word-order shuffler.
9. **Real Swedish content** — short clips from SVT/SR news with transcript + comprehension Qs (per level).
10. **Picture vocabulary** — image-based flashcards for A1/A2 (people, food, home, work).

## 🗣️ Speaking & listening
11. **Pronunciation scoring** — use Web Speech API to record + score user pronunciation against target.
12. **Shadowing exercises** — sentence plays, user repeats, app compares.
13. **AI conversation partner** — chat with an AI tutor in Swedish at the user's level (ANTHROPIC_API_KEY already configured).
14. **Dictation mode** — listen and type full sentences (harder than current cloze).

## 🧠 Smarter SRS / personalization
15. **Adaptive difficulty** — auto-skip too-easy items, surface weak skills more often.
16. **Weakness radar** — "Your grammar is 30% behind your vocab — practice now" prompt on dashboard.
17. **Personalized daily plan** — "Today: 10 SRS cards + 1 lesson + 1 story" generated each morning.
18. **Goal-based paths** — pick "Pass SFI D in 3 months" → app builds a week-by-week schedule.

## 🏛️ Citizenship test
19. **Spaced civic facts** — turn key facts into SRS cards (not just quizzes).
20. **Full mock exam mode** — timed, official-format, score report with weak chapters.
21. **Flashcards for dates/laws/people** — the stuff people forget most.

## 👥 Social / motivation
22. **Friends & leaderboard** — weekly XP race with friends.
23. **Study groups** — shared streaks, group quizzes (great for the WhatsApp crowd).
24. **Share progress card** — "I just finished SFI B Vocabulary 🎉" image to post.
25. **Public profile / brag page** — vocab learned, lessons done, badges.

## 🛠️ UX polish
26. **Offline mode (PWA)** — download a lesson, practice on the metro.
27. **Keyboard shortcuts** — power users (space = flip, 1–4 = answer).
28. **Dark mode polish + font size control** — accessibility.
29. **Search across all lessons & vocab** — global ⌘K search.
30. **Export vocab to Anki / CSV** — pleases serious learners.

## 📈 Insights
31. **Time-on-skill chart** — show hours spent per skill.
32. **Predicted SFI level** — based on quiz scores, "You're at B+ heading toward C."
33. **Weekly email recap** — "This week you learned 47 words, beat your record by 12%."

---

## ⭐ Top 5 next picks (best effort/impact ratio)
1. **Mistake review queue** (#4) — uses existing wrong-answer data
2. **AI conversation partner** (#13) — Anthropic key already set
3. **Adaptive personalized daily plan** (#17) — turns the dashboard into a coach
4. **Dialogues / role-play** (#6) — natural extension of speaking module
5. **Story mode with tap-to-translate** (#7) — huge for reading skill