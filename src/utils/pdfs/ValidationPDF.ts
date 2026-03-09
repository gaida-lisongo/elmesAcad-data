import PDFManager from "./PDFManager";

export interface ReleveElementData {
  designation: string;
  credit: number;
  cc: number;
  examen: number;
  rattrapage: number;
}

export interface ReleveUniteData {
  unite: string;
  credit: number;
  code: string;
  elements: ReleveElementData[];
}

export interface ReleveSyntheseData {
  totalObtenu: number;
  totalMax: number;
  pourcentage: number;
  mention: string;
  ncv: number;
  ncnv: number;
}

export interface RelevePDFPayload {
  nomComplet: string;
  matricule: string;
  sexe: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  section: string;
  filiere: string;
  promotion: string;
  anneeAcademique: string;
  notes: ReleveUniteData[];
  synthese?: ReleveSyntheseData;
}

const computeElementNote = (element: ReleveElementData): number => {
  const session = element.cc + element.examen;
  return session > element.rattrapage ? session : element.rattrapage;
};

const computeUniteAverage = (unite: ReleveUniteData): number => {
  const totalCredits = unite.elements.reduce(
    (sum, element) => sum + element.credit,
    0,
  );
  if (totalCredits <= 0) return 0;

  const weightedTotal = unite.elements.reduce(
    (sum, element) => sum + computeElementNote(element) * element.credit,
    0,
  );

  return Number((weightedTotal / totalCredits).toFixed(2));
};

const buildSyntheseFromNotes = (
  notes: ReleveUniteData[],
): ReleveSyntheseData => {
  let totalObtenu = 0;
  let totalMax = 0;
  let ncv = 0;
  let ncnv = 0;

  notes.forEach((unite) => {
    const moyenneUnite = computeUniteAverage(unite);
    const uniteCredit = Number(unite.credit) || 0;

    totalObtenu += moyenneUnite * uniteCredit;
    totalMax += 20 * uniteCredit;

    if (moyenneUnite >= 10) {
      ncv += uniteCredit;
    } else {
      ncnv += uniteCredit;
    }
  });

  const pourcentage =
    totalMax > 0 ? Number(((totalObtenu / totalMax) * 100).toFixed(2)) : 0;

  let mention = "F";
  if (pourcentage >= 90) mention = "A";
  else if (pourcentage >= 80) mention = "B";
  else if (pourcentage >= 70) mention = "C";
  else if (pourcentage >= 60) mention = "D";
  else if (pourcentage >= 50) mention = "E";

  return {
    totalObtenu: Number(totalObtenu.toFixed(2)),
    totalMax,
    pourcentage,
    mention,
    ncv,
    ncnv,
  };
};

export default class ValidationPDF extends PDFManager {
  studentNote: RelevePDFPayload;

  constructor(payload?: RelevePDFPayload) {
    super();

    this.studentNote = {
      nomComplet: "Jean Dupont",
      matricule: "2021001",
      sexe: "Masculin",
      dateNaissance: "01/01/2000",
      lieuNaissance: "Kinshasa",
      nationalite: "Congolaise",
      section: "BTP",
      filiere: "Construction Industrielle et Batiments",
      promotion: "Licence 1",
      anneeAcademique: "2023-2024",
      notes: [
        {
          unite: "Francais",
          credit: 5,
          code: "FR101",
          elements: [
            {
              designation: "Expression Orale et Ecrite",
              credit: 2,
              cc: 5,
              examen: 7,
              rattrapage: 10,
            },
            {
              designation: "Logique et Argumentation",
              credit: 2,
              cc: 8,
              examen: 8,
              rattrapage: 11,
            },
            {
              designation: "Grammaire",
              credit: 1,
              cc: 4,
              examen: 5,
              rattrapage: 8,
            },
          ],
        },
        {
          unite: "Mathematiques",
          credit: 5,
          code: "MA101",
          elements: [
            {
              designation: "Algebre",
              credit: 2,
              cc: 9,
              examen: 12,
              rattrapage: 13,
            },
            {
              designation: "Geometrie",
              credit: 2,
              cc: 10,
              examen: 7,
              rattrapage: 11,
            },
            {
              designation: "Calcul Numérique",
              credit: 1,
              cc: 7,
              examen: 6,
              rattrapage: 18,
            },
          ],
        },
      ],
    };

    if (payload) {
      this.setStudentData(payload);
    }
  }

