import fs from 'fs';
import sharp from 'sharp';

async function optimize() {
  const files = ['1.png', '2.png', '3.png'];
  
  for (const file of files) {
    if (fs.existsSync(`public/${file}`)) {
      console.log(`Optimizing ${file}...`);
      const outName = file.replace('.png', '.webp');
      
      await sharp(`public/${file}`)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(`public/${outName}`);
        
      fs.unlinkSync(`public/${file}`);
      console.log(`Optimized ${file} -> ${outName}`);
    } else {
      console.log(`${file} not found. Skipped.`);
    }
  }
  console.log("Optimization complete!");
}

optimize().catch(console.error);
