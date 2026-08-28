import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const mime={".css":"text/css",".html":"text/html",".js":"text/javascript",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".ttf":"font/ttf"};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
  const relative=pathname==="/"?"index.html":pathname.replace(/^\/+/,"");
  const target=path.resolve(root,relative);
  if(target!==root&&!target.startsWith(`${root}${path.sep}`)){response.writeHead(403).end("Forbidden");return}
  fs.readFile(target,(error,data)=>{
    if(error){response.writeHead(404).end("Not found");return}
    response.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream"});response.end(data);
  });
});

await new Promise((resolve,reject)=>server.once("error",reject).listen(0,"127.0.0.1",resolve));
const address=server.address();
const showroomUrl=`http://127.0.0.1:${address.port}`;
try{
  for(const script of ["verify-advanced-showroom.mjs","verify-modern-minimal-showroom.mjs","verify-voxel-harness-showroom.mjs","verify-signal-desk-showroom.mjs"]){
    const status=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[path.join(root,"scripts",script)],{cwd:root,stdio:"inherit",env:{...process.env,SHOWROOM_URL:showroomUrl}});
      child.once("error",reject);child.once("exit",code=>resolve(code));
    });
    if(status!==0)process.exitCode=status||1;
    if(process.exitCode)break;
  }
}finally{
  await new Promise(resolve=>server.close(resolve));
}
