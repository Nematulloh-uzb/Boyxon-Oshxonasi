const fs=require('fs'),path=require('path');
function walk(d){let r=[];for(const f of fs.readdirSync(d)){const p=path.join(d,f);const s=fs.statSync(p);if(s.isDirectory())r=r.concat(walk(p));else if(/\.tsx$/.test(f))r.push(p);}return r;}
const files=walk(process.argv[2]);
const set=new Set();
for(const file of files){
  let c=fs.readFileSync(file,'utf8');
  // string literals (single/double), skip ones that look like code
  const re=/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')/g;let m;
  while((m=re.exec(c))){
    const raw=m[0];const inner=raw.slice(1,-1);
    if(!/[A-Za-z'\u0440-\u044f]/.test(inner))continue;
    if(/^(https?:|\/|bg-|text-|border-|flex|grid|w-|h-|p-|m-|rounded|font-|from-|to-|fill|stroke|min-|max-|items-|justify-|gap-|space-|top-|left-|right-|bottom-|absolute|relative|fixed|overflow|transition|hover:|focus:|active:|group-|md:|lg:|sm:|dark:)/.test(inner))continue;
    if(/[{}<>]/.test(inner))continue;
    if(inner.length<2)continue;
    // must contain a space or be a known word with uz-specific char or cyrillic
    if(/\s|[\u0440-\u044f\u0400-\u04ff]|\u2018|\u2019|g\u02bb/.test(inner)){set.add(inner);}
  }
  // JSX text nodes >...<
  const jre=/>([^<>{}]+)</g;let jm;
  while((jm=jre.exec(c))){const t=jm[1].trim();if(/[A-Za-z\u0400-\u04ff]/.test(t)&&t.length>1&&!/[{}]/.test(t))set.add(t);}
}
const arr=[...set].sort();
fs.writeFileSync(process.argv[3],JSON.stringify(arr,null,1));
console.log('TOPILDI:',arr.length);
