export default function BottomNav({ role, page, setPage }) {
  const teacherNav = [
    { id: "home", icon: "🏠", label: "홈" },
    { id: "write", icon: "✏️", label: "기록" },
    { id: "students", icon: "👥", label: "학생" },
    { id: "stats", icon: "📊", label: "통계" },
    { id: "ai", icon: "🤖", label: "AI초안" },
  ];
  const studentNav = [
    { id: "home", icon: "🏠", label: "홈" },
    { id: "write", icon: "✏️", label: "관찰기록" },
    { id: "myrecords", icon: "📝", label: "내기록" },
  ];
  const nav = role === "teacher" ? teacherNav : studentNav;

  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a1a2e", borderTop: "1px solid #2a3a5e", display: "flex", justifyContent: "center", zIndex: 100 }}>
      <div style={{ display: "flex", maxWidth: 500, width: "100%" }}>
        {nav.map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", color: page === n.id ? "#E8D5B7" : "#556677", fontSize: 10, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", transition: "color .2s" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
