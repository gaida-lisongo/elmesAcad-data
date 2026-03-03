import DocumentJury, { JuryIdentity } from "./DocumentJury";
import { ResultatEtudiant, SemestreResultat } from "@/utils/NoteManager";
import ExcelJS from "exceljs";
import { title } from "process";

export default class DocumentGrille extends DocumentJury {
  public async generate(resultats: ResultatEtudiant[], identity: JuryIdentity) {
    // 1. Feuilles semestrielles
    const nbSemestres = resultats[0].semestres.length;
    for (let i = 0; i < nbSemestres; i++) {
      this.renderGrilleSheet(resultats, identity, i);
    }

    // 2. Grille Globale (Récapitulative)
    this.renderGrilleGlobaleSheet(resultats, identity);
  }

  private renderGrilleSheet(
    resultats: ResultatEtudiant[],
    identity: JuryIdentity,
    sIdx: number,
  ) {
    const semNom = resultats[0].semestres[sIdx].designation;
    const sheet = this.addSheet(semNom.substring(0, 31), "landscape");
    let curr = this.drawAcademicHeader(sheet, identity);

    // En-tête de grille
    const sem = resultats[0].semestres[sIdx];
    this.renderHeaderComplex(sheet, sem, curr);
    curr += 3;

    // Données
    resultats.forEach((etud, idx) => {
      const r = sheet.getRow(curr + idx);
      const resSem = etud.semestres[sIdx];
      r.getCell(1).value = idx + 1;
      r.getCell(2).value = etud.studentName;

      let c = 3;
      resSem.unites.forEach((u) => {
        u.elements.forEach((e) => {
          const cell = r.getCell(c++);
          cell.value = e.noteFinale;
          if (e.noteFinale < 10) this.applyStyle(cell, { color: "DANGER" });
        });
        r.getCell(c++).value = u.moyenne;
        const vCell = r.getCell(c++);
        vCell.value = u.isValide ? "V" : "NV";
        this.applyStyle(vCell, {
          color: u.isValide ? "SUCCESS" : "DANGER",
          bold: true,
        });
      });

      // Stats fin de ligne
      r.getCell(c++).value = resSem.pourcentage / 100;
      r.getCell(c).numFmt = "0.00%";
      r.eachCell((cell) => this.applyFullBorders(cell));
    });
  }

  private renderHeaderComplex(
    sheet: ExcelJS.Worksheet,
    sem: SemestreResultat,
    row: number,
  ) {
    const mentionsLabel = [
      "LEGENDE APPRECIATION",
      "A (Excellent) ≥ 90%",
      "B (Très bien) ≥ 80%",
      "C (Bein) ≥ 70%",
      "D (Assez Bien) ≥ 60%",
      "E (Passable) ≥ 50%",
      "F (Insuffisant) ≥ 40%",
      "G (Insatisfaisant) ≥ 35%",
      "NON : NCV ≤ 75%",
    ];

    this.applyStyle(sheet.getCell(row, 1), {
      bold: true,
    });

    sheet.getCell(row, 1).value = mentionsLabel.join("\n");
    sheet.getCell(row, 1).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    sheet.mergeCells(row, 1, row + 1, 2);
    const contentsLabel = ["N°", "ETUDIANT"];
    contentsLabel.forEach((label, idx) => {
      const cell = sheet.getCell(row + 2, idx + 1);
      cell.value = label;
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
    });

    sheet.getColumn(2).width = this.getFontSize("SM") * 3.5;
    sheet.getColumn(1).width = this.getFontSize("SM") / 2;

    const { rowEnd, colEnd } = this.renderNotesHeader(
      sheet,
      3,
      row,
      sem.unites,
    );

    const creditTotal = sem.unites.reduce((sum, u) => sum + (u.credit || 0), 0);
    this.renderSyntheseHeader(sheet, colEnd + 1, row, creditTotal);
    // Appliquer style PRIMARY aux headers
  }

  private renderNotesHeader(
    sheet: ExcelJS.Worksheet,
    colStart: number,
    row: number,
    unites: SemestreResultat["unites"],
  ): { rowEnd: number; colEnd: number } {
    let col = colStart;

    unites.forEach((u) => {
      const start = col;
      u.elements.forEach((e) => {
        const cell = sheet.getCell(row + 1, col);
        cell.value = e.designation;
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          textRotation: 90,
          wrapText: true, // Important pour le retour à la ligne si trop long
        };

        sheet.getColumn(col).width = this.getFontSize("SM") / 1.8; // Colonne étroite

        sheet.getCell(row + 2, col).value = e.credit;
        sheet.getCell(row + 2, col).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        col++;
      });

      // Style de l'Unité (Header principal)
      const ueCell = sheet.getCell(row, start);
      ueCell.value = u.code;
      ueCell.font = { bold: true };
      ueCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      // Colonne MOYENNE
      const moyCell = sheet.getCell(row + 1, col);
      moyCell.value = "MOY";
      moyCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        textRotation: 90,
      };
      sheet.getColumn(col).width = this.getFontSize("SM") / 1.8;

      sheet.getCell(row + 2, col).value = u.credit;
      sheet.getCell(row + 2, col).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // Colonne DECISION
      const decCell = sheet.getCell(row + 1, col + 1);
      decCell.value = "DECISION";
      decCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        textRotation: 90,
      };
      sheet.getColumn(col + 1).width = this.getFontSize("SM") / 1.8;

      sheet.mergeCells(row + 1, col + 1, row + 2, col + 1);
      sheet.mergeCells(row, start, row, col + 1);
      col += 2;
    });

    return { rowEnd: row + 2, colEnd: col - 1 };
  }

  private renderSyntheseHeader(
    sheet: ExcelJS.Worksheet,
    colStart: number,
    row: number,
    credit: number,
  ): { rowEnd: number; colEnd: number } {
    const headers = [
      { title: "MAXIMUM", subtitle: credit * 20 },
      { title: "POURCENTAGE", subtitle: 100 },
      { title: "NCV", subtitle: null },
      { title: "NCNV", subtitle: null },
      { title: "MENTION", subtitle: null },
      { title: "APPRECIATION", subtitle: null },
      { title: "CAPITALISATION", subtitle: null },
    ];

    // On harmonise la hauteur avec la rangée des éléments de la méthode précédente
    sheet.getRow(row + 1).height = this.getFontSize("XL") * 5.5;

    headers.forEach((h, i) => {
      const cell = sheet.getCell(row + 1, colStart + i);
      cell.value = h.title;
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        textRotation: 90,
      };
      sheet.getColumn(colStart + i).width = this.getFontSize("SM") / 1.8;

      if (h.subtitle !== null) {
        // Pour MAX et %, on met le titre en haut et la valeur (ex: 200) en bas
        sheet.getCell(row + 2, colStart + i).value = h.subtitle;
        sheet.getCell(row + 2, colStart + i).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      } else {
        // Pour les autres, on fusionne les deux lignes pour que le texte occupe tout l'espace vertical
        sheet.mergeCells(row + 1, colStart + i, row + 2, colStart + i);
      }
    });

    return { rowEnd: row + 2, colEnd: colStart + headers.length - 1 };
  }

  private renderGrilleGlobaleSheet(
    resultats: ResultatEtudiant[],
    identity: JuryIdentity,
  ) {
    const sheet = this.addSheet("Grille Annuelle", "landscape");
    // Logique similaire mais avec les moyennes des UE par semestre
  }
}
