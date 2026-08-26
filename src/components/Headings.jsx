import { Upload, Download, Plus } from "lucide-react";

export default function HeadingWithButton({
    mainheading,
    contentLine,
    firstButton,
    secondButton,
    thirdButton,
    onThirdButtonClick,
    onFirstButtonClick,
    onSecondButtonClick,
}) {
    return (
        <div className="flex sm:flex-row flex-col justify-between mt-5">

            <div>
                <h2 className="text-xl dark:text-white font-semibold">
                    {mainheading}
                </h2>

                <p className="text-sm text-text">
                    {contentLine}
                </p>
            </div>

            <div className="flex gap-2 items-center sm:mt-0 mt-4">

                {/* Export */}
                {firstButton && (
                    <button
                        onClick={onFirstButtonClick}
                        className="px-4 py-2 rounded-lg border-primary text-sm text-text dark:text-white dark:bg-darkColor dark:border-white/50 font-semibold border flex items-center gap-2 cursor-pointer"
                    >
                        <Download size={15} />
                        {firstButton}
                    </button>
                )}

                {/* Import */}
                {secondButton && (
                    <button
                        onClick={onSecondButtonClick}
                        className="px-4 py-2 rounded-lg border-primary text-sm text-text dark:text-white dark:bg-darkColor dark:border-white/50 font-semibold border flex items-center gap-2 cursor-pointer"
                    >
                        <Upload size={15} />
                        {secondButton}
                    </button>
                )}

                {/* Add */}
                {thirdButton && (
                    <button
                        onClick={onThirdButtonClick}
                        className="bg-primary px-4 py-2 rounded-lg text-sm text-white dark:text-white dark:bg-darkColor dark:border-white/50 font-semibold border flex items-center gap-2 cursor-pointer"
                    >
                        <Plus size={15} />
                        {thirdButton}
                    </button>
                )}

            </div>
        </div>
    );
}