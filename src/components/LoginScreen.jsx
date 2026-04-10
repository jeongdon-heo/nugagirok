import { useState } from "react";
import { supabase } from "../lib/supabase";
import { DEFAULT_STUDENTS } from "../constants";

const btnStyle = (bg, color, outline) => ({
  padding: "16px 24px", borderRadius: 14,
  border: outline ? "2px solid #E8D5B7" : "none",
  background: bg, color, fontSize: 16, fontWeight: 700,
  cursor: "pointer", transition: "all .2s", fontFamily: "inherit",
});
const backBtn = {
  background: "none", border: "none", color: "#667", fontSize: 14,
  cursor: "pointer", display: "block", margin: "16px auto 0", fontFamily: "inherit",
};
const fieldStyle = {
  width: "100%", padding: "14px 16px", borderRadius: 12,
  border: "1px solid #2a3a5e", background: "rgba(255,255,255,0.05)",
  color: "#E8D5B7", fontSize: 15, fontFamily: "inherit",
  boxSizing: "border-box", marginBottom: 10, outline: "none",
};

export default function LoginScreen({ handleTeacherLogin, handleClassCreated, handleStudentLogin }) {
  const [mode, setMode] = useState(null);

  /* 교사 인증 */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [needsClass, setNeedsClass] = useState(false);
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(new Date().getMonth() < 7 ? 1 : 2);
  const [classCreating, setClassCreating] = useState(false);

  /* 학생 입장 */
  const [classCode, setClassCode] = useState("");
  const [foundClass, setFoundClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const doTeacherAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const fn = isSignUp
        ? supabase.auth.signUp.bind(supabase.auth)
        : supabase.auth.signInWithPassword.bind(supabase.auth);
      const { data, error } = await fn({ email, password });

      if (error) { setAuthError(error.message); setAuthLoading(false); return; }

      if (isSignUp && !data.session) {
        setAuthError("인증 이메일을 확인한 후 다시 로그인해주세요.");
        setAuthLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) { setAuthError("로그인에 실패했습니다."); setAuthLoading(false); return; }

      const hasClass = await handleTeacherLogin(userId);
      if (!hasClass) setNeedsClass(true);
    } catch {
      setAuthError("오류가 발생했습니다.");
    }
    setAuthLoading(false);
  };

  const doCreateClass = async () => {
    if (!className.trim()) return;
    setClassCreating(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: { session } } = await supabase.auth.getSession();

    const { data: cls, error } = await supabase.from("classes").insert({
      name: className.trim(), code, teacher_id: session.user.id,
      academic_year: academicYear, semester,
    }).select().single();

    if (error) { setAuthError("학급 생성 실패: " + error.message); setClassCreating(false); return; }

    const rows = DEFAULT_STUDENTS.map((s) => ({ class_id: cls.id, name: s.name, num: s.num }));
    await supabase.from("students").insert(rows);

    await handleClassCreated(cls);
    setClassCreating(false);
  };

  const findClass = async () => {
    if (!classCode.trim()) return;
    setCodeError("");
    setCodeLoading(true);
    const { data: cls } = await supabase
      .from("classes").select("*").eq("code", classCode.trim().toUpperCase()).single();
    if (!cls) { setCodeError("학급 코드를 찾을 수 없습니다."); setCodeLoading(false); return; }

    const { data: sts } = await supabase
      .from("students").select("*").eq("class_id", cls.id).order("num");
    setFoundClass(cls);
    setClassStudents(sts || []);
    setCodeLoading(false);
  };

  const enterAsStudent = () => {
    const student = classStudents.find((s) => s.id === selected);
    if (!student || !foundClass) return;
    localStorage.setItem("nuga_student_session", JSON.stringify({ classId: foundClass.id, student }));
    handleStudentLogin(foundClass, student);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pretendard Variable', 'Noto Sans KR', sans-serif" }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.min.css" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
          <h1 style={{ color: "#E8D5B7", fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -1 }}>누가기록장</h1>
          <p style={{ color: "#8899AA", fontSize: 14, marginTop: 8 }}>학교생활 관찰 · 기록 · 종합의견</p>
        </div>

        {/* 역할 선택 */}
        {!mode && !needsClass && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => setMode("teacher")} style={btnStyle("#E8D5B7", "#1a1a2e")}>
              🧑‍🏫 교사로 입장
            </button>
            <button onClick={() => setMode("student")} style={btnStyle("transparent", "#E8D5B7", true)}>
              🧑‍🎓 학생으로 입장
            </button>
          </div>
        )}

        {/* 교사 로그인 */}
        {mode === "teacher" && !needsClass && (
          <div>
            <input type="email" placeholder="이메일" value={email}
              onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
            <input type="password" placeholder="비밀번호 (6자 이상)" value={password}
              onChange={(e) => setPassword(e.target.value)} style={fieldStyle}
              onKeyDown={(e) => e.key === "Enter" && doTeacherAuth()} />
            {authError && <p style={{ color: "#F87171", fontSize: 13, margin: "0 0 10px" }}>{authError}</p>}
            <button onClick={doTeacherAuth} disabled={authLoading}
              style={{ ...btnStyle("#E8D5B7", "#1a1a2e"), width: "100%", opacity: authLoading ? 0.6 : 1 }}>
              {authLoading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
            </button>
            <button onClick={() => setIsSignUp(!isSignUp)}
              style={{ ...backBtn, color: "#8899AA" }}>
              {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
            </button>
            <button onClick={() => { setMode(null); setAuthError(""); }} style={backBtn}>← 뒤로</button>
          </div>
        )}

        {/* 학급 생성 */}
        {needsClass && (
          <div>
            <p style={{ color: "#E8D5B7", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              학급을 생성해주세요
            </p>
            <input type="text" placeholder="학급 이름 (예: 4학년 2반)" value={className}
              onChange={(e) => setClassName(e.target.value)} style={fieldStyle} />
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <select value={academicYear} onChange={(e) => setAcademicYear(Number(e.target.value))}
                style={{ ...fieldStyle, flex: 1, marginBottom: 0 }}>
                {[academicYear - 1, academicYear, academicYear + 1].map((y) => (
                  <option key={y} value={y} style={{ color: "#333" }}>{y}년</option>
                ))}
              </select>
              <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}
                style={{ ...fieldStyle, flex: 1, marginBottom: 0 }}>
                <option value={1} style={{ color: "#333" }}>1학기</option>
                <option value={2} style={{ color: "#333" }}>2학기</option>
              </select>
            </div>
            {authError && <p style={{ color: "#F87171", fontSize: 13, margin: "0 0 10px" }}>{authError}</p>}
            <button onClick={doCreateClass} disabled={classCreating}
              style={{ ...btnStyle("#E8D5B7", "#1a1a2e"), width: "100%" }}>
              {classCreating ? "생성 중..." : "학급 생성 및 입장"}
            </button>
            <p style={{ color: "#8899AA", fontSize: 12, marginTop: 12, textAlign: "center" }}>
              기본 학생 20명이 자동으로 등록됩니다.
            </p>
          </div>
        )}

        {/* 학생: 학급코드 입력 */}
        {mode === "student" && !foundClass && (
          <div>
            <p style={{ color: "#8899AA", fontSize: 13, marginBottom: 12, textAlign: "center" }}>
              선생님이 알려준 학급 코드를 입력하세요
            </p>
            <input type="text" placeholder="학급 코드 (예: ABC123)" value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              style={{ ...fieldStyle, textAlign: "center", letterSpacing: 4, fontSize: 20 }}
              onKeyDown={(e) => e.key === "Enter" && findClass()} />
            {codeError && <p style={{ color: "#F87171", fontSize: 13, margin: "0 0 10px", textAlign: "center" }}>{codeError}</p>}
            <button onClick={findClass} disabled={codeLoading}
              style={{ ...btnStyle("#E8D5B7", "#1a1a2e"), width: "100%", opacity: codeLoading ? 0.6 : 1 }}>
              {codeLoading ? "검색 중..." : "학급 찾기"}
            </button>
            <button onClick={() => { setMode(null); setCodeError(""); }} style={backBtn}>← 뒤로</button>
          </div>
        )}

        {/* 학생: 이름 선택 */}
        {mode === "student" && foundClass && (
          <div>
            <p style={{ color: "#E8D5B7", fontSize: 15, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
              {foundClass.name}
            </p>
            <p style={{ color: "#8899AA", fontSize: 13, marginBottom: 12, textAlign: "center" }}>이름을 선택하세요</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {classStudents.map((s) => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  style={{
                    padding: "10px 4px", borderRadius: 10,
                    border: selected === s.id ? "2px solid #E8D5B7" : "2px solid #2a3a5e",
                    background: selected === s.id ? "#2a3a5e" : "transparent",
                    color: "#E8D5B7", fontSize: 13, fontWeight: 600,
                    cursor: "pointer", transition: "all .2s",
                  }}>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>{s.num}</span><br />{s.name}
                </button>
              ))}
            </div>
            {selected && (
              <button onClick={enterAsStudent}
                style={{ ...btnStyle("#E8D5B7", "#1a1a2e"), width: "100%", marginTop: 16 }}>
                입장하기
              </button>
            )}
            <button onClick={() => { setFoundClass(null); setClassStudents([]); setSelected(null); }}
              style={backBtn}>← 뒤로</button>
          </div>
        )}
      </div>
    </div>
  );
}
