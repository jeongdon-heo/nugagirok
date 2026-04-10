import { sectionTitle } from "../styles";
import { ObsCard, EmptyState } from "./shared";

export default function MyRecords({ currentStudent, observations }) {
  const myObs = observations
    .filter((o) => o.authorType === "student" && o.authorStudentId === currentStudent.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>내가 쓴 기록 ({myObs.length}건)</h2>
      {myObs.length === 0 && <EmptyState text="아직 작성한 기록이 없어요. 친구를 관찰해보세요!" />}
      {myObs.map((o) => (
        <ObsCard key={o.id} obs={o} />
      ))}
    </div>
  );
}
