import { ResultatEtudiant } from "@/utils/NoteManager";
import DocumentSection, { DocumentSectionHeader } from "../DocumentSection";
import ExcelJS from "exceljs";

export interface CommandeResult extends ResultatEtudiant {
  documentId: {
    _id: string;
    designation: string;
    anneeId: any;
    promotionId: any;
    description: string[];
    prix: number;
    category: string;
    signatures: {
      userId: any;
      fonction: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  etudiantId: string;
  phoneNumber: string;
  reference: string;
  createdAt: string;
  lieu_naissance?: string;
  date_naissance?: string;
  nationalite?: string;
  sexe?: string;
  adresse?: string;
}

export default class DocumentReleve extends DocumentSection {
  documentHeader: DocumentSectionHeader;
  constructor(document: DocumentSectionHeader) {
    super();
    this.documentHeader = document;
  }

  public async generate(resultats: CommandeResult[]) {
    // console.log(
    //   "[DocumentReleve.generate] Génération du document pour :",
    //   resultats,
    // );
    for (const result of resultats) {
      const sheet = this.addSheet(result.studentName);
      this.render(sheet, result);
    }
  }

  public renderNotes(
    sheet: ExcelJS.Worksheet,
    curr: number,
    result: CommandeResult,
  ): number {
    console.log("[DocumentReleve.renderNotes] Rendu des notes pour :", result);
    curr += 2;

    const headerRow = sheet.getRow(curr);
    const headers = [
      "N°",
      "Unité d'enseignement",
      "",
      "",
      "Crédit",
      "Note",
      "Statut",
    ];

    // Fusion des colonnes B:D pour le titre
    sheet.mergeCells(`B${curr}:D${curr}`);

    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      if (header === "") {
        return;
      }
      cell.value = header;
      this.applyStyle(cell, {
        align: { horizontal: "center" },
        bg: "E0E0E0",
      });
      this.applyBorder(cell);
    });

    curr++;

    let totalCredit = 0;
    let totalObtenu = 0;

    result.semestres.forEach((sem) => {
      sem.unites.forEach((unite, idx) => {
        console.log("[DocumentReleve.renderNotes] Rendu de l'unité :", unite);
        const row = sheet.getRow(curr);
        totalCredit += unite.credit;
        totalObtenu += (unite.moyenne * unite.credit) / 100 || 0;

        row.getCell(1).value = idx + 1;
        row.getCell(2).value = unite.designation;

        // Fusion des colonnes B:D pour chaque ligne d'unité
        try {
          sheet.mergeCells(`B${curr}:D${curr}`);
        } catch (e) {
          // Cellules déjà fusionnées, ignorer
          console.warn(
            `[DocumentReleve.renderNotes] Fusion déjà existante à B${curr}:D${curr}`,
          );
        }

        row.getCell(5).value = unite.credit;
        row.getCell(6).value =
          typeof unite.moyenne === "number"
            ? parseFloat(unite.moyenne.toFixed(2))
            : "-";
        row.getCell(7).value = unite.isValide ? "V" : "NV";

        [1, 2, 5, 6, 7].forEach((col) => {
          const cell = row.getCell(col);
          if (col === 4 && typeof unite.moyenne === "number") {
            cell.numFmt = "0.00";
          }
          this.applyBorder(cell);
          if (col >= 3) {
            this.applyStyle(cell, { align: { horizontal: "center" } });
          }

          if (col == 2) {
            sheet.getColumn(col).width = this.getFontSize("MD") * 2.5;
          }
        });

        curr++;
      });
    });

    return curr;
  }

