import {
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelRight,
  X,
} from "lucide-react";

const Sidebar = ({
  chats = [],
  activeChatId,
  isDesktopCollapsed,
  isMobileOpen,
  onNewChat,
  onSelectChat,
  onToggleDesktop,
  onCloseMobile,
  onLogout,
}) => {
  const showCollapsedDesktop = isDesktopCollapsed && !isMobileOpen;
  const safeChats = Array.isArray(chats) ? chats : [];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-(--border)/40 bg-(--card)/80 backdrop-blur-md transition-all duration-300 ease-out md:static md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "md:w-14" : "md:w-72"} w-72`}
      >
        {showCollapsedDesktop ? (
          <div className="hidden md:flex md:items-start md:justify-center md:px-2 md:pt-4">
            <button
              type="button"
              onClick={onToggleDesktop}
              className="inline-flex rounded-xl p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="Toggle sidebar"
            >
              <PanelRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="relative flex items-center px-4 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden truncate text-sm font-semibold tracking-wide text-(--text) md:inline">
                  Askly
                </span>
              </div>

              <button
                type="button"
                onClick={onToggleDesktop}
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-xl p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text) md:inline-flex"
                aria-label="Toggle sidebar"
              >
                <PanelLeft size={18} />
              </button>

              <button
                type="button"
                onClick={onCloseMobile}
                className="ml-auto inline-flex rounded-xl p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text) md:hidden"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-2">
              <button
                type="button"
                onClick={() => {
                  onNewChat?.();
                  onCloseMobile();
                }}
                className="mb-3 w-full rounded-xl bg-(--accent) px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
              >
                + New Chat
              </button>

              <p className="text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                Your Chats
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-6">
              {safeChats.length === 0 ? (
                <p className="px-2 text-sm text-(--text-secondary)">
                  Start a new conversation.
                </p>
              ) : (
                <ul className="space-y-3">
                  {safeChats.map((chat) => {
                  const isActive = chat.id === activeChatId;

                  return (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChat?.(chat.id);
                          onCloseMobile();
                        }}
                        className={`flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-200 ${
                          isActive
                            ? "bg-(--surface-glow) text-(--text)"
                            : "text-(--text-secondary) hover:bg-(--surface-glow) hover:text-(--text)"
                        }`}
                        title={chat.title}
                      >
                        <MessageSquare size={16} className="shrink-0" />
                        <span className="block truncate">{chat.title}</span>
                      </button>
                    </li>
                  );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-auto px-2 pb-4 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </aside>

      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-(--bg)/70 backdrop-blur-sm transition-opacity duration-300 md:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar overlay"
        />
      ) : null}
    </>
  );
};

export default Sidebar;
