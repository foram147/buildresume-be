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
    imagePart = { image: base64Image};
    console.log(profile.user)
    //console.log(user.name)
  }
  const docDefinition = {
    
    content: [
      
       {
        style: 'tableExample',
        table: {
          width:['*','80%'],
          //heights:[100,30,30,30,30,30,30,30,30],
          body: [
            //['', ''],
            [imagePart, {text:[
              'Personal  Statement: \n ',
              {text:profile.personalstatement,alignment:'center'}
            ]}],
            [{text:profile.user.name,alignment: 'center',},{text:[
              'Personal Experience: \n ',
              {text:profile.experience.position,alignment:'center'},
              {text:profile.experience.startDate,alignment:'center'},
            ]}],
            [{text:profile.user.job,alignment: 'center',},{}],
            [{text:profile.postaladdress,alignment: 'center',},{}],
            [{text:profile.user.email,alignment: 'center',},{}],
            [{text:profile.mobile,alignment: 'center',},{}],
            [{text:profile.dob,alignment: 'center',},{}],
            
          ]
        },
        //layout: 'noBorders'
      },
    ],
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition,{});
  pdfDoc.end()
  return pdfDoc;
};
