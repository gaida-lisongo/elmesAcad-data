import pdfmake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { text } from "stream/consumers";

const pdfFontsWithVfs = pdfFonts as unknown as {
  vfs?: Record<string, string>;
};

(pdfmake as any).vfs =
  pdfFontsWithVfs.vfs || (pdfFonts as unknown as Record<string, string>);
const univ = process.env.NEXT_PUBLIC_UNIV || "Université de Kinshasa";
const logoUrl = `logo_${process.env.NEXT_PUBLIC_SECTION?.toLowerCase() || "inbtp"}`;

const getImageBase64 = (designation: string): Promise<string> => {
  const imagePath = `/images/logo/${designation.toLowerCase()}.jpg`;
  console.log("Loading image from:", imagePath);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Permet de charger des images depuis un autre domaine
    img.onload = () => {
      const canvasSize = 240;
      const borderWidth = 6;
      const borderColor = "#1a2a6c";
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }

      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      const destinationSize = canvasSize - borderWidth * 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvasSize / 2,
        canvasSize / 2,
        destinationSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        borderWidth,
        borderWidth,
        destinationSize,
        destinationSize,
      );
      ctx.restore();

      ctx.beginPath();
      ctx.arc(
        canvasSize / 2,
        canvasSize / 2,
        canvasSize / 2 - borderWidth / 2,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = imagePath;
  });
};

export default class PDFManager {
  private logoBase64: string | null = null;
  private logoUnivBase64: string | null = null;
  private readonly initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  async whenReady() {
    await this.initPromise;
  }

  async init() {
    try {
      const logoBase64 = await getImageBase64(logoUrl);
      this.logoBase64 = logoBase64;

      const logoUniv = await getImageBase64("logo_inbtp");
      this.logoUnivBase64 = logoUniv;
    } catch (error) {
      try {
        const fallbackLogo = await getImageBase64("logo_inbtp");
        this.logoBase64 = fallbackLogo;
      } catch (fallbackError) {
        this.logoBase64 = null;
        console.error("Erreur lors du chargement du logo:", error);
        console.error(
          "Erreur lors du chargement du logo par défaut:",
          fallbackError,
        );
      }
    }
  }

  renderDocument(
    title: string,
    content: any,
    metadata?: {
      reference?: string;
      dateGeneration?: string;
      signatureInfo?: {
        nom?: string;
        fonction?: string;
      };
    },
  ) {
    const hasLogo = Boolean(this.logoBase64);

    const docDefinition = {
      content: [
        this.renderHeader(title, hasLogo, metadata),
        this.renderContent(content),
        // ...(metadata?.signatureInfo ? [this.renderSignature(metadata)] : []),
      ],
      footer: (currentPage: number, pageCount: number) =>
        this.renderFooter(currentPage, pageCount),
      styles: {
        header: { fontSize: 18, bold: true },
        content: { fontSize: 12 },
        footer: { fontSize: 10, italics: true },
        countryName: { fontSize: 10, bold: true, color: "#1a2a6c" },
        ministryName: { fontSize: 8, italics: true, margin: [0, 2, 0, 2] },
        univName: {
          fontSize: 12,
          bold: true,
          color: "#050505",
          margin: [0, 2, 0, 5],
        },
        headerTitle: {
          fontSize: 12,
          bold: true,
          decoration: "underline",
          color: "black",
        },
        qrLabel: { fontSize: 8, italics: true, alignment: "center" },
        signatureText: { fontSize: 10, bold: true },
      },
    };

    if (hasLogo) {
      (docDefinition as any).images = {
        logo: this.logoBase64,
      };
    }

    return docDefinition;
  }

  static async generatePDF(docDefinition: any, fileName: string) {
    const pdfDocGenerator = pdfmake.createPdf(docDefinition);
    pdfDocGenerator.download(fileName);
  }

  generateQRCode(data: string, style: any): { qr: string; fit: number } {
    return {
      qr: data,
      fit: 80,
      ...style,
    };
  }

