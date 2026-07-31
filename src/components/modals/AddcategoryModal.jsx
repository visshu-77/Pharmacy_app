import { X } from "lucide-react";
import { useState, useEffect } from "react";

import { addCategory } from "../../services/categoryService";

    const inputData = [
        {
            id: 1,
            name: "categoryName",
            type: "text",
            label: "Category Name",
            placeholder: "eg., Mobile, Furniture",
            width:"w-[100%]",
            required:true,
        },
        {
            id: 2,
            name: "description",
            type: "text",
            label: "Product Category",
            placeholder: "",
            width:"w-[100%]",
            required:false,
        }
    ]



export default function AddProductModal({ onClose }) {
    const [categoryData, setCategoryData] = useState({
        categoryName:"",
        description:"",
    })

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setCategoryData({
            ...categoryData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
           const result = await addCategory(categoryData);
           alert('category Added successfully');
        }catch(err){
            setError(
                err.response?.data?.message || 'something went wrong'
            )
            console.log(err.message || 'something went wrong');
        }
    }

    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-[900px] bg-white m-auto border rounded items-center justify-center flex flex-col p-6">
                <div className="w-full flex justify-between">
                    <h3 className="text-xl font-semibold">Add Product</h3>
                     <button 
                     onClick={onClose}
                     className="text-gray-400 hover:text-primary transition">
                        <X size={20}/>
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
                                        <input
                                            name={data.name}
                                            type={data.type}
                                            placeholder={data.placeholder}
                                            required={data.required}
                                            value={categoryData[data.name]}
                                            onChange={handleChange}
                                            className="focus:outline-none focus:ring-0 border rounded p-2 text-sm"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-6">
                            <button 
                            type="submit"
                            className="text-sm w-full p-3 bg-primary text-white font-semibold rounded"
                            >
                                Add Category
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