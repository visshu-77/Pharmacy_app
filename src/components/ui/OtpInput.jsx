import { useEffect, useMemo, useRef } from "react";

/**
 * Boxed one-time-code entry.
 *
 * Handles what people actually do: typing, pasting the whole code, using the
 * phone keyboard, backspacing, and arrow keys. `value` is the code so far.
 */
export default function OtpInput({
    value = "",
    onChange,
    onComplete,
    length = 6,
    disabled = false,
    invalid = false,
    autoFocus = true
}) {
    const inputs = useRef([]);

    const digits = useMemo(
        () => Array.from({ length }, (_, i) => value[i] || ""),
        [value, length]
    );

    useEffect(() => {
        if (autoFocus) inputs.current[0]?.focus();
    }, [autoFocus]);

    const push = (next) => {
        const clean = next.replace(/\D/g, "").slice(0, length);
        onChange(clean);
        if (clean.length === length) onComplete?.(clean);
        return clean;
    };

    const handleChange = (index, raw) => {
        const typed = raw.replace(/\D/g, "");

        if (!typed) {
            // Cleared this box.
            push(value.slice(0, index) + value.slice(index + 1));
            return;
        }

        // Typing several digits (or a paste landing in one box) fills forward.
        const next = (value.slice(0, index) + typed + value.slice(index + typed.length)).slice(0, length);
        const clean = push(next);

        const focusAt = Math.min(index + typed.length, length - 1);
        inputs.current[clean.length >= length ? length - 1 : focusAt]?.focus();
    };

    const handleKeyDown = (index, event) => {
        if (event.key === "Backspace" && !digits[index] && index > 0) {
            event.preventDefault();
            push(value.slice(0, index - 1) + value.slice(index));
            inputs.current[index - 1]?.focus();
        } else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            inputs.current[index - 1]?.focus();
        } else if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();
            inputs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text");
        const clean = push(pasted);
        inputs.current[Math.min(clean.length, length - 1)]?.focus();
    };

    return (
        <div className="flex gap-2 sm:gap-2.5" role="group" aria-label={`${length}-digit verification code`}>
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(node) => { inputs.current[index] = node; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={length}
                    value={digit}
                    disabled={disabled}
                    aria-label={`Digit ${index + 1}`}
                    aria-invalid={invalid || undefined}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={[
                        "h-14 w-full min-w-0 rounded-xl border-2 bg-surface text-center",
                        "text-2xl font-bold tabular text-heading",
                        "transition-colors focus:outline-none focus:ring-4",
                        "disabled:opacity-60",
                        invalid
                            ? "border-danger focus:border-danger focus:ring-danger/15"
                            : digit
                                ? "border-primary/60 focus:border-primary focus:ring-primary/15"
                                : "border-line focus:border-primary focus:ring-primary/15"
                    ].join(" ")}
                />
            ))}
        </div>
    );
}
