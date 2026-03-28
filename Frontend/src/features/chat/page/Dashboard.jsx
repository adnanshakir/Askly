import { useEffect, useMemo, useState } from "react";
import { Menu, Ghost } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import ChatInput from "../components/ChatInput";
import { useDispatch, useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { logout as logoutRequest } from "../../auth/service/auth.api";
import { logout as logoutAction } from "../../auth/auth.slice";
import { resetChatState } from "../chat.slice";
import { useNavigate } from "react-router";


const Dashboard = () => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chat = useChat();

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);

  const safeChats = useMemo(() => (Array.isArray(chats) ? chats : []), [chats]);
  const currentMessages = useMemo(() => {
    const activeChat = safeChats.find((item) => item.id === currentChatId);
    return Array.isArray(activeChat?.messages) ? activeChat.messages : [];
  }, [safeChats, currentChatId]);
  const showEmptyState = !currentChatId || currentMessages.length === 0;

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

  async function handleDeleteChat(chatId) {
    await chat.deleteChat(chatId);
  }

  function handlePinChat(chatId) {
    chat.pinChat(chatId);
  }

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // continue local cleanup even if network request fails
    } finally {
      dispatch(logoutAction());
      dispatch(resetChatState());
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
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
        onDeleteChat={handleDeleteChat}
        onPinChat={handlePinChat}
        onToggleDesktop={() => setIsDesktopCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
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

        {showEmptyState ? (
          <section className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 md:px-6">
            <div className="w-full max-w-3xl">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-semibold text-(--text) md:text-5xl">
                  Askly
                </h1>
              </div>

              <ChatInput onSend={handleSendMessage} disabled={isLoading} centered />
            </div>
          </section>
        ) : (
          <>
            <ChatArea messages={currentMessages} isLoading={isLoading} />
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
