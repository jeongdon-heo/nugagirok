import { sectionTitle } from "../styles";
import { ObsCard } from "./shared";

export default function Timeline({ observations, role, deleteObservation, updateObservation }) {
  const sorted = [...observations].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>전체 기록 타임라인 ({observations.length}건)</h2>
      {sorted.map((o) => (
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
}
