// Vercel Serverless Function — Claude / Gemini AI 프록시
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider, apiKey, prompt } = req.body;
  const key = apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY);

  if (!key) {
    return res.status(400).json({ error: "API 키가 설정되지 않았습니다." });
  }
  if (!prompt) {
    return res.status(400).json({ error: "프롬프트가 없습니다." });
  }

  try {
    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await response.json();
      if (data.error) {
        return res.status(response.status).json({ error: data.error.message || "Gemini API 오류" });
      }
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      return res.status(200).json({ text });
    }

    // Claude (기본)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.error) {
      return res.status(response.status).json({ error: data.error.message || "Claude API 오류" });
    }
    const text = data.content?.map((c) => c.text || "").join("") || "";
    return res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: "AI 생성 중 오류가 발생했습니다." });
  }
}
