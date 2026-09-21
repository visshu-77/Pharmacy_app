import { useState } from "react";
import { Tags, AlertCircle } from "lucide-react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Input, Textarea } from "../ui/Field";
import { useToast } from "../ui/Toast";

import { addCategory, updateCategory } from "../../services/categoryService";
import { useBusiness } from "../../context/BusinessContext";

/** Add or edit a category. Pass `category` to edit. */
export default function CategoryFormModal({ category, onClose, onSaved }) {

    const isEdit = Boolean(category?._id);
    const toast = useToast();
    const { term, profile } = useBusiness();

    const [form, setForm] = useState({
        categoryName: category?.categoryName || "",
        description: category?.description || ""
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const suggestions = profile.defaultCategories.slice(0, 6);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.categoryName.trim()) {
            setError(`${term.category} name is required`);
            return;
        }

        try {
            setSaving(true);

            const result = isEdit
                ? await updateCategory(category._id, form)
                : await addCategory(form);

            const saved = result.category || result.result;

            toast.success(`${form.categoryName} ${isEdit ? "updated" : "created"}`);
            onSaved?.(saved);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message || "Could not save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            onClose={onClose}
            size="sm"
            icon={Tags}
            title={isEdit ? `Edit ${term.category.toLowerCase()}` : `New ${term.category.toLowerCase()}`}
            subtitle={`Group your ${term.itemsLower} so they're easier to find and report on`}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="category-form" loading={saving}>
                        {isEdit ? "Save changes" : `Create ${term.category.toLowerCase()}`}
                    </Button>
                </>
            }
        >
            <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label={`${term.category} name`}
                    placeholder={`e.g. ${suggestions[0] || "General"}`}
                    value={form.categoryName}
                    onChange={(e) => { setForm({ ...form, categoryName: e.target.value }); setError(""); }}
                    required
                    autoFocus
                />

                {!isEdit && !form.categoryName && suggestions.length > 0 && (
                    <div>
                        <p className="text-xs font-medium text-muted mb-2">Common for {profile.shortLabel.toLowerCase()}s</p>
                        <div className="flex flex-wrap gap-1.5">
                            {suggestions.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setForm({ ...form, categoryName: name })}
                                    className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-body hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Textarea
                    label="Description"
                    placeholder="Optional"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                {error && (
                    <p className="flex items-center gap-1.5 text-sm text-danger" role="alert">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </p>
                )}
            </form>
        </Modal>
    );
}