  renderHeader(
    title: string,
    includeLogo: boolean,
    metadata?: {
      reference?: string;
      dateGeneration?: string;
      signatureInfo?: {
        nom?: string;
        fonction?: string;
      };
    },
  ) {
    const columns: any[] = [];
    // const qrCodeUrl = metadata?.reference
    //   ? `${process.env.NEXT_PUBLIC_APP_URL || "https://app.example.com"}/verify/${metadata.reference}`
    //   : "https://example.com/document/verification";

    // const hasLogoUniv = Boolean(this.logoUnivBase64);

    // // QR Code avec date
    // const qrStack: any[] = [];
    // if (metadata?.reference) {
    //   qrStack.push(this.generateQRCode(qrCodeUrl, {}));
    //   qrStack.push({
    //     text: `Réf: ${metadata.reference.slice(0, 12)}...`,
    //     style: "qrLabel",
    //     margin: [0, 2, 0, 0],
    //   });
    // }
    // if (metadata?.dateGeneration) {
    //   qrStack.push({
    //     text: new Date(metadata.dateGeneration).toLocaleDateString("fr-FR"),
    //     style: "qrLabel",
    //   });
    // }

    // if (qrStack.length > 0) {
    //   columns.push({
    //     width: "15%",
    //     stack: qrStack,
    //     alignment: "left",
    //   });
    // } else if (hasLogoUniv) {
    //   columns.push({
    //     width: "15%",
    //     image: this.logoUnivBase64,
    //     fit: [80, 80],
    //     alignment: "left",
    //   });
    // } else {
    //   columns.push({ width: "15%", text: "" });
    // }

    // Centre: Infos officielles
    columns.push({
      width: "50%",
      stack: [
        { text: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", style: "countryName" },
        {
          text: "Ministère de l'Enseignement Supérieur, Universitaire, Recherche Scientifique et Innovations",
          fontSize: 12,
          margin: [0, 2, 0, 2],
        },
        {
          text: univ.toUpperCase(),
          style: "univName",
          margin: [0, 2, 0, 5],
        },
        includeLogo
          ? {
              width: "15%",
              image: "logo",
              fit: [80, 80],
              alignment: "center",
            }
          : null,

        `Section : ${process.env.NEXT_PUBLIC_SECTION || "GR"}`,
      ],
      alignment: "center",
    });

    columns.push({
      width: "50%",
      stack: [
        { text: title, alignment: "right", margin: [0, 0, 0, 10] },
        {
          text: `N/Ref: ${metadata?.reference || "-"}`,
          alignment: "right",
          margin: [0, 2, 0, 50],
        },
        {
          qr: `https://verif-document.example.com/${metadata?.reference || "unknown"}`,
          fit: 100,
          alignment: "right",
        },
      ],
    }); // Colonne vide pour espacer le logo de droite

    // Droite: Logo section
    // if (includeLogo) {
    //   columns.push({
    //     width: "15%",
    //     image: "logo",
    //     fit: [80, 80],
    //     alignment: "right",
    //   });
    // } else {
    //   columns.push({ width: "15%", text: "" });
    // }

    return {
      columns,
      margin: [0, 0, 0, 0],
    };
  }

  renderSignature(metadata: {
    reference?: string;
    dateGeneration?: string;
    signatureInfo?: {
      nom?: string;
      fonction?: string;
    };
  }) {
    const dateStr = metadata.dateGeneration
      ? new Date(metadata.dateGeneration).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");

    return {
      margin: [0, 5, 0, 0],
      columns: [
        { width: "50%", text: "" },
        {
          width: "50%",
          stack: [
            {
              text: `Fait à Kinshasa, le ${dateStr}`,
              fontSize: 10,
              margin: [0, 0, 0, 10],
            },
            {
              text: metadata.signatureInfo?.fonction || "Le Chef de Section",
              style: "signatureText",
              margin: [0, 0, 0, 0],
            },
          ],
          alignment: "center",
        },
      ],
    };
  }
  //   renderHeader(title: string, includeLogo: boolean) {
  //     //generate qr code with url of the document
  //     const qrCodeUrl = "https://example.com/document/12345";

  //     const qrCodeDataUrl = this.generateQRCode(qrCodeUrl);

  //     const columns: any[] = [
  //       qrCodeDataUrl,
  //       {
  //         stack: [
  //           { text: "République Démocratique du Congo", style: "subheader" },
  //           {
  //             text: "Ministère de l'Enseignement Supérieur, Universitaire, Recherche Scientifique et Innovations",
  //             style: "subheader",
  //           },
  //           {
  //             text: univ,
  //             style: "subheader",
  //           },
  //           {
  //             text: title,
  //             style: "header",
  //           },
  //         ],
  //       },
  //     ];

  //     if (includeLogo) {
  //       columns.push({
  //         image: "logo",
  //         width: 80,
  //         height: 80,
  //       });
  //     }

  //     return {
  //       columns,
  //     };
  //   }

  renderContent(content: any) {
    const baseStyle = {
      style: "content",
      margin: [0, 10, 0, 10],
    };

    if (Array.isArray(content)) {
      return {
        ...baseStyle,
        stack: content,
      };
    }

    if (typeof content === "object" && content !== null) {
      return {
        ...baseStyle,
        stack: [content],
      };
    }

    return {
      ...baseStyle,
      text: String(content ?? ""),
    };
  }

  renderFooter(page: number, pageCount: number) {
    return {
      text: `NB: Ce document est délivré à l'intéressé(e) pour servir et valoir ce que de droit.\nAv. de la Montage n°21, Q. Joli Parc, Commune de Ngaliema   Site web : ww.inbtp.ac.cd\nEmail: btp@inbtp.net | Tel: +243853102426`,
      style: "footer",
      alignment: "center",
      margin: [0, 5, 0, 0],
    };
  }
}
