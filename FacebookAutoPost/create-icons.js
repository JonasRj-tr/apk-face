const { Jimp } = require('jimp');

async function createIcon(size, outputPath) {
  const image = new Jimp({ width: size, height: size, color: 0x1877F2FF });
  await image.write(outputPath);
  console.log(`Created: ${outputPath}`);
}

async function main() {
  await createIcon(1024, 'assets/icon.png');
  await createIcon(1024, 'assets/splash-icon.png');
  await createIcon(1024, 'assets/adaptive-icon.png');
  console.log('All icons created successfully!');
}

main().catch(console.error);
