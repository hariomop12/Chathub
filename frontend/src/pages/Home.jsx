import { useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { MessageCircle, ArrowRight, Shield } from "lucide-react";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
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
            <div style={styles.avatarPlaceholder}>
              {user?.firstName?.[0] || user?.username?.[0] || "?"}
            </div>
          </div>
          <h1 style={styles.title}>
            Welcome back, <span style={styles.highlight}>{user?.firstName || "Friend"}</span>!
          </h1>
          <p style={styles.subtitle}>
            Your secure conversations are waiting
          </p>
        </div>

        <button
          onClick={() => navigate("/chat")}
          style={styles.button}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 24px rgba(79, 70, 229, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.25)";
          }}
        >
          Open Chats
          <ArrowRight size={20} style={{ marginLeft: "8px" }} />
        </button>

        <div style={styles.badge}>
          <Shield size={14} />
          <span>Encrypted</span>
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
    background: "var(--gradient-subtle)",
    padding: "20px",
    position: "relative",
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
    animation: "slideUp 0.5s ease-out",
  },
  greeting: {
    marginBottom: 36,
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
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 40px",
    fontSize: "16px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
    gap: 8,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 32,
    padding: "8px 16px",
    borderRadius: "var(--radius-full)",
    background: "var(--primary-bg)",
    color: "var(--primary)",
    fontSize: 13,
    fontWeight: 600,
  },
};

export default Home;
