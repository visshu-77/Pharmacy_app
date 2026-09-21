import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Store, User, Phone, Mail, Building2, Map as MapIcon, FileText, ShieldCheck, AlertCircle } from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Input, Select, Textarea } from "../../components/ui/Field";
import { Spinner } from "../../components/ui/State";
import { useToast } from "../../components/ui/Toast";

import { getCustomerById, updateCustomer } from "../services/adminService";
import { BUSINESS_TYPES, getBusinessType } from "../../config/businessTypes";

const FIELDS = ["Shopname", "businessType", "ownerName", "mobileNumber", "email", "shopAddress", "city", "state", "gstNumber", "licenseNumber"];

export default function EditCustomer() {

    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState(Object.fromEntries(FIELDS.map((f) => [f, ""])));

    useEffect(() => {
        getCustomerById(id)
            .then((response) => {
                const customer = response.customer || response.user;
                if (!customer) {
                    setError("Shop not found");
                    return;
                }
                setFormData(
                    Object.fromEntries(
                        FIELDS.map((f) => [f, customer[f] != null ? String(customer[f]) : f === "businessType" ? "general" : ""])
                    )
                );
            })
            .catch((err) => setError(err?.response?.data?.message || "Could not load shop"))
            .finally(() => setLoading(false));
    }, [id]);

    const onChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateCustomer(id, formData);
            toast.success(`${formData.Shopname} updated`);
            navigate(`/admin/customers/${id}`);
        } catch (err) {
            setError(err?.response?.data?.message || "Could not update shop");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    const profile = getBusinessType(formData.businessType);

    return (
        <div className="space-y-6 max-w-4xl">
            <PageHeader
                title="Edit shop"
                subtitle={formData.Shopname}
                breadcrumbs={false}
                actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>Back</Button>}
            />

            <Card>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Shop name" name="Shopname" icon={Store} value={formData.Shopname} onChange={onChange} required />
                    <Select
                        label="Business type"
                        name="businessType"
                        value={formData.businessType}
                        onChange={onChange}
                        options={BUSINESS_TYPES.map((t) => ({ value: t.id, label: t.label }))}
                    />
                    <Input label="Owner name" name="ownerName" icon={User} value={formData.ownerName} onChange={onChange} required />
                    <Input label="Mobile" name="mobileNumber" type="tel" icon={Phone} value={formData.mobileNumber} onChange={onChange} required />
                    <Input className="md:col-span-2" label="Email" name="email" type="email" icon={Mail} value={formData.email} onChange={onChange} required />
                    <Textarea className="md:col-span-2" label="Shop address" name="shopAddress" rows={2} value={formData.shopAddress} onChange={onChange} />
                    <Input label="City" name="city" icon={Building2} value={formData.city} onChange={onChange} />
                    <Input label="State" name="state" icon={MapIcon} value={formData.state} onChange={onChange} />
                    <Input label="GST number" name="gstNumber" icon={FileText} value={formData.gstNumber} onChange={onChange} />
                    <Input
                        label={profile.licence?.label || "Licence no."}
                        name="licenseNumber"
                        icon={ShieldCheck}
                        value={formData.licenseNumber}
                        onChange={onChange}
                        required={Boolean(profile.licence?.required)}
                    />

                    {error && (
                        <p className="md:col-span-2 flex items-center gap-1.5 text-sm text-danger" role="alert">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </p>
                    )}

                    <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t border-line">
                        <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
                        <Button type="submit" icon={Save} loading={saving}>Save changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
