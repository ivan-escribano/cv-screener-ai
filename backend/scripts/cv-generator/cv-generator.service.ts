import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

import { GoogleGenAIService } from '../../services/google-gen-ai/google-gen-ai.service.js';
import { OpenAIService } from '../../services/openai/openai.service.js';
import { createPromptLoader } from '../../utils/load-prompt.util.js';
import { OUTPUT_DIR } from './cv-generator.config.js';
import { CV, cvSchema } from './cv-generator.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadPrompt = createPromptLoader(path.join(__dirname, 'prompts'));

export async function generateCVData(): Promise<CV> {
  console.log('📝 Generating CV data...');

  const prompt = loadPrompt('generate-cv-data.prompt.md');

  return OpenAIService.generateObject(cvSchema, prompt, 'cv');
}

export async function generatePhoto(photoDescription: string): Promise<Buffer> {
  console.log('📸 Generating profile photo...');

  const prompt = loadPrompt('generate-cv-headshot.prompt.md', {
    PHOTO_DESCRIPTION: photoDescription,
  });

  const base64 = await GoogleGenAIService.generateImage(prompt);

  return Buffer.from(base64, 'base64');
}

export async function generatePDF(cv: CV, photoBuffer: Buffer): Promise<string> {
  console.log('📄 Generating PDF...');

  const fileName = `${cv.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

  const filePath = path.join(OUTPUT_DIR, fileName);

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const photoSize = 80;

    doc.image(photoBuffer, 50, 50, { width: photoSize, height: photoSize });

    doc.fontSize(24).font('Helvetica-Bold').text(cv.fullName, 145, 55);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666')
      .text(cv.contactInfo.email, 145, 85)
      .text(`${cv.contactInfo.phone} | ${cv.contactInfo.address}`, 145, 100);

    doc.moveDown(2);

    doc.y = 150;

    addSection(doc, 'PROFESSIONAL SUMMARY');

    doc.fontSize(10).font('Helvetica').fillColor('#333').text(cv.summary);

    doc.moveDown();

    addSection(doc, 'WORK EXPERIENCE');
    cv.workExperience.forEach((exp) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(exp.position);
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666')
        .text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`);
      doc.fontSize(10).font('Helvetica').fillColor('#333').text(exp.description);
      doc.moveDown(0.5);
    });

    addSection(doc, 'EDUCATION');
    cv.education.forEach((edu) => {
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#000').text(edu.degree);
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666')
        .text(`${edu.institution} | ${edu.startDate} - ${edu.endDate}`);
      doc.moveDown(0.3);
    });

    addSection(doc, 'SKILLS');
    doc.fontSize(10).font('Helvetica').fillColor('#333').text(cv.skills.join('  •  '));
    doc.moveDown();

    addSection(doc, 'LANGUAGES');
    cv.languages.forEach((lang) => {
      doc.fontSize(10).font('Helvetica').fillColor('#333').text(`${lang.language}: ${lang.level}`);
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

function addSection(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#2563eb').text(title);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();

  doc.moveDown(0.5);
}
