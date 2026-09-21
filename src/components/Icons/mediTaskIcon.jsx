import { LogoMark } from "../brand/Logo";

/**
 * Deprecated name kept so any stray import still renders the StoreFlow mark.
 * Prefer `import Logo, { LogoMark } from "../brand/Logo"`.
 */
export default function MeditaskIcon({ className }) {
    return <LogoMark className={className} />;
}
