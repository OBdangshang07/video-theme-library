import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");

const MIME={
  ".html":"text/html; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",".svg":"image/svg+xml",".ico":"image/x-icon",
  ".ttf":"font/ttf",".otf":"font/otf",".woff":"font/woff",".woff2":"font/woff2",
  ".mp4":"video/mp4",".webm":"video/webm"
};

export function startServer(port=Number(process.env.SHOWROOM_PORT??0)){
  const server=http.createServer((req,res)=>{
    const url=new URL(req.url,"http://localhost");
    let file=path.normalize(path.join(root,decodeURIComponent(url.pathname)));
    if(url.pathname.endsWith("/"))file=path.join(file,"index.html");
    if(!file.startsWith(root)){res.writeHead(403);res.end();return}
    fs.readFile(file,(error,data)=>{
      if(error){res.writeHead(404);res.end("not found");return}
      res.writeHead(200,{"Content-Type":MIME[path.extname(file).toLowerCase()]||"application/octet-stream"});
      res.end(data);
    });
  });
  return new Promise((resolve,reject)=>{
    server.on("error",reject);
    server.listen(port,"127.0.0.1",()=>{
      const actualPort=server.address().port;
      resolve({server,port:actualPort,base:`http://127.0.0.1:${actualPort}`});
    });
  });
}

export async function launchPage(viewport={width:1440,height:1000}){
  const require=createRequire(import.meta.url);
  const modulePath=process.env.PLAYWRIGHT_MODULE||"playwright";
  const {chromium}=require(modulePath);
  const launchOptions={headless:true};
  if(process.env.CHROME_EXECUTABLE)launchOptions.executablePath=process.env.CHROME_EXECUTABLE;
  const browser=await chromium.launch(launchOptions);
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];
  page.on("console",message=>{if(message.type()==="error"&&!message.text().includes("Failed to load resource"))errors.push(message.text())});
  page.on("pageerror",error=>errors.push(error.message));
  return {browser,page,errors};
}

export async function cardOverflow(page){
  return page.evaluate(()=>[...document.querySelectorAll(".card")].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.querySelector(".id")?.textContent||el.className));
}
