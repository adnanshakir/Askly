import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, Plus } from "lucide-react";

const ChatInput = ({ onSend, disabled = false, centered = false }) => {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
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

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript ?? "";
      if (!transcript) return;

      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));

      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 0);
    };

    recognition.onerror = (event) => {
      console.log("Speech error:", event.error, event.message);
      setIsListening(false);
    };

    try {
      recognition.start();
      console.log("recognition started");
    } catch (err) {
      console.error("start failed:", err);
    }
    textAreaRef.current?.focus();
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
        <div className="relative flex flex-col rounded-2xl border border-(--border) bg-(--card) px-4 py-3 transition-colors duration-200 hover:bg-(--surface-glow) focus-within:bg-(--input) focus-within:ring-1 focus-within:ring-(--border)">
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
            className={`w-full resize-none overflow-y-auto bg-transparent text-sm text-(--text) outline-none placeholder:text-(--text-secondary) ${
              centered ? "text-base" : "text-sm"
            }`}
          />

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-(--text-secondary) hover:bg-(--surface-glow) transition"
                aria-label="Attach"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceInput}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isListening}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-(--text-secondary) hover:bg-(--surface-glow) transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  isListening
                    ? "text-red-400 bg-red-500/10"
                    : "text-(--text-secondary) hover:bg-(--surface-glow)"
                }`}
                aria-label="Voice input"
              >
                <Mic size={16} />
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!value.trim() || disabled}
                className="h-9 w-9 rounded-full flex items-center justify-center bg-(--accent) text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <ArrowUp size={18} strokeWidth={3} />
              </button>
            </div>
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
