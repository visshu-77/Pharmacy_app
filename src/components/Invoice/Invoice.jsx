import { useState } from "react";
import { Printer, MessageCircle, Plus, Home, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import { useToast } from "../ui/Toast";
import { useBusiness } from "../../context/BusinessContext";
// import BRAND from "../../config/brand";
import { amountInWords } from "../../utils/amountInWords";
import downloadElementAsPdf from "../../utils/downloadElementAsPdf";
import InvoiceTerms from "./InvoiceTerms";

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const getInvoiceItems = (order) => {
    const items = order.items || [];
    const subtotal = Number(order.subtotal) || 0;
    const discount = Number(order.discount) || 0;
    const taxableSubtotal = round2(subtotal - discount);
    const discountRatio = subtotal > 0 ? taxableSubtotal / subtotal : 0;
    let allocatedTaxable = 0;
    let allocatedLegacyTax = 0;

    return items.map((item, index) => {
        const fallbackTaxable = index === items.length - 1
            ? round2(taxableSubtotal - allocatedTaxable)
            : round2(Number(item.total) * discountRatio);
        const taxableAmount = item.taxableAmount == null
            ? fallbackTaxable
            : Number(item.taxableAmount);
        allocatedTaxable += taxableAmount;

        let cgst = item.cgst == null ? null : Number(item.cgst);
        let sgst = item.sgst == null ? null : Number(item.sgst);

        if (cgst == null && sgst == null) {
            const lineTax = index === items.length - 1
                ? round2((Number(order.tax) || 0) - allocatedLegacyTax)
                : round2((Number(order.tax) || 0) * (subtotal > 0 ? Number(item.total) / subtotal : 0));
            allocatedLegacyTax += lineTax;
            cgst = round2(lineTax / 2);
            sgst = round2(lineTax - cgst);
        }

        cgst = cgst || 0;
        sgst = sgst || 0;

        return {
            ...item,
            taxableAmount,
            cgst,
            sgst,
            amount: item.amount == null
                ? round2(taxableAmount + cgst + sgst)
                : Number(item.amount)
        };
    });
};

export default function Invoice({ order, onNewBill }) {
    const navigate = useNavigate();
    const { user, profile, shopName, formatMoney } = useBusiness();
    const toast = useToast();
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    if (!order) return null;

    const money = (value) => formatMoney(value, { decimals: 2 });
    const invoiceItems = getInvoiceItems(order);
    const calculatedRoundOff = round2(
        Number(order.grandTotal || 0) -
        (Number(order.subtotal || 0) - Number(order.discount || 0) + Number(order.tax || 0))
    );
    const roundOff = Number(order.roundOff ?? calculatedRoundOff) || 0;
    const cgst = order.cgst != null
        ? Number(order.cgst)
        : order.tax > 0 ? round2(order.tax / 2) : 0;
    const sgst = order.sgst != null
        ? Number(order.sgst)
        : order.tax > 0 ? round2(order.tax - cgst) : 0;
    const address = [user?.shopAddress, user?.city, user?.state].filter(Boolean).join(", ");
    const stateCode = String(user?.gstNumber || "").slice(0, 2);
    const placeOfSupply = user?.state
        ? `${/^\d{2}$/.test(stateCode) ? `${stateCode}-` : ""}${user.state}`
        : "—";
    const initials = shopName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "S";

    const taxGroups = Object.values(invoiceItems.reduce((groups, item) => {
        const rate = Number(item.taxRate) || 0;
        if (rate <= 0) return groups;

        const key = String(rate);
        if (!groups[key]) groups[key] = { rate, cgst: 0, sgst: 0 };
        groups[key].cgst += Number(item.cgst) || 0;
        groups[key].sgst += Number(item.sgst) || 0;

        return groups;
    }, {})).sort((a, b) => a.rate - b.rate);

    const totals = invoiceItems.reduce((result, item) => ({
        quantity: result.quantity + (Number(item.quantity) || 0),
        taxableAmount: result.taxableAmount + (Number(item.taxableAmount) || 0),
        amount: result.amount + (Number(item.amount) || 0)
    }), { quantity: 0, taxableAmount: 0, amount: 0 });

    const handleWhatsApp = () => {
        const lines = invoiceItems
            .map((item) => {
                const taxDetails = item.taxRate > 0
                    ? ` · GST ${item.taxRate}% (CGST ${money(item.cgst)}, SGST ${money(item.sgst)})`
                    : "";

                return `• ${item.productName} × ${item.quantity}${item.unit ? ` ${item.unit}` : ""} — ${money(item.amount)}${taxDetails}`;
            })
            .join("\n");

        const message = [
            `*${shopName}*`,
            address,
            "",
            `${user?.gstNumber ? "Tax invoice" : "Invoice"}: *${order.invoiceNumber}*`,
            `Date: ${new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
            "",
            lines,
            "",
            `Subtotal: ${money(order.subtotal)}`,
            order.discount ? `Discount: −${money(order.discount)}` : null,
            order.tax ? `CGST: ${money(cgst)}` : null,
            order.tax ? `SGST: ${money(sgst)}` : null,
            roundOff !== 0
                ? `Round Off: ${roundOff > 0 ? "+" : "−"}${money(Math.abs(roundOff))}`
                : null,
            `*Total: ${money(order.grandTotal)}*`,
            `Paid by ${order.paymentMethod === "Bank" ? "Bank Transfer" : order.paymentMethod}`,
            "",
            "Thank you for shopping with us!"
        ].filter((line) => line !== null).join("\n");

        const phone = order.customerPhone?.length === 10 ? `91${order.customerPhone}` : order.customerPhone;
        window.open(`https://wa.me/${phone || ""}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    };

    const handleDownloadPdf = async () => {
        const element = document.getElementById("invoice");
        if (!element) {
            toast.error("Could not find the invoice to download");
            return;
        }

        const filename = String(order.invoiceNumber || "invoice")
            .replace(/[\\/:*?"<>|]/g, "-");

        try {
            setDownloadingPdf(true);
            await downloadElementAsPdf(element, filename);
            toast.success("Invoice PDF downloaded");
        } catch (error) {
            console.error("Invoice PDF export failed:", error);
            toast.error("Could not download invoice PDF");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN");

    return (
        <div className="space-y-4">
            <div className="no-print flex flex-wrap gap-2">
                <Button icon={Plus} onClick={onNewBill}>New bill</Button>
                <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
                <Button variant="secondary" icon={FileDown} loading={downloadingPdf} onClick={handleDownloadPdf}>
                    Download PDF
                </Button>
                <Button variant="secondary" icon={MessageCircle} onClick={handleWhatsApp}>
                    {order.customerPhone ? "Send on WhatsApp" : "Share on WhatsApp"}
                </Button>
                <Button variant="ghost" icon={Home} onClick={() => navigate("/")}>Dashboard</Button>
            </div>

            <div
                id="invoice"
                className="billing-document mx-auto max-w-[1000px] rounded-xl border border-slate-300 bg-white px-6 text-slate-900 shadow-md print:max-w-none print:rounded-none print:border-0 print:px-8 print:py-8 print:shadow-none"
            >
                <div className="border-b border-slate-400 py-3 text-center">
                    <h1 className="text-xl font-bold text-black">{user?.gstNumber ? "Tax Invoice" : "Invoice"}</h1>
                </div>

                <div className="flex items-start gap-4 border-b border-slate-300 py-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-slate-300 bg-slate-50 text-lg font-extrabold text-slate-700">
                        {user?.profileImage
                            ? <img src={user.profileImage} alt={`${shopName} logo`} className="h-full w-full object-contain p-1" />
                            : initials}
                    </div>
                    <div className="ml-auto text-right">
                        <h2 className="text-xl text-black font-extrabold">{shopName}</h2>
                        {address && <p className="mt-1 text-xs">{address}</p>}
                        {user?.mobileNumber && <p className="text-xs">Phone no.: {user.mobileNumber}</p>}
                        {user?.email && <p className="text-xs">{user.email}</p>}
                        {user?.gstNumber && <p className="mt-1 text-xs font-semibold">GSTIN: {user.gstNumber}</p>}
                        {user?.state && <p className="text-xs">State: {placeOfSupply}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-300 text-sm">
                    <section className="border-r border-slate-300 py-4 pr-4">
                        <h2 className="mb-2 font-bold text-black">Bill To</h2>
                        <p className="font-semibold text-[10px]">{order.customerName || "Walk-in customer"}</p>
                        {order.customerPhone && <p className="mt-1 text-[10px]">Phone no.: {order.customerPhone}</p>}
                    </section>
                    <section className="py-4 pl-4">
                        <h2 className="mb-2 font-bold text-black">Invoice Details</h2>
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between gap-3 text-[10px]">
                                <dt>Invoice No.</dt>
                                <dd className="text-right font-semibold">{order.invoiceNumber}</dd>
                            </div>
                            <div className="flex justify-between gap-3 text-[10px]">
                                <dt>Date</dt>
                                <dd className="text-right">{invoiceDate}</dd>
                            </div>
                            <div className="flex justify-between gap-3 text-[10px]">
                                <dt>Place of Supply</dt>
                                <dd className="text-right">{placeOfSupply}</dd>
                            </div>
                            <div className="flex justify-between gap-3 text-[10px]">
                                <dt>Payment</dt>
                                <dd className="text-right">{order.paymentMethod === "Bank" ? "Bank Transfer" : order.paymentMethod}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="overflow-x-auto pb-3">
                    <table className="w-full min-w-[720px] border-collapse text-[10px] print:min-w-0">
                        <thead>
                            <tr className="border-y border-slate-400 bg-slate-100 text-left font-bold">
                                <th className="px-1.5 py-2">#</th>
                                <th className="px-1.5 py-2">{profile.itemLabel}</th>
                                <th className="px-1.5 py-2">HSN / SAC</th>
                                <th className="px-1.5 py-2 text-right">Quantity</th>
                                <th className="px-1.5 py-2 text-right">Price / Unit</th>
                                <th className="px-1.5 py-2 text-right">Taxable Amount</th>
                                <th className="px-1.5 py-2 text-right">CGST</th>
                                <th className="px-1.5 py-2 text-right">SGST</th>
                                <th className="px-1.5 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.map((item, index) => (
                                <tr key={`${item.productId}-${index}`} className="border-b border-slate-200 align-top">
                                    <td className="px-1.5 py-2">{index + 1}</td>
                                    <td className="px-1.5 py-2 font-medium">{item.productName}</td>
                                    <td className="px-1.5 py-2">{item.hsnCode || "—"}</td>
                                    <td className="px-1.5 py-2 text-right">{item.quantity} {item.unit || ""}</td>
                                    <td className="px-1.5 py-2 text-right">{money(item.price)}</td>
                                    <td className="px-1.5 py-2 text-right">{money(item.taxableAmount)}</td>
                                    <td className="px-1.5 py-2 text-right">
                                        {money(item.cgst)}
                                        {item.taxRate > 0 && <span className="block text-[9px]">({Number(item.taxRate) / 2}%)</span>}
                                    </td>
                                    <td className="px-1.5 py-2 text-right">
                                        {money(item.sgst)}
                                        {item.taxRate > 0 && <span className="block text-[9px]">({Number(item.taxRate) / 2}%)</span>}
                                    </td>
                                    <td className="px-1.5 py-2 text-right font-semibold">{money(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-y border-slate-400 bg-slate-50 font-bold">
                                <td className="px-1.5 py-2" colSpan="3">Total</td>
                                <td className="px-1.5 py-2 text-right">{totals.quantity}</td>
                                <td />
                                <td className="px-1.5 py-2 text-right">{money(totals.taxableAmount)}</td>
                                <td className="px-1.5 py-2 text-right">{money(invoiceItems.reduce((sum, item) => sum + item.cgst, 0))}</td>
                                <td className="px-1.5 py-2 text-right">{money(invoiceItems.reduce((sum, item) => sum + item.sgst, 0))}</td>
                                <td className="px-1.5 py-2 text-right">{money(totals.amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="grid grid-cols-1 gap-5 py-4 sm:grid-cols-2">
                    {taxGroups.length > 0 && (
                        <section>
                            <h2 className="mb-2 text-sm font-bold text-black">Tax Details</h2>
                            <table className="w-full max-w-sm text-xs">
                                <thead>
                                    <tr className="border-b border-slate-300 text-left text-[10px]">
                                        <th className="py-1.5 pr-3">Tax</th>
                                        {taxGroups.map((group) => (
                                            <th key={group.rate} className="px-2 py-1.5 text-right">
                                                {group.rate / 2}% + {group.rate / 2}%
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-[10px]">
                                    <tr>
                                        <th className="py-1.5 pr-3 text-left font-medium">CGST</th>
                                        {taxGroups.map((group) => <td key={group.rate} className="px-2 py-1.5 text-right">{money(group.cgst)}</td>)}
                                    </tr>
                                    <tr>
                                        <th className="py-1.5 pr-3 text-left font-medium">SGST</th>
                                        {taxGroups.map((group) => <td key={group.rate} className="px-2 py-1.5 text-right">{money(group.sgst)}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    )}

                    <section className={`ml-auto w-full max-w-sm ${taxGroups.length === 0 ? "sm:col-span-2" : ""}`}>
                        <h2 className="mb-2 text-sm font-bold text-black">Amounts</h2>
                        <dl className="space-y-1.5 text-[10px]">
                            <div className="flex justify-between gap-4 text-[10px]">
                                <dt>Sub Total</dt>
                                <dd className="text-right tabular">{money(order.subtotal)}</dd>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between gap-4">
                                    <dt>Discount</dt>
                                    <dd className="text-right tabular">− {money(order.discount)}</dd>
                                </div>
                            )}
                            {order.tax > 0 && (
                                <>
                                    <div className="flex justify-between gap-4">
                                        <dt>CGST</dt>
                                        <dd className="text-right tabular">{money(cgst)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt>SGST</dt>
                                        <dd className="text-right tabular">{money(sgst)}</dd>
                                    </div>
                                </>
                            )}
                            {roundOff !== 0 && (
                                <div className="flex justify-between gap-4">
                                    <dt>Round Off</dt>
                                    <dd className="text-right tabular">
                                        {roundOff > 0 ? "+ " : "− "}{money(Math.abs(roundOff))}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-4 border-t border-slate-400 pt-2 text-base font-bold">
                                <dt>Total</dt>
                                <dd className="text-right tabular">{money(order.grandTotal)}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="border-t border-slate-300 py-3 text-[10px]">
                    <p className="font-bold">Amount in Words</p>
                    <p className="mt-1">{amountInWords(order.grandTotal)}</p>
                </div>

                <InvoiceTerms />

                <div className="invoice-footer">
                    <div className="flex justify-end border-t border-slate-300 py-5">
                        <div className="w-56 text-center text-xs">
                            <p className="mb-10 font-semibold">For: {shopName}</p>
                            <div className="border-t border-slate-400 pt-2 font-semibold">Authorized Signatory</div>
                            {user?.ownerName && <p className="mt-1">{user.ownerName}</p>}
                        </div>
                    </div>

                    <div className="border-t border-slate-200 py-3 text-center text-[10px] text-slate-500">
                        Thank you for your business · Generated with {shopName}
                    </div>
                </div>
            </div>
        </div>
    );
}
