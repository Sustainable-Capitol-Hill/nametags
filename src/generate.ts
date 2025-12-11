import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFImage, PDFPage } from "pdf-lib";
import openSansRegular from "./fonts/OpenSans-Regular.ttf";
import openSansSemibold from "./fonts/OpenSans-SemiBold.ttf";
import logoPng from "./logo.png";
import averyTemplate from "./Avery5390.pdf";

const xOffset = 54;
const yOffset = 77;

const tagWidth = 252;
const tagHeight = 159;

async function fetchArrayBuffer(file: string) {
  return await fetch(file).then((rsp) => rsp.arrayBuffer());
}

async function registerFonts(
  fontFiles: string[],
  doc: PDFDocument,
): Promise<PDFFont[]> {
  doc.registerFontkit(fontkit);

  const promises = fontFiles.map(async (file) => {
    const bytes = await fetchArrayBuffer(file);
    return await doc.embedFont(bytes);
  });

  return await Promise.all(promises);
}

type Tag = {
  xIndex: number;
  yIndex: number;
  title: string;
  subtitle: string;
};

export async function generateDoc(
  tags: Tag[],
  includeBackground: boolean = false,
) {
  let doc: PDFDocument;

  if (includeBackground) {
    const bgBytes = await fetchArrayBuffer(averyTemplate);
    doc = await PDFDocument.load(bgBytes);
  } else {
    doc = await PDFDocument.create();
    doc.addPage([612, 792]); /* same dimensions as Avery template */
  }

  const logoBytes = await fetchArrayBuffer(logoPng);
  const logoImage = await doc.embedPng(logoBytes);

  const [regular, semibold] = await registerFonts(
    [openSansRegular, openSansSemibold],
    doc,
  );

  for (const tag of tags) {
    await generateTag(
      doc.getPage(0),
      logoImage,
      regular,
      semibold,
      tag.title,
      tag.subtitle,
      tag.xIndex,
      tag.yIndex,
    );
  }

  return doc;
}

export async function generateTag(
  page: PDFPage,
  logoImage: PDFImage,
  regular: PDFFont,
  semibold: PDFFont,
  title: string,
  subtitle: string,
  xIndex: number,
  yIndex: number,
) {
  const tagStartX = xOffset + xIndex * tagWidth;
  const tagStartY = yOffset + (3 - yIndex) * tagHeight;

  const logoScale = 0.09;

  page.drawImage(logoImage, {
    width: logoImage.width * logoScale,
    height: logoImage.height * logoScale,
    x: tagStartX + tagWidth / 2 - (logoImage.width * logoScale) / 2,
    y: tagStartY + 64,
  });

  const titleWidth = semibold.widthOfTextAtSize(title, 24);

  page.drawText(title, {
    x: tagStartX + tagWidth / 2 - titleWidth / 2,
    y: tagStartY + 36,
    size: 24,
    font: semibold,
  });

  const subtitleWidth = regular.widthOfTextAtSize(subtitle, 16);

  page.drawText(subtitle, {
    x: tagStartX + tagWidth / 2 - subtitleWidth / 2,
    y: tagStartY + 14,
    size: 16,
    font: regular,
  });
}
