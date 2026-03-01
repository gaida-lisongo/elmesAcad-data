"use client";

import { useParams } from "next/navigation";
import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { fetchElementById } from "@/app/actions/unite-element.actions";
import { fetchPromotionByUniteId } from "@/app/actions/unite.actions";
import Loader from "@/app/components/Common/Loader";
import { PromotionType } from "@/app/page";
import {
  fetchSubscriptionsByPromotion,
  SubscriptionType,
} from "@/app/actions/subscription.actions";
import { FicheCotation } from "@/app/components/ChargeHoraire/FicheCotation";
import { ActivitesManager } from "@/app/components/ChargeHoraire/ActivitesManager";
import { RessourcesManager } from "@/app/components/ChargeHoraire/RessourcesManager";
import { RecoursManager } from "@/app/components/ChargeHoraire/RecoursManager";
import { SeancesManager } from "@/app/components/ChargeHoraire/SeancesManager";
import { CreateActivityModal } from "@/app/components/ChargeHoraire/CreateActivityModal";

const TabItem = ({
  label,
  value,
  activeTab,
  onClick,
  icon,
}: {
  label: string;
  value: string;
  activeTab: string;
  onClick: (value: string) => void;
  icon: string;
}) => (
  <button
    onClick={() => onClick(value)}
    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
      activeTab === value
        ? "border-primary text-primary bg-primary/5"
        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300"
    }`}
  >
    <Icon icon={icon} width={20} />
    <span>{label}</span>
  </button>
);

export default function ChargeHorairePage() {
  const params = useParams();
  const elementId = params.id as string;
  const [activeTab, setActiveTab] = useState("fiche-cotation");
  const [cours, setCours] = useState<ElementType | null>(null);
  const [promotion, setPromotion] = useState<PromotionType | null>(null);
  const [unite, setUnite] = useState<{
    _id: string;
    code: string;
    designation: string;
    description: string[];
    competences: string[];
    credit: number;
  } | null>(null);
  const [semestre, setSemestre] = useState<{
    _id: string;
    designation: string;
    credit: number;
  } | null>(null);
  const [section, setSection] = useState<{
    _id: string;
    mention: string;
    designation: string;
    mission: string;
    promesses: string[];
  } | null>(null);
  const [filiere, setFiliere] = useState<{
    _id: string;
    sigle: string;
    designation: string;
    description: string[];
  } | null>(null);

  const [students, setStudents] = useState<SubscriptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<"qcm" | "questionnaire">("qcm");

  const tabs = [
    { label: "Fiche cotation", value: "fiche-cotation", icon: "solar:document-text-bold-duotone" },
    { label: "Activites", value: "activities", icon: "solar:checklist-minimalistic-bold-duotone" },
    { label: "Ressources", value: "ressources", icon: "solar:folder-with-files-bold-duotone" },
    { label: "Recours", value: "recours", icon: "solar:help-bold-duotone" },
    { label: "Seances", value: "seances", icon: "solar:calendar-bold-duotone" },
  ];

  useEffect(() => {
    setLoading(true);
    fetchElementById(elementId)
      .then((res) => {
        if (res.success) {
          setCours(res.data);
        } else {
          console.error("Erreur:", res.error);
        }
      })
      .catch((error) => console.error("Erreur:", error))
      .finally(() => setLoading(false));
  }, [elementId]);

  useEffect(() => {
    if (cours) {
      setLoading(true);
      fetchPromotionByUniteId(cours?.uniteId)
        .then((res) => {
          if (res.success) {
            const { unite: UniteData, semestre: semestreData, section: sectionData, filiere: filiereData, programme: programmeData } = res.data;
            setUnite(UniteData);
            setSemestre(semestreData);
            setSection(sectionData);
            setFiliere(filiereData);
            setPromotion(programmeData);
          }
        })
        .catch((error) => console.error("Erreur:", error))
        .finally(() => setLoading(false));
    }
  }, [cours]);

  useEffect(() => {
    if (promotion && cours?.anneeId) {
      fetchSubscriptionsByPromotion(promotion._id, cours.anneeId._id)
        .then((res) => { if (res.success) setStudents(res.data); })
        .catch((error) => console.error("Erreur:", error));
    }
  }, [promotion, cours?.anneeId]);

  if (loading) return <Loader />;

  if (!cours) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon icon="solar:sad-circle-bold-duotone" width={64} height={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">Element non trouve</h3>
          <Link href="/charge-horaire" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg">
            <Icon icon="solar:arrow-left-outline" width={20} /> Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          <Link href="/charge-horaire" className="flex items-center gap-2 px-4 py-2 border border-stroke rounded-lg">
            <Icon icon="solar:arrow-left-outline" width={20} /> Retour
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{cours.code} - {cours.designation}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1"><Icon icon="solar:medal-star-outline" width={16} /> {cours.credit} credits</span>
              {cours.anneeId && <span className="flex items-center gap-1"><Icon icon="solar:calendar-outline" width={16} /> {new Date(cours.anneeId.debut).getFullYear()} - {new Date(cours.anneeId.fin).getFullYear()}</span>}
              {promotion && <span className="flex items-center gap-1"><Icon icon="solar:users-group-rounded-outline" width={16} /> {promotion.sigle}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="px-6 flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => <TabItem key={tab.value} label={tab.label} value={tab.value} activeTab={activeTab} onClick={setActiveTab} icon={tab.icon} />)}
        </div>
      </div>

      <div className="p-6 bg-gray-2 dark:bg-boxdark-2 min-h-screen">
        {activeTab === "fiche-cotation" && <FicheCotation elementId={elementId} promotionId={promotion?._id || ""} anneeId={cours.anneeId?._id || ""} titulaireId={cours.titulaireId || ""} />}
        {activeTab === "activities" && <ActivitesManager elementId={elementId} titulaireId={cours.titulaireId || ""} promotionId={promotion?._id || ""} anneeId={cours.anneeId?._id || ""} onCreateActivity={(type) => { setActivityType(type); setShowActivityModal(true); }} />}
        {activeTab === "ressources" && <RessourcesManager elementId={elementId} titulaireId={cours.titulaireId || ""} promotionId={promotion?._id || ""} anneeId={cours.anneeId?._id || ""} />}
        {activeTab === "recours" && <RecoursManager elementId={elementId} />}
        {activeTab === "seances" && <SeancesManager elementId={elementId} promotionId={promotion?._id || ""} anneeId={cours.anneeId?._id || ""} />}
      </div>

      {showActivityModal && <CreateActivityModal type={activityType} elementId={elementId} titulaireId={cours.titulaireId || ""} promotionId={promotion?._id || ""} anneeId={cours.anneeId?._id || ""} onClose={() => setShowActivityModal(false)} onSuccess={() => setShowActivityModal(false)} />}
    </div>
  );
}