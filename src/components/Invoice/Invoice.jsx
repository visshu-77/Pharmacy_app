import { useNavigate } from "react-router-dom";


export default function Invoice({ order }) {
    const navigate = useNavigate();
    if (!order) {
        return null;
    }

    const handleReturnHome = () => {
        navigate("/");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleWhatsApp = () => {

        const items = order.items
            .map(
                (item) =>
                    `${item.productName} × ${item.quantity} - ₹${Number(item.total).toLocaleString("en-IN")}`
            )
            .join("\n");

        const message = `
*MediStock*

*Invoice:* ${order.invoiceNumber}

*Customer:* ${order.customerName}
*Mobile:* ${order.customerPhone}

*Products:*
${items}

*Subtotal:* ₹${Number(order.subtotal).toLocaleString("en-IN")}
*Discount:* ₹${Number(order.discount).toLocaleString("en-IN")}
*Tax:* ₹${Number(order.tax).toLocaleString("en-IN")}

*Grand Total:* ₹${Number(order.grandTotal).toLocaleString("en-IN")}

*Payment:* ${order.paymentMethod}
*Status:* ${order.paymentStatus}

Thank you for your purchase!
`;

        const whatsappUrl =
            `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, "_blank");
    };

    return (
        <div id="invoice" className="bg-white p-8 max-w-[800px] mx-auto">
            <div className="flex justify-between border-b pb-5">
                <div>
                    <h1 className="text-2xl font-bold">
                        My Store
                    </h1>
                    <p className="text-sm text-gray-500">
                        Product Management & Billing
                    </p>
                    <p className="text-sm text-gray-500">
                        Indore, Madhya Pradesh
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">
                        INVOICE
                    </h2>
                    <p className="text-sm">
                        Invoice: {order.invoiceNumber}
                    </p>
                    <p className="text-sm">
                        Date:{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold">
                    Bill To
                </h3>
                <p>
                    {order.customerName}
                </p>
                <p className="text-sm text-gray-500">
                    {order.customerPhone}
                </p>
            </div>

            <table className="w-full mt-8 border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-3">
                            Product
                        </th>
                        <th className="text-center">
                            Qty
                        </th>
                        <th className="text-right">
                            Price
                        </th>
                        <th className="text-right">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item) => (
                        <tr
                            key={item.productId}
                            className="border-b"
                        >
                            <td className="py-3">
                                {item.productName}
                            </td>
                            <td className="text-center">
                                {item.quantity}
                            </td>
                            <td className="text-right">
                                ₹ {Number(item.price).toLocaleString("en-IN")}
                            </td>
                            <td className="text-right">
                                ₹ {Number(item.total).toLocaleString("en-IN")}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mt-8">
                <div className="w-[300px]">
                    <div className="flex justify-between py-2">
                        <span>Subtotal</span>
                        <span>
                            ₹ {Number(order.subtotal).toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span>Discount</span>
                        <span>
                            - ₹ {Number(order.discount).toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span>Tax</span>
                        <span>
                            ₹ {Number(order.tax).toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="border-t mt-2 pt-3 flex justify-between text-lg font-bold">
                        <span>
                            Grand Total
                        </span>
                        <span>
                            ₹ {Number(order.grandTotal).toLocaleString("en-IN")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-8 border-t pt-5">
                <p>
                    <strong>Payment Method:</strong>{" "}
                    {order.paymentMethod}
                </p>
                <p>
                    <strong>Payment Status:</strong>{" "}
                    {order.paymentStatus}
                </p>
            </div>

            <div className="text-center border-t mt-8 pt-5">
                <p className="font-semibold">
                    Thank you for your purchase!
                </p>
                <p className="text-sm text-gray-500">
                    Please visit us again.
                </p>
            </div>
            <div className="no-print">

                <button
                    onClick={handleReturnHome}
                    className="border border-gray-300 px-5 py-2 rounded-lg"
                >
                    ← Return to Home
                </button>

                <button
                    onClick={handlePrint}
                    className="ml-2 mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Print Invoice
                </button>

                <button
                    onClick={handleWhatsApp}
                    className="ml-2 px-4 py-2 bg-green-500 text-sm text-white rounded hover:bg-green-600"
                >
                    Share via WhatsApp
                </button>
            </div>
        </div>
    );
}