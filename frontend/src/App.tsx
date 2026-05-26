import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import { api, setTokenProvider } from "./api/api";

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/login" />;
  return children;
}

function AuthSync() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn && user) {
      api.upsertUser({
        id: user.id,
        username: user.username || user.fullName || "Anonymous",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl,
      }).catch((err) => console.error("upsertUser failed:", err));
    }
  }, [isSignedIn, user]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
