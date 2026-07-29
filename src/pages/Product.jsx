import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LastParams from "../components/lastParams";

import TransparentButton from "../components/transparentButton";
import FilledButton from "../components/filledButton";

import TotalProductIcon from "../components/Icons/product page icons/totalProductIcon";
import LowStockIcon from "../components/Icons/product page icons/lowStockIcon";
import ExpiringSoonIcon from "../components/Icons/product page icons/expiringSoonIcon";
import OutofStockIcon from "../components/Icons/product page icons/outOfStockIcon";

import FilterIcon from "../components/Icons/filterIcon";
import SearchIcon from "../components/Icons/SearchIcon";

import Pagination from "../components/pagination";
import HeadingWithButton from "../components/Headings";

import { Products } from "../Product/data.js";
import { getProducts } from "../services/productService";

import AddProductModal from '../components/modals/AddProductModal';

// const productCategories = [
//     ...new Set(Products.map((product) => product.productCategory))
// ];

// const productSuppliers = [
//     ...new Set(Products.map((product) => product.supplier))
// ];

// const productStatus = [
//     ...new Set(Products.map((product) => product.status))
// ];


// const today = new Date();
// today.setHours(0, 0, 0, 0);

// const fiveDaysLater = new Date(today);
// fiveDaysLater.setDate(today.getDate() + 10);

// const expiringSoonCount = Products.filter((product) => {
//     const expiryDate = new Date(product.expiry);
//     expiryDate.setHours(0, 0, 0, 0);

//     return expiryDate >= today && expiryDate <= fiveDaysLater;
// }).length;

// const outOfStockCount = Products.filter(
//     (product) => product.status === "Out Of Stock"
// ).length;

// const lowStockCount = Products.filter(
//     (product) => product.status === "Low Stock"
// ).length;

// const totalProductCount = Products.length;

// const AnalyticsData = [
//     { id: 1, icon: TotalProductIcon, number: totalProductCount, content: "Total Product", color: "text-secondary", bg: "bg-[#F0FDFA]" },
//     { id: 2, icon: LowStockIcon, number: lowStockCount, content: "Low Stock", color: "text-red-500", bg: "bg-[#FFFBEB]" },
//     { id: 3, icon: ExpiringSoonIcon, number: expiringSoonCount, content: "Expiring Soon", color: "text-orange-500", bg: "bg-[#FFF7ED]" },
//     { id: 4, icon: OutofStockIcon, number: outOfStockCount, content: "Out Of Stock", color: "text-red-500", bg: "bg-[#FEF3F2]" }
// ]

// const filterOption = [
//     {
//         placeholder: "All Categories",
//         options: productCategories
//     },
//     {
//         placeholder: "All Suppliers",
//         options: productSuppliers
//     },
//     {
//         placeholder: "All Status",
//         options: productStatus
//     },
//     {
//         placeholder: "All Expiry",
//         options: ["Valid", "Expiring Soon", "Expired"]
//     },
// ]


