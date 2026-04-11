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
  const [keySaved, setKeySaved] = useState(() => !!localStorage.getItem("nuga_api_key_" + (localStorage.getItem("nuga_provider") || "claude")));

  const switchProvider = (p) => {
    setProvider(p);
    localStorage.setItem("nuga_provider", p);
    const saved = localStorage.getItem("nuga_api_key_" + p) || "";
    setApiKey(saved);
    setKeySaved(!!saved);
    setShowKey(false);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem("nuga_api_key_" + provider, key);
      setKeySaved(true);
    } else {
      localStorage.removeItem("nuga_api_key_" + provider);
      setKeySaved(false);
    }
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

    const prompt = `당신은 학생들을 세심하게 관찰하고 전인적인 성장을 돕는 전문적이고 따뜻한 초등학교 담임 교사입니다.

아래 제공된 학생의 '누가기록 데이터'를 바탕으로, 학교생활기록부의 '행동특성 및 종합의견' 항목에 들어갈 완성된 글을 작성해 주세요.

## 필수 작성 규칙 및 제약 사항

### 글자 수 및 문체
- 글자 수는 띄어쓰기를 포함하여 최대 500자(1,500바이트) 이내로 압축적이고 밀도 있게 작성해 주세요.
- 모든 문장의 끝은 명사형 종결어미(~함, ~임)로 마무리해 주세요.
- 학생의 이름은 절대 쓰지 마세요.

### 구체성 및 역량 중심
- 칭찬 일색의 추상적이고 상투적인 표현(예: "착하고 성실하며 타의 모범이 되는")이나 단순한 에피소드의 나열은 지양해 주세요.
- 구체적인 사례를 바탕으로 학생의 인성(배려, 나눔, 협동 등), 리더십, 자기 주도성, 학습 태도 등의 핵심 역량이 어떻게 발현되었는지 유기적으로 연결하여 서술해 주세요.

### 긍정성과 성장 지향성
- 학생의 단점이나 부족한 점을 기술할 때는 부정적인 표현으로만 끝내지 말고, 반드시 이를 극복하기 위해 노력한 점이나 '긍정적인 변화 가능성'을 함께 기재해 주세요.

### 기재 금지어 절대 배제
- 공인어학시험, 교외 대회 수상 실적, 인증 시험 참여 사실은 절대 사용하지 마세요.
- 부모(친인척 포함)의 직업명, 직장명, 사회·경제적 지위를 암시하는 내용은 절대 사용하지 마세요.
- 특정 플랫폼 및 상표명(MBTI, 유튜브, 넷플릭스, 카카오톡, 인스타그램, 아이패드, 갤럭시 탭 등)은 사용하지 마세요. 필요시 '성격 유형 검사', '동영상 공유 플랫폼', '소셜 네트워크 서비스', '태블릿 PC' 등으로 순화하여 기재하세요.

### 또래 관찰 기록 활용
- 또래 관찰 기록은 참고 자료로 활용하되, 교사 관찰 기록에 더 높은 비중을 두세요.

## 학생: ${selectedStudent.name} (${selectedStudent.num}번)

## 교사 누가기록 (날짜순)
${tObsText || "(기록 없음)"}

## 또래 관찰 기록
${sObsText || "(기록 없음)"}

위의 규칙과 제공된 누가기록 데이터를 바탕으로, 상급 학교나 후속 교육 관계자가 이 학생의 성장과 잠재력을 객관적으로 파악할 수 있도록 추천서 형식의 완성된 종합의견을 1개 문단으로 출력해 주세요.`;

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
          {keySaved ? (
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
        {(!keySaved || showKey) && (
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
