/** Title block at the top of each settings panel. */
export default function SettingsHeading({ heading, content, action }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 mb-6 border-b border-line">
            <div>
                <h2 className="text-lg font-bold text-heading">{heading}</h2>
                {content && <p className="text-sm text-muted mt-0.5">{content}</p>}
            </div>
            {action}
        </div>
    );
}

/** Grouped block inside a settings panel. */
export function SettingsSection({ title, description, children, footer }) {
    return (
        <section className="rounded-2xl border border-line bg-surface">
            {(title || description) && (
                <div className="px-5 pt-5">
                    {title && <h3 className="font-semibold text-heading">{title}</h3>}
                    {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
                </div>
            )}
            <div className="p-5">{children}</div>
            {footer && (
                <div className="flex justify-end gap-2 border-t border-line bg-surface-muted px-5 py-3.5 rounded-b-2xl">
                    {footer}
                </div>
            )}
        </section>
    );
}
