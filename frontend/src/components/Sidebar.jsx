import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { api } from "../api/api";

const Sidebar = ({
  chats,
  activeChat,
  onSelectChat,
  onDeleteChat,
  onChatsChange,
}) => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

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

  return (
    <div
      style={{
        width: 320,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1e293b",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
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
          color: "#94a3b8",
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
                borderRadius: 14,
                marginBottom: 6,
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e293b";
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
                  border: "2px solid #334155",
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
                    color: "#94a3b8",
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
          color: "#94a3b8",
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
              color: "#64748b",
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
                borderRadius: 16,
                marginBottom: 8,

                background:
                  activeChat?.id === chat.id ? "#1d4ed8" : "transparent",

                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.background = "#1e293b";
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
                      border: "2px solid rgba(255,255,255,0.08)",
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
                          activeChat?.id === chat.id
                            ? "rgba(255,255,255,0.8)"
                            : "#94a3b8",

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
                    borderRadius: 10,
                    border: "none",
                    background: "rgba(239,68,68,0.15)",
                    color: "#f87171",
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
          borderTop: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "#111827",
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
              color: "#94a3b8",
            }}
          >
            Online
          </div>
        </div>

        {/* Clerk Settings */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => openUserProfile()}
            title="Settings"
            aria-label="Open settings"
            style={{
              width: 36,
              height: 36,
              border: "none",
              borderRadius: 10,
              background: "#1e293b",
              color: "#cbd5e1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#334155";
              e.currentTarget.style.color = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1e293b";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <Settings size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
