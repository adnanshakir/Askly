import { useEffect, useRef, useState } from "react";
import { ArrowUp, Plus } from "lucide-react";


const ChatInput = ({ onSend, disabled = false, centered = false }) => {
  const [value, setValue] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (!textAreaRef.current) return;

    textAreaRef.current.style.height = "auto";
    const nextHeight = Math.min(textAreaRef.current.scrollHeight, 144);
    textAreaRef.current.style.height = `${nextHeight}px`;
  }, [value]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    await onSend?.(trimmed);
    setValue("");

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
    }
  };

  return (
    <div
      className={
        centered
          ? "w-full px-4"
          : "sticky bottom-0 bg-(--bg)/70 px-4 py-4 backdrop-blur md:px-6 md:py-5"
      }
    >
      <div className={`mx-auto w-full ${centered ? "max-w-2xl" : "max-w-4xl"}`}>
        <div className="relative rounded-2xl border border-(--border) bg-(--card) px-3 py-2 transition-all duration-200 hover:bg-(--surface-glow) focus-within:bg-(--input) focus-within:ring-1 focus-within:ring-(--border)">
          <div className="flex h-12 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-(--text-secondary) transition-colors hover:bg-(--surface-glow) hover:text-(--text)"
              aria-label="Attach"
            >
              <Plus size={16} />
            </button>

          <textarea
            ref={textAreaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={disabled}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask something..."
            rows={1}
            className={`max-h-36 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-(--text) outline-none placeholder:text-(--text-secondary) ${
              centered ? "text-base" : "text-sm"
            }`}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--accent) text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send message"
          >
            <ArrowUp size={22} strokeWidth={3} />

          </button>
          </div>

          <div className="mt-1 flex items-center justify-between px-1 pb-1">
            <span className="text-xs text-(--text-secondary)">Gemini 2.0 Flash</span>
          </div>
        </div>

        {!centered ? (
          <p className="mt-2 text-center text-xs text-(--text-secondary)/60">
            Askly can make mistakes. Check important info.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ChatInput;
