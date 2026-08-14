import { X } from "lucide-react";
import { useState, useEffect } from "react";

import { addProduct } from "../../services/productService";
import { getCategory } from "../../services/categoryService";

const inputData = [
    {
        id: 1,
        name: "productName",
        type: "text",
        label: "Product Name",
        placeholder: "eg. Iphone 17 Pro Max",
        width: "w-[49%]",
        required: true,
    },
    {
        id: 2,
        name: "productCategory",
        type: "select",
        label: "Product Category",
        placeholder: "",
        width: "w-[49%]",
        required: true,
    },
    {
        id: 3,
        name: "stock",
        type: "number",
        label: "Stock",
        placeholder: "0-100000",
        width: "w-[49%]",
        required: true,
    },
    {
        id: 4,
        name: "purchase",
        type: "number",
        label: "Purchase Price",
        placeholder: "150.00",
        width: "w-[49%]",
    },
    {
        id: 5,
        name: "sellingPrice",
        type: "number",
        label: "Selling Price",
        placeholder: "299.00",
        width: "w-[49%]"
    },
    {
        id: 6,
        name: "ExpiryDate",
        type: "date",
        label: "Expiry Date",
        placeholder: "",
        width: "w-[49%]",
        required: true,
    },
    {
        id: 6,
        name: "supplierName",
        type: "text",
        label: "Supplier Name",
        placeholder: "eg. TATA",
        width: "w-[98.5%]"
    },
]



export default function AddProductModal({ onClose, onProductAdded }) {
    const [productData, setProductData] = useState({
        productName: "",
        productCategory: "",
        stock: "",
        purchase: "",
        sellingPrice: "",
        ExpiryDate: "",
        supplierName: "",
    })

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setProductData({
            ...productData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await addProduct(productData);
            if (result.product) {
                onProductAdded(result.product);
            }
            onClose();
            alert('product added successfully');
        } catch (err) {
            setError(
                err.response?.data?.message || 'something went wrong'
            )
            console.log(err.message || 'something went wrong');
        }
    }

    const [categories, setCategories] = useState([]);

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
    }, [])

    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-[900px] bg-white m-auto border rounded items-center justify-center flex flex-col p-6">
                <div className="w-full flex justify-between">
                    <h3 className="text-xl font-semibold">Add Product</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-primary transition">
                        <X size={20} />
                    </button>
                </div>
                <div className="w-full mt-4">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full">
                        <div className="flex flex-wrap gap-4">
                            {inputData.map((data) => {
                                return (
                                    <div key={data.id} className={` flex flex-col gap-1 ${data.width} `}>
                                        <lable className="text-sm text-text font-semibold">{data.label}</lable>

                                        {data.type === "select" ? (
                                            <select
                                                name={data.name}
                                                value={productData[data.name]}
                                                onChange={handleChange}
                                                required={data.required}
                                                className="focus:outline-none focus:ring-0 rounded border p-2 text-sm"
                                            >
                                                <option value=''>Select Categories</option>
                                                {categories.map((items) => (
                                                    <option
                                                        key={items._id}
                                                        value={items._id}
                                                    >
                                                        {items.categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                name={data.name}
                                                type={data.type}
                                                placeholder={data.placeholder}
                                                required={data.required}
                                                value={productData[data.name]}
                                                onChange={handleChange}
                                                className="focus:outline-none border rounded p-2 text-sm"
                                            />
                                        )}

                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="text-sm w-full p-3 bg-primary text-white font-semibold rounded"
                            >
                                Add Product
                            </button>
                        </div>
                        <div>
                            {error && (
                                <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}