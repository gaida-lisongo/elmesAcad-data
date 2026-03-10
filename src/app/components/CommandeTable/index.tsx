"use client";

import { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  fetchCommandesByProduit,
  updateCommandeStatus,
  type ProduitType,
  type CommandeStatus,
} from "@/app/actions/commande.actions";
import { exportCommandesExcel } from "@/utils/exportCommandes";

/* ─────────────────────────────────────── */
/*  Types                                  */
/* ─────────────────────────────────────── */
interface CommandeTableProps {
  type: ProduitType;
  produitId: string;
  prix: number;
  designation: string;
  promotionName?: string;
  anneeName?: string;
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
    key: "paid",
    label: "Payées",
    icon: "material-symbols:payments",
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

const STATUSES_OPTIONS: CommandeStatus[] = ["pending", "paid", "ok", "failed"];

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
  promotionName,
  anneeName,
  onStatusChanged,
}: CommandeTableProps) {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedCmd, setSelectedCmd] = useState<any | null>(null);

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
      // keep selectedCmd in sync if it was already showing
      setSelectedCmd((prev: any) =>
        prev ? (result.data!.find((c) => c._id === prev._id) ?? null) : null,
      );
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

  const handleExport = async () => {
    if (commandes.length === 0) {
      toast.error("Aucune commande à exporter");
      return;
    }
    setExporting(true);
    try {
      // fetch ALL commandes (no status filter) for a complete report
      const allResult = await fetchCommandesByProduit(type, produitId);
      const allCommandes =
        allResult.success && allResult.data ? allResult.data : commandes;
      await exportCommandesExcel({
        commandes: allCommandes,
        prix,
        designation,
        type,
        promotionName,
        anneeName,
      });
      toast.success("Rapport Excel généré");
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Erreur lors de l'export Excel");
    } finally {
      setExporting(false);
    }
  };

  /* ── Client-side search filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return commandes;
    return commandes.filter((cmd) => {
      const etudiant = cmd.etudiantId as any;
      return (
        cmd.reference?.toLowerCase().includes(q) ||
        cmd.orderNumber?.toLowerCase().includes(q) ||
        etudiant?.nomComplet?.toLowerCase().includes(q) ||
        etudiant?.matricule?.toLowerCase().includes(q)
      );
    });
  }, [commandes, search]);

  /* Local mini-metrics (on full list, not filtered) */
  const localOk = commandes.filter((c) => c.status === "ok").length;
  const localPending = commandes.filter((c) => c.status === "pending").length;
  const selectedCmdInList =
    selectedCmd && filtered.some((c) => c._id === selectedCmd._id)
      ? filtered.find((c) => c._id === selectedCmd._id)
      : null;

  return (
    <div className="space-y-4">
      {/* ── Commande Detail Card ── */}
      {selectedCmdInList && (
        <CommandeDetailCard
          cmd={selectedCmdInList}
          prix={prix}
          type={type}
          onClose={() => setSelectedCmd(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}

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
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting || loading || commandes.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-500 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
            >
              {exporting ? (
                <Icon
                  icon="material-symbols:progress-activity"
                  className="animate-spin"
                  width={16}
                />
              ) : (
                <Icon icon="material-symbols:download" width={16} />
              )}
              Exporter Excel
            </button>
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
        </div>

        {/* Tabs + Search row */}
        <div className="border-b border-stroke dark:border-strokedark">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-3">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSearch("");
                    setSelectedCmd(null);
                  }}
                  className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
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

            {/* Search input */}
            <div className="relative mb-2 w-full sm:w-72">
              <Icon
                icon="material-symbols:search"
                width={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-bodydark"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedCmd(null);
                }}
                placeholder="Rechercher par réf., nom ou matricule…"
                className="w-full rounded-lg border border-stroke bg-gray-2 py-2 pl-9 pr-4 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark-2 dark:text-white dark:focus:border-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bodydark hover:text-black dark:hover:text-white"
                >
                  <Icon icon="material-symbols:close" width={16} />
                </button>
              )}
            </div>
          </div>
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-bodydark">
              <Icon
                icon="material-symbols:inbox"
                width={48}
                height={48}
                className="mb-2 opacity-40"
              />
              <p className="text-sm">
                {search
                  ? `Aucun résultat pour « ${search} »`
                  : "Aucune commande trouvée"}
              </p>
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
                {filtered.map((cmd, i) => {
                  const etudiant = cmd.etudiantId as any;
                  const isSelected = selectedCmd?._id === cmd._id;
                  return (
                    <tr
                      key={cmd._id}
                      onClick={() => setSelectedCmd(isSelected ? null : cmd)}
                      className={`cursor-pointer border-b border-stroke transition-colors hover:bg-primary/5 dark:border-strokedark dark:hover:bg-primary/10 ${
                        isSelected
                          ? "bg-primary/5 dark:bg-primary/10"
                          : i % 2 === 0
                            ? ""
                            : "bg-gray-2/50 dark:bg-boxdark-2/50"
                      }`}
                    >
                      {/* N° Commande */}
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">
                        {cmd.orderNumber}
                        {isSelected && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
                            <Icon
                              icon="material-symbols:arrow-upward"
                              width={10}
                            />
                          </span>
                        )}
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
                      <td
                        className="px-5 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
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
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Commande Detail Card                   */
/* ─────────────────────────────────────── */
function CommandeDetailCard({
  cmd,
  prix,
  type,
  onClose,
  onStatusChanged,
}: {
  cmd: any;
  prix: number;
  type: ProduitType;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const etudiant = cmd.etudiantId as any;
  const cfg = STATUS_CONFIG[cmd.status] ?? {
    label: cmd.status,
    color: "bg-gray-100 text-gray-600",
    icon: "material-symbols:circle",
  };

  const statusGradient: Record<string, string> = {
    ok: "from-green-500 to-emerald-600",
    pending: "from-yellow-500 to-orange-500",
    failed: "from-red-500 to-rose-600",
    paid: "from-blue-500 to-blue-600",
  };
  const gradient = statusGradient[cmd.status] ?? "from-gray-500 to-gray-600";

  return (
    <div className="overflow-hidden rounded-2xl border border-stroke shadow-lg dark:border-strokedark">
      {/* Coloured top bar */}
      <div className={`bg-gradient-to-r ${gradient} px-6 py-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              Détail de la commande
            </p>
            <h2 className="mt-1 font-mono text-2xl font-bold text-white">
              {cmd.orderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm`}
            >
              <Icon icon={cfg.icon} width={16} />
              {cfg.label}
            </span>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
            >
              <Icon icon="material-symbols:close" width={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-px bg-stroke dark:bg-strokedark sm:grid-cols-2 lg:grid-cols-4">
        {/* Étudiant */}
        <div className="bg-white px-6 py-5 dark:bg-boxdark">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-bodydark">
            <Icon icon="material-symbols:school" width={14} />
            Étudiant
          </p>
          <p className="font-semibold text-black dark:text-white">
            {etudiant?.nomComplet ?? "—"}
          </p>
          {etudiant?.matricule && (
            <p className="mt-0.5 font-mono text-xs text-bodydark">
              {etudiant.matricule}
            </p>
          )}
          {etudiant?.grade && (
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {etudiant.grade}
            </span>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white px-6 py-5 dark:bg-boxdark">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-bodydark">
            <Icon icon="material-symbols:phone" width={14} />
            Contact
          </p>
          <p className="font-semibold text-black dark:text-white">
            {cmd.phoneNumber || etudiant?.telephone || "—"}
          </p>
          {etudiant?.email && (
            <p className="mt-0.5 truncate text-xs text-bodydark">
              {etudiant.email}
            </p>
          )}
        </div>

        {/* Référence & montant */}
        <div className="bg-white px-6 py-5 dark:bg-boxdark">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-bodydark">
            <Icon icon="material-symbols:tag" width={14} />
            Référence
          </p>
          <p className="font-mono text-sm font-semibold text-black dark:text-white">
            {cmd.reference}
          </p>
          <p className="mt-2 text-2xl font-bold text-black dark:text-white">
            {prix.toLocaleString()}{" "}
            <span className="text-base font-medium text-bodydark">$</span>
          </p>
        </div>

        {/* Date */}
        <div className="bg-white px-6 py-5 dark:bg-boxdark">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-bodydark">
            <Icon icon="material-symbols:calendar-today" width={14} />
            Date de commande
          </p>
          <p className="font-semibold text-black dark:text-white">
            {new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-0.5 text-xs text-bodydark">
            {new Date(cmd.createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-2 px-6 py-4 dark:bg-boxdark-2">
        <p className="text-xs text-bodydark">
          ID interne :{" "}
          <span className="font-mono text-black dark:text-white">
            {cmd._id}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-bodydark">Changer le statut :</span>
          <StatusSelector
            type={type}
            commandeId={cmd._id}
            currentStatus={cmd.status}
            onChanged={onStatusChanged}
          />
        </div>
      </div>
    </div>
  );
}
