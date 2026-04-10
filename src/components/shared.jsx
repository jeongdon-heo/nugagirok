import { useState } from "react";
import { CATEGORIES } from "../constants";

export function ObsCard({ obs, showAuthor, canDelete, onDelete, canEdit, onSave }) {
  const cat = CATEGORIES.find((c) => c.id === obs.category) || { icon: "📝", label: "미분류", color: "#9CA3AF" };
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(obs.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editContent.trim() || saving) return;
    setSaving(true);
    await onSave(obs.id, editContent.trim());
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: `4px solid ${cat?.color || "#ccc"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: cat?.color }}>{cat?.icon} {cat?.label}</span>
          <span style={{ fontSize: 11, color: "#999" }}>{obs.date}</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {canEdit && !editing && (
            <button onClick={() => { setEditing(true); setEditContent(obs.content); }}
              style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✏️</button>
          )}
          {canDelete && !editing && (
            <button onClick={onDelete}
              style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>🗑</button>
          )}
        </div>
      </div>

      {editing ? (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>
            <strong style={{ color: "#1a1a2e" }}>{obs.targetName}</strong> —
          </p>
          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #6366F1", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", height: 80, outline: "none" }}
            maxLength={500} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving || !editContent.trim()}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: "#6366F1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
              {saving ? "저장 중..." : "저장"}
            </button>
            <button onClick={() => { setEditing(false); setEditContent(obs.content); }}
              style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.6 }}>
          <strong style={{ color: "#1a1a2e" }}>{obs.targetName}</strong> — {obs.content}
        </p>
      )}

      {showAuthor && !editing && (
        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: obs.authorType === "teacher" ? "#DCFCE7" : "#FEF3C7", color: obs.authorType === "teacher" ? "#166534" : "#92400E", fontWeight: 600 }}>
            {obs.authorType === "teacher" ? "교사" : `학생: ${obs.authorName}`}
          </span>
        </div>
      )}
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function ActionCard({ icon, label, desc, onClick, bg }) {
  return (
    <button onClick={onClick}
      style={{ background: bg, border: "none", borderRadius: 14, padding: 20, textAlign: "left", cursor: "pointer", fontFamily: "inherit", transition: "transform .15s" }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{label}</div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{desc}</div>
    </button>
  );
}

export function Toast({ message, type }) {
  const bg = type === "error" ? "#FEE2E2" : type === "success" ? "#DCFCE7" : "#EEF2FF";
  const color = type === "error" ? "#DC2626" : type === "success" ? "#166534" : "#3730A3";
  return (
    <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: bg, color, padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "fadeIn .2s" }}>
      {message}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
