import ExcelJS from "exceljs";
import Document, { StyleOptions } from "./Document";
import { SemestreResultat } from "../NoteManager";

export interface DocumentSectionHeader {
  sectionTitle: string;
  anneeAcademique: string;
  promotion: string;
  nref: string;
  documentType: string;
}

export interface HeaderSection extends DocumentSectionHeader {
  student: {
    nomComplet: string;
    matricule: string;
    dateNaissance: string;
    lieuNaissance: string;
    nationalite: string;
    sexe: string;
    adresse: string;
  };
}

export default class DocumentSection extends Document {
  constructor() {
    super();
  }

  protected drawSectionHeader(
    {
      sectionTitle,
      anneeAcademique,
      promotion,
      nref,
      documentType,
      student,
    }: HeaderSection,
    sheet: ExcelJS.Worksheet,
  ): number {
    //1. Titre de la section
    const headerItemsCell = [
      "REPUBLIQUE DEMOCRATIQUE DU CONGO",
      "MINISTERE DE L’ENSEIGNEMENT SUPERIEUR ET UNIVERSITAIRE",
      "INSTITUT NATIONAL DU BATIMENT ET DES TRAVAUX PUBLICS",
      "I.N.B.T.P.",
      "KINSHASA/NGALIEMA",
    ];

    sheet.mergeCells("A1:G1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = headerItemsCell.join("\r\n");
    headerCell.alignment = { vertical: "middle", horizontal: "center" };
    headerCell.font = {
      name: "Arial",
      size: this.getFontSize("SM"),
      bold: true,
    };
    headerCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    sheet.getRow(1).height =
      this.getFontSize("SM") * headerItemsCell.length * 1.5;
    this.applyFullBorders(headerCell, "THIN");

    //2. Document Information
    let rowIdx = 2;

    const setCellStyle = (
      cell: ExcelJS.Cell,
      horizontal: ExcelJS.Alignment["horizontal"] = "left",
    ) => {
      this.applyFullBorders(cell, "THIN");
      this.applyStyle(cell, {
        bold: true,
        color: "PRIMARY",
        size: "SM",
        align: { horizontal },
      });
    };

    // Type de document (pleine largeur)
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    const typeCell = sheet.getCell(`A${rowIdx}`);
    typeCell.value = `${documentType || "-"}`;
    setCellStyle(typeCell, "center");

    // Référence (pleine largeur comme Type de Document)
    sheet.mergeCells(`C${rowIdx}:G${rowIdx}`);
    const refCell = sheet.getCell(`C${rowIdx}`);
    refCell.value = `N°/${nref || "-"}`;
    setCellStyle(refCell, "right");
    rowIdx += 1;

    // Année académique (pleine largeur)
    sheet.mergeCells(`A${rowIdx}:G${rowIdx}`);
    const anneeCell = sheet.getCell(`A${rowIdx}`);
    anneeCell.value = `Année Académique : ${anneeAcademique || "-"}`;
    setCellStyle(anneeCell, "center");
    rowIdx += 1;

    // Section et Promotion (côte à côte)
    sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
    const sectionCell = sheet.getCell(`A${rowIdx}`);
    sectionCell.value = `Section : ${sectionTitle || "-"}`;
    setCellStyle(sectionCell, "left");

    sheet.mergeCells(`C${rowIdx}:G${rowIdx}`);
    const promotionCell = sheet.getCell(`C${rowIdx}`);
    promotionCell.value = `Promotion : ${promotion || "-"}`;
    setCellStyle(promotionCell, "left");
    rowIdx += 1;

    rowIdx += 1;

    // 3. Student Information (côte à côte)
    const studentRows = [
      [
        { label: "Nom:", value: student.nomComplet },
        { label: "Matricule", value: student.matricule },
      ],
      [
        {
          label: "Date Naiss",
          value: new Date(student.dateNaissance).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }),
        },
        { label: "NE(E) A :", value: student.lieuNaissance },
      ],
      [
        { label: "Sexe", value: student.sexe },
        { label: "Nationalité", value: student.nationalite },
      ],
    ];

    studentRows.forEach(([leftItem, rightItem]) => {
      sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
      const leftCell = sheet.getCell(`A${rowIdx}`);
      leftCell.value = `${leftItem.label} : ${leftItem.value || "-"}`;
      this.applyFullBorders(leftCell, "THIN");
      this.applyStyle(leftCell, {
        size: "SM",
        align: { horizontal: "left", wrapText: true },
      });

      sheet.mergeCells(`C${rowIdx}:G${rowIdx}`);
      const rightCell = sheet.getCell(`C${rowIdx}`);
      rightCell.value = `${rightItem.label} : ${rightItem.value || "-"}`;
      this.applyFullBorders(rightCell, "THIN");
      this.applyStyle(rightCell, {
        size: "SM",
        align: { horizontal: "right", wrapText: true },
      });

      sheet.getRow(rowIdx).height = this.getFontSize("SM") * 2.5;

      rowIdx += 1;
    });

