import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { updateCategory } from "../../services/categoryService";


export default function EditCategoryModal({
    category,
    onClose,
    onUpdate
}) {

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [categoryData, setCategoryData] = useState({
        categoryName: "",
        description: ""
    });


    useEffect(() => {

        if (category) {

            setCategoryData({
                categoryName: category.categoryName || "",
                description: category.description || ""
            });

        }

    }, [category]);


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

            const result = await updateCategory(
                category._id,
                categoryData
            );

            onUpdate(result.category);

            onClose();

            alert("Category updated successfully");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

            console.log(err);

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 dark:bg-white/10">

            {/* ================= MODAL ================= */}

            <div className="w-full max-w-[600px] max-h-[95vh] sm:max-h-[90vh] bg-white rounded-xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden dark:bg-darkColor dark:text-white">


                {/* ================= HEADER ================= */}

                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">

                    <div>

                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                            Edit Category
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Update your category information.
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

                        <div className="space-y-4">


                            {/* ================= CATEGORY NAME ================= */}

                            <div>

                                <label className="block text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 dark:text-white">

                                    Category Name

                                    <span className="text-red-500 ml-1">
                                        *
                                    </span>

                                </label>

                                <input
                                    name="categoryName"
                                    value={categoryData.categoryName}
                                    onChange={handleChange}
                                    placeholder="Category Name"
                                    required
                                    className="w-full h-11 border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white dark:focus:ring-darkColor"
                                />

                            </div>


                            {/* ================= DESCRIPTION ================= */}

                            <div>

                                <label className="block text-xs sm:text-sm text-gray-700 font-semibold mb-1.5 dark:text-white">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={categoryData.description}
                                    onChange={handleChange}
                                    placeholder="Enter category description"
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-darkColor dark:text-white dark:focus:ring-darkColor"
                                />

                            </div>

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
                                    ? "Updating..."
                                    : "Update Category"
                                }
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}
