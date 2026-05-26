import { useNavigate } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#1a1a2e",
      color: "#fff",
    }}>
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1>Welcome {user?.fullName || "User"}</h1>
      <p style={{ marginBottom: 30, color: "#aaa" }}>Start chatting with your friends</p>
      <button
        onClick={() => navigate("/chat")}
        style={{
          padding: "14px 40px",
          fontSize: 18,
          background: "#0f3460",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        Go to Chats
      </button>
    </div>
  );
};

export default Home;
