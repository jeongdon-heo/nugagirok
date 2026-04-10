import { CATEGORIES, today } from "../constants";
import { sectionTitle } from "../styles";
import { StatCard, ActionCard } from "./shared";

export default function TeacherHome({ observations, currentClass, setPage }) {
  const todayObs = observations.filter((o) => o.date === today());
  const teacherObs = observations.filter((o) => o.authorType === "teacher");
  const studentObs = observations.filter((o) => o.authorType === "student");
  const catCounts = CATEGORIES.map((c) => ({
    ...c, count: observations.filter((o) => o.category === c.id).length,
  }));
  const lowCats = catCounts.filter((c) => c.count < 3);

  return (
    <div style={{ paddingTop: 24 }}>
      {currentClass && (
        <div style={{ background: "#EEF2FF", borderRadius: 12, padding: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#3730A3" }}>{currentClass.name}</span>
            {currentClass.academic_year && (
              <span style={{ fontSize: 11, color: "#6366F1", marginLeft: 6 }}>
                {currentClass.academic_year}년 {currentClass.semester}학기
              </span>
            )}
            <span style={{ fontSize: 12, color: "#6366F1", marginLeft: 8 }}>코드: {currentClass.code}</span>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(currentClass.code); }}
            style={{ background: "#6366F1", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            코드 복사
          </button>
        </div>
      )}

      <h2 style={sectionTitle}>오늘의 현황</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        <StatCard label="오늘 기록" value={todayObs.length} color="#3B82F6" />
        <StatCard label="교사 기록" value={teacherObs.length} color="#10B981" />
        <StatCard label="학생 관찰" value={studentObs.length} color="#F59E0B" />
      </div>

      {lowCats.length > 0 && (
        <div style={{ background: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#9A3412", fontWeight: 600 }}>⚠️ 기록 부족 영역</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#C2410C" }}>
            {lowCats.map((c) => `${c.icon} ${c.label}(${c.count}건)`).join(", ")}
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ActionCard icon="✏️" label="기록하기" desc="학생 관찰 기록 입력" onClick={() => setPage("write")} bg="#EEF2FF" />
        <ActionCard icon="👥" label="학생관리" desc="학생별 기록 조회" onClick={() => setPage("students")} bg="#F0FDF4" />
        <ActionCard icon="📜" label="전체기록" desc="모든 기록 타임라인" onClick={() => setPage("timeline")} bg="#F5F3FF" />
        <ActionCard icon="🎯" label="관찰미션" desc="주간 미션 관리" onClick={() => setPage("mission")} bg="#FFF7ED" />
        <ActionCard icon="🤖" label="AI 초안" desc="종합의견 생성" onClick={() => setPage("ai")} bg="#FDF2F8" />
      </div>
    </div>
  );
}
