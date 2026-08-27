export default function SettingsHeading({ heading, content }) {
    return (
        <div className="mb-6 border-b pb-6">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {heading}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
                {content}
            </p>
        </div>
    )
}