import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { viewCategory } from "../../services/categoryService";

export default function ViewCategoryModal({ categoryId, onClose }) {
    const [categoryData, setCategoryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);

                const data = await viewCategory(categoryId);
                setCategoryData(data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm overflow-y-auto p-3 sm:p-5 md:p-8">

            {/* Modal */}
            <div className="w-full max-w-[1100px] min-h-fit bg-white border rounded-xl mx-auto my-2 sm:my-5 md:my-10">

                {/* Header */}
                <div className="w-full flex items-start justify-between gap-4 p-4 sm:p-6 border-b">

                    <div className="min-w-0">
                        <h3 className="text-lg sm:text-2xl font-semibold capitalize truncate">
                            {categoryData?.category?.categoryName || "Category"}
                        </h3>

                        {categoryData?.category?.description && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                {categoryData.category.description}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        type="button"
                        className="flex-shrink-0 text-gray-400 hover:text-primary transition p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="w-full p-4 sm:p-6">

                    {loading ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Loading category...
                        </div>
                    ) : !categoryData ? (
                        <div className="py-10 text-center text-sm text-gray-500">
                            Unable to load category.
                        </div>
                    ) : (
                        <>
                            {/* Category information */}
                            <div className="mb-5">

                                <p className="text-xs sm:text-sm text-gray-600">
                                    <span className="font-bold text-gray-900">
                                        Description:
                                    </span>{" "}
                                    {categoryData.category?.description || "No description"}
                                </p>

                                <div className="mt-4 inline-flex items-center bg-blue-50 rounded-lg px-3 py-2">
                                    <p className="text-sm text-primary font-bold">
                                        <span className="text-gray-900">
                                            Total Products:
                                        </span>{" "}
                                        {categoryData.totalProducts || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile table wrapper */}
                            <div className="border border-[#E8ECF1] rounded-xl overflow-hidden">

                                {/* Horizontal scrolling on mobile */}
                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[1000px]">

                                        <thead>
                                            <tr className="text-gray-500 uppercase text-[10px] sm:text-xs bg-[#FAFBFC] border-b">

                                                <th className="p-3 sm:p-4 text-left">
                                                    Product
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Stock
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Purchase
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Selling
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Expiry
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Supplier
                                                </th>

                                                <th className="p-3 sm:p-4 text-left">
                                                    Status
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody className="bg-white">

                                            {categoryData?.products?.length > 0 ? (

                                                categoryData.products.map((product) => (

                                                    <tr
                                                        key={product._id || product.id}
                                                        className="border-b last:border-b-0 hover:bg-gray-50"
                                                    >

                                                        {/* Product */}
                                                        <td className="p-3 sm:p-4 text-left text-sm font-semibold">
                                                            {product.productName}
                                                        </td>

                                                        {/* Stock */}
                                                        <td className="p-3 sm:p-4 text-left font-semibold">
                                                            <span
                                                                className={
                                                                    product.stock === 0
                                                                        ? "text-red-500"
                                                                        : product.stock < 50
                                                                            ? "text-orange-500"
                                                                            : "text-black"
                                                                }
                                                            >
                                                                {product.stock}
                                                            </span>
                                                        </td>

                                                        {/* Purchase */}
                                                        <td className="p-3 sm:p-4 text-left text-sm text-gray-600">
                                                            ₹{product.purchase}
                                                        </td>

                                                        {/* Selling */}
                                                        <td className="p-3 sm:p-4 text-left text-sm text-secondary font-semibold">
                                                            ₹{product.sellingPrice}
                                                        </td>

                                                        {/* Expiry */}
                                                        <td className="p-3 sm:p-4 text-left">
                                                            <span className="text-sm text-gray-600">
                                                                {product.ExpiryDate}
                                                            </span>
                                                        </td>

                                                        {/* Supplier */}
                                                        <td className="p-3 sm:p-4 text-left text-sm text-gray-600 capitalize">
                                                            {product.supplierName || "-"}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="p-3 sm:p-4 text-left">

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    whitespace-nowrap
                                                                    border
                                                                    rounded-full
                                                                    px-2.5
                                                                    py-1
                                                                    text-[10px]
                                                                    sm:text-xs
                                                                    font-semibold

                                                                    ${
                                                                        product.stock === 0
                                                                            ? "text-red-500 bg-red-100 border-red-200"
                                                                            : product.stock < 50
                                                                                ? "text-orange-500 bg-orange-100 border-orange-200"
                                                                                : "text-secondary bg-green-100 border-green-200"
                                                                    }
                                                                `}
                                                            >
                                                                •{" "}

                                                                {product.stock === 0
                                                                    ? "Out of Stock"
                                                                    : product.stock < 50
                                                                        ? "Low Stock"
                                                                        : "In Stock"
                                                                }
                                                            </span>

                                                        </td>

                                                    </tr>

                                                ))

                                            ) : (

                                                <tr>
                                                    <td
                                                        colSpan="7"
                                                        className="text-center py-10 text-sm text-gray-500"
                                                    >
                                                        No Products Found
                                                    </td>
                                                </tr>

                                            )}

                                        </tbody>

                                    </table>

                                </div>

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 border-t bg-gray-50">

                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Showing{" "}
                                        <span className="font-semibold text-gray-700">
                                            {categoryData?.products?.length || 0}
                                        </span>{" "}
                                        products
                                    </p>

                                    {/* Mobile hint */}
                                    <p className="text-[10px] sm:text-xs text-gray-400 sm:hidden">
                                        ← Swipe horizontally to view more →
                                    </p>

                                </div>

                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
