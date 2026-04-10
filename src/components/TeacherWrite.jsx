import { useState } from "react";
import { CATEGORIES, today } from "../constants";
import { sectionTitle, labelStyle, inputStyle } from "../styles";

export default function TeacherWrite({ students, addObservation }) {
  const [selected, setSelected] = useState([]);
  const [cat, setCat] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleStudent = (id) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const selectAll = () =>
    setSelected(selected.length === students.length ? [] : students.map((s) => s.id));

  const save = async () => {
    if (!selected.length || !cat || !content.trim() || saving) return;
    setSaving(true);
    let hasError = false;
    for (const sid of selected) {
      const s = students.find((x) => x.id === sid);
      const { error } = await addObservation({
        targetId: sid,
        targetName: s?.name,
        category: cat,
        content: content.trim(),
        date,
        authorType: "teacher",
        authorName: "담임교사",
      });
      if (error) { hasError = true; break; }
    }
    setSaving(false);
    if (hasError) return;
    setSelected([]);
    setCat("");
    setContent("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canSave = selected.length > 0 && cat && content.trim() && !saving;

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>관찰 기록 입력</h2>

      <label style={labelStyle}>날짜</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>
        학생 선택 <span style={{ fontWeight: 400, color: "#999" }}>({selected.length}명)</span>
      </label>
      <button onClick={selectAll}
        style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", marginBottom: 8, fontFamily: "inherit", color: "#666" }}>
        {selected.length === students.length ? "전체 해제" : "전체 선택"}
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {students.map((s) => (
          <button key={s.id} onClick={() => toggleStudent(s.id)}
            style={{ padding: "8px 2px", borderRadius: 10, border: selected.includes(s.id) ? "2px solid #1a1a2e" : "2px solid #e5e7eb", background: selected.includes(s.id) ? "#1a1a2e" : "#fff", color: selected.includes(s.id) ? "#E8D5B7" : "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br />{s.name}
          </button>
        ))}
      </div>

      <label style={labelStyle}>관찰 영역</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ padding: 12, borderRadius: 10, border: cat === c.id ? `2px solid ${c.color}` : "2px solid #e5e7eb", background: cat === c.id ? c.color + "15" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", color: "#333" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <label style={labelStyle}>관찰 내용</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="관찰한 학생의 학교생활 모습을 구체적으로 기록하세요..."
        style={{ ...inputStyle, height: 120, resize: "vertical" }}
        maxLength={500} />
      <div style={{ textAlign: "right", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#999" }}>{content.length}/500</span>
      </div>

      <button onClick={save} disabled={!canSave}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: canSave ? "#1a1a2e" : "#ccc", color: canSave ? "#E8D5B7" : "#666", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: "inherit", transition: "all .2s" }}>
        {saved ? "✅ 저장되었습니다!" : saving ? "저장 중..." : `${selected.length}명 기록 저장`}
      </button>
    </div>
  );
}
