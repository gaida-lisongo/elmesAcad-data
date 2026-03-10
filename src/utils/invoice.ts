/**
 * Client-side invoice generator using pdfmake.
 * Always call this function from a browser context (not SSR).
 */

import type { ProduitType } from "@/app/actions/produit.actions";

export interface InvoiceParams {
  type: ProduitType;
  produitId: string;
  commandeId: string;
  produitName: string;
  orderNumber: string;
  reference: string;
  studentName: string;
  studentMatricule: string;
  telephone: string;
  prix: number;
  annee: string;
  promotionName: string;
}

const TYPE_LABEL: Record<ProduitType, string> = {
  enrollement: "Inscription à la session",
  stage: "Stage académique",
  sujet: "Sujet de mémoire",
  document: "Document académique",
};

const TYPE_URL: Record<ProduitType, string> = {
  enrollement: "enrollement",
  stage: "stage",
  sujet: "sujet",
  document: "document",
};

export async function generateInvoicePDF(params: InvoiceParams): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const pdfMake = (await import("pdfmake/build/pdfmake")).default;
  const pdfFonts = (await import("pdfmake/build/vfs_fonts")).default;
  // @ts-ignore – vfs_fonts attaches itself on the default export
  pdfMake.vfs = pdfFonts?.pdfMake?.vfs ?? (pdfFonts as any).vfs;

  const qrUrl = `${window.location.origin}/check-cmd/${TYPE_URL[params.type]}/${params.commandeId}`;
  const now = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    background: (
      _page: number,
      pageSize: { width: number; height: number },
    ) => ({
      canvas: [
        {
          type: "rect",
          x: 0,
          y: 0,
          w: pageSize.width,
          h: pageSize.height,
          color: "#F8FAFC",
        },
      ],
    }),
    content: [
      // ── Header ─────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              { text: "REÇU DE COMMANDE", style: "title" },
              { text: TYPE_LABEL[params.type], style: "subtitle" },
            ],
          },
          {
            alignment: "right",
            stack: [
              { text: `N° ${params.orderNumber}`, style: "orderNum" },
              { text: now, style: "dateText" },
            ],
          },
        ],
        marginBottom: 20,
      },
      // ── Divider ─────────────────────────────────────────────
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 2,
            lineColor: "#3B82F6",
          },
        ],
        marginBottom: 20,
      },
      // ── Student + Product info columns ──────────────────────
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "ÉTUDIANT", style: "sectionHeader" },
              { text: params.studentName, style: "infoValue" },
              {
                text: `Matricule: ${params.studentMatricule}`,
                style: "infoSub",
              },
              { text: `Tél: ${params.telephone}`, style: "infoSub" },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "PROMOTION", style: "sectionHeader" },
              { text: params.promotionName, style: "infoValue" },
              { text: params.annee, style: "infoSub" },
            ],
          },
        ],
        marginBottom: 20,
      },
      // ── Product box ─────────────────────────────────────────
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [
              {
                text: "PRODUIT / SERVICE",
                style: "tableHeader",
                fillColor: "#3B82F6",
                color: "#fff",
              },
              {
                text: "MONTANT (FC)",
                style: "tableHeader",
                fillColor: "#3B82F6",
                color: "#fff",
                alignment: "right",
              },
            ],
            [
              { text: params.produitName, style: "tableRow" },
              {
                text: params.prix.toLocaleString("fr-FR"),
                style: "tableRow",
                alignment: "right",
              },
            ],
            [
              { text: "TOTAL", bold: true, fontSize: 11, fillColor: "#EFF6FF" },
              {
                text: params.prix.toLocaleString("fr-FR") + " FC",
                bold: true,
                fontSize: 11,
                alignment: "right",
                fillColor: "#EFF6FF",
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#CBD5E1",
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        marginBottom: 24,
      },
      // ── References + QR ────────────────────────────────────
      {
        columns: [
          {
            width: "60%",
            stack: [
              { text: "RÉFÉRENCE", style: "sectionHeader" },
              { text: params.reference, style: "refCode" },
              { text: "\nStatus", style: "sectionHeader" },
              {
                table: {
                  body: [
                    [
                      {
                        text: "✓  CONFIRMÉ",
                        color: "#16A34A",
                        bold: true,
                        fontSize: 10,
                        fillColor: "#DCFCE7",
                        margin: [8, 4, 8, 4],
                      },
                    ],
                  ],
                },
                layout: "noBorders",
              },
            ],
          },
          {
            width: "40%",
            alignment: "right",
            stack: [
              {
                text: "SCANNER POUR ACCÉDER",
                style: "sectionHeader",
                alignment: "center",
              },
              { qr: qrUrl, fit: 100, alignment: "center" },
              {
                text: qrUrl,
                style: "qrUrl",
                alignment: "center",
                marginTop: 4,
              },
            ],
          },
        ],
        marginBottom: 30,
      },
      // ── Footer ──────────────────────────────────────────────
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            lineColor: "#CBD5E1",
          },
        ],
        marginBottom: 8,
      },
      {
        text: "Ce document fait office de reçu officiel. Conservez-le pour vos archives.",
        style: "footer",
        alignment: "center",
      },
    ],
    styles: {
      title: { fontSize: 20, bold: true, color: "#1E3A5F" },
      subtitle: { fontSize: 10, color: "#64748B", marginTop: 2 },
      orderNum: { fontSize: 14, bold: true, color: "#3B82F6" },
      dateText: { fontSize: 9, color: "#94A3B8", marginTop: 2 },
      sectionHeader: {
        fontSize: 8,
        bold: true,
        color: "#94A3B8",
        letterSpacing: 1,
        marginBottom: 3,
      },
      infoValue: { fontSize: 11, bold: true, color: "#1E293B" },
      infoSub: { fontSize: 9, color: "#64748B", marginTop: 1 },
      tableHeader: { fontSize: 9, bold: true },
      tableRow: { fontSize: 10, color: "#334155" },
      refCode: {
        fontSize: 12,
        bold: true,
        color: "#1E3A5F",
        characterSpacing: 1.5,
      },
      qrUrl: { fontSize: 7, color: "#94A3B8" },
      footer: { fontSize: 8, color: "#94A3B8" },
    },
  };

  const fileName = `recu-${params.orderNumber}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}
