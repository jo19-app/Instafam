import { useState, useEffect, useRef, useCallback } from "react";

// ── Palette & helpers ─────────────────────────────────────────────────────────
const PALETTE = {
  bg: "#FFF8F2",
  card: "#FFFFFF",
  primary: "#E8603C",
  primaryLight: "#F4956F",
  accent: "#F7C59F",
  accentDark: "#C94C1E",
  text: "#1A1208",
  muted: "#8A7568",
  border: "#F0E6DC",
  story1: "#F7C59F",
  story2: "#E8603C",
};

const SAMPLE_AVATARS = [
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Felix&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Aneka&backgroundColor=d1f4e0",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Charlie&backgroundColor=dbeafe",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Dana&backgroundColor=fef9c3",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=Eli&backgroundColor=ede9fe",
];

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80",
  "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=600&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function timeAgo(ts) {
  const d = (Date.now() - ts) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// ── Save image to device ──────────────────────────────────────────────────────
async function saveImageToDevice(src, filename = "instafam-photo.jpg") {
  try {
    // For base64 data URIs (user-uploaded photos) — highest quality, no re-encoding
    if (src.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = src;
      a.download = filename;
      a.click();
      return { ok: true };
    }

    // For external URLs — fetch as blob to preserve original quality
    // Strip any low-quality query params and request full resolution
    let fullQualityUrl = src;
    if (src.includes("unsplash.com")) {
      // Replace w= and q= params with maximum quality
      fullQualityUrl = src.replace(/[?&]w=\d+/, "").replace(/[?&]q=\d+/, "");
      fullQualityUrl = fullQualityUrl.includes("?")
        ? fullQualityUrl + "&q=100&fm=jpg&fit=max"
        : fullQualityUrl + "?q=100&fm=jpg&fit=max";
    }

    const response = await fetch(fullQualityUrl);
    if (!response.ok) throw new Error("Fetch failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return { ok: true };
  } catch (err) {
    // Fallback: open full image in new tab so user can long-press / right-click save
    window.open(src, "_blank");
    return { ok: false, fallback: true };
  }
}

// ── Default seed data ────────────────────────────────────────────────────────
function seedData(myId, myName) {
  const members = [
    { id: myId, name: myName, avatar: SAMPLE_AVATARS[0] },
    { id: "u2", name: "Mom", avatar: SAMPLE_AVATARS[1] },
    { id: "u3", name: "Dad", avatar: SAMPLE_AVATARS[2] },
    { id: "u4", name: "Sibling", avatar: SAMPLE_AVATARS[3] },
  ];
  const groupId = uid();
  const posts = [
    {
      id: uid(),
      groupId,
      authorId: "u2",
      image: SAMPLE_PHOTOS[0],
      caption: "Beautiful sunset from the back garden 🌅",
      likes: ["u3", "u4"],
      comments: [
        { id: uid(), authorId: "u3", text: "Gorgeous! 😍", ts: Date.now() - 7200000 },
      ],
      ts: Date.now() - 14400000,
    },
    {
      id: uid(),
      groupId,
      authorId: "u4",
      image: SAMPLE_PHOTOS[3],
      caption: "Family game night 🎲 Who's ready for a rematch?",
      likes: [myId, "u2"],
      comments: [
        { id: uid(), authorId: myId, text: "I want a rematch! 😂", ts: Date.now() - 3600000 },
        { id: uid(), authorId: "u2", text: "Count me in!", ts: Date.now() - 1800000 },
      ],
      ts: Date.now() - 86400000,
    },
  ];
  const stories = [
    { id: uid(), groupId, authorId: "u3", image: SAMPLE_PHOTOS[4], ts: Date.now() - 3600000, viewers: [] },
    { id: uid(), groupId, authorId: "u2", image: SAMPLE_PHOTOS[5], ts: Date.now() - 7200000, viewers: [] },
  ];
  return {
    groups: [{ id: groupId, name: "Family ❤️", emoji: "❤️", members: members.map(m => m.id), inviteCode: uid(), createdBy: myId }],
    members,
    posts,
    stories,
  };
}

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: "'Nunito', sans-serif",
    background: PALETTE.bg,
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative",
    overflowX: "hidden",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255,248,242,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: `1.5px solid ${PALETTE.border}`,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "'Pacifico', cursive",
    fontSize: 26,
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accentDark})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: -0.5,
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    background: "rgba(255,248,242,0.96)",
    backdropFilter: "blur(16px)",
    borderTop: `1.5px solid ${PALETTE.border}`,
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0 env(safe-area-inset-bottom, 10px)",
    zIndex: 100,
  },
  navBtn: (active) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    color: active ? PALETTE.primary : PALETTE.muted,
    fontSize: 10,
    fontWeight: active ? 700 : 500,
    transition: "all 0.2s",
    padding: "4px 12px",
  }),
  btn: {
    background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accentDark})`,
    color: "#fff",
    border: "none",
    borderRadius: 24,
    padding: "10px 22px",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  btnGhost: {
    background: "transparent",
    color: PALETTE.primary,
    border: `2px solid ${PALETTE.primary}`,
    borderRadius: 24,
    padding: "8px 20px",
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    border: `1.5px solid ${PALETTE.border}`,
    borderRadius: 14,
    padding: "12px 16px",
    fontFamily: "'Nunito', sans-serif",
    fontSize: 15,
    background: PALETTE.card,
    outline: "none",
    boxSizing: "border-box",
    color: PALETTE.text,
  },
  card: {
    background: PALETTE.card,
    borderRadius: 20,
    boxShadow: "0 2px 12px rgba(232,96,60,0.07)",
    overflow: "hidden",
    marginBottom: 16,
  },
  avatar: (size = 36) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  }),
  tag: {
    background: PALETTE.accent,
    color: PALETTE.accentDark,
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
};

// ── Icon components ───────────────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = "currentColor", filled = false }) => {
  const icons = {
    home: filled
      ? <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={color}/>
      : <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    search: <><circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    plus: <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    heart: filled
      ? <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color}/>
      : <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>,
    comment: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="9" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    profile: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="none" stroke={color} strokeWidth="2"/><circle cx="12" cy="7" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    back: <><polyline points="15 18 9 12 15 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" fill="none" stroke={color} strokeWidth="2"/></>,
    check: <><polyline points="20 6 9 17 4 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke={color} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="2"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    trash: <><polyline points="3 6 5 6 21 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }}>
      {icons[name] || null}
    </svg>
  );
};

// ── Story Ring ────────────────────────────────────────────────────────────────
function StoryRing({ image, avatar, name, onClick, seen = false, isOwn = false }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "4px 6px", minWidth: 64 }}>
      <div style={{ padding: 2.5, borderRadius: "50%", background: seen ? PALETTE.border : `linear-gradient(135deg, ${PALETTE.story2}, ${PALETTE.story1})` }}>
        <div style={{ padding: 2, borderRadius: "50%", background: PALETTE.bg }}>
          <img src={image || avatar} style={{ ...S.avatar(52), display: "block" }} alt={name} onError={e => e.target.src = avatar} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.text, maxWidth: 60, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isOwn ? "Your story" : name}</span>
    </button>
  );
}

// ── Story Viewer ──────────────────────────────────────────────────────────────
function StoryViewer({ story, author, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [story]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "#000", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.3)", zIndex: 1 }}>
        <div style={{ height: "100%", background: "#fff", animation: "storyProgress 5s linear forwards" }} />
      </div>
      <style>{`@keyframes storyProgress { from { width: 0% } to { width: 100% } }`}</style>
      <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={author?.avatar} style={S.avatar(36)} alt={author?.name} />
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{author?.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{timeAgo(story.ts)}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff" }}>
          <Icon name="close" color="#fff" size={26} />
        </button>
      </div>
      <img src={story.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="story" />
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, members, myId, onLike, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | fallback
  const author = members.find(m => m.id === post.authorId);
  const liked = post.likes.includes(myId);

  function submit() {
    if (!commentText.trim()) return;
    onComment(post.id, commentText.trim());
    setCommentText("");
  }

  async function handleSave() {
    if (saveState === "saving") return;
    setSaveState("saving");
    const authorName = author?.name?.replace(/\s+/g, "-").toLowerCase() || "photo";
    const filename = `instafam-${authorName}-${post.id}.jpg`;
    const result = await saveImageToDevice(post.image, filename);
    setSaveState(result.fallback ? "fallback" : "saved");
    setTimeout(() => setSaveState("idle"), 3000);
  }

  const saveLabel = { idle: null, saving: "Saving…", saved: "Saved ✓", fallback: "Opened ↗" }[saveState];
  const saveColor = saveState === "saved" ? "#2e7d32" : saveState === "fallback" ? PALETTE.muted : PALETTE.muted;

  return (
    <div style={S.card}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <img src={author?.avatar} style={S.avatar(38)} alt={author?.name} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: PALETTE.text }}>{author?.name}</div>
          <div style={{ fontSize: 11, color: PALETTE.muted }}>{timeAgo(post.ts)}</div>
        </div>
      </div>

      {/* Image */}
      <img src={post.image} style={{ width: "100%", display: "block", maxHeight: 420, objectFit: "cover" }} alt="post" />

      {/* Actions */}
      <div style={{ padding: "10px 16px 4px" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 8, alignItems: "center" }}>
          {/* Like */}
          <button onClick={() => onLike(post.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: liked ? PALETTE.primary : PALETTE.muted, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, transition: "transform 0.15s" }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(1.3)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={e => e.currentTarget.style.transform = "scale(1.3)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}>
            <Icon name="heart" filled={liked} color={liked ? PALETTE.primary : PALETTE.muted} size={22} />
            {post.likes.length}
          </button>

          {/* Comment */}
          <button onClick={() => setShowComments(!showComments)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: PALETTE.muted, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14 }}>
            <Icon name="comment" color={PALETTE.muted} size={22} />
            {post.comments.length}
          </button>

          {/* Save / Download — pushed to the right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {saveLabel && (
              <span style={{ fontSize: 11, fontWeight: 700, color: saveColor, transition: "opacity 0.3s" }}>
                {saveLabel}
              </span>
            )}
            <button
              onClick={handleSave}
              title="Save photo to device"
              style={{
                background: saveState === "saved" ? "#e8f5e9" : saveState === "saving" ? PALETTE.bg : "none",
                border: "none",
                cursor: saveState === "saving" ? "default" : "pointer",
                padding: 4,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s",
              }}
            >
              <Icon
                name="download"
                color={saveState === "saved" ? "#2e7d32" : PALETTE.muted}
                size={22}
              />
            </button>
          </div>
        </div>

        {post.caption && <p style={{ margin: "0 0 8px", fontSize: 14, color: PALETTE.text, lineHeight: 1.5 }}><strong>{author?.name}</strong> {post.caption}</p>}

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 8 }}>
            {post.comments.map(c => {
              const ca = members.find(m => m.id === c.authorId);
              return (
                <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <img src={ca?.avatar} style={S.avatar(26)} alt={ca?.name} />
                  <div style={{ background: PALETTE.bg, borderRadius: 12, padding: "6px 12px", flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{ca?.name} </span>
                    <span style={{ fontSize: 13, color: PALETTE.text }}>{c.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Comment input */}
        <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 4, alignItems: "center" }}>
          <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Add a comment…"
            style={{ ...S.input, padding: "8px 14px", fontSize: 13, flex: 1 }} />
          <button onClick={submit} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.primary }}>
            <Icon name="send" color={PALETTE.primary} size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onPost, onStory, myId, groupId }) {
  const [tab, setTab] = useState("post");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const fileRef = useRef();
  const cameraRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    // Check we actually got a file (permission granted implicitly by picker)
    setPermissionDenied(false);
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setImage(ev.target.result); };
    reader.onerror = () => setPermissionDenied(true);
    reader.readAsDataURL(f);
  }

  function openPhotoLibrary() {
    // Reset so onChange fires even if same file re-selected
    if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); }
  }

  function openCamera() {
    if (cameraRef.current) { cameraRef.current.value = ""; cameraRef.current.click(); }
  }

  function pickSample() {
    const url = SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)];
    setPreview(url); setImage(url);
  }

  function submit() {
    if (!image) return;
    if (tab === "post") onPost({ id: uid(), groupId, authorId: myId, image, caption, likes: [], comments: [], ts: Date.now() });
    else onStory({ id: uid(), groupId, authorId: myId, image, ts: Date.now(), viewers: [] });
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: PALETTE.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: 24, paddingBottom: "env(safe-area-inset-bottom, 24px)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "'Pacifico', cursive", color: PALETTE.primary, fontSize: 22 }}>New {tab}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><Icon name="close" color={PALETTE.muted} /></button>
        </div>

        {/* Tab */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["post", "story"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...tab === t ? S.btn : S.btnGhost, flex: 1, padding: "8px 0", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {/* Hidden file inputs */}
        {/* Photo library – no capture attr so it opens the gallery */}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        {/* Camera – capture="environment" opens camera directly */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: "none" }} />

        {/* Image preview or picker buttons */}
        {preview ? (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <img src={preview} style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 320, display: "block" }} alt="preview" />
            <button onClick={() => { setPreview(null); setImage(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="close" color="#fff" size={16} />
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            {/* Primary: choose from photo library */}
            <button onClick={openPhotoLibrary}
              style={{ width: "100%", border: `2px dashed ${PALETTE.primary}`, borderRadius: 16, padding: "28px 16px", textAlign: "center", marginBottom: 10, cursor: "pointer", background: `${PALETTE.primary}08`, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Icon name="camera" color={PALETTE.primary} size={32} />
              <span style={{ fontWeight: 700, fontSize: 15, color: PALETTE.primary }}>Choose from Photo Library</span>
              <span style={{ fontSize: 12, color: PALETTE.muted }}>Your photos will only be uploaded to this group</span>
            </button>

            {/* Secondary row: camera + sample */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={openCamera} style={{ ...S.btnGhost, flex: 1, fontSize: 13, padding: "10px 0" }}>📷 Take Photo</button>
              <button onClick={pickSample} style={{ ...S.btnGhost, flex: 1, fontSize: 13, padding: "10px 0" }}>🖼 Sample Photo</button>
            </div>
          </div>
        )}

        {permissionDenied && (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#856404" }}>
            ⚠️ Couldn't read that file. Please allow photo access in your browser/phone settings and try again.
          </div>
        )}

        {tab === "post" && (
          <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption…" style={{ ...S.input, minHeight: 80, resize: "none", marginBottom: 16 }} />
        )}

        <button onClick={submit} disabled={!image} style={{ ...S.btn, width: "100%", opacity: image ? 1 : 0.5 }}>Share {tab}</button>
      </div>
    </div>
  );
}

// ── Groups Screen ─────────────────────────────────────────────────────────────
function GroupsScreen({ groups, members, myId, onSelectGroup, onCreateGroup, onRenameGroup, onDeleteGroup }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  // Per-group editing state: { [groupId]: { mode: 'rename'|'confirmDelete', renameVal: string } }
  const [editState, setEditState] = useState({});

  function create() {
    if (!newName.trim()) return;
    onCreateGroup(newName.trim());
    setNewName("");
    setCreating(false);
  }

  function copyLink(group) {
    const link = `${window.location.origin}${window.location.pathname}?join=${group.inviteCode}&group=${encodeURIComponent(group.name)}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiedId(group.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function startRename(g) {
    setEditState(s => ({ ...s, [g.id]: { mode: "rename", renameVal: g.name } }));
  }

  function cancelEdit(gId) {
    setEditState(s => { const n = { ...s }; delete n[gId]; return n; });
  }

  function submitRename(g) {
    const val = editState[g.id]?.renameVal?.trim();
    if (val) onRenameGroup(g.id, val);
    cancelEdit(g.id);
  }

  function startDelete(gId) {
    setEditState(s => ({ ...s, [gId]: { mode: "confirmDelete" } }));
  }

  function confirmDelete(gId) {
    onDeleteGroup(gId);
    cancelEdit(gId);
  }

  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: PALETTE.text }}>Your Groups</h2>
        <button onClick={() => setCreating(!creating)} style={S.btn}>+ New Group</button>
      </div>

      {creating && (
        <div style={{ ...S.card, padding: 20, marginBottom: 20 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, color: PALETTE.text }}>Name your group</p>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && create()}
            placeholder="e.g. Summer Fam 🌻" style={{ ...S.input, marginBottom: 12 }} autoFocus />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={create} style={{ ...S.btn, flex: 1 }}>Create</button>
            <button onClick={() => setCreating(false)} style={{ ...S.btnGhost, flex: 1 }}>Cancel</button>
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: PALETTE.muted }}>
          <p style={{ fontSize: 48, margin: 0 }}>👨‍👩‍👧‍👦</p>
          <p style={{ marginTop: 12, fontWeight: 700 }}>No groups yet</p>
          <p style={{ fontSize: 14 }}>Create one and invite your family!</p>
        </div>
      )}

      {groups.map(g => {
        const groupMembers = members.filter(m => g.members.includes(m.id));
        const isOwner = g.createdBy === myId;
        const es = editState[g.id];

        return (
          <div key={g.id} style={S.card}>
            {/* Rename inline editor */}
            {es?.mode === "rename" && (
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${PALETTE.border}`, background: `${PALETTE.primary}08` }}>
                <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: PALETTE.primary }}>Rename group</p>
                <input
                  value={es.renameVal}
                  onChange={e => setEditState(s => ({ ...s, [g.id]: { ...s[g.id], renameVal: e.target.value } }))}
                  onKeyDown={e => { if (e.key === "Enter") submitRename(g); if (e.key === "Escape") cancelEdit(g.id); }}
                  style={{ ...S.input, marginBottom: 10 }}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => submitRename(g)} style={{ ...S.btn, flex: 1, fontSize: 13, padding: "8px 0" }}>Save</button>
                  <button onClick={() => cancelEdit(g.id)} style={{ ...S.btnGhost, flex: 1, fontSize: 13, padding: "8px 0" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Delete confirmation */}
            {es?.mode === "confirmDelete" && (
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${PALETTE.border}`, background: "#fff5f5" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#c0392b" }}>Delete "{g.name}"?</p>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: PALETTE.muted }}>All posts and stories in this group will be permanently removed.</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => confirmDelete(g.id)} style={{ ...S.btn, flex: 1, fontSize: 13, padding: "8px 0", background: "#c0392b" }}>Yes, delete</button>
                  <button onClick={() => cancelEdit(g.id)} style={{ ...S.btnGhost, flex: 1, fontSize: 13, padding: "8px 0" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ padding: "16px 16px 12px", cursor: "pointer" }} onClick={() => onSelectGroup(g)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {g.emoji || "👨‍👩‍👧‍👦"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, color: PALETTE.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: PALETTE.muted, display: "flex", alignItems: "center", gap: 6 }}>
                    {groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}
                    {isOwner && <span style={{ background: PALETTE.accent, color: PALETTE.accentDark, borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>Owner</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex" }}>
                {groupMembers.slice(0, 5).map((m, i) => (
                  <img key={m.id} src={m.avatar} style={{ ...S.avatar(28), border: `2px solid ${PALETTE.card}`, marginLeft: i === 0 ? 0 : -8 }} alt={m.name} />
                ))}
                {groupMembers.length > 5 && <div style={{ width: 28, height: 28, borderRadius: "50%", background: PALETTE.accent, border: `2px solid ${PALETTE.card}`, marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: PALETTE.accentDark }}>+{groupMembers.length - 5}</div>}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${PALETTE.border}`, padding: "10px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => onSelectGroup(g)} style={{ ...S.btn, flex: 1, fontSize: 13, padding: "8px 0", minWidth: 70 }}>Open</button>
              <button onClick={() => copyLink(g)} style={{ ...S.btnGhost, flex: 1, fontSize: 13, padding: "8px 0", minWidth: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                {copiedId === g.id ? <><Icon name="check" color={PALETTE.primary} size={14} /> Copied!</> : <><Icon name="link" color={PALETTE.primary} size={14} /> Invite</>}
              </button>
              {isOwner && (
                <>
                  <button onClick={() => startRename(g)} title="Rename group"
                    style={{ background: PALETTE.bg, border: `1.5px solid ${PALETTE.border}`, borderRadius: 24, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: PALETTE.muted, fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13 }}>
                    <Icon name="edit" color={PALETTE.muted} size={15} /> Rename
                  </button>
                  <button onClick={() => startDelete(g.id)} title="Delete group"
                    style={{ background: "#fff5f5", border: "1.5px solid #fcc", borderRadius: 24, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "#c0392b", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 13 }}>
                    <Icon name="trash" color="#c0392b" size={15} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Feed Screen (within a group) ──────────────────────────────────────────────
function FeedScreen({ group, posts, stories, members, myId, onLike, onComment, onPostNew, onStoryNew, onBack }) {
  const [storyViewer, setStoryViewer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const myMember = members.find(m => m.id === myId);
  const groupPosts = posts.filter(p => p.groupId === group.id).sort((a, b) => b.ts - a.ts);
  const groupStories = stories.filter(s => s.groupId === group.id && Date.now() - s.ts < 86400000);

  // Group stories by author, latest first
  const storyAuthors = [...new Map(groupStories.map(s => [s.authorId, s])).values()];
  const myStory = storyAuthors.find(s => s.authorId === myId);

  return (
    <>
      {storyViewer && (
        <StoryViewer
          story={storyViewer}
          author={members.find(m => m.id === storyViewer.authorId)}
          onClose={() => setStoryViewer(null)}
        />
      )}
      {uploading && (
        <UploadModal
          groupId={group.id}
          myId={myId}
          onClose={() => setUploading(false)}
          onPost={onPostNew}
          onStory={onStoryNew}
        />
      )}

      {/* Top bar */}
      <div style={S.topBar}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <Icon name="back" color={PALETTE.primary} size={26} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 17, color: PALETTE.text }}>{group.name}</span>
        <button onClick={() => setUploading(true)} style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.primary }}>
          <Icon name="camera" color={PALETTE.primary} size={24} />
        </button>
      </div>

      <div style={{ paddingBottom: 24 }}>
        {/* Stories row */}
        <div style={{ background: PALETTE.card, borderBottom: `1px solid ${PALETTE.border}`, padding: "12px 0", marginBottom: 8 }}>
          <div style={{ display: "flex", overflowX: "auto", paddingLeft: 8, paddingRight: 8, gap: 0, scrollbarWidth: "none" }}>
            {/* Add my story */}
            <button onClick={() => setUploading(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "4px 6px", minWidth: 64 }}>
              <div style={{ width: 58, height: 58, borderRadius: "50%", background: PALETTE.bg, border: `2px dashed ${PALETTE.primary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {myStory
                  ? <img src={myMember?.avatar} style={S.avatar(52)} alt="me" />
                  : <span style={{ fontSize: 24 }}>+</span>
                }
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.text }}>Your story</span>
            </button>

            {storyAuthors.filter(s => s.authorId !== myId).map(s => {
              const a = members.find(m => m.id === s.authorId);
              return (
                <StoryRing key={s.id} image={s.image} avatar={a?.avatar} name={a?.name} onClick={() => setStoryViewer(s)} />
              );
            })}
          </div>
        </div>

        {/* Posts */}
        <div style={{ padding: "0 12px" }}>
          {groupPosts.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: PALETTE.muted }}>
              <p style={{ fontSize: 48, margin: 0 }}>📸</p>
              <p style={{ fontWeight: 700, marginTop: 12 }}>No posts yet</p>
              <p style={{ fontSize: 14 }}>Be the first to share a moment!</p>
              <button onClick={() => setUploading(true)} style={{ ...S.btn, marginTop: 12 }}>Share a post</button>
            </div>
          )}
          {groupPosts.map(post => (
            <PostCard key={post.id} post={post} members={members} myId={myId} onLike={onLike} onComment={onComment} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
function ProfileScreen({ myId, members, groups, posts, onEditName }) {
  const me = members.find(m => m.id === myId);
  const myPosts = posts.filter(p => p.authorId === myId);
  const myGroups = groups.filter(g => g.members.includes(myId));

  return (
    <div style={{ padding: "24px 16px 100px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img src={me?.avatar} style={{ ...S.avatar(80), margin: "0 auto 12px", border: `3px solid ${PALETTE.primary}` }} alt={me?.name} />
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 22 }}>{me?.name}</h2>
        <p style={{ margin: "4px 0 0", color: PALETTE.muted, fontSize: 14 }}>Member of {myGroups.length} group{myGroups.length !== 1 ? "s" : ""}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{myPosts.length}</div>
            <div style={{ fontSize: 12, color: PALETTE.muted }}>Posts</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{myGroups.length}</div>
            <div style={{ fontSize: 12, color: PALETTE.muted }}>Groups</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{myPosts.reduce((a, p) => a + p.likes.length, 0)}</div>
            <div style={{ fontSize: 12, color: PALETTE.muted }}>Likes</div>
          </div>
        </div>
      </div>

      {myPosts.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Your Posts</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
            {myPosts.map(p => (
              <img key={p.id} src={p.image} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8 }} alt="post" />
            ))}
          </div>
        </div>
      )}

      {/* Install PWA hint */}
      <div style={{ ...S.card, padding: 20, marginTop: 24, background: `linear-gradient(135deg, ${PALETTE.primary}15, ${PALETTE.accent}30)`, border: `1px solid ${PALETTE.border}` }}>
        <h4 style={{ margin: "0 0 8px", fontWeight: 800, color: PALETTE.primary }}>📱 Add to Home Screen</h4>
        <p style={{ margin: 0, fontSize: 13, color: PALETTE.text, lineHeight: 1.6 }}>
          Install Instafam on your phone! On <strong>iPhone</strong>: tap the Share icon → "Add to Home Screen". On <strong>Android</strong>: tap the menu → "Add to Home Screen".
        </p>
      </div>
    </div>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────
function Onboarding({ onDone, joinCode }) {
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);

  function proceed() {
    if (!name.trim()) return;
    onDone(name.trim(), joinCode);
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${PALETTE.primary} 0%, ${PALETTE.accentDark} 50%, #2d0d00 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 52, color: "#fff", letterSpacing: -1 }}>Instafam</div>
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, fontSize: 16 }}>Your private family & friends space 🏡</p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)", borderRadius: 28, padding: 32, width: "100%", maxWidth: 360, border: "1px solid rgba(255,255,255,0.2)" }}>
        {joinCode && <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 16px", fontSize: 14, color: "#fff" }}>🎉 You've been invited to join a group!</div>}
        <p style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 16 }}>What's your name?</p>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && proceed()}
          placeholder="e.g. Alex, Mom, Uncle Bob…"
          style={{ ...S.input, marginBottom: 16, background: "rgba(255,255,255,0.9)" }} autoFocus />
        <button onClick={proceed} disabled={!name.trim()} style={{ ...S.btn, width: "100%", fontSize: 16, padding: "14px 0", opacity: name.trim() ? 1 : 0.5 }}>
          {joinCode ? "Join Group →" : "Get Started →"}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [myId] = useState(() => {
    let id = localStorage.getItem("instafam_myid");
    if (!id) { id = uid(); localStorage.setItem("instafam_myid", id); }
    return id;
  });

  const [myName, setMyName] = useState(() => localStorage.getItem("instafam_myname") || "");

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("instafam_data");
    return saved ? JSON.parse(saved) : null;
  });

  const [tab, setTab] = useState("groups");
  const [activeGroup, setActiveGroup] = useState(null);

  // Check for invite link
  const urlParams = new URLSearchParams(window.location.search);
  const joinCode = urlParams.get("join");
  const joinGroupName = urlParams.get("group");

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (data) localStorage.setItem("instafam_data", JSON.stringify(data));
  }, [data]);

  function handleOnboard(name, jCode) {
    setMyName(name);
    localStorage.setItem("instafam_myname", name);

    let base = data;
    if (!base) {
      base = seedData(myId, name);
    } else {
      // Update my name
      base = {
        ...base,
        members: base.members.map(m => m.id === myId ? { ...m, name } : m).concat(
          base.members.find(m => m.id === myId) ? [] : [{ id: myId, name, avatar: SAMPLE_AVATARS[0] }]
        ),
      };
    }

    // Join group if invite code present
    if (jCode) {
      const group = base.groups.find(g => g.inviteCode === jCode);
      if (group && !group.members.includes(myId)) {
        base = {
          ...base,
          groups: base.groups.map(g => g.id === group.id ? { ...g, members: [...g.members, myId] } : g),
        };
      }
    }

    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
    setData(base);
  }

  function createGroup(name) {
    const newGroup = { id: uid(), name, emoji: "👨‍👩‍👧‍👦", members: [myId], inviteCode: uid(), createdBy: myId };
    setData(d => ({ ...d, groups: [...d.groups, newGroup] }));
  }

  function renameGroup(groupId, newName) {
    setData(d => ({
      ...d,
      groups: d.groups.map(g => g.id === groupId && g.createdBy === myId ? { ...g, name: newName } : g),
    }));
    // If currently viewing that group, update activeGroup name too
    setActiveGroup(ag => ag && ag.id === groupId ? { ...ag, name: newName } : ag);
  }

  function deleteGroup(groupId) {
    setData(d => ({
      ...d,
      groups: d.groups.filter(g => !(g.id === groupId && g.createdBy === myId)),
      posts: d.posts.filter(p => p.groupId !== groupId),
      stories: d.stories.filter(s => s.groupId !== groupId),
    }));
    setActiveGroup(ag => ag && ag.id === groupId ? null : ag);
  }

  function handleLike(postId) {
    setData(d => ({
      ...d,
      posts: d.posts.map(p => p.id === postId
        ? { ...p, likes: p.likes.includes(myId) ? p.likes.filter(id => id !== myId) : [...p.likes, myId] }
        : p
      ),
    }));
  }

  function handleComment(postId, text) {
    setData(d => ({
      ...d,
      posts: d.posts.map(p => p.id === postId
        ? { ...p, comments: [...p.comments, { id: uid(), authorId: myId, text, ts: Date.now() }] }
        : p
      ),
    }));
  }

  function handleNewPost(post) {
    setData(d => ({ ...d, posts: [post, ...d.posts] }));
  }

  function handleNewStory(story) {
    setData(d => ({ ...d, stories: [story, ...d.stories] }));
  }

  if (!myName) {
    return (
      <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <Onboarding onDone={handleOnboard} joinCode={joinCode} />
      </>
    );
  }

  const groups = data?.groups || [];
  const members = data?.members || [];
  const posts = data?.posts || [];
  const stories = data?.stories || [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <div style={S.app}>
        {/* Main top bar (only on non-group screens) */}
        {!activeGroup && (
          <div style={S.topBar}>
            <span style={S.logo}>Instafam</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE.muted }}>Hi, {myName} 👋</span>
            </div>
          </div>
        )}

        {/* Page content */}
        {activeGroup ? (
          <FeedScreen
            group={activeGroup}
            posts={posts}
            stories={stories}
            members={members}
            myId={myId}
            onLike={handleLike}
            onComment={handleComment}
            onPostNew={handleNewPost}
            onStoryNew={handleNewStory}
            onBack={() => setActiveGroup(null)}
          />
        ) : tab === "groups" ? (
          <GroupsScreen
            groups={groups}
            members={members}
            myId={myId}
            onSelectGroup={g => { setActiveGroup(g); }}
            onCreateGroup={createGroup}
            onRenameGroup={renameGroup}
            onDeleteGroup={deleteGroup}
          />
        ) : (
          <ProfileScreen myId={myId} members={members} groups={groups} posts={posts} />
        )}

        {/* Bottom nav (only when not in a group) */}
        {!activeGroup && (
          <nav style={S.bottomNav}>
            {[
              { id: "groups", icon: "people", label: "Groups" },
              { id: "profile", icon: "profile", label: "Profile" },
            ].map(n => (
              <button key={n.id} style={S.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
                <Icon name={n.icon} size={24} filled={tab === n.id} color={tab === n.id ? PALETTE.primary : PALETTE.muted} />
                {n.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
