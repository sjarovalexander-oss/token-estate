// Сваля видеата от Higgsfield при build и ги прекодира за плавно превъртане със скрол.
// Филмът на всяка секция е слепен от няколко прехода между етапите.
// Готовите файлове се пазят в .next/cache/video, за да не се свалят при всеки build.
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import ffmpeg from 'ffmpeg-static';

const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Hb8aAx5bTAdhpgfXGPPCxJrCKL/hf_20261123_';
const VIDEOS = {
  home: ['172323_f256052c-997e-4854-bbab-3332662b2ad4'],
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
  const key = name + '-' + createHash('md5').update('v3' + files.join()).digest('hex').slice(0, 10);
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
      ff([...inputs, '-filter_complex', chain, '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '30', '-g', '8', '-bf', '0', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', cm]);
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
    console.log('video ok:', name, `(${files.length} части)`);
  } catch (e) {
    console.warn('video skipped:', name, '-', e.message);
  }
}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(done));
