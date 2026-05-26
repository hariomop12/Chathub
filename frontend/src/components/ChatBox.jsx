import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Paperclip, X, FileText, Image, Loader } from "lucide-react";
import { api } from "../api/api";
import Message from "./Message";

const MAX_SIZE = 50 * 1024 * 1024;

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const ChatBox = ({ chat, messages, onSendMessage, onTyping, typingUsers }) => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState("");
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const onTypingRef = useRef(onTyping);

  onTypingRef.current = onTyping;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    try {
      const result = await api.uploadFile(file, setUploadProgress);
      setFileInfo(result);
    } catch (err) {
      setFileError(err.message || "Upload failed");
    } finally {
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
      onTypingRef.current(false);
    };
  }, [chat?.id]);

  const typingNames = Object.values(typingUsers || {});
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : typingNames.length > 1
        ? `${typingNames.length} people are typing...`
        : "";

  if (!chat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#555",
        }}
      >
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #0f3460",
          background: "#16213e",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {chat.other_avatar && (
          <img src={chat.other_avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%" }} />
        )}
        <strong>{chat.other_username || chat.name || "Direct Chat"}</strong>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 20,
        }}
      >
        {messages.map((msg) => (
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
              fontStyle: "italic",
            }}
          >
            {typingText}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "15px 20px",
          borderTop: "1px solid #0f3460",
          display: "flex",
          gap: 10,
          background: "#16213e",
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
            border: "1px solid #0f3460",
            background: "#1a1a2e",
            color: "#fff",
            outline: "none",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "#1e293b",
              borderRadius: 8,
              border: "1px solid #334155",
              maxWidth: 200,
            }}
          >
            {fileInfo.type?.startsWith("image/") ? (
              <Image size={16} color="#60a5fa" />
            ) : (
              <FileText size={16} color="#60a5fa" />
            )}
            <span
              style={{
                fontSize: 13,
                color: "#cbd5e1",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {fileInfo.name}
            </span>
            <span style={{ fontSize: 11, color: "#64748b", flexShrink: 0 }}>
              {formatSize(fileInfo.size)}
            </span>
            <button
              type="button"
              onClick={clearFile}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "#1e293b",
              borderRadius: 8,
              border: "1px solid #334155",
            }}
          >
            <Loader size={16} className="animate-spin" color="#60a5fa" />
            <span style={{ fontSize: 13, color: "#94a3b8" }}>{uploadProgress}%</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Attach file"
          aria-label="Attach file"
          style={{
            width: 42,
            height: 42,
            border: "1px solid #0f3460",
            borderRadius: 8,
            background: uploading ? "#1a1a2e" : "#1a1a2e",
            color: uploading ? "#475569" : "#cbd5e1",
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {uploading ? <Loader size={18} className="animate-spin" /> : <Paperclip size={18} strokeWidth={2.2} />}
        </button>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#0f3460",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
