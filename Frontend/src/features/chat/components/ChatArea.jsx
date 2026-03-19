import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatArea = ({ messages = [] }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-6">
        {safeMessages.length === 0 ? (
          <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
            <p className="text-sm text-(--text-secondary)">
              Send a message to start the chat.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-6">
            {safeMessages.map((message, index) => (
              <div
                key={message.id ?? `${message.sender}-${index}`}
                className={`animate-fade-in flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-(--shadow-glow) md:max-w-[70%] ${
                    message.sender === "user"
                      ? "bg-linear-to-r from-(--brand-start)  to-(--brand-end) rounded-br-none text-white"
                      : "bg-(--card) text-(--text)"
                  }`}
                >
                  {message.sender === "user" ? (
                    message.content
                  ) : (
                    <div className="markdown-body break-words [&_a]:underline [&_code]:rounded [&_code]:bg-(--input) [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-(--input) [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content ?? ""}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatArea;
