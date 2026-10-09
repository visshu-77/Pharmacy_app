import { Printer, MessageCircle, X } from "lucide-react";

import Button from "../ui/Button";
import { useBusiness } from "../../context/BusinessContext";

const formatDay = (value) =>
    new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const LABELS = {
    CREDIT_SALE: "Udhar given",
    PAYMENT: "Payment received",
    ADJUSTMENT: "Adjustment"
};

/**
 * A customer's khata on paper. Always renders on a white sheet, even in dark
 * mode, because this is what gets printed and handed over — the same approach
 * as components/Invoice/Invoice.jsx.
 */
export default function LedgerStatement({ customer, statement, period, onClose }) {

    const { user, shopName, formatMoney } = useBusiness();

    if (!customer || !statement) return null;

    const money = (value) => formatMoney(value, { decimals: 2 });

    /** A running balance can go below zero when a customer is in credit. */
    const balance = (value) =>
        Number(value) < 0 ? `− ${money(Math.abs(value))}` : money(value);

    const address = [user?.shopAddress, user?.city, user?.state].filter(Boolean).join(", ");
    const { openingBalance, transactions, summary } = statement;

    const periodLabel = period?.from || period?.to
        ? `${period.from ? formatDay(period.from) : "the beginning"} to ${period.to ? formatDay(period.to) : "today"}`
        : "All entries";

    const handleWhatsApp = () => {
        const lines = transactions.slice(-20).map((row) => {
            const sign = row.direction === "decrease" ? "paid" : "udhar";

            return `${formatDay(row.date)} — ${sign} ${money(row.amount)} (bal ${money(row.runningBalance)})`;
        });

        const message = [
            `*${shopName}*`,
            address,
            "",
            `Khata: *${customer.customerName}*`,
            `Period: ${periodLabel}`,
            "",
            ...lines,
            "",
            `*Outstanding: ${money(summary.closingBalance)}*`,
            "",
            "Thank you!"
        ].filter((line) => line !== null).join("\n");

        // Same sharing route the invoice already uses: wa.me with the text
        // prefilled, so nothing is sent without the owner pressing send.
        const phone = customer.phone?.length === 10 ? `91${customer.phone}` : customer.phone;

        window.open(
            `https://wa.me/${phone || ""}?text=${encodeURIComponent(message)}`,
            "_blank",
            "noopener"
        );
    };

    return (
        <div className="space-y-4">
            <div className="no-print flex flex-wrap gap-2">
                <Button icon={Printer} onClick={() => window.print()}>Print</Button>
                <Button variant="secondary" icon={MessageCircle} onClick={handleWhatsApp}>
                    {customer.phone ? "Send on WhatsApp" : "Share on WhatsApp"}
                </Button>
                <Button variant="ghost" icon={X} onClick={onClose}>Close</Button>
            </div>

            <div
                id="statement"
                className="mx-auto max-w-[820px] rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-md print:shadow-none print:border-0 print:rounded-none"
            >
                {/* Shop and customer */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 p-8 border-b border-slate-200">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{shopName}</h1>
                        {address && <p className="text-sm text-slate-500 mt-1 max-w-xs">{address}</p>}
                        <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                            {user?.mobileNumber && <p>Phone: {user.mobileNumber}</p>}
                            {user?.gstNumber && <p>GSTIN: <span className="font-mono">{user.gstNumber}</span></p>}
                        </div>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Udhar khata
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{customer.customerName}</p>
                        {customer.phone && <p className="text-sm text-slate-500 tabular">{customer.phone}</p>}
                        {customer.address && <p className="text-xs text-slate-500 max-w-xs">{customer.address}</p>}
                        <p className="mt-2 text-xs text-slate-500">{periodLabel}</p>
                    </div>
                </div>

                {/* Entries */}
                <div className="px-8 py-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                <th className="pb-2 pr-3">Date</th>
                                <th className="pb-2 px-3">Details</th>
                                <th className="pb-2 px-3 text-right">Udhar</th>
                                <th className="pb-2 px-3 text-right">Paid</th>
                                <th className="pb-2 pl-3 text-right">Balance</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            <tr className="text-slate-500">
                                <td className="py-2 pr-3">—</td>
                                <td className="py-2 px-3 italic">Opening balance</td>
                                <td className="py-2 px-3" />
                                <td className="py-2 px-3" />
                                <td className="py-2 pl-3 text-right tabular">{balance(openingBalance)}</td>
                            </tr>

                            {transactions.map((row) => (
                                <tr key={row._id} className={row.isReversed ? "text-slate-400 line-through" : ""}>
                                    <td className="py-2 pr-3 whitespace-nowrap">{formatDay(row.date)}</td>
                                    <td className="py-2 px-3">
                                        <span className="text-slate-800">
                                            {row.description || LABELS[row.type] || row.type}
                                        </span>
                                        {row.paymentMethod && (
                                            <span className="text-slate-400"> · {row.paymentMethod}</span>
                                        )}
                                        {row.referenceNumber && (
                                            <span className="text-slate-400"> · {row.referenceNumber}</span>
                                        )}
                                        {row.reason && (
                                            <span className="block text-xs text-slate-400">{row.reason}</span>
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular">
                                        {row.direction === "increase" ? money(row.amount) : ""}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular">
                                        {row.direction === "decrease" ? money(row.amount) : ""}
                                    </td>
                                    <td className="py-2 pl-3 text-right tabular font-medium text-slate-900">
                                        {balance(row.runningBalance)}
                                    </td>
                                </tr>
                            ))}

                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-400">
                                        No entries in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Closing */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-6 border-t border-slate-200 px-8 py-6">
                    <dl className="sm:w-72 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Udhar in this period</dt>
                            <dd className="tabular">{money(summary.charges + summary.adjustmentsUp)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Paid in this period</dt>
                            <dd className="tabular">{money(summary.payments + summary.adjustmentsDown)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-slate-200 pt-2">
                            <dt className="font-semibold text-slate-900">
                                {summary.closingBalance < 0 ? "Paid in advance" : "Outstanding"}
                            </dt>
                            <dd className="text-2xl font-extrabold text-slate-900 tabular">
                                {money(Math.abs(summary.closingBalance))}
                            </dd>
                        </div>
                    </dl>
                </div>

                <p className="border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-400">
                    Statement generated on {formatDay(new Date())} · {shopName}
                </p>
            </div>
        </div>
    );
}
