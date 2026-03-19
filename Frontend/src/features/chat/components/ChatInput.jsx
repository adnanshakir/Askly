import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";


const ChatInput = ({ onSend, disabled = false }) => {
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
    <div className="sticky bottom-0 bg-(--bg)/70 px-4 py-4 backdrop-blur md:px-6 md:py-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-end gap-2 rounded-3xl bg-(--card) px-3 py-2 transition-all duration-200 hover:bg-(--surface-glow) focus-within:bg-(--input) focus-within:ring-1 focus-within:ring-(--border)">
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
            className="max-h-36 min-h-10 w-full resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm text-(--text) outline-none placeholder:text-(--text-secondary)"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="mb-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--accent) text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-(--text-secondary)/60">
          Askly can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
