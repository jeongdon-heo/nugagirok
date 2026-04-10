import { useState } from "react";
import { CATEGORIES } from "../constants";
import { sectionTitle, backBtnStyle2 } from "../styles";
import { ObsCard, EmptyState } from "./shared";

export default function StudentList({ students, observations, updateObservation }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>학생별 기록 현황</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {students.map((s) => {
          const count = observations.filter((o) => o.targetId === s.id).length;
          const tCount = observations.filter((o) => o.targetId === s.id && o.authorType === "teacher").length;
          const sCount = observations.filter((o) => o.targetId === s.id && o.authorType === "student").length;
          return (
            <button key={s.id} onClick={() => setSelectedStudent(s)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #e5e7eb", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: count < 3 ? "#FEE2E2" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: count < 3 ? "#DC2626" : "#166534" }}>{s.num}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{s.name}</span>
              </div>
              <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
                <span style={{ color: "#10B981" }}>교사 {tCount}</span>
                <span style={{ color: "#F59E0B" }}>학생 {sCount}</span>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>총 {count}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
