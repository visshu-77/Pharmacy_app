import CategoryFormModal from "./CategoryFormModal";

/**
 * Thin wrapper kept for existing imports. Calls `onClose(newCategory)` on
 * success and `onClose()` on cancel, as before.
 */
export default function AddcategoryModal({ onClose }) {
    let saved = null;

    return (
        <CategoryFormModal
            onSaved={(category) => { saved = category; }}
            onClose={() => onClose(saved || undefined)}
        />
    );
}
