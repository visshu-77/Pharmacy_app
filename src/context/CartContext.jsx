import { createContext, useContext, useState, useEffect, useCallback } from "react";

import { getCurrentUserId } from "../utils/session";

const CartContext = createContext();

/**
 * The saved cart is only reused by the account that created it. A cart left
 * behind by another shop on this device is discarded, never shown.
 */
const loadCart = () => {
    try {
        const owner = localStorage.getItem("cartOwner");
        const saved = JSON.parse(localStorage.getItem("cart"));

        if (!owner || owner !== getCurrentUserId() || !Array.isArray(saved)) {
            return [];
        }

        return saved;
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(loadCart);

    useEffect(() => {
        const owner = getCurrentUserId();

        if (!owner) return;

        localStorage.setItem("cart", JSON.stringify(cart));
        localStorage.setItem("cartOwner", owner);
    }, [cart]);

    /** Call right after sign-in: keeps the cart only if it belongs to this user. */
    const syncCartOwner = useCallback(() => {
        setCart(loadCart());
    }, []);

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
                        quantity: Math.max(1, item.quantity - 1)
                    };
                }
                return item;
            })
        );
    };

    /**
     * Set an exact quantity — fractional values are allowed for loose goods
     * (1.25 kg rice, 2.5 m pipe). Clamped to what is in stock.
     */
    const setQuantity = (id, quantity) => {
        setCart((previousCart) =>
            previousCart.map(item => {
                if (item._id !== id) return item;

                const value = Number(quantity);

                if (!Number.isFinite(value) || value <= 0) return item;

                return {
                    ...item,
                    quantity: Math.min(value, item.stock)
                };
            })
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
        localStorage.removeItem("cartOwner");
    };
    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                setQuantity,
                clearCart,
                syncCartOwner
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};