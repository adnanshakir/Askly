import { useEffect, useMemo, useState } from "react";
import { Menu, Ghost } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import ChatInput from "../components/ChatInput";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";


const Dashboard = () => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const chat = useChat();

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);

  const safeChats = useMemo(() => (Array.isArray(chats) ? chats : []), [chats]);
  const currentMessages = useMemo(() => {
    const activeChat = safeChats.find((item) => item.id === currentChatId);
    return Array.isArray(activeChat?.messages) ? activeChat.messages : [];
  }, [safeChats, currentChatId]);

  useEffect(() => {
    chat.loadChats();
  }, []);

  async function handleSendMessage(message) {
    await chat.sendMessage(message);
  }

  function handleSelectChat(chatId) {
    chat.selectChat(chatId);
  }

  function handleNewChat() {
    chat.startNewChat();
    setIsMobileOpen(false);
  }

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-(--bg) text-(--text)">
      <Sidebar
        chats={safeChats}
        activeChatId={currentChatId}
        isDesktopCollapsed={isDesktopCollapsed}
        isMobileOpen={isMobileOpen}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onToggleDesktop={() => setIsDesktopCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={() => {}}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-(--bg)/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-semibold tracking-wide text-(--text)">
              Askly
            </span>
          </div>

          <div className="hidden md:block" />

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="Profile"
            >
              <Ghost size={18}/>
            </button>
          </div>
        </div>

        <ChatArea messages={currentMessages} />
        <ChatInput
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </main>
  );
};

export default Dashboard;
