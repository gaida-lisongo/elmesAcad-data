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

    sheet.mergeCells("A1:F1");
    const headerCell = sheet.getCell("A1");
    headerCell.value = headerItemsCell.join("\r\n");
    this.applyFullBorders(headerCell, "THIN");

    //2. Document Information
    const infoItemsCell = [
      {
        key: "documentType",
        label: "Type de Document",
        value: documentType,
      },
      {
        key: "anneeAcademique",
        label: "Année Académique",
        value: anneeAcademique,
      },
      {
        key: "sectionTitle",
        label: "Section",
        value: sectionTitle,
      },
      {
        key: "promotion",
        label: "Promotion",
        value: promotion,
      },
      {
        key: "nref",
        label: "N° Ref",
        value: nref,
      },
    ];

    let rowIdx = 2;
    infoItemsCell.forEach((item, index) => {
      const row = sheet.getRow(rowIdx);

      if (index % 2 === 0 && index > 1) {
        row.getCell(1).value = item.value;
        sheet.mergeCells(`A${rowIdx}:C${rowIdx}`);
        this.applyFullBorders(row.getCell(1), "THIN");
      } else if (index % 2 !== 0 && index > 1) {
        row.getCell(4).value = item.value;
        sheet.mergeCells(`D${rowIdx}:F${rowIdx}`);
        this.applyFullBorders(row.getCell(4), "THIN");
      } else {
        row.getCell(1).value = item.value;
        sheet.mergeCells(`A${rowIdx}:F${rowIdx}`);
        this.applyFullBorders(row.getCell(1), "THIN");
      }

      rowIdx += 1;
    });

    // 3. Student Information
    const studentInfoItemsCell = [
      {
        key: "nomComplet",
        label: "Nom Complet",
        value: student.nomComplet,
      },
      {
        key: "dateNaissance",
        label: "Date de Naissance",
        value: student.dateNaissance,
      },
      {
        key: "matricule",
        label: "Matricule",
        value: student.matricule,
      },
      {
        key: "lieuNaissance",
        label: "Lieu de Naissance",
        value: student.lieuNaissance,
      },
      {
        key: "sexe",
        label: "Sexe",
        value: student.sexe,
      },
      {
        key: "nationalite",
        label: "Nationalité",
        value: student.nationalite,
      },
    ];

    studentInfoItemsCell.forEach((item, index) => {
      const row = sheet.getRow(rowIdx);

      if (index % 2 === 0) {
        row.getCell(1).value = item.value;
        sheet.mergeCells(`A${rowIdx}:C${rowIdx}`);
        this.applyFullBorders(row.getCell(1), "THIN");
      } else {
        row.getCell(4).value = item.value;
        sheet.mergeCells(`D${rowIdx}:F${rowIdx}`);
        this.applyFullBorders(row.getCell(4), "THIN");
      }
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
        value: `${signature.nomComplet}\n${signature.fonction}\n${signature.grade ? `${signature.grade}` : ""}`,
      },
    ];

    signatureItemsCell.forEach((item) => {
      const row = sheet.getRow(startRow);

      if (item.key === "certification") {
        row.getCell(1).value = item.value;
        sheet.mergeCells(`A${startRow}:C${startRow}`);
      } else if (item.key === "date_signature") {
        row.getCell(4).value = `${item.label} ${item.value}`;
        sheet.mergeCells(`D${startRow}:F${startRow}`);
      } else if (item.key === "signature") {
        row.getCell(4).value = item.value;
        sheet.mergeCells(`D${startRow}:F${startRow}`);
      }

      startRow += 1;
    });

    //2. Footer Information
    const footerItemsCell = [
      "NB: Ce document est délivré à l'intéressé(e) pour servir et valoir ce que de droit.",
      "Av. de la Montage n°21, Q. Joli Parc, Commune de Ngaliema   Site web : ww.inbtp.ac.cd",
      `Email: ${signature.email || "contact@inbtp.ac.cd"} | Tel: ${signature.telephone || "+243 85 38 53 999"}`,
    ];

    footerItemsCell.forEach((item) => {
      const row = sheet.getRow(startRow);
      row.getCell(1).value = item;
      sheet.mergeCells(`A${startRow}:F${startRow}`);
      this.applyStyle(row.getCell(1), {
        size: "SM",
        color: "GRAY",
        align: { horizontal: "center" },
      });
      startRow += 1;
    });
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
