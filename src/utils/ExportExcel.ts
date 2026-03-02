import * as XLSX from "xlsx";
import type {
  ResultatEtudiant,
  SemestreResultat,
  UniteResultat,
} from "./NoteManager";

interface PromotionInfo {
  niveau: string;
  designation: string;
  filiere?: { sigle: string; designation: string };
  section?: { mention: string };
}

interface AnneeInfo {
  debut: string;
  fin: string;
}

export class ExportExcel {
  private static getAnneeLabel(annee: AnneeInfo): string {
    return `${new Date(annee.debut).getFullYear()}-${new Date(annee.fin).getFullYear()}`;
  }

  private static getMentionLabel(mention: string): string {
    const labels: Record<string, string> = {
      A: "Distinction",
      B: "Grande Distinction",
      C: "Satisfaction",
      D: "Passable",
      E: "Ajourné(e)",
      F: "Échec",
    };
    return labels[mention] || mention;
  }

  private static getDecision(pourcentage: number): string {
    return pourcentage >= 50 ? "ADMIS(E)" : "AJOURNÉ(E)";
  }

  public static exportDeliberation(
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const workbook = XLSX.utils.book_new();

    this.addPVSheet(workbook, resultats, promotion, annee);
    this.addPalmaresSheet(workbook, resultats, promotion, annee);

    const semestresSet = new Set<string>();
    resultats.forEach((r) =>
      r.semestres.forEach((s) => semestresSet.add(s.designation)),
    );
    const semestres = Array.from(semestresSet);

    semestres.forEach((semestreDesignation) => {
      this.addGrilleSemestreSheet(
        workbook,
        resultats,
        promotion,
        annee,
        semestreDesignation,
      );
    });

    this.addGrillePromotionSheet(workbook, resultats, promotion, annee);

    const filename = `Deliberation_${promotion.niveau}_${promotion.designation}_${this.getAnneeLabel(annee)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  private static addPVSheet(
    workbook: XLSX.WorkBook,
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const data: any[][] = [];

    data.push(["PROCÈS-VERBAL DE DÉLIBÉRATION"]);
    data.push([]);
    data.push([`Année Académique: ${this.getAnneeLabel(annee)}`]);
    data.push([`Section: ${promotion.section?.mention || ""}`]);
    data.push([
      `Filière: ${promotion.filiere?.designation || ""} (${promotion.filiere?.sigle || ""})`,
    ]);
    data.push([`Promotion: ${promotion.niveau} - ${promotion.designation}`]);
    data.push([]);
    data.push([
      `Date de délibération: ${new Date().toLocaleDateString("fr-FR")}`,
    ]);
    data.push([]);
    data.push([
      "N°",
      "Matricule",
      "Nom Complet",
      "NCV",
      "NCNV",
      "Total Pts",
      "Max Pts",
      "%",
      "Mention",
      "Décision",
    ]);

    resultats.forEach((resultat, index) => {
      data.push([
        index + 1,
        resultat.matricule,
        resultat.studentName,
        resultat.promotion.ncv,
        resultat.promotion.ncnv,
        resultat.promotion.totalObtenu.toFixed(2),
        resultat.promotion.totalMax,
        resultat.promotion.pourcentage.toFixed(2),
        resultat.promotion.mention,
        this.getDecision(resultat.promotion.pourcentage),
      ]);
    });

    data.push([]);
    data.push([]);

    const admis = resultats.filter((r) => r.promotion.pourcentage >= 50).length;
    const ajournes = resultats.length - admis;

    data.push([`Total étudiants: ${resultats.length}`]);
    data.push([
      `Admis: ${admis} (${((admis / resultats.length) * 100).toFixed(1)}%)`,
    ]);
    data.push([
      `Ajournés: ${ajournes} (${((ajournes / resultats.length) * 100).toFixed(1)}%)`,
    ]);
    data.push([]);
    data.push([]);
    data.push(["Signatures du Jury:"]);
    data.push([]);
    data.push([
      "Président:",
      "_____________________",
      "",
      "Secrétaire:",
      "_____________________",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 8 },
      { wch: 8 },
      { wch: 12 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "PV Délibération");
  }

  private static addPalmaresSheet(
    workbook: XLSX.WorkBook,
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const data: any[][] = [];

    data.push(["PALMARÈS"]);
    data.push([]);
    data.push([
      `${promotion.niveau} - ${promotion.designation} | ${this.getAnneeLabel(annee)}`,
    ]);
    data.push([]);
    data.push([
      "Rang",
      "Matricule",
      "Nom Complet",
      "Pourcentage",
      "Mention",
      "Décision",
    ]);

    const sorted = [...resultats].sort(
      (a, b) => b.promotion.pourcentage - a.promotion.pourcentage,
    );

    sorted.forEach((resultat, index) => {
      data.push([
        index + 1,
        resultat.matricule,
        resultat.studentName,
        `${resultat.promotion.pourcentage.toFixed(2)}%`,
        this.getMentionLabel(resultat.promotion.mention),
        this.getDecision(resultat.promotion.pourcentage),
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 35 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Palmarès");
  }

  private static addGrilleSemestreSheet(
    workbook: XLSX.WorkBook,
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
    semestreDesignation: string,
  ): void {
    const data: any[][] = [];

    data.push([
      `GRILLE DE DÉLIBÉRATION - ${semestreDesignation.toUpperCase()}`,
    ]);
    data.push([]);
    data.push([
      `${promotion.niveau} - ${promotion.designation} | ${this.getAnneeLabel(annee)}`,
    ]);
    data.push([]);

    const firstStudent = resultats[0];
    const semestre = firstStudent?.semestres.find(
      (s) => s.designation === semestreDesignation,
    );

    if (!semestre) {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        semestreDesignation.substring(0, 31),
      );
      return;
    }

    const row1: any[] = ["", "", ""];
    const row2: any[] = ["", "", ""];
    const row3: any[] = ["N°", "Matricule", "Nom Complet"];

    semestre.unites.forEach((unite) => {
      unite.elements.forEach((elem) => {
        row1.push(unite.code, "", "", "", "");
        row2.push(elem.designation, "", "", "", "");
        row3.push("CC", "Exam", "Sess", "Ratt", "Final");
      });
      row1.push("");
      row2.push("");
      row3.push("Moy UE");
    });

    row1.push("", "", "", "", "", "");
    row2.push("", "", "", "", "", "");
    row3.push("Total", "Max", "%", "NCV", "NCNV", "Mention");

    data.push(row1);
    data.push(row2);
    data.push(row3);

    resultats.forEach((resultat, index) => {
      const sem = resultat.semestres.find(
        (s) => s.designation === semestreDesignation,
      );
      if (!sem) return;

      const row: any[] = [index + 1, resultat.matricule, resultat.studentName];

      sem.unites.forEach((unite) => {
        unite.elements.forEach((elem) => {
          row.push(
            elem.cc.toFixed(1),
            elem.examen.toFixed(1),
            elem.noteSession.toFixed(1),
            elem.rattrapage > 0 ? elem.rattrapage.toFixed(1) : "-",
            elem.noteFinale.toFixed(1),
          );
        });
        row.push(unite.moyenne.toFixed(2));
      });

      row.push(
        sem.totalObtenu.toFixed(2),
        sem.totalMax,
        `${sem.pourcentage.toFixed(2)}%`,
        sem.ncv,
        sem.ncnv,
        sem.mention,
      );

      data.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const cols: XLSX.ColInfo[] = [{ wch: 5 }, { wch: 12 }, { wch: 25 }];
    semestre.unites.forEach((unite) => {
      unite.elements.forEach(() => {
        cols.push({ wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 });
      });
      cols.push({ wch: 8 });
    });
    cols.push(
      { wch: 8 },
      { wch: 6 },
      { wch: 8 },
      { wch: 6 },
      { wch: 6 },
      { wch: 8 },
    );
    worksheet["!cols"] = cols;

    const sheetName = semestreDesignation.substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  private static addGrillePromotionSheet(
    workbook: XLSX.WorkBook,
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const data: any[][] = [];

    data.push(["GRILLE GÉNÉRALE DE LA PROMOTION"]);
    data.push([]);
    data.push([
      `${promotion.niveau} - ${promotion.designation} | ${this.getAnneeLabel(annee)}`,
    ]);
    data.push([]);

    const allUnites: { code: string; semestre: string }[] = [];
    resultats[0]?.semestres.forEach((sem) => {
      sem.unites.forEach((u) => {
        allUnites.push({ code: u.code, semestre: sem.designation });
      });
    });

    const headers = ["N°", "Matricule", "Nom Complet"];
    allUnites.forEach((u) => headers.push(u.code));
    headers.push("Total", "Max", "%", "NCV", "NCNV", "Mention", "Décision");
    data.push(headers);

    resultats.forEach((resultat, index) => {
      const row: any[] = [index + 1, resultat.matricule, resultat.studentName];

      resultat.semestres.forEach((sem) => {
        sem.unites.forEach((u) => {
          row.push(u.moyenne.toFixed(2));
        });
      });

      row.push(
        resultat.promotion.totalObtenu.toFixed(2),
        resultat.promotion.totalMax,
        `${resultat.promotion.pourcentage.toFixed(2)}%`,
        resultat.promotion.ncv,
        resultat.promotion.ncnv,
        resultat.promotion.mention,
        this.getDecision(resultat.promotion.pourcentage),
      );

      data.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const cols: XLSX.ColInfo[] = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];
    allUnites.forEach(() => cols.push({ wch: 10 }));
    cols.push(
      { wch: 10 },
      { wch: 8 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
    );
    worksheet["!cols"] = cols;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Grille Promotion");
  }

  public static exportPalmaresOnly(
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const workbook = XLSX.utils.book_new();
    this.addPalmaresSheet(workbook, resultats, promotion, annee);
    const filename = `Palmares_${promotion.niveau}_${promotion.designation}_${this.getAnneeLabel(annee)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }

  public static exportGrilleOnly(
    resultats: ResultatEtudiant[],
    promotion: PromotionInfo,
    annee: AnneeInfo,
  ): void {
    const workbook = XLSX.utils.book_new();

    const semestresSet = new Set<string>();
    resultats.forEach((r) =>
      r.semestres.forEach((s) => semestresSet.add(s.designation)),
    );
    const semestres = Array.from(semestresSet);

    semestres.forEach((semestreDesignation) => {
      this.addGrilleSemestreSheet(
        workbook,
        resultats,
        promotion,
        annee,
        semestreDesignation,
      );
    });

    this.addGrillePromotionSheet(workbook, resultats, promotion, annee);

    const filename = `Grille_${promotion.niveau}_${promotion.designation}_${this.getAnneeLabel(annee)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }
}
