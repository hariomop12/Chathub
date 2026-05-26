import { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Settings, X } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
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
    cropPixels.height
  );

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
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
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
          croppedAreaPixels
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
        {users
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
        {chats.length === 0 ? (
          <p
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={closeSettings}
        >
          <div
            style={{
              width: "min(92vw, 460px)",
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.24)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                  User Settings
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "#64748b",
                  }}
                >
                  Update your name and avatar.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSettings}
                disabled={isUploading}
                aria-label="Close settings"
                style={{
                  width: 34,
                  height: 34,
                  border: "none",
                  borderRadius: 8,
                  background: "#f1f5f9",
                  color: "#475569",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Name
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isUploading}
                  placeholder="Your name"
                  style={{
                    width: "100%",
                    height: 42,
                    marginTop: 8,
                    padding: "0 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    color: "#111827",
                    background: isUploading ? "#f8fafc" : "#ffffff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </label>

              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 40,
                  marginTop: 16,
                  padding: "0 14px",
                  borderRadius: 8,
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                Select image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploading}
                  style={{ display: "none" }}
                />
              </label>

              {selectedImage && (
                <>
                  <div
                    style={{
                      position: "relative",
                      height: 320,
                      marginTop: 16,
                      background: "#0f172a",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
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

                  <label
                    style={{
                      display: "block",
                      marginTop: 14,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#334155",
                    }}
                  >
                    Zoom
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      disabled={isUploading}
                      style={{ width: "100%", marginTop: 8 }}
                    />
                  </label>
                </>
              )}

              {uploadError && (
                <p
                  role="alert"
                  style={{
                    margin: "12px 0 0",
                    color: "#dc2626",
                    fontSize: 13,
                  }}
                >
                  {uploadError}
                </p>
              )}
            </div>

            <div
              style={{
                padding: 18,
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={closeSettings}
                disabled={isUploading}
                style={{
                  minHeight: 40,
                  padding: "0 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveUserSettings}
                disabled={!canSaveSettings}
                style={{
                  minHeight: 40,
                  padding: "0 16px",
                  border: "none",
                  borderRadius: 8,
                  background: !canSaveSettings ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 700,
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

export default Sidebar;
