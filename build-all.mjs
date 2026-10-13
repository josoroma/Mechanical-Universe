import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {episodes} from './episodes.mjs';

for (const episode of episodes.filter(episode => episode.folder)) {
  const folder = new URL(`./${episode.folder}/`, import.meta.url);
  const result = spawnSync(process.execPath, ['build.mjs', ...process.argv.slice(2)], {
    cwd: fileURLToPath(folder), stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const result = spawnSync(process.execPath, ['build-index.mjs'], {
  cwd: fileURLToPath(new URL('./', import.meta.url)), stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
