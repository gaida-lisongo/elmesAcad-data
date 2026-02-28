import CoordonneesContact from "@/app/components/CoordonneesContact";
import ContactFormMessage from "@/app/components/ContactFormMessage";
import ServiceContactCards from "@/app/components/ServiceContactCards";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchContactByAnnee } from "@/app/actions/contact.actions";
import { fetchServices } from "@/app/actions/service.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | ElmesAcad",
  description:
    "Contactez-nous pour toute question ou demande d'information - ElmesAcad",
};

const ContactPage = async () => {
  // Fetch année active
  const anneeResponse = await fetchAnneeActive();
  const annee = anneeResponse?.success ? anneeResponse.data : null;
  const anneeId = annee?._id;

  // Fetch contact info and services in parallel
  const [contact, servicesResponse] = await Promise.all([
    anneeId ? fetchContactByAnnee(anneeId) : null,
    fetchServices(),
  ]);

  const services =
    servicesResponse?.success && servicesResponse.data
      ? servicesResponse.data
      : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-gray to-white pt-20">
      {/* Coordonnées de Contact */}
      {anneeId && <CoordonneesContact contact={contact} anneeId={anneeId} />}

      {/* Formulaire de contact - uniquement si contact existe */}
      {contact?._id && <ContactFormMessage contactId={contact._id} />}

      {/* Message si pas de contact configuré */}
      {!contact && (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-600 text-lg">
            Les informations de contact ne sont pas encore configurées.
          </p>
        </div>
      )}

      {/* Services avec contacts */}
      {services && services.length > 0 && (
        <ServiceContactCards services={services} />
      )}
    </main>
  );
};

export default ContactPage;
