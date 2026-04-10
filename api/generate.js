// Vercel Serverless Function — AI 종합의견 생성 프록시
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 클라이언트 헤더 → 환경변수 순으로 API 키 확인
  const apiKey = req.headers["x-api-key"] || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: "API 키가 설정되지 않았습니다." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "AI 생성 중 오류가 발생했습니다." });
  }
}
