import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LastParams from "../components/lastParams";
import { Trash2, Eye, Pencil, ShoppingCart } from "lucide-react";

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
import {
    getProducts,
    deleteProduct,
    updateProduct,
    exportProducts,
    importProducts,
    singleProduct,
    deleteSingleProducts,
    deleteAllProducts
} from "../services/productService";

import { getCategory } from "../services/categoryService";
import { getSuppliers } from "../services/supplierService";

import AddProductModal from '../components/modals/AddProductModal';

import EditProductModal from "../components/modals/EditProductModal";
import ViewProductModal from "../components/modals/ViewProductModal";

import { useCart } from "../context/CartContext";
import CartDrawer from "../components/drawer/CartDrawer";

export default function ProductPage() {

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [product, setProduct] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);

    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [searchText, setSearchtext] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        suppliers: "",
        status: "",
        expiry: "",
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const result = await getProducts();
                console.log("======> result", result);
                setProduct(result.products || []);
            } catch (err) {
                console.log(err);
            }
        };
        fetchProduct();
    }, []);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [categoryResult, supplierResult] = await Promise.all([
                    getCategory(),
                    getSuppliers()
                ]);

                console.log("CATEGORIES:", categoryResult);
                console.log("SUPPLIERS:", supplierResult);

                setCategories(categoryResult.result || []);
                setSuppliers(supplierResult.suppliers || []);

            } catch (error) {
                console.log("Filter data error:", error);
            }
        };

        fetchFilterData();
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysLater = new Date(today);
    fiveDaysLater.setDate(today.getDate() + 5);

    const SearchProducts = product.filter((product) => {

        const search = searchText.toLowerCase();

        const matchesSearch =
            (product.productName || "").toLowerCase().includes(search) ||
            (product.productCategory?.categoryName || "").toLowerCase().includes(search) ||
            (product.supplierName || "").toLowerCase().includes(search);

        const matchesCategory =
            !filters.category ||
            product.productCategory?._id === filters.category;

        const matchesSuppliers =
            !filters.suppliers ||
            product.supplierName === filters.suppliers;

        // Calculate status from stock
        const productStatus =
            product.stock === 0
                ? "Out of Stock"
                : product.stock < 50
                    ? "Low Stock"
                    : "In Stock";

        const matchesStatus =
            !filters.status ||
            productStatus === filters.status;

        // Expiry
        const expiryDate = product.ExpiryDate
            ? new Date(product.ExpiryDate)
            : null;

        if (expiryDate) {
            expiryDate.setHours(0, 0, 0, 0);
        }

        const matchesExpiry = (() => {

            if (!filters.expiry) {
                return true;
            }

            if (!expiryDate) {
                return false;
            }

            switch (filters.expiry) {

                case "Expired":
                    return expiryDate < today;

                case "Expiring Soon":
                    return (
                        expiryDate >= today &&
                        expiryDate <= fiveDaysLater
                    );

                case "Valid":
                    return expiryDate > fiveDaysLater;

                default:
                    return true;
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

    console.log("ALL PRODUCTS:", product);
    console.log("SEARCH PRODUCTS:", SearchProducts);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

    const currentProducts = SearchProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    console.log("CURRENT PRODUCTS:", currentProducts);
    const totalPages = Math.ceil(SearchProducts.length / productsPerPage);

    const [showModal, setShowModal] = useState(false);

    const filterOption = [
        {
            placeholder: "All Categories",
            key: "category",
            options: categories
        },
        {
            placeholder: "All Suppliers",
            key: "suppliers",
            options: suppliers
        },
        {
            placeholder: "All Status",
            key: "status",
            options: [
                "In Stock",
                "Low Stock",
                "Out of Stock"
            ]
        },
        {
            placeholder: "All Expiry",
            key: "expiry",
            options: [
                "Valid",
                "Expiring Soon",
                "Expired"
            ]
        }
    ];

    const outOfStockCount = product.filter(
        (item) => Number(item.stock) === 0
    ).length;

    const lowStockCount = product.filter(
        (item) => Number(item.stock) > 0 && Number(item.stock) < 50
    ).length;

    const expiringSoonCount = product.filter((item) => {
        if (!item.ExpiryDate) return false;

        const expiryDate = new Date(item.ExpiryDate);

        if (isNaN(expiryDate.getTime())) return false;

        expiryDate.setHours(0, 0, 0, 0);

        return (
            expiryDate >= today &&
            expiryDate <= fiveDaysLater
        );
    }).length;

    const totalProductCount = product.length;

    const AnalyticsData = [
        { id: 1, icon: TotalProductIcon, number: totalProductCount, content: "Total Product", color: "text-secondary", bg: "bg-[#F0FDFA]" },
        { id: 2, icon: LowStockIcon, number: lowStockCount, content: "Low Stock", color: "text-red-500", bg: "bg-[#FFFBEB]" },
        { id: 3, icon: ExpiringSoonIcon, number: expiringSoonCount, content: "Expiring Soon", color: "text-orange-500", bg: "bg-[#FFF7ED]" },
        { id: 4, icon: OutofStockIcon, number: outOfStockCount, content: "Out Of Stock", color: "text-red-500", bg: "bg-[#FEF3F2]" }
    ]

    const handleDeleteproduct = async (id) => {
        try {
            await deleteProduct(id);

            setProduct((prev) =>
                prev.filter((product) => product._id != id)
            )

            alert("Product delete successfully")
        } catch (err) {
            console.log(err);
            alert("Something Went Wrong")
        }
    }

    const handleExports = async () => {
        try {
            const data = await exportProducts();

            const url = window.URL.createObjectURL(new Blob([data]));

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "products.csv");

            document.body.appendChild(link);

            link.click();
            link.remove();

        } catch (err) {
            console.log(err);
            alert("export failed");
        }
    }

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        if (importing) {
            return;
        }
        fileInputRef.current.click();
    };


    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            setImporting(true);
            setImportProgress(10);

            console.log("Selected CSV:", file);

            // Upload/import CSV
            setImportProgress(30);

            const importResult = await importProducts(file);

            console.log("IMPORT RESULT:", importResult);

            setImportProgress(80);

            // Fetch updated products
            const result = await getProducts();

            console.log("PRODUCTS AFTER IMPORT:", result);

            setProduct(result.products || []);
            setCurrentPage(1);

            setImportProgress(100);

            alert("Products imported successfully!");

        } catch (err) {

            console.log("Import error:", err);

            alert(
                err?.response?.data?.message ||
                "Import failed"
            );

        } finally {

            setImporting(false);

            setTimeout(() => {
                setImportProgress(0);
            }, 500);
        }

        // Allow selecting the same CSV again
        e.target.value = "";
    };


    const [viewProduct, setViewProduct] = useState(null);
    const [viewModal, setViewModal] = useState(false);

    const handleView = async (id) => {
        setViewProduct(id);
        setViewModal(true);
    }

    const [cartOpen, setCartOpen] = useState(false);
    const { addToCart } = useCart();

    const handleSelectProduct = (id) => {
        setSelectedProducts((prev) => {
            if (prev.includes(id)) {
                return prev.filter(
                    (productId) => productId !== id
                );
            }
            return [...prev, id];
        });
    };

    const handleSelectAll = () => {
        const currentProductIds = currentProducts.map(
            (product) => product._id
        );
        const allSelected = currentProductIds.every(
            (id) => selectedProducts.includes(id)
        );
        if (allSelected) {
            setSelectedProducts((prev) =>
                prev.filter(
                    (id) => !currentProductIds.includes(id)
                )
            );
        } else {
            setSelectedProducts((prev) => [
                ...new Set([
                    ...prev,
                    ...currentProductIds
                ])
            ]);
        }
    };

    const isAllCurrentProductsSelected =
        currentProducts.length > 0 &&
        currentProducts.every(
            (product) =>
                selectedProducts.includes(product._id)
        );

    const handleDeleteSelected = async () => {
        if (selectedProducts.length === 0) {
            alert("Please select at least one product");
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to delete ${selectedProducts.length} selected product(s)?`
        );
        if (!confirmed) return;
        try {
            await deleteSingleProducts(selectedProducts);
            setProduct((prev) =>
                prev.filter(
                    (product) =>
                        !selectedProducts.includes(product._id)
                )
            );
            setSelectedProducts([]);
            alert("Selected products deleted successfully");
        } catch (error) {
            console.log(error);
            alert("Failed to delete selected products");
        }
    };


    const handleDeleteAll = async () => {
        if (product.length === 0) {
            alert("No products available to delete");
            return;
        }
        const confirmed = window.confirm(
            `Are you sure you want to delete ALL ${product.length} products?`
        );
        if (!confirmed) return;
        try {
            await deleteAllProducts();
            setProduct([]);
            setSelectedProducts([]);
            setCurrentPage(1);
            alert("All products deleted successfully");
        } catch (error) {
            console.log(error);
            alert("Failed to delete all products");
        }
    };

    const productStatus = [
        "In Stock",
        "Low Stock",
        "Out of Stock"
    ];


    return (
        <div>
            <LastParams />

            <HeadingWithButton
                mainheading="Product Management"
                contentLine="16 medicines across 9 categories"
                firstButton="Export"
                onFirstButtonClick={handleExports}
                secondButton="Import"
                onSecondButtonClick={handleImportClick}
                thirdButton="Add Product"
                onThirdButtonClick={() => setShowModal(true)}
            />

            {showModal && (
                <AddProductModal onClose={() => setShowModal(false)}
                    onProductAdded={(newProduct) => {
                        setProduct((prev) => [
                            ...prev,
                            newProduct
                        ]);
                        setCurrentPage(1);
                    }}
                />
            )}

            {showEditModal && (
                <EditProductModal
                    product={selectedProduct}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={(updateProduct) => {
                        setProduct(prev =>
                            prev.map(item =>
                                item._id === updateProduct._id
                                    ? updateProduct
                                    : item
                            )
                        );
                    }}
                />
            )
            }

            {viewModal && (
                <ViewProductModal
                    productId={viewProduct}
                    onClose={() => setViewModal(false)}
                />
            )}

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />

            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />

            {importing && (
                <div className="bg-white border border-[#E8ECF1] rounded-xl p-5 mt-5">

                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Importing products...
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Please wait while your CSV is being processed.
                            </p>
                        </div>

                        <span className="text-sm font-semibold text-blue-600">
                            {importProgress}%
                        </span>
                    </div>

                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${importProgress}%`
                            }}
                        />
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                        Please don't close or refresh the page.
                    </p>

                </div>
            )}

            {/* stock divs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 mt-5 gap-5">
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
            <div className="bg-white p-4 border border-[#E8ECF1] rounded-xl mt-5 flex flex-wrap sm:flex-nowrap gap-5 items-center">
                <div className="flex border border-[#E8ECF1] p-2 rounded-lg w-full sm:w-[50%] gap-2 items-center">
                    <span>
                        <SearchIcon className="h-4 w-4" />
                    </span>
                    <input type="text" value={searchText} onChange={(e) => setSearchtext(e.target.value)} placeholder="Seacrh Products.." className="w-[100%] focus:outline-none focus:ring-0 text-sm text-text" />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-5 items-center">
                    <FilterIcon className="h-4 w-4" />
                    {filterOption.map((filter) => {

                        return (
                            <select
                                key={filter.key}
                                value={filters[filter.key]}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        [filter.key]: e.target.value
                                    })
                                }
                                className="focus:outline-none focus:ring-0 border border-[#E8ECF1] rounded-lg py-2 px-4 text-text cursor-pointer"
                            >

                                <option value="">
                                    {filter.placeholder}
                                </option>

                                {filter.options.map((option) => {

                                    const optionValue =
                                        filter.key === "category"
                                            ? option._id
                                            : filter.key === "suppliers"
                                                ? option.supplierName
                                                : option;

                                    const optionLabel =
                                        filter.key === "category"
                                            ? option.categoryName
                                            : filter.key === "suppliers"
                                                ? option.supplierName
                                                : option;

                                    return (
                                        <option
                                            key={optionValue}
                                            value={optionValue}
                                        >
                                            {optionLabel}
                                        </option>
                                    );
                                })}

                            </select>
                        );
                    })}
                </div>
            </div>


            {selectedProducts.length > 0 && (
                <div className="flex items-center justify-between bg-white border border-[#E8ECF1] rounded-xl p-3 mt-4">

                    <span className="text-sm text-text">
                        {selectedProducts.length} product
                        {selectedProducts.length > 1 ? "s" : ""} selected
                    </span>

                    <div className="flex gap-3 items-center justify-center">
                        <div>
                            <button
                                onClick={handleDeleteSelected}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                            >
                                Delete Selected
                            </button>
                        </div>

                        <div className="">
                            <button
                                onClick={handleDeleteAll}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>

                </div>

            )}

            {/* Products */}
            <div className="border border-[#E8ECF1] rounded-xl mt-5 overflow-hidden">

                {/* ================= DESKTOP TABLE ================= */}
                <div className="hidden md:block overflow-x-auto">

                    <table className="w-full min-w-[1200px]">

                        {/* KEEP YOUR EXISTING THEAD */}
                        <thead>
                            <tr className="text-text uppercase text-xs bg-[#FAFBFC]">

                                <th className="p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isAllCurrentProductsSelected}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <span>Product</span>
                                    </div>
                                </th>

                                <th className="p-4 text-left">Category</th>
                                <th className="p-4 text-left">Stock</th>
                                <th className="p-4 text-left">Purchase</th>
                                <th className="p-4 text-left">Selling</th>
                                <th className="p-4 text-left">Expiry</th>
                                <th className="p-4 text-left">Supplier</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Actions</th>
                                <th className="p-4 text-left">Add to Cart</th>

                            </tr>
                        </thead>

                        <tbody className="bg-white">

                            {currentProducts.length > 0 ? (

                                currentProducts.map((product) => (

                                    <tr
                                        key={product._id}
                                        className="border-t border-[#E8ECF1] hover:bg-[#FAFBFC]"
                                    >

                                        {/* Product */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(
                                                        product._id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectProduct(product._id)
                                                    }
                                                    className="w-4 h-4 cursor-pointer"
                                                />

                                                <span className="text-sm font-semibold">
                                                    {product.productName}
                                                </span>

                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="p-4">
                                            <span className="bg-[#E8ECF1] text-xs px-2 py-1 rounded-sm font-semibold">
                                                {product.productCategory?.categoryName || "-"}
                                            </span>
                                        </td>

                                        {/* Stock */}
                                        <td className="p-4 font-semibold">
                                            <span
                                                className={
                                                    product.stock === 0
                                                        ? "text-red-500"
                                                        : product.stock < 50
                                                            ? "text-orange-500"
                                                            : "text-black"
                                                }
                                            >
                                                {product.stock ?? 0}
                                            </span>
                                        </td>

                                        {/* Purchase */}
                                        <td className="p-4 text-text">
                                            ₹
                                            {Number(
                                                product.purchase || 0
                                            ).toLocaleString("en-IN")}
                                        </td>

                                        {/* Selling */}
                                        <td className="p-4 text-secondary font-semibold">
                                            ₹
                                            {Number(
                                                product.sellingPrice || 0
                                            ).toLocaleString("en-IN")}
                                        </td>

                                        {/* Expiry */}
                                        <td className="p-4 text-sm">
                                            {product.ExpiryDate
                                                ? new Date(
                                                    product.ExpiryDate
                                                ).toLocaleDateString("en-IN")
                                                : "-"}
                                        </td>

                                        {/* Supplier */}
                                        <td className="p-4 text-text text-sm">
                                            {product.supplierName || "-"}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <span
                                                className={`border rounded-full px-2 py-1 text-xs font-semibold ${product.stock === 0
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

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex gap-3">

                                                <button
                                                    onClick={() =>
                                                        handleView(product._id)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteproduct(
                                                            product._id
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>
                                        </td>

                                        {/* Cart */}
                                        <td className="p-4">

                                            <button
                                                onClick={() => {
                                                    addToCart(product);
                                                    setCartOpen(true);
                                                }}
                                            >
                                                <ShoppingCart size={20} />
                                            </button>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan="10"
                                        className="text-center py-9 text-text"
                                    >
                                        No Product Found
                                    </td>
                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ================= MOBILE CARDS ================= */}
                <div className="md:hidden bg-[#F8FAFC] p-3">

                    {currentProducts.length > 0 ? (

                        <div className="space-y-3">

                            {currentProducts.map((product) => {

                                const status =
                                    product.stock === 0
                                        ? "Out of Stock"
                                        : product.stock < 50
                                            ? "Low Stock"
                                            : "In Stock";

                                return (

                                    <div
                                        key={product._id}
                                        className="bg-white border border-[#E8ECF1] rounded-xl p-4"
                                    >

                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex items-start gap-3 min-w-0">

                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(
                                                        product._id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectProduct(
                                                            product._id
                                                        )
                                                    }
                                                    className="w-4 h-4 mt-1 shrink-0"
                                                />

                                                <div className="min-w-0">

                                                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                                                        {product.productName}
                                                    </h3>

                                                    <span className="inline-block mt-1 bg-[#E8ECF1] text-xs px-2 py-1 rounded">
                                                        {product.productCategory
                                                            ?.categoryName || "-"}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Status */}
                                            <span
                                                className={`shrink-0 border rounded-full px-2 py-1 text-[10px] font-semibold ${product.stock === 0
                                                        ? "text-red-500 bg-red-100"
                                                        : product.stock < 50
                                                            ? "text-orange-500 bg-orange-100"
                                                            : "text-secondary bg-green-100"
                                                    }`}
                                            >
                                                {status}
                                            </span>

                                        </div>


                                        {/* Product Information */}
                                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#E8ECF1]">

                                            <div>
                                                <p className="text-[11px] text-gray-400">
                                                    Stock
                                                </p>

                                                <p
                                                    className={`text-sm font-semibold mt-1 ${product.stock === 0
                                                            ? "text-red-500"
                                                            : product.stock < 50
                                                                ? "text-orange-500"
                                                                : "text-gray-900"
                                                        }`}
                                                >
                                                    {product.stock ?? 0}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="text-[11px] text-gray-400">
                                                    Supplier
                                                </p>

                                                <p className="text-sm font-medium mt-1 truncate">
                                                    {product.supplierName || "-"}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="text-[11px] text-gray-400">
                                                    Purchase Price
                                                </p>

                                                <p className="text-sm font-medium mt-1">
                                                    ₹
                                                    {Number(
                                                        product.purchase || 0
                                                    ).toLocaleString("en-IN")}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="text-[11px] text-gray-400">
                                                    Selling Price
                                                </p>

                                                <p className="text-sm font-semibold text-secondary mt-1">
                                                    ₹
                                                    {Number(
                                                        product.sellingPrice || 0
                                                    ).toLocaleString("en-IN")}
                                                </p>
                                            </div>


                                            <div>
                                                <p className="text-[11px] text-gray-400">
                                                    Expiry
                                                </p>

                                                <p className="text-sm mt-1">
                                                    {product.ExpiryDate
                                                        ? new Date(
                                                            product.ExpiryDate
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "-"}
                                                </p>
                                            </div>

                                        </div>


                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8ECF1]">

                                            <div className="flex items-center gap-4">

                                                {/* View */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleView(product._id)
                                                    }
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-500"
                                                >
                                                    <Eye size={16} />
                                                </button>


                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
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
                                                        handleDeleteproduct(
                                                            product._id
                                                        )
                                                    }
                                                    className="p-2 rounded-lg bg-red-50 text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>

                                            </div>


                                            {/* Cart */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addToCart(product);
                                                    setCartOpen(true);
                                                }}
                                                className="flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded-lg text-xs font-medium"
                                            >
                                                <ShoppingCart size={16} />
                                                Add to Cart
                                            </button>

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    ) : (

                        <div className="bg-white rounded-xl py-10 text-center text-text text-sm">
                            No Product Found
                        </div>

                    )}

                </div>


                {/* ================= PAGINATION ================= */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-t bg-white">

                    <p className="text-xs sm:text-sm text-text">
                        {SearchProducts.length > 0
                            ? `Showing ${indexOfFirstProduct + 1}-${Math.min(
                                indexOfLastProduct,
                                SearchProducts.length
                            )} of ${SearchProducts.length}`
                            : "Showing 0-0 of 0"}
                    </p>

                    <div className="w-full sm:w-auto overflow-x-auto">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                </div>

            </div>


        </div >
    )
}