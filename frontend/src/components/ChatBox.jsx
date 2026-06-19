import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Paperclip, X, FileText, Image, Loader, Phone, Video } from "lucide-react";
import { api } from "../api/api";
import Message from "./Message";

const MAX_SIZE = 50 * 1024 * 1024;

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const ChatBox = ({
  chat,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  onBack,
  onAudioCall,
  onVideoCall,
}) => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState("");
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const displayedProgressRef = useRef(0);
  const progressTargetRef = useRef(0);
  const progressTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const onTypingRef = useRef(onTyping);

  onTypingRef.current = onTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() && !fileInfo) return;
    onTypingRef.current(false);
    onSendMessage(input.trim(), fileInfo);
    setInput("");
    setFileInfo(null);
    setFileError("");
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    onTypingRef.current(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTypingRef.current(false);
    }, 1200);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");

    if (file.size > MAX_SIZE) {
      setFileError("File exceeds 50MB limit");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    displayedProgressRef.current = 0;
    progressTargetRef.current = 8;

    progressTimerRef.current = setInterval(() => {
      setUploadProgress((current) => {
        const target = progressTargetRef.current;
        if (current >= target) {
          displayedProgressRef.current = current;
          return current;
        }

        const next = Math.min(current + 2, target);
        displayedProgressRef.current = next;
        return next;
      });
    }, 120);

    try {
      const result = await api.uploadFile(file, (progress) => {
        progressTargetRef.current = Math.max(
          progressTargetRef.current,
          Math.min(progress, 95),
        );
      });

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }

      await new Promise((resolve) => {
        const timer = setInterval(() => {
          const next = Math.min(displayedProgressRef.current + 5, 100);
          displayedProgressRef.current = next;
          setUploadProgress(next);

          if (next === 100) {
            clearInterval(timer);
            resolve();
          }
        }, 45);
      });

      setFileInfo(result);
    } catch (err) {
      console.error("handleFileSelect error:", err);
      setFileError(err.message || "Upload failed");
    } finally {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      setUploading(false);
      e.target.value = "";
    }
  };

  const clearFile = () => {
    setFileInfo(null);
    setFileError("");
    setUploadProgress(0);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      onTypingRef.current(false);
    };
  }, [chat?.id]);

  const typingNames = Object.values(typingUsers || {});
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length > 1
        ? `${typingNames.length} people are typing...`
        : "";

  if (!chat) {
    return (
      <div
        className="chat-empty-state"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontSize: "16px",
          fontWeight: "500",
          background: "#ffffff",
        }}
      >
        Select a chat to start messaging
      </div>
    );
  }

  const canCall = Boolean(chat?.other_user_id) && !chat?.is_group;
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div
      className="chat-panel"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="chat-header"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <button
          type="button"
          className="mobile-back-button"
          onClick={onBack}
          aria-label="Back to chats"
          style={{
            width: 38,
            height: 38,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#ffffff",
            color: "#334155",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={19} strokeWidth={2.2} />
        </button>
        {chat.other_avatar && (
          <img
            className="chat-header-avatar"
            src={chat.other_avatar}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid #e5e7eb",
            }}
          />
        )}
        <strong style={{ color: "#1a1a1a", fontSize: "15px", flex: 1 }}>
          {chat.other_username || chat.name || "Direct Chat"}
        </strong>
        {canCall ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => onAudioCall?.(chat)}
              title="Audio call"
              aria-label="Audio call"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#22c55e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#22c55e";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <Phone size={16} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={() => onVideoCall?.(chat)}
              title="Video call"
              aria-label="Video call"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                color: "#3b82f6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#eff6ff";
                e.currentTarget.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <Video size={16} strokeWidth={2.2} />
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="messages-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
          background: "#f8fafc",
        }}
      >
        {safeMessages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === user?.id}
          />
        ))}
        {typingText && (
          <div
            style={{
              marginTop: 8,
              color: "#9ca3af",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>{typingText}</span>
            <span className="typing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="message-form"
        onSubmit={handleSubmit}
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 10,
          background: "#ffffff",
          boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <input
          value={input}
          onChange={handleInputChange}
          onBlur={() => onTypingRef.current(false)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 15px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            color: "#1a1a1a",
            outline: "none",
            fontSize: "14px",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {fileInfo ? (
          <div
            className="selected-file-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "#f3f4f6",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              maxWidth: 200,
            }}
          >
            {fileInfo.type?.startsWith("image/") ? (
              <Image size={16} color="#3b82f6" />
            ) : (
              <FileText size={16} color="#3b82f6" />
            )}
            <span
              style={{
                fontSize: 13,
                color: "#374151",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {fileInfo.name}
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
              {formatSize(fileInfo.size)}
            </span>
            <button
              type="button"
              onClick={clearFile}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                padding: 2,
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : uploading ? (
          <div
            className="upload-progress-chip"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "#f3f4f6",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          >
            <Loader size={16} className="animate-spin" color="#3b82f6" />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {uploadProgress}%
            </span>
          </div>
        ) : null}

        <button
          className="attach-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          aria-label="Attach file"
          style={{
            width: 42,
            height: 42,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: uploading ? "#f3f4f6" : "#f9fafb",
            color: uploading ? "#9ca3af" : "#6b7280",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.2s",
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#1a1a1a";
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.color = "#6b7280";
            }
          }}
        >
          <Paperclip size={18} strokeWidth={2.2} />
        </button>
        <button
          className="send-button"
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#2563eb";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#3b82f6";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
