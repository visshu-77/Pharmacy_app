export default function InventoryIcon({ className }) {
    return (
        <svg
            className={className}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <rect
                x="19"
                y="24"
                width="4"
                height="4"
                fill="currentColor"
            />
            <rect
                x="26"
                y="24"
                width="4"
                height="4"
                fill="currentColor"
            />
            <rect
                x="19"
                y="17"
                width="4"
                height="4"
                fill="currentColor"
            />
            <rect
                x="26"
                y="17"
                width="4"
                height="4"
                fill="currentColor"
            />
            <path
                d="M17 24H4V10H28V15H30V10C30 8.89543 29.1046 8 28 8H22V4C22 2.89543 21.1046 2 20 2H12C10.8954 2 10 2.89543 10 4V8H4C2.89543 8 2 8.89543 2 10V24C2 25.1046 2.89543 26 4 26H17V24ZM12 4H20V8H12V4Z"
                fill="currentColor"
            />
        </svg>
    )
}