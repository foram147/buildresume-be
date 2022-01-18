import PdfPrinter from "pdfmake";
import striptags from "striptags";
import axios from "axios";

const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export const generateCVPDF = async (user) => {
  let imagePart = {};
  if (user.cover) {
    const response = await axios.get(user.cover, {
      responseType: "arraybuffer",
    });
    const userCoverURLParts = user.cover.split("/");
    const fileName = userCoverURLParts[userCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }
  const docDefinition = {
    content: [
      imagePart,
      { text: user.title, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: striptags(user.category), lineHeight: 2 },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition,{});
  pdfDoc.end()
  return pdfDoc;
};