export default function ProductPage() {

    const [product, setProduct] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const result = await getProducts();
                console.log("======> result", result);
                setProduct(result.products);
            } catch (err) {
                console.log(err);
            }
        };
        fetchProduct();
        console.log("=========> fetchProduct", fetchProduct())
    }, []);

    const [searchText, setSearchtext] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        suppliers: "",
        status: "",
    });

    const SearchProducts = product.filter((product) => {
        const search = searchText.toLowerCase();

        const matchesSearch = (product.productName || "").toLowerCase().includes(search)
            || (product.productCategory || "").toLowerCase().includes(search)
            || (product.supplierName || "").toLowerCase().includes(search);
        const matchesCategory = !filters.category || product.productCategory === filters.category;
        const matchesSuppliers = !filters.suppliers || product.supplierName === filters.suppliers;
        const matchesStatus = !filters.status || product.status === filters.status;

        const expiryDate = new Date(product.expiry);
        expiryDate.setHours(0, 0, 0, 0);

        const matchesExpiry = (() => {
            switch (filters.expiry) {
                case "Expired": return expiryDate < today;
                case "Expiring Soon": return expiryDate >= today && expiryDate <= fiveDaysLater;
                case "Valid": return expiryDate > fiveDaysLater;
                default: return true;
            }
        })();

        return (
            matchesSearch &&
            matchesCategory &&
            matchesSuppliers &&
            matchesStatus &&
            matchesExpiry
        );
    });

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    const currentProducts = SearchProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const totalPages = Math.ceil(SearchProducts.length / productsPerPage);

    const [showModal, setShowModal] = useState(false);



    const productCategories = [
        ...new Set(product.map((product) => product.productCategory))
    ];

    const productSuppliers = [
        ...new Set(product.map((product) => product.supplierName))
    ];

    const productStatus = [
        ...new Set(product.map((product) => product.status))
    ];


    const filterOption = [
        {
            placeholder: "All Categories",
            options: productCategories
        },
        {
            placeholder: "All Suppliers",
            options: productSuppliers
        },
        {
            placeholder: "All Status",
            options: productStatus
        },
        {
            placeholder: "All Expiry",
            options: ["Valid", "Expiring Soon", "Expired"]
        },
    ]


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 10);

    const expiringSoonCount = product.filter((product) => {
        const expiryDate = new Date(product.ExpiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        return expiryDate >= today && expiryDate <= fiveDaysLater;
    }).length;

    const outOfStockCount = product.filter(
        (product) => product.status === "Out Of Stock"
    ).length;

    const lowStockCount = product.filter(
        (product) => product.status === "Low Stock"
    ).length;

    const totalProductCount = product.length;

    const AnalyticsData = [
        { id: 1, icon: TotalProductIcon, number: totalProductCount, content: "Total Product", color: "text-secondary", bg: "bg-[#F0FDFA]" },
        { id: 2, icon: LowStockIcon, number: lowStockCount, content: "Low Stock", color: "text-red-500", bg: "bg-[#FFFBEB]" },
        { id: 3, icon: ExpiringSoonIcon, number: expiringSoonCount, content: "Expiring Soon", color: "text-orange-500", bg: "bg-[#FFF7ED]" },
        { id: 4, icon: OutofStockIcon, number: outOfStockCount, content: "Out Of Stock", color: "text-red-500", bg: "bg-[#FEF3F2]" }
    ]

    return (
        <div>
            <LastParams />

            <HeadingWithButton
                mainheading="Product Management"
                contentLine="16 medicines across 9 categories"
                firstButton="Export"
                secondButton="Import"
                thirdButton="Add Product"
                onThirdButtonClick={() => setShowModal(true)}
            />

            {showModal && (
                <AddProductModal onClose={() => setShowModal(false)} />
            )}

            {/* stock divs */}
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


            {/* Search Filter */}
            <div className="bg-white p-4 border border-[#E8ECF1] rounded-xl mt-5 flex gap-5 items-center">
                <div className="flex border border-[#E8ECF1] p-2 rounded-lg w-[50%] gap-2 items-center">
                    <span>
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <input type="text" value={searchText} onChange={(e) => setSearchtext(e.target.value)} placeholder="Seacrh Products.." className="w-[100%] focus:outline-none focus:ring-0 text-sm text-text" />
                </div>
                <div className="flex gap-5 items-center">
                    <FilterIcon className="h-4 w-4" />
                    {filterOption.map((filter) => {
                        const filterkeys =
                            filter.placeholder === "All Categories" ? "category"
                                : filter.placeholder === "All Suppliers" ? "suppliers"
                                    : filter.placeholder === "All Status" ? "status"
                                        : "expiry";
                        return (
                            <select key={filter.placeholder}
                                value={filters[filterkeys]}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        [filterkeys]: e.target.value,
                                    })
                                }
                                className="focus:outline-none focus:ring-0 border border-[#E8ECF1] rounded-lg py-2 px-4 text-text cursor-pointer">
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

            {/* Products */}
            <div className="border-[#E8ECF1] border rounded-xl mt-5">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="text-text uppercase text-xs bg-[#FAFBFC]">
                            <th className="p-4 text-left">Product</th>
                            <th className="p-4 text-left">Category</th>
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
                        {currentProducts.length > 0 ? (
                            currentProducts.map((product) => (
                                <tr key={product._id}>
                                    <td className="p-4 text-left">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">{product.productName}</span>
                                            <span className="text-text font-medium text-xs">ID:{product.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-left">
                                        <span className="bg-[#E8ECF1] text-xs p-1 rounded-sm font-semibold text-text">{product.productCategory}</span>
                                    </td>
                                    <td className="p-4 text-left font-semibold">

                                        <span className={` ${product.stock === 0 ? "text-red-500" : product.stock < 50 ? "text-orange-500" : "text-black"}`}>{product.stock}</span>
                                    </td>
                                    <td className="p-4 text-left text-text">{product.purchase}</td>
                                    <td className="p-4 text-left text-secondary font-semibold">{product.sellingPrice}</td>
                                    <td className="p-4 text-left">
                                        <span className="text-sm text-text">{product.ExpiryDate}</span>
                                    </td>
                                    <td className="p-4 text-left text-text text-sm">{product.supplierName}</td>
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
                                    <td className="p-4 text-left"></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center py-9 text-text">No Product Found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="flex items-center justify-between p-4 border-t">
                    <p className="text-sm text-text">
                        Showing {indexOfFirstProduct + 1}-
                        {Math.min(indexOfLastProduct, Products.length)} of {Products.length}
                    </p>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

        </div>
    )
}