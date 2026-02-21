"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  fetchCommandesByProduit,
  updateCommandeStatus,
  type ProduitType,
  type CommandeStatus,
} from "@/app/actions/commande.actions";

/* ─────────────────────────────────────── */
/*  Types                                  */
/* ─────────────────────────────────────── */
interface CommandeTableProps {
  type: ProduitType;
  produitId: string;
  prix: number;
  designation: string;
  onStatusChanged?: () => void; // notify parent to refresh metrics
}

type TabStatus = "all" | CommandeStatus;

const TABS: { key: TabStatus; label: string; icon: string }[] = [
  { key: "all", label: "Toutes", icon: "material-symbols:list-alt" },
  {
    key: "pending",
    label: "En attente",
    icon: "material-symbols:hourglass-empty",
  },
  {
    key: "ok",
    label: "Encaissées",
    icon: "material-symbols:check-circle",
  },
  { key: "failed", label: "Échouées", icon: "material-symbols:cancel" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending: {
    label: "En attente",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: "material-symbols:hourglass-empty",
  },
  ok: {
    label: "Encaissée",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: "material-symbols:check-circle",
  },
  paid: {
    label: "Payée",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "material-symbols:payments",
  },
  failed: {
    label: "Échouée",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: "material-symbols:cancel",
  },
};

const STATUSES_OPTIONS: CommandeStatus[] = ["pending", "ok", "failed"];

/* ─────────────────────────────────────── */
/*  Status Badge                           */
/* ─────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-gray-100 text-gray-600",
    icon: "material-symbols:circle",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
    >
      <Icon icon={cfg.icon} width={12} />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────────────────── */
/*  Status Selector (inline dropdown)      */
/* ─────────────────────────────────────── */
function StatusSelector({
  type,
  commandeId,
  currentStatus,
  onChanged,
}: {
  type: ProduitType;
  commandeId: string;
  currentStatus: string;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleChange = async (newStatus: CommandeStatus) => {
    if (newStatus === currentStatus) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    const result = await updateCommandeStatus(type, commandeId, newStatus);
    setLoading(false);
    if (result.success) {
      toast.success("Statut mis à jour");
      onChanged();
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded border border-stroke px-2 py-1 text-xs text-bodydark hover:bg-gray-100 dark:border-strokedark dark:hover:bg-boxdark-2"
      >
        {loading ? (
          <Icon
            icon="material-symbols:progress-activity"
            className="animate-spin"
            width={14}
          />
        ) : (
          <Icon icon="material-symbols:edit" width={14} />
        )}
        Modifier
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-38 rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
          {STATUSES_OPTIONS.filter((s) => s !== currentStatus).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => handleChange(s)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-boxdark-2"
              >
                <Icon
                  icon={cfg.icon}
                  width={14}
                  className={cfg.color.split(" ")[1]}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Main CommandeTable Component           */
/* ─────────────────────────────────────── */
export default function CommandeTable({
  type,
  produitId,
  prix,
  designation,
  onStatusChanged,
}: CommandeTableProps) {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("all");

  const loadCommandes = async () => {
    setLoading(true);
    const result = await fetchCommandesByProduit(
      type,
      produitId,
      activeTab === "all" ? undefined : (activeTab as CommandeStatus),
    );
    setLoading(false);
    if (result.success && result.data) {
      setCommandes(result.data);
    } else {
      toast.error(result.error || "Erreur de chargement");
    }
  };

  useEffect(() => {
    loadCommandes();
  }, [produitId, activeTab]);

  const handleStatusChanged = () => {
    loadCommandes();
    onStatusChanged?.();
  };

  /* Local mini-metrics */
  const localOk = commandes.filter((c) => c.status === "ok").length;
  const localPending = commandes.filter((c) => c.status === "pending").length;

  return (
    <div className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-5 py-4 dark:border-strokedark">
        <div>
          <h3 className="font-semibold text-black dark:text-white">
            Commandes — {designation}
          </h3>
          <p className="mt-0.5 text-xs text-bodydark">
            {commandes.length} commande{commandes.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-green-600 dark:text-green-400">
              {localOk} encaissée{localOk !== 1 ? "s" : ""}
            </span>{" "}
            ·{" "}
            <span className="text-yellow-600 dark:text-yellow-400">
              {localPending} en attente
            </span>
          </p>
        </div>
        <button
          onClick={loadCommandes}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-stroke px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-strokedark dark:hover:bg-boxdark-2"
        >
          <Icon
            icon="material-symbols:refresh"
            className={loading ? "animate-spin" : ""}
            width={16}
          />
          Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-stroke px-5 pt-3 dark:border-strokedark">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`mb-0 flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-bodydark hover:text-black dark:hover:text-white"
            }`}
          >
            <Icon icon={tab.icon} width={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              icon="material-symbols:progress-activity"
              className="animate-spin text-primary"
              width={32}
            />
          </div>
        ) : commandes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-bodydark">
            <Icon
              icon="material-symbols:inbox"
              width={48}
              height={48}
              className="mb-2 opacity-40"
            />
            <p className="text-sm">Aucune commande trouvée</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stroke bg-gray-2 text-left text-xs uppercase text-bodydark dark:border-strokedark dark:bg-boxdark-2">
                <th className="px-5 py-3">N° Commande</th>
                <th className="px-5 py-3">Étudiant</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Référence</th>
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((cmd, i) => {
                const etudiant = cmd.etudiantId as any;
                return (
                  <tr
                    key={cmd._id}
                    className={`border-b border-stroke transition-colors hover:bg-gray-50 dark:border-strokedark dark:hover:bg-boxdark-2 ${
                      i % 2 === 0 ? "" : "bg-gray-2/50 dark:bg-boxdark-2/50"
                    }`}
                  >
                    {/* N° Commande */}
                    <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                      {cmd.orderNumber}
                    </td>

                    {/* Étudiant */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-black dark:text-white">
                        {etudiant?.nomComplet ?? "—"}
                      </p>
                      {etudiant?.matricule && (
                        <p className="text-xs text-bodydark">
                          {etudiant.matricule}
                        </p>
                      )}
                    </td>

                    {/* Téléphone */}
                    <td className="px-5 py-3.5 text-bodydark">
                      {cmd.phoneNumber || etudiant?.telephone || "—"}
                    </td>

                    {/* Référence */}
                    <td className="px-5 py-3.5">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-boxdark-2">
                        {cmd.reference}
                      </span>
                    </td>

                    {/* Montant */}
                    <td className="px-5 py-3.5 font-semibold text-black dark:text-white">
                      {prix.toLocaleString()} $
                    </td>

                    {/* Statut */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={cmd.status} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-bodydark">
                      {new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      <StatusSelector
                        type={type}
                        commandeId={cmd._id}
                        currentStatus={cmd.status}
                        onChanged={handleStatusChanged}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
