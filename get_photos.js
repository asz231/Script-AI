const fs = require('fs');
const https = require('https');
const path = require('path');

const creators = [
  { id: 'shongxob', name: 'شونق بونق', handle: '@SHoNgxxBoNg', fallbackQuery: 'shongxbong' },
  { id: 'abualrob', name: 'أحمد أبو الرب', handle: '@aburob', fallbackQuery: 'Ahmad Aburob' },
  { id: 'fearfall', name: 'فيرفول', handle: '@FearFall', fallbackQuery: 'fearfall' },
  { id: 'abunuh', name: 'أبو نوح', handle: '@abunuh', fallbackQuery: 'abunuh' }
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync('assets/creators')) {
    fs.mkdirSync('assets/creators', { recursive: true });
  }

  for (const c of creators) {
    console.log(`Checking ${c.id} (${c.handle})...`);
    try {
      const html = await fetchUrl(`https://www.youtube.com/${c.handle}`);
      
      // Look for og:image or avatar thumbnail
      let imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (!imgMatch) {
        imgMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
      }
      if (!imgMatch) {
        imgMatch = html.match(/https:\/\/yt3\.googleusercontent\.com\/[a-zA-Z0-9_\-=]+/);
      }

      if (imgMatch) {
        let imgUrl = imgMatch[1] || imgMatch[0];
        // unescape url
        imgUrl = imgUrl.replace(/&amp;/g, '&');
        console.log(`Found image for ${c.id}: ${imgUrl}`);
        const dest = path.join('assets/creators', `${c.id}.jpg`);
        await downloadFile(imgUrl, dest);
        console.log(`Saved to ${dest}`);
      } else {
        console.log(`Could not find image for ${c.id}`);
      }
    } catch (e) {
      console.error(`Error for ${c.id}:`, e.message);
    }
  }
}

main();
