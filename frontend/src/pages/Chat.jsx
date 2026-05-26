import { useState, useEffect, useCallback, useRef } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { connectSocket, getSocket, disconnectSocket } from "../socket/socket";
import { api } from "../api/api";

const getDisplayName = (user) => user?.username || user?.fullName || "Someone";

const Chat = () => {
  const { user } = useUser();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const activeChatIdRef = useRef(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    activeChatIdRef.current = activeChat?.id || null;
  }, [activeChat?.id]);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  const fetchChats = useCallback(async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (err) {
      console.error("fetch chats error:", err);
    }
  }, []);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
    } catch (err) {
      console.error("fetch messages error:", err);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const socket = connectSocket();

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[message.sender_id];
        return next;
      });
      fetchChats();
    });

    socket.on("user-typing", ({ chatId, userId, username }) => {
      setTypingUsers((prev) => {
        if (userId === userIdRef.current || chatId !== activeChatIdRef.current) return prev;
        return { ...prev, [userId]: username || "Someone" };
      });
    });

    socket.on("user-stop-typing", ({ chatId, userId }) => {
      setTypingUsers((prev) => {
        if (userId === userIdRef.current || chatId !== activeChatIdRef.current) return prev;
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      disconnectSocket();
    };
  }, [fetchChats]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      const socket = getSocket();
      socket.emit("join-room", activeChat.id);

      return () => {
        socket.emit("leave-room", activeChat.id);
        setTypingUsers({});
      };
    } else {
      setMessages([]);
      setTypingUsers({});
    }
  }, [activeChat, fetchMessages]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.deleteChat(chatId);
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        setMessages([]);
        setTypingUsers({});
      }
      await fetchChats();
    } catch (err) {
      console.error("delete chat error:", err);
    }
  };

  const handleSendMessage = async (content, fileInfo) => {
    if (!activeChat || !user) return;

    const socket = getSocket();
    socket.emit("send-message", {
      chatId: activeChat.id,
      senderId: user.id,
      content,
      fileUrl: fileInfo?.url || null,
      fileName: fileInfo?.name || null,
      fileType: fileInfo?.type || null,
      fileSize: fileInfo?.size || null,
    });
    socket.emit("stop-typing", {
      chatId: activeChat.id,
      userId: user.id,
    });
  };

  const handleTyping = useCallback((isTyping) => {
    if (!activeChat || !user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit(isTyping ? "typing" : "stop-typing", {
      chatId: activeChat.id,
      userId: user.id,
      username: getDisplayName(user),
    });
  }, [activeChat, user]);

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#f8fafc",
      color: "#1a1a1a",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <UserButton afterSignOutUrl="/" />
      </div>
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onChatsChange={fetchChats}
      />
      <ChatBox
        chat={activeChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        typingUsers={typingUsers}
      />
    </div>
  );
};

export default Chat;
