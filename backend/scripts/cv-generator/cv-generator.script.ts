import { CV_COUNT } from './cv-generator.config.js';
import { generateCVData, generatePDF, generatePhoto } from './cv-generator.service.js';

async function main() {
  console.log(`\n🚀 Generating ${CV_COUNT} CV(s)...\n`);

  for (let i = 0; i < CV_COUNT; i++) {
    try {
      console.log(`--- CV ${i + 1}/${CV_COUNT} ---`);

      const cvData = await generateCVData();

      console.log(`✅ Data: ${cvData.fullName}`);

      const photo = await generatePhoto(cvData.photoDescription);

      console.log(`✅ Photo generated`);
      const filePath = await generatePDF(cvData, photo);

      console.log(`✅ PDF saved: ${filePath}\n`);
    } catch (error) {
      console.error(`❌ Error generating CV ${i + 1}:`, error);
    }
  }

  console.log('🎉 Process completed!\n');
}

main();
