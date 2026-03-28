import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

const ChatArea = ({ messages = [], isLoading = false }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  const scrollRef = useRef(null);
  const copiedTimerRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const chat = useChat();

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [safeMessages.length]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  async function handleCopyMessage(messageId, content) {
    if (!content) return;

    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);

    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
    }

    copiedTimerRef.current = setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  }

  async function handleRetry(index) {
    const previousMessage = safeMessages[index - 1];
    if (!previousMessage || previousMessage.sender !== "user") return;

    await chat.sendMessage(previousMessage.content ?? "");
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 md:px-6"
      >
        {safeMessages.length === 0 ? (
          <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
            <p className="text-sm text-(--text-secondary)">
              Send a message to start the chat.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-8">
            {safeMessages.map((message, index) => (
              <div
                key={message.id ?? `${message.sender}-${index}`}
                className={`animate-fade-in flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`group relative max-w-[85%] px-4 py-2 md:max-w-[70%] ${
                    message.sender === "user"
                      ? "bg-(--accent) rounded-br-none rounded-xl text-white text-sm"
                      : "text-(--text)/90 leading-relaxed tracking-[0.01em] text-base"
                  }`}
                >
                  {message.sender === "user" ? (
                    message.content
                  ) : (
                    <div className="markdown-body wrap-break-word text-(--text)/90 leading-relaxed tracking-[0.01em] text-[15px] md:text-[16px] font-normal font-sans [&_*]:font-sans [&_strong]:font-medium [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-(--input) [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-(--input) [&_pre]:p-3 [&_a]:underline">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content ?? ""}
                      </ReactMarkdown>
                    </div>
                  )}

                  {message.sender !== "user" ? (
                    <div className="mt-1 flex justify-end gap-0.5">
                      {copiedMessageId === (message.id ?? `${message.sender}-${index}`) ? (
                        <span className="rounded-md bg-(--card) px-2 py-1 text-xs text-(--text-secondary)">
                          Copied
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={async () => {
                          await handleCopyMessage(
                            message.id ?? `${message.sender}-${index}`,
                            message.content ?? "",
                          );
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--surface-glow) hover:text-(--text)"
                        aria-label="Copy AI response"
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await handleRetry(index);
                        }}
                        disabled={index === 0 || safeMessages[index - 1]?.sender !== "user"}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-(--text-secondary) hover:bg-(--surface-glow) hover:text-(--text) disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Retry AI response"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="animate-fade-in flex justify-start">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-(--card) px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--text-secondary)" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--text-secondary) [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--text-secondary) [animation-delay:300ms]" />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatArea;
