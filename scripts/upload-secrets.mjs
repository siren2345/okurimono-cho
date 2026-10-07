import {spawnSync} from 'node:child_process';
const secrets={RAKUTEN_APPLICATION_ID:process.env.RAKUTEN_APPLICATION_ID,RAKUTEN_ACCESS_KEY:process.env.RAKUTEN_ACCESS_KEY||process.env.RAKUTEN_API_KEY,RAKUTEN_AFFILIATE_ID:process.env.RAKUTEN_AFFILIATE_ID||process.env.RAKUTEN_AFFI};
if(Object.values(secrets).some(v=>!v))throw new Error('Missing required Rakuten environment variable');
const p=spawnSync('npx',['wrangler','secret','bulk'],{input:JSON.stringify(secrets),stdio:['pipe','inherit','inherit']});process.exit(p.status??1);
