import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    LifeBuoy,
    Search,
    X,
    PlayCircle,
    Clock,
    ArrowRight,
    Lightbulb,
    ChevronDown,
    Mail,
    Sparkles,
    Video,
    CheckCircle2
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { EmptyState } from "../components/ui/State";

import { buildGuideTopics, buildGuideFaqs } from "../config/guide";
import { GUIDE_VIDEOS, youtubeId } from "../config/guideVideos";
import { useBusiness } from "../context/BusinessContext";
import BRAND from "../config/brand";

// ---------------------------------------------------------------------------
// Video pieces
// ---------------------------------------------------------------------------

function VideoCard({ video, onPlay, compact = false }) {
    const id = youtubeId(video.youtube);
    const ready = Boolean(id);

    return (
        <button
            type="button"
            onClick={() => ready && onPlay(video)}
            disabled={!ready}
            className={`group text-left rounded-2xl border border-line bg-surface overflow-hidden shadow-card transition-all ${ready ? "hover:shadow-md hover:-translate-y-0.5" : "cursor-default"}`}
            aria-label={ready ? `Play video: ${video.title}` : `${video.title} — coming soon`}
        >
            <div className="relative aspect-video bg-gradient-to-br from-primary/15 via-indigo-500/10 to-surface-muted overflow-hidden">
                {ready ? (
                    <img
                        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="h-full w-full grid place-items-center">
                        <Video className="h-8 w-8 text-primary/50" />
                    </div>
                )}

                <div className={`absolute inset-0 grid place-items-center ${ready ? "bg-slate-900/10 group-hover:bg-slate-900/25" : ""} transition-colors`}>
                    {ready ? (
                        <span className="grid place-items-center h-12 w-12 rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
                            <PlayCircle className="h-7 w-7" />
                        </span>
                    ) : (
                        <Badge tone="neutral" className="bg-surface/90">Coming soon</Badge>
                    )}
                </div>

                {video.duration && ready && (
                    <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[11px] font-semibold text-white tabular">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                    </span>
                )}
            </div>

            <div className={compact ? "p-3" : "p-4"}>
                <p className="font-semibold text-heading text-sm leading-snug">{video.title}</p>
                {!compact && video.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{video.description}</p>
                )}
            </div>
        </button>
    );
}

