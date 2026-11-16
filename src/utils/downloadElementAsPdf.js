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
        const pixelsPerMm = canvas.width / availableWidth;
        const pageHeightInPixels = Math.floor(availableHeight * pixelsPerMm);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        const pageContext = pageCanvas.getContext("2d");
        if (!pageContext) {
            throw new Error("Could not prepare an invoice PDF page");
        }

        for (let offsetY = 0, page = 0; offsetY < canvas.height; page += 1) {
            const sliceHeight = Math.min(pageHeightInPixels, canvas.height - offsetY);
            pageCanvas.height = sliceHeight;
            pageContext.drawImage(
                canvas,
                0,
                offsetY,
                canvas.width,
                sliceHeight,
                0,
                0,
                canvas.width,
                sliceHeight
            );

            if (page > 0) pdf.addPage();
            pdf.addImage(
                pageCanvas.toDataURL("image/png"),
                "PNG",
                margin,
                margin,
                availableWidth,
                sliceHeight / pixelsPerMm
            );
            offsetY += sliceHeight;
        }

        const safeFilename = String(filename || "document").replace(/[\\/:*?"<>|]/g, "-");
        await pdf.save(`${safeFilename || "document"}.pdf`, { returnPromise: true });
    } finally {
        element.classList.remove("pdf-export");
    }
}
