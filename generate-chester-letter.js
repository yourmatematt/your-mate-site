const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageOrientation,
  LineRuleType,
  convertMillimetersToTwip,
} = require('docx');

const FONT = 'Georgia';
const SIZE = 21; // half-points => 10.5pt
const LINE = 240; // 1.0 (single) line spacing in 240ths
const SPACE_AFTER = 120; // twips, ~6pt

function p(opts) {
  const {
    text = '',
    runs,
    bold = false,
    italics = false,
    align = AlignmentType.LEFT,
  } = opts || {};

  const children = runs
    ? runs
    : [new TextRun({ text, font: FONT, size: SIZE, bold, italics })];

  return new Paragraph({
    alignment: align,
    spacing: { line: LINE, lineRule: LineRuleType.AUTO, after: SPACE_AFTER },
    children,
  });
}

function blank() {
  return p({ text: '' });
}

function bodyPara(text) {
  return p({ text, align: AlignmentType.JUSTIFIED });
}

const recipient = [
  'Mr Darren Chester MP',
  'Federal Member for Gippsland',
  'PO Box 486',
  'Sale VIC 3853',
].map((line) => p({ text: line }));

const subjectLine = p({
  align: AlignmentType.LEFT,
  runs: [
    new TextRun({
      text: 'RE: Invitation to Digital Foundations workshop, Mallacoota Community Clubrooms — Wednesday 27 May 2026',
      font: FONT,
      size: SIZE,
      bold: true,
    }),
  ],
});

const para1 =
  "I'm writing on behalf of Your Mate Agency, a small digital marketing and web design business based here in Mallacoota. Together with Wilderness Collective, Paynesville Neighbourhood Centre and Learn Local, we're running a free five-session workshop series called Digital Foundations, supporting local small business owners — accommodation operators, tradies, hospitality, lifestyle services — to get more confident with the digital side of running their businesses.";

const para2 =
  'The sessions run every Wednesday evening from 6 May to 3 June 2026, and four of the five are being held at the Community Clubrooms in Greer Street.';

const para3Italic = p({
  align: AlignmentType.JUSTIFIED,
  runs: [
    new TextRun({
      text: "That's the reason for this letter.",
      font: FONT,
      size: SIZE,
      italics: true,
    }),
  ],
});

const para4 =
  'When the Clubrooms were completed in October 2020, you said the building would become "a community and social hub… well-used by locals throughout the year." You also described its completion as "a sign of a better, stronger future for the town" after one of the most difficult periods Mallacoota has ever faced.';

const para5 =
  "Five and a half years on, I think you'd be pleased to see that's exactly what's happening. The same room that was built with federal funding is being used, on five Wednesday evenings, to help local business owners — many of whom were directly affected by the 2019/20 bushfires and the years of recovery that followed — build the digital skills they need to grow stronger, more independent businesses.";

const para6 =
  "I'd like to invite you to drop in to Session 3 on Wednesday 27 May 2026, 5:30pm – 7:30pm, at the Clubrooms. By that point in the series the room will be in full swing — local business owners working through the practical side of getting found online, reducing their reliance on third-party booking platforms, and building the kind of resilient regional businesses that keep money circulating in our community.";

const para7 =
  "You're welcome for the full two hours, or to pop in briefly — whatever your schedule allows. No speech required; this is about you seeing the building doing what it was always meant to do.";

const para8 =
  "If you'd like to attend, or if your office would like more detail on the program, you can reach me directly on 0478 101 521 or at matt@yourmateagency.com.au.";

const para9 =
  "Either way, thank you for the work you did to get this building over the line. It's making a real difference.";

const signatureBlock = [
  p({
    runs: [
      new TextRun({
        text: 'Matt Rowlands',
        font: FONT,
        size: SIZE,
        bold: true,
      }),
    ],
  }),
  p({ text: 'Your Mate Agency' }),
  p({ text: 'Mallacoota, VIC' }),
  p({ text: 'yourmateagency.com.au' }),
  p({ text: '0478 101 521' }),
];

const children = [
  ...recipient,
  blank(),
  p({ text: '30 April 2026' }),
  blank(),
  blank(),
  p({ text: 'Dear Mr Chester,' }),
  blank(),
  subjectLine,
  blank(),
  bodyPara(para1),
  blank(),
  bodyPara(para2),
  blank(),
  para3Italic,
  blank(),
  bodyPara(para4),
  blank(),
  bodyPara(para5),
  blank(),
  bodyPara(para6),
  blank(),
  bodyPara(para7),
  blank(),
  bodyPara(para8),
  blank(),
  bodyPara(para9),
  blank(),
  p({ text: 'Yours sincerely,' }),
  blank(),
  blank(),
  blank(),
  ...signatureBlock,
];

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: SIZE },
        paragraph: { spacing: { line: LINE, lineRule: LineRuleType.AUTO, after: SPACE_AFTER } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: {
            // A4: 210mm x 297mm
            width: convertMillimetersToTwip(210),
            height: convertMillimetersToTwip(297),
            orientation: PageOrientation.PORTRAIT,
          },
          margin: {
            top: convertMillimetersToTwip(18),
            right: convertMillimetersToTwip(18),
            bottom: convertMillimetersToTwip(18),
            left: convertMillimetersToTwip(18),
          },
        },
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = path.join(__dirname, 'darren-chester-workshop-invitation.docx');
  fs.writeFileSync(out, buffer);
  const { size } = fs.statSync(out);
  console.log(`Wrote ${out} (${size} bytes)`);
});
