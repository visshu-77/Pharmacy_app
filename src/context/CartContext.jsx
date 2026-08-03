import { createContext, useContext, useState, useEffect } from "react";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((previousCart) => {
            const existingProduct = previousCart.find(
                item => item._id === product._id
            );
            if (existingProduct) {
                return previousCart.map(item => {
                    if (item._id === product._id) {
                        return {
                            ...item,
                            quantity: Math.min(
                                item.quantity + 1,
                                item.stock
                            )
                        };
                    }
                    return item;
                });
            }
            return [
                ...previousCart,
                {
                    ...product,
                    quantity: 1
                }
            ];
        });
    };

    const removeFromCart = (id) => {
        setCart((previousCart) =>
            previousCart.filter(item => item._id !== id)
        );
    };

    const increaseQuantity = (id) => {
        setCart((previousCart) =>
            previousCart.map(item => {
                if (item._id === id) {
                    return {
                        ...item,
                        quantity: Math.min(
                            item.quantity + 1,
                            item.stock
                        )
                    };
                }
                return item;
            })
        );
    };

    const decreaseQuantity = (id) => {
        setCart((previousCart) =>
            previousCart.map(item => {
                if (item._id === id && item.quantity > 1) {
                    return {
                        ...item,
                        quantity: item.quantity - 1
                    };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
    };
    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};