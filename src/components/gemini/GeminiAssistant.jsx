import { useEffect, useRef, useState } from "react";
import { Sparkles, X, SendHorizontal, Bot } from "lucide-react";

import { askCustomerQuery } from "../../services/aiService";
import { useBusiness } from "../../context/BusinessContext";

/**
 * Floating AI assistant. Suggested questions adapt to the shop's business
 * type so a hardware owner is not asked about expiring medicines.
 */
const GeminiAssistant = () => {

    const { term, profile, shopName } = useBusiness();

    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    const suggestions = [
        "How much did I sell today?",
        `Which ${term.itemsLower} are running low?`,
        `What are my top selling ${term.itemsLower} this month?`,
        profile.tracksExpiry
            ? `Which ${term.itemsLower} expire soon?`
            : `Which ${term.category.toLowerCase()} earns the most?`
    ];

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
        });
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const ask = async (text) => {

        const trimmed = (text ?? question).trim();

        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
        setQuestion("");
        setLoading(true);

        try {
            const data = await askCustomerQuery(trimmed);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        data.answer ||
                        data.message ||
                        "I couldn't find an answer to that."
                }
            ]);

        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    error: true,
                    text:
                        error?.response?.data?.message ||
                        "Something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            ask();
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="no-print fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#2563eb,#7c3aed,#db2777,#2563eb)] bg-[length:300%_100%] animate-[gradient_6s_linear_infinite] h-12 w-12 sm:w-auto sm:h-11 sm:pl-3.5 sm:pr-4 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
                    aria-label="Open AI assistant"
                >
                    <Sparkles className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Ask AI</span>
                </button>
            )}

            {isOpen && (
                <div
                    className="no-print fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-5 sm:bottom-5 flex h-[min(620px,calc(100vh-1.5rem))] sm:w-[400px] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-lg animate-slide-up"
                    role="dialog"
                    aria-label="AI business assistant"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white/20">
                                <Sparkles className="h-4 w-4" aria-hidden="true" />
                            </span>

                            <div className="min-w-0">
                                <h3 className="font-semibold text-sm text-white">
                                    Business Assistant
                                </h3>
                                <p className="text-[11px] text-white/75 truncate">
                                    Answers from {shopName}'s own data
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="grid place-items-center h-8 w-8 rounded-lg hover:bg-white/15 transition-colors"
                            aria-label="Close assistant"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto thin-scrollbar bg-surface-muted p-4 space-y-3"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col justify-center">
                                <div className="text-center">
                                    <span className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-primary/10 text-primary">
                                        <Bot className="h-6 w-6" aria-hidden="true" />
                                    </span>

                                    <h4 className="mt-3 font-semibold text-heading">
                                        How can I help?
                                    </h4>

                                    <p className="mt-1 text-xs text-muted">
                                        Ask about sales, {term.itemsLower}, stock or payments.
                                    </p>
                                </div>

                                <div className="mt-5 space-y-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => ask(suggestion)}
                                            className="w-full text-left rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-medium text-body hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                            >
                                <div
                                    className={
                                        message.role === "user"
                                            ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-white whitespace-pre-wrap"
                                            : [
                                                "max-w-[85%] rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                                                message.error
                                                    ? "border-danger/25 bg-danger/5 text-danger"
                                                    : "border-line bg-surface text-body"
                                            ].join(" ")
                                    }
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
                                    {[0, 1, 2].map((dot) => (
                                        <span
                                            key={dot}
                                            className="h-1.5 w-1.5 rounded-full bg-faint animate-bounce"
                                            style={{ animationDelay: `${dot * 120}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-line bg-surface p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your shop…"
                                rows={1}
                                disabled={loading}
                                className="max-h-24 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-heading focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={() => ask()}
                                disabled={loading || !question.trim()}
                                className="grid place-items-center h-11 w-11 shrink-0 rounded-xl bg-primary text-white hover:bg-primary-strong transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                aria-label="Send question"
                            >
                                <SendHorizontal className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mt-2 text-center text-[10px] text-faint">
                            Enter to send · Shift + Enter for a new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default GeminiAssistant;
