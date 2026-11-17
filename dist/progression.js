(function(root){
  'use strict';
  const base=typeof module!=='undefined'&&module.exports?require('./engine.js'):root;
  const kit=typeof module!=='undefined'&&module.exports?require('./combat-kit.js'):root.AbyssKit;
  const extra=[
    ['aster','阿斯特拉','占星师',5,'潮','#8fc9ed',154,0,'群星坠落','她用失落星图，计算神明下一次睁眼的时间。'],
    ['rook','罗克','猎魔人',4,'焰','#dc9479',185,1,'猎魔银弩','枪声之后，雾里响起了第二次心跳。'],
    ['seraph','瑟拉芙','驱魔师',5,'辉','#e6d59b',142,2,'圣烬祈愿','她所守护的不是神，而是仍未放弃的人。'],
    ['corvus','科沃斯','疫医',4,'森','#9fb798',166,3,'黑羽疫雾','没有人知道面具下的人，是否还活着。'],
    ['nyra','奈莉娅','潮汐神谕',6,'潮','#80ddcf',190,0,'万海归潮','最后一位听得懂深海之语的王女。'],
    ['orion','奥利安','星骸骑士',6,'幽','#c5afe9',215,3,'群星终焉','他的誓言，比他所侍奉的王国更长久。'],
    ['mira','米拉','时钟匠',5,'辉','#d4ae6b',170,1,'第十三时刻','每一只停摆的怀表，都封存着一场灾厄。'],
    ['ren','莲','封印剑士',5,'焰','#de858b',200,3,'无明斩', '他以自己的名字，封住了刀中的恶梦。']
  ];
  const CATALOG=[...base.HEROES.map((h,i)=>({...h,key:h.art,rarity:i===0?5:4,element:['森','潮','辉','幽'][i],supportKind:i})),...extra.map(([key,name,role,rarity,element,color,attack,supportKind,skill,lore])=>({key,art:key,name,role,rarity,element,color,attack,supportKind,skill,lore,type:['aster','nyra','ren'].includes(key)?'贯通':'反射',description:['追击生命最低的敌人。','对全体敌人发起远程攻击。','恢复生命与理智，并攻击最近的敌人。','集中攻击生命最高的敌人。'][supportKind]}))];
  for(const h of CATALOG){const k=kit.SKILLS[h.key];h.skill=k.support;h.ultimate=k.ultimate;h.description=k.text;h.ultimateDescription=k.ultText;h.combatRole=k.role;h.formTitle=k.form;h.color=k.color;}
  const portrait=h=>`assets/${h.key||h.art}-${h.awake>0?'awakened':'base'}-v4.jpg`;
  const CHAPTERS=[{name:'雾锁印斯茅斯',en:'INNSMOUTH',story:'一封潮湿的信，把你带到这座没有钟声的港口。',color:'#7fc7b0'}, {name:'沉没的圣堂',en:'THE DROWNED CHAPEL',story:'钟楼沉入海底之后，祷告仍然没有停止。',color:'#a6b8e4'}, {name:'群星归位之夜',en:"R’LYEH",story:'在梦与现实的缝隙中，旧日之城终于浮出水面。',color:'#d2a6cb'}];
  const names=['潮湿的来信','没有归途的街','雾港的凝视者','深海阶梯','无声的祷告','圣堂守门人','异星回廊','群星之门','旧日支配者'];
  const QUESTS=names.map((name,i)=>({id:i,name,chapter:Math.floor(i/3),number:`${Math.floor(i/3)+1}-${i%3+1}`,cost:6+i*2,level:1+i*4,power:700+i*200,gold:700+i*220,exp:18+i*6,gems:150+i*25,sigils:1+Math.floor(i/3),boss:i%3===2}));
  const MISSIONS=[{id:'first',name:'第一次调查',desc:'完成任意关卡 1 次',stat:'wins',target:1,gems:300,gold:1000},{id:'summoner',name:'回应群星的呼唤',desc:'累计召唤 10 次',stat:'pulls',target:10,gems:600,gold:2000},{id:'training',name:'黑暗中的灯火',desc:'累计提升角色等级 10 次',stat:'levels',target:10,gems:300,gold:2500},{id:'chapter1',name:'雾港调查报告',desc:'通关主线 1-3',quest:2,gems:500,gold:3000},{id:'chapter2',name:'沉没的秘密',desc:'通关主线 2-3',quest:5,gems:700,gold:5000},{id:'chapter3',name:'让群星归于沉寂',desc:'通关主线 3-3',quest:8,gems:1200,gold:10000}];
  const KEY='abyssal-campaign-v3';
  const integer=(v,min,max,fallback=min)=>Number.isFinite(v)?Math.max(min,Math.min(max,Math.floor(v))):fallback;
  const fresh=(now=Date.now())=>({version:3,gems:3000,gold:18000,exp:160,sigils:6,stamina:60,staminaAt:now,rankExp:0,owned:Object.fromEntries(CATALOG.slice(0,4).map(h=>[h.key,{level:1,awake:0,shards:0,luck:1}])),team:CATALOG.slice(0,4).map(h=>h.key),clears:{},stats:{wins:0,pulls:0,levels:0},claimed:[],pity:0,daily:'',activeRun:null,lastResults:[]});
  function normalize(raw,now=Date.now()){
    if(!raw||raw.version!==3||typeof raw.owned!=='object'||!raw.owned)return fresh(now);
    const s=fresh(now);for(const k of ['gems','gold','exp','sigils','rankExp'])s[k]=integer(raw[k],0,99999999,s[k]);
    s.stamina=integer(raw.stamina,0,60,60);s.staminaAt=integer(raw.staminaAt,0,now,now);s.pity=integer(raw.pity,0,29);s.daily=typeof raw.daily==='string'?raw.daily:'';
    for(const h of CATALOG){const v=raw.owned[h.key];if(v&&typeof v==='object'){const awake=integer(v.awake,0,4);s.owned[h.key]={awake,level:integer(v.level,1,20+awake*20,1),shards:integer(v.shards,0,999999),luck:integer(v.luck,1,99,1)};}}
    const team=Array.isArray(raw.team)?[...new Set(raw.team.filter(k=>s.owned[k]))].slice(0,4):[];for(const k of Object.keys(s.owned))if(team.length<4&&!team.includes(k))team.push(k);s.team=team;
    for(const q of QUESTS){const c=raw.clears?.[q.id];if(c)s.clears[q.id]={stars:integer(c.stars,1,3,1),best:integer(c.best,0,99999999),count:integer(c.count,1,999999,1)};}
    for(const k of Object.keys(s.stats))s.stats[k]=integer(raw.stats?.[k],0,99999999);
    s.claimed=Array.isArray(raw.claimed)?raw.claimed.filter(id=>MISSIONS.some(m=>m.id===id)):[];
    s.lastResults=Array.isArray(raw.lastResults)?raw.lastResults.slice(0,10).filter(r=>CATALOG.some(h=>h.key===r?.key)).map(r=>({key:r.key,rarity:CATALOG.find(h=>h.key===r.key).rarity,isNew:!!r.isNew,shards:integer(r.shards,0,80)})):[];
    // A battle interrupted by a refresh is abandoned; no pending result can be claimed twice.
    return s;
  }
  function stats(h,owned){const o=owned||{level:1,awake:0,luck:1},scale=1+(o.level-1)*.045+o.awake*.12,k=kit.SKILLS[h.key];return {...h,description:k.text,skill:k.support,ultimate:k.ultimate,ultimateDescription:k.ultText,formTitle:k.form,level:o.level,awake:o.awake,luck:o.luck,attack:Math.round(h.attack*scale),hp:Math.round((1800+h.rarity*70)*scale),supportScale:scale};}
  function waves(q){const c=q.chapter,scale=.62+q.id*.23;return [0,1,2].map((wave)=>{const original=base.STAGES[c];const modifier=scale*(.72+wave*.20);return {...original,name:`${q.name} · ${wave===2?'首领':`第 ${wave+1} 战`}`,title:wave===2?original.title:['巡游的深潜者','深渊的眷属'][wave],reward:100, enemies:original.enemies.map((e,i)=>({...e,sprite:i===0&&wave===2?['watcher','warden','boss'][c]:'minion',bossKind:i===0&&wave===2?['watcher','warden','cthulhu'][c]:undefined,counter:i===0&&wave===2?1:e.cooldown,hp:Math.round(e.hp*modifier*(i===0&&wave===2?1.9:1)),damage:Math.round(e.damage*(.7+q.id*.13)),art:wave<2&&i===0?'deep-one':e.art,name:wave<2&&i===0?'精英深潜者':e.name,x:wave===1?500-e.x:e.x}))};});}
  class Campaign{
    constructor(storage,now=Date.now){this.storage=storage;this.now=now;this.saveError=false;let raw;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}this.state=normalize(raw,this.now());this.tick();}
    save(){try{this.storage?.setItem(KEY,JSON.stringify(this.state));this.saveError=false;}catch{this.saveError=true;}return !this.saveError;}
    tick(){const s=this.state,now=this.now(),gain=Math.floor((now-s.staminaAt)/300000);if(s.stamina>=60)s.staminaAt=now;else if(gain>0){s.stamina=Math.min(60,s.stamina+gain);s.staminaAt=s.stamina===60?now:s.staminaAt+gain*300000;}return s.stamina;}
    hero(key){const h=CATALOG.find(h=>h.key===key);return h?stats(h,this.state.owned[key]):null;}
    party(){return this.state.team.map(k=>this.hero(k));}
    power(){return this.party().reduce((n,h)=>n+h.attack,0);}
    unlocked(id){return id===0||!!this.state.clears[id-1];}
    summon(count,rng=Math.random){
      if(count!==1&&count!==10)throw new Error('请选择单次或十连召唤');const s=this.state,cost=count===10?2700:300;if(s.gems<cost)throw new Error('星晶不足，可通过调查、任务与每日补给获得');
      const results=[];s.gems-=cost;
      for(let i=0;i<count;i++){
        s.pity++;const roll=rng();let rarity=s.pity>=30?6:roll<.04?6:roll<.28?5:4;
        if(count===10&&i===9&&!results.some(h=>h.rarity>=5))rarity=Math.max(rarity,5);
        if(rarity===6)s.pity=0;const pool=CATALOG.filter(h=>h.rarity===rarity),h=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))],isNew=!s.owned[h.key];
        const shards=rarity===6?80:rarity===5?40:20;
        if(isNew)s.owned[h.key]={level:1,awake:0,shards:0,luck:1};else{s.owned[h.key].shards+=shards;s.owned[h.key].luck=Math.min(99,s.owned[h.key].luck+5);}
        results.push({key:h.key,rarity,isNew,shards:isNew?0:shards});
      }
      s.stats.pulls+=count;s.lastResults=results;this.save();return results;
    }
    train(key,count=1){const s=this.state,o=s.owned[key];if(!o)throw new Error('尚未拥有这位调查员');if(count!==1&&count!==5)throw new Error('无效的强化次数');let levels=0,gold=0,exp=0;const max=20+o.awake*20;
      for(let i=0;i<count&&o.level+i<max;i++){gold+=(o.level+i)*65;exp+=Math.ceil((o.level+i)*.8+2);levels++;}
      if(!levels)throw new Error('已达等级上限，觉醒后可继续强化');if(s.gold<gold||s.exp<exp)throw new Error(`材料不足，需要 ${gold} 金币与 ${exp} 残响`);
      s.gold-=gold;s.exp-=exp;o.level+=levels;s.stats.levels+=levels;this.save();return levels;
    }
    awaken(key){const s=this.state,o=s.owned[key];if(!o)throw new Error('尚未拥有这位调查员');if(o.awake>=4)throw new Error('已完成全部觉醒');if(o.level<20+o.awake*20)throw new Error('达到当前等级上限后可觉醒');const cost=3*(o.awake+1),gold=2000*(o.awake+1);if(s.sigils<cost||s.gold<gold)throw new Error(`需要 ${cost} 古印与 ${gold} 金币`);s.sigils-=cost;s.gold-=gold;o.awake++;this.save();}
    exchangeShards(key){const o=this.state.owned[key];if(!o||o.shards<20)throw new Error('需要 20 枚该角色魂片');o.shards-=20;this.state.exp+=30;this.save();}
    equip(key,slot){const s=this.state;if(!s.owned[key]||!Number.isInteger(slot)||slot<0||slot>3)throw new Error('无效的编队选择');const old=s.team.indexOf(key);if(old>=0)[s.team[old],s.team[slot]]=[s.team[slot],s.team[old]];else s.team[slot]=key;this.save();}
    begin(id){const q=QUESTS[id],s=this.state;this.tick();if(s.activeRun)throw new Error('请先完成或退出当前调查');if(!q||!this.unlocked(id))throw new Error('完成前一关后解锁');if(s.stamina<q.cost)throw new Error('体力不足，每 5 分钟恢复 1 点，也可领取补给或在商店补充');if(s.stamina===60)s.staminaAt=this.now();s.stamina-=q.cost;s.activeRun={quest:id,token:`${this.now()}-${Math.random().toString(36).slice(2)}`};this.save();return {tactical:true,stages:waves(q),party:this.party(),maxHp:this.party().reduce((n,h)=>n+h.hp,0)};}
    finish(won,details={}){const s=this.state,run=s.activeRun;if(!run)return null;s.activeRun=null;
      if(!won){this.save();return {won:false};}const q=QUESTS[run.quest],first=!s.clears[q.id],stars=1+(details.hpRatio>=.5?1:0)+(details.shots<=16?1:0),old=s.clears[q.id];
      const luckGold=Math.floor(q.gold*(s.owned[s.team[0]].luck-1)*.01),reward={won:true,first,stars,gold:q.gold+luckGold,luckGold,exp:q.exp,gems:first?q.gems:0,sigils:q.sigils};s.gold+=reward.gold;s.exp+=reward.exp;s.gems+=reward.gems;s.sigils+=reward.sigils;s.rankExp+=100+q.id*30;s.stats.wins++;
      s.clears[q.id]={stars:Math.max(stars,old?.stars||0),best:Math.max(details.score||0,old?.best||0),count:(old?.count||0)+1};this.save();return reward;
    }
    abandon(){this.state.activeRun=null;this.save();}
    missionReady(m){return m.quest!==undefined?!!this.state.clears[m.quest]:this.state.stats[m.stat]>=m.target;}
    claim(id){const m=MISSIONS.find(m=>m.id===id),s=this.state;if(!m||s.claimed.includes(id)||!this.missionReady(m))throw new Error('任务奖励尚不可领取');s.claimed.push(id);s.gems+=m.gems;s.gold+=m.gold;this.save();return m;}
    dailyClaim(){const d=new Date(this.now()),today=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`,s=this.state;if(s.daily===today)throw new Error('今日补给已经领取');s.daily=today;s.gems+=300;s.exp+=30;s.stamina=Math.min(60,s.stamina+30);this.save();}
    dailyReady(){const d=new Date(this.now());return this.state.daily!==`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;}
    buy(item){const s=this.state;if(item==='energy'){this.tick();if(s.stamina===60)throw new Error('体力已满');if(s.gems<50)throw new Error('星晶不足');s.gems-=50;s.stamina=Math.min(60,s.stamina+30);}else if(item==='exp'){if(s.gold<1000)throw new Error('金币不足');s.gold-=1000;s.exp+=30;}else if(item==='sigil'){if(s.gems<100)throw new Error('星晶不足');s.gems-=100;s.sigils+=3;}else throw new Error('未知商品');this.save();}
  }
  const api={portrait,Campaign,CATALOG,CHAPTERS,QUESTS,MISSIONS,KEY,fresh,normalize,stats,waves};if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,{AbyssProgress:api});
})(typeof window!=='undefined'?window:globalThis);
