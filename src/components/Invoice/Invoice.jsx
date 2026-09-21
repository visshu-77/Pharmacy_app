import { Printer, MessageCircle, Plus, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import { useBusiness } from "../../context/BusinessContext";
import BRAND from "../../config/brand";

/**
 * Printable invoice. Always renders on a white "paper" surface — even in dark
 * mode — because that is what gets printed and shared.
 */
export default function Invoice({ order, onNewBill }) {

    const navigate = useNavigate();
    const { user, profile, shopName, formatMoney } = useBusiness();

    if (!order) return null;

    const money = (value) => formatMoney(value, { decimals: 2 });

    const address = [user?.shopAddress, user?.city, user?.state].filter(Boolean).join(", ");
    const licenceLabel = profile.licence?.label || "Licence No.";

    const handleWhatsApp = () => {
        const lines = order.items
            .map((item) => `• ${item.productName} × ${item.quantity}${item.unit ? ` ${item.unit}` : ""} — ${money(item.total)}`)
            .join("\n");

        const message = [
            `*${shopName}*`,
            address,
            "",
            `Invoice: *${order.invoiceNumber}*`,
            `Date: ${new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
            "",
            lines,
            "",
            `Subtotal: ${money(order.subtotal)}`,
            order.discount ? `Discount: −${money(order.discount)}` : null,
            order.tax ? `GST: ${money(order.tax)}` : null,
            `*Total: ${money(order.grandTotal)}*`,
            `Paid by ${order.paymentMethod}`,
            "",
            "Thank you for shopping with us!"
        ].filter((line) => line !== null).join("\n");

        const phone = order.customerPhone?.length === 10 ? `91${order.customerPhone}` : order.customerPhone;

        window.open(`https://wa.me/${phone || ""}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    };

    return (
        <div className="space-y-4">
            <div className="no-print flex flex-wrap gap-2">
                <Button icon={Plus} onClick={onNewBill}>New bill</Button>
                <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
                <Button variant="secondary" icon={MessageCircle} onClick={handleWhatsApp}>
                    {order.customerPhone ? "Send on WhatsApp" : "Share on WhatsApp"}
                </Button>
                <Button variant="ghost" icon={Home} onClick={() => navigate("/")}>Dashboard</Button>
            </div>

            <div
                id="invoice"
                className="mx-auto max-w-[820px] rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-md print:shadow-none print:border-0 print:rounded-none"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 p-8 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{shopName}</h1>
                        {address && <p className="text-sm text-slate-500 mt-1 max-w-xs">{address}</p>}
                        <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                            {user?.mobileNumber && <p>Phone: {user.mobileNumber}</p>}
                            {user?.gstNumber && <p>GSTIN: <span className="font-mono">{user.gstNumber}</span></p>}
                            {user?.licenseNumber && <p>{licenceLabel}: {user.licenseNumber}</p>}
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                            {user?.gstNumber ? "Tax invoice" : "Invoice"}
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900 font-mono">{order.invoiceNumber}</p>
                        <p className="text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                    </div>
                </div>

                {/* Bill to */}
                <div className="grid grid-cols-2 gap-6 px-8 py-5 border-b border-slate-200 text-sm">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bill to</p>
                        <p className="mt-1 font-semibold text-slate-900">{order.customerName || "Walk-in customer"}</p>
                        {order.customerPhone && <p className="text-slate-500">{order.customerPhone}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payment</p>
                        <p className="mt-1 font-semibold text-slate-900">{order.paymentMethod}</p>
                        <p className="text-emerald-600 font-medium">{order.paymentStatus}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="px-8 py-2 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                <th className="py-3 w-8">#</th>
                                <th className="py-3">{profile.itemLabel}</th>
                                <th className="py-3 text-right">Qty</th>
                                <th className="py-3 text-right">Rate</th>
                                <th className="py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={`${item.productId}-${index}`} className="border-b border-slate-100">
                                    <td className="py-3 text-slate-400 tabular">{index + 1}</td>
                                    <td className="py-3 font-medium text-slate-900">{item.productName}</td>
                                    <td className="py-3 text-right tabular">{item.quantity} <span className="text-slate-400 text-xs">{item.unit}</span></td>
                                    <td className="py-3 text-right tabular">{money(item.price)}</td>
                                    <td className="py-3 text-right tabular font-semibold text-slate-900">{money(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end px-8 py-5">
                    <dl className="w-full max-w-[280px] space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Subtotal</dt>
                            <dd className="tabular">{money(order.subtotal)}</dd>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-slate-500">Discount</dt>
                                <dd className="tabular text-emerald-600">− {money(order.discount)}</dd>
                            </div>
                        )}
                        {order.tax > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-slate-500">GST</dt>
                                <dd className="tabular">{money(order.tax)}</dd>
                            </div>
                        )}
                        <div className="flex justify-between items-baseline border-t border-slate-200 pt-3">
                            <dt className="font-semibold text-slate-900">Total</dt>
                            <dd className="text-2xl font-extrabold text-slate-900 tabular">{money(order.grandTotal)}</dd>
                        </div>
                    </dl>
                </div>

                <div className="border-t border-slate-200 px-8 py-5 text-center">
                    <p className="font-semibold text-slate-900">Thank you for shopping with us!</p>
                    <p className="text-[11px] text-slate-400 mt-1">Generated with {BRAND.name}</p>
                </div>
            </div>
        </div>
    );
}
