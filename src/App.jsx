import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import LoginScreen from "./components/LoginScreen";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import TeacherHome from "./components/TeacherHome";
import TeacherWrite from "./components/TeacherWrite";
import StudentWrite from "./components/StudentWrite";
import StudentHome from "./components/StudentHome";
import StudentList from "./components/StudentList";
import Timeline from "./components/Timeline";
import Stats from "./components/Stats";
import MissionManager from "./components/MissionManager";
import AIDraft from "./components/AIDraft";
import MyRecords from "./components/MyRecords";
import { Toast } from "./components/shared";

function transformObs(row) {
  return {
    id: row.id,
    targetId: row.target_id,
    targetName: row.target_name,
    category: row.category,
    content: row.content,
    date: row.date,
    authorType: row.author_type,
    authorName: row.author_name,
    authorStudentId: row.author_student_id,
  };
}

function transformMission(row) {
  return { id: row.id, text: row.text, cat: row.category, active: row.active };
}

export default function App() {
  const [role, setRole] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [observations, setObservations] = useState([]);
  const [missions, setMissions] = useState([]);
  const [aiDrafts, setAiDrafts] = useState({});
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ─── 초기 세션 확인 ─── */
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleTeacherLogin(session.user.id);
        } else {
          try {
            const saved = JSON.parse(localStorage.getItem("nuga_student_session"));
            if (saved?.classId && saved?.student) {
              const { data: cls } = await supabase
                .from("classes").select("*").eq("id", saved.classId).single();
              if (cls) {
                setCurrentClass(cls);
                setCurrentStudent(saved.student);
                setRole("student");
                await loadClassData(cls.id);
              }
            }
          } catch { /* 세션 없음 */ }
        }
      } catch {
        showToast("error", "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          setRole(null);
          setCurrentClass(null);
          setStudents([]);
          setObservations([]);
          setMissions([]);
          setAiDrafts({});
          setPage("home");
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  /* ─── 데이터 로딩 ─── */
  const handleTeacherLogin = async (userId) => {
    const { data: classes, error } = await supabase
      .from("classes").select("*").eq("teacher_id", userId);
    if (error) { showToast("error", "학급 정보를 불러올 수 없습니다."); return false; }
    if (classes?.length > 0) {
      setCurrentClass(classes[0]);
      setRole("teacher");
      await loadClassData(classes[0].id);
      return true;
    }
    return false;
  };

  const handleClassCreated = async (cls) => {
    setCurrentClass(cls);
    setRole("teacher");
    await loadClassData(cls.id);
  };

  const handleStudentLogin = async (cls, student) => {
    setCurrentClass(cls);
    setCurrentStudent(student);
    setRole("student");
    await loadClassData(cls.id);
  };

  const loadClassData = async (classId) => {
    try {
      const [sRes, oRes, mRes, dRes] = await Promise.all([
        supabase.from("students").select("*").eq("class_id", classId).order("num"),
        supabase.from("observations").select("*").eq("class_id", classId),
        supabase.from("missions").select("*").eq("class_id", classId),
        supabase.from("drafts").select("*").eq("class_id", classId),
      ]);
      if (sRes.error || oRes.error) throw new Error("데이터 로딩 실패");
      setStudents(sRes.data || []);
      setObservations((oRes.data || []).map(transformObs));
      setMissions((mRes.data || []).map(transformMission));
      const dm = {};
      (dRes.data || []).forEach((d) => { dm[d.student_id] = d.content; });
      setAiDrafts(dm);
    } catch {
      showToast("error", "데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  /* ─── 학생 관리 ─── */
  const updateStudent = async (id, name, num) => {
    const { error } = await supabase.from("students")
      .update({ name, num }).eq("id", id);
    if (error) { showToast("error", "학생 정보 수정에 실패했습니다."); return { error }; }
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, name, num } : s));
    showToast("success", "학생 정보가 수정되었습니다.");
    return {};
  };

  const addStudent = async (name, num) => {
    const { data, error } = await supabase.from("students").insert({
      class_id: currentClass.id, name, num,
    }).select();
    if (error) { showToast("error", "학생 추가에 실패했습니다."); return { error }; }
    setStudents((prev) => [...prev, data[0]].sort((a, b) => a.num - b.num));
    showToast("success", `${name} 학생이 추가되었습니다.`);
    return {};
  };

  const deleteStudent = async (id) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) { showToast("error", "학생 삭제에 실패했습니다."); return { error }; }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    return {};
  };

  /* ─── 관찰 기록 CRUD ─── */
  const addObservation = async (obs) => {
    const { data, error } = await supabase.from("observations").insert({
      class_id: currentClass.id,
      target_id: obs.targetId,
      target_name: obs.targetName,
      category: obs.category,
      content: obs.content,
      date: obs.date,
      author_type: obs.authorType,
      author_name: obs.authorName,
      author_student_id: obs.authorStudentId || null,
    }).select();
    if (error) {
      showToast("error", "기록 저장에 실패했습니다.");
      return { error };
    }
    setObservations((prev) => [...prev, transformObs(data[0])]);
    return { data };
  };

  const updateObservation = async (id, newContent) => {
    const { error } = await supabase.from("observations")
      .update({ content: newContent }).eq("id", id);
    if (error) {
      showToast("error", "기록 수정에 실패했습니다.");
      return { error };
    }
    setObservations((prev) =>
      prev.map((o) => o.id === id ? { ...o, content: newContent } : o)
    );
    showToast("success", "기록이 수정되었습니다.");
    return {};
  };

  const deleteObservation = async (id) => {
    const { error } = await supabase.from("observations").delete().eq("id", id);
    if (error) {
      showToast("error", "기록 삭제에 실패했습니다.");
      return;
    }
    setObservations((prev) => prev.filter((o) => o.id !== id));
  };

  /* ─── 미션 CRUD ─── */
  const addMission = async (text, cat) => {
    const { data, error } = await supabase.from("missions").insert({
      class_id: currentClass.id, text, category: cat, active: true,
    }).select();
    if (error) { showToast("error", "미션 추가에 실패했습니다."); return; }
    setMissions((prev) => [...prev, transformMission(data[0])]);
  };

  const toggleMission = async (id) => {
    const m = missions.find((x) => x.id === id);
    if (!m) return;
    const { error } = await supabase.from("missions").update({ active: !m.active }).eq("id", id);
    if (error) { showToast("error", "미션 변경에 실패했습니다."); return; }
    setMissions((prev) => prev.map((x) => x.id === id ? { ...x, active: !x.active } : x));
  };

  const removeMission = async (id) => {
    const { error } = await supabase.from("missions").delete().eq("id", id);
    if (error) { showToast("error", "미션 삭제에 실패했습니다."); return; }
    setMissions((prev) => prev.filter((x) => x.id !== id));
  };

  /* ─── AI 초안 저장 ─── */
  const saveDraft = async (studentId, content) => {
    const { error } = await supabase.from("drafts").upsert({
      class_id: currentClass.id,
      student_id: studentId,
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: "class_id,student_id" });
    if (error) { showToast("error", "초안 저장에 실패했습니다."); return { error }; }
    setAiDrafts((prev) => ({ ...prev, [studentId]: content }));
    return {};
  };

  /* ─── 로그아웃 ─── */
  const handleLogout = async () => {
    if (role === "teacher") {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("nuga_student_session");
    }
    setRole(null);
    setCurrentStudent(null);
    setCurrentClass(null);
    setStudents([]);
    setObservations([]);
    setMissions([]);
    setAiDrafts({});
    setPage("home");
  };

  /* ─── 렌더링 ─── */
  if (!isSupabaseConfigured) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
        <div style={{ textAlign: "center", padding: 32, maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h1 style={{ color: "#E8D5B7", fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>누가기록장</h1>
          <p style={{ color: "#8899AA", fontSize: 14, margin: "0 0 24px" }}>학교생활 관찰 · 기록 · 종합의견</p>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 24, textAlign: "left" }}>
            <p style={{ color: "#F87171", fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>Supabase 설정이 필요합니다</p>
            <p style={{ color: "#8899AA", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              Vercel 대시보드에서 환경변수를 설정해주세요:<br /><br />
              <code style={{ background: "#2a3a5e", padding: "2px 8px", borderRadius: 4, color: "#E8D5B7" }}>VITE_SUPABASE_URL</code><br />
              <code style={{ background: "#2a3a5e", padding: "2px 8px", borderRadius: 4, color: "#E8D5B7" }}>VITE_SUPABASE_ANON_KEY</code><br /><br />
              설정 후 Vercel에서 재배포(Redeploy)하세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F6F1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
        <p style={{ color: "#888", fontSize: 14 }}>로딩 중...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <LoginScreen
        handleTeacherLogin={handleTeacherLogin}
        handleClassCreated={handleClassCreated}
        handleStudentLogin={handleStudentLogin}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F1", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
      {toast && <Toast type={toast.type} message={toast.message} />}
      <Header role={role} currentStudent={currentStudent} currentClass={currentClass} page={page} setPage={setPage} onLogout={handleLogout} />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 100px" }}>
        {role === "teacher" && page === "home" && (
          <TeacherHome observations={observations} currentClass={currentClass} setPage={setPage} />
        )}
        {role === "teacher" && page === "write" && (
          <TeacherWrite students={students} addObservation={addObservation} />
        )}
        {role === "teacher" && page === "students" && (
          <StudentList students={students} observations={observations} updateObservation={updateObservation} updateStudent={updateStudent} addStudent={addStudent} deleteStudent={deleteStudent} />
        )}
        {role === "teacher" && page === "timeline" && (
          <Timeline students={students} observations={observations} role={role} deleteObservation={deleteObservation} updateObservation={updateObservation} />
        )}
        {role === "teacher" && page === "stats" && (
          <Stats students={students} observations={observations} />
        )}
        {role === "teacher" && page === "mission" && (
          <MissionManager missions={missions} addMission={addMission} toggleMission={toggleMission} removeMission={removeMission} />
        )}
        {role === "teacher" && page === "ai" && (
          <AIDraft students={students} observations={observations} aiDrafts={aiDrafts} saveDraft={saveDraft} />
        )}
        {role === "student" && page === "home" && (
          <StudentHome currentStudent={currentStudent} observations={observations} missions={missions} setPage={setPage} />
        )}
        {role === "student" && page === "write" && (
          <StudentWrite students={students} currentStudent={currentStudent} addObservation={addObservation} missions={missions} />
        )}
        {role === "student" && page === "myrecords" && (
          <MyRecords currentStudent={currentStudent} observations={observations} deleteObservation={deleteObservation} />
        )}
      </main>
      <BottomNav role={role} page={page} setPage={setPage} />
    </div>
  );
}
