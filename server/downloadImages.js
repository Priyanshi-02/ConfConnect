const fs = require('fs');
const https = require('https');
const path = require('path');

const urls = [
  'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1582653291997-079a0c67e5a1?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1503423571797-2d2bb372094a?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1497215840632-132d75fcddb1?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=400'
];

const dir = path.join(__dirname, '../client/public/rooms');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const download = (url, dest) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301) {
      https.get(res.headers.location, (res2) => {
        const file = fs.createWriteStream(dest);
        res2.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    } else if (res.statusCode === 200) {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    } else {
      reject(new Error(`Status Code: ${res.statusCode}`));
    }
  }).on('error', err => {
    fs.unlink(dest, () => {});
    reject(err);
  });
});

(async () => {
  for (let i = 0; i < urls.length; i++) {
    console.log(`Downloading image ${i + 1}...`);
    try {
      await download(urls[i], path.join(dir, `${i + 1}.jpg`));
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Failed ${i + 1}`, e.message);
    }
  }
  console.log('Finished Downloading All Images Locally.');
})();
