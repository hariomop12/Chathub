import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { MessageCircle, ArrowRight, Shield, Users, Plus } from "lucide-react";
import { api } from "../api/api";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getChats().then(setChats).catch(() => {});
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  const recentChats = chats.slice(0, 3);
  const otherUsers = users.filter((u) => u.id !== user?.id).slice(0, 5);
  const onlineCount = otherUsers.length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.topBar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span style={styles.brandName}>ChatHub</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div style={styles.container}>
        <div style={styles.greeting}>
          <div style={styles.avatarRing}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {user?.firstName?.[0] || user?.username?.[0] || "?"}
              </div>
            )}
          </div>
          <h1 style={styles.title}>
            Welcome back, <span style={styles.highlight}>{user?.firstName || "Friend"}</span>!
          </h1>
          <p style={styles.subtitle}>
            Your secure conversations are waiting
          </p>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <MessageCircle size={18} style={{ color: "var(--primary)" }} />
            <span style={styles.statNumber}>{chats.length}</span>
            <span style={styles.statLabel}>Chats</span>
          </div>
          <div style={styles.statCard}>
            <Users size={18} style={{ color: "var(--primary)" }} />
            <span style={styles.statNumber}>{onlineCount}</span>
            <span style={styles.statLabel}>Online</span>
          </div>
          <div style={styles.statCard}>
            <Shield size={18} style={{ color: "var(--primary)" }} />
            <span style={styles.statNumber}>E2E</span>
            <span style={styles.statLabel}>Encrypted</span>
          </div>
        </div>

        {recentChats.length > 0 && (
          <div style={styles.recentSection}>
            <div style={styles.sectionLabel}>Recent Chats</div>
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate("/chat")}
                style={styles.recentItem}
              >
                {chat.other_avatar && (
                  <img src={chat.other_avatar} alt="" style={styles.recentAvatar} />
                )}
                <div style={styles.recentInfo}>
                  <div style={styles.recentName}>{chat.other_username || "Direct Chat"}</div>
                  {chat.last_message && (
                    <div style={styles.recentMsg}>{chat.last_message}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {otherUsers.length > 0 && (
          <div style={styles.onlineSection}>
            <div style={styles.sectionLabel}>Online Now</div>
            <div style={styles.avatarStack}>
              {otherUsers.map((u) => (
                <div key={u.id} style={styles.onlineAvatarWrap}>
                  <img src={u.avatar} alt="" style={styles.onlineAvatar} />
                  <span style={styles.greenDot} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.actionsRow}>
          <button onClick={() => navigate("/chat")} style={styles.primaryBtn}
            onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 12px 24px rgba(79, 70, 229, 0.4)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.25)"; }}
          >
            Open Chats
            <ArrowRight size={20} />
          </button>
          <button onClick={() => navigate("/chat")} style={styles.secondaryBtn}
            onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div style={styles.badge}>
          <Shield size={14} />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(-45deg, var(--home-bg-start), var(--home-bg-mid), var(--home-bg-end), var(--home-bg-start))",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  bgOrb1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-20%",
    left: "-10%",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    zIndex: 2,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text)",
    letterSpacing: "-0.3px",
  },
  container: {
    textAlign: "center",
    maxWidth: "480px",
    width: "100%",
    animation: "slideUp 0.5s ease-out",
    position: "relative",
    zIndex: 1,
  },
  greeting: {
    marginBottom: 28,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: "50%",
    padding: 3,
    background: "linear-gradient(135deg, #4f46e5, #818cf8)",
    margin: "0 auto 24px",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.2)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "var(--primary-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 700,
    color: "var(--primary)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "var(--text)",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  },
  highlight: {
    background: "linear-gradient(135deg, #4f46e5, #818cf8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "17px",
    color: "var(--text-muted)",
    lineHeight: "1.6",
    fontWeight: "400",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 28,
    justifyContent: "center",
  },
  statCard: {
    flex: 1,
    maxWidth: 140,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "18px 12px",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-card)",
    boxShadow: "var(--shadow-md)",
    border: "1px solid var(--border)",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--text)",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  recentSection: {
    textAlign: "left",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: 10,
    paddingLeft: 4,
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    marginBottom: 8,
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },
  recentAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--border)",
  },
  recentInfo: {
    minWidth: 0,
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text)",
  },
  recentMsg: {
    fontSize: 12,
    color: "var(--text-muted)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    marginTop: 2,
  },
  onlineSection: {
    marginBottom: 24,
  },
  avatarStack: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
  },
  onlineAvatarWrap: {
    position: "relative",
  },
  onlineAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid var(--border)",
  },
  greenDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#22c55e",
    border: "3px solid var(--bg-card)",
  },
  actionsRow: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
    flex: 1,
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "14px 20px",
    fontSize: "14px",
    fontWeight: "600",
    background: "var(--bg-card)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "var(--shadow-sm)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: "var(--radius-full)",
    background: "var(--primary-bg)",
    color: "var(--primary)",
    fontSize: 13,
    fontWeight: 600,
  },
};

export default Home;