    return rowIdx; // Retourne la ligne où le contenu de la section peut commencer
  }

  protected drawSectionSignature({
    signature,
    createdAt,
    startRow,
    sheet,
  }: {
    signature: {
      nomComplet: string;
      fonction: string;
      grade?: string;
      telephone?: string;
      email?: string;
    };
    createdAt: string;
    startRow: number;
    sheet: ExcelJS.Worksheet;
  }) {
    //1. Signature Information
    const signatureItemsCell = [
      {
        key: "certification",
        label: "Certification",
        value: `Certifié exact d'après les registres des délibérations du jury`,
      },
      {
        key: "date_signature",
        label: "Fait à Kinshasa, le",
        value: new Date(createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      },
      {
        key: "signature",
        label: "Signature",
        value: `${signature.fonction}\n\n\n${signature.nomComplet}\n${signature.grade ? `${signature.grade}` : ""}`,
      },
    ];

    signatureItemsCell.forEach((item) => {
      const row = sheet.getRow(startRow);

      if (item.key === "certification") {
        row.getCell(1).value = item.value;
        this.applyStyle(row.getCell(1), {
          align: { horizontal: "center" },
        });
        row.getCell(1).alignment = { vertical: "middle" };
        row.getCell(1).font = {
          name: "Arial",
          size: this.getFontSize("SM"),
          bold: true,
        };
        sheet.mergeCells(`A${startRow}:G${startRow}`);
        startRow += 1;
      } else if (item.key === "date_signature") {
        row.getCell(4).value = `${item.label} ${item.value}`;
        this.applyStyle(row.getCell(1), {
          align: { horizontal: "center" },
        });
        row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        row.getCell(1).font = {
          name: "Arial",
          size: this.getFontSize("SM"),
          bold: true,
        };
        sheet.mergeCells(`D${startRow}:G${startRow}`);
        row.getCell(4).alignment = { vertical: "middle", horizontal: "right" };
        startRow += 1;
      } else if (item.key === "signature") {
        row.getCell(4).value = item.value;
        row.height = this.getFontSize("SM") * 7;
        this.applyStyle(row.getCell(4), {
          align: { horizontal: "center", wrapText: true },
        });
        row.getCell(4).alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        row.getCell(4).font = {
          name: "Arial",
          size: this.getFontSize("SM"),
          bold: true,
        };
        sheet.mergeCells(`D${startRow}:G${startRow}`);
      }

      startRow += 1;
    });

    //2. Footer Information
    const footerItemsCell = [
      "NB: Ce document est délivré à l'intéressé(e) pour servir et valoir ce que de droit.",
      "Av. de la Montage n°21, Q. Joli Parc, Commune de Ngaliema   Site web : ww.inbtp.ac.cd",
      `Email: ${signature.email || "contact@inbtp.ac.cd"} | Tel: ${signature.telephone || "+243 85 38 53 999"}`,
    ];

    startRow += 2;
    const row = sheet.getRow(startRow);
    row.getCell(1).value = footerItemsCell.join("\r\n");
    sheet.mergeCells(`A${startRow}:G${startRow}`);
    this.applyStyle(row.getCell(1), {
      size: "SM",
      align: { horizontal: "center" },
    });
    row.getCell(1).alignment = {
      vertical: "middle",
      wrapText: true,
      horizontal: "center",
    };
    row.getCell(1).font = {
      name: "Arial",
      size: this.getFontSize("SM"),
    };
    row.height = this.getFontSize("SM") * 3.5;
  }

  calculateSynthesis(sem: SemestreResultat) {
    const pourcentage = sem.pourcentage;
    const ncv = sem.ncv;
    const ncnv = sem.ncnv;
    const total = ncv + ncnv;
    const ncvPercentage = total > 0 ? (ncv / total) * 100 : 0;
    const isAdjourne = ncvPercentage < 75;

    console.log("Synthèse data : ", {
      obtenu: sem.totalObtenu,
      maximum: sem.totalMax,
      pourcentage,
      ncv,
      ncnv,
      mention: this.getMentionCode(pourcentage),
      appreciation: isAdjourne ? "AJ" : "SAT",
      decision: isAdjourne ? "D" : "P",
    });
    return {
      obtenu: sem.totalObtenu,
      maximum: sem.totalMax,
      pourcentage,
      ncv,
      ncnv,
      mention: this.getMentionCode(pourcentage),
      appreciation: isAdjourne ? "AJ" : "SAT",
      decision: isAdjourne ? "D" : "P",
    };
  }

  getMentionCode(pourcentage: number): string {
    if (pourcentage >= 90) return "A";
    if (pourcentage >= 80) return "B";
    if (pourcentage >= 70) return "C";
    if (pourcentage >= 60) return "D";
    if (pourcentage >= 50) return "E";
    if (pourcentage >= 40) return "F";
    if (pourcentage >= 35) return "G";
    return "H";
  }
}
