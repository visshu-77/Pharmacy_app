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
import { getProducts, deleteProduct, updateProduct, exportProducts, importProducts, singleProduct } from "../services/productService";

import AddProductModal from '../components/modals/AddProductModal';

import EditProductModal from "../components/modals/EditProductModal";
import ViewProductModal from "../components/modals/ViewProductModal";

import { useCart } from "../context/CartContext";
import CartDrawer from "../components/drawer/CartDrawer";

export default function ProductPage() {

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
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
            || (product.productCategory?.categoryName || "").toLowerCase().includes(search)
            || (product.supplierName || "").toLowerCase().includes(search);
        const matchesCategory = !filters.category || product.productCategory?.categoryName === filters.category;
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
        ...new Set(product.map((product) => product.productCategory?.categoryName))
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
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        try {
            await importProducts(file);

            alert("Products imported successfully!");

            // Fetch updated products
            const result = await getProducts();
            setProduct(result.products);

        } catch (err) {
            console.log(err);
            alert("Import failed");
        }
    };

    const [viewProduct, setViewProduct] = useState(null);
    const [viewModal, setViewModal] = useState(false);

    const handleView = async (id) => {
        setViewProduct(id);
        setViewModal(true);
    }

    const [cartOpen, setCartOpen] = useState(false);
    const { addToCart } = useCart();

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
                <AddProductModal onClose={() => setShowModal(false)} />
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
                            <th className="p-4 text-left">Add to Cart</th>
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
                                        <span className="bg-[#E8ECF1] text-xs p-1 rounded-sm font-semibold text-text">{product.productCategory?.categoryName}</span>
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
                                    <td className="p-4 text-left">
                                        <div className="flex gap-3">
                                            <button
                                                className="text-blue-500 text-sm"
                                                onClick={() => handleView(product._id)}
                                            >
                                                <Eye size={15} className="stroke-text hover:stroke-primary transition-transform duration-300 hover:scale-110" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setShowEditModal(true);
                                                }}
                                                className="text-green-500 text-sm"
                                            >
                                                <Pencil size={15} className="stroke-text hover:stroke-green-500 transition-transform duration-300 hover:scale-110" />
                                            </button>
                                            <button
                                                className="text-red-500 text-sm"
                                                onClick={() => handleDeleteproduct(product._id)}
                                            >
                                                <Trash2 size={15} className="stroke-text hover:stroke-red-500 transition-transform duration-300 hover:scale-110" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-left">
                                        <button onClick={() => {
                                            addToCart(product);
                                            setCartOpen(true);
                                        }
                                        }>
                                            <ShoppingCart size={20} className="stroke-text hover:stroke-black cursor-pointer transition-transform duration-300 hover:scale-110" />
                                        </button>
                                    </td>
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