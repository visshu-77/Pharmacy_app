import { useId } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";

const CONTROL =
    "w-full bg-surface text-heading rounded-lg border border-line " +
    "transition-colors duration-150 " +
    "hover:border-line-strong " +
    "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";

function Wrapper({ id, label, hint, error, required, className, children }) {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-xs font-semibold text-muted mb-1.5"
                >
                    {label}
                    {required && (
                        <span className="text-danger ml-0.5" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>
            )}

            {children}

            {error ? (
                <p className="flex items-center gap-1 text-xs text-danger mt-1.5">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {error}
                </p>
            ) : (
                hint && <p className="text-xs text-faint mt-1.5">{hint}</p>
            )}
        </div>
    );
}

/** Labelled text input with optional leading icon and trailing adornment. */
export function Input({
    label,
    hint,
    error,
    icon: Icon,
    suffix,
    className = "",
    required,
    ...props
}) {
    const id = useId();

    return (
        <Wrapper
            id={id}
            label={label}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            <div className="relative">
                {Icon && (
                    <Icon
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint"
                        aria-hidden="true"
                    />
                )}

                <input
                    id={id}
                    required={required}
                    aria-invalid={error ? "true" : undefined}
                    className={[
                        CONTROL,
                        "h-11 text-sm",
                        Icon ? "pl-9" : "pl-3",
                        suffix ? "pr-14" : "pr-3",
                        error ? "border-danger focus:border-danger focus:ring-danger/20" : ""
                    ].join(" ")}
                    {...props}
                />

                {suffix && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-faint">
                        {suffix}
                    </span>
                )}
            </div>
        </Wrapper>
    );
}

/** Labelled select. Pass `options` as strings or {value, label} objects. */
export function Select({
    label,
    hint,
    error,
    icon: Icon,
    options = [],
    placeholder,
    className = "",
    required,
    children,
    ...props
}) {
    const id = useId();

    return (
        <Wrapper
            id={id}
            label={label}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            <div className="relative">
                {Icon && (
                    <Icon
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint"
                        aria-hidden="true"
                    />
                )}

                <select
                    id={id}
                    required={required}
                    aria-invalid={error ? "true" : undefined}
                    className={[
                        CONTROL,
                        "h-11 text-sm appearance-none cursor-pointer",
                        Icon ? "pl-9" : "pl-3",
                        "pr-9",
                        error ? "border-danger focus:border-danger focus:ring-danger/20" : ""
                    ].join(" ")}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}

                    {options.map((option) => {
                        const value =
                            typeof option === "object" ? option.value : option;
                        const text =
                            typeof option === "object" ? option.label : option;

                        return (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        );
                    })}

                    {children}
                </select>

                <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint"
                    aria-hidden="true"
                />
            </div>
        </Wrapper>
    );
}

export function Textarea({
    label,
    hint,
    error,
    rows = 3,
    className = "",
    required,
    ...props
}) {
    const id = useId();

    return (
        <Wrapper
            id={id}
            label={label}
            hint={hint}
            error={error}
            required={required}
            className={className}
        >
            <textarea
                id={id}
                rows={rows}
                required={required}
                aria-invalid={error ? "true" : undefined}
                className={[
                    CONTROL,
                    "px-3 py-2.5 text-sm resize-y",
                    error ? "border-danger focus:border-danger focus:ring-danger/20" : ""
                ].join(" ")}
                {...props}
            />
        </Wrapper>
    );
}

/** Accessible on/off switch used throughout Settings. */
export function Toggle({ checked, onChange, label, description, disabled }) {
    const id = useId();

    return (
        <div className="flex items-start justify-between gap-3 sm:gap-6 py-3.5">
            <div className="min-w-0">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-heading cursor-pointer"
                >
                    {label}
                </label>

                {description && (
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={[
                    // The knob is anchored with left-0.5 — without a horizontal
                    // anchor it would sit at its "static position" (the middle
                    // of the button) and slide out of the track.
                    "relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    checked ? "bg-primary" : "bg-line-strong"
                ].join(" ")}
            >
                <span
                    aria-hidden="true"
                    className={[
                        "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm",
                        "transition-transform duration-200",
                        checked ? "translate-x-5" : "translate-x-0"
                    ].join(" ")}
                />
            </button>
        </div>
    );
}
