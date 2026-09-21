import CategoryFormModal from "./CategoryFormModal";

/** Thin wrapper kept for existing imports — see CategoryFormModal. */
export default function EditCategoryModal({ category, onClose, onUpdate }) {
    return (
        <CategoryFormModal
            category={category}
            onClose={onClose}
            onSaved={onUpdate}
        />
    );
}
