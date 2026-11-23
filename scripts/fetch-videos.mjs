// Сваля видеата от Higgsfield при build и ги прекодира за плавно превъртане със скрол.
// Готовите файлове се пазят в .next/cache/video, за да не се свалят при всеки build.
import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';

const BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Hb8aAx5bTAdhpgfXGPPCxJrCKL/';
const VIDEOS = {
  home: 'hf_20261123_172323_f256052c-997e-4854-bbab-3332662b2ad4.mp4',
  stroitelstvo: 'hf_20261123_172322_05b3ae7e-1494-4372-a55a-6a862f7c1baa.mp4',
  energia: 'hf_20261123_172323_0cb35232-78be-4550-a2cf-ea0613259911.mp4',
  naem: 'hf_20261123_172322_f9fba7ab-b7dd-43c8-8686-eb400f3b86f4.mp4',
  remont: 'hf_20261123_172323_a7e90328-934d-4996-8277-322b406c0b73.mp4',
  hoteli: 'hf_20261123_172322_5097015f-3893-49b0-a57f-90cb10950d89.mp4',
  zemia: 'hf_20261123_172322_ae2f8c06-62e8-43f2-b156-27fadcfebed3.mp4',
};
const OUT = 'public/video', CACHE = '.next/cache/video';
mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });
const done = [];
for (const [name, file] of Object.entries(VIDEOS)) {
  const key = name + '-' + file.slice(-12, -4);
  const cm = `${CACHE}/${key}.mp4`, cj = `${CACHE}/${key}.jpg`;
  try {
    if (!existsSync(cm) || !existsSync(cj)) {
      const res = await fetch(BASE + file);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const tmp = `${CACHE}/${key}.src.mp4`;
      writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', tmp, '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '26', '-g', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', cm]);
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', '0.2', '-i', tmp, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', cj]);
      rmSync(tmp);
    }
    copyFileSync(cm, `${OUT}/${name}.mp4`);
    copyFileSync(cj, `${OUT}/${name}.jpg`);
    done.push(name);
    console.log('video ok:', name);
  } catch (e) {
    console.warn('video skipped:', name, '-', e.message);
  }
}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(done));
