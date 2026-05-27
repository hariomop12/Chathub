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
        background: "rgba(0,0,0,0.85)",
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
          background: "#1a1a2e",
          borderRadius: 20,
          padding: 32,
          textAlign: "center",
          color: "#fff",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Avatar / Name */}
        <div style={{ marginBottom: 24 }}>
          {callerInfo?.avatar ? (
            <img
              src={callerInfo.avatar}
              alt=""
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: "3px solid #3b82f6",
                objectFit: "cover",
                marginBottom: 12,
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
                margin: "0 auto 12px",
              }}
            >
              {callerInfo?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {callerInfo?.username || "Unknown"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
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
              borderRadius: 12,
              overflow: "hidden",
              background: "#000",
              marginBottom: 16,
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
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.3)",
                  background: "#000",
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
              borderRadius: 12,
              background: "rgba(59,130,246,0.1)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="audio-bar"
                style={{
                  width: 6,
                  height: 30 + Math.random() * 30,
                  background: "#3b82f6",
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
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
              >
                <PhoneOff size={26} />
              </button>
              <button
                onClick={onAnswer}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "none",
                  background: "#22c55e",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#16a34a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#22c55e")}
              >
                {isVideo ? <Video size={26} /> : <Phone size={26} />}
              </button>
            </>
          )}

          {callState === "calling" && (
            <button
              onClick={onCancelCall}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
            >
              <PhoneOff size={26} />
            </button>
          )}

          {callState === "connected" && (
            <button
              onClick={onEndCall}
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#ef4444")}
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
