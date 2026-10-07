import {collections,fetchCollection} from './catalog.js';
import {catalogPage,infoPage,notFound} from './render.js';
const headers={'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; img-src 'self' https://*.rakuten.co.jp https://*.rakuten.ne.jp; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"};
export async function refresh(env){let failed=0;for(const c of collections){try{const data=await fetchCollection(c,env);await env.CATALOG.put('collection:'+c.id,JSON.stringify(data));}catch{failed++;console.error('catalog_refresh_failed',c.id);}await new Promise(r=>setTimeout(r,1500));}if(failed)throw new Error('catalog_refresh_failed_count_'+failed);}
export default {
 async fetch(request,env){
 const u=new URL(request.url);const origin=env.SITE_ORIGIN||'https://okurimono.jev.jp';
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 if(['/style.css','/app.js','/favicon.svg'].includes(u.pathname))return env.ASSETS.fetch(request);
 if(u.pathname==='/robots.txt')return new Response('User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml',{headers:{'Content-Type':'text/plain'}});
 if(u.pathname==='/sitemap.xml'){const routes=['/',...collections.map(c=>'/collections/'+c.id),'/guide','/about','/privacy'];return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(p=>'<url><loc>'+origin+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}});}
 const id=u.pathname==='/'?'sweets':u.pathname.match(/^\/collections\/([a-z]+)$/)?.[1];
 const c=collections.find(c=>c.id===id);
 let body,status=200;
 if(c){let data=null;try{data=await env.CATALOG?.get('collection:'+c.id,'json');}catch{console.error('catalog_read_failed',c.id);}body=catalogPage(c,data,u,origin);if(!data)status=503;}
 else{body=infoPage(u.pathname.slice(1),origin);if(!body){body=notFound(origin);status=404;}}
 return new Response(request.method==='HEAD'?null:body,{status,headers:{...headers,'Cache-Control':status===200?'public, max-age=60':'no-store',...(status===503?{'Retry-After':'300'}:{})}});
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(refresh(env));}
};
