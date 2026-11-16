export default async function downloadElementAsPdf(element, filename) {
    element.classList.add("pdf-export");

    try {
        const pageWidth = Math.ceil(element.getBoundingClientRect().width);
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
            import("html2canvas"),
            import("jspdf")
        ]);
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        const canvas = await html2canvas(element, {
            scale: 3,
            width: pageWidth,
            windowWidth: pageWidth,
            useCORS: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0
        });
        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
        const margin = 5;
        const availableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
        const availableHeight = pdf.internal.pageSize.getHeight() - margin * 2;
        const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
        const imageWidth = canvas.width * scale;
        const imageHeight = canvas.height * scale;
        const imageX = (pdf.internal.pageSize.getWidth() - imageWidth) / 2;

        pdf.addImage(canvas.toDataURL("image/png"), "PNG", imageX, margin, imageWidth, imageHeight);
        const safeFilename = String(filename || "document").replace(/[\\/:*?"<>|]/g, "-");
        await pdf.save(`${safeFilename || "document"}.pdf`, { returnPromise: true });
    } finally {
        element.classList.remove("pdf-export");
    }
}
