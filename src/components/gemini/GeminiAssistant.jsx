import { useState } from "react";
import { askCustomerQuery } from "../../services/aiService";

const GeminiAssistant = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || loading) {
            return;
        }

        // Add user message
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: trimmedQuestion
            }
        ]);

        setQuestion("");
        setLoading(true);

        try {

            const data = await askCustomerQuery(trimmedQuestion);

            console.log("Gemini response:", data);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        data.answer ||
                        data.message ||
                        "I couldn't generate an answer."
                }
            ]);

        } catch (error) {

            console.error("Gemini error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        error?.response?.data?.message ||
                        "Something went wrong. Please try again."
                }
            ]);

        } finally {

            setLoading(false);

        }
    };


    const handleKeyDown = (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            handleAsk();

        }
    };


    return (
        <>
            {/* Floating Button */}

            {!isOpen && (

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="
        fixed
        bottom-6
        left-6
        z-50
        group
        flex
        items-center
        gap-2
        rounded-full
        text-sm
        px-4
        py-1
        font-semibold
        shadow-[0_0_30px_rgba(66,133,244,0.55)]
        bg-[linear-gradient(90deg,#4285f4,#9b72cb,#d96570,#4285f4)]
        bg-[length:300%_100%]
        animate-[gradient_3s_linear_infinite]
        shadow-[0_0_20px_rgba(66,133,244,0.35)]
        hover:shadow-[0_0_30px_rgba(66,133,244,0.55)]
        transition-shadow
        text-white
    "
                >

                    <span className="text-lg">
                        🤖
                    </span>

                    <span className="font-medium">
                        Ask Gemini
                    </span>

                </button>

            )}


            {/* Chat Window */}

            {isOpen && (

                <div
                    className="
                        fixed
                        bottom-6
                        left-6
                        z-50
                        flex
                        h-[600px]
                        w-[400px]
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        shadow-2xl
                    "
                >

                    {/* Header */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-gray-200
                            bg-blue-600
                            px-5
                            py-4
                            text-white
                        "
                    >

                        <div>

                            <h3 className="font-semibold">
                                AI Business Assistant
                            </h3>

                            <p className="text-xs text-blue-100">
                                Ask about your business
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="
                                rounded-lg
                                px-2
                                py-1
                                text-xl
                                hover:bg-blue-700
                            "
                        >
                            ×
                        </button>

                    </div>


                    {/* Messages */}

                    <div
                        className="
                            flex-1
                            overflow-y-auto
                            space-y-4
                            bg-gray-50
                            p-4
                        "
                    >

                        {messages.length === 0 && (

                            <div className="flex h-full items-center justify-center">

                                <div className="text-center">

                                    <div className="mb-3 text-4xl">
                                        🤖
                                    </div>

                                    <h4 className="font-semibold text-gray-800">
                                        How can I help?
                                    </h4>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Ask me about sales, products,
                                        inventory, orders or subscriptions.
                                    </p>

                                </div>

                            </div>

                        )}


                        {messages.map((message, index) => (

                            <div
                                key={index}
                                className={
                                    message.role === "user"
                                        ? "flex justify-end"
                                        : "flex justify-start"
                                }
                            >

                                <div
                                    className={
                                        message.role === "user"
                                            ? `
                                                max-w-[80%]
                                                rounded-2xl
                                                rounded-br-sm
                                                bg-blue-600
                                                px-4
                                                py-3
                                                text-sm
                                                text-white
                                            `
                                            : `
                                                max-w-[80%]
                                                rounded-2xl
                                                rounded-bl-sm
                                                bg-white
                                                px-4
                                                py-3
                                                text-sm
                                                text-gray-800
                                                shadow-sm
                                                border
                                                border-gray-100
                                            `
                                    }
                                >

                                    {message.text}

                                </div>

                            </div>

                        ))}


                        {/* Loading */}

                        {loading && (

                            <div className="flex justify-start">

                                <div
                                    className="
                                        rounded-2xl
                                        rounded-bl-sm
                                        bg-white
                                        px-4
                                        py-3
                                        text-sm
                                        text-gray-500
                                        shadow-sm
                                        border
                                        border-gray-100
                                    "
                                >
                                    Gemini is thinking...
                                </div>

                            </div>

                        )}

                    </div>


                    {/* Input */}

                    <div
                        className="
                            border-t
                            border-gray-200
                            bg-white
                            p-3
                        "
                    >

                        <div className="flex items-end gap-2">

                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask something..."
                                rows={1}
                                disabled={loading}
                                className="
                                    max-h-24
                                    min-h-[44px]
                                    flex-1
                                    resize-none
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-1
                                    focus:ring-blue-500
                                    disabled:bg-gray-100
                                "
                            />

                            <button
                                type="button"
                                onClick={handleAsk}
                                disabled={
                                    loading ||
                                    !question.trim()
                                }
                                className="
                                    rounded-xl
                                    bg-blue-600
                                    px-4
                                    py-3
                                    text-white
                                    transition
                                    hover:bg-blue-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                ➤
                            </button>

                        </div>

                        <p className="mt-2 text-center text-[11px] text-gray-400">
                            Press Enter to ask
                        </p>

                    </div>

                </div>

            )}

        </>
    );
};

export default GeminiAssistant;