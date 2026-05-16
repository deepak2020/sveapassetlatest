import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Full lesson content for "Hälsningar och presentation" (Course A, vocabulary skill).
const LESSON_CONTENT = {
  title: "Greetings and Introduction",
  title_sv: "Hälsningar och presentation",
  content: "## Introduction\nWelcome to your first Swedish lesson! Today, we will learn how to greet people, introduce ourselves, and ask someone for their name. In Sweden, everyday communication is relaxed, and these phrases will help you feel confident when meeting neighbors, colleagues, or new friends.\n\n## Key Concepts\n* **Presenting Yourself:** To say your name, use **Jag heter...** (I am called...). To ask for someone's name, say **Vad heter du?** (What are you called?).\n* **Asking How Someone Is:** A common, friendly way to ask how someone is doing is **Hur mår du?** or the more casual **Hur är läget?**.\n\n## Cultural Notes: The \"Du\" Reform\nIn Sweden, we use the informal **du** (you) with almost everyone, including bosses, teachers, and doctors. A historic linguistic shift in the 1960s (known as *du-reformen*) removed formal titles from everyday speech. You only need to use formal address if you are speaking to members of the Royal Family!\n\n## Example Dialogues\n\n### Dialogue 1: At the SFI school\n* **Ali:** Hej! Jag heter Ali. Vad heter du?\n* **Anna:** Hej Ali! Jag heter Anna.\n* **Ali:** Trevligt att träffas!\n* **Anna:** Trevligt att träffas!\n\n### Dialogue 2: Meeting a neighbor in the hallway\n* **Linnea:** God morgon! Hur mår du?\n* **Ahmed:** God morgon! Jag mår bra, tack. Hur mår du?\n* **Linnea:** Jag mår också bra, tack!",
  word_pairs: [
    { swedish: "hej", english: "hello / hi", example_sv: "Hej! Vad heter du?", example_en: "Hi! What is your name?" },
    { swedish: "jag", english: "I", example_sv: "Jag heter Ahmed.", example_en: "I am named Ahmed." },
    { swedish: "heter", english: "am called / is named", example_sv: "Vad heter du?", example_en: "What is your name?" },
    { swedish: "du", english: "you (singular)", example_sv: "Hur mår du?", example_en: "How are you?" },
    { swedish: "vad", english: "what", example_sv: "Vad heter du?", example_en: "What is your name?" },
    { swedish: "hur", english: "how", example_sv: "Hur mår du?", example_en: "How are you?" },
    { swedish: "mår", english: "feel (health-wise)", example_sv: "Jag mår bra.", example_en: "I feel good." },
    { swedish: "bra", english: "good / well", example_sv: "Jag mår bra, tack.", example_en: "I am well, thank you." },
    { swedish: "tack", english: "thank you / thanks", example_sv: "Bra, tack!", example_en: "Good, thanks!" },
    { swedish: "god morgon", english: "good morning", example_sv: "God morgon, Sofia!", example_en: "Good morning, Sofia!" },
    { swedish: "trevligt att träffas", english: "nice to meet you", example_sv: "Hej, trevligt att träffas!", example_en: "Hi, nice to meet you!" },
    { swedish: "och", english: "and", example_sv: "Jag mår bra, och du?", example_en: "I am well, and you?" },
    { swedish: "också", english: "also / too", example_sv: "Jag mår också bra.", example_en: "I also feel good." }
  ],
  fill_in_blanks: [
    { sentence_sv: "___ heter Ali.", sentence_en: "___ am named Ali.", answer: "Jag", options: ["Jag", "Du", "Han", "Hon"] },
    { sentence_sv: "Vad heter ___?", sentence_en: "What is ___ name?", answer: "du", options: ["jag", "du", "han", "hon"] },
    { sentence_sv: "Hur ___ du?", sentence_en: "How ___ you?", answer: "mår", options: ["heter", "mår", "är", "bra"] },
    { sentence_sv: "Jag mår ___, tack.", sentence_en: "I feel ___, thanks.", answer: "bra", options: ["vad", "och", "bra", "du"] },
    { sentence_sv: "___ morgon!", sentence_en: "Good morning!", answer: "God", options: ["God", "Hej", "Bra", "Tack"] },
    { sentence_sv: "Trevligt att ___.", sentence_en: "Nice to ___ you.", answer: "träffas", options: ["må", "träffas", "heta", "hej"] },
    { sentence_sv: "Jag mår bra, och ___?", sentence_en: "I feel good, and ___?", answer: "du", options: ["jag", "du", "han", "hon"] },
    { sentence_sv: "Jag mår ___ bra.", sentence_en: "I ___ feel good.", answer: "också", options: ["också", "vad", "heter", "hej"] }
  ],
  quiz_questions: [
    { question_sv: "Vad betyder 'hej'?", question_en: "What does 'hej' mean?", options: ["goodbye", "hello", "thanks", "please"], correct_index: 1 },
    { question_sv: "Hur säger man 'I am called' på svenska?", question_en: "How do you say 'I am called' in Swedish?", options: ["Du heter", "Jag mår", "Jag heter", "Vad heter"], correct_index: 2 },
    { question_sv: "Vad betyder 'Hur mår du?'?", question_en: "What does 'Hur mår du?' mean?", options: ["What is your name?", "Where do you live?", "How are you?", "Good morning"], correct_index: 2 },
    { question_sv: "Vilket ord betyder 'thank you'?", question_en: "Which word means 'thank you'?", options: ["bra", "tack", "och", "hej"], correct_index: 1 },
    { question_sv: "Vad svarar du på 'Vad heter du?'?", question_en: "What do you answer to 'Vad heter du?'?", options: ["Jag mår bra.", "God morgon.", "Jag heter Sara.", "Tack så mycket."], correct_index: 2 },
    { question_sv: "Vad betyder 'också'?", question_en: "What does 'också' mean?", options: ["always", "and", "but", "also"], correct_index: 3 },
    { question_sv: "Vad betyder 'God morgon'?", question_en: "What does 'God morgon' mean?", options: ["Good night", "Good morning", "Good afternoon", "Goodbye"], correct_index: 1 },
    { question_sv: "Hur säger man 'Nice to meet you'?", question_en: "How do you say 'Nice to meet you'?", options: ["Hur mår du?", "Trevligt att träffas", "God morgon", "Hej då"], correct_index: 1 }
  ],
  speaking_phrases: [
    { phrase_sv: "Hej, jag heter...", phrase_en: "Hi, my name is...", pronunciation_tip: "'Hej' sounds like the English word 'hay'. In 'heter', put the stress on the first syllable: HEE-ter." },
    { phrase_sv: "Vad heter du?", phrase_en: "What is your name?", pronunciation_tip: "'Vad' is pronounced like 'vah' (the d is usually silent in conversational speech)." },
    { phrase_sv: "Hur mår du?", phrase_en: "How are you?", pronunciation_tip: "'Hur' has a long 'oo' sound like in 'room'. 'Mår' has an 'o' sound like in 'more'." },
    { phrase_sv: "Jag mår bra, tack.", phrase_en: "I am well, thank you.", pronunciation_tip: "Make sure the 'a' in 'bra' is a long open vowel, and short sharp 'tack'." },
    { phrase_sv: "Trevligt att träffas!", phrase_en: "Nice to meet you!", pronunciation_tip: "Pronounce 'träffas' with a short, clear 'ä' sound like in the English word 'get'." },
    { phrase_sv: "God morgon!", phrase_en: "Good morning!", pronunciation_tip: "The 'd' in 'God' is silent here, so it sounds like 'Gå morgon'." },
    { phrase_sv: "Och du?", phrase_en: "And you?", pronunciation_tip: "'Och' is pronounced simply like 'å' in quick speech." }
  ],
  listening_phrases: [
    { phrase_sv: "Hej! Vad heter du?", phrase_en: "Hi! What is your name?", exercise_type: "select", options: ["Hej! Vad heter du?", "Hej! Hur mår du?", "God morgon, och du?", "Jag mår bra, tack."], correct_index: 0 },
    { phrase_sv: "Jag mår bra, tack.", phrase_en: "I feel good, thanks.", exercise_type: "select", options: ["Trevligt att träffas.", "Jag heter Ali.", "Vad heter du?", "Jag mår bra, tack."], correct_index: 3 },
    { phrase_sv: "Trevligt att träffas!", phrase_en: "Nice to meet you!", exercise_type: "select", options: ["God morgon!", "Trevligt att träffas!", "Hur mår du?", "Och du?"], correct_index: 1 },
    { phrase_sv: "God morgon!", phrase_en: "Good morning!", exercise_type: "select", options: ["Jag mår bra.", "Tack så mycket.", "God morgon!", "Vad heter du?"], correct_index: 2 },
    { phrase_sv: "Jag mår också bra.", phrase_en: "I also feel good.", exercise_type: "select", options: ["Jag mår också bra.", "Vad heter du?", "Jag heter Anna.", "Hur mår du?"], correct_index: 0 }
  ],
  writing_prompts: [
    { prompt: "Write a short dialogue where you greet someone in the morning and ask how they are.", hint: "Use phrases like: God morgon, Hur mår du?, Jag mår bra, tack.", example_answer: "- God morgon! Hur mår du?\n- God morgon! Jag mår bra, tack. Och du?\n- Jag mår också bra!" },
    { prompt: "Introduce yourself using three short sentences.", hint: "Include a greeting, your name, and a closing nice phrase.", example_answer: "Hej! Jag heter Carlos. Trevligt att träffas!" },
    { prompt: "Write down the question you ask when you want to know a new classmate's name.", hint: "It starts with 'Vad...'", example_answer: "Hej, vad heter du?" }
  ],
  match_pairs: [
    { left: "Hej", right: "Hello" },
    { left: "Jag", right: "I" },
    { left: "Du", right: "You" },
    { left: "Tack", right: "Thank you" },
    { left: "Bra", right: "Good" },
    { left: "Vad", right: "What" },
    { left: "Hur", right: "How" }
  ]
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Find the Course A, "Hälsa & Presentera Sig" vocabulary lesson skeleton.
    const matches = await base44.asServiceRole.entities.Lesson.filter({
      sfi_course: "A",
      topic: "Hälsa & Presentera Sig",
      skill: "vocabulary",
    });

    if (!matches || matches.length === 0) {
      return Response.json({
        error: "Lesson skeleton not found. Run seedLessonsAll first.",
      }, { status: 404 });
    }

    const target = matches[0];
    await base44.asServiceRole.entities.Lesson.update(target.id, LESSON_CONTENT);

    return Response.json({ success: true, lesson_id: target.id, title: LESSON_CONTENT.title_sv });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});