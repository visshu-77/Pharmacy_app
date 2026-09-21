import LoginRegisterSidebar from "./loginRegisterSideBar";
import Logo from "./brand/Logo";

/**
 * Two-column frame for login, registration and password reset: brand panel
 * on the left (desktop only), form on the right.
 */
export default function AuthShell({ children, wide = false }) {
    return (
        <div className="min-h-screen w-full flex bg-canvas">

            <div className="hidden lg:block lg:w-[42%] xl:w-[38%] shrink-0 sticky top-0 h-screen">
                <LoginRegisterSidebar />
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
                <div className="lg:hidden px-5 pt-5">
                    <Logo size="sm" />
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
                    <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
