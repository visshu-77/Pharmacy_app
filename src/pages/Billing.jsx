import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Trash2, ShoppingCart, Banknote, Smartphone, CreditCard } from "lucide-react";
import LastParams from "../components/lastParams";


import { createOrder } from "../services/orderService";
import ProductSearch from "../components/Billing/ProductSearch";

import { QRCodeSVG } from "qrcode.react";
import Invoice from "../components/Invoice/Invoice";


export default function Billing() {

    const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity, } = useCart();

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);


    const UPI_ID = "myupi123@upi";
    const UPI_NAME = "MediStock";

    const subtotal = cart.reduce(
        (total, item) =>
            total + Number(item.sellingPrice) * Number(item.quantity),
        0
    );

    const grandTotal =
        subtotal -
        Number(discount || 0) +
        Number(tax || 0);

    const upiUrl =
        `upi://pay?pa=${UPI_ID}` +
        `&pn=${encodeURIComponent(UPI_NAME)}` +
        `&am=${grandTotal.toFixed(2)}` +
        `&cu=INR`;

    const handleCreateOrder = async () => {

        try {
            if (!cart || cart.length === 0) {
                alert("Cart is empty");
                return;
            }
            if (!customerName.trim()) {
                alert("Please enter customer name");
                return;
            }
            if (!customerPhone.trim()) {
                alert("Please enter mobile number");
                return;
            }
            setLoading(true);
            const orderData = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                items: cart.map((item) => ({
                    productId: item._id,
                    quantity: Number(item.quantity)
                })),
                discount: Number(discount) || 0,
                tax: Number(tax) || 0,
                paymentMethod
            };
            console.log("Sending order:", orderData);
            const result = await createOrder(orderData);
            console.log("Order created:", result);
            // alert(
            //     `Order created successfully!\nInvoice: ${result.order.invoiceNumber}`
            // );
            setCreatedOrder(result.order);
            clearCart();


        } catch (error) {
            console.log("Order error:", error);
            const message =
                error.response?.data?.message ||
                "Failed to create order";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div>
                <LastParams />
            </div>
            {createdOrder ? (
                <Invoice
                    order={createdOrder}
                    onNewBill={() => setCreatedOrder(null)}
                />
            ) : (
                <div className="p-6 bg-[#F4F6F9] mt-4">
                    <h1 className="text-2xl font-bold">
                        Create New Bill
                    </h1>
                    <p className="text-black/50 text-xs">
                        Add products and create a new customer invoice
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-[75%]">
                            <div className="bg-white p-5 rounded-xl mt-5 border border-black/10 shadow">
                                <h2 className="font-semibold text-xs border-l-4 pl-2 border-primary">
                                    Customer Details
                                </h2>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-black/30 uppercase">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter Customer Name"
                                            value={customerName}
                                            onChange={(e) =>
                                                setCustomerName(e.target.value)
                                            }
                                            className="border p-3 rounded text-xs focus:outline-none focus:ring-0 bg-[#F8F9FC]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-bold text-black/30 uppercase">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="Number"
                                            placeholder="Enter Mobile Number"
                                            value={customerPhone}
                                            onChange={(e) =>
                                                setCustomerPhone(e.target.value)
                                            }
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border p-3 rounded text-xs focus:outline-none focus:ring-0 bg-[#F8F9FC]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <ProductSearch />
                            <div className="bg-white p-5 rounded-xl mt-5 border border-black/10 shadow">
                                <h2 className="font-semibold text-xs border-l-4 pl-2 border-primary">
                                    Blling Items
                                </h2>
                                {cart.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-12 gap-4 py-3 border-b bg-gray-50 rounded-t-md text-xs font-semibold text-gray-600 uppercase">
                                            <div className="col-span-5">Product</div>
                                            <div className="col-span-3 text-center">Quantity</div>
                                            <div className="col-span-2 text-right">Price</div>
                                            <div className="col-span-2 text-center">Delete</div>
                                        </div>
                                        {cart.map((item) => (
                                            <div
                                                key={item._id}
                                                className="grid grid-cols-12 gap-4 justify-between items-center border-b py-4"
                                            >
                                                <div className="col-span-5">
                                                    <p className="font-semibold capitalize text-sm">
                                                        {item.productName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ₹ {Number(item.sellingPrice).toLocaleString("en-IN")}
                                                        {" × "}
                                                        {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="col-span-3 flex justify-center">
                                                    <div className="flex items-center border rounded-md overflow-hidden">

                                                        <button
                                                            type="button"
                                                            onClick={() => decreaseQuantity(item._id)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>

                                                        <span className="w-10 text-center">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => increaseQuantity(item._id)}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>

                                                    </div>
                                                </div>
                                                <div className="col-span-2 text-right font-semibold text-sm">
                                                    <p>
                                                        ₹ {(Number(item.sellingPrice) * Number(item.quantity))
                                                            .toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(item._id)}
                                                        className="text-red-500 border border-red-500 hover:bg-red-100 p-2 rounded hover:scale-105 hover:text-red-700 transition"
                                                        title="Remove product"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 gap-1">
                                        <ShoppingCart size={30} className="text-gray-300" />
                                        <p className="text-black-100 font-bold text-sm">
                                            Your Bill cart is Empty
                                        </p>
                                        <p className="text-gray-500 text-xs">Search and add products above to start creating this bill.</p>
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                    <p>{cart.length} items</p>
                                    <p className="font-bold text-primary text-sm"><span className="text-black">Subtotal : </span> ₹ {grandTotal.toLocaleString("en-IN")}</p>
                                </div>
                            </div>

                        </div>
                        <div className="w-full sm:w-[25%]">
                            <div className="bg-white p-5 rounded-xl mt-5 border border-black/10 shadow">
                                <h2 className="font-semibold text-xs border-l-4 pl-2 border-primary">
                                    Bill Summary
                                </h2>
                                <div className="flex justify-between mt-4">
                                    <span className="text-xs text-gray-500">
                                        Subtotal
                                    </span>
                                    <span className="font-bold text-xs">
                                        ₹ {subtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                                <div className="flex flex-col justify-between mt-3 gap-2">
                                    <span className="text-xs text-gray-500">
                                        Discount
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={discount}
                                        onChange={(e) =>
                                            setDiscount(e.target.value)
                                        }
                                        placeholder="Enter Discount"
                                        className="border rounded p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                bg-[#F8F9FC] focus:outline-none focus:ring-1 text-green-500 font-bold text-xs"
                                    />
                                </div>
                                <div className="flex flex-col justify-between mt-3 gap-2">
                                    <span className="text-xs text-gray-500">
                                        Tax
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={tax}
                                        onChange={(e) =>
                                            setTax(e.target.value)
                                        }
                                        placeholder="Enter Tax"
                                        className="border rounded p-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                bg-[#F8F9FC] focus:outline-none focus:ring-1 font-bold text-xs"
                                    />
                                </div>
                                <div className="flex justify-between mt-5 pt-4 border-t">
                                    <span className="font-bold text-xs font-bold text-gray-500">
                                        Grand Total
                                    </span>
                                    <span className="font-bold text-lg text-primary">
                                        ₹ {grandTotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-5 rounded-xl mt-5 border border-black/10 shadow5">
                                <h2 className="font-semibold text-xs border-l-4 pl-2 border-primary">
                                    Payment Method
                                </h2>
                                <div className="grid grid-cols-3 gap-3 items-center justify-between mt-4">
                                    <button
                                        className="flex flex-col items-center gap-3 mb-3 text-xs text-gray-500 border border-gray-300 rounded p-2 sm:p-4 w-full hover:bg-gray-50 hover:border-blue-300 transition"
                                        type="button"
                                        onClick={() => setPaymentMethod("Cash")}
                                        style={{
                                            borderColor: paymentMethod === "Cash" ? "#3b82f6" : "#d1d5db",
                                            borderWidth: "2px",
                                            color: paymentMethod === "Cash" ? "#3b82f6" : "#6b7280",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {/* <Banknote color="green" size={15} /> */}
                                        <span className="text-[21px]">💵</span>
                                        Cash
                                    </button>
                                    <button className="flex flex-col items-center gap-3 mb-3 text-xs text-gray-500 border border-gray-300 rounded p-2 sm:p-4 w-full hover:bg-gray-50 hover:border-blue-300 transition"
                                        type="button"
                                        onClick={() => setPaymentMethod("UPI")}
                                        style={{
                                            borderColor: paymentMethod === "UPI" ? "#3b82f6" : "#d1d5db",
                                            borderWidth: "2px",
                                            color: paymentMethod === "UPI" ? "#3b82f6" : "#6b7280",
                                            fontWeight: paymentMethod === "UPI" ? "bold" : "normal",
                                        }}
                                    >

                                        {/* <Smartphone color="black" size={15} /> */}
                                        <span className="text-[21px]">📱</span>
                                        Phone Pay
                                    </button>
                                    <button className="flex flex-col items-center gap-3 mb-3 text-xs text-gray-500 border border-gray-300 rounded p-2 sm:p-4 w-full hover:bg-gray-50 hover:border-blue-300 transition"
                                        type="button"
                                        onClick={() => setPaymentMethod("Card")}
                                        style={{
                                            borderColor: paymentMethod === "Card" ? "#3b82f6" : "#d1d5db",
                                            borderWidth: "2px",
                                            color: paymentMethod === "Card" ? "#3b82f6" : "#6b7280",
                                            fontWeight: paymentMethod === "Card" ? "bold" : "normal",
                                        }}
                                    >
                                        {/* <CreditCard color="#3b82f6" size={15} /> */}
                                        <span className="text-[21px]">💳</span>
                                        Card
                                    </button>
                                </div>
                                {/* <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                            className="border p-3 rounded w-full"
                        >
                            <option value="Cash">
                                Cash
                            </option>
                            <option value="UPI">
                                UPI
                            </option>
                            <option value="Card">
                                Card
                            </option>
                        </select> */}

                                {paymentMethod === "Cash" && (
                                    <div className="mt-5 border rounded-xl p-5 bg-blue-50 border-primary shadow-lg">
                                        <h3 className="font-semibold text-lg">
                                            Cash Payment
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Please collect the <span className="font-bold text-black">₹ {grandTotal.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} </span>from the customer.
                                        </p>
                                    </div>
                                )}

                                {paymentMethod === "UPI" && (
                                    <div className="mt-5 border rounded-xl p-5 bg-blue-50 border-primary shadow-lg">
                                        <h3 className="font-semibold text-lg">
                                            UPI Payment
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Scan the QR code to pay
                                        </p>
                                        <div className="flex flex-col items-center mt-5">
                                            <QRCodeSVG
                                                value={upiUrl}
                                                size={220}
                                            />
                                            <p className="mt-4 font-semibold">
                                                ₹ {grandTotal.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                UPI ID: {UPI_ID}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "Card" && (
                                    <div className="mt-5 border border-red-500 bg-red-100 rounded-xl p-5">
                                        <h3 className="font-semibold text-lg">
                                            Card Payment
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Currently the card service is not available. Please use Cash or UPI for payment.
                                        </p>
                                    </div>
                                )}

                                {createdOrder && (
                                    <Invoice order={createdOrder} />
                                )}
                                <button
                                    onClick={handleCreateOrder}
                                    disabled={loading || cart.length === 0}
                                    className="bg-primary text-white px-6 py-3 rounded-lg disabled:opacity-50 mt-5 w-full hover:bg-blue-600 transition font-semibold"
                                >
                                    {loading ? "Creating Order..." : "Place Order"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div >
            )}
        </>
    );
}