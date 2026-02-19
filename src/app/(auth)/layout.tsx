'use client'

import { useAuthStore } from "@/store/auth.store";

const AuthGuardLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, hydrated } = useAuthStore();

    if (!hydrated) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="bg-white border border-black/10 shadow-md rounded-2xl p-8 w-full max-w-md text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-lg font-semibold text-midnight_text">Verification de session...</p>
                    <p className="text-sm text-gray-500 mt-2">Merci de patienter, nous confirmons votre connexion.</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
                <div className="bg-white border border-black/10 shadow-md rounded-2xl p-8 w-full max-w-md text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-2xl font-bold">!</span>
                    </div>
                    <p className="text-lg font-semibold text-midnight_text">Utilisateur non connecte</p>
                    <p className="text-sm text-gray-500 mt-2">Vous devez etre connecte pour acceder a cette page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="container mx-auto lg:max-w-(--breakpoint-xl) md:max-w-(--breakpoint-md) p-6 lg:pt-44 pt-16">
                {children}
            </div>
        </div>
    );
}

export default AuthGuardLayout;