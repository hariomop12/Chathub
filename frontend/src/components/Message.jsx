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
        background: "#e0e7ff",
        textDecoration: "none",
        color: "#1e40af",
        border: "1px solid #c7d2fe",
      }}
    >
      <FileText size={22} color="#3b82f6" />
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
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
          {formatSize(size)}
        </div>
      </div>
      <Download size={16} color="#64748b" />
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
          width: 36,
          height: 36,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #e5e7eb",
        }}
      />

      <div
        style={{
          maxWidth: "72%",
          padding: "12px 16px",
          borderRadius: 18,
          background: isOwn
            ? "#3b82f6"
            : "#e5e7eb",
          color: isOwn ? "#ffffff" : "#1a1a1a",
          borderBottomRightRadius: isOwn ? 6 : 18,
          borderBottomLeftRadius: isOwn ? 18 : 6,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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
              <div style={{ fontSize: 12, color: isOwn ? "#dbeafe" : "#64748b", marginTop: 4 }}>
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
