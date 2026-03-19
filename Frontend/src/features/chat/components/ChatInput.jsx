import { useState } from "react";
import { Send } from "lucide-react";


const ChatInput = ({ onSend, disabled = false }) => {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    await onSend?.(trimmed);
    setValue("");
  };

  return (
    <div className="sticky bottom-0 bg-(--bg)/70 px-4 py-5 backdrop-blur md:px-6 md:py-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="relative flex items-center rounded-full bg-(--card) px-3 py-2 shadow-(--shadow-glow) transition-all duration-200 hover:bg-(--surface-glow) focus-within:bg-(--input) focus-within:ring-2 focus-within:ring-(--accent)">

          <input
            type="text"
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
            className="w-full bg-transparent px-3 py-2 text-sm text-(--text) outline-none placeholder:text-(--text-secondary)"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-r from-(--brand-start) to-(--brand-end) text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