  public renderSynthese(
    sheet: ExcelJS.Worksheet,
    curr: number,
    result: CommandeResult,
  ): number {
    curr += 1;

    // Titre du tableau de synthèse
    const titleRow = sheet.getRow(curr);
    titleRow.getCell(1).value = "SYNTHÈSE DES RÉSULTATS";
    sheet.mergeCells(`A${curr}:C${curr}`);
    const titleCell = titleRow.getCell(1);
    this.applyStyle(titleCell, {
      bold: true,
      size: "SM",
      align: { horizontal: "center" },
    });
    titleCell.font = {
      name: "Arial",
      size: this.getFontSize("SM"),
      bold: true,
    };
    this.applyBorder(titleCell);
    curr++;

    // En-tête du tableau
    const headerRow = sheet.getRow(curr);
    sheet.mergeCells(`A${curr}:B${curr}`);
    headerRow.getCell(1).value = "Description";
    headerRow.getCell(3).value = "Valeur";

    [1, 3].forEach((col) => {
      const cell = headerRow.getCell(col);
      this.applyStyle(cell, {
        bold: true,
        size: "SM",
        align: { horizontal: "center" },
        bg: "E0E0E0",
      });
      cell.font = {
        name: "Arial",
        size: this.getFontSize("SM"),
        bold: true,
      };
      this.applyBorder(cell);
    });
    curr++;

    // Données du tableau de synthèse
    const syntheseData = [
      { label: "Total Obtenu", value: result.promotion.totalObtenu },
      { label: "Total Maximum", value: result.promotion.totalMax },
      { label: "Pourcentage", value: `${result.promotion.pourcentage}%` },
      { label: "Mention", value: result.promotion.mention || "-" },
      { label: "Crédits Validés (NCV)", value: result.promotion.ncv },
      { label: "Crédits Non Validés (NCNV)", value: result.promotion.ncnv },
    ];

    syntheseData.forEach((data) => {
      const row = sheet.getRow(curr);

      try {
        sheet.mergeCells(`A${curr}:B${curr}`);
      } catch (e) {
        // Cellules déjà fusionnées, ignorer
        console.warn(
          `[DocumentReleve.renderSynthese] Fusion déjà existante à A${curr}:B${curr}`,
        );
      }

      row.getCell(1).value = data.label;
      row.getCell(3).value = data.value;

      [1, 3].forEach((col) => {
        const cell = row.getCell(col);
        cell.font = {
          name: "Arial",
          size: this.getFontSize("SM"),
        };
        this.applyBorder(cell);
        if (col === 3) {
          this.applyStyle(cell, {
            size: "SM",
            align: { horizontal: "center" },
          });
        } else {
          this.applyStyle(cell, {
            size: "SM",
            align: { horizontal: "left" },
          });
        }
      });
      curr++;
    });

    // Ligne de décision
    curr += 1;
    const decisionRow = sheet.getRow(curr);
    const ncv = result.promotion.ncv;
    const ncnv = result.promotion.ncnv;
    const totalCredits = ncv + ncnv;
    const isAdjourne =
      totalCredits > 0 ? (ncv / totalCredits) * 100 < 75 : false;

    try {
      sheet.mergeCells(`A${curr}:B${curr}`);
    } catch (e) {
      // Cellules déjà fusionnées, ignorer
      console.warn(
        `[DocumentReleve.renderSynthese] Fusion déjà existante à A${curr}:B${curr}`,
      );
    }

    decisionRow.getCell(1).value = "DÉCISION";
    decisionRow.getCell(3).value = isAdjourne ? "AJOURNÉ" : "VALIDÉ";

    [1, 3].forEach((col) => {
      const cell = decisionRow.getCell(col);
      this.applyStyle(cell, {
        bold: true,
        size: "SM",
        color: isAdjourne ? "FF0000" : "00B050",
        align: { horizontal: "center" },
      });
      cell.font = {
        name: "Arial",
        size: this.getFontSize("SM"),
        bold: true,
        color: { argb: isAdjourne ? "FFFF0000" : "FF00B050" },
      };
      this.applyBorder(cell);
    });

    return curr + 2;
  }

  public render(sheet: ExcelJS.Worksheet, result: CommandeResult) {
    console.log(
      "[DocumentReleve.render] Début rendu relevé:",
      result.studentName,
    );

    const headerData = {
      ...this.documentHeader,
      student: {
        nomComplet: result.studentName,
        matricule: result.matricule,
        dateNaissance: result.date_naissance || "",
        lieuNaissance: result.lieu_naissance || "",
        nationalite: result.nationalite || "",
        sexe: result.sexe || "",
        adresse: result.adresse || "",
      },
    };

    let curr = this.drawSectionHeader(headerData, sheet);
    console.log("[DocumentReleve.render] Après header:", curr);

    curr = this.renderNotes(sheet, curr, result);
    console.log("[DocumentReleve.render] Après notes:", curr);

    curr = this.renderSynthese(sheet, curr, result);
    console.log("[DocumentReleve.render] Après synthèse:", curr);

    const signatureData = {
      createdAt: result.createdAt,
      startRow: curr,
      sheet: sheet,
      signature: {
        nomComplet:
          ((result as any).documentId?.signatures as any)?.[0]?.userId
            ?.nomComplet || "",
        fonction:
          ((result as any).documentId?.signatures as any)?.[0]?.fonction || "",
        email:
          ((result as any).documentId?.signatures as any)?.[0]?.userId?.email ||
          "",
        grade:
          ((result as any).documentId?.signatures as any)?.[0]?.userId?.grade ||
          "",
        matricule:
          ((result as any).documentId?.signatures as any)?.[0]?.userId
            ?.matricule || "",
        telephone:
          ((result as any).documentId?.signatures as any)?.[0]?.userId
            ?.telephone || "unknown",
      },
    };

    this.drawSectionSignature(signatureData);
    console.log("[DocumentReleve.render] Document complété");
  }
}
