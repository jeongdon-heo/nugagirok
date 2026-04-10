import { CATEGORIES } from "../constants";
import { sectionTitle } from "../styles";

export default function Stats({ students, observations }) {
  const months = {};
  observations.forEach((o) => {
    const m = o.date?.slice(0, 7) || "unknown";
    months[m] = (months[m] || 0) + 1;
  });
  const sortedMonths = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  const maxCount = Math.max(...Object.values(months), 1);

  const catCounts = CATEGORIES.map((c) => ({
    ...c, count: observations.filter((o) => o.category === c.id).length,
  }));
  const totalObs = observations.length || 1;

  const studentCounts = students
    .map((s) => ({ ...s, count: observations.filter((o) => o.targetId === s.id).length }))
    .sort((a, b) => a.count - b.count);

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>기록 통계</h2>

      <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>📅 월별 기록 건수</h3>
        {sortedMonths.map(([m, c]) => (
          <div key={m} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ width: 60, fontSize: 12, color: "#666", textAlign: "right" }}>{m}</span>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 24, position: "relative", overflow: "hidden" }}>
              <div style={{ width: `${(c / maxCount) * 100}%`, height: "100%", background: "linear-gradient(90deg, #1a1a2e, #0f3460)", borderRadius: 6, transition: "width .5s" }} />
              <span style={{ position: "absolute", right: 8, top: 3, fontSize: 12, fontWeight: 700, color: c / maxCount > 0.5 ? "#E8D5B7" : "#333" }}>{c}</span>
            </div>
          </div>
        ))}
        {sortedMonths.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>아직 기록이 없습니다.</p>}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>📂 영역별 분포</h3>
        {catCounts.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 80, fontSize: 12 }}>{c.icon} {c.label}</span>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 20, overflow: "hidden" }}>
              <div style={{ width: `${(c.count / totalObs) * 100}%`, height: "100%", background: c.color, borderRadius: 6 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, width: 30, textAlign: "right" }}>{c.count}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 16px" }}>⚠️ 기록 부족 학생</h3>
        {studentCounts.slice(0, 5).map((s) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13 }}>{s.num}번 {s.name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.count < 3 ? "#DC2626" : "#333" }}>{s.count}건</span>
          </div>
        ))}
      </div>
    </div>
  );
}
