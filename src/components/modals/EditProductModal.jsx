import ProductFormModal from "./ProductFormModal";

/** Thin wrapper kept for existing imports — see ProductFormModal. */
export default function EditProductModal({ product, onClose, onUpdate }) {
    return (
        <ProductFormModal
            product={product}
            onClose={onClose}
            onSaved={onUpdate}
        />
    );
}
