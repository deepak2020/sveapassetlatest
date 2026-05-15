import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { topic, level, currentTopicTitle } = await req.json();

    if (!topic || !level) {
      return Response.json({ error: 'Missing topic or level' }, { status: 400 });
    }

    const prompt = `Generate exactly 50 Swedish grammar questions for the topic "${currentTopicTitle}" at SFI level ${level}.

Topic context: ${topic}

Create a varied mix of question types:
- 15 fill-in-the-blank questions
- 15 multiple-choice questions (4 options)
- 10 sentence correction questions
- 10 translation/comprehension questions

Return a JSON array with this structure for each question:
{
  "question": "the question text",
  "type": "fill-blank" | "choice" | "correction" | "translation",
  "answer": "correct answer",
  "options": ["option1", "option2", ...],  // for choice type, 4 options
  "explanation": "brief explanation of the answer"
}

Make questions progressively more difficult, with the first questions being easier and later ones more challenging.
Ensure all questions are appropriate for level ${level} students.
Return only valid JSON, no other text.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                type: { type: "string" },
                answer: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                explanation: { type: "string" }
              }
            }
          }
        }
      }
    });

    const questions = response.questions || [];

    return Response.json({
      success: true,
      topicTitle: currentTopicTitle,
      level,
      questionCount: questions.length,
      questions: questions.slice(0, 50) // Ensure exactly 50
    });
  } catch (error) {
    console.error('Error generating grammar questions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});