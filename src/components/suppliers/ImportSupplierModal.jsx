import { Upload, CheckCircle2 } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useBusiness } from "../../context/BusinessContext";

/** Preview-then-confirm dialog for importing suppliers from CSV. */
export default function ImportSupplierModal({
    show,
    importData,
    importLoading,
    importProgress,
    importSuccess,
    onConfirm,
    onCancel,
    onDone
}) {
    const { term } = useBusiness();

    if (!show) return null;

    const valid = importData.filter((row) => row.supplierName);
    const preview = valid.slice(0, 6);

    return (
        <Modal
            onClose={importLoading ? undefined : importSuccess ? onDone : onCancel}
            size="lg"
            icon={Upload}
            title={`Import ${term.suppliers.toLowerCase()}`}
            subtitle={`${valid.length} of ${importData.length} rows ready to import`}
            footer={
                importSuccess ? (
                    <Button onClick={onDone}>Done</Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={onCancel} disabled={importLoading}>Cancel</Button>
                        <Button onClick={onConfirm} loading={importLoading} disabled={!valid.length}>
                            Import {valid.length}
                        </Button>
                    </>
                )
            }
        >
            {importSuccess ? (
                <div className="flex flex-col items-center text-center py-6">
                    <span className="grid place-items-center h-14 w-14 rounded-2xl bg-success/10 text-success">
                        <CheckCircle2 className="h-7 w-7" />
                    </span>
                    <p className="mt-4 font-semibold text-heading">Import complete</p>
                    <p className="text-sm text-muted mt-1">{valid.length} {term.suppliers.toLowerCase()} were added.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {importLoading && (
                        <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(10, importProgress)}%` }} />
                        </div>
                    )}

                    <div className="overflow-x-auto thin-scrollbar rounded-xl border border-line">
                        <table className="w-full min-w-[520px] text-sm">
                            <thead>
                                <tr className="bg-surface-muted text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                                    <th className="py-2.5 px-3">Name</th>
                                    <th className="py-2.5 px-3">Phone</th>
                                    <th className="py-2.5 px-3">City</th>
                                    <th className="py-2.5 px-3">GST</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {preview.map((row, index) => (
                                    <tr key={index}>
                                        <td className="py-2.5 px-3 font-medium text-heading">{row.supplierName}</td>
                                        <td className="py-2.5 px-3 text-body">{row.phone || "—"}</td>
                                        <td className="py-2.5 px-3 text-body">{row.city || "—"}</td>
                                        <td className="py-2.5 px-3 text-body">{row.gstNumber || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {valid.length > preview.length && (
                        <p className="text-xs text-muted">…and {valid.length - preview.length} more</p>
                    )}

                    {importData.length > valid.length && (
                        <p className="text-xs text-warning">
                            {importData.length - valid.length} row(s) without a "Supplier Name" will be skipped.
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
}
