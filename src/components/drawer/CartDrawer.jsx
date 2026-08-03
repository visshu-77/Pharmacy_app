import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {

    const {
        cart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart
    } = useCart();

    const navigate = useNavigate();

    const subtotal = cart.reduce(
        (total, item) =>
            total + item.sellingPrice * item.quantity,
        0
    );

    if (!open) {
        return null;
    }

    return (

        <div className="fixed inset-0 z-50">

            {/* Background */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 h-full w-[420px] bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">

                    <h2 className="text-xl font-semibold">
                        Cart
                    </h2>

                    <button onClick={onClose}>
                        <X />
                    </button>

                </div>


                {/* Products */}
                <div className="p-5 overflow-y-auto h-[calc(100%-180px)]">

                    {cart.length === 0 ? (

                        <p className="text-center text-gray-500">
                            Cart is empty
                        </p>

                    ) : (

                        cart.map((item) => (

                            <div
                                key={item._id}
                                className="border-b py-4"
                            >

                                <div className="flex justify-between">

                                    <div>

                                        <h3 className="font-semibold">
                                            {item.productName}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            ₹ {item.sellingPrice.toLocaleString("en-IN")}
                                        </p>

                                    </div>

                                    <button
                                        onClick={() =>
                                            removeFromCart(item._id)
                                        }
                                    >
                                        <Trash2
                                            size={18}
                                            className="text-red-500"
                                        />
                                    </button>

                                </div>


                                {/* Quantity */}
                                <div className="flex items-center gap-3 mt-3">

                                    <button
                                        onClick={() =>
                                            decreaseQuantity(item._id)
                                        }
                                        className="border p-1 rounded"
                                    >
                                        <Minus size={15} />
                                    </button>

                                    <span>
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            increaseQuantity(item._id)
                                        }
                                        className="border p-1 rounded"
                                    >
                                        <Plus size={15} />
                                    </button>

                                </div>


                                {/* Item Total */}
                                <p className="text-right font-semibold mt-2">

                                    ₹ {(item.sellingPrice * item.quantity)
                                        .toLocaleString("en-IN")}

                                </p>

                            </div>

                        ))

                    )}

                </div>


                {/* Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-5">

                    <div className="flex justify-between mb-4">

                        <span className="font-semibold">
                            Subtotal
                        </span>

                        <span className="font-bold">
                            ₹ {subtotal.toLocaleString("en-IN")}
                        </span>

                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={() => {
                            onClose();
                            navigate("/billing");
                        }}
                        className="w-full bg-primary text-white py-3 rounded"
                    >
                        Buy Now
                    </button>

                </div>

            </div>

        </div>
    );
}