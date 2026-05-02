import OpenAI from "openai";

let client;

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function askOpenAI({ system, user, json = false }) {
  if (!hasOpenAI()) return null;

  client ||= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    temperature: 0.45,
    response_format: json ? { type: "json_object" } : undefined,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const content = response.choices[0]?.message?.content || "";
  return json ? JSON.parse(content) : content;
}
