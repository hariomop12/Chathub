import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Settings, X } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { api } from "../api/api";

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
    api.getUsers().then(setUsers).catch(console.error);
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

      api.getUsers().then(setUsers).catch(console.error);

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
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e5e7eb",
        color: "#1a1a1a",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          Messages
        </h2>
      </div>

      {/* Users */}
      <div
        style={{
          padding: "14px 20px 10px",
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
        }}
      >
        ALL USERS
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
                e.currentTarget.style.background = "#f3f4f6";
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
                  objectFit: "cover",
                  border: "2px solid #e5e7eb",
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
                    color: "#64748b",
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
          padding: "18px 20px 10px",
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
        }}
      >
        YOUR CHATS
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
              color: "#94a3b8",
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
                borderRadius: 10,
                marginBottom: 8,

                background:
                  activeChat?.id === chat.id ? "#e0e7ff" : "transparent",

                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.background = "#f3f4f6";
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
                      border: "2px solid #e5e7eb",
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
                          activeChat?.id === chat.id ? "#4f46e5" : "#64748b",

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
                    background: "#fee2e2",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontSize: 16,
                    transition: "0.2s",
                  }}
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
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#fafbfc",
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
              color: "#64748b",
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
          <button type="button" onClick={() => clerk.signOut()} title="Sign out" style={{width:36,height:36,borderRadius:8,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>✕</button>
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
              background: "#e5e7eb",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d1d5db";
              e.currentTarget.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
              e.currentTarget.style.color = "#64748b";
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
  background: "rgba(2, 6, 23, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
  backdropFilter: "blur(6px)",
};

const modalStyle = {
  width: "min(460px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: 14,
  boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
};

const headerStyle = {
  padding: "18px 20px",
  borderBottom: "1px solid #eef2f7",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
};

const subText = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#64748b",
};

const iconBtn = {
  width: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
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
  border: "2px solid #e2e8f0",
};

const uploadBtn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const input = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
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
  color: "#334155",
};

const cropBox = {
  width: "100%",
  height: 260,
  borderRadius: 12,
  overflow: "hidden",
  background: "#0f172a",
};

const rangeStyle = {
  width: "100%",
};

const dangerLink = {
  alignSelf: "flex-start",
  border: "none",
  background: "transparent",
  color: "#ef4444",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

const errorText = {
  margin: 0,
  color: "#ef4444",
  fontSize: 13,
};

const footerStyle = {
  padding: "14px 20px",
  borderTop: "1px solid #eef2f7",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const secondaryBtn = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryBtn = {
  padding: "9px 14px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
};

export default Sidebar;
