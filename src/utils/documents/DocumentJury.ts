import Document, { StyleOptions } from "./Document";
import ExcelJS from "exceljs";

export interface JuryIdentity {
  universite: string;
  faculte: string;
  departement: string;
  promotion: string;
  anneeAcademique: string;
}

export default class DocumentJury extends Document {
  constructor() {
    super({ defaultFontSize: "SM" }); // Le jury préfère souvent des documents compacts
  }

  /**
   * Méthode protégée pour dessiner le bloc d'en-tête académique
   */
  protected drawAcademicHeader(
    sheet: ExcelJS.Worksheet,
    identity: JuryIdentity,
  ): number {
    const defaultStyle: StyleOptions = {
      bold: true,
      size: "SM",
      color: "BLACK",
      align: { vertical: "middle", horizontal: "center", wrapText: true },
    };
    // 1. En-tête Gauche (Titres)
    const titles = [
      `${identity.universite}`,
      `Section: ${identity.faculte}`,
      `${identity.departement}`,
      `Promotion: ${identity.promotion}`,
      `Année Académique: ${identity.anneeAcademique}`,
    ];

    let rowIdx = 1;

    sheet.getCell(`A${rowIdx}`).value = titles.join("\r\n");
    this.applyStyle(sheet.getCell(`A${rowIdx}`), defaultStyle);
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    this.applyFullBorders(sheet.getCell(`A${rowIdx}`), "HAIR");

    return rowIdx + 1; // On retourne la ligne où le contenu peut commencer
  }

  /**
   * Pied de page pour les signatures
   */
  protected drawSignatureBlock(
    sheet: ExcelJS.Worksheet,
    startRow: number,
  ): void {
    const row = sheet.getRow(startRow);

    // Signature Président
    sheet.mergeCells(`A${startRow}:C${startRow}`);
    const pres = sheet.getCell(`A${startRow}`);
    pres.value = "Le Président du Jury";
    this.applyStyle(pres, { bold: true, align: { horizontal: "center" } });

    // Signature Secrétaire
    sheet.mergeCells(`F${startRow}:H${startRow}`);
    const sec = sheet.getCell(`F${startRow}`);
    sec.value = "Le Secrétaire du Jury";
    this.applyStyle(sec, { bold: true, align: { horizontal: "center" } });
  }
}
