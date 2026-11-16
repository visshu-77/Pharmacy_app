export default function InvoiceTerms() {
    return (
        <section className="border-t border-slate-300 py-3 text-[10px] print:break-inside-avoid">
            <h2 className="text-sm font-bold">Terms and Conditions</h2>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5 leading-snug">
                <li>Project designing, implementation, installation and commissioning</li>
                <li>
                    Site survey, erection of structure and panels, inverter mounting, DC cabling to inverters and AC cabling to main LT panel room. Underground AC cabling/earthing in client scope
                </li>
                <li>Yield analysis, cost benefit and ROI forecast.</li>
                <li>Project documentation and management</li>
                <li>After sales services of the system</li>
            </ol>
        </section>
    );
}
