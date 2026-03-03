import Document, { StyleOptions } from "./Document";
import ExcelJS from "exceljs";

export interface JuryIdentity {
  universite: string;
  faculte: string;
  departement: string;
  session: string;
  anneeAcademique: string;
}

export default class DocumentJury extends Document {
  constructor() {
    super({ defaultFontSize: "SM" }); // Le jury préfère souvent des documents compacts
  }

  /**
   * Méthode protégée pour dessiner le bloc d'en-tête académique
   */
  protected drawAcademicHeader(sheet: ExcelJS.Worksheet, identity: JuryIdentity): number {
    // 1. En-tête Gauche (Titres)
    const titles = [
        identity.universite,
        identity.faculte,
        identity.departement,
        "---------------------------",
        "JURY DE DÉLIBÉRATION"
    ];

    titles.forEach((text, index) => {
        const row = index + 1;
        const cell = sheet.getCell(`A${row}`);
        cell.value = text;
        this.applyStyle(cell, { 
            bold: index === 0 || index === 4, // Gras pour Univ et Jury
            size: index === 0 ? "LG" : "MD",
            color: index === 4 ? "PRIMARY" : "BLACK"
        });
    });

    // 2. En-tête Droite (Année / Session)
    sheet.mergeCells("F1:H1");
    const sessionCell = sheet.getCell("F1");
    sessionCell.value = `Année : ${identity.anneeAcademique}`;
    this.applyStyle(sessionCell, { align: { horizontal: "right" } });

    sheet.mergeCells("F2:H2");
    sheet.getCell("F2").value = `Session : ${identity.session}`;
    sheet.getCell("F2").alignment = { horizontal: "right" };

    return 7; // On retourne la ligne où le contenu peut commencer
  }

  /**
   * Pied de page pour les signatures
   */
  protected drawSignatureBlock(sheet: ExcelJS.Worksheet, startRow: number): void {
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