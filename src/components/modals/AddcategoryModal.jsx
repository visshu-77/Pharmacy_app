import { X } from "lucide-react";
import { useState } from "react";

import { addCategory } from "../../services/categoryService";


const inputData = [
    {
        id: 1,
        name: "categoryName",
        type: "text",
        label: "Category Name",
        placeholder: "eg. Mobile, Furniture",
        required: true,
    },
    {
        id: 2,
        name: "description",
        type: "textarea",
        label: "Description",
        placeholder: "Enter category description",
        required: false,
    }
];


export default function AddProductModal({ onClose }) {

    const [categoryData, setCategoryData] = useState({
        categoryName: "",
        description: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {

        setCategoryData({
            ...categoryData,
            [e.target.name]: e.target.value
        });

        if (error) {
            setError("");
        }
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);
            setError("");

            const result = await addCategory(categoryData);

            alert("Category added successfully");

            onClose(result.result || result.category);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

            console.log(
                err.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="fixed inset-0 z-50 bg-black/30 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">

            {/* ================= MODAL ================= */}

            <div className="w-full max-w-[600px] max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-darkColor dark:text-white rounded-xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden">


                {/* ================= HEADER ================= */}

                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">

                    <div>

                        <h3 className="text-lg sm:text-xl font-semibold dark:text-white text-gray-900">
                            Add Category
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Create a new product category.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => onClose()}
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

                        <div className="space-y-4">

                            {inputData.map((data) => (

                                <div
                                    key={data.id}
                                    className="flex flex-col"
                                >

                                    <label className="text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 dark:text-white">

                                        {data.label}

                                        {data.required && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}

                                    </label>


                                    {data.type === "textarea" ? (

                                        <textarea
                                            name={data.name}
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            value={categoryData[data.name]}
                                            onChange={handleChange}
                                            rows={4}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white dark:focus:ring-darkColor"
                                        />

                                    ) : (

                                        <input
                                            name={data.name}
                                            type={data.type}
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            value={categoryData[data.name]}
                                            onChange={handleChange}
                                            className="w-full h-11 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white dark:focus:ring-darkColor"
                                        />

                                    )}

                                </div>

                            ))}

                        </div>


                        {/* ================= ERROR ================= */}

                        {error && (

                            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">

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
                                className="w-full h-11 text-sm bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed dark:bg-black"
                            >
                                {loading
                                    ? "Adding..."
                                    : "Add Category"
                                }
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}