function VideoPlayer({ video, onClose }) {
    const id = youtubeId(video?.youtube);

    return (
        <Modal
            open={Boolean(video)}
            onClose={onClose}
            size="xl"
            icon={PlayCircle}
            title={video?.title}
            subtitle={video?.description}
        >
            {id && (
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black -mt-1">
                    <iframe
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
            )}
        </Modal>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Guide() {

    const { term, profile } = useBusiness();

    const topics = useMemo(() => buildGuideTopics(term), [term]);
    const faqs = useMemo(() => buildGuideFaqs(term), [term]);

    const [activeId, setActiveId] = useState(topics[0].id);
    const [query, setQuery] = useState("");
    const [openFaq, setOpenFaq] = useState(0);
    const [playing, setPlaying] = useState(null);

    const active = topics.find((topic) => topic.id === activeId) || topics[0];
    const ActiveIcon = active.icon;
    const activeVideos = GUIDE_VIDEOS.filter((video) => video.topic === active.id);

    const readyVideos = GUIDE_VIDEOS.filter((video) => youtubeId(video.youtube)).length;

    // Search across topics, their steps and tips, and FAQs.
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;

        const hit = (text) => text.toLowerCase().includes(q);

        return {
            topics: topics
                .map((topic) => ({
                    topic,
                    matches: [...topic.steps, ...topic.tips].filter(hit)
                }))
                .filter(({ topic, matches }) => hit(topic.title) || hit(topic.summary) || matches.length),
            faqs: faqs.filter((faq) => hit(faq.q) || hit(faq.a)),
            videos: GUIDE_VIDEOS.filter((video) => hit(video.title) || hit(video.description || ""))
        };
    }, [query, topics, faqs]);

    const resultCount = results ? results.topics.length + results.faqs.length + results.videos.length : 0;

    const openTopic = (id) => {
        setQuery("");
        setActiveId(id);
        requestAnimationFrame(() =>
            document.getElementById("guide-topic")?.scrollIntoView({ behavior: "smooth", block: "start" })
        );
    };

    const quickStart = [
        { label: "Check your shop details", to: "/settings", hint: "Name, GST, UPI ID" },
        { label: `Add your ${term.itemsLower}`, to: "/product", hint: "One by one or CSV" },
        { label: "Make your first bill", to: "/billing", hint: "Or use Sales Note" },
        { label: "See today's numbers", to: "/", hint: "Dashboard" }
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                icon={LifeBuoy}
                title="Help & guide"
                subtitle={`Everything you need to run your ${profile.shortLabel.toLowerCase()} on ${BRAND.name}`}
            />

            {/* ---------------- Search hero ---------------- */}
            <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1e3a8a_0%,#2563eb_55%,#4f46e5_100%)] px-6 py-10 sm:px-10 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
                <div className="relative max-w-2xl">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">How can we help?</h2>
                    <p className="mt-2 text-sm text-white/75">Search the guide, watch a video, or pick a topic below.</p>

                    <div className="relative mt-6">
                        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder='Try "UPI", "import", "low stock", "expiry"…'
                            className="w-full h-14 pl-12 pr-12 rounded-2xl border-0 bg-white text-base text-slate-900 placeholder:text-slate-400 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                            aria-label="Search the guide"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ---------------- Search results ---------------- */}
            {results ? (
                <section className="space-y-4">
                    <p className="text-sm text-muted">
                        {resultCount} result{resultCount === 1 ? "" : "s"} for <span className="font-semibold text-heading">"{query.trim()}"</span>
                    </p>

                    {resultCount === 0 ? (
                        <Card padded={false}>
                            <EmptyState
                                icon={Search}
                                title="Nothing found"
                                message="Try another word, or ask the AI assistant at the bottom-right."
                            />
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {results.topics.map(({ topic, matches }) => {
                                const Icon = topic.icon;
                                return (
                                    <Card key={topic.id} hover as="button" onClick={() => openTopic(topic.id)} className="w-full text-left">
                                        <div className="flex items-start gap-3">
                                            <span className="grid place-items-center h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-heading">{topic.title}</p>
                                                <p className="text-sm text-muted">{topic.summary}</p>
                                                {matches.slice(0, 2).map((line) => (
                                                    <p key={line} className="mt-2 text-sm text-body border-l-2 border-primary/40 pl-3">{line}</p>
                                                ))}
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-faint shrink-0 mt-1" />
                                        </div>
                                    </Card>
                                );
                            })}

                            {results.faqs.map((faq) => (
                                <Card key={faq.q}>
                                    <p className="font-semibold text-heading">{faq.q}</p>
                                    <p className="text-sm text-muted mt-1 leading-relaxed">{faq.a}</p>
                                </Card>
                            ))}

                            {results.videos.length > 0 && (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {results.videos.map((video) => (
                                        <VideoCard key={video.id} video={video} onPlay={setPlaying} compact />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* ---------------- Quick start ---------------- */}
                    <section>
                        <h2 className="text-lg font-bold tracking-tight">Quick start</h2>
                        <p className="text-sm text-muted mt-0.5">Four steps to your first sale.</p>
                        <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {quickStart.map((step, index) => (
                                <li key={step.label}>
                                    <Link
                                        to={step.to}
                                        className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card hover:shadow-md hover:border-primary/40 transition-all"
                                    >
                                        <span className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-primary text-white text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-heading group-hover:text-primary transition-colors">{step.label}</span>
                                            <span className="block text-xs text-muted mt-0.5">{step.hint}</span>
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-faint shrink-0 mt-1 group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* ---------------- Videos ---------------- */}
                    <section>
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight">Video tutorials</h2>
                                <p className="text-sm text-muted mt-0.5">
                                    {readyVideos
                                        ? "Short walkthroughs of the most-used features."
                                        : "Walkthrough videos are on the way."}
                                </p>
                            </div>
                            {readyVideos > 0 && <Badge tone="primary">{readyVideos} video{readyVideos === 1 ? "" : "s"}</Badge>}
                        </div>
                        <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4">
                            {GUIDE_VIDEOS.map((video) => (
                                <VideoCard key={video.id} video={video} onPlay={setPlaying} />
                            ))}
                        </div>
                    </section>

                    {/* ---------------- Topics ---------------- */}
                    <section id="guide-topic" className="scroll-mt-6">
                        <h2 className="text-lg font-bold tracking-tight">Guide by topic</h2>

                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
                            <nav aria-label="Guide topics" className="lg:sticky lg:top-4">
                                <ul className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                                    {topics.map((topic) => {
                                        const Icon = topic.icon;
                                        const isActive = topic.id === active.id;
                                        return (
                                            <li key={topic.id} className="shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveId(topic.id)}
                                                    aria-current={isActive ? "true" : undefined}
                                                    className={[
                                                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                                                        isActive ? "bg-surface text-primary shadow-card" : "text-muted hover:bg-surface-hover hover:text-heading"
                                                    ].join(" ")}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    {topic.title}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            <Card className="p-6 sm:p-8 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <span className="grid place-items-center h-11 w-11 shrink-0 rounded-2xl bg-primary/10 text-primary">
                                            <ActiveIcon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className="text-xl font-bold tracking-tight">{active.title}</h3>
                                            <p className="text-sm text-muted mt-0.5">{active.summary}</p>
                                        </div>
                                    </div>
                                    {active.path && (
                                        <Button to={active.path} variant="soft" size="sm" iconRight={ArrowRight} className="shrink-0">
                                            {active.cta || `Open ${active.title.toLowerCase()}`}
                                        </Button>
                                    )}
                                </div>

                                <ol className="mt-6 space-y-4">
                                    {active.steps.map((step, index) => (
                                        <li key={step} className="flex gap-4">
                                            <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full border-2 border-primary/30 text-primary text-xs font-bold">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm text-body leading-relaxed pt-0.5">{step}</p>
                                        </li>
                                    ))}
                                </ol>

                                {active.tips.length > 0 && (
                                    <div className="mt-6 rounded-xl border border-warning/25 bg-warning/5 p-4">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-heading">
                                            <Lightbulb className="h-4 w-4 text-warning" />
                                            Good to know
                                        </p>
                                        <ul className="mt-2 space-y-1.5">
                                            {active.tips.map((tip) => (
                                                <li key={tip} className="flex gap-2 text-sm text-body">
                                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {activeVideos.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-xs font-bold uppercase tracking-wider text-faint">Watch</p>
                                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {activeVideos.map((video) => (
                                                <VideoCard key={video.id} video={video} onPlay={setPlaying} compact />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </section>

                    {/* ---------------- FAQ ---------------- */}
                    <section>
                        <h2 className="text-lg font-bold tracking-tight">Frequently asked questions</h2>
                        <div className="mt-4 space-y-3 max-w-3xl">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div key={faq.q} className={`rounded-xl border bg-surface transition-colors ${isOpen ? "border-primary/30 shadow-sm" : "border-line"}`}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : index)}
                                            aria-expanded={isOpen}
                                            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                        >
                                            <span className="text-sm font-semibold text-heading">{faq.q}</span>
                                            <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180 text-primary" : ""}`} />
                                        </button>
                                        {isOpen && (
                                            <p className="px-5 pb-5 -mt-1 text-sm text-muted leading-relaxed animate-fade-in">{faq.a}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </>
            )}

            {/* ---------------- Still need help ---------------- */}
            <Card className="flex flex-col sm:flex-row sm:items-center gap-5">
                <span className="grid place-items-center h-12 w-12 shrink-0 rounded-2xl bg-primary/10 text-primary">
                    <LifeBuoy className="h-6 w-6" />
                </span>
                <div className="flex-1">
                    <p className="font-semibold text-heading">Still need help?</p>
                    <p className="text-sm text-muted mt-0.5">
                        Ask the AI assistant about your own shop data, or write to our support team.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="secondary"
                        icon={Sparkles}
                        onClick={() => document.querySelector('[aria-label="Open AI assistant"]')?.click()}
                    >
                        Ask AI
                    </Button>
                    <Button href={`mailto:${BRAND.supportEmail}`} icon={Mail}>
                        Email support
                    </Button>
                </div>
            </Card>

            <VideoPlayer video={playing} onClose={() => setPlaying(null)} />
        </div>
    );
}
