const fs=require('fs');
const vars={};
for(const l of fs.readFileSync('.dev.vars','utf8').split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)vars[m[1]]=m[2];}
(async()=>{
  const r=await fetch('https://api.brevo.com/v3/smtp/emails/61d5788d-d18e-40b8-927e-ebe752de9c3c',{headers:{'api-key':vars.BREVO_API_KEY}});
  const raw=await r.text();
  console.log('status:',r.status,'bytes:',raw.length);
  let j={}; try{ j=JSON.parse(raw); }catch(e){ console.log('raw:',raw.slice(0,300)); process.exit(0); }
  console.log('keys:',Object.keys(j).join(','));
  for(const k of Object.keys(j)){ const v=j[k]; console.log(k,':',typeof v==='string'?v.length+' belgi':JSON.stringify(v).slice(0,120)); }
  const s=JSON.stringify(j);
  const i=s.indexOf('reset-password');
  console.log('reset-password index:',i);
  if(i>=0) console.log('atrof:',s.slice(Math.max(0,i-200),i+400));
})().catch(e=>{console.error(e);process.exit(1)});
