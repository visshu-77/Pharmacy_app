import { Upload, Download, Plus } from "lucide-react";

import Button from "./ui/Button";

/**
 * Page title with up to three actions (Export / Import / Add).
 * Kept for older pages; new pages use ui/PageHeader directly.
 */
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-4">

            <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {mainheading}
                </h1>

                {contentLine && (
                    <p className="text-sm text-muted mt-0.5">
                        {contentLine}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                {firstButton && (
                    <Button variant="secondary" icon={Download} onClick={onFirstButtonClick}>
                        {firstButton}
                    </Button>
                )}

                {secondButton && (
                    <Button variant="secondary" icon={Upload} onClick={onSecondButtonClick}>
                        {secondButton}
                    </Button>
                )}

                {thirdButton && (
                    <Button icon={Plus} onClick={onThirdButtonClick}>
                        {thirdButton}
                    </Button>
                )}
            </div>
        </div>
    );
}
