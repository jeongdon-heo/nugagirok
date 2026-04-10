import { useState, useEffect, useCallback, useMemo } from "react";

const CATEGORIES = [
  { id: "self", label: "자기관리", icon: "🪞", color: "#3B82F6" },
  { id: "community", label: "공동체역량", icon: "🤝", color: "#10B981" },
  { id: "learning", label: "학습태도", icon: "📚", color: "#F59E0B" },
  { id: "friendship", label: "교우관계", icon: "💬", color: "#EC4899" },
  { id: "activity", label: "자치·동아리", icon: "🎯", color: "#8B5CF6" },
  { id: "special", label: "특기사항", icon: "⭐", color: "#EF4444" },
];

const NEGATIVE_KEYWORDS = ["못","싫","안 ","없","나쁘","짜증","멍청","바보","게으","느려","이상해","못생","더러","시끄"];

const SAMPLE_STUDENTS = [
  { id: 1, name: "김가을", num: 1 },{ id: 2, name: "김나래", num: 2 },
  { id: 3, name: "박다운", num: 3 },{ id: 4, name: "이라희", num: 4 },
  { id: 5, name: "정마루", num: 5 },{ id: 6, name: "최바다", num: 6 },
  { id: 7, name: "한사랑", num: 7 },{ id: 8, name: "윤아진", num: 8 },
  { id: 9, name: "송자영", num: 9 },{ id: 10, name: "오차민", num: 10 },
  { id: 11, name: "임카연", num: 11 },{ id: 12, name: "강태양", num: 12 },
  { id: 13, name: "조파랑", num: 13 },{ id: 14, name: "서하늘", num: 14 },
  { id: 15, name: "문가온", num: 15 },{ id: 16, name: "배나은", num: 16 },
  { id: 17, name: "신다올", num: 17 },{ id: 18, name: "류라온", num: 18 },
  { id: 19, name: "장마음", num: 19 },{ id: 20, name: "허바름", num: 20 },
];

const SCAFFOLDS = {
  self: ["○○이(가) 스스로 ~하는 모습이 인상적이었습니다.", "○○이(가) 자기 물건을 ~하는 모습을 보았습니다."],
  community: ["○○이(가) 친구들과 함께 ~할 때 ~하는 모습이 좋았습니다.", "○○이(가) 교실 규칙을 ~하며 지키는 모습이 보였습니다."],
  learning: ["○○이(가) 수업 시간에 ~하는 모습이 인상적이었습니다.", "○○이(가) ~과목에서 적극적으로 ~하였습니다."],
  friendship: ["○○이(가) 친구에게 ~해주는 따뜻한 모습을 보았습니다.", "○○이(가) ~한 상황에서 친구를 도와주었습니다."],
  activity: ["○○이(가) ~활동에서 ~하는 역할을 잘 수행하였습니다.", "○○이(가) 동아리 시간에 ~하는 모습이 돋보였습니다."],
  special: ["○○이(가) ~분야에서 특별한 재능을 보여주었습니다.", "○○이(가) ~에 대한 관심과 열정이 돋보였습니다."],
};

const MISSIONS_POOL = [
  { text: "모둠 활동에서 친구의 협력하는 모습을 관찰해보세요", cat: "community" },
  { text: "쉬는 시간에 친구에게 친절하게 대하는 모습을 찾아보세요", cat: "friendship" },
  { text: "수업 시간에 집중하며 열심히 참여하는 친구를 관찰해보세요", cat: "learning" },
  { text: "스스로 정리정돈을 잘하는 친구를 찾아보세요", cat: "self" },
  { text: "학급 자치 활동에서 책임감 있게 행동하는 친구를 관찰해보세요", cat: "activity" },
];

const today = () => new Date().toISOString().split("T")[0];

