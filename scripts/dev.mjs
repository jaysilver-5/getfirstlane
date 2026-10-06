import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
const built=spawnSync(process.execPath,['scripts/build.mjs'],{cwd,stdio:'inherit'});
if(built.status!==0)process.exit(built.status||1);
const server=spawn(process.execPath,['scripts/server.mjs'],{cwd,stdio:'inherit',env:process.env});
process.on('SIGINT',()=>server.kill('SIGINT'));process.on('SIGTERM',()=>server.kill('SIGTERM'));
server.on('exit',code=>process.exitCode=code||0);
