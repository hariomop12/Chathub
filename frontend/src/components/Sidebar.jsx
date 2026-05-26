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
    </div>
  );
};

export default Sidebar;
