/**
 * YouTube videos shown on the Guide page.
 *
 * To add a video: paste its link (or just the id) into `youtube`.
 * Any of these work:
 *   "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   "https://youtu.be/dQw4w9WgXcQ"
 *   "https://www.youtube.com/shorts/dQw4w9WgXcQ"
 *   "dQw4w9WgXcQ"
 *
 * Leave `youtube` empty ("") and the card shows as "Coming soon".
 * `topic` links the video to a guide topic (see config/guide.js) so it also
 * appears inside that topic.
 */
export const GUIDE_VIDEOS = [
    {
        id: "tour",
        title: "StoreFlow in 5 minutes",
        description: "A quick tour of the dashboard, billing, stock and reports.",
        duration: "5:00",
        topic: "getting-started",
        youtube: ""
    },
    {
        id: "setup",
        title: "Setting up your shop",
        description: "Choose your business type, add shop details and your UPI ID.",
        duration: "3:30",
        topic: "getting-started",
        youtube: ""
    },
    {
        id: "products",
        title: "Adding items & importing a CSV",
        description: "Add items one by one or bring your whole stock list at once.",
        duration: "4:15",
        topic: "products",
        youtube: ""
    },
    {
        id: "billing",
        title: "Making a bill at the counter",
        description: "Scan, set quantities, discount, GST, take payment and share on WhatsApp.",
        duration: "4:00",
        topic: "billing",
        youtube: ""
    },
    {
        id: "notes",
        title: "Using the Sales Note on busy days",
        description: "Jot down quick sales without a bill — stock still updates.",
        duration: "2:45",
        topic: "sales-note",
        youtube: ""
    },
    {
        id: "reports",
        title: "Reading your reports",
        description: "Daily sales, best sellers, categories and transactions.",
        duration: "3:20",
        topic: "reports",
        youtube: ""
    }
];

/** Pull the 11-character video id out of any YouTube link (or return the id). */
export const youtubeId = (value = "") => {
    const text = String(value).trim();

    if (/^[\w-]{11}$/.test(text)) return text;

    const match = text.match(
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
    );

    return match ? match[1] : "";
};
