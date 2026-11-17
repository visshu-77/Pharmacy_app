import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";

import Button from "../ui/Button";
import Card, { CardHeader } from "../ui/Card";
import { Textarea } from "../ui/Field";
import { EmptyState } from "../ui/State";

const LISTS = [
    ["sources", "Lead sources", "Available sources in lead forms and analytics."],
    ["categories", "Lead categories", "Optional tags for grouping similar opportunities. Clear the list to disable categories."],
    ["lostReasons", "Lost reasons", "Reasons shown when a lead is marked Lost."],
    ["priorities", "Lead priorities", "Priorities available on lead forms."],
    ["followUpTypes", "Follow-up types", "Contact types available when scheduling follow-ups."]
];

export default function LeadSettingsPanel({ settings, savingKey, onSave, onManageStatuses }) {
    const [drafts, setDrafts] = useState({});
    useEffect(() => {
        setDrafts(Object.fromEntries(LISTS.map(([key]) => [
            key, (settings?.[key] || []).join("\n")
        ])));
    }, [settings]);

    if (!settings) return <EmptyState icon={Settings2} title="CRM settings unavailable" message="Settings could not be loaded." />;
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader
                    title="Lead statuses"
                    subtitle="Status names, colors, and ordering are managed separately."
                    action={<Button size="sm" variant="secondary" icon={Settings2} onClick={onManageStatuses}>Manage statuses</Button>}
                />
            </Card>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {LISTS.map(([key, title, description]) => (
                    <Card key={key}>
                        <CardHeader title={title} subtitle={description} />
                        <form
                            className="mt-4 space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                onSave(key, drafts[key] || "");
                            }}
                        >
                            <Textarea
                                label={`${title} (one value per line)`}
                                value={drafts[key] || ""}
                                onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))}
                                rows={Math.min(8, Math.max(4, (drafts[key] || "").split("\n").length))}
                                maxLength={4000}
                            />
                            <Button type="submit" size="sm" loading={savingKey === key}>Save {title.toLowerCase()}</Button>
                        </form>
                    </Card>
                ))}
            </div>
            <p className="text-xs text-muted">Removed options remain on existing lead records as historical values. Only the authenticated business account can access these settings.</p>
        </div>
    );
}
