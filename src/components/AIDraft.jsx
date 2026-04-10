import { useState } from "react";
import { CATEGORIES } from "../constants";
import { sectionTitle, labelStyle, inputStyle } from "../styles";

export default function AIDraft({ students, observations, aiDrafts, saveDraft }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editDraft, setEditDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    const sObs = observations.filter((o) => o.targetId === selectedStudent.id);
    const teacherObs = sObs.filter((o) => o.authorType === "teacher");
    const studentObs = sObs.filter((o) => o.authorType === "student");

    const obsText = CATEGORIES.map((c) => {
      const tObs = teacherObs.filter((o) => o.category === c.id).map((o) => `[${o.date}] ${o.content}`).join("\n");
      const sObs2 = studentObs.filter((o) => o.category === c.id).map((o) => `[${o.date}] (또래관찰: ${o.authorName}) ${o.content}`).join("\n");
      return `## ${c.label}\n### 교사 관찰\n${tObs || "(기록 없음)"}\n### 또래 관찰\n${sObs2 || "(기록 없음)"}`;
    }).join("\n\n");

    const prompt = `당신은 대한민국 초등학교 담임교사입니다. 아래 누가기록을 바탕으로 학교생활기록부 '행동특성 및 종합의견'을 작성하세요.

## 작성 지침
1. 학생의 이름은 쓰지 않습니다.
2. 문장은 '~함.', '~음.' 등의 종결어미를 사용합니다.
3. 모든 문장은 긍정적·발전적 관점으로 서술합니다.
4. 구체적인 사례와 행동을 포함하여 서술합니다.
5. 교사 관찰 기록에 높은 가중치를, 또래 관찰은 참고 자료로 활용합니다.
6. 영역(자기관리, 공동체역량, 학습태도, 교우관계, 자치·동아리, 특기사항)별로 균형 있게 서술합니다.
7. 기록이 부족한 영역은 억지로 서술하지 않습니다.
8. 전체 분량은 500~800자로 작성합니다.

## 영역별 작성 방법
각 영역별로 먼저 초안을 작성한 뒤, 자연스럽게 하나의 종합의견으로 통합하세요.

## 학생: ${selectedStudent.name} (${selectedStudent.num}번)

## 누가기록
${obsText}

위 기록을 바탕으로 행동특성 및 종합의견을 작성하세요. 영역별 분리 작성 후 통합하는 방식으로 진행하세요. 최종 결과만 출력하세요.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!response.ok) throw new Error("API 응답 오류");
      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "생성에 실패했습니다.";
      setDraft(text);
      setEditDraft(text);
      saveDraft(selectedStudent.id, text);
    } catch {
      setDraft("AI 초안 생성에 실패했습니다. Vercel 배포 후 ANTHROPIC_API_KEY 환경변수를 확인해주세요.");
      setEditDraft("");
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportAllDrafts = () => {
    const lines = students.map((s) => {
      const d = aiDrafts[s.id];
      if (!d) return null;
      return `[${s.num}번 ${s.name}]\n${d}\n`;
    }).filter(Boolean);
    if (lines.length === 0) return;
    const text = `누가기록장 — AI 종합의견 초안 모음\n생성일: ${new Date().toLocaleDateString("ko-KR")}\n${"=".repeat(40)}\n\n${lines.join("\n" + "-".repeat(40) + "\n\n")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `종합의견_초안_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const draftCount = students.filter((s) => !!aiDrafts[s.id]).length;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>🤖 AI 종합의견 초안</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        학생을 선택하면 누가기록을 바탕으로 행동특성 및 종합의견 초안을 생성합니다.
      </p>

      {draftCount > 0 && (
        <button onClick={exportAllDrafts}
          style={{ marginBottom: 16, padding: "10px 20px", borderRadius: 10, border: "1px solid #6366F1", background: "#EEF2FF", color: "#4338CA", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          📥 전체 초안 내보내기 ({draftCount}명)
        </button>
      )}

      <label style={labelStyle}>학생 선택</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {students.map((s) => {
          const count = observations.filter((o) => o.targetId === s.id).length;
          const hasDraft = !!aiDrafts[s.id];
          return (
            <button key={s.id} onClick={() => { setSelectedStudent(s); setDraft(aiDrafts[s.id] || ""); setEditDraft(aiDrafts[s.id] || ""); setCopied(false); }}
              style={{ padding: "8px 2px", borderRadius: 10, border: selectedStudent?.id === s.id ? "2px solid #1a1a2e" : "2px solid #e5e7eb", background: selectedStudent?.id === s.id ? "#1a1a2e" : "#fff", color: selectedStudent?.id === s.id ? "#E8D5B7" : "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
              {hasDraft && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 8, color: "#10B981" }}>✅</span>}
              <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br />{s.name}
              <span style={{ display: "block", fontSize: 9, color: selectedStudent?.id === s.id ? "#8899AA" : "#999", marginTop: 2 }}>{count}건</span>
            </button>
          );
        })}
      </div>

      {selectedStudent && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={generate} disabled={loading}
              style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: loading ? "#ccc" : "#1a1a2e", color: "#E8D5B7", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {loading ? "⏳ 생성 중..." : draft ? "🔄 다시 생성" : "✨ AI 초안 생성"}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 36, animation: "spin 1s linear infinite" }}>⏳</div>
              <p style={{ color: "#666", fontSize: 13, marginTop: 12 }}>영역별로 분석하여 초안을 작성하고 있습니다...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {draft && !loading && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📝 {selectedStudent.name} 종합의견 초안</h3>
                <span style={{ fontSize: 11, color: "#999" }}>{editDraft.length}자</span>
              </div>
              <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)}
                style={{ ...inputStyle, height: 250, resize: "vertical", fontSize: 14, lineHeight: 1.8 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button onClick={() => saveDraft(selectedStudent.id, editDraft)}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#10B981", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  💾 저장
                </button>
                <button onClick={() => copyToClipboard(editDraft)}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", color: "#333", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {copied ? "✅ 복사됨!" : "📋 클립보드에 복사"}
                </button>
              </div>
            </div>
          )}

          {!draft && !loading && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>📊 {selectedStudent.name} 기록 현황</h3>
              {[...CATEGORIES, { id: "general", label: "미분류", icon: "📝", color: "#9CA3AF" }].map((c) => {
                const count = observations.filter((o) => o.targetId === selectedStudent.id && o.category === c.id).length;
                if (c.id === "general" && count === 0) return null;
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, width: 90 }}>{c.icon} {c.label}</span>
                    <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 16, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(count * 20, 100)}%`, height: "100%", background: c.color, borderRadius: 6 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: count < 2 ? "#DC2626" : "#333" }}>{count}건</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
