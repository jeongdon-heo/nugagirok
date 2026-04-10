export default function Header({ role, currentStudent, currentClass, page, setPage, onLogout }) {
  return (
    <header style={{ background: "#1a1a2e", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #2a3a5e" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ fontSize: 22 }}>📋</span>
          <span style={{ color: "#E8D5B7", fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>누가기록장</span>
          {role === "teacher" && currentClass && (
            <span style={{ color: "#556677", fontSize: 11, marginLeft: 4 }}>
              코드: {currentClass.code}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#8899AA", fontSize: 12 }}>
            {role === "teacher" ? "🧑‍🏫 교사" : `🧑‍🎓 ${currentStudent?.name}`}
          </span>
          <button onClick={onLogout}
            style={{ background: "#2a3a5e", border: "none", color: "#8899AA", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            나가기
          </button>
        </div>
      </div>
    </header>
  );
}
