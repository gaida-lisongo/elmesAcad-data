import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/Layout/Header";
import Footer from "@/app/components/Layout/Footer";
import ScrollToTop from "@/app/components/ScrollToTop";
import { verifyApp } from "@/lib/verifyApp";
import ExpiredSubscription from "@/app/components/ExpiredSubscription";
import { ClientProvider } from "@/contexts/ClientContext";
import type { ClientData } from "@/types/client";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = await verifyApp();
  const isVerified = res?.success === true;

  // ── Subscription expired ─────────────────────────────────────────────────
  if (!isVerified) {
    return (
      <html lang="fr" suppressHydrationWarning>
        <body className={font.className}>
          <ExpiredSubscription />
        </body>
      </html>
    );
  }

  // ── Sanitize: strip sensitive fields (uuid, apikey, apisecret) server-side
  const raw = res?.data?.clientComplete;
  if (!raw?.clientId || !raw?.packageId) {
    return (
      <html lang="fr" suppressHydrationWarning>
        <body className={font.className}>
          <ExpiredSubscription />
        </body>
      </html>
    );
  }

  const clientData: ClientData = {
    _id: raw._id,
    clientId: {
      _id: raw.clientId._id,
      nomComplet: raw.clientId.nomComplet,
      email: raw.clientId.email,
      logo: raw.clientId.logo,
      isActive: raw.clientId.isActive,
      // uuid intentionally excluded
    },
    packageId: raw.packageId,
    quotite: raw.quotite,
    solde: raw.solde,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${font.className}`}>
        {/* ClientProvider persists sanitized data in a cookie & provides context */}
        <ClientProvider data={clientData}>
          <Header />
          {children}
          <Footer />
          <ScrollToTop />
        </ClientProvider>
      </body>
    </html>
  );
}
