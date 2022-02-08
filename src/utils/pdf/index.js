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

export const generateCVPDF = async (profile) => {
  let imagePart = {};
  if (profile.image) {
    const response = await axios.get(profile.image, {
      responseType: "arraybuffer",
    });
    const userCoverURLParts = profile.image.split("/");
    const fileName = userCoverURLParts[userCoverURLParts.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePart = { image: base64Image, width:120, margin: [0, 0, 0, 40] };
    console.log(profile.user)
    //console.log(user.name)
  }
  const docDefinition = {
    header: {
      text: profile.user.name,

    
    },
    footer: {
      text: profile.user.email,
     
    },
    content: [
      /*imagePart,
      {
      ul: [
        { margin: [5, 10, 5, 20], text: profile.mobile },
        { margin: [5, 10, 5, 20], text: profile.dob },
        { margin: [5, 10, 5, 20], text: profile.personalstatement },
        { margin: [5, 10, 5, 20], text: profile.skills },
        { margin: [5, 10, 5, 20], text: profile.education.insitution },
        { margin: [5, 10, 5, 20], text: profile.user.name },
        { margin: [5, 10, 5, 20], text: profile.user.job },
       
      ],
    }
       //{ text: striptags(user.job), lineHeight: 2 },*/
       {
        style: 'tableExample',
        color: '#444',
        table: {
          widths: [200, 'auto', 'auto'],
          headerRows: 2,
          // keepWithHeaderRows: 1,
          body: [
            [imagePart , {}, { text: 'Header 3', style: 'tableHeader',colSpan: 2, alignment: 'center' }],
            [{ text: 'Header 1', style: 'tableHeader', alignment: 'center' }, { text: 'Header 2', style: 'tableHeader', alignment: 'center' }, { text: 'Header 3', style: 'tableHeader', alignment: 'center' }],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            [{ rowSpan: 3, text: 'rowSpan set to 3\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor' }, 'Sample value 2', 'Sample value 3'],
            ['', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', { colSpan: 2, rowSpan: 2, text: 'Both:\nrowSpan and colSpan\ncan be defined at the same time' }, ''],
            ['Sample value 1', '', ''],
          ]
        }
      },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition,{});
  pdfDoc.end()
  return pdfDoc;
};
