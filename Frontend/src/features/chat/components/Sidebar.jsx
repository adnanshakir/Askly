import {
  LogOut,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  PenSquare,
  Pin,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const Sidebar = ({
  chats = [],
  activeChatId,
  isDesktopCollapsed,
  isMobileOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onPinChat,
  onToggleDesktop,
  onCloseMobile,
  onLogout,
}) => {
  const showCollapsedDesktop = isDesktopCollapsed && !isMobileOpen;
  const safeChats = Array.isArray(chats) ? chats : [];
  const orderedChats = useMemo(() => {
    const byRecent = (a, b) =>
      Number(b?.lastUpdated ?? 0) - Number(a?.lastUpdated ?? 0);
    const pinned = safeChats.filter((chat) => Boolean(chat?.pinned)).sort(byRecent);
    const unpinned = safeChats.filter((chat) => !chat?.pinned).sort(byRecent);
    return [...pinned, ...unpinned];
  }, [safeChats]);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const listRef = useRef(null);

  const cleanTitle = (title) =>
    String(title ?? "").replace(/^"(.*)"$/, "$1");

  useEffect(() => {
    function handleOutsideMouseDown(event) {
      if (!listRef.current?.contains(event.target)) {
        setOpenMenuChatId(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, []);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-(--card)/80 backdrop-blur-md transition-all duration-300 ease-out md:static md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDesktopCollapsed ? "md:w-12" : "md:w-60"} w-60`}
      >
        {showCollapsedDesktop ? (
          <div className="hidden md:flex md:flex-col md:items-center md:justify-start md:gap-2 md:px-2 md:pt-4">
            <button
              type="button"
              onClick={onToggleDesktop}
              className="inline-flex rounded-xl p-2 text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="Toggle sidebar"
            >
              <PanelRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => {
                onNewChat?.();
                onCloseMobile?.();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-(--text-secondary) hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="New chat"
              title="New chat"
            >
              <PenSquare size={18} />
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
                  onCloseMobile?.();
                }}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-(--input) px-3 py-2 text-sm text-(--text) transition-colors hover:bg-(--surface-glow)"
              >
                <PenSquare size={16} />
                <span>New Chat</span>
              </button>

              <p className="text-xs font-medium uppercase tracking-wide text-(--text-secondary)">
                Your Chats
              </p>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-6">
              {orderedChats.length === 0 ? (
                <p className="px-2 text-sm text-(--text-secondary)">
                  Start a new conversation.
                </p>
              ) : (
                <ul className="space-y-1">
                  {orderedChats.map((chat) => {
                  const isActive = chat.id === activeChatId;

                  return (
                    <li key={chat.id}>
                      <div className="group relative">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectChat?.(chat.id);
                            onCloseMobile();
                            setOpenMenuChatId(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
                            isActive
                              ? "bg-(--surface-glow) text-(--text)"
                              : "text-(--text-secondary) hover:bg-(--surface-glow) hover:text-(--text)"
                          }`}
                          title={cleanTitle(chat.title)}
                        >
                          <span className="block min-w-0 flex-1 truncate pr-2">
                            {cleanTitle(chat.title)}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuChatId((prev) => (prev === chat.id ? null : chat.id));
                          }}
                          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-(--text-secondary) opacity-0 transition-all hover:bg-(--surface-glow) hover:text-(--text) group-hover:opacity-100"
                          aria-label="Open chat menu"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {chat.pinned ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onPinChat?.(chat.id);
                              setOpenMenuChatId(null);
                            }}
                            className="absolute right-10 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-(--text) opacity-100 transition-all hover:bg-(--surface-glow)"
                            aria-label="Unpin chat"
                          >
                            <Pin size={14} />
                          </button>
                        ) : null}

                        {openMenuChatId === chat.id ? (
                          <div className="absolute right-2 top-[calc(100%+4px)] z-20 min-w-36 rounded-md bg-(--card) p-1 text-(--text) opacity-100 shadow-(--shadow-glow) transition-all duration-150">
                            <button
                              type="button"
                              onClick={() => {
                                onPinChat?.(chat.id);
                                setOpenMenuChatId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-(--surface-glow)"
                            >
                              <Pin size={14} />
                              <span>{chat.pinned ? "Unpin Chat" : "Pin Chat"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteChat?.(chat.id);
                                setOpenMenuChatId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10"
                            >
                              <Trash size={14} />
                              <span>Delete Chat</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--input) px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
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
