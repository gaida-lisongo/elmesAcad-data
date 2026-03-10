"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import type { ProduitType } from "@/app/actions/produit.actions";
import {
  fetchStudentByMatricule,
  initCommande,
  finalizeCommande,
} from "@/app/actions/produit.actions";
import { generateInvoicePDF } from "@/utils/invoice";

/* ─────────────────────────────────────── */
interface CommandeManagerProps {
  type: ProduitType;
  produit: any;
  promotionName: string;
  anneeLabel: string;
}

/* ── shared form field ─────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-bodydark">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-stroke bg-gray-2 px-3 py-2.5 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2";

/* ── Step indicator ────────────────────── */
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Paiement", "Configuration", "Confirmation"];
  return (
    <div className="mb-6 flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors
                  ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-stroke text-bodydark"}`}
              >
                {done ? <Icon icon="material-symbols:check" /> : n}
              </div>
              <span
                className={`hidden text-xs sm:block ${active ? "font-semibold text-primary" : "text-bodydark"}`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${done ? "bg-green-500" : "bg-stroke"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════ */
/*  CONFIG STEP PER TYPE                  */
/* ══════════════════════════════════════ */

/* Enrollement: résumé + confirmation */
function ConfigEnrollement({
  produit,
  onConfirm,
  loading,
}: {
  produit: any;
  onConfirm: (config: object) => void;
  loading: boolean;
}) {
  const matieres: any[] = produit.matieres ?? [];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-2 p-4 dark:bg-boxdark-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-bodydark">
          Résumé de l'inscription
        </p>
        <p className="text-sm font-bold text-black">{produit.designation}</p>
        <p className="mt-1 text-xs text-bodydark">
          {matieres.length} matières programmées
        </p>
      </div>
      <p className="text-xs text-bodydark">
        En validant, vous confirmez votre inscription à cette session d'examen.
      </p>
      <button
        onClick={() => onConfirm({})}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Icon
            icon="material-symbols:check-circle-outline"
            className="text-xl"
          />
        )}
        Valider l'inscription
      </button>
    </div>
  );
}

/* Stage: choix entreprise + infos lettre */
function ConfigStage({
  produit,
  onConfirm,
  loading,
}: {
  produit: any;
  onConfirm: (config: object) => void;
  loading: boolean;
}) {
  const entreprises: any[] = produit.entreprises ?? [];
  const [selectedEntreprise, setSelectedEntreprise] = useState<
    number | "custom"
  >(-1);
  const [customNom, setCustomNom] = useState("");
  const [customAdresse, setCustomAdresse] = useState("");
  const [customContact, setCustomContact] = useState("");
  const [destinataire, setDestinataire] = useState("");
  const [quality, setQuality] = useState("");
  const [sexe, setSexe] = useState("M.");

  const handleSubmit = () => {
    const ent =
      selectedEntreprise === "custom"
        ? { nom: customNom, adresse: customAdresse, contact: customContact }
        : selectedEntreprise >= 0
          ? entreprises[selectedEntreprise as number]
          : null;

    if (!ent || !ent.nom || !ent.contact) {
      toast.error("Veuillez renseigner l'entreprise");
      return;
    }
    if (!destinataire || !quality) {
      toast.error("Veuillez renseigner les informations de la lettre");
      return;
    }
    onConfirm({
      entreprise: ent,
      lettre_destinataire: destinataire,
      lettre_quality: quality,
      lettre_sexe: sexe,
    });
  };

  return (
    <div className="space-y-4">
      {/* Entreprise selection */}
      <Field label="Entreprise d'accueil" required>
        <select
          className={inputCls}
          value={String(selectedEntreprise)}
          onChange={(e) =>
            setSelectedEntreprise(
              e.target.value === "custom" ? "custom" : Number(e.target.value),
            )
          }
        >
          <option value="-1">-- Choisir une entreprise --</option>
          {entreprises.map((e: any, i: number) => (
            <option key={i} value={i}>
              {e.nom}
            </option>
          ))}
          <option value="custom">Autre (saisir manuellement)</option>
        </select>
      </Field>

      {selectedEntreprise === "custom" && (
        <div className="space-y-3 rounded-xl border border-stroke p-3 dark:border-strokedark">
          <Field label="Nom de l'entreprise" required>
            <input
              className={inputCls}
              value={customNom}
              onChange={(e) => setCustomNom(e.target.value)}
              placeholder="Ex: ACME Corp"
            />
          </Field>
          <Field label="Adresse">
            <input
              className={inputCls}
              value={customAdresse}
              onChange={(e) => setCustomAdresse(e.target.value)}
              placeholder="Adresse"
            />
          </Field>
          <Field label="Contact" required>
            <input
              className={inputCls}
              value={customContact}
              onChange={(e) => setCustomContact(e.target.value)}
              placeholder="+243..."
            />
          </Field>
        </div>
      )}

      {/* Lettre de stage info */}
      <div className="rounded-xl border border-stroke p-3 dark:border-strokedark">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-bodydark">
          Informations de la lettre de stage
        </p>
        <div className="space-y-3">
          <Field label="Civilité du destinataire">
            <select
              className={inputCls}
              value={sexe}
              onChange={(e) => setSexe(e.target.value)}
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </Field>
          <Field label="Nom du destinataire" required>
            <input
              className={inputCls}
              value={destinataire}
              onChange={(e) => setDestinataire(e.target.value)}
              placeholder="Prénom Nom du responsable"
            />
          </Field>
          <Field label="Qualité / Fonction" required>
            <input
              className={inputCls}
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              placeholder="Ex: Directeur RH"
            />
          </Field>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Icon
            icon="material-symbols:check-circle-outline"
            className="text-xl"
          />
        )}
        Valider la commande
      </button>
    </div>
  );
}

