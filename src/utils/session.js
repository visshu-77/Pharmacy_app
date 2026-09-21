/**
 * Everything this app keeps in localStorage for the signed-in shop.
 * Anything added here is wiped on logout, so one shop's data can never
 * leak into the next account used on the same device.
 */
export const SESSION_KEYS = [
    "token",
    "user",
    "cart",
    "cartOwner",
    "storeflow.business",
    "rzp_checkout_anon_id",
    "rzp_device_id",
    "rzp_stored_checkout_id"
];

export const clearSession = () => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

/** Sign out and hard-reload so every context starts empty. */
export const logout = () => {
    clearSession();
    window.location.replace("/login");
};

/** Id of the signed-in user, or null. */
export const getCurrentUserId = () => {
    try {
        return JSON.parse(localStorage.getItem("user"))?.id || null;
    } catch {
        return null;
    }
};
