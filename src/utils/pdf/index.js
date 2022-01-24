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
  if (user.image) {
    const response = await axios.get(user.image, {
      responseType: "arraybuffer",
    });
    const userCoverURLParts = user.image.split("/");
    const fileName = userCoverURLParts[userCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }
  const docDefinition = {
    content: [
      imagePart,
      { text: user.name, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.job, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.postaladdress, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.email, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.mobile, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.dob, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.personalstatement, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.skills, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.hobbies, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.experience, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      { text: user.education, fontSize: 20, bold: true, margin: [0, 0, 0, 40] },
      //{ text: striptags(user.job), lineHeight: 2 },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition,{});
  pdfDoc.end()
  return pdfDoc;
};
