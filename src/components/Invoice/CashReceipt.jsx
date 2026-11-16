import { useState } from "react";
import { ArrowLeft, CheckCircle2, FileDown, Plus, Printer } from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import { Input } from "../ui/Field";
import PageHeader from "../ui/PageHeader";
import { useToast } from "../ui/Toast";
import { useBusiness } from "../../context/BusinessContext";
import BRAND from "../../config/brand";
import { createCashReceipt } from "../../services/cashReceiptService";
import { amountInWords } from "../../utils/amountInWords";
import downloadElementAsPdf from "../../utils/downloadElementAsPdf";
import InvoiceTerms from "./InvoiceTerms";

export default function CashReceipt({
    onBack,
    onSaved,
    initialReceipt = null,
    backLabel = "Back to billing"
}) {
    const { user, shopName, formatMoney } = useBusiness();
    const toast = useToast();
    const [recipient, setRecipient] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [cashReceived, setCashReceived] = useState("");
    const [receipt, setReceipt] = useState(initialReceipt);
    const [savingReceipt, setSavingReceipt] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const generateReceipt = async (event) => {
        event.preventDefault();
        const parsedTotal = Number(totalAmount);
        const parsedReceived = Number(cashReceived);

        if (!recipient.trim()) {
            toast.warning("Enter the name of the person paying");
            return;
        }

        if (
            !Number.isFinite(parsedTotal) ||
            !Number.isFinite(parsedReceived) ||
            parsedTotal <= 0 ||
            parsedReceived <= 0
        ) {
            toast.warning("Enter a total amount and cash received greater than zero");
            return;
        }

        if (parsedReceived > parsedTotal) {
            toast.warning("Cash received cannot exceed the total amount");
            return;
        }

        try {
            setSavingReceipt(true);
            const result = await createCashReceipt({
                recipient: recipient.trim(),
                totalAmount: Math.round(parsedTotal * 100) / 100,
                cashReceived: Math.round(parsedReceived * 100) / 100
            });
            setReceipt(result.receipt);
            onSaved?.(result.receipt);
            toast.success(`Cash receipt ${result.receipt.receiptNumber} saved`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save cash receipt");
        } finally {
            setSavingReceipt(false);
        }
    };

    const handleDownloadPdf = async () => {
        const element = document.getElementById("cash-receipt");
        if (!element) {
            toast.error("Could not find the cash receipt to download");
            return;
        }

        try {
            setDownloadingPdf(true);
            await downloadElementAsPdf(element, receipt.receiptNumber);
            toast.success("Cash receipt PDF downloaded");
        } catch (error) {
            console.error("Cash receipt PDF export failed:", error);
            toast.error("Could not download cash receipt PDF");
        } finally {
            setDownloadingPdf(false);
        }
    };

    const createAnother = () => {
        setReceipt(null);
        setRecipient("");
        setTotalAmount("");
        setCashReceived("");
    };

    if (!receipt) {
        return (
            <div className="space-y-6">
                <PageHeader
                    className="no-print"
                    icon={CheckCircle2}
                    title="Cash receipt"
                    subtitle="Enter who paid and the amount received"
                    actions={
                        <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
                            {backLabel}
                        </Button>
                    }
                />

                <Card>
                    <form onSubmit={generateReceipt} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label="Received from"
                                placeholder="Person's name"
                                maxLength={120}
                                value={recipient}
                                onChange={(event) => setRecipient(event.target.value)}
                                required
                                autoFocus
                            />
                            <Input
                                label="Total amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={totalAmount}
                                onChange={(event) => setTotalAmount(event.target.value)}
                                required
                            />
                            <Input
                                label="Cash received"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={cashReceived}
                                onChange={(event) => setCashReceived(event.target.value)}
                                required
                            />
                        </div>
                        <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-muted">Remaining amount</span>
                                <span className="font-bold text-heading tabular">
                                    {Number(totalAmount) > 0 &&
                                    Number(cashReceived) > 0 &&
                                    Number(cashReceived) <= Number(totalAmount)
                                        ? formatMoney(
                                            Math.round((Number(totalAmount) - Number(cashReceived)) * 100) / 100,
                                            { decimals: 2 }
                                        )
                                        : "—"}
                                </span>
                            </div>
                            {Number(cashReceived) > Number(totalAmount) && Number(totalAmount) > 0 && (
                                <p className="mt-1 text-xs text-danger">
                                    Cash received cannot exceed the total amount.
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-muted">
                            Saved in billing history; it does not change stock or sales totals.
                        </p>
                        <Button type="submit" icon={CheckCircle2} loading={savingReceipt}>
                            Save cash receipt
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    const money = (value) => formatMoney(value, { decimals: 2 });
    const receiptTotal = Number(receipt.totalAmount ?? receipt.amount ?? 0);
    const receiptCashReceived = Number(receipt.cashReceived ?? receipt.amount ?? receiptTotal);
    const receiptRemaining = Number(
        receipt.remainingAmount ?? Math.max(receiptTotal - receiptCashReceived, 0)
    );
    const address = [user?.shopAddress, user?.city, user?.state].filter(Boolean).join(", ");
    const initials = shopName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase() || "S";
    const receiptDate = new Date(receipt.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    return (
        <div className="space-y-4">
            <PageHeader
                icon={CheckCircle2}
                title="Cash receipt"
                subtitle={`Receipt ${receipt.receiptNumber}`}
                actions={
                    <Button variant="ghost" icon={ArrowLeft} onClick={onBack}>
                        {backLabel}
                    </Button>
                }
            />

            <div className="no-print flex flex-wrap gap-2">
                <Button icon={Plus} onClick={createAnother}>New receipt</Button>
                <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
                <Button
                    variant="secondary"
                    icon={FileDown}
                    loading={downloadingPdf}
                    onClick={handleDownloadPdf}
                >
                    Download PDF
                </Button>
            </div>

            <div
                id="cash-receipt"
                className="billing-document mx-auto max-w-[1000px] rounded-xl border border-slate-300 bg-white px-6 text-slate-900 shadow-md print:max-w-none print:rounded-none print:border-0 print:px-8 print:py-8 print:shadow-none"
            >
                <div className="border-b border-slate-400 py-3 text-center">
                    <h1 className="text-xl font-bold">Cash Receipt</h1>
                </div>

                <div className="flex items-start gap-4 border-b border-slate-300 py-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-300 bg-slate-50 text-lg font-extrabold text-slate-700">
                        {user?.profileImage
                            ? <img src={user.profileImage} alt={`${shopName} logo`} className="h-full w-full object-contain p-1" />
                            : initials}
                    </div>
                    <div className="ml-auto text-right">
                        <h2 className="text-xl font-extrabold">{shopName}</h2>
                        {address && <p className="mt-1 text-xs">{address}</p>}
                        {user?.mobileNumber && <p className="text-xs">Phone no.: {user.mobileNumber}</p>}
                        {user?.email && <p className="text-xs">{user.email}</p>}
                        {user?.gstNumber && <p className="mt-1 text-xs font-semibold">GSTIN: {user.gstNumber}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-300 text-sm">
                    <section className="border-r border-slate-300 py-4 pr-4">
                        <h2 className="mb-2 font-bold">Received From</h2>
                        <p className="font-semibold">{receipt.recipient}</p>
                    </section>
                    <section className="py-4 pl-4">
                        <h2 className="mb-2 font-bold">Receipt Details</h2>
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between gap-3">
                                <dt>Receipt No.</dt>
                                <dd className="text-right font-semibold">{receipt.receiptNumber}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt>Date</dt>
                                <dd className="text-right">{receiptDate}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt>Payment Mode</dt>
                                <dd className="text-right">Cash</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <div className="overflow-x-auto py-3">
                    <table className="w-full min-w-[420px] border-collapse text-xs print:min-w-0">
                        <thead>
                            <tr className="border-y border-slate-400 bg-slate-100 text-left font-bold">
                                <th className="px-2 py-2">#</th>
                                <th className="px-2 py-2">Description</th>
                                <th className="px-2 py-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="px-2 py-2">1</td>
                                <td className="px-2 py-2">Total amount</td>
                                <td className="px-2 py-2 text-right">{money(receiptTotal)}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="px-2 py-2">2</td>
                                <td className="px-2 py-2">Cash received</td>
                                <td className="px-2 py-2 text-right font-semibold">{money(receiptCashReceived)}</td>
                            </tr>
                            <tr className="border-b border-slate-200 font-semibold">
                                <td className="px-2 py-2">3</td>
                                <td className="px-2 py-2">Remaining amount</td>
                                <td className="px-2 py-2 text-right">{money(receiptRemaining)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-slate-300 py-3 text-sm">
                    <p className="font-bold">Cash Received in Words</p>
                    <p className="mt-1">{amountInWords(receiptCashReceived)}</p>
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
                        Thank you for your payment · Generated with {BRAND.name}
                    </div>
                </div>
            </div>
        </div>
    );
}
