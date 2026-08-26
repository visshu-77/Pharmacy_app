import { X } from "lucide-react";
import { useState, useEffect } from "react";

import { updateProduct } from "../../services/productService";
import { getCategory } from "../../services/categoryService";


const inputData = [
    {
        id: 1,
        name: "productName",
        type: "text",
        label: "Product Name",
        placeholder: "eg. Iphone 17 Pro Max",
        required: true,
    },
    {
        id: 2,
        name: "productCategory",
        type: "select",
        label: "Product Category",
        placeholder: "",
        required: true,
    },
    {
        id: 3,
        name: "stock",
        type: "number",
        label: "Stock",
        placeholder: "0-100000",
        required: true,
    },
    {
        id: 4,
        name: "purchase",
        type: "number",
        label: "Purchase Price",
        placeholder: "150.00",
        required: false,
    },
    {
        id: 5,
        name: "sellingPrice",
        type: "number",
        label: "Selling Price",
        placeholder: "299.00",
        required: false,
    },
    {
        id: 6,
        name: "ExpiryDate",
        type: "date",
        label: "Expiry Date",
        placeholder: "",
        required: true,
    },
    {
        id: 7,
        name: "supplierName",
        type: "text",
        label: "Supplier Name",
        placeholder: "eg. TATA",
        required: false,
        fullWidth: true,
    },
];


export default function EditProductModal({
    product,
    onClose,
    onUpdate
}) {

    const [editProductData, setEditProductData] = useState({
        productName: "",
        productCategory: "",
        stock: "",
        purchase: "",
        sellingPrice: "",
        ExpiryDate: "",
        supplierName: "",
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    /* ================= LOAD PRODUCT ================= */

    useEffect(() => {

        if (product) {

            setEditProductData({
                productName: product.productName || "",

                productCategory:
                    product.productCategory?._id || "",

                stock: product.stock ?? "",

                purchase: product.purchase ?? "",

                sellingPrice: product.sellingPrice ?? "",

                ExpiryDate: product.ExpiryDate
                    ? product.ExpiryDate.slice(0, 10)
                    : "",

                supplierName: product.supplierName || "",
            });

        }

    }, [product]);


    /* ================= LOAD CATEGORIES ================= */

    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const res = await getCategory();

                setCategories(res.result || []);

            } catch (err) {

                console.log(err);

            }

        };

        fetchCategories();

    }, []);


    /* ================= CHANGE ================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setEditProductData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (error) {
            setError("");
        }
    };


    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");

            const result = await updateProduct(
                product._id,
                editProductData
            );

            /*
             * If your API returns the updated product,
             * update the product in the parent component.
             */
            if (result.product && onUpdate) {
                onUpdate(result.product);
            }

            alert("Product updated successfully");

            onClose();

        } catch (err) {

            console.log(err);

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-white/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">

            {/* ================= MODAL ================= */}

            <div className="w-full max-w-[900px] max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-darkColor rounded-xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">


                {/* ================= HEADER ================= */}

                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex-shrink-0">

                    <div>

                        <h3 className="text-lg sm:text-xl font-semibold dark:text-white text-gray-900">
                            Edit Product
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Update your product information.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-gray-50 transition flex-shrink-0"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* ================= CONTENT ================= */}

                <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">

                    <form
                        onSubmit={handleSubmit}
                        className="w-full"
                    >

                        {/* ================= INPUTS ================= */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                            {inputData.map((data) => (

                                <div
                                    key={data.id}
                                    className={
                                        data.fullWidth
                                            ? "sm:col-span-2"
                                            : ""
                                    }
                                >

                                    {/* LABEL */}

                                    <label className="block dark:text-white text-xs sm:text-sm text-gray-700 font-semibold mb-1.5">

                                        {data.label}

                                        {data.required && (
                                            <span className="text-red-500 dark:text-gray-500 ml-1">
                                                *
                                            </span>
                                        )}

                                    </label>


                                    {/* SELECT */}

                                    {data.type === "select" ? (

                                        <select
                                            name={data.name}
                                            value={
                                                editProductData[data.name]
                                            }
                                            onChange={handleChange}
                                            required={data.required}
                                            className="w-full h-11 bg-white border border-gray-200 dark:text-white dark:bg-darkColor dark:focus:ring-darkColor rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories.map((item) => (

                                                <option
                                                    key={item._id}
                                                    value={item._id}
                                                >
                                                    {item.categoryName}
                                                </option>

                                            ))}

                                        </select>

                                    ) : (

                                        <input
                                            name={data.name}
                                            type={data.type}
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            value={
                                                editProductData[data.name]
                                            }
                                            onChange={handleChange}
                                            className="w-full h-11 border border-gray-200 dark:bg-darkColor dark:text-white dark:focus:ring-darkColor rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />

                                    )}

                                </div>

                            ))}

                        </div>


                        {/* ================= ERROR ================= */}

                        {error && (

                            <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">

                                <p className="text-xs sm:text-sm text-red-500 text-center">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* ================= BUTTON ================= */}

                        <div className="mt-5 sm:mt-6">

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 text-sm bg-primary text-white font-semibold rounded-lg dark:bg-black hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {loading
                                    ? "Updating..."
                                    : "Update Product"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}
