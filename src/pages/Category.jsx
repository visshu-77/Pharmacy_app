import { useEffect, useState } from "react";
import { Trash2, Eye, Pencil } from "lucide-react";

import LastParams from "../components/lastParams";
import HeadingWithButton from "../components/Headings";

import SearchIcon from "../components/Icons/SearchIcon";
import FilterIcon from "../components/Icons/filterIcon";


import TotalProductIcon from "../components/Icons/product page icons/totalProductIcon";
import LowStockIcon from "../components/Icons/product page icons/lowStockIcon";
import ExpiringSoonIcon from "../components/Icons/product page icons/expiringSoonIcon";
import OutofStockIcon from "../components/Icons/product page icons/outOfStockIcon";

import AddcategoryModal from "../components/modals/AddcategoryModal";

import { getCategory, deleteCategory } from "../services/categoryService";
import EditCategoryModal from "../components/modals/EditcategoryModal";
import ViewCategoryModal from "../components/modals/viewCategoryModal";

const AnalyticsData = [
    { id: 1, icon: TotalProductIcon, number: 16, content: "Total Product", color: "text-secondary", bg: "bg-[#F0FDFA]" },
    { id: 2, icon: LowStockIcon, number: 4, content: "Low Stock", color: "text-red-500", bg: "bg-[#FFFBEB]" },
    { id: 3, icon: ExpiringSoonIcon, number: 2, content: "Expiring Soon", color: "text-orange-500", bg: "bg-[#FFF7ED]" },
    { id: 4, icon: OutofStockIcon, number: 1, content: "Out Of Stock", color: "text-red-500", bg: "bg-[#FEF3F2]" }
]


const filterOption = [
    {
        placeholder: "All Categories",
        options: ["antibiotics", "DOLO"]
    }
]

export default function CategoryPage() {

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);

    const [category, setCategory] = useState([]);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const result = await getCategory();
                setCategory(result.result);
            } catch (err) {
                console.log(err);
            }
        };
        fetchCategory();

    }, []);

    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        category: "",
    });

    const searchCategory = category.filter((item) => {
        const search = searchText.toLowerCase();
        const matchSearch = (item.categoryName || "").toLowerCase().includes(search);
        const matchCategory = !filters.category || item.categoryName === filters.category;

        return (
            matchSearch &&
            matchCategory
        );
    });

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const indexOfLastCategory = currentPage * productsPerPage;
    const indexOfFirstCategory = indexOfLastCategory - productsPerPage;

    const currentProducts = searchCategory.slice(
        indexOfFirstCategory,
        indexOfLastCategory
    );
    const totalPages = Math.ceil(searchCategory.length / productsPerPage);


    // delete handler
    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);

            setCategory((prev) =>
                prev.filter((item) => item._id !== id)
            )

            alert("category delete successfully")
        } catch (err) {
            console.log(err);
            alert("something went wrong");
        }
    }

    const handleView = async(id) => {
        setSelectedCategoryId(id);
        setOpenViewModal(true);
    };

    return (
        <div>
            <LastParams />
            <HeadingWithButton
                mainheading="Product Categories"
                contentLine="17 categories"
                firstButton="Export"
                secondButton="Import"
                thirdButton="Add Category"
                onThirdButtonClick={() => setShowModal(true)}
            />

            {showModal && (
                <AddcategoryModal onClose={() => setShowModal(false)} />
            )}

            {showEditModal && (
                <EditCategoryModal
                    category={selectedCategory}
                    onClose={() => setShowEditModal(false)}

                    onUpdate={(updatedCategory) => {

                        setCategory(prev =>
                            prev.map(item =>
                                item._id === updatedCategory._id
                                    ? updatedCategory
                                    : item
                            )
                        );

                    }}
                />
            )}

            {openViewModal && (
                <ViewCategoryModal
                categoryId={selectedCategoryId}
                onClose={() => setOpenViewModal(false)}
                />
            )
            }
            

            {/* stock div */}
            <div className="grid grid-cols-4 mt-5 gap-5">
                {AnalyticsData.map((items) => {
                    const Icons = items.icon;
                    return (
                        <div key={items.id} className="flex items-center gap-5 bg-white p-4 border border-[#E8ECF1] rounded-xl">
                            <div>
                                <Icons className={`h-9 w-9 ${items.color} ${items.bg} p-2 rounded`} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-xl">{items.number}</h2>
                                <p className="text-xs font-medium text-text">{items.content}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* search filter */}
            <div className="bg-white p-4 border border-[#E8ECF1] rounded-xl mt-5 flex gap-5 items-center">
                <div className="flex border border-[#E8ECF1] p-2 rounded-lg w-[90%] gap-2 items-center">
                    <span>
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Seacrh categories.."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full focus:outline-none focus:ring-0 text-sm text-text" />
                </div>
                <div className="flex gap-5 items-center w-[30%]">
                    <FilterIcon className="h-4 w-4" />
                    {filterOption.map((filter) => {
                        return (
                            <select key={filter.placeholder}
                                className="w-[100%] focus:outline-none focus:ring-0 border border-[#E8ECF1] rounded-lg py-2 px-4 text-text cursor-pointer">
                                <option value="">{filter.placeholder}</option>
                                {filter.options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        );
                    })}
                </div>
            </div>

            {/* categories */}
            <div className="border-[#E8ECF1] border rounded-xl mt-5">
                <table className="w-full">
                    <thead>
                        <tr className="text-text uppercase text-xs bg-[#FAFBFC]">
                            <th className="p-4 text-left">Category name</th>
                            <th className="p-4 text-left">Description</th>
                            <th className="p-4 text-left">Products</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="w-full table-fixed bg-white">
                        {currentProducts.length > 0 ? (
                            currentProducts.map((data) => (
                                <tr key={data._id}>
                                    <td className="p-4 text-left">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{data.categoryName}</span>
                                            <span className="text-text font-medium text-xs">{data._id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-left">
                                        <span className="bg-[#E8ECF1] text-xs p-1 rounded-sm font-semibold text-text">{data.description}</span>
                                    </td>
                                    <td className="p-4 text-left text-sm">
                                        <span>{data.productCount}</span>
                                    </td>

                                    <td className="p-4 text-left">
                                        <div className="flex gap-3">

                                            <button
                                                className="text-blue-500 text-sm"
                                                onClick={() => handleView(data._id)}
                                            >
                                                <Eye size={15} className="stroke-text hover:stroke-primary transition-transform duration-300 hover:scale-110" />
                                            </button>

                                            <button
                                            className="text-green-500 text-sm"
                                                onClick={() => {
                                                    setSelectedCategory(data);
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                <Pencil size={15} className="stroke-text hover:stroke-green-500 transition-transform duration-300 hover:scale-110"  />
                                            </button>

                                            <button
                                                className="text-red-500 text-sm"
                                                onClick={() => handleDeleteCategory(data._id)}
                                            >
                                                <Trash2 size={15} className="stroke-text hover:stroke-red-500 transition-transform duration-300 hover:scale-110" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8">
                                    No Category Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex items-center justify-between p-4 border-t">
                    <p className="text-sm text-text">
                        pagination
                    </p>
                </div>
            </div>

        </div>
    )
}