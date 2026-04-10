import { useState } from "react";
import { MISSIONS_POOL } from "../constants";
import { sectionTitle, inputStyle } from "../styles";

export default function MissionManager({ missions, addMission, toggleMission, removeMission }) {
  const [customText, setCustomText] = useState("");

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>🎯 관찰 미션 관리</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        학생들에게 보여줄 주간 관찰 미션을 설정하세요. 활성화된 미션이 학생 화면에 표시됩니다.
      </p>

      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>추천 미션</h3>
        {MISSIONS_POOL.map((m, i) => (
          <button key={i} onClick={() => addMission(m.text, m.cat)}
            style={{ display: "block", width: "100%", textAlign: "left", background: "#F8F6F1", border: "none", borderRadius: 10, padding: "10px 14px", marginBottom: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit", color: "#333" }}>
            ➕ {m.text}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>직접 만들기</h3>
        <textarea value={customText} onChange={(e) => setCustomText(e.target.value)}
          placeholder="관찰 미션 내용을 입력하세요..." style={{ ...inputStyle, height: 60 }} />
        <button onClick={() => { if (customText.trim()) { addMission(customText.trim(), "custom"); setCustomText(""); } }}
          style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#1a1a2e", color: "#E8D5B7", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
          미션 추가
        </button>
      </div>

      {missions.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>현재 미션 목록</h3>
          {missions.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
              <button onClick={() => toggleMission(m.id)}
                style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid #ccc", background: m.active ? "#10B981" : "#fff", cursor: "pointer", fontSize: 12, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m.active && "✓"}
              </button>
              <span style={{ flex: 1, fontSize: 13, color: m.active ? "#333" : "#999", textDecoration: m.active ? "none" : "line-through" }}>{m.text}</span>
              <button onClick={() => removeMission(m.id)}
                style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
