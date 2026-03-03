import DocumentJury, { JuryIdentity } from "./DocumentJury";
import { ResultatEtudiant, SemestreResultat } from "@/utils/NoteManager";
import ExcelJS from "exceljs";

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
    let col = 3;
    sem.unites.forEach((u) => {
      const start = col;
      u.elements.forEach((e) => {
        sheet.getCell(row + 1, col).value = e.designation;
        sheet.getCell(row + 2, col).value = `Cr:${e.credit}`;
        col++;
      });
      sheet.mergeCells(row, start, row, col - 1);
      sheet.getCell(row, start).value = u.code;
      sheet.getCell(row + 1, col).value = "MOY";
      sheet.getCell(row + 1, col + 1).value = "CAP";
      sheet.mergeCells(row, col, row, col + 1);
      col += 2;
    });
    // Appliquer style PRIMARY aux headers
  }

  private renderGrilleGlobaleSheet(
    resultats: ResultatEtudiant[],
    identity: JuryIdentity,
  ) {
    const sheet = this.addSheet("Grille Annuelle", "landscape");
    // Logique similaire mais avec les moyennes des UE par semestre
  }
}
