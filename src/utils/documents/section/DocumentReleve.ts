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
    for (const result of resultats) {
      const sheet = this.addSheet(result.studentName);
      this.render(sheet, result);
    }
  }

  public renderNotes(sheet: ExcelJS.Worksheet, curr: number, result: CommandeResult): number {
    curr += 2;
    
    const headerRow = sheet.getRow(curr);
    const headers = ["UE", "CODE", "CRÉDIT", "MOYENNE", "STATUT"];
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      this.applyStyle(cell, { bold: true, align: { horizontal: "center" }, bg: "E0E0E0" });
      this.applyBorder(cell);
    });
    
    curr++;
    
    let totalCredit = 0;
    let totalObtenu = 0;

    result.semestres.forEach((sem) => {
      sem.unites.forEach((unite) => {
        const row = sheet.getRow(curr);
        totalCredit += unite.credit;
        totalObtenu += (unite.moyenne * unite.credit) / 100 || 0;

        row.getCell(1).value = unite.designation;
        row.getCell(2).value = unite.code;
        row.getCell(3).value = unite.credit;
        row.getCell(4).value = typeof unite.moyenne === "number" ? parseFloat(unite.moyenne.toFixed(2)) : "-";
        row.getCell(5).value = unite.isValide ? "V" : "NV";

        [1, 2, 3, 4, 5].forEach((col) => {
          const cell = row.getCell(col);
          if (col === 4 && typeof unite.moyenne === "number") {
            cell.numFmt = "0.00";
          }
          this.applyBorder(cell);
          if (col >= 3) {
            this.applyStyle(cell, { align: { horizontal: "center" } });
          }
        });

        curr++;
      });
    });

    return curr;
  }

  public renderSynthese(sheet: ExcelJS.Worksheet, curr: number, result: CommandeResult): number {
    curr += 1;

    const row = sheet.getRow(curr);
    row.getCell(1).value = `Moyenne Globale: ${(result.promotion.totalObtenu / result.promotion.totalMax * 100).toFixed(2)}%`;
    sheet.mergeCells(`A${curr}:C${curr}`);
    this.applyStyle(row.getCell(1), { bold: true });
    this.applyBorder(row.getCell(1));

    curr++;
    const decisionRow = sheet.getRow(curr);
    const ncv = result.promotion.ncv;
    const ncnv = result.promotion.ncnv;
    const totalCredits = ncv + ncnv;
    const isAdjourne = totalCredits > 0 ? (ncv / totalCredits) * 100 < 75 : false;

    decisionRow.getCell(1).value = `Décision: ${isAdjourne ? "AJOURNÉ" : "VALIDÉ"}`;
    sheet.mergeCells(`A${curr}:C${curr}`);
    this.applyStyle(decisionRow.getCell(1), {
      bold: true,
      color: isAdjourne ? "FF0000" : "00B050",
    });
    this.applyBorder(decisionRow.getCell(1));

    return curr + 2;
  }

  public render(sheet: ExcelJS.Worksheet, result: CommandeResult) {
    console.log("[DocumentReleve.render] Début rendu relevé:", result.studentName);

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
        nomComplet: ((result as any).documentId?.signatures as any)?.[0]?.nomComplet || "",
        fonction: ((result as any).documentId?.signatures as any)?.[0]?.fonction || "",
        email: ((result as any).documentId?.signatures as any)?.[0]?.email || "",
        grade: ((result as any).documentId?.signatures as any)?.[0]?.fonction || "",
        matricule: ((result as any).documentId?.signatures as any)?.[0]?.matricule || "",
        telephone: ((result as any).documentId?.signatures as any)?.[0]?.telephone || "unknown",
      },
    };

    this.drawSectionSignature(signatureData);
    console.log("[DocumentReleve.render] Document complété");
  }
}