/* Sujet: URL du protocole */
function ConfigSujet({
  onConfirm,
  loading,
}: {
  onConfirm: (config: object) => void;
  loading: boolean;
}) {
  const [protocole, setProtocole] = useState("");

  const handleSubmit = () => {
    if (!protocole.trim()) {
      toast.error("Veuillez renseigner l'URL du protocole");
      return;
    }
    onConfirm({ protocole });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-2 p-3 dark:bg-boxdark-2">
        <p className="text-xs text-bodydark">
          Renseignez l'URL du document de protocole de votre sujet de mémoire.
        </p>
      </div>
      <Field label="URL du protocole" required>
        <input
          className={inputCls}
          value={protocole}
          onChange={(e) => setProtocole(e.target.value)}
          placeholder="https://drive.google.com/..."
          type="url"
        />
      </Field>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Icon
            icon="material-symbols:check-circle-outline"
            className="text-xl"
          />
        )}
        Valider la commande
      </button>
    </div>
  );
}

/* Document: infos d'etat civil pour emission du document */
function ConfigDocument({
  onConfirm,
  loading,
}: {
  onConfirm: (config: object) => void;
  loading: boolean;
}) {
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [nationalite, setNationalite] = useState("");
  const [sexe, setSexe] = useState<"M" | "F">("M");
  const [adresse, setAdresse] = useState("");

  const handleSubmit = () => {
    if (
      !lieuNaissance.trim() ||
      !dateNaissance ||
      !nationalite.trim() ||
      !adresse.trim()
    ) {
      toast.error("Veuillez renseigner toutes les informations demandées");
      return;
    }

    onConfirm({
      lieu_naissance: lieuNaissance,
      date_naissance: dateNaissance,
      nationalite,
      sexe,
      adresse,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gray-2 p-3 dark:bg-boxdark-2">
        <p className="text-xs text-bodydark">
          Après paiement, renseignez ces informations pour permettre la
          génération du relevé ou de la fiche de validation.
        </p>
      </div>

      <Field label="Lieu de naissance" required>
        <input
          className={inputCls}
          value={lieuNaissance}
          onChange={(e) => setLieuNaissance(e.target.value)}
          placeholder="Ex: Kinshasa"
        />
      </Field>

      <Field label="Date de naissance" required>
        <input
          className={inputCls}
          value={dateNaissance}
          onChange={(e) => setDateNaissance(e.target.value)}
          type="date"
        />
      </Field>

      <Field label="Nationalité" required>
        <input
          className={inputCls}
          value={nationalite}
          onChange={(e) => setNationalite(e.target.value)}
          placeholder="Ex: Congolaise"
        />
      </Field>

      <Field label="Sexe" required>
        <select
          className={inputCls}
          value={sexe}
          onChange={(e) => setSexe(e.target.value as "M" | "F")}
        >
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
      </Field>

      <Field label="Adresse" required>
        <input
          className={inputCls}
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          placeholder="Adresse complète"
        />
      </Field>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Icon
            icon="material-symbols:check-circle-outline"
            className="text-xl"
          />
        )}
        Valider la commande
      </button>
    </div>
  );
}

