// Сваля видеата от Higgsfield при build и ги прекодира за плавно превъртане със скрол.
// Филмът на всяка секция е слепен от няколко прехода между етапите.
// Готовите файлове се пазят в .next/cache/video, за да не се свалят при всеки build.
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import ffmpeg from 'ffmpeg-static';

const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Hb8aAx5bTAdhpgfXGPPCxJrCKL/hf_20261123_';
const VIDEOS = {
  home: ['185322_7064a047-c7b2-4ca8-b089-05e39ac3e22c'],
  stroitelstvo: ['174938_d7970d2d-559f-42fd-bcad-4163c34a4733', '174937_6042d54d-4aa9-4a19-980c-499297ac8b57', '174937_93091081-b7d9-4514-87f8-e4e82918b243', '174938_27e8fb95-2223-40a6-ba68-cfe40d24712f'],
  energia: ['174938_5452b8c7-429e-4ad6-9549-65859980db5b', '174939_50cfae6f-1a86-45a0-8f0f-b580ee011084', '174937_cec2f78b-156b-4a0f-9750-540f8656d29e'],
  naem: ['174937_27cf417e-348e-44c0-b5ec-cb186466f9a8', '174937_d823b7c9-de20-4e1f-aa23-a15f755d6c15', '174937_7b5c37e7-1fad-4721-90e7-f5b320019f11'],
  remont: ['174937_3a99376f-a956-4b18-974e-04614872856e', '174937_a42e8197-c98e-44d5-aaa2-b3bb38e28bc4', '174952_856ec670-f723-4549-80d3-1aca5ad72799'],
  hoteli: ['174951_8d86a49d-5479-4a39-a8e9-1fdca05e5e94', '174952_e8c31cd7-b859-4bb3-93c2-d6025416ead5', '174952_e6de6dcb-4eec-4e26-beb9-f091398c1098'],
  zemia: ['174951_4aad92fd-5497-4cbf-837a-83e6a6754760', '174953_ebecfff5-6847-42cc-87d6-a40b9c8219cb', '174951_c83b9e25-2e56-41cc-9119-7d3ee34b3713'],
};
const OUT = 'public/video', CACHE = '.next/cache/video';
mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });
const ff = (args) => execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...args]);
const done = [];
for (const [name, files] of Object.entries(VIDEOS)) {
  const key = name + '-' + createHash('md5').update('v4' + files.join()).digest('hex').slice(0, 10);
  const cm = `${CACHE}/${key}.mp4`, cj = `${CACHE}/${key}.jpg`, cs = `${CACHE}/${key}-start.jpg`, cl = `${CACHE}/${key}-loop.mp4`;
  try {
    if (!existsSync(cm) || !existsSync(cj) || !existsSync(cs) || !existsSync(cl)) {
      const parts = [];
      for (const [i, f] of files.entries()) {
        const res = await fetch(BASE + f + '.mp4');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const tmp = `${CACHE}/${key}.${i}.src.mp4`;
        writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
        parts.push(tmp);
      }
      const inputs = parts.flatMap((p) => ['-i', p]);
      const chain = parts.map((_, i) => `[${i}:v]scale=1280:720,fps=24,setsar=1[v${i}]`).join(';') + ';' + parts.map((_, i) => `[v${i}]`).join('') + `concat=n=${parts.length}:v=1:a=0[out]`;
      ff([...inputs, '-filter_complex', chain, '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '32', '-g', '10', '-bf', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', cm]);
      ff(['-sseof', '-0.3', '-i', cm, '-frames:v', '1', '-q:v', '4', cj]);
      ff(['-i', cm, '-frames:v', '1', '-q:v', '4', cs]);
      // малка версия за фоновете, които се въртят сами
      ff(['-i', cm, '-an', '-vf', 'scale=768:432', '-c:v', 'libx264', '-preset', 'medium', '-crf', '33', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', cl]);
      parts.forEach((p) => rmSync(p));
    }
    copyFileSync(cm, `${OUT}/${name}.mp4`);
    copyFileSync(cj, `${OUT}/${name}.jpg`);
    copyFileSync(cs, `${OUT}/${name}-start.jpg`);
    copyFileSync(cl, `${OUT}/${name}-loop.mp4`);
    done.push(name);
    console.log('video ok:', name, `(${files.length} части, ${(statSync(cm).size / 1e6).toFixed(1)} MB)`);
  } catch (e) {
    console.warn('video skipped:', name, '-', e.message);
  }
}

// Фотореалистичните кадри по етапи (FLUX 3), по реда на етапите
const STILLS = {
  stroitelstvo: ['174520_2be2d600-6b4c-4d42-a3c5-1d6a97cf56c0', '174521_f2839bf4-431a-435b-a20f-4d78e257abc0', '174550_0eea87e0-5543-4d9c-8176-6e1c5518d260', '174529_de93a3c2-8e18-490d-a12a-d919d7264f86', '174333_67b7e75c-9399-4b67-9664-232e0367523d'],
  energia: ['174531_31cc84ea-5c30-4ddf-8bd1-6d7193cc2054', '174551_f5c0400f-eff6-42cf-aa0b-dfe354dfd62f', '174550_ef012b8b-3a97-4a14-9a0c-29bc01e4e1df', '174335_4127b530-56d7-4062-be71-ba7b52c27f27'],
  naem: ['174552_78bb4e43-d6c4-4dbf-93a2-1ce4294ba60a', '174519_4a085bcc-d7c4-469e-9472-11082096a567', '174521_eec9f158-4c79-42ab-bc78-330295b10456', '174336_7b752bb4-fdde-4e48-99d5-9a920eaaeeea'],
  remont: ['174523_2ec59d4e-d0a9-4116-8448-bf830c18ee6f', '174551_c6768546-5e37-44bc-a8be-8b6175fe6072', '174537_e7b12755-174b-4e04-ad08-995441dccdf0', '174334_130d438a-8f7d-427c-945a-87a3a174653a'],
  hoteli: ['174535_5ab5f8be-dd10-498c-aaba-dd1274978140', '174534_5f6399e9-ccde-49d6-8724-b4881b351af5', '174538_cf8f297e-330e-4e8c-ba3d-c78ec93fe229', '174332_91b5354e-7463-4651-b8a9-c5301f757da5'],
  zemia: ['174537_83629f38-3909-419e-8b4e-89533f08365e', '174534_ecd7de2c-7d63-4ea8-8a7d-eb6f05802e4a', '174536_b0ddf1ad-71ac-4f4f-937d-08f10381788a', '174333_c2cd554a-2d04-433b-8082-8d7b303fe92f'],
};
mkdirSync(`${OUT}/stills`, { recursive: true });
let nst = 0;
for (const [cat, list] of Object.entries(STILLS)) {
  for (const [i, f] of list.entries()) {
    const c = `${CACHE}/still2-${f.slice(-12)}.jpg`, ct = `${CACHE}/still2-${f.slice(-12)}-t.jpg`;
    try {
      if (!existsSync(c) || !existsSync(ct)) {
        const res = await fetch(BASE + f + '.png');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const tmp = c + '.png';
        writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
        ff(['-i', tmp, '-vf', 'scale=1440:-2', '-q:v', '5', c]);
        ff(['-i', tmp, '-vf', 'scale=560:-2', '-q:v', '6', ct]);
        rmSync(tmp);
      }
      copyFileSync(c, `${OUT}/stills/${cat}-${i}.jpg`);
      copyFileSync(ct, `${OUT}/stills/${cat}-${i}-t.jpg`);
      nst++;
    } catch (e) {
      console.warn('still skipped:', cat, i, '-', e.message);
    }
  }
}
console.log('stills ok:', nst);
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(done));
