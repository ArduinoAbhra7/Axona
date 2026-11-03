import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should use a backend to proxy requests
});

export const generateRevisionNotes = async (topic: string) => {
  const prompt = `Generate a student-friendly revision summary for the topic: "${topic}". 
  Provide the output in JSON format with three keys: 
  "summary" (array of 3 short points), 
  "formulas" (array of key formulas or concepts), 
  "tips" (array of 3 study tips).`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};

export const solveDoubt = async (question: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful, student-friendly tutor. Give short, clear explanations." },
      { role: "user", content: question }
    ],
  });

  return response.choices[0].message.content;
};
