import { useState } from "react";
import { CATEGORIES, NEGATIVE_KEYWORDS, SCAFFOLDS, today } from "../constants";
import { sectionTitle, labelStyle, inputStyle } from "../styles";

export default function StudentWrite({ students, currentStudent, addObservation, missions }) {
  const [target, setTarget] = useState(null);
  const [cat, setCat] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState("");
  const [showScaffold, setShowScaffold] = useState(false);

  const activeMissions = missions.filter((m) => m.active);

  const checkNegative = (text) => {
    const found = NEGATIVE_KEYWORDS.filter((k) => text.includes(k));
    if (found.length > 0) setWarning("💡 긍정적인 표현으로 바꿔볼까요? 좋은 점을 찾아서 써보세요!");
    else setWarning("");
  };

  const save = async () => {
    if (!target || !content.trim() || saving) return;
    setSaving(true);
    const s = students.find((x) => x.id === target);
    const isSelf = target === currentStudent.id;
    const { error } = await addObservation({
      targetId: target,
      targetName: s?.name,
      category: cat || "general",
      content: content.trim(),
      date,
      authorType: "student",
      authorName: currentStudent.name,
      authorStudentId: currentStudent.id,
    });
    setSaving(false);
    if (error) return;
    setTarget(null);
    setCat("");
    setContent("");
    setSaved(true);
    setWarning("");
    setTimeout(() => setSaved(false), 2000);
  };

  const isSelfSelected = target === currentStudent.id;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>관찰 기록</h2>

      {activeMissions.length > 0 && (
        <div style={{ background: "#EEF2FF", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3730A3" }}>🎯 이번 주 관찰 미션</p>
          {activeMissions.map((m, i) => (
            <p key={i} style={{ margin: "6px 0 0", fontSize: 12, color: "#4338CA" }}>· {m.text}</p>
          ))}
        </div>
      )}

      <label style={labelStyle}>날짜</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>누구를 관찰했나요? (나 자신도 선택할 수 있어요)</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {students.map((s) => {
          const isSelf = s.id === currentStudent.id;
          const isSelected = target === s.id;
          return (
            <button key={s.id} onClick={() => setTarget(s.id)}
              style={{
                padding: "8px 2px", borderRadius: 10, position: "relative",
                border: isSelected ? "2px solid #1a1a2e" : isSelf ? "2px solid #6366F1" : "2px solid #e5e7eb",
                background: isSelected ? "#1a1a2e" : isSelf ? "#EEF2FF" : "#fff",
                color: isSelected ? "#E8D5B7" : "#333",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>
              {isSelf && (
                <span style={{ position: "absolute", top: 2, right: 4, fontSize: 8, color: isSelected ? "#E8D5B7" : "#6366F1" }}>나</span>
              )}
              <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br />{s.name}
            </button>
          );
        })}
      </div>

      <label style={labelStyle}>어떤 모습이었나요?</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); setShowScaffold(true); }}
            style={{ padding: 12, borderRadius: 10, border: cat === c.id ? `2px solid ${c.color}` : "2px solid #e5e7eb", background: cat === c.id ? c.color + "15" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#333" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {showScaffold && cat && (
        <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#166534" }}>✍️ 이렇게 써볼 수 있어요</p>
          {SCAFFOLDS[cat]?.map((s, i) => (
            <p key={i} onClick={() => setContent(s)}
              style={{ margin: "6px 0 0", fontSize: 12, color: "#15803D", cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: "#DCFCE7" }}>
              {s}
            </p>
          ))}
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#999" }}>탭하면 자동 입력돼요. 자유롭게 수정하세요!</p>
        </div>
      )}

      <label style={labelStyle}>
        {isSelfSelected ? "나의 모습을 적어보세요" : "관찰한 내용을 적어보세요"}
      </label>
      <textarea value={content}
        onChange={(e) => { setContent(e.target.value); checkNegative(e.target.value); }}
        placeholder={isSelfSelected ? "오늘 나의 학교생활 모습을 구체적으로 적어보세요..." : "친구의 좋은 모습을 구체적으로 적어보세요..."}
        style={{ ...inputStyle, height: 100, resize: "vertical" }}
        maxLength={500} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <div>{warning && <span style={{ color: "#F59E0B", fontSize: 12, fontWeight: 600 }}>{warning}</span>}</div>
        <span style={{ fontSize: 11, color: "#999" }}>{content.length}/500</span>
      </div>

      <button onClick={save} disabled={!target || !content.trim() || saving}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: (!target || !content.trim() || saving) ? "#ccc" : "#1a1a2e", color: "#E8D5B7", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
        {saved ? "✅ 저장 완료!" : saving ? "저장 중..." : "기록 저장하기"}
      </button>
    </div>
  );
}
