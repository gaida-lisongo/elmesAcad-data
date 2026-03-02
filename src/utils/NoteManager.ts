export interface ElementNote {
  _id: string;
  designation: string;
  credit: number;
  cc: number;
  examen: number;
  rattrapage: number;
}

export interface UniteNote {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  elements: ElementNote[];
}

export interface SemestreNote {
  _id: string;
  designation: string;
  unites: UniteNote[];
}

export interface NotesEtudiant {
  studentId: string;
  studentName: string;
  matricule: string;
  semestres: SemestreNote[];
}

export interface ElementResultat {
  _id: string;
  designation: string;
  credit: number;
  cc: number;
  examen: number;
  noteSession: number;
  rattrapage: number;
  noteFinale: number;
}

export interface UniteResultat {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  moyenne: number;
  isValide: boolean;
  elements: ElementResultat[];
}

export interface SemestreResultat {
  _id: string;
  designation: string;
  ncv: number;
  ncnv: number;
  totalObtenu: number;
  totalMax: number;
  pourcentage: number;
  mention: string;
  unites: UniteResultat[];
}

export interface PromotionResultat {
  totalObtenu: number;
  totalMax: number;
  pourcentage: number;
  mention: string;
  ncv: number;
  ncnv: number;
}

export interface ResultatEtudiant {
  studentId: string;
  studentName: string;
  matricule: string;
  semestres: SemestreResultat[];
  promotion: PromotionResultat;
}

export class NoteManager {
  private static getMention(pourcentage: number): string {
    if (pourcentage >= 90) return "A";
    if (pourcentage >= 80) return "B";
    if (pourcentage >= 70) return "C";
    if (pourcentage >= 60) return "D";
    if (pourcentage >= 50) return "E";
    return "F";
  }

  private static calculerNoteFinaleElement(element: ElementNote): number {
    const noteExamen = element.examen ?? 0;
    const noteCC = element.cc ?? 0;
    const noteRattrapage = element.rattrapage ?? 0;

    const noteSession = noteCC + noteExamen;
    const noteFinale = Math.max(noteSession, noteRattrapage);

    return Math.round(noteFinale * 100) / 100;
  }

  private static calculerMoyenneUnite(unite: UniteNote): {
    moyenne: number;
    elements: ElementResultat[];
  } {
    if (!unite.elements || unite.elements.length === 0) {
      return { moyenne: 0, elements: [] };
    }

    let totalPoints = 0;
    let totalCredits = 0;
    const elementsResultat: ElementResultat[] = [];

    for (const element of unite.elements) {
      const cc = element.cc ?? 0;
      const examen = element.examen ?? 0;
      const rattrapage = element.rattrapage ?? 0;
      const noteSession = cc + examen;
      const noteFinale = Math.max(noteSession, rattrapage);
      const credit = element.credit || 1;

      totalPoints += noteFinale * credit;
      totalCredits += credit;

      elementsResultat.push({
        _id: element._id,
        designation: element.designation,
        credit: credit,
        cc: Math.round(cc * 100) / 100,
        examen: Math.round(examen * 100) / 100,
        noteSession: Math.round(noteSession * 100) / 100,
        rattrapage: Math.round(rattrapage * 100) / 100,
        noteFinale: Math.round(noteFinale * 100) / 100,
      });
    }
    const moyenne = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return {
      moyenne: Math.round(moyenne * 100) / 100,
      elements: elementsResultat,
    };
  }

  private static calculerResultatSemestre(
    semestre: SemestreNote,
  ): SemestreResultat {
    let ncv = 0;
    let ncnv = 0;
    let totalObtenu = 0;
    let totalMax = 0;
    const unitesResultat: UniteResultat[] = [];

    for (const unite of semestre.unites) {
      const { moyenne, elements } = this.calculerMoyenneUnite(unite);

      const credit = unite.credit || 0;
      const isValide = moyenne >= 10;

      if (isValide) {
        ncv += credit;
      } else {
        ncnv += credit;
      }

      totalObtenu += moyenne * credit;
      totalMax += 20 * credit;

      unitesResultat.push({
        _id: unite._id,
        code: unite.code,
        designation: unite.designation,
        credit: credit,
        moyenne: moyenne,
        isValide: isValide,
        elements: elements,
      });
    }

    const pourcentage = totalMax > 0 ? (totalObtenu / totalMax) * 100 : 0;
    const pourcentageArrondi = Math.round(pourcentage * 100) / 100;

    return {
      _id: semestre._id,
      designation: semestre.designation,
      ncv,
      ncnv,
      totalObtenu: Math.round(totalObtenu * 100) / 100,
      totalMax,
      pourcentage: pourcentageArrondi,
      mention: this.getMention(pourcentageArrondi),
      unites: unitesResultat,
    };
  }

  public static calculerResultatEtudiant(
    notesEtudiant: NotesEtudiant,
  ): ResultatEtudiant {
    const semestresResultat: SemestreResultat[] = [];
    let totalObtenuPromo = 0;
    let totalMaxPromo = 0;
    let ncvPromo = 0;
    let ncnvPromo = 0;

    for (const semestre of notesEtudiant.semestres) {
      const resultatSemestre = this.calculerResultatSemestre(semestre);
      semestresResultat.push(resultatSemestre);

      totalObtenuPromo += resultatSemestre.totalObtenu;
      totalMaxPromo += resultatSemestre.totalMax;
      ncvPromo += resultatSemestre.ncv;
      ncnvPromo += resultatSemestre.ncnv;
    }

    const pourcentagePromo =
      totalMaxPromo > 0 ? (totalObtenuPromo / totalMaxPromo) * 100 : 0;
    const pourcentagePromoArrondi = Math.round(pourcentagePromo * 100) / 100;

    return {
      studentId: notesEtudiant.studentId,
      studentName: notesEtudiant.studentName,
      matricule: notesEtudiant.matricule,
      semestres: semestresResultat,
      promotion: {
        totalObtenu: Math.round(totalObtenuPromo * 100) / 100,
        totalMax: totalMaxPromo,
        pourcentage: pourcentagePromoArrondi,
        mention: this.getMention(pourcentagePromoArrondi),
        ncv: ncvPromo,
        ncnv: ncnvPromo,
      },
    };
  }

  public static calculerResultatsPromotion(
    notesEtudiants: NotesEtudiant[],
  ): ResultatEtudiant[] {
    return notesEtudiants.map((notes) => this.calculerResultatEtudiant(notes));
  }

  public static classerParPourcentage(
    resultats: ResultatEtudiant[],
  ): ResultatEtudiant[] {
    return [...resultats].sort(
      (a, b) => b.promotion.pourcentage - a.promotion.pourcentage,
    );
  }

  public static getMoyennePromotion(pourcentage: number): number {
    return Math.round((pourcentage / 100) * 20 * 100) / 100;
  }

  public static getPourcentageFromMoyenne(moyenne: number): number {
    return Math.round((moyenne / 20) * 100 * 100) / 100;
  }

  public static getMentionFromMoyenne(moyenne: number): string {
    const pourcentage = this.getPourcentageFromMoyenne(moyenne);
    return this.getMention(pourcentage);
  }
}
