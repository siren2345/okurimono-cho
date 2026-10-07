export const collections = [
  {id:'sweets',name:'お菓子を贈る',short:'お菓子',en:'SWEET MOMENTS',query:'焼き菓子 ギフト',number:'01',intro:'「ありがとう」に、甘いひと息。',description:'分けやすい個包装や、少しずつ楽しめる焼き菓子を。職場へのお礼、訪問の手土産、気軽な贈りものを探せます。',tip:'人数に合う個数と賞味期限をチェック。アレルギーや苦手な食材は、事前に相手に確かめましょう。'},
  {id:'coffee',name:'コーヒー',short:'コーヒー',en:'A LITTLE PAUSE',query:'コーヒー ギフト ドリップ',number:'02',intro:'いつもの時間を、ちょっと特別に。',description:'道具を増やさずに楽しめるドリップコーヒーを中心に。仕事の合間や休日に、ひと息つく時間を贈るコレクション。',tip:'ドリップ式なら専用器具が不要。カフェインの好み、袋数、保存方法を販売店で確認してください。'},
  {id:'home',name:'暮らしの道具',short:'暮らしの道具',en:'EVERYDAY DELIGHT',query:'今治タオル ギフト',number:'03',intro:'毎日使うものに、ささやかな上質を。',description:'新生活や引越しのお祝いに選びやすい、タオルのギフト。色やサイズ、セット内容を比べて、相手の暮らしに合うものを。',tip:'使いやすいサイズと収納場所を意識して。ギフト箱の有無や、のし対応は商品ページで確認できます。'},
  {id:'flowers',name:'花とグリーン',short:'花とグリーン',en:'SAY IT WITH FLOWERS',query:'プリザーブドフラワー ギフト',number:'04',intro:'言葉に添えて、ひとつの花を。',description:'誕生日や記念日に、飾る楽しみを贈る。生花とは異なるプリザーブドフラワーのアレンジを集めました。',tip:'置く場所に合う大きさを確認。プリザーブドフラワーは加工した花で、水やりは不要ですが湿気や直射日光を避けます。'},
  {id:'gourmet',name:'おいしい時間',short:'おいしい時間',en:'AT THE TABLE',query:'スープ ギフト',number:'05',intro:'忙しい日にも、おいしい楽しみを。',description:'朝ごはんやもう一品にうれしいスープのギフト。保存方法や調理の手間も比べながら、相手のペースに合うものを選べます。',tip:'常温・冷蔵・冷凍の違いと、保管スペースを確認。食材のアレルギーや食事の制約にも配慮してください。'},
  {id:'catalog',name:'選べるギフト',short:'選べるギフト',en:'THE JOY OF CHOOSING',query:'カタログギフト',number:'06',intro:'選ぶ時間まで、贈りものに。',description:'好みがわからない相手には、選択肢を贈るという方法も。掲載ジャンルや申込方法を確認して、使いやすい一冊を。',tip:'販売価格と掲載商品の価格帯は異なります。有効期限、システム料、申込方法を確認してから選びましょう。'}
];
export function validUrl(value, hosts) {try {const u=new URL(value);return u.protocol==='https:' && hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h))?u.href:null;}catch{return null;}}
export function normalizeItem(i) {
 const url=validUrl(i.affiliateUrl,['hb.afl.rakuten.co.jp']);
 const raw=i.mediumImageUrls?.[0];const image=validUrl(typeof raw==='string'?raw:raw?.imageUrl,['rakuten.co.jp','rakuten.ne.jp']);
 if(!i.itemName||!url||!image||!Number.isFinite(i.itemPrice)||i.itemPrice<=0)return null;
 return {id:i.itemCode,title:i.itemName,url,image,price:i.itemPrice,shop:i.shopName||'',rating:Number(i.reviewAverage)||0,reviews:Number(i.reviewCount)||0,freeShipping:i.postageFlag===0};
}
export async function fetchCollection(c,env) {
 const u=new URL('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701');
 const params={applicationId:env.RAKUTEN_APPLICATION_ID,affiliateId:env.RAKUTEN_AFFILIATE_ID,keyword:c.query,hits:30,formatVersion:2,format:'json',imageFlag:1,availability:1,minPrice:1000,maxPrice:30000,NGKeyword:'ふるさと納税 訳あり',sort:'standard'};
 if(!params.applicationId||!params.affiliateId||!env.RAKUTEN_ACCESS_KEY)throw new Error('catalog_credentials_missing');
 for(const [k,v] of Object.entries(params))u.searchParams.set(k,String(v));
 const r=await fetch(u,{headers:{accessKey:env.RAKUTEN_ACCESS_KEY,Referer:'https://www.jev.jp/',Origin:'https://www.jev.jp'},signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw new Error('catalog_upstream_'+r.status);
 const data=await r.json();const items=(data.Items||data.items||[]).map(i=>normalizeItem(i.Item||i)).filter(Boolean);
 if(!items.length)throw new Error('catalog_empty');
 return {updatedAt:new Date().toISOString(),items};
}
export function filterItems(items,params) {
 const budget=Number(params.get('budget'))||0; const ship=params.get('shipping')==='free';
 let result=items.filter(i=>(!budget||i.price<=budget)&&(!ship||i.freeShipping));
 if(params.get('sort')==='price')result.sort((a,b)=>a.price-b.price);
 if(params.get('sort')==='reviews')result.sort((a,b)=>b.reviews-a.reviews);
 return result;
}
export function isFresh(catalog,now=Date.now()) {return !!catalog&&Number.isFinite(Date.parse(catalog.updatedAt))&&now-Date.parse(catalog.updatedAt)<86400000;}
