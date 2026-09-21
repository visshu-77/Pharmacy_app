import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Crown, Mail, Phone, MapPin } from "lucide-react";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Spinner, ErrorState, EmptyState } from "../../components/ui/State";

import { getCustomerById } from "../services/adminService";
import { getBusinessType } from "../../config/businessTypes";

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Info({ label, value, mono = false }) {
    return (
        <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</p>
            <p className={`mt-1 text-sm font-semibold text-heading break-words ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
        </div>
    );
}

export default function AdminCustomerDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        getCustomerById(id)
            .then((response) => setCustomer(response.customer))
            .catch((err) => setError(err?.response?.data?.message || "Could not load this shop"))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Spinner />;

    if (error) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/admin/customers")}>All shops</Button>
                <ErrorState message={error} />
            </div>
        );
    }

    if (!customer) return null;

    const profile = getBusinessType(customer.businessType);
    const Icon = profile.icon;
    const sub = customer.currentSubscription;

    return (
        <div className="space-y-6 max-w-5xl">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/admin/customers")}>All shops</Button>

            <Card className="flex flex-col sm:flex-row sm:items-center gap-5">
                <span className="grid place-items-center h-16 w-16 shrink-0 rounded-2xl text-white shadow-md" style={{ backgroundColor: profile.accent }}>
                    <Icon className="h-7 w-7" />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight truncate">{customer.Shopname}</h1>
                        <Badge dot tone={customer.isActive ? "success" : "danger"}>{customer.isActive ? "Active" : "Deactivated"}</Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">{profile.label} · owned by {customer.ownerName}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{customer.email}</span>
                        <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{customer.mobileNumber}</span>
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{[customer.city, customer.state].filter(Boolean).join(", ")}</span>
                    </div>
                </div>
                <Button variant="secondary" icon={Pencil} onClick={() => navigate(`/admin/customers/${id}/edit`)}>Edit</Button>
            </Card>

            <Card>
                <h2 className="font-semibold text-heading mb-4">Business details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Info label="Business type" value={profile.label} />
                    <Info label="Shop address" value={customer.shopAddress} />
                    <Info label="GST number" value={customer.gstNumber} mono />
                    <Info label={profile.licence?.label || "Licence no."} value={customer.licenseNumber} />
                    <Info label="UPI ID" value={customer.upiId} />
                    <Info label="Joined" value={formatDate(customer.createdAt)} />
                </div>
            </Card>

            <Card>
                <h2 className="font-semibold text-heading mb-4">Subscription</h2>
                {sub ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <Info label="Plan" value={<span className="capitalize">{sub.plan}</span>} />
                        <Info label="Cycle" value={sub.duration} />
                        <Info label="Price" value={`₹${Number(sub.price || 0).toLocaleString("en-IN")}`} />
                        <Info label="Status" value={<span className="capitalize">{customer.subscriptionStatus}</span>} />
                        <Info label="Started" value={formatDate(sub.startDate)} />
                        <Info label="Ends" value={formatDate(sub.endDate)} />
                    </div>
                ) : (
                    <EmptyState icon={Crown} title="No active plan" message="This shop doesn't currently have an active subscription." className="py-8" />
                )}
            </Card>
        </div>
    );
}
