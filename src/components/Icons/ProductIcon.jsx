export default function ProductIcon({ className }) {
    return (
         <svg
            className={className}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <path
                d="M22 7L12 2L2 7V17L12 22L22 17V7Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M2 7L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M12 22V12"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M22 7L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M17 4.5L7 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    )
}