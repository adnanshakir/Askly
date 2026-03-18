import { useMemo, useState } from "react";
import { Menu, Settings, User } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import ChatInput from "./components/ChatInput";

const initialChats = [
  { id: "chat-1", title: "Product Strategy" },
  { id: "chat-2", title: "Marketing Plan" },
  { id: "chat-3", title: "Code Assistant" },
  { id: "chat-4", title: "Daily Standup Notes" },
];

const initialMessages = {
  "chat-1": [
    {
      id: "m-1",
      sender: "ai",
      text: "I can help you shape a product strategy. What is your target market?",
    },
    {
      id: "m-2",
      sender: "user",
      text: "Small SaaS teams building internal tools.",
    },
    {
      id: "m-3",
      sender: "ai",
      text: "Great. We can focus on speed-to-value and lightweight integrations.",
    },
  ],
  "chat-2": [
    {
      id: "m-4",
      sender: "ai",
      text: "Let us draft your next campaign: audience, channel, and KPI.",
    },
  ],
  "chat-3": [
    {
      id: "m-5",
      sender: "ai",
      text: "Share a snippet and I will suggest improvements.",
    },
  ],
  "chat-4": [
    {
      id: "m-6",
      sender: "ai",
      text: "I can summarize team updates into concise standup notes.",
    },
  ],
};

const Dashboard = () => {
  const [chats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(initialChats[0].id);
  const [messagesByChat, setMessagesByChat] = useState(initialMessages);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeMessages = useMemo(
    () => messagesByChat[activeChatId] ?? [],
    [messagesByChat, activeChatId],
  );

  const handleSendMessage = (text) => {
    const userMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
    };

    const aiMessage = {
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: "ai",
      text: "Thanks. This is a placeholder AI response ready to be replaced by your backend.",
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), userMessage, aiMessage],
    }));
  };

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-var(--bg) text-var(--text)">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isDesktopCollapsed={isDesktopCollapsed}
        isMobileOpen={isMobileOpen}
        onSelectChat={setActiveChatId}
        onToggleDesktop={() => setIsDesktopCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-var(--bg)/80 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-var(--text-secondary) transition-colors hover:bg-var(--input) hover:text-var(--text) md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="hidden md:block" />

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-var(--text-secondary) transition-colors hover:bg-var(--input) hover:text-var(--text)"
              aria-label="Profile"
            >
              <User size={17} />
            </button>
          </div>
        </div>

        <ChatArea messages={activeMessages} />
        <ChatInput onSend={handleSendMessage} />
      </div>
    </main>
  );
};

export default Dashboard;
