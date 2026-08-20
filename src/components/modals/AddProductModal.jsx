import { X } from "lucide-react";
import { useState, useEffect } from "react";

import { addProduct } from "../../services/productService";
import { getCategory } from "../../services/categoryService";
import { searchSuppliers } from "../../services/supplierService";

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
        required: false,
    },
    {
        id: 7,
        name: "supplierName",
        type: "text",
        label: "Supplier Name",
        placeholder: "eg. TATA",
        fullWidth: true,
        required: true,
    },
];


export default function AddProductModal({
    onClose,
    onProductAdded
}) {

    const [productData, setProductData] = useState({
        productName: "",
        productCategory: "",
        stock: "",
        purchase: "",
        sellingPrice: "",
        ExpiryDate: "",
        supplierName: "",
    });

    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);

    const [supplierSuggestions, setSupplierSuggestions] = useState([]);
    const [supplierLoading, setSupplierLoading] = useState(false);
    const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);

    const [selectedSupplierId, setSelectedSupplierId] = useState("");

    const handleChange = (e) => {

        setProductData({
            ...productData,
            [e.target.name]: e.target.value
        });

        if (error) {
            setError("");
        }
    };

    const handleSupplierSearch = async (value) => {

        setProductData((prev) => ({
            ...prev,
            supplierName: value
        }));

        // User is typing again, so previously selected supplier
        // should no longer be considered selected.
        setSelectedSupplierId("");

        if (!value.trim()) {
            setSupplierSuggestions([]);
            setShowSupplierSuggestions(false);
            return;
        }

        try {

            setSupplierLoading(true);
            setShowSupplierSuggestions(true);

            const data = await searchSuppliers(value);

            setSupplierSuggestions(data.suppliers || []);

        } catch (error) {

            console.log(
                "Supplier search error:",
                error
            );

            setSupplierSuggestions([]);

        } finally {

            setSupplierLoading(false);

        }
    };


    const handleSupplierSelect = (supplier) => {

        setProductData((prev) => ({
            ...prev,
            supplierName: supplier.supplierName
        }));

        setSelectedSupplierId(supplier._id);

        setSupplierSuggestions([]);
        setShowSupplierSuggestions(false);
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const result = await addProduct(productData);

            if (result.product) {
                onProductAdded(result.product);
            }

            onClose();

            alert("Product added successfully");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

            console.log(
                err.message ||
                "Something went wrong"
            );
        }
    };


    useEffect(() => {

        const fetchCategories = async () => {

            try {

                const res = await getCategory();

                setCategories(res.result);

            } catch (err) {

                console.log(err);

            }
        };

        fetchCategories();

    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <div className="w-full max-w-[900px] max-h-[95vh] sm:max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Add Product
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Add a new product to your inventory.
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

                <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">

                    <form
                        onSubmit={handleSubmit}
                        className="w-full"
                    >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {inputData.map((data) => {
                                return (
                                    <div
                                        key={data.id}
                                        className={
                                            data.fullWidth
                                                ? "sm:col-span-2"
                                                : ""
                                        }
                                    >

                                        <label className="block text-xs sm:text-sm text-text font-semibold mb-1.5">
                                            {data.label}
                                            {data.required && (
                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            )}
                                        </label>

                                        {data.type === "select" ? (
                                            <select
                                                name={data.name}
                                                value={
                                                    productData[data.name]
                                                }
                                                onChange={handleChange}
                                                required={data.required}
                                                className="w-full h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border border-gray-200 px-3 text-sm bg-white"
                                            >
                                                <option value="">
                                                    Select Category
                                                </option>
                                                {categories.map((items) => (
                                                    <option
                                                        key={items._id}
                                                        value={items._id}
                                                    >
                                                        {items.categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : data.name === "supplierName" ? (

                                            <div className="relative">

                                                <input
                                                    name="supplierName"
                                                    type="text"
                                                    placeholder={data.placeholder}
                                                    value={productData.supplierName}
                                                    onChange={(e) =>
                                                        handleSupplierSearch(e.target.value)
                                                    }
                                                    onFocus={() => {
                                                        if (productData.supplierName.trim()) {
                                                            setShowSupplierSuggestions(true);
                                                        }
                                                    }}
                                                    className="w-full h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border border-gray-200 px-3 text-sm"
                                                />

                                                {showSupplierSuggestions && (
                                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">

                                                        {supplierLoading ? (

                                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                                Searching suppliers...
                                                            </div>

                                                        ) : supplierSuggestions.length > 0 ? (

                                                            supplierSuggestions.map((supplier) => (

                                                                <button
                                                                    type="button"
                                                                    key={supplier._id}
                                                                    onClick={() =>
                                                                        handleSupplierSelect(supplier)
                                                                    }
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {supplier.supplierName}
                                                                    </p>

                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {supplier.phone}
                                                                    </p>
                                                                </button>

                                                            ))

                                                        ) : (

                                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                                No supplier found
                                                            </div>

                                                        )}

                                                    </div>
                                                )}

                                            </div>

                                        ) : (

                                            <input
                                                name={data.name}
                                                type={data.type}
                                                placeholder={data.placeholder}
                                                required={data.required}
                                                value={productData[data.name]}
                                                onChange={handleChange}
                                                className="w-full h-11 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg border border-gray-200 px-3 text-sm"
                                            />

                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {error && (
                            <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
                                <p className="text-xs sm:text-sm text-red-500 text-center">
                                    {error}
                                </p>
                            </div>
                        )}
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="submit"
                                className="text-sm w-full h-11 bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                            >
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
