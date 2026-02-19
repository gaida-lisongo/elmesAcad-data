'use client'

import { useAuthStore } from "@/store/auth.store";

const AuthGuardLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated()) {
        // Rediriger vers la page de connexion ou afficher un message d'erreur
        return <p>Vous devez être connecté pour accéder à cette page.</p>;
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