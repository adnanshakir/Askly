const ChatArea = ({ messages }) => {
	return (
		<section className="flex min-h-0 flex-1 flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-6">
				<div className="mx-auto flex w-full max-w-4xl flex-col gap-y-6">
					{messages.map((message) => (
						<div
							key={message.id}
							className={`animate-fade-in flex ${
								message.sender === "user" ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_8px_26px_rgba(0,0,0,0.10)] md:max-w-[70%] ${
									message.sender === "user"
										? "bg-[var(--input)] text-[var(--text)]"
										: "bg-[var(--card)]/95 text-[var(--text)]"
								}`}
							>
								{message.text}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ChatArea;
