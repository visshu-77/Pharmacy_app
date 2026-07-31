import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { singleProduct } from "../../services/productService";


export default function ViewProductModal({
    productId,
    onClose
}) {
    const [productData, setProductData] = useState(null);
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await singleProduct(productId)
                setProductData(data);
            } catch (err) {
                console.log(err);
            }
        };
        if (productId) {
            fetchProduct();
        }
    }, [productId])
    return (
        <div className="w-full fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-[900px] bg-white m-auto border rounded items-center justify-center flex flex-col p-6">
                <div className="w-full flex justify-between">
                    <h3 className="text-2xl capitalize"><span className="font-bold">Product Name : </span>{productData?.product?.productName}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-primary transition">
                        <X size={20} />
                    </button>
                </div>
                <div className="w-full font-bold text-lg mt-10 capitalize">
                    <p className="p-2 bg-black/20 ">Category : <span className="font-medium">{productData?.product?.productCategory?.categoryName}</span></p>
                    <p className="p-2">Stock : <span className={` ${productData?.product?.stock === 0 ? "text-red-500" : productData?.product?.stock < 50 ? "text-orange-500" : "text-black"} `}>{productData?.product?.stock}</span></p>
                    <p className="p-2 bg-black/20">purchase : <span className="font-medium">{productData?.product?.purchase.toFixed(2)}</span></p>
                    <p className="p-2">selling : <span className="font-medium">{productData?.product?.sellingPrice.toFixed(2)}</span></p>
                    <p className="p-2 bg-black/20">Expiry : <span className="font-medium text-text"> {new Date(productData?.product?.ExpiryDate).toLocaleDateString("en-GB")}</span></p>
                    <p className="p-2">Supplier : <span className="font-medium">{productData?.product?.supplierName}</span></p>
                    <p className="p-2 bg-black/20">status :  <span
                        className={`p-2 text-sm font-semibold ${productData?.product?.stock === 0
                            ? "text-red-500 bg-red-100"
                            : productData?.product?.stock < 50
                                ? "text-orange-500"
                                : "text-secondary"
                            }`}
                    >
                        {" "}
                        {productData?.product?.stock === 0
                            ? "Out of Stock"
                            : productData?.product?.stock < 50
                                ? "Low Stock"
                                : "In Stock"}
                    </span></p>
                    <div className="flex flex-col items-center mt-4">
                        <button className="bg-primary justify-center items-center text-center p-3 text-white capitalize text-sm rounded transition-trasnform duration-300 hover:scale-110 hover:shadow-lg">Buy product</button>
                    </div>
                </div>
            </div>
        </div>
    )
}