import { collections, fetchCollection } from '../src/catalog.js';
import { mkdir,writeFile } from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const env={RAKUTEN_APPLICATION_ID:process.env.RAKUTEN_APPLICATION_ID,RAKUTEN_ACCESS_KEY:process.env.RAKUTEN_API_KEY||process.env.RAKUTEN_ACCESS_KEY,RAKUTEN_AFFILIATE_ID:process.env.RAKUTEN_AFFI||process.env.RAKUTEN_AFFILIATE_ID};
await mkdir('work',{recursive:true});
const entries=[];
for(const c of collections){const data=await fetchCollection(c,env);entries.push({key:'collection:'+c.id,value:JSON.stringify(data)});console.log(c.id+': '+data.items.length+' products');await new Promise(r=>setTimeout(r,1300));}
await writeFile('work/catalog-seed.json',JSON.stringify(entries));
if(process.argv.includes('--local')||process.argv.includes('--remote'))execFileSync('npx',['wrangler','kv','bulk','put','work/catalog-seed.json','--binding','CATALOG',process.argv.includes('--remote')?'--remote':'--local'],{stdio:'inherit'});
