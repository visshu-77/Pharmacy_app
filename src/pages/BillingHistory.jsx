import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, History, ReceiptText, Trash2 } from "lucide-react";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, Spinner } from "../components/ui/State";
import { ConfirmDialog } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import CashReceipt from "../components/Invoice/CashReceipt";
import Invoice from "../components/Invoice/Invoice";
import { useBusiness } from "../context/BusinessContext";
import { getCashReceiptHistory } from "../services/cashReceiptService";
import { deleteOrder, getOrderHistory } from "../services/orderService";

const PAGE_SIZE = 25;

export default function BillingHistory() {
    const navigate = useNavigate();
    const toast = useToast();
    const { formatMoney } = useBusiness();
    const [orders, setOrders] = useState([]);
    const [receipts, setReceipts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMoreOrders, setHasMoreOrders] = useState(false);
    const [hasMoreReceipts, setHasMoreReceipts] = useState(false);
    const [filter, setFilter] = useState("all");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadHistory = async () => {
            try {
                const [orderResult, receiptResult] = await Promise.all([
                    getOrderHistory({ page: 1, limit: PAGE_SIZE }),
                    getCashReceiptHistory({ page: 1, limit: PAGE_SIZE })
                ]);
                if (cancelled) return;
                setOrders(orderResult.orders);
                setReceipts(receiptResult.receipts);
                setHasMoreOrders(orderResult.hasMore);
                setHasMoreReceipts(receiptResult.hasMore);
            } catch (error) {
                if (!cancelled) {
                    toast.error(error.response?.data?.message || "Could not load billing history");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadHistory();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const records = useMemo(() => {
        const sales = orders.map((order) => ({
            id: `order-${order._id}`,
            kind: "bill",
            number: order.invoiceNumber,
            name: order.customerName || "Walk-in customer",
            amount: order.grandTotal,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            document: order
        }));
        const cashReceipts = receipts.map((receipt) => ({
            id: `receipt-${receipt._id}`,
            kind: "receipt",
            number: receipt.receiptNumber,
            name: receipt.recipient,
            amount: receipt.totalAmount ?? receipt.amount,
            cashReceived: receipt.cashReceived ?? receipt.amount,
            remainingAmount: receipt.remainingAmount ?? 0,
            paymentMethod: receipt.paymentMethod || "Cash",
            createdAt: receipt.createdAt,
            document: receipt
        }));

        return [...sales, ...cashReceipts]
            .filter((record) => filter === "all" || record.kind === filter)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [orders, receipts, filter]);

    const loadMore = async () => {
        const nextPage = page + 1;
        try {
            setLoadingMore(true);
            const [orderResult, receiptResult] = await Promise.all([
                getOrderHistory({ page: nextPage, limit: PAGE_SIZE }),
                getCashReceiptHistory({ page: nextPage, limit: PAGE_SIZE })
            ]);
            setOrders((current) => [...current, ...orderResult.orders]);
            setReceipts((current) => [...current, ...receiptResult.receipts]);
            setHasMoreOrders(orderResult.hasMore);
            setHasMoreReceipts(receiptResult.hasMore);
            setPage(nextPage);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load more billing history");
        } finally {
            setLoadingMore(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            await deleteOrder(deleteTarget._id);
            setOrders((current) => current.filter((order) => order._id !== deleteTarget._id));
            setDeleteTarget(null);
            toast.success("Bill deleted. Dashboard totals have been updated.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not delete bill");
        } finally {
            setDeleting(false);
        }
    };

    if (selectedDocument?.kind === "bill") {
        return (
            <div className="space-y-4">
                <div className="no-print">
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => setSelectedDocument(null)}>
                        Back to history
                    </Button>
                </div>
                <Invoice order={selectedDocument.document} onNewBill={() => navigate("/billing")} />
            </div>
        );
    }

    if (selectedDocument?.kind === "receipt") {
        return (
            <CashReceipt
                key={selectedDocument.document._id}
                initialReceipt={selectedDocument.document}
                backLabel="Back to history"
                onBack={() => setSelectedDocument(null)}
                onSaved={(savedReceipt) => {
                    setReceipts((current) => [
                        savedReceipt,
                        ...current.filter((receipt) => receipt._id !== savedReceipt._id)
                    ]);
                }}
            />
        );
    }

    const canLoadMore = filter === "bill"
        ? hasMoreOrders
        : filter === "receipt"
            ? hasMoreReceipts
            : hasMoreOrders || hasMoreReceipts;

    return (
        <div className="space-y-6">
            <PageHeader
                icon={History}
                title="Billing History"
                subtitle="View and reprint previous bills and cash receipts"
                actions={
                    <Button variant="secondary" icon={ReceiptText} onClick={() => navigate("/billing")}>
                        New bill
                    </Button>
                }
            />

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter billing history">
                {[
                    { id: "all", label: "All" },
                    { id: "bill", label: "Bills" },
                    { id: "receipt", label: "Cash receipts" }
                ].map((option) => (
                    <Button
                        key={option.id}
                        size="sm"
                        variant={filter === option.id ? "soft" : "ghost"}
                        aria-pressed={filter === option.id}
                        onClick={() => setFilter(option.id)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            {loading ? (
                <Spinner />
            ) : records.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No billing history yet"
                    message="Completed bills and saved cash receipts will appear here."
                />
            ) : (
                <div className="space-y-3">
                    {records.map((record) => (
                        <Card key={record.id} padded={false}>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDocument(record)}
                                    className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-hover"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                                            {record.kind === "bill"
                                                ? <FileText className="h-5 w-5" />
                                                : <ReceiptText className="h-5 w-5" />}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate font-semibold text-heading">{record.name}</span>
                                            <span className="mt-0.5 block text-xs text-muted">
                                                {record.number} · {new Date(record.createdAt).toLocaleString("en-IN")}
                                            </span>
                                            {record.kind === "receipt" && (
                                                <span className="mt-0.5 block text-xs text-muted">
                                                    Received {formatMoney(record.cashReceived, { decimals: 2 })} · Remaining {formatMoney(record.remainingAmount, { decimals: 2 })}
                                                </span>
                                            )}
                                        </span>
                                    </span>
                                    <span className="ml-auto text-right">
                                        <span className="block font-bold text-heading tabular">
                                            {formatMoney(record.amount, { decimals: 2 })}
                                        </span>
                                        <span className="text-xs text-muted">
                                            {record.kind === "receipt" ? "Cash receipt" : record.paymentMethod}
                                        </span>
                                    </span>
                                </button>
                                {record.kind === "bill" &&
                                    record.document.source !== "credit" &&
                                    record.document.source !== "note" && (
                                        <Button
                                            variant="ghost"
                                            icon={Trash2}
                                            className="mr-3 text-danger hover:!bg-danger/10 hover:!text-danger"
                                            aria-label={`Delete bill ${record.number}`}
                                            onClick={() => setDeleteTarget(record.document)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {canLoadMore && !loading && (
                <div className="flex justify-center">
                    <Button variant="secondary" loading={loadingMore} onClick={loadMore}>
                        Load more
                    </Button>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                loading={deleting}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                confirmLabel="Delete bill"
                title={`Delete ${deleteTarget?.invoiceNumber || "this bill"}?`}
                message="This permanently removes the bill, restores its sold items to stock, and removes its amount from dashboard totals."
            />
        </div>
    );
}
