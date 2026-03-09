import pdfmake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

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

  renderDocument(title: string, content: string) {
    const hasLogo = Boolean(this.logoBase64);

    const docDefinition = {
      content: [this.renderHeader(title, hasLogo), this.renderContent(content)],
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
          color: "#b21f1f",
          margin: [0, 2, 0, 5],
        },
        headerTitle: {
          fontSize: 16,
          bold: true,
          decoration: "underline",
          color: "black",
        },
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
  renderHeader(title: string, includeLogo: boolean) {
    const columns: any[] = [];
    const qrCodeUrl = "https://example.com/document/12345";

    const hasLogoUniv = Boolean(this.logoUnivBase64);

    if (hasLogoUniv) {
      columns.push({
        width: "15%",
        image: this.logoUnivBase64,
        fit: [80, 80],
        alignment: "left",
      });
    } else {
      columns.push({ width: "15%", text: "" });
    }

    // Définition des colonnes avec les proportions demandées
    columns.push({
      width: "70%",
      stack: [
        { text: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO", style: "countryName" },
        {
          text: "Ministère de l'Enseignement Supérieur, Universitaire, Recherche Scientifique et Innovations",
        },
        {
          text: univ.toUpperCase(),
          style: "univName",
          margin: [0, 2, 0, 5],
        },
        {
          text: title,
          style: "headerTitle",
          margin: [10, 10, 10, 0],
        },
      ],
      alignment: "center",
    });

    // 3. Logo (15%) - Simulation d'arrondi
    if (includeLogo) {
      columns.push({
        width: "15%",
        image: "logo",
        fit: [80, 80],
        alignment: "right",
        // Note : Pour un cercle parfait, l'image source doit être carrée
        // pdfmake ne supporte pas le "border-radius" sur images
      });
    } else {
      // Colonne vide pour maintenir l'équilibre si pas de logo
      columns.push({ width: "15%", text: "" });
    }

    return {
      columns,
      margin: [0, 0, 0, 20],
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
    return {
      text: content,
      style: "content",
      margin: [0, 10, 0, 10],
    };
  }

  renderFooter(page: number, pageCount: number) {
    return {
      text: `Page ${page} sur ${pageCount}`,
      style: "footer",
      alignment: "center",
      margin: [0, 10, 0, 20],
    };
  }
}
