import { useNavigate } from "react-router-dom";
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";

import { Drawer } from "../ui/Modal";
import Button from "../ui/Button";
import { EmptyState } from "../ui/State";

import { useCart } from "../../context/CartContext";
import { useBusiness } from "../../context/BusinessContext";

export default function CartDrawer({ open, onClose }) {

    const navigate = useNavigate();
    const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
    const { formatMoney, term } = useBusiness();

    const subtotal = cart.reduce(
        (total, item) => total + Number(item.sellingPrice || 0) * item.quantity,
        0
    );

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <Drawer
            open={open}
            onClose={onClose}
            icon={ShoppingCart}
            title="Current bill"
            subtitle={`${itemCount} unit${itemCount === 1 ? "" : "s"} · ${cart.length} ${cart.length === 1 ? term.itemLower : term.itemsLower}`}
            footer={
                <div>
                    <div className="flex items-baseline justify-between mb-4">
                        <span className="text-sm font-medium text-muted">Subtotal</span>
                        <span className="text-xl font-bold text-heading tabular">{formatMoney(subtotal, { decimals: 2 })}</span>
                    </div>

                    <Button
                        fullWidth
                        size="lg"
                        iconRight={ArrowRight}
                        disabled={cart.length === 0}
                        onClick={() => {
                            onClose();
                            navigate("/billing");
                        }}
                    >
                        Continue to billing
                    </Button>
                </div>
            }
        >
            {cart.length === 0 ? (
                <EmptyState
                    icon={ShoppingCart}
                    title="Bill is empty"
                    message={`Add ${term.itemsLower} from your inventory to start a bill.`}
                />
            ) : (
                <ul className="divide-y divide-line -mx-5">
                    {cart.map((item) => (
                        <li key={item._id} className="px-5 py-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-heading truncate">{item.productName}</p>
                                    <p className="text-xs text-muted mt-0.5 tabular">
                                        {formatMoney(item.sellingPrice, { decimals: 2 })} / {item.unit || "unit"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeFromCart(item._id)}
                                    className="grid place-items-center h-8 w-8 shrink-0 rounded-lg text-faint hover:bg-danger/10 hover:text-danger transition-colors"
                                    aria-label={`Remove ${item.productName}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-lg border border-line">
                                    <button
                                        type="button"
                                        onClick={() => decreaseQuantity(item._id)}
                                        disabled={item.quantity <= 1}
                                        className="grid place-items-center h-8 w-8 text-muted hover:text-heading disabled:opacity-40"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold tabular text-heading">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => increaseQuantity(item._id)}
                                        disabled={item.quantity >= item.stock}
                                        className="grid place-items-center h-8 w-8 text-muted hover:text-heading disabled:opacity-40"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                <span className="text-sm font-bold text-heading tabular">
                                    {formatMoney(Number(item.sellingPrice || 0) * item.quantity, { decimals: 2 })}
                                </span>
                            </div>

                            {item.quantity >= item.stock && (
                                <p className="mt-2 text-[11px] text-warning font-medium">
                                    All {item.stock} in stock added
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </Drawer>
    );
}
