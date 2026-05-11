import { readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

const files = readdirSync('./flags').filter(f => f.endsWith('.png'));

files.forEach(file => {
  const country = file.replace('.png', '').toUpperCase();
  const hex = readFileSync(`./flags/${file}`).toString('hex');
  const sql = `INSERT OR REPLACE INTO flags (country, image) VALUES ('${country}', x'${hex}');`;
  
  console.log(`Uploading ${country} to flags-db...`);
  // This command sends the data to Cloudflare's servers
  execSync(`npx wrangler d1 execute flags-db --remote --command "${sql}"`);
});
