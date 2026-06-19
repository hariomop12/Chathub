import React, { useState, useEffect } from "react";
import { FileText, X, Image as ImageIcon } from "lucide-react";

const formatSize = (bytes) => {
  if (!bytes) return "";

  if (bytes < 1024) return bytes + " B";

  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  }

  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getFileLabel = (type) => {
  if (!type) return "FILE";

  if (type.startsWith("image/")) return "IMAGE";

  if (type === "application/pdf") return "PDF";

  return "FILE";
};

const FileAttachment = ({ name, size, type, onClick, isOwn }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        marginTop: 8,
        borderRadius: 14,
        background: hover
          ? isOwn ? "rgba(255,255,255,0.15)" : "var(--bg-hover)"
          : isOwn ? "rgba(255,255,255,0.1)" : "var(--bg)",
        border: `1px solid ${isOwn ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: isOwn ? "rgba(255,255,255,0.2)" : "var(--primary-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={20} color={isOwn ? "#fff" : "var(--primary-light)"} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: isOwn ? "#fff" : "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 7px",
              borderRadius: 999,
              background: isOwn ? "rgba(255,255,255,0.25)" : "var(--primary-light)",
              color: "#fff",
              letterSpacing: 0.4,
            }}
          >
            {getFileLabel(type)}
          </span>

          <span
            style={{
              fontSize: 12,
              color: isOwn ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
            }}
          >
            {formatSize(size)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Message = ({ message, isOwn }) => {
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const closePreview = () => {
    setPreview(null);
    setPreviewType(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closePreview();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      {/* PREVIEW MODAL */}
      {preview && (
        <div
          onClick={closePreview}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            animation: "fadeIn 0.2s ease",
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            title="Close"
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            }}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 46,
              height: 46,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              zIndex: 10000,
            }}
          >
            <X size={22} />
          </button>

          {/* IMAGE PREVIEW */}
          {previewType === "image" && (
            <img
              src={preview}
              alt="Preview"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "92%",
                maxHeight: "92%",
                borderRadius: 16,
                objectFit: "contain",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              }}
            />
          )}

          {/* PDF PREVIEW */}
          {previewType === "pdf" && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "92%",
                height: "92%",
                borderRadius: 18,
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
              }}
            >
              <iframe
                src={preview}
                title="PDF Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* MESSAGE */}
      <div
        style={{
          display: "flex",
          flexDirection: isOwn ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {/* AVATAR */}
        <img
          src={message.avatar}
          alt=""
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid var(--border)",
            flexShrink: 0,
          }}
        />

        {/* MESSAGE BOX */}
        <div
          className="message-bubble"
          style={{
            maxWidth: "72%",
            padding: "12px 16px",
            borderRadius: 20,
            background: isOwn ? "var(--gradient-primary)" : "var(--msg-other)",
            color: isOwn ? "#fff" : "var(--text)",
            borderBottomRightRadius: isOwn ? 6 : 20,
            borderBottomLeftRadius: isOwn ? 20 : 6,
            boxShadow: isOwn ? "0 2px 8px rgba(79, 70, 229, 0.2)" : "0 2px 6px rgba(0,0,0,0.04)",
          }}
        >
          {/* IMAGE */}
          {message.file_url && message.file_type?.startsWith("image/") ? (
            <div>
              <div
                onClick={() => {
                  setPreview(message.file_url);
                  setPreviewType("image");
                }}
                style={{
                  overflow: "hidden",
                  borderRadius: 14,
                  cursor: "pointer",
                }}
              >
                <img
                  src={message.file_url}
                  alt={message.file_name || "Image"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 320,
                    display: "block",
                    transition: "transform 0.2s ease",
                  }}
                />
              </div>

              {message.file_name && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 8,
                    fontSize: 12,
                    color: isOwn ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                  }}
                >
                  <ImageIcon size={14} />

                  <span>
                    {message.file_name}

                    {message.file_size
                      ? ` (${formatSize(message.file_size)})`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          ) : message.file_url ? (
            /* FILE / PDF */
            <FileAttachment
              isOwn={isOwn}
              name={message.file_name || "File"}
              size={message.file_size}
              type={message.file_type}
              onClick={() => {
                const isPdf = message.file_type === "application/pdf";

                setPreview(message.file_url);
                setPreviewType(isPdf ? "pdf" : "image");
              }}
            />
          ) : null}

          {/* TEXT */}
          {message.content && (
            <p
              style={{
                margin: message.file_url ? "10px 0 0" : 0,
                fontSize: 15,
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Message;
