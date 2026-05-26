import { FileText, Download } from "lucide-react";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const FileAttachment = ({ url, name, type, size }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        marginTop: 8,
        borderRadius: 10,
        background: "rgba(0,0,0,0.2)",
        textDecoration: "none",
        color: "#f8fafc",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <FileText size={22} color="#60a5fa" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
          {formatSize(size)}
        </div>
      </div>
      <Download size={16} color="#94a3b8" />
    </a>
  );
};

const Message = ({ message, isOwn }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <img
        src={message.avatar}
        alt=""
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #2b2f3a",
        }}
      />

      <div
        style={{
          maxWidth: "72%",
          padding: "12px 16px",
          borderRadius: 18,
          background: isOwn
            ? "linear-gradient(135deg, #3b82f6, #2563eb)"
            : "#1e293b",
          color: "#f8fafc",
          borderBottomRightRadius: isOwn ? 6 : 18,
          borderBottomLeftRadius: isOwn ? 18 : 6,
          boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
          border: isOwn
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid #334155",
        }}
      >
        {message.file_url && message.file_type?.startsWith("image/") ? (
          <div>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer">
              <img
                src={message.file_url}
                alt={message.file_name || "Image"}
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: 10,
                  display: "block",
                }}
              />
            </a>
            {message.file_name && (
              <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
                {message.file_name} {message.file_size ? `(${formatSize(message.file_size)})` : ""}
              </div>
            )}
          </div>
        ) : message.file_url ? (
          <FileAttachment
            url={message.file_url}
            name={message.file_name || "File"}
            type={message.file_type}
            size={message.file_size}
          />
        ) : null}

        {message.content && (
          <p
            style={{
              margin: message.file_url ? "8px 0 0" : 0,
              fontSize: 15,
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
};

export default Message;
