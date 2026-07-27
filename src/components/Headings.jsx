import { Upload, Download, Plus } from "lucide-react";

export default function HeadingWithButton({
    mainheading,
    contentLine,
    firstButton,
    secondButton,
    thirdButton
}) {
    return (
        <div className="flex justify-between mt-5">
            <div>
                <h2 className="text-xl font-semibold">{mainheading}</h2>
                <p className="text-sm text-text">{contentLine}</p>
            </div>
            <div className="flex gap-2 items-center">
                <button className="px-6 py-2 rounded-lg border-primary text-sm text-text font-semibold border flex items-center gap-2 cursor-pointer">
                    <Download size={15} />
                    {firstButton}
                </button>
                <button className="px-6 py-2 rounded-lg border-primary text-sm text-text font-semibold border flex items-center gap-2 cursor-pointer">
                    <Upload size={15} />
                    {secondButton}
                </button>
                <button className="bg-primary px-6 py-2 rounded-lg text-sm text-white font-semibold border flex items-center gap-2 cursor-pointer">
                    <Plus size={15} />
                    {thirdButton}
                </button>
            </div>
        </div>
    )
}