function App() {
  const [role, setRole] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [observations, setObservations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nuga_obs") || "[]"); } catch { return []; }
  });
  const [missions, setMissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nuga_missions") || "[]"); } catch { return []; }
  });
  const [page, setPage] = useState("home");
  const [aiDrafts, setAiDrafts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nuga_drafts") || "{}"); } catch { return {}; }
  });

  useEffect(() => { localStorage.setItem("nuga_obs", JSON.stringify(observations)); }, [observations]);
  useEffect(() => { localStorage.setItem("nuga_missions", JSON.stringify(missions)); }, [missions]);
  useEffect(() => { localStorage.setItem("nuga_drafts", JSON.stringify(aiDrafts)); }, [aiDrafts]);

  const addObservation = (obs) => setObservations((p) => [...p, { ...obs, id: Date.now() + Math.random() }]);
  const deleteObservation = (id) => setObservations((p) => p.filter((o) => o.id !== id));

  if (!role) return <LoginScreen setRole={setRole} setCurrentStudent={setCurrentStudent} />;

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
      <Header role={role} currentStudent={currentStudent} page={page} setPage={setPage} setRole={setRole} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 100px" }}>
        {role === "teacher" && page === "home" && (
          <TeacherHome observations={observations} setPage={setPage} />
        )}
        {role === "teacher" && page === "write" && (
          <TeacherWrite addObservation={addObservation} />
        )}
        {role === "teacher" && page === "students" && (
          <StudentList observations={observations} setPage={setPage} />
        )}
        {role === "teacher" && page === "timeline" && (
          <Timeline observations={observations} role={role} deleteObservation={deleteObservation} />
        )}
        {role === "teacher" && page === "stats" && (
          <Stats observations={observations} />
        )}
        {role === "teacher" && page === "mission" && (
          <MissionManager missions={missions} setMissions={setMissions} />
        )}
        {role === "teacher" && page === "ai" && (
          <AIDraft observations={observations} aiDrafts={aiDrafts} setAiDrafts={setAiDrafts} />
        )}
        {role === "student" && page === "home" && (
          <StudentHome currentStudent={currentStudent} observations={observations} missions={missions} setPage={setPage} />
        )}
        {role === "student" && page === "write" && (
          <StudentWrite currentStudent={currentStudent} addObservation={addObservation} missions={missions} />
        )}
        {role === "student" && page === "myrecords" && (
          <MyRecords currentStudent={currentStudent} observations={observations} />
        )}
      </main>
      <BottomNav role={role} page={page} setPage={setPage} />
    </div>
  );
}

/* ==================== LOGIN ==================== */
function LoginScreen({ setRole, setCurrentStudent }) {
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ color: "#E8D5B7", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1 }}>누가기록장</h1>
          <p style={{ color: "#8899AA", fontSize: 14, marginTop: 8 }}>학교생활 관찰 · 기록 · 종합의견</p>
        </div>

        {!mode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => { setMode("teacher"); }} style={loginBtnStyle("#E8D5B7", "#1a1a2e")}>
              🧑‍🏫 교사로 입장
            </button>
            <button onClick={() => setMode("student")} style={loginBtnStyle("transparent", "#E8D5B7", true)}>
              🧑‍🎓 학생으로 입장
            </button>
          </div>
        )}

        {mode === "teacher" && (
          <div>
            <button onClick={() => { setRole("teacher"); }} style={{ ...loginBtnStyle("#E8D5B7", "#1a1a2e"), width: "100%" }}>
              4학년 2반 교실 입장
            </button>
            <button onClick={() => setMode(null)} style={backBtnStyle}>← 뒤로</button>
          </div>
        )}

        {mode === "student" && (
          <div>
            <p style={{ color: "#8899AA", fontSize: 13, marginBottom: 12, textAlign: "center" }}>이름을 선택하세요</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {SAMPLE_STUDENTS.map((s) => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  style={{ padding: "10px 4px", borderRadius: 10, border: selected === s.id ? "2px solid #E8D5B7" : "2px solid #2a3a5e", background: selected === s.id ? "#2a3a5e" : "transparent", color: "#E8D5B7", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>{s.num}</span><br />{s.name}
                </button>
              ))}
            </div>
            {selected && (
              <button onClick={() => { setCurrentStudent(SAMPLE_STUDENTS.find(s=>s.id===selected)); setRole("student"); }}
                style={{ ...loginBtnStyle("#E8D5B7", "#1a1a2e"), width: "100%", marginTop: 16 }}>
                입장하기
              </button>
            )}
            <button onClick={() => { setMode(null); setSelected(null); }} style={backBtnStyle}>← 뒤로</button>
          </div>
        )}
      </div>
    </div>
  );
}