/* ══════════════════════════════════════ */
/*  MAIN CommandeManager                  */
/* ══════════════════════════════════════ */
export default function CommandeManager({
  type,
  produit,
  promotionName,
  anneeLabel,
}: CommandeManagerProps) {
  /* step 1 state */
  const [matricule, setMatricule] = useState("");
  const [telephone, setTelephone] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  /* commande state */
  const [commandeId, setCommandeId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [loadingCommande, setLoadingCommande] = useState(false);

  /* finalize state */
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const [done, setDone] = useState(false);

  const step: 1 | 2 | 3 = done ? 3 : commandeId ? 2 : 1;

  /* ── Step 1: lookup student ── */
  const handleLookupStudent = async () => {
    if (!matricule.trim()) {
      toast.error("Matricule requis");
      return;
    }
    setLoadingStudent(true);
    const res = await fetchStudentByMatricule(matricule);
    setLoadingStudent(false);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Étudiant non trouvé");
      return;
    }
    setStudent(res.data);
  };

  /* ── Step 1: init commande ── */
  const handleInitCommande = async () => {
    if (!student) {
      toast.error("Veuillez d'abord trouver l'étudiant");
      return;
    }
    if (!telephone.trim()) {
      toast.error("Numéro de téléphone requis");
      return;
    }
    setLoadingCommande(true);
    const res = await initCommande(type, {
      produitId: produit._id,
      etudiantId: student._id,
      telephone,
      amount: Number(produit.prix),
      reference: `${student?.nomComplet ?? student?.matricule ?? "ETUDIANT"} - ${produit.designation}`,
    });
    setLoadingCommande(false);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Erreur");
      return;
    }

    console.log("Commande initialized with ID:", res.data);
    setCommandeId(res.data.commandeId);
    setOrderNumber(res.data.orderNumber);
    toast.success("Commande initialisée !");
  };

  /* ── Step 2: finalize ── */
  const handleFinalize = async (config: object) => {
    setLoadingFinalize(true);
    const payload = {
      category: type,
      student: student?.nomComplet,
      classe: promotionName,
      produit: produit.designation,
      amount: Number(produit.prix),
      phone: telephone,
      reference: orderNumber,
      description: `CommandeId: ${commandeId}`,
      orderNumber,
    };
    const res = await finalizeCommande(
      type,
      commandeId,
      payload,
      config as any,
    );
    setLoadingFinalize(false);
    if (!res.success) {
      toast.error(res.error ?? "Erreur");
      return;
    }
    setDone(true);
    toast.success("Commande validée !");
  };

  /* ── Download invoice ── */
  const handleDownload = async () => {
    await generateInvoicePDF({
      type,
      produitId: produit._id,
      commandeId,
      produitName: produit.designation,
      orderNumber,
      reference: orderNumber,
      studentName: student?.nomComplet ?? "",
      studentMatricule: student?.matricule ?? matricule,
      telephone,
      prix: Number(produit.prix),
      annee: anneeLabel,
      promotionName,
    });
  };

  /* ── Type labels ── */
  const TYPE_LABEL: Record<ProduitType, string> = {
    enrollement: "Inscription à la session",
    stage: "Stage académique",
    sujet: "Sujet de mémoire",
    document: "Document académique",
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-boxdark">
      <div className="mb-4 flex items-center gap-2">
        <Icon
          icon="material-symbols:shopping-cart-outline"
          className="text-2xl text-primary"
        />
        <h2 className="text-lg font-bold text-black">Formulaire de commande</h2>
        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {TYPE_LABEL[type]}
        </span>
      </div>

      <StepIndicator step={step} />

      {/* ── STEP 1: Paiement ── */}
      {step === 1 && (
        <div className="space-y-4">
          <Field label="Matricule étudiant" required>
            <div className="flex gap-2">
              <input
                className={inputCls + " flex-1"}
                value={matricule}
                onChange={(e) => {
                  setMatricule(e.target.value);
                  setStudent(null);
                }}
                placeholder="Ex: ETD-2025-001"
              />
              <button
                onClick={handleLookupStudent}
                disabled={loadingStudent}
                className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
              >
                {loadingStudent ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent inline-block" />
                ) : (
                  <Icon icon="material-symbols:search" className="text-lg" />
                )}
              </button>
            </div>
          </Field>

          {/* Student found */}
          {student && (
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
              <Icon
                icon="material-symbols:verified-outline"
                className="text-2xl text-green-500"
              />
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-300">
                  {student.nomComplet}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {student.email}
                </p>
              </div>
            </div>
          )}

          <Field label="Numéro de téléphone (M-Pesa / Orange Money)" required>
            <input
              className={inputCls}
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+243 8XX XXX XXX"
              type="tel"
            />
          </Field>

          {/* Order summary */}
          <div className="rounded-xl border border-stroke p-3 dark:border-strokedark">
            <div className="flex items-center justify-between">
              <span className="text-sm text-bodydark">Montant à payer</span>
              <span className="text-lg font-bold text-primary">
                {Number(produit.prix).toLocaleString("fr-FR")} $
              </span>
            </div>
          </div>

          <button
            onClick={handleInitCommande}
            disabled={loadingCommande || !student}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loadingCommande ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Icon icon="material-symbols:arrow-forward" className="text-xl" />
            )}
            Passer à la configuration
          </button>
        </div>
      )}

      {/* ── STEP 2: Configuration ── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Recap badge */}
          <div className="flex items-center gap-2 rounded-xl bg-gray-2 px-3 py-2 dark:bg-boxdark-2">
            <Icon
              icon="material-symbols:receipt-outline"
              className="text-lg text-primary"
            />
            <span className="text-xs font-semibold text-bodydark">
              {orderNumber}
            </span>
            <span className="ml-auto text-xs text-bodydark">
              {student?.nomComplet}
            </span>
          </div>

          {type === "enrollement" && (
            <ConfigEnrollement
              produit={produit}
              onConfirm={handleFinalize}
              loading={loadingFinalize}
            />
          )}
          {type === "stage" && (
            <ConfigStage
              produit={produit}
              onConfirm={handleFinalize}
              loading={loadingFinalize}
            />
          )}
          {type === "sujet" && (
            <ConfigSujet onConfirm={handleFinalize} loading={loadingFinalize} />
          )}
          {type === "document" && (
            <ConfigDocument
              onConfirm={handleFinalize}
              loading={loadingFinalize}
            />
          )}
        </div>
      )}

      {/* ── STEP 3: Confirmation + Invoice ── */}
      {step === 3 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Icon
              icon="material-symbols:check-circle-outline"
              className="text-4xl text-green-500"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black ">
              Commande confirmée !
            </h3>
            <p className="mt-1 text-sm text-bodydark">
              Votre commande{" "}
              <span className="font-semibold text-primary">{orderNumber}</span>{" "}
              a été traitée avec succès.
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary/90"
          >
            <Icon icon="material-symbols:download" className="text-xl" />
            Télécharger le reçu (PDF)
          </button>
          <p className="text-xs text-bodydark">
            Le reçu contient un QR code pour accéder au détail de votre{" "}
            {type === "enrollement"
              ? "inscription"
              : type === "document"
                ? "commande de document"
                : type}
            .
          </p>
        </div>
      )}
    </div>
  );
}
