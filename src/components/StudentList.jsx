import { useState } from "react";
import { CATEGORIES } from "../constants";
import { sectionTitle, backBtnStyle2, inputStyle } from "../styles";
import { ObsCard, EmptyState } from "./shared";

export default function StudentList({ students, observations, updateObservation, updateStudent, addStudent, deleteStudent }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNum, setEditNum] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNum, setNewNum] = useState("");

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditNum(String(s.num));
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editNum || saving) return;
    setSaving(true);
    await updateStudent(editingId, editName.trim(), Number(editNum));
    setSaving(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newNum || saving) return;
    setSaving(true);
    const result = await addStudent(newName.trim(), Number(newNum));
    setSaving(false);
    if (!result.error) {
      setNewName("");
      setNewNum("");
      setShowAdd(false);
    }
  };

  const handleDelete = async (s) => {
    if (!confirm(`${s.name} 학생을 삭제하시겠습니까? 해당 학생의 관찰 기록도 모두 삭제됩니다.`)) return;
    await deleteStudent(s.id);
  };

  /* 학생 상세 보기 */
  if (selectedStudent) {
    const sObs = observations
      .filter((o) => o.targetId === selectedStudent.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    const catBreakdown = CATEGORIES.map((c) => ({
      ...c, count: sObs.filter((o) => o.category === c.id).length,
    }));

    return (
      <div style={{ paddingTop: 24 }}>
        <button onClick={() => setSelectedStudent(null)} style={backBtnStyle2}>← 학생 목록</button>
        <h2 style={sectionTitle}>{selectedStudent.num}번 {selectedStudent.name}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
          {catBreakdown.map((c) => (
            <div key={c.id} style={{ background: c.count < 2 ? "#FEF2F2" : "#fff", borderRadius: 10, padding: 10, textAlign: "center", border: `1px solid ${c.count < 2 ? "#FECACA" : "#e5e7eb"}` }}>
              <div style={{ fontSize: 16 }}>{c.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.count}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{c.label}</div>
            </div>
          ))}
        </div>

        {sObs.length === 0 && <EmptyState text="아직 기록이 없습니다." />}
        {sObs.map((o) => (
          <ObsCard key={o.id} obs={o} showAuthor canEdit onSave={updateObservation} />
        ))}
      </div>
    );
  }

  /* 학생 목록 */
  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ ...sectionTitle, margin: 0 }}>학생별 기록 현황</h2>
        <button onClick={() => setEditMode(!editMode)}
          style={{ background: editMode ? "#1a1a2e" : "#fff", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: editMode ? "#E8D5B7" : "#666" }}>
          {editMode ? "편집 완료" : "학생 편집"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {students.map((s) => {
          const count = observations.filter((o) => o.targetId === s.id).length;
          const tCount = observations.filter((o) => o.targetId === s.id && o.authorType === "teacher").length;
          const sCount = observations.filter((o) => o.targetId === s.id && o.authorType === "student").length;
          const isEditing = editingId === s.id;

          if (isEditing) {
            return (
              <div key={s.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 16px", border: "2px solid #6366F1" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input type="number" value={editNum} onChange={(e) => setEditNum(e.target.value)}
                    style={{ ...inputStyle, width: 60, padding: "8px 10px", marginTop: 0, textAlign: "center" }} placeholder="번호" />
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    style={{ ...inputStyle, flex: 1, padding: "8px 10px", marginTop: 0 }} placeholder="이름"
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveEdit} disabled={saving || !editName.trim() || !editNum}
                    style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    취소
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={s.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #e5e7eb", cursor: editMode ? "default" : "pointer", fontFamily: "inherit" }}
              onClick={() => !editMode && setSelectedStudent(s)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: count < 3 ? "#FEE2E2" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: count < 3 ? "#DC2626" : "#166534" }}>{s.num}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{s.name}</span>
              </div>
              {editMode ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={(e) => { e.stopPropagation(); startEdit(s); }}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#6366F1" }}>
                    수정
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s); }}
                    style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: "#DC2626" }}>
                    삭제
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                  <span style={{ color: "#10B981" }}>교사 {tCount}</span>
                  <span style={{ color: "#F59E0B" }}>학생 {sCount}</span>
                  <span style={{ fontWeight: 700, color: "#1a1a2e" }}>총 {count}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 학생 추가 */}
      {editMode && (
        <div style={{ marginTop: 16 }}>
          {showAdd ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "2px dashed #6366F1" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="number" value={newNum} onChange={(e) => setNewNum(e.target.value)}
                  style={{ ...inputStyle, width: 60, padding: "8px 10px", marginTop: 0, textAlign: "center" }} placeholder="번호" />
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  style={{ ...inputStyle, flex: 1, padding: "8px 10px", marginTop: 0 }} placeholder="이름"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleAdd} disabled={saving || !newName.trim() || !newNum}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {saving ? "추가 중..." : "추가"}
                </button>
                <button onClick={() => { setShowAdd(false); setNewName(""); setNewNum(""); }}
                  style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAdd(true)}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px dashed #ddd", background: "transparent", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#888" }}>
              + 학생 추가
            </button>
          )}
        </div>
      )}
    </div>
  );
}
