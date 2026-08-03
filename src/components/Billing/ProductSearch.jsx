import { useEffect, useState } from "react";
import { Search, Plus, X } from "lucide-react";

import { searchProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

export default function ProductSearch() {

    const { addToCart } = useCart();

    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!search.trim()) {
            setProducts([]);
            return;
        }

        const timer = setTimeout(async () => {

            try {

                setLoading(true);

                const data = await searchProducts(search);

                console.log("Search result:", data);

                setProducts(data.products || []);

            } catch (error) {

                console.log("Search product error:", error);

                setProducts([]);

            } finally {

                setLoading(false);

            }

        }, 400);

        return () => clearTimeout(timer);

    }, [search]);


    const handleAddProduct = (product) => {

        if (product.stock <= 0) {
            alert("Product is out of stock");
            return;
        }

        addToCart(product);

    };


    return (
        <div className="bg-white p-5 rounded-xl mt-5 border border-black/10 shadow">

            <h2 className="font-semibold text-xs border-l-4 pl-2 border-primary">
                Add Product
            </h2>

            {/* Search Input */}
            <div className="relative mt-4">

                <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product..."
                    className="w-full border rounded-lg p-3 pl-10 pr-10 outline-none text-xs bg-[#F8F9FC]"
                />

                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                    >
                        <X size={18} />
                    </button>
                )}

            </div>


            {/* Loading */}
            {loading && (
                <p className="text-sm text-gray-500 mt-3">
                    Searching...
                </p>
            )}


            {/* Search Results */}
            {!loading && products.length > 0 && (

                <div className="border rounded-lg mt-3 overflow-hidden">

                    {products.map((product) => (

                        <div
                            key={product._id}
                            className="flex items-center justify-between p-4 border-b"
                        >

                            <div>

                                <p className="font-semibold">
                                    {product.productName}
                                </p>

                                <p className="text-sm text-gray-500">
                                    ₹ {Number(product.sellingPrice).toLocaleString("en-IN")}
                                </p>

                                <p className="text-xs text-gray-400">
                                    Stock: {product.stock}
                                </p>

                            </div>

                            <button
                                onClick={() => handleAddProduct(product)}
                                disabled={product.stock <= 0}
                                className="flex items-center gap-1 bg-primary text-white px-3 py-2 rounded-lg disabled:opacity-50"
                            >
                                <Plus size={18} />
                                Add
                            </button>

                        </div>

                    ))}

                </div>

            )}


            {/* No results */}
            {!loading &&
                search.trim() &&
                products.length === 0 && (

                    <p className="text-sm text-gray-500 mt-3">
                        No products found
                    </p>

                )}

        </div>
    );
}