import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, X } from "lucide-react";

const CallModal = ({
  callState,
  localStream,
  remoteStream,
  callerInfo,
  isVideo,
  onAnswer,
  onReject,
  onEndCall,
  onCancelCall,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callState || callState === "idle") return null;

  return (
    <div
      className="call-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="call-modal"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 24,
          padding: 36,
          textAlign: "center",
          color: "#fff",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(79, 70, 229, 0.15)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Avatar / Name */}
        <div style={{ marginBottom: 24 }}>
          {callerInfo?.avatar ? (
            <img
              src={callerInfo.avatar}
              alt=""
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border: "3px solid rgba(99, 102, 241, 0.5)",
                objectFit: "cover",
                marginBottom: 12,
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
                margin: "0 auto 12px",
                boxShadow: "0 0 30px rgba(99, 102, 241, 0.3)",
              }}
            >
              {callerInfo?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, letterSpacing: "-0.3px" }}>
            {callerInfo?.username || "Unknown"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {callState === "incoming"
              ? isVideo
                ? "Incoming video call..."
                : "Incoming audio call..."
              : callState === "calling"
                ? "Calling..."
                : callState === "connected"
                  ? isVideo
                    ? "Video call"
                    : "Audio call"
                  : ""}
          </p>
        </div>

        {/* Remote video (active call) */}
        {callState === "connected" && remoteStream && (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
              marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Local PIP */}
            {localStream && (
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  width: "30%",
                  aspectRatio: "1",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.2)",
                  background: "#000",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        )}

        {/* Audio-only animation */}
        {callState === "connected" && !isVideo && (
          <div
            style={{
              width: "100%",
              height: 80,
              borderRadius: 16,
              background: "rgba(99,102,241,0.08)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="audio-bar"
                style={{
                  width: 6,
                  height: 30 + Math.random() * 30,
                  background: "linear-gradient(to top, #4f46e5, #818cf8)",
                  borderRadius: 3,
                  animation: "audioBounce 0.8s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: callState === "connected" ? 0 : 8,
          }}
        >
          {callState === "incoming" && (
            <>
              <button
                onClick={onReject}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(239, 68, 68, 0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)"; }}
              >
                <PhoneOff size={26} />
              </button>
              <button
                onClick={onAnswer}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  border: "none",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(34, 197, 94, 0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4)"; }}
              >
                {isVideo ? <Video size={26} /> : <Phone size={26} />}
              </button>
            </>
          )}

          {callState === "calling" && (
            <button
              onClick={onCancelCall}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(239, 68, 68, 0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)"; }}
            >
              <PhoneOff size={26} />
            </button>
          )}

          {callState === "connected" && (
            <button
              onClick={onEndCall}
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(239, 68, 68, 0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.4)"; }}
            >
              <PhoneOff size={26} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
