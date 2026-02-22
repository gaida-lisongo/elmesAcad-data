/**
 * Excel export utility for Commandes
 *
 * Install:  npm install xlsx
 *
 * Usage:
 *   import { exportCommandesExcel } from "@/utils/exportCommandes";
 *   exportCommandesExcel({ commandes, prix, designation, type });
 */

// Types mirrored from commande.actions.ts to avoid server-side import
export type ProduitType = "enrollement" | "stage" | "sujet";

export interface ExportCommandesOptions {
  /** Raw commande documents (etudiantId must be populated) */
  commandes: any[];
  /** Unit price of the produit */
  prix: number;
  /** Human-readable name shown in the filename and summary */
  designation: string;
  /** Product type label shown in the file */
  type: ProduitType;
  /** Optional: promotion name for the report header */
  promotionName?: string;
  /** Optional: annee string e.g. "2025 – 2026" */
  anneeName?: string;
}

/* ─────────────────────────────────────────────────────────── */
/*  Internal helpers                                           */
/* ─────────────────────────────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  ok: "Encaissée",
  pending: "En attente",
  failed: "Échouée",
  paid: "Payée",
};

/** Format a raw commande row into a plain object for the sheet */
function toRow(cmd: any, prix: number, rowIndex: number) {
  const etudiant = cmd.etudiantId as any;
  return {
    "#": rowIndex,
    "N° Commande": cmd.orderNumber ?? "",
    Référence: cmd.reference ?? "",
    Matricule: etudiant?.matricule ?? "",
    Étudiant: etudiant?.nomComplet ?? "",
    Grade: etudiant?.grade ?? "",
    Téléphone: cmd.phoneNumber ?? etudiant?.telephone ?? "",
    "Montant ($)": prix,
    Statut: STATUS_LABELS[cmd.status] ?? cmd.status,
    "Date de commande": cmd.createdAt
      ? new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "",
    Heure: cmd.createdAt
      ? new Date(cmd.createdAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "",
  };
}

/** Column widths (chars) for a nice default layout */
const COL_WIDTHS = [4, 22, 20, 14, 28, 12, 16, 14, 14, 16, 8];

/** Apply column widths to a worksheet */
function applyColWidths(ws: any) {
  ws["!cols"] = COL_WIDTHS.map((w) => ({ wch: w }));
}

/** Build a styled header row above the data table */
function buildSummaryRows(
  commandes: any[],
  prix: number,
  designation: string,
  type: ProduitType,
  promotionName?: string,
  anneeName?: string,
) {
  const total = commandes.length;
  const caReel = commandes.filter((c) => c.status === "ok").length * prix;
  const caEnAttente =
    commandes.filter((c) => c.status === "pending").length * prix;

  return [
    [`Rapport des commandes — ${designation}`],
    [`Type : ${type.charAt(0).toUpperCase() + type.slice(1)}`],
    promotionName ? [`Promotion : ${promotionName}`] : [],
    anneeName ? [`Année : ${anneeName}`] : [],
    [
      `Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`,
    ],
    [],
    [`Total commandes`, total],
    [`CA Réel (encaissé)`, `${caReel.toLocaleString()} $`],
    [`CA En attente`, `${caEnAttente.toLocaleString()} $`],
    [],
  ].filter((r) => r.length > 0);
}

/* ─────────────────────────────────────────────────────────── */
/*  Main export function (browser-only, dynamic import)       */
/* ─────────────────────────────────────────────────────────── */
export async function exportCommandesExcel(
  opts: ExportCommandesOptions,
): Promise<void> {
  const XLSX = await import("xlsx");

  const {
    commandes,
    prix,
    designation,
    type,
    promotionName,
    anneeName,
  } = opts;

  const wb = XLSX.utils.book_new();

  /* ── Helper: build a sheet for a subset of commandes ── */
  const buildSheet = (subset: any[], sheetTitle: string) => {
    const summaryRows = buildSummaryRows(
      subset,
      prix,
      designation,
      type,
      promotionName,
      anneeName,
    );

    // Data rows
    const dataRows = subset.map((cmd, i) => toRow(cmd, prix, i + 1));

    // AOA = Array of Arrays for the summary header block
    const aoa = summaryRows;

    // Convert summary to sheet first (AOA mode)
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Append data table rows (JSON mode) starting after the summary block
    const dataStartRow = aoa.length; // 0-based
    XLSX.utils.sheet_add_json(ws, dataRows, {
      origin: dataStartRow,
      skipHeader: false,
    });

    applyColWidths(ws);

    // Freeze the data header row so it stays visible while scrolling
    ws["!freeze"] = { xSplit: 0, ySplit: dataStartRow + 1 };

    return ws;
  };

  /* ── Sheet 1: Rapport Global ── */
  const wsGlobal = buildSheet(commandes, "Rapport Global");
  XLSX.utils.book_append_sheet(wb, wsGlobal, "Rapport Global");

  /* ── Sheet per status ── */
  const statuses: Array<{ key: string; label: string }> = [
    { key: "ok", label: "Encaissées" },
    { key: "pending", label: "En attente" },
    { key: "failed", label: "Échouées" },
    { key: "paid", label: "Payées" },
  ];

  for (const { key, label } of statuses) {
    const subset = commandes.filter((c) => c.status === key);
    if (subset.length === 0) continue; // skip empty sheets
    const ws = buildSheet(subset, label);
    XLSX.utils.book_append_sheet(wb, ws, label);
  }

  /* ── Trigger download ── */
  const safeDesignation = designation
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "")
    .trim()
    .slice(0, 40);
  const date = new Date()
    .toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const filename = `commandes_${type}_${safeDesignation}_${date}.xlsx`;

  XLSX.writeFile(wb, filename);
}
