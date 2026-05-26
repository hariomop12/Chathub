import { useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import { MessageCircle, ArrowRight } from "lucide-react";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div style={styles.wrapper}>
      <div style={styles.userButton}>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div style={styles.container}>
        <div style={styles.iconContainer}>
          <MessageCircle size={64} style={styles.icon} />
        </div>

        <h1 style={styles.title}>
          Welcome back, {user?.firstName || "Friend"}!
        </h1>

        <p style={styles.subtitle}>
          Jump into your conversations and stay connected with your friends
        </p>

        <button
          onClick={() => navigate("/chat")}
          style={styles.button}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 12px 24px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.2)";
          }}
        >
          Go to Chats
          <ArrowRight size={20} style={{ marginLeft: "8px" }} />
        </button>
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
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
    position: "relative",
  },
  userButton: {
    position: "absolute",
    top: "24px",
    right: "24px",
  },
  container: {
    textAlign: "center",
    maxWidth: "500px",
  },
  iconContainer: {
    marginBottom: "32px",
  },
  icon: {
    color: "#3b82f6",
  },
  title: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#64748b",
    marginBottom: "40px",
    lineHeight: "1.6",
    fontWeight: "400",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
  },
};

export default Home;
