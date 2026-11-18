const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '../src/raw-images');
const OUTPUT_DIR = path.join(__dirname, '../src/assets/images');
const WIDTHS = [400, 800];

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Директорію ${INPUT_DIR} не знайдено. Створіть її та додайте вихідні файли.`);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter((file) =>
    /\.(jpe?g|png)$/i.test(file)
  );

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const { name, ext } = path.parse(file);
    const isPng = ext.toLowerCase() === '.png';

    for (const width of WIDTHS) {
      const pipeline = sharp(inputPath).resize({
        width,
        withoutEnlargement: true,
      });

      await pipeline
        .clone()
        .avif({ quality: 65 })
        .toFile(path.join(OUTPUT_DIR, `${name}-${width}w.avif`));

      await pipeline
        .clone()
        .webp({ quality: 80 })
        .toFile(path.join(OUTPUT_DIR, `${name}-${width}w.webp`));

      if (isPng) {
        await pipeline
          .clone()
          .png({ compressionLevel: 8 })
          .toFile(path.join(OUTPUT_DIR, `${name}-${width}w.png`));
      } else {
        await pipeline
          .clone()
          .jpeg({ quality: 82, mozjpeg: true })
          .toFile(path.join(OUTPUT_DIR, `${name}-${width}w.jpg`));
      }
    }

    console.log(`Оброблено: ${file}`);
  }
}

processImages().catch((err) => {
  console.error(err);
  process.exit(1);
});