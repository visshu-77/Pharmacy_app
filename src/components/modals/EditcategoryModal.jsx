import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { updateCategory } from "../../services/categoryService";

export default function EditCategoryModal({ category, onClose, onUpdate }) {
    const [error, setError] = useState("");

    const [categoryData, setCategoryData] = useState({
        categoryName: "",
        description: ""
    });

    useEffect(() => {
        if (category) {
            setCategoryData({
                categoryName: category.categoryName,
                description: category.description
            });
        }
    }, [category]);

    const handleChange = (e) => {
        setCategoryData({
            ...categoryData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await updateCategory(
                category._id,
                categoryData
            )
            onUpdate(result.category)
            onClose();
            alert("Category edit successfully")
        } catch (err) {
            setError(
                err.response?.data?.message || "something went wrong"
            );
        }
    }

    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-[900px] bg-white m-auto border rounded items-center justify-center flex flex-col p-6">
                <div className="w-full flex justify-between">
                    <h3 className="text-xl font-semibold">Edit Category</h3>
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
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <lable className="text-sm text-text font-semibold">Category Name</lable>
                                <input
                                    name="categoryName"
                                    value={categoryData.categoryName}
                                    onChange={handleChange}
                                    placeholder="Category Name"
                                    className="focus:outline-none focus:ring-0 border rounded p-2 text-sm w-[100%]"
                                />

                                <lable className="text-sm text-text font-semibold">Description</lable>
                                <input
                                    name="description"
                                    value={categoryData.description}
                                    onChange={handleChange}
                                    placeholder="description"
                                    className="focus:outline-none focus:ring-0 border rounded p-2 text-sm"
                                />
                            </div>

                        </div>
                        <div className="mt-6">
                            <button
                                type="submit"
                                className="text-sm w-full p-3 bg-primary text-white font-semibold rounded"
                            >
                                Update Category
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