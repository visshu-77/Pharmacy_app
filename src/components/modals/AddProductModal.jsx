import ProductFormModal from "./ProductFormModal";

/** Thin wrapper kept for existing imports — see ProductFormModal. */
export default function AddProductModal({ onClose, onProductAdded }) {
    return <ProductFormModal onClose={onClose} onSaved={onProductAdded} />;
}
