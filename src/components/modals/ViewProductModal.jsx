import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { singleProduct } from "../../services/productService";

export default function ViewProductModal({
    productId,
    onClose
}) {
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const data = await singleProduct(productId);
                setProductData(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const product = productData?.product;

    const stockStatus =
        product?.stock === 0
            ? "Out of Stock"
            : product?.stock < 50
                ? "Low Stock"
                : "In Stock";

    const stockColor =
        product?.stock === 0
            ? "text-red-500"
            : product?.stock < 50
                ? "text-orange-500"
                : "text-green-600";

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 md:p-8">

            {/* Modal */}
            <div className="w-full max-w-[900px] bg-white mx-auto my-2 sm:my-5 md:my-10 border rounded-xl shadow-xl">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b">

                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                            Product Name
                        </p>

                        <h3 className="text-lg sm:text-2xl font-bold capitalize break-words">
                            {product?.productName || "Product"}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 hover:text-primary transition p-1"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Content */}
                <div className="w-full p-4 sm:p-6">

                    {loading ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Loading product...
                        </div>
                    ) : !product ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Product not found.
                        </div>
                    ) : (
                        <>

                            {/* Product Details */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">

                                {/* Category */}
                                <div className="grid grid-cols-1 sm:grid-cols-2">

                                    <div className="p-4 bg-gray-50 border-b sm:border-r">
                                        <p className="text-xs text-gray-500">
                                            Category
                                        </p>

                                        <p className="text-sm sm:text-base font-semibold mt-1 capitalize">
                                            {product.productCategory?.categoryName || "-"}
                                        </p>
                                    </div>

                                    {/* Stock */}
                                    <div className="p-4 border-b">
                                        <p className="text-xs text-gray-500">
                                            Stock
                                        </p>

                                        <p className={`text-sm sm:text-base font-bold mt-1 ${stockColor}`}>
                                            {product.stock}
                                        </p>
                                    </div>

                                    {/* Purchase */}
                                    <div className="p-4 bg-gray-50 border-b sm:border-r">
                                        <p className="text-xs text-gray-500">
                                            Purchase Price
                                        </p>

                                        <p className="text-sm sm:text-base font-semibold mt-1">
                                            ₹{Number(product.purchase || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Selling */}
                                    <div className="p-4 border-b">
                                        <p className="text-xs text-gray-500">
                                            Selling Price
                                        </p>

                                        <p className="text-sm sm:text-base font-semibold text-green-600 mt-1">
                                            ₹{Number(product.sellingPrice || 0).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Expiry */}
                                    <div className="p-4 bg-gray-50 border-b sm:border-r">
                                        <p className="text-xs text-gray-500">
                                            Expiry Date
                                        </p>

                                        <p className="text-sm sm:text-base font-semibold mt-1">
                                            {product.ExpiryDate
                                                ? new Date(
                                                    product.ExpiryDate
                                                ).toLocaleDateString("en-GB")
                                                : "-"
                                            }
                                        </p>
                                    </div>

                                    {/* Supplier */}
                                    <div className="p-4 border-b">
                                        <p className="text-xs text-gray-500">
                                            Supplier
                                        </p>

                                        <p className="text-sm sm:text-base font-semibold mt-1 capitalize break-words">
                                            {product.supplierName || "-"}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="p-4 bg-gray-50 sm:col-span-2">
                                        <p className="text-xs text-gray-500 mb-2">
                                            Status
                                        </p>

                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                px-3
                                                py-1.5
                                                rounded-full
                                                text-xs
                                                sm:text-sm
                                                font-semibold

                                                ${
                                                    product.stock === 0
                                                        ? "text-red-600 bg-red-100"
                                                        : product.stock < 50
                                                            ? "text-orange-600 bg-orange-100"
                                                            : "text-green-600 bg-green-100"
                                                }
                                            `}
                                        >
                                            <span className="mr-1">•</span>
                                            {stockStatus}
                                        </span>
                                    </div>

                                </div>
                            </div>

                            {/* Buy Button */}
                            <div className="mt-5 sm:mt-6 flex justify-center">

                                <button
                                    type="button"
                                    className="
                                        w-full
                                        sm:w-auto
                                        min-w-[160px]
                                        bg-primary
                                        text-white
                                        px-6
                                        py-3
                                        rounded-lg
                                        text-sm
                                        font-semibold
                                        transition
                                        hover:shadow-lg
                                        active:scale-[0.98]
                                    "
                                >
                                    Buy Product
                                </button>

                            </div>

                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
