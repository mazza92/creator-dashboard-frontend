const fs = require('fs');
const path = require('path');

const filePath = path.join(
  process.env.USERPROFILE,
  '.claude',
  'projects',
  'c--Users-maher-Desktop-creator-dashboard',
  'bf570e54-a0cb-4bce-b8ee-d5a6fc0d5fec',
  'tool-results',
  'toolu_013LoRRjQorHBda4FoD4ReFK.txt'
);

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const invalid = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Invalid:')) {
    // Look back for brand name and email
    let j = i - 1;
    let email = '';
    let brandLine = '';

    while (j >= 0 && j > i - 5) {
      if (lines[j].includes('Verifying:')) {
        email = lines[j].split('Verifying:')[1].trim();
      }
      if (lines[j].includes('🏷️')) {
        brandLine = lines[j];
        break;
      }
      j--;
    }

    if (brandLine && email) {
      // Extract brand name and slug
      const match = brandLine.match(/🏷️\s+(.+?)\s+\(([^)]+)\)/);
      if (match) {
        invalid.push({
          name: match[1].trim(),
          slug: match[2].trim(),
          email: email
        });
      }
    }
  }
}

// Save to file
fs.writeFileSync('invalid-emails.json', JSON.stringify(invalid, null, 2));
console.log('Extracted', invalid.length, 'invalid emails');
console.log('Saved to invalid-emails.json');
