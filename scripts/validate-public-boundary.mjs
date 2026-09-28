import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const textExtensions=new Set([".css",".html",".js",".json",".md",".mjs",".txt",".yaml",".yml"]);
const forbiddenNames=new Set(["minecraft-ae.ttf",".env","id_rsa","id_ed25519"]);
const findings=[];

const files=execFileSync("git",["ls-files","-z"],{cwd:root}).toString().split("\0").filter(Boolean);
for(const relative of files){
  const target=path.join(root,relative);
  if(!fs.existsSync(target))continue;
  if(forbiddenNames.has(path.basename(relative).toLowerCase()))findings.push(`${relative}: forbidden private or secret-bearing filename`);
  if(!textExtensions.has(path.extname(relative).toLowerCase()))continue;
  const source=fs.readFileSync(target,"utf8");
  const checks=[
    [/\b[A-Za-z]:[\\/](?!\/)/,"absolute Windows path"],
    [/(?:^|[\s"'])\/(?:Users|home)\//m,"absolute home path"],
    [/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,"private key"],
    [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/,"GitHub token"],
    [/\bsk-[A-Za-z0-9_-]{20,}\b/,"API token"],
    [/\bAKIA[0-9A-Z]{16}\b/,"AWS access key"]
  ];
  for(const [pattern,label] of checks)if(pattern.test(source))findings.push(`${relative}: ${label}`);
}

if(findings.length){console.error(findings.join("\n"));process.exit(1)}
console.log("Public boundary valid: no private font, secret pattern, or local absolute path found.");
