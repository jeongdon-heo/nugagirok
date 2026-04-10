import { useState } from "react";
import { sectionTitle } from "../styles";
import { ObsCard, EmptyState } from "./shared";

export default function Timeline({ students, observations, role, deleteObservation, updateObservation }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>전체 기록 ({observations.length}건)</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
        {students.map((s) => {
          const count = observations.filter((o) => o.targetId === s.id).length;
          const isOpen = openId === s.id;
          return (
            <button key={s.id} onClick={() => toggle(s.id)}
              style={{
                padding: "12px 6px", borderRadius: 12, border: isOpen ? "2px solid #1a1a2e" : "2px solid #e5e7eb",
                background: isOpen ? "#1a1a2e" : "#fff", color: isOpen ? "#E8D5B7" : "#333",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                textAlign: "center", transition: "all .15s",
              }}>
              <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br />
              {s.name}
              <span style={{ display: "block", fontSize: 10, marginTop: 2, color: isOpen ? "#8899AA" : (count === 0 ? "#DC2626" : "#999") }}>
                {count}건
              </span>
            </button>
          );
        })}
      </div>

      {openId && (() => {
        const student = students.find((s) => s.id === openId);
        const sObs = observations
          .filter((o) => o.targetId === openId)
          .sort((a, b) => b.date.localeCompare(a.date));
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
                {student?.num}번 {student?.name}
                <span style={{ fontWeight: 400, fontSize: 13, color: "#888", marginLeft: 8 }}>{sObs.length}건</span>
              </h3>
            </div>
            {sObs.length === 0 && <EmptyState text="아직 기록이 없습니다." />}
            {sObs.map((o) => (
              <ObsCard
                key={o.id}
                obs={o}
                showAuthor
                canDelete={role === "teacher"}
                canEdit={role === "teacher"}
                onDelete={() => deleteObservation(o.id)}
                onSave={updateObservation}
              />
            ))}
          </div>
        );
      })()}

      {!openId && <EmptyState text="학생을 선택하면 기록이 표시됩니다." />}
    </div>
  );
}
