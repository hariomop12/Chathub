import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Settings, Sun, Moon, X } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { api } from "../api/api";
import { useTheme } from "../context/ThemeContext";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImageFile = async (imageSrc, cropPixels) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height,
  );

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );

  return new File([blob], "profile-image.jpg", { type: "image/jpeg" });
};

const Sidebar = ({
  chats,
  activeChat,
  onSelectChat,
  onDeleteChat,
  onChatsChange,
}) => {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!isLoaded) return null;
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (isSettingsOpen && user) {
      setDisplayName(user.fullName || user.username || "");
    }
  }, [isSettingsOpen, user]);

  const startChat = async (otherUser) => {
    try {
      const chat = await api.createChat([otherUser.id]);
      onSelectChat(chat);
      await onChatsChange();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();

    const confirmed = window.confirm("Delete this direct chat?");
    if (!confirmed) return;

    await onDeleteChat(chatId);
  };

  const resetImageSelection = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setUploadError("");
  };

  const closeSettings = () => {
    if (isUploading) return;
    setIsSettingsOpen(false);
    resetImageSelection();
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    resetImageSelection();
    setSelectedImage(URL.createObjectURL(file));
  };

  const saveUserSettings = async () => {
    if (!user) return;

    const trimmedName = displayName.trim();
    const currentName = (user.fullName || user.username || "").trim();
    const hasNameChange = trimmedName && trimmedName !== currentName;
    const hasImageChange = selectedImage && croppedAreaPixels;

    if (!hasNameChange && !hasImageChange) return;

    try {
      setIsUploading(true);
      setUploadError("");

      if (hasNameChange) {
        const [firstName, ...lastNameParts] = trimmedName.split(/\s+/);

        await user.update({
          firstName,
          lastName: lastNameParts.join(" "),
        });
      }

      if (hasImageChange) {
        const croppedImageFile = await getCroppedImageFile(
          selectedImage,
          croppedAreaPixels,
        );

        await user.setProfileImage({
          file: croppedImageFile,
        });
      }

      await user.reload?.();

      await api.upsertUser({
        id: user.id,
        username: trimmedName || user.username || user.fullName || "Anonymous",
        email: user.primaryEmailAddress?.emailAddress || "",
        avatar: user.imageUrl,
      });

      api.getUsers().then(setUsers).catch(() => {});

      setIsSettingsOpen(false);
      resetImageSelection();
    } catch (err) {
      console.error(err);
      setUploadError("Could not update your settings. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const trimmedDisplayName = displayName.trim();
  const currentDisplayName = (user?.fullName || user?.username || "").trim();
  const canSaveSettings =
    !isUploading &&
    ((trimmedDisplayName && trimmedDisplayName !== currentDisplayName) ||
      Boolean(selectedImage));

  return (
    <div
      className="chat-sidebar"
      style={{
        width: 320,
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 16,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Messages
          </h2>
        </div>
      </div>

      {/* Users */}
      <div
        style={{
          padding: "16px 20px 8px",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        All Users
      </div>

      <div
        style={{
          maxHeight: 220,
          overflowY: "auto",
          padding: "0 10px",
        }}
      >
        {Array.isArray(users) &&
          users
            .filter((u) => u.id !== user?.id)
          .map((u) => (
            <div
              key={u.id}
              onClick={() => startChat(u)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 10,
                marginBottom: 6,
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <img
                src={u.avatar}
                alt=""
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "2px solid var(--border)",
                  objectFit: "cover",
                }}
              />

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {u.username}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {u.email}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Chats */}
      <div
        style={{
          padding: "16px 20px 8px",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        Your Chats
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 10px",
        }}
      >
        {!Array.isArray(chats) || chats.length === 0 ? (
          <p
            className="empty-chat-copy"
            style={{
              padding: 20,
              color: "var(--text-muted)",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Start chatting with someone 👋
          </p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              style={{
                padding: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                borderRadius: "var(--radius-md)",
                marginBottom: 6,
                background:
                  activeChat?.id === chat.id ? "var(--bg-active)" : "transparent",
                transition: "all 0.15s ease",
                boxShadow: activeChat?.id === chat.id ? "var(--shadow-sm)" : "none",
              }}
              onMouseEnter={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {chat.other_avatar && (
                  <img
                    src={chat.other_avatar}
                    alt=""
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--border)",
                    }}
                  />
                )}

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {chat.other_username || chat.name || "Direct Chat"}
                  </div>

                  {chat.last_message && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color:
                          activeChat?.id === chat.id ? "var(--primary-light)" : "var(--text-muted)",

                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {chat.last_message}
                    </p>
                  )}
                </div>
              </div>

              {!chat.is_group && (
                <button
                  type="button"
                  onClick={(e) => deleteChat(e, chat.id)}
                  title="Delete chat"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: "var(--call-red)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "0.2s",
                    opacity: 0.7,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom User Section */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--bg-card)",
        }}
      >
        <img
          src={user?.imageUrl}
          alt=""
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {user?.fullName || user?.username}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
            }}
          >
            Online
          </div>
        </div>

        {/* Settings */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 8,
              background: theme === "light" ? "#f1f5f9" : "#334155",
              color: theme === "light" ? "#f59e0b" : "#fbbf24",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === "light" ? "#e2e8f0" : "#475569";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme === "light" ? "#f1f5f9" : "#334155";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <div style={{
              transition: "transform 0.4s ease, opacity 0.3s ease",
              transform: theme === "light" ? "rotate(0deg) scale(1)" : "rotate(180deg) scale(0)",
              opacity: theme === "light" ? 1 : 0,
              position: "absolute",
            }}>
              <Sun size={18} strokeWidth={2.2} />
            </div>
            <div style={{
              transition: "transform 0.4s ease, opacity 0.3s ease",
              transform: theme === "dark" ? "rotate(0deg) scale(1)" : "rotate(-180deg) scale(0)",
              opacity: theme === "dark" ? 1 : 0,
              position: "absolute",
            }}>
              <Moon size={18} strokeWidth={2.2} />
            </div>
          </button>
          <button type="button" onClick={() => clerk.signOut()} title="Sign out" style={{width:36,height:36,borderRadius:8,border:"1px solid var(--border)",background:"var(--bg-card)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--call-red)"}}>✕</button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            aria-label="Open settings"
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 8,
              background: "var(--bg-hover)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Settings size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="User Settings"
          onClick={closeSettings}
          style={overlayStyle}
        >
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            {/* HEADER */}
            <div style={headerStyle}>
              <div>
                <h3 style={titleStyle}>Profile settings</h3>
                <p style={subText}>Update your profile details</p>
              </div>

              <button
                onClick={closeSettings}
                disabled={isUploading}
                style={iconBtn}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div style={bodyStyle}>
              {/* Avatar */}
              <div style={avatarSection}>
                <img src={user?.imageUrl} style={avatar} alt="avatar" />

                <label style={uploadBtn}>
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    hidden
                  />
                </label>
              </div>

              {/* Name */}
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={input}
              />

              {/* Crop */}
              {selectedImage && (
                <div style={cropSection}>
                  <p style={sectionTitle}>Adjust image</p>

                  <div style={cropBox}>
                    <Cropper
                      image={selectedImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedPixels) =>
                        setCroppedAreaPixels(croppedPixels)
                      }
                    />
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={rangeStyle}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setZoom(1);
                    }}
                    style={dangerLink}
                  >
                    Remove selected image
                  </button>
                </div>
              )}

              {uploadError && <p style={errorText}>{uploadError}</p>}
            </div>

            {/* FOOTER */}
            <div style={footerStyle}>
              <button
                onClick={closeSettings}
                disabled={isUploading}
                style={secondaryBtn}
              >
                Cancel
              </button>

              <button
                onClick={saveUserSettings}
                disabled={!canSaveSettings}
                style={{
                  ...primaryBtn,
                  opacity: !canSaveSettings ? 0.5 : 1,
                  cursor: !canSaveSettings ? "not-allowed" : "pointer",
                }}
              >
                {isUploading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
  backdropFilter: "blur(8px)",
};

const modalStyle = {
  width: "min(460px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "var(--bg-card)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
  animation: "slideUp 0.3s ease-out",
};

const headerStyle = {
  padding: "18px 20px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text)",
};

const subText = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "var(--text-secondary)",
};

const iconBtn = {
  width: 34,
  height: 34,
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text-muted)",
  cursor: "pointer",
  fontSize: 16,
};

const bodyStyle = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const avatarSection = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const avatar = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  objectFit: "cover",
  border: "3px solid var(--border)",
};

const uploadBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text)",
  outline: "none",
  fontSize: 14,
};

const cropSection = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const sectionTitle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
};

const cropBox = {
  width: "100%",
  height: 260,
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  background: "var(--text)",
};

const rangeStyle = {
  width: "100%",
};

const dangerLink = {
  alignSelf: "flex-start",
  border: "none",
  background: "transparent",
  color: "var(--call-red)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const errorText = {
  margin: 0,
  color: "var(--call-red)",
  fontSize: 13,
};

const footerStyle = {
  padding: "14px 20px",
  borderTop: "1px solid var(--border)",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const secondaryBtn = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--bg-card)",
  color: "var(--text)",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryBtn = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "none",
  background: "var(--primary)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
};

export default Sidebar;