  setStudentData(payload: RelevePDFPayload) {
    this.studentNote = {
      ...payload,
      notes: payload.notes || [],
      synthese: payload.synthese || buildSyntheseFromNotes(payload.notes || []),
    };
  }

  renderStudentSection() {
    const {
      nomComplet,
      matricule,
      sexe,
      dateNaissance,
      lieuNaissance,
      nationalite,
      promotion,
      filiere,
      anneeAcademique,
    } = this.studentNote;

    return [
      {
        columns: [
          {
            width: "50%",
            text: "",
          },
          {
            width: "50%",
            stack: [
              { text: `${nomComplet}\n(${matricule})`, bold: true },
              {
                text: `Promotion: ${promotion}`,
              },
              {
                text: `Annee Académique: ${anneeAcademique}`,
              },
            ],
          },
        ],
      },
    ];
  }

  renderDocumentInfoSection() {
    const { section, filiere, promotion, anneeAcademique } = this.studentNote;

    return [
      {
        margin: [0, 8, 0, 0],
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: `SECTION : ${section}`, bold: true },
              { text: `FILIERE : ${filiere}`, bold: true },
            ],
            [
              { text: `PROMOTION : ${promotion}`, bold: true },
              { text: `ANNEE ACADEMIQUE : ${anneeAcademique}`, bold: true },
            ],
          ],
        },
      },
    ];
  }

  generateAppreciation(moyenne: number) {
    if (moyenne >= 16) return "EXCELLENT";
    if (moyenne >= 14) return "TRÈS BIEN";
    if (moyenne >= 12) return "BIEN";
    if (moyenne >= 10) return "SATISFAISANT";
    return "INSUFFISANT";
  }

  renderNotesSection() {
    const { notes } = this.studentNote;

    const body: any[] = [
      [
        {
          text: "DESIGNATION",
          bold: true,
          fontsize: 12,
          margin: [0, 4, 0, 4],
        },
        {
          text: "CREDIT",
          bold: true,
          fontsize: 12,
          alignment: "center",
          margin: [0, 4, 0, 4],
        },
        {
          text: "OBS",
          bold: true,
          fontsize: 12,
          alignment: "center",
          margin: [0, 4, 0, 4],
        },
      ],
    ];

    notes.forEach((noteUnite) => {
      noteUnite.elements.forEach((element) => {
        const note = computeElementNote(element);

        // body.push([
        //   { text: element.designation },
        //   { text: String(element.cc), alignment: "center" },
        //   { text: String(element.examen), alignment: "center" },
        //   { text: String(element.rattrapage), alignment: "center" },
        //   { text: String(note), alignment: "center" },
        //   { text: String(element.credit), alignment: "center" },
        //   { text: note >= 10 ? "V" : "NV", alignment: "center" },
        // ]);
      });

      const totalCredits = noteUnite.elements.reduce(
        (sum, element) => sum + element.credit,
        0,
      );
      const weightedTotal = noteUnite.elements.reduce(
        (sum, element) => sum + computeElementNote(element) * element.credit,
        0,
      );
      const moyenneUnite =
        totalCredits > 0
          ? Number((weightedTotal / totalCredits).toFixed(2))
          : 0;

      body.push([
        {
          text: `${noteUnite.unite} (${noteUnite.code})`,
          margin: [0, 1, 0, 1],
        },
        { text: String(totalCredits), alignment: "center" },
        {
          text: moyenneUnite >= 10 ? "V" : "NV",
          alignment: "center",
        },
      ]);
    });

    return [
      {
        margin: [0, 12, 0, 0],
        table: {
          headerRows: 1,
          widths: ["*", 50, 40],
          body,
        },
        layout: "lightHorizontalLines",
      },
    ];
  }

  renderSyntheseSection() {
    const synthese =
      this.studentNote.synthese ||
      buildSyntheseFromNotes(this.studentNote.notes);

    const totalCredits = synthese.ncv + synthese.ncnv;
    const isAdjourne =
      totalCredits > 0 ? (synthese.ncv / totalCredits) * 100 < 75 : false;
    const moyenneSur20 =
      synthese.totalMax > 0
        ? Number(((synthese.totalObtenu / synthese.totalMax) * 20).toFixed(2))
        : 0;

    return [
      {
        columns: [
          {
            width: "50%",
            table: {
              widths: ["*", 60],
              body: [
                [
                  {
                    text: "SYNTHÈSE",
                    bold: true,
                    fillColor: "#eeeeee",
                    colSpan: 2,
                    fontSize: 12,
                  },
                  {},
                ],
                [
                  { text: "CREDITS VALIDES (NCV)", fontSize: 10 },
                  {
                    text: String(synthese.ncv),
                    fontSize: 10,
                    alignment: "center",
                  },
                ],
                [
                  { text: "CREDITS NON VALIDES (NCNV)", fontSize: 10 },
                  {
                    text: String(synthese.ncnv),
                    fontSize: 10,
                    alignment: "center",
                  },
                ],
                [
                  { text: "MOYENNE", fontSize: 10 },
                  {
                    text: String(moyenneSur20),
                    fontSize: 10,
                    alignment: "center",
                  },
                ],
                [
                  { text: "MENTION", fontSize: 10 },
                  {
                    text:
                      synthese.mention ||
                      this.generateAppreciation(moyenneSur20),
                    fontSize: 10,
                    alignment: "center",
                  },
                ],
                [
                  {
                    text: "DÉCISION",
                    fillColor: "#eeeeee",
                    bold: true,
                    fontSize: 12,
                  },
                  {
                    text: isAdjourne ? "AJOURNÉ" : "VALIDÉ",
                    bold: true,
                    color: isAdjourne ? "red" : "green",
                    alignment: "center",
                    fillColor: "#eeeeee",
                    fontSize: 12,
                  },
                ],
              ],
            },
            margin: [0, 12, 0, 0],
          },
          {
            width: "50%",
            margin: [0, 42, 0, 0],
            stack: [
              {
                text: `Fait à Kinshasa, le ___/___/____`,
                fontSize: 10,
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
              {
                text: "Le Chef de Section",
                fontSize: 10,
                alignment: "center",
                bold: true,
              },
            ],
          },
        ],
      },
    ];
  }

  async render(
    fileName?: string,
    metadata?: {
      reference?: string;
      signatureInfo?: { nom?: string; fonction?: string };
    },
  ) {
    await this.whenReady();

    const studentSection = this.renderStudentSection();
    const documentInfoSection = this.renderDocumentInfoSection();
    const notesSection = this.renderNotesSection();
    const syntheseSection = this.renderSyntheseSection();

    const docDefinition = this.renderDocument(
      "FICHE DE VALIDATION",
      [
        ...studentSection,
        // ...documentInfoSection,
        ...notesSection,
        ...syntheseSection,
      ],
      {
        reference: metadata?.reference || `FV-${Date.now()}`,
        dateGeneration: new Date().toISOString(),
        signatureInfo: metadata?.signatureInfo || {
          fonction: "Le Chef de Section",
        },
      },
    );

    const resolvedFileName =
      fileName ||
      `Fiche_${this.studentNote.nomComplet.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

    try {
      await PDFManager.generatePDF(docDefinition, resolvedFileName);
      console.log("PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
    }
  }
}
