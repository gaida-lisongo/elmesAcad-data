import PDFManager from "./PDFManager";

export interface BulletinElementData {
  designation: string;
  credit: number;
  cc: number;
  examen: number;
  rattrapage: number;
}

export interface BulletinUniteData {
  unite: string;
  credit: number;
  code: string;
  elements: BulletinElementData[];
}

export interface BulletinSemestreData {
  designation: string;
  unites: BulletinUniteData[];
}

export interface BulletinSyntheseSemestreData {
  totalObtenu: number;
  totalMax: number;
  pourcentage: number;
  mention: string;
  ncv: number;
  ncnv: number;
}

export interface BulletinPDFPayload {
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
  semestre: BulletinSemestreData;
  synthese?: BulletinSyntheseSemestreData;
}

const computeElementNote = (element: BulletinElementData): number => {
  const session = element.cc + element.examen;
  return session > element.rattrapage ? session : element.rattrapage;
};

const computeUniteAverage = (unite: BulletinUniteData): number => {
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

const buildSyntheseSemestre = (
  semestre: BulletinSemestreData,
): BulletinSyntheseSemestreData => {
  let totalObtenu = 0;
  let totalMax = 0;
  let ncv = 0;
  let ncnv = 0;

  semestre.unites.forEach((unite) => {
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

export default class BulletinPDF extends PDFManager {
  bulletinData: BulletinPDFPayload;

  constructor(payload?: BulletinPDFPayload) {
    super();

    this.bulletinData = {
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
      semestre: {
        designation: "Semestre 1",
        unites: [],
      },
    };

    if (payload) {
      this.setBulletinData(payload);
    }
  }

  setBulletinData(payload: BulletinPDFPayload) {
    this.bulletinData = {
      ...payload,
      semestre: payload.semestre,
      synthese: payload.synthese || buildSyntheseSemestre(payload.semestre),
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
    } = this.bulletinData;

    return [
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: `NOM COMPLET : ${nomComplet}`, bold: true, fontSize: 10 },
              { text: `MATRICULE : ${matricule}`, bold: true, fontSize: 10 },
            ],
            [
              { text: `SEXE : ${sexe}`, bold: true, fontSize: 10 },
              {
                text: `DATE DE NAISSANCE : ${new Date(
                  dateNaissance,
                ).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}`,
                bold: true,
                fontSize: 10,
              },
            ],
            [
              {
                text: `LIEU DE NAISSANCE : ${lieuNaissance}`,
                bold: true,
                fontSize: 10,
              },
              {
                text: `NATIONALITE : ${nationalite}`,
                bold: true,
                fontSize: 10,
              },
            ],
          ],
        },
        layout: "noBorders",
      },
    ];
  }

  renderDocumentInfoSection() {
    const { section, filiere, promotion, anneeAcademique, semestre } =
      this.bulletinData;

    return [
      {
        margin: [0, 0, 0, 0],
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: `SECTION : ${section}`, bold: true, fontSize: 10 },
              { text: `FILIERE : ${filiere}`, bold: true, fontSize: 10 },
            ],
            [
              { text: `PROMOTION : ${promotion}`, bold: true, fontSize: 10 },
              {
                text: `ANNEE ACADEMIQUE : ${anneeAcademique}`,
                bold: true,
                fontSize: 10,
              },
            ],
            [
              {
                text: `SEMESTRE : ${semestre.designation}`,
                bold: true,
                fontSize: 11,
                colSpan: 2,
                fillColor: "#f0f0f0",
              },
              {},
            ],
          ],
        },
        layout: "noBorders",
      },
    ];
  }

  renderNotesSection() {
    const { semestre } = this.bulletinData;

    const body: any[] = [
      [
        {
          text: "DESIGNATION",
          bold: true,
          fillColor: "#eeeeee",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "CC",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "EXA",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "RAT",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "NOTE",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "CREDIT",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
        {
          text: "OBS",
          bold: true,
          fillColor: "#eeeeee",
          alignment: "center",
          margin: [0, 4, 0, 4],
          fontSize: 9,
        },
      ],
    ];

    semestre.unites.forEach((unite) => {
      // Éléments constitutifs en détail
      unite.elements.forEach((element) => {
        const note = computeElementNote(element);

        body.push([
          { text: element.designation, fontSize: 9 },
          { text: String(element.cc), alignment: "center", fontSize: 9 },
          { text: String(element.examen), alignment: "center", fontSize: 9 },
          {
            text: String(element.rattrapage),
            alignment: "center",
            fontSize: 9,
          },
          { text: String(note), alignment: "center", fontSize: 9 },
          { text: String(element.credit), alignment: "center", fontSize: 9 },
          {
            text: note >= 10 ? "V" : "NV",
            alignment: "center",
            fontSize: 9,
          },
        ]);
      });

      // Total de l'unité
      const totalCredits = unite.elements.reduce(
        (sum, element) => sum + element.credit,
        0,
      );
      const weightedTotal = unite.elements.reduce(
        (sum, element) => sum + computeElementNote(element) * element.credit,
        0,
      );
      const moyenneUnite =
        totalCredits > 0
          ? Number((weightedTotal / totalCredits).toFixed(2))
          : 0;

      body.push([
        {
          text: `TOTAL UE: ${unite.unite} (${unite.code})`,
          bold: true,
          colSpan: 4,
          fillColor: "#e8e8e8",
          margin: [0, 3, 0, 3],
          fontSize: 9,
        },
        {},
        {},
        {},
        {
          text: String(moyenneUnite),
          bold: true,
          alignment: "center",
          fontSize: 9,
        },
        {
          text: String(totalCredits),
          bold: true,
          alignment: "center",
          fontSize: 9,
        },
        {
          text: moyenneUnite >= 10 ? "V" : "NV",
          bold: true,
          alignment: "center",
          fontSize: 9,
        },
      ]);
    });

    return [
      {
        margin: [0, 5, 0, 0],
        table: {
          headerRows: 1,
          widths: ["*", 35, 35, 35, 45, 45, 35],
          body,
        },
        layout: "lightHorizontalLines",
      },
    ];
  }

  renderSyntheseSemestreSection() {
    const synthese =
      this.bulletinData.synthese ||
      buildSyntheseSemestre(this.bulletinData.semestre);

    const totalCredits = synthese.ncv + synthese.ncnv;
    const isAdjourne =
      totalCredits > 0 ? (synthese.ncv / totalCredits) * 100 < 50 : false;
    const moyenneSur20 =
      synthese.totalMax > 0
        ? Number(((synthese.totalObtenu / synthese.totalMax) * 20).toFixed(2))
        : 0;

    return [
      {
        margin: [0, 12, 0, 0],
        table: {
          widths: ["*", 120],
          body: [
            [
              {
                text: `SYNTHÈSE ${this.bulletinData.semestre.designation.toUpperCase()}`,
                bold: true,
                fillColor: "#eeeeee",
                colSpan: 2,
                fontSize: 10,
              },
              {},
            ],
            [
              { text: "Total Obtenu", fontSize: 9 },
              { text: String(synthese.totalObtenu), fontSize: 9 },
            ],
            [
              { text: "Total Maximum", fontSize: 9 },
              { text: String(synthese.totalMax), fontSize: 9 },
            ],
            [
              { text: "Pourcentage", fontSize: 9 },
              { text: `${synthese.pourcentage}%`, fontSize: 9 },
            ],
            [
              { text: "Moyenne /20", fontSize: 9 },
              { text: String(moyenneSur20), fontSize: 9 },
            ],
            [
              { text: "Mention", fontSize: 9 },
              { text: synthese.mention, fontSize: 9 },
            ],
            [
              { text: "Crédits Validés (NCV)", fontSize: 9 },
              { text: String(synthese.ncv), fontSize: 9 },
            ],
            [
              { text: "Crédits Non Validés (NCNV)", fontSize: 9 },
              { text: String(synthese.ncnv), fontSize: 9 },
            ],
            [
              { text: "DÉCISION SEMESTRE", bold: true, fontSize: 9 },
              {
                text: isAdjourne ? "AJOURNÉ" : "VALIDÉ",
                bold: true,
                color: isAdjourne ? "red" : "green",
                alignment: "center",
                fontSize: 9,
              },
            ],
          ],
        },
        layout: "lightHorizontalLines",
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
    const syntheseSection = this.renderSyntheseSemestreSection();

    const docDefinition = this.renderDocument(
      `BULLETIN - ${this.bulletinData.semestre.designation.toUpperCase()}`,
      [
        ...studentSection,
        ...documentInfoSection,
        ...notesSection,
        ...syntheseSection,
      ],
      {
        reference: metadata?.reference || `BUL-${Date.now()}`,
        dateGeneration: new Date().toISOString(),
        signatureInfo: metadata?.signatureInfo || {
          fonction: "Le Chef de Section",
        },
      },
    );

    const resolvedFileName =
      fileName ||
      `Bulletin_${this.bulletinData.semestre.designation.replace(/\s+/g, "_")}_${this.bulletinData.nomComplet.replace(/\s+/g, "_")}_${Date.now()}.pdf`;

    try {
      await PDFManager.generatePDF(docDefinition, resolvedFileName);
      console.log("Bulletin PDF généré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la génération du bulletin PDF :", error);
    }
  }
}
