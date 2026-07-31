import { X } from "lucide-react";
import { useState, useEffect } from "react";

import { updateProduct } from "../../services/productService";
import { getCategory, viewCategory } from "../../services/categoryService";


export default function ViewCategoryModal({ categoryId, onClose }) {
    const [categoryData, setCategoryData] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const data = await viewCategory(categoryId)
                setCategoryData(data)
            } catch (err) {
                console.log(err);
            }
        };
        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId])


    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-[1100px] bg-white m-auto border rounded items-center justify-center flex flex-col p-6">
                <div className="w-full flex justify-between">
                    <h3 className="text-2xl font-semibold capitalize">{categoryData?.category.categoryName}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-primary transition">
                        <X size={20} />
                    </button>
                </div>
                <div className="w-full mt-2">
                    <p className="text-xs text-text py-2"><span className="font-bold">Description : </span>{categoryData?.category.description}</p>
                    <p className="mt-5 text-primary font-bold">
                        <strong className="text-black">Total Products: </strong>{categoryData?.totalProducts}
                    </p>


                    <div className="border-[#E8ECF1] border rounded-xl mt-1">
                        <table className="w-full table-fixed">
                            <thead>
                                <tr className="text-text uppercase text-xs bg-[#FAFBFC]">
                                    <th className="p-4 text-left">Product</th>
                                    <th className="p-4 text-left">Stock</th>
                                    <th className="p-4 text-left">Purchase</th>
                                    <th className="p-4 text-left">Selling</th>
                                    <th className="p-4 text-left">Expiry</th>
                                    <th className="p-4 text-left">Supplier</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="w-full table-fixed bg-white">
                                {categoryData?.products.length > 0 ? (
                                    categoryData.products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="p-4 text-left text-sm font-semibold">{product.productName}</td>
                                            <td className="p-4 text-left font-semibold">
                                                <span className={` ${product.stock === 0 ? "text-red-500" : product.stock < 50 ? "text-orange-500" : "text-black"}`}>{product.stock}</span>
                                            </td>
                                            <td className="p-4 text-left text-text">{product.purchase}</td>
                                            <td className="p-4 text-left text-secondary font-semibold">{product.sellingPrice}</td>
                                            <td className="p-4 text-left">
                                                <span className="text-sm text-text">{product.ExpiryDate}</span>
                                            </td>
                                            <td className="p-4 text-left text-text text-sm capitalize">{product.supplierName}</td>
                                            <td className="p-4 text-left">
                                                {/* <span className={` border rounded-full p-2 text-xs font-semibold ${product.status === 'In Stock' ? "text-secondary bg-green-100" : product.status === 'Out Of Stock' ? "text-red-500 bg-red-100" : "text-orange-500 bg-orange-100"} `}>• {product.status}</span> */}
                                                <span
                                                    className={`border rounded-full p-2 text-xs font-semibold ${product.stock === 0
                                                        ? "text-red-500 bg-red-100"
                                                        : product.stock < 50
                                                            ? "text-orange-500 bg-orange-100"
                                                            : "text-secondary bg-green-100"
                                                        }`}
                                                >
                                                    •{" "}
                                                    {product.stock === 0
                                                        ? "Out of Stock"
                                                        : product.stock < 50
                                                            ? "Low Stock"
                                                            : "In Stock"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-6">
                                            No Products Found
                                        </td>
                                    </tr>
                                )
                                }
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-text">
                                Showing
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}