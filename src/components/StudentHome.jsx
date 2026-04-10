import { ActionCard } from "./shared";

export default function StudentHome({ currentStudent, observations, missions, setPage }) {
  const myWritten = observations.filter(
    (o) => o.authorType === "student" && o.authorStudentId === currentStudent.id
  );
  const activeMissions = missions.filter((m) => m.active);

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", borderRadius: 18, padding: 24, marginBottom: 20, color: "#E8D5B7" }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>안녕하세요</p>
        <h2 style={{ margin: "4px 0 12px", fontSize: 22, fontWeight: 800 }}>
          {currentStudent.name} 친구 👋
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
          지금까지 <strong>{myWritten.length}개</strong>의 관찰 기록을 작성했어요!
        </p>
      </div>

      {activeMissions.length > 0 && (
        <div style={{ background: "#EEF2FF", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3730A3" }}>🎯 이번 주 관찰 미션</p>
          {activeMissions.map((m, i) => (
            <p key={i} style={{ margin: "6px 0 0", fontSize: 12, color: "#4338CA" }}>· {m.text}</p>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ActionCard icon="✏️" label="관찰 기록" desc="친구 관찰하고 기록하기" onClick={() => setPage("write")} bg="#EEF2FF" />
        <ActionCard icon="📝" label="내 기록" desc="내가 쓴 관찰 기록 보기" onClick={() => setPage("myrecords")} bg="#F0FDF4" />
      </div>
    </div>
  );
}