const loginBtnStyle = (bg, color, outline) => ({
  padding: "16px 24px", borderRadius: 14, border: outline ? "2px solid #E8D5B7" : "none",
  background: bg, color, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .2s",
  fontFamily: "inherit",
});
const backBtnStyle = { background: "none", border: "none", color: "#667", fontSize: 14, cursor: "pointer", marginTop: 16, display: "block", margin: "16px auto 0", fontFamily: "inherit" };

/* ==================== HEADER ==================== */
function Header({ role, currentStudent, page, setPage, setRole }) {
  return (
    <header style={{ background: "#1a1a2e", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #2a3a5e" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
          <span style={{ fontSize: 22 }}>📋</span>
          <span style={{ color: "#E8D5B7", fontWeight: 800, fontSize: 17, letterSpacing: -0.5 }}>누가기록장</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#8899AA", fontSize: 12 }}>
            {role === "teacher" ? "🧑‍🏫 교사" : `🧑‍🎓 ${currentStudent?.name}`}
          </span>
          <button onClick={() => { setRole(null); setPage("home"); }} style={{ background: "#2a3a5e", border: "none", color: "#8899AA", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>나가기</button>
        </div>
      </div>
    </header>
  );
}

/* ==================== BOTTOM NAV ==================== */
function BottomNav({ role, page, setPage }) {
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

/* ==================== TEACHER HOME ==================== */
function TeacherHome({ observations, setPage }) {
  const todayObs = observations.filter((o) => o.date === today());
  const teacherObs = observations.filter((o) => o.authorType === "teacher");
  const studentObs = observations.filter((o) => o.authorType === "student");
  const catCounts = CATEGORIES.map((c) => ({ ...c, count: observations.filter((o) => o.category === c.id).length }));
  const lowCats = catCounts.filter((c) => c.count < 3);

  return (
    <div style={{ paddingTop: 24 }}>
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
        <ActionCard icon="🎯" label="관찰미션" desc="주간 미션 관리" onClick={() => setPage("mission")} bg="#FFF7ED" />
        <ActionCard icon="🤖" label="AI 초안" desc="종합의견 생성" onClick={() => setPage("ai")} bg="#FDF2F8" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ActionCard({ icon, label, desc, onClick, bg }) {
  return (
    <button onClick={onClick} style={{ background: bg, border: "none", borderRadius: 14, padding: 20, textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "transform .15s" }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{desc}</div>
    </button>
  );
}

/* ==================== TEACHER WRITE ==================== */
function TeacherWrite({ addObservation }) {
  const [selected, setSelected] = useState([]);
  const [cat, setCat] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);

  const toggleStudent = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const selectAll = () => setSelected(selected.length === SAMPLE_STUDENTS.length ? [] : SAMPLE_STUDENTS.map(s=>s.id));

  const save = () => {
    if (!selected.length || !cat || !content.trim()) return;
    selected.forEach((sid) => {
      addObservation({ targetId: sid, targetName: SAMPLE_STUDENTS.find(s=>s.id===sid)?.name, category: cat, content: content.trim(), date, authorType: "teacher", authorName: "담임교사" });
    });
    setSelected([]); setCat(""); setContent(""); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>관찰 기록 입력</h2>

      <label style={labelStyle}>날짜</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>학생 선택 <span style={{ fontWeight: 400, color: "#999" }}>({selected.length}명)</span></label>
      <button onClick={selectAll} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", marginBottom: 8, fontFamily: "inherit", color: "#666" }}>
        {selected.length === SAMPLE_STUDENTS.length ? "전체 해제" : "전체 선택"}
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {SAMPLE_STUDENTS.map((s) => (
          <button key={s.id} onClick={() => toggleStudent(s.id)}
            style={{ padding: "8px 2px", borderRadius: 10, border: selected.includes(s.id) ? "2px solid #1a1a2e" : "2px solid #e5e7eb", background: selected.includes(s.id) ? "#1a1a2e" : "#fff", color: selected.includes(s.id) ? "#E8D5B7" : "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br/>{s.name}
          </button>
        ))}
      </div>

      <label style={labelStyle}>관찰 영역</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ padding: 12, borderRadius: 10, border: cat === c.id ? `2px solid ${c.color}` : "2px solid #e5e7eb", background: cat === c.id ? c.color + "15" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", color: "#333" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <label style={labelStyle}>관찰 내용</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="관찰한 학생의 학교생활 모습을 구체적으로 기록하세요..."
        style={{ ...inputStyle, height: 120, resize: "vertical" }} />

      <button onClick={save} disabled={!selected.length || !cat || !content.trim()}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: (!selected.length || !cat || !content.trim()) ? "#ccc" : "#1a1a2e", color: "#E8D5B7", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: "inherit", transition: "all .2s" }}>
        {saved ? "✅ 저장되었습니다!" : `${selected.length}명 기록 저장`}
      </button>
    </div>
  );
}

/* ==================== STUDENT WRITE ==================== */
function StudentWrite({ currentStudent, addObservation, missions }) {
  const [target, setTarget] = useState(null);
  const [cat, setCat] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(today());
  const [saved, setSaved] = useState(false);
  const [warning, setWarning] = useState("");
  const [showScaffold, setShowScaffold] = useState(false);

  const activeMissions = missions.filter(m => m.active);

  const checkNegative = (text) => {
    const found = NEGATIVE_KEYWORDS.filter((k) => text.includes(k));
    if (found.length > 0) setWarning("💡 긍정적인 표현으로 바꿔서 써볼까요? 친구의 좋은 점을 찾아보세요!");
    else setWarning("");
  };

  const save = () => {
    if (!target || !cat || !content.trim()) return;
    addObservation({ targetId: target, targetName: SAMPLE_STUDENTS.find(s=>s.id===target)?.name, category: cat, content: content.trim(), date, authorType: "student", authorName: currentStudent.name });
    setTarget(null); setCat(""); setContent(""); setSaved(true); setWarning("");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>친구 관찰 기록</h2>

      {activeMissions.length > 0 && (
        <div style={{ background: "#EEF2FF", borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3730A3" }}>🎯 이번 주 관찰 미션</p>
          {activeMissions.map((m, i) => (
            <p key={i} style={{ margin: "6px 0 0", fontSize: 12, color: "#4338CA" }}>· {m.text}</p>
          ))}
        </div>
      )}

      <label style={labelStyle}>날짜</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>누구를 관찰했나요?</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {SAMPLE_STUDENTS.filter(s => s.id !== currentStudent.id).map((s) => (
          <button key={s.id} onClick={() => setTarget(s.id)}
            style={{ padding: "8px 2px", borderRadius: 10, border: target === s.id ? "2px solid #1a1a2e" : "2px solid #e5e7eb", background: target === s.id ? "#1a1a2e" : "#fff", color: target === s.id ? "#E8D5B7" : "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br/>{s.name}
          </button>
        ))}
      </div>

      <label style={labelStyle}>어떤 모습이었나요?</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); setShowScaffold(true); }}
            style={{ padding: 12, borderRadius: 10, border: cat === c.id ? `2px solid ${c.color}` : "2px solid #e5e7eb", background: cat === c.id ? c.color + "15" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "#333" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {showScaffold && cat && (
        <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#166534" }}>✍️ 이렇게 써볼 수 있어요</p>
          {SCAFFOLDS[cat]?.map((s, i) => (
            <p key={i} onClick={() => setContent(s)} style={{ margin: "6px 0 0", fontSize: 12, color: "#15803D", cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: "#DCFCE7" }}>
              {s}
            </p>
          ))}
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#999" }}>탭하면 자동 입력돼요. 자유롭게 수정하세요!</p>
        </div>
      )}

      <label style={labelStyle}>관찰한 내용을 적어보세요</label>
      <textarea value={content} onChange={(e) => { setContent(e.target.value); checkNegative(e.target.value); }}
        placeholder="친구의 좋은 모습을 구체적으로 적어보세요..."
        style={{ ...inputStyle, height: 100, resize: "vertical" }} />
      {warning && <p style={{ color: "#DC2626", fontSize: 12, margin: "4px 0 12px", fontWeight: 600 }}>{warning}</p>}

      <button onClick={save} disabled={!target || !cat || !content.trim() || !!warning}
        style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: (!target || !cat || !content.trim() || !!warning) ? "#ccc" : "#1a1a2e", color: "#E8D5B7", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
        {saved ? "✅ 저장 완료!" : "기록 저장하기"}
      </button>
    </div>
  );
}

/* ==================== STUDENT HOME ==================== */
function StudentHome({ currentStudent, observations, missions, setPage }) {
  const myWritten = observations.filter(o => o.authorType === "student" && o.authorName === currentStudent.name);
  const activeMissions = missions.filter(m => m.active);

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #0f3460)", borderRadius: 18, padding: 24, marginBottom: 20, color: "#E8D5B7" }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>안녕하세요</p>
        <h2 style={{ margin: "4px 0 12px", fontSize: 22, fontWeight: 800 }}>{currentStudent.name} 친구 👋</h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>지금까지 <strong>{myWritten.length}개</strong>의 관찰 기록을 작성했어요!</p>
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

/* ==================== MY RECORDS (student) ==================== */
function MyRecords({ currentStudent, observations }) {
  const myObs = observations.filter(o => o.authorType === "student" && o.authorName === currentStudent.name)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>내가 쓴 기록 ({myObs.length}건)</h2>
      {myObs.length === 0 && <EmptyState text="아직 작성한 기록이 없어요. 친구를 관찰해보세요!" />}
      {myObs.map((o) => <ObsCard key={o.id} obs={o} />)}
    </div>
  );
}

/* ==================== STUDENT LIST ==================== */
function StudentList({ observations, setPage }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (selectedStudent) {
    const sObs = observations.filter(o => o.targetId === selectedStudent.id).sort((a, b) => b.date.localeCompare(a.date));
    const catBreakdown = CATEGORIES.map(c => ({ ...c, count: sObs.filter(o => o.category === c.id).length }));

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
        {sObs.map((o) => <ObsCard key={o.id} obs={o} showAuthor />)}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>학생별 기록 현황</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SAMPLE_STUDENTS.map((s) => {
          const count = observations.filter(o => o.targetId === s.id).length;
          const tCount = observations.filter(o => o.targetId === s.id && o.authorType === "teacher").length;
          const sCount = observations.filter(o => o.targetId === s.id && o.authorType === "student").length;
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

/* ==================== TIMELINE ==================== */
function Timeline({ observations, role, deleteObservation }) {
  const sorted = [...observations].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>전체 기록 타임라인 ({observations.length}건)</h2>
      {sorted.map((o) => <ObsCard key={o.id} obs={o} showAuthor canDelete={role === "teacher"} onDelete={() => deleteObservation(o.id)} />)}
    </div>
  );
}

/* ==================== STATS ==================== */
function Stats({ observations }) {
  const months = {};
  observations.forEach((o) => {
    const m = o.date?.slice(0, 7) || "unknown";
    months[m] = (months[m] || 0) + 1;
  });
  const sortedMonths = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  const maxCount = Math.max(...Object.values(months), 1);

  const catCounts = CATEGORIES.map(c => ({ ...c, count: observations.filter(o => o.category === c.id).length }));
  const totalObs = observations.length || 1;

  const studentCounts = SAMPLE_STUDENTS.map(s => ({
    ...s, count: observations.filter(o => o.targetId === s.id).length
  })).sort((a, b) => a.count - b.count);

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

/* ==================== MISSION MANAGER ==================== */
function MissionManager({ missions, setMissions }) {
  const [customText, setCustomText] = useState("");

  const addMission = (text, cat) => {
    setMissions((p) => [...p, { text, cat, active: true, id: Date.now() }]);
  };
  const toggleMission = (id) => {
    setMissions((p) => p.map((m) => m.id === id ? { ...m, active: !m.active } : m));
  };
  const removeMission = (id) => {
    setMissions((p) => p.filter((m) => m.id !== id));
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>🎯 관찰 미션 관리</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>학생들에게 보여줄 주간 관찰 미션을 설정하세요. 활성화된 미션이 학생 화면에 표시됩니다.</p>

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
        <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="관찰 미션 내용을 입력하세요..."
          style={{ ...inputStyle, height: 60 }} />
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
              <button onClick={() => toggleMission(m.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid #ccc", background: m.active ? "#10B981" : "#fff", cursor: "pointer", fontSize: 12, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {m.active && "✓"}
              </button>
              <span style={{ flex: 1, fontSize: 13, color: m.active ? "#333" : "#999", textDecoration: m.active ? "none" : "line-through" }}>{m.text}</span>
              <button onClick={() => removeMission(m.id)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== AI DRAFT ==================== */
function AIDraft({ observations, aiDrafts, setAiDrafts }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [editDraft, setEditDraft] = useState("");

  const generate = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    const sObs = observations.filter(o => o.targetId === selectedStudent.id);
    const teacherObs = sObs.filter(o => o.authorType === "teacher");
    const studentObs = sObs.filter(o => o.authorType === "student");

    const obsText = CATEGORIES.map(c => {
      const tObs = teacherObs.filter(o => o.category === c.id).map(o => `[${o.date}] ${o.content}`).join("\n");
      const sObs2 = studentObs.filter(o => o.category === c.id).map(o => `[${o.date}] (또래관찰: ${o.authorName}) ${o.content}`).join("\n");
      return `## ${c.label}\n### 교사 관찰\n${tObs || "(기록 없음)"}\n### 또래 관찰\n${sObs2 || "(기록 없음)"}`;
    }).join("\n\n");

    const prompt = `당신은 대한민국 초등학교 담임교사입니다. 아래 누가기록을 바탕으로 학교생활기록부 '행동특성 및 종합의견'을 작성하세요.

## 작성 지침
1. 학생의 이름은 쓰지 않습니다.
2. 문장은 '~함.', '~음.' 등의 종결어미를 사용합니다.
3. 모든 문장은 긍정적·발전적 관점으로 서술합니다.
4. 구체적인 사례와 행동을 포함하여 서술합니다.
5. 교사 관찰 기록에 높은 가중치를, 또래 관찰은 참고 자료로 활용합니다.
6. 영역(자기관리, 공동체역량, 학습태도, 교우관계, 자치·동아리, 특기사항)별로 균형 있게 서술합니다.
7. 기록이 부족한 영역은 억지로 서술하지 않습니다.
8. 전체 분량은 500~800자로 작성합니다.

## 영역별 작성 방법
각 영역별로 먼저 초안을 작성한 뒤, 자연스럽게 하나의 종합의견으로 통합하세요.

## 학생: ${selectedStudent.name} (${selectedStudent.num}번)

## 누가기록
${obsText}

위 기록을 바탕으로 행동특성 및 종합의견을 작성하세요. 영역별 분리 작성 후 통합하는 방식으로 진행하세요. 최종 결과만 출력하세요.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "생성에 실패했습니다. 다시 시도해주세요.";
      setDraft(text);
      setEditDraft(text);
      setAiDrafts(prev => ({ ...prev, [selectedStudent.id]: text }));
    } catch (e) {
      setDraft("AI 초안 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      setEditDraft("");
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: 24 }}>
      <h2 style={sectionTitle}>🤖 AI 종합의견 초안</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>학생을 선택하면 누가기록을 바탕으로 행동특성 및 종합의견 초안을 생성합니다.</p>

      <label style={labelStyle}>학생 선택</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 20 }}>
        {SAMPLE_STUDENTS.map((s) => {
          const count = observations.filter(o => o.targetId === s.id).length;
          const hasDraft = !!aiDrafts[s.id];
          return (
            <button key={s.id} onClick={() => { setSelectedStudent(s); setDraft(aiDrafts[s.id] || ""); setEditDraft(aiDrafts[s.id] || ""); }}
              style={{ padding: "8px 2px", borderRadius: 10, border: selectedStudent?.id === s.id ? "2px solid #1a1a2e" : "2px solid #e5e7eb", background: selectedStudent?.id === s.id ? "#1a1a2e" : "#fff", color: selectedStudent?.id === s.id ? "#E8D5B7" : "#333", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
              {hasDraft && <span style={{ position: "absolute", top: 2, right: 4, fontSize: 8, color: "#10B981" }}>✅</span>}
              <span style={{ fontSize: 10, opacity: 0.5 }}>{s.num}</span><br/>{s.name}
              <span style={{ display: "block", fontSize: 9, color: selectedStudent?.id === s.id ? "#8899AA" : "#999", marginTop: 2 }}>{count}건</span>
            </button>
          );
        })}
      </div>

      {selectedStudent && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={generate} disabled={loading}
              style={{ flex: 1, padding: 14, borderRadius: 12, border: "none", background: loading ? "#ccc" : "#1a1a2e", color: "#E8D5B7", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {loading ? "⏳ 생성 중..." : draft ? "🔄 다시 생성" : "✨ AI 초안 생성"}
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 36, animation: "spin 1s linear infinite" }}>⏳</div>
              <p style={{ color: "#666", fontSize: 13, marginTop: 12 }}>영역별로 분석하여 초안을 작성하고 있습니다...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {draft && !loading && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>📝 {selectedStudent.name} 종합의견 초안</h3>
                <span style={{ fontSize: 11, color: "#999" }}>{editDraft.length}자</span>
              </div>
              <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)}
                style={{ ...inputStyle, height: 250, resize: "vertical", fontSize: 14, lineHeight: 1.8 }} />
              <button onClick={() => { setAiDrafts(prev => ({ ...prev, [selectedStudent.id]: editDraft })); }}
                style={{ marginTop: 10, padding: "10px 24px", borderRadius: 10, border: "none", background: "#10B981", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                💾 수정 내용 저장
              </button>
            </div>
          )}

          {!draft && !loading && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>📊 {selectedStudent.name} 기록 현황</h3>
              {CATEGORIES.map(c => {
                const count = observations.filter(o => o.targetId === selectedStudent.id && o.category === c.id).length;
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, width: 90 }}>{c.icon} {c.label}</span>
                    <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 16, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(count * 20, 100)}%`, height: "100%", background: c.color, borderRadius: 6 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: count < 2 ? "#DC2626" : "#333" }}>{count}건</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ==================== SHARED COMPONENTS ==================== */
function ObsCard({ obs, showAuthor, canDelete, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === obs.category);
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${cat?.color || "#ccc"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: cat?.color }}>{cat?.icon} {cat?.label}</span>
          <span style={{ fontSize: 11, color: "#999" }}>{obs.date}</span>
        </div>
        {canDelete && <button onClick={onDelete} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>🗑</button>}
      </div>
      <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.6 }}>
        <strong style={{ color: "#1a1a2e" }}>{obs.targetName}</strong> — {obs.content}
      </p>
      {showAuthor && (
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: obs.authorType === "teacher" ? "#DCFCE7" : "#FEF3C7", color: obs.authorType === "teacher" ? "#166534" : "#92400E", fontWeight: 600 }}>
            {obs.authorType === "teacher" ? "교사" : `학생: ${obs.authorName}`}
          </span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

const sectionTitle = { fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 16px", letterSpacing: -0.5 };
const labelStyle = { display: "block", fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 8, marginTop: 16 };
const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: "#fff" };
const backBtnStyle2 = { background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12, fontFamily: "inherit" };

export default App;
