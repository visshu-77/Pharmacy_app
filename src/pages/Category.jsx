import { useEffect, useState } from "react";
import { Trash2, Eye, Pencil } from "lucide-react";

import LastParams from "../components/lastParams";
import HeadingWithButton from "../components/Headings";

import SearchIcon from "../components/Icons/SearchIcon";
import FilterIcon from "../components/Icons/filterIcon";


import TotalProductIcon from "../components/Icons/product page icons/totalProductIcon";

import AddcategoryModal from "../components/modals/AddcategoryModal";

import {
    getCategory,
    deleteCategory,
    deleteSingleCategories,
    deleteAllCategories
} from "../services/categoryService";
import EditCategoryModal from "../components/modals/EditcategoryModal";
import ViewCategoryModal from "../components/modals/viewCategoryModal";


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
    const [selectedCategories, setSelectedCategories] = useState([]);

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

    const handleView = async (id) => {
        setSelectedCategoryId(id);
        setOpenViewModal(true);
    };

    const categoryOptions = [
        ...new Set(
            category
                .map((item) => item.categoryName)
                .filter(Boolean)
        )
    ];

    const AnalyticsData = [
        { id: 1, icon: TotalProductIcon, number: category.length, content: "Total Categories", color: "text-secondary", bg: "bg-[#F0FDFA]" }
    ]

    const handleSelectCategory = (id) => {
        setSelectedCategories((prev) => {
            if (prev.includes(id)) {
                return prev.filter(
                    (categoryId) => categoryId !== id
                );
            }

            return [...prev, id];
        });
    };

    const handleSelectAll = () => {
        const currentCategoryIds = currentProducts.map(
            (item) => item._id
        );

        const allSelected = currentCategoryIds.every(
            (id) => selectedCategories.includes(id)
        );

        if (allSelected) {
            setSelectedCategories((prev) =>
                prev.filter(
                    (id) => !currentCategoryIds.includes(id)
                )
            );
        } else {
            setSelectedCategories((prev) => [
                ...new Set([
                    ...prev,
                    ...currentCategoryIds
                ])
            ]);
        }
    };

    const isAllCurrentCategoriesSelected =
        currentProducts.length > 0 &&
        currentProducts.every(
            (item) => selectedCategories.includes(item._id)
        );

    const handleDeleteSelected = async () => {
        if (selectedCategories.length === 0) {
            alert("Please select at least one category");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedCategories.length} selected category(s)?`
        );

        if (!confirmed) return;

        try {
            await deleteSingleCategories(selectedCategories);

            setCategory((prev) =>
                prev.filter(
                    (item) =>
                        !selectedCategories.includes(item._id)
                )
            );

            setSelectedCategories([]);

            setCurrentPage(1);

            alert("Selected categories deleted successfully");
        } catch (error) {
            console.log(error);
            alert("Failed to delete selected categories");
        }
    };

    const handleDeleteAll = async () => {
        if (category.length === 0) {
            alert("No categories available to delete");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ALL ${category.length} categories?`
        );

        if (!confirmed) return;

        try {
            await deleteAllCategories();

            setCategory([]);
            setSelectedCategories([]);
            setCurrentPage(1);

            alert("All categories deleted successfully");
        } catch (error) {
            console.log(error);
            alert("Failed to delete all categories");
        }
    };

    return (
        <div>
            <LastParams />
            <HeadingWithButton
                mainheading="Product Categories"
                contentLine={`${category.length} categories`}
                thirdButton="Add Category"
                onThirdButtonClick={() => setShowModal(true)}
            />

            {showModal && (
                <AddcategoryModal onClose={(newCategory) => {
                    setShowModal(false)
                    if (newCategory) {
                        setCategory((prev) => [
                            ...prev,
                            newCategory
                        ]);
                    }
                }} />
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
            <div className="grid grid-cols-2 sm:grid-cols-4 mt-5 gap-5">
                {AnalyticsData.map((items) => {
                    const Icons = items.icon;
                    return (
                        <div key={items.id} className="flex items-center gap-5 bg-white p-4 border border-[#E8ECF1] dark:bg-darkColor dark:text-white rounded-xl">
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

            {selectedCategories.length > 0 && (
                <div className="flex items-center justify-between bg-white border border-[#E8ECF1] dark:bg-darkColor dark:text-white rounded-xl p-3 mt-4">

                    <span className="text-sm text-text">
                        {selectedCategories.length} categories
                        {selectedCategories.length > 1 ? "ies" : "y"} selected
                    </span>

                    <div className="flex gap-3">

                        <button
                            onClick={handleDeleteSelected}
                            className="bg-red-500 text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 dark:bg-black transition"
                        >
                            Delete Selected
                        </button>

                        <button
                            onClick={handleDeleteAll}
                            className="bg-red-500 text-white px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 dark:bg-black transition"
                        >
                            Delete All
                        </button>

                    </div>

                </div>
            )}

            {/* Search Filter */}
            <div className="bg-white dark:bg-darkColor p-4 border border-[#E8ECF1] rounded-xl mt-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex border border-[#E8ECF1] p-2.5 rounded-lg w-full sm:flex-1 gap-2 items-center">
                        <SearchIcon className="h-4 w-4 shrink-0 dark:stroke-white" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full min-w-0 focus:outline-none focus:ring-0 text-sm text-text dark:bg-darkColor dark:text-white"
                        />
                    </div>


                    {/* Filter */}
                    <div className="flex gap-3 items-center w-full sm:w-[280px]">
                        <FilterIcon className="h-4 w-4 shrink-0 dark:stroke-white" />
                        <select
                            value={filters.category}
                            onChange={(e) => {
                                setFilters({
                                    ...filters,
                                    category: e.target.value,
                                });

                                setCurrentPage(1);
                            }}
                            className="w-full focus:outline-none focus:ring-0 border border-[#E8ECF1] rounded-lg py-2.5 px-3 text-sm text-text cursor-pointer bg-white dark:bg-darkColor dark:text-white"
                        >
                            <option value="">
                                All Categories
                            </option>

                            {categoryOptions.map((categoryName) => (
                                <option
                                    key={categoryName}
                                    value={categoryName}
                                >
                                    {categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Categories */}
            <div className="border border-[#E8ECF1] rounded-xl mt-5 overflow-hidden">

                {/* ================================= */}
                {/* DESKTOP TABLE */}
                {/* ================================= */}

                <div className="hidden md:block">

                    <table className="w-full">

                        <thead>
                            <tr className="text-text uppercase text-xs bg-[#FAFBFC] dark:bg-darkColor dark:text-white">

                                <th className="p-4 text-left">
                                    <div className="flex items-center gap-3">

                                        <input
                                            type="checkbox"
                                            checked={isAllCurrentCategoriesSelected}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 cursor-pointer"
                                        />

                                        <span>Category Name</span>

                                    </div>
                                </th>

                                <th className="p-4 text-left">
                                    Description
                                </th>

                                <th className="p-4 text-left">
                                    Products
                                </th>

                                <th className="p-4 text-left">
                                    Actions
                                </th>

                            </tr>
                        </thead>


                        <tbody className="bg-white">

                            {currentProducts.length > 0 ? (

                                currentProducts.map((data) => (

                                    <tr
                                        key={data._id}
                                        className="border-t border-[#E8ECF1] hover:bg-[#FAFBFC] transition-colors dark:bg-darkColor dark:text-white"
                                    >

                                        {/* Category Name */}
                                        <td className="p-4">

                                            <div className="flex items-center gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(
                                                        data._id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectCategory(
                                                            data._id
                                                        )
                                                    }
                                                    className="w-4 h-4 cursor-pointer"
                                                />

                                                <span className="text-sm font-semibold">
                                                    {data.categoryName}
                                                </span>

                                            </div>

                                        </td>


                                        {/* Description */}
                                        <td className="p-4">

                                            <span className="inline-block bg-[#E8ECF1] text-xs px-2 py-1 rounded-sm font-semibold text-text max-w-[300px] truncate">
                                                {data.description || "-"}
                                            </span>

                                        </td>


                                        {/* Products */}
                                        <td className="p-4 text-sm">
                                            {data.productCount ?? 0}
                                        </td>


                                        {/* Actions */}
                                        <td className="p-4">

                                            <div className="flex gap-3">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleView(data._id)
                                                    }
                                                    className="text-blue-500"
                                                >
                                                    <Eye
                                                        size={16}
                                                        className="stroke-text hover:stroke-primary transition-transform duration-300 hover:scale-110"
                                                    />
                                                </button>


                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedCategory(data);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-green-500"
                                                >
                                                    <Pencil
                                                        size={16}
                                                        className="stroke-text hover:stroke-green-500 transition-transform duration-300 hover:scale-110"
                                                    />
                                                </button>


                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            data._id
                                                        )
                                                    }
                                                    className="text-red-500"
                                                >
                                                    <Trash2
                                                        size={16}
                                                        className="stroke-text hover:stroke-red-500 transition-transform duration-300 hover:scale-110"
                                                    />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="4"
                                        className="text-center py-9 text-text"
                                    >
                                        No Category Found
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ================================= */}
                {/* MOBILE CARDS */}
                {/* ================================= */}

                <div className="md:hidden bg-[#F8FAFC] dark:bg-darkColor p-3">

                    {currentProducts.length > 0 ? (

                        <div className="space-y-3">

                            {currentProducts.map((data) => (

                                <div
                                    key={data._id}
                                    className="bg-white border border-[#E8ECF1] dark:bg-darkColor dark:text-white rounded-xl p-4"
                                >

                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex items-start gap-3 min-w-0">

                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(
                                                    data._id
                                                )}
                                                onChange={() =>
                                                    handleSelectCategory(
                                                        data._id
                                                    )
                                                }
                                                className="w-4 h-4 mt-1 shrink-0 cursor-pointer"
                                            />

                                            <div className="min-w-0">

                                                <h3 className="text-sm font-semibold dark:text-white text-gray-900 break-words">
                                                    {data.categoryName}
                                                </h3>

                                                <span className="inline-block mt-1 text-[10px] font-medium text-gray-500">
                                                    Category
                                                </span>

                                            </div>

                                        </div>


                                        {/* Product Count */}
                                        <div className="shrink-0 text-right">

                                            <p className="text-[10px] text-gray-400">
                                                Products
                                            </p>

                                            <p className="text-sm font-semibold text-secondary">
                                                {data.productCount ?? 0}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Description */}
                                    <div className="mt-4 pt-3 border-t border-[#E8ECF1]">

                                        <p className="text-[11px] text-gray-400 mb-1">
                                            Description
                                        </p>

                                        <p className="text-sm text-text leading-5 break-words">
                                            {data.description || "No description available"}
                                        </p>

                                    </div>


                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8ECF1]">

                                        <span className="text-xs text-gray-400">
                                            Category ID: {data._id.slice(-6)}
                                        </span>


                                        <div className="flex items-center gap-2">

                                            {/* View */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleView(data._id)
                                                }
                                                className="p-2 rounded-lg bg-blue-50 text-blue-500"
                                            >
                                                <Eye size={16} />
                                            </button>


                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory(data);
                                                    setShowEditModal(true);
                                                }}
                                                className="p-2 rounded-lg bg-green-50 text-green-500"
                                            >
                                                <Pencil size={16} />
                                            </button>


                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        data._id
                                                    )
                                                }
                                                className="p-2 rounded-lg bg-red-50 text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="bg-white rounded-xl py-10 text-center text-text text-sm">
                            No Category Found
                        </div>

                    )}

                </div>


                {/* ================================= */}
                {/* PAGINATION */}
                {/* ================================= */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t bg-white dark:bg-darkColor dark:text-white">

                    <p className="text-xs sm:text-sm text-text">

                        {searchCategory.length > 0
                            ? `Showing ${indexOfFirstCategory + 1}-${Math.min(
                                indexOfLastCategory,
                                searchCategory.length
                            )} of ${searchCategory.length}`
                            : "Showing 0-0 of 0"}

                    </p>


                    <div className="flex items-center justify-between sm:justify-end gap-2">

                        <button
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((prev) => prev - 1)
                            }
                            className="px-3 py-1.5 text-xs sm:text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        <span className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap">
                            {currentPage} / {totalPages || 1}
                        </span>

                        <button
                            disabled={
                                currentPage === totalPages ||
                                totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage((prev) => prev + 1)
                            }
                            className="px-3 py-1.5 text-xs sm:text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>


        </div>
    )
}