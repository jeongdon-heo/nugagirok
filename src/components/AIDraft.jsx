import { useState } from "react";
import { CATEGORIES } from "../constants";
import { sectionTitle, labelStyle, inputStyle } from "../styles";

export default function AIDraft({ students, observations, aiDrafts, saveDraft }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editDraft, setEditDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState(() => localStorage.getItem("nuga_provider") || "claude");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("nuga_api_key_" + (localStorage.getItem("nuga_provider") || "claude")) || "");
  const [showKey, setShowKey] = useState(false);

  const switchProvider = (p) => {
    setProvider(p);
    localStorage.setItem("nuga_provider", p);
    setApiKey(localStorage.getItem("nuga_api_key_" + p) || "");
    setShowKey(false);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    if (key) localStorage.setItem("nuga_api_key_" + provider, key);
    else localStorage.removeItem("nuga_api_key_" + provider);
  };

  const generate = async () => {
    if (!selectedStudent) return;
    if (!apiKey) {
      setDraft("API 키를 먼저 입력해주세요. 위에서 API 키를 입력하고 저장 버튼을 눌러주세요.");
      setEditDraft("");
      return;
    }
    setLoading(true);
    const sObs = observations.filter((o) => o.targetId === selectedStudent.id);
    const teacherObs = sObs.filter((o) => o.authorType === "teacher");
    const studentObs = sObs.filter((o) => o.authorType === "student");

    const tObsText = teacherObs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((o) => `[${o.date}] ${o.content}`)
      .join("\n");
    const sObsText = studentObs
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((o) => `[${o.date}] (또래관찰: ${o.authorName}) ${o.content}`)
      .join("\n");

    const prompt = `당신은 대한민국 초등학교 담임교사입니다. 아래 누가기록을 바탕으로 학교생활기록부 '행동특성 및 종합의견'을 작성하세요.

## 작성 원칙

### 형식
- 종결어미는 반드시 '~함.', '~음.', '~임.', '~됨.' 등 학교생활기록부 공식 문체를 사용합니다.
- 학생의 이름은 절대 쓰지 않습니다.
- 전체 분량은 500~800자입니다.

### 구조 (이 순서를 따릅니다)
1. **핵심 강점과 긍정적 특성** — 구체적 사례를 반드시 포함하여 서술
2. **성장이 필요한 영역** — 부정적 기록도 회피하지 말고, 발전적·교육적 관점에서 솔직하게 서술. "~하는 경향이 있음", "~에 어려움을 겪기도 함" 등의 표현을 활용
3. **교사의 지도 노력** — "~에 대해 꾸준히 지도하고 있음", "~방법에 대해 함께 이야기하고 있음" 등 교사가 관심을 갖고 지도하고 있음을 표현
4. **기대와 전망** — 학생의 잠재력을 살려 앞으로 기대되는 성장 방향

### 내용 작성 기준
- **구체적 사례를 반드시 포함**: 날짜까지 쓸 필요는 없지만, "교실 정리 시 자기 자리뿐 아니라 주변까지 휴지를 줍는 등", "체력 측정에서 셔틀런 100개를 완주하는 등"처럼 기록에 등장하는 실제 행동을 구체적으로 언급합니다.
- **긍정적 기록과 부정적 기록 모두 반영**: 긍정적 기록만 나열하면 학생의 실제 모습이 드러나지 않습니다. 부정적 기록은 직접적 비난이 아니라 "~하는 모습이 관찰됨", "~하는 경향이 있어 지도가 필요함" 등 성장 가능성을 내포하는 표현으로 서술합니다.
- **반복되는 패턴에 주목**: 같은 유형의 행동이 여러 번 기록되었다면 일회성이 아닌 패턴으로 서술합니다. (예: 수업 중 불필요한 행동이 여러 차례 기록된 경우 → "수업 중 상황에 맞지 않는 행동이나 발언을 보이는 경향이 있음")
- **원인-결과 관계 반영**: 기록에서 행동의 맥락이나 원인이 보이면 반영합니다. (예: 특정 친구와 함께할 때 집중이 흐트러지는 패턴)
- **또래 관찰 기록**은 참고 자료로 활용하되, 교사 관찰 기록에 더 높은 비중을 둡니다.
- 기록이 부족한 영역은 억지로 서술하지 않습니다.

## 학생: ${selectedStudent.name} (${selectedStudent.num}번)

## 교사 누가기록 (날짜순)
${tObsText || "(기록 없음)"}

## 또래 관찰 기록
${sObsText || "(기록 없음)"}

위 기록을 바탕으로 행동특성 및 종합의견을 작성하세요. 최종 결과만 출력하세요.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, prompt }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "API 응답 오류");
      }
      const data = await response.json();
      const text = data.text || "생성에 실패했습니다.";
      setDraft(text);
      setEditDraft(text);
      saveDraft(selectedStudent.id, text);
    } catch (e) {
      setDraft(e.message || "AI 초안 생성에 실패했습니다. API 키를 확인해주세요.");
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
      <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
        학생을 선택하면 누가기록을 바탕으로 행동특성 및 종합의견 초안을 생성합니다.
      </p>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[{ id: "claude", label: "Claude", color: "#D97706" }, { id: "gemini", label: "Gemini", color: "#4285F4" }].map((p) => (
            <button key={p.id} onClick={() => switchProvider(p.id)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: provider === p.id ? `2px solid ${p.color}` : "2px solid #e5e7eb", background: provider === p.id ? p.color + "15" : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: provider === p.id ? p.color : "#999" }}>
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: apiKey ? 0 : 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>🔑 {provider === "claude" ? "Claude" : "Gemini"} API 키</span>
          {apiKey ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#10B981" }}>설정됨</span>
              <button onClick={() => setShowKey(!showKey)}
                style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: "#666" }}>
                {showKey ? "숨기기" : "변경"}
              </button>
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#999" }}>
              {provider === "claude" ? "console.anthropic.com" : "aistudio.google.com"}에서 발급
            </span>
          )}
        </div>
        {(!apiKey || showKey) && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "claude" ? "sk-ant-..." : "AIza..."}
              style={{ ...inputStyle, flex: 1, marginTop: 0, fontSize: 13 }} />
            <button onClick={() => { saveApiKey(apiKey); setShowKey(false); }}
              style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#1a1a2e", color: "#E8D5B7", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              저장
            </button>
          </div>
        )}
      </div>

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
