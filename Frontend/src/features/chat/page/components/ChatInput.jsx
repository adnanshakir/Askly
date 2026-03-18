import { useState } from "react";
import { Plus, Send } from "lucide-react";

const ChatInput = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="sticky bottom-0 bg-[var(--bg)]/70 px-4 py-5 backdrop-blur md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center rounded-full bg-[var(--card)] px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-[var(--input)]/80 focus-within:bg-[var(--input)] focus-within:shadow-[0_0_0_3px_rgba(229,9,20,0.14)]">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--input)] hover:text-[var(--text)]"
            aria-label="Add attachment"
          >
            <Plus size={18} />
          </button>

          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask something..."
            className="w-full bg-transparent px-3 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)]"
          />

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[var(--brand-start)] to-[var(--brand-end)] text-white transition-opacity hover:opacity-90"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
