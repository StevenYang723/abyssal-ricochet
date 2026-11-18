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
    ['ren','莲','封印剑士',5,'焰','#de858b',200,3,'无明斩', '他以自己的名字，封住了刀中的恶梦。'],
    ['vesper','薇丝珀','镜月修女',5,'幽','#c7a6ec',174,1,'棱光十字','她打碎了神像，却在每一片镜中看见相同的月亮。'],
    ['bram','布拉姆','熔星爆破手',4,'焰','#e8a069',184,1,'熔星震爆','他替矿井里的亡者，留下最后一声轰鸣。'],
    ['iris','艾瑞丝','迷途测绘师',4,'潮','#77cfc6',158,1,'千帆星雨','地图上没有归途，她便为每一个同伴重新画一条。'],
    ['galen','盖伦','银镜术士',5,'辉','#b6d7ea',169,1,'镜廊折光','镜面从不说谎，只会把真相折向另一个方向。'],
    ['lyra','莉拉','挽歌弦师',5,'幽','#d5a5e5',161,1,'命运弦线','她与同伴之间的琴弦，连死亡也无法轻易切断。'],
    ['morrow','莫罗','失重观星者',6,'幽','#9caff3',181,1,'坍缩星井','他曾为一颗死星守夜，直到群星开始向他坠落。'],
    ['thalia','塔莉娅','黑荆园丁',4,'森','#99c17f',163,1,'荆棘行迹','每一寸被吞没的道路，都会在她身后重新生长。'],
    ['sable','塞布尔','终夜指挥家',6,'辉','#e2c58a',172,1,'共鸣接力','终夜的乐章没有独奏者，只有仍然相互回应的人。']
  ];
  extra.push(
    ['maren','玛琳','潮路领航员',5,'潮','#88cdc5',155,1,'双舷破浪','她记得每一条航线，连被海图抹去的那一条也记得。'],
    ['oren','欧伦','沉钟校音师',4,'辉','#dcb879',148,0,'空心钟鸣','他能听出一座钟究竟是在报时，还是在求救。'],
    ['ada','艾达','底片显影师',6,'幽','#cba9ce',169,1,'滞光底片','暗房里多出了一张她尚未拍摄的照片。'],
    ['siv','西芙','风暴救护员',5,'潮','#acd7b9',146,2,'航道浮灯','雾里只要还有一盏绿灯，就还有人等你靠岸。']
  );
  const CATALOG=[...base.HEROES.map((h,i)=>({...h,key:h.art,rarity:i===0?5:4,element:['森','潮','辉','幽'][i],supportKind:i})),...extra.map(([key,name,role,rarity,element,color,attack,supportKind,skill,lore])=>({key,art:key,name,role,rarity,element,color,attack,supportKind,skill,lore,type:['aster','nyra','ren','iris','lyra','morrow','thalia','maren','siv'].includes(key)?'贯通':'反射',description:['追击生命最低的敌人。','对全体敌人发起远程攻击。','恢复生命与理智，并攻击最近的敌人。','集中攻击生命最高的敌人。'][supportKind]}))];
  for(const h of CATALOG){const k=kit.SKILLS[h.key];h.skill=k.support;h.ultimate=k.ultimate;h.description=k.text;h.ultimateDescription=k.ultText;h.combatRole=k.role;h.formTitle=k.form;h.color=k.color;}
  const newKeys=new Set(['vesper','bram','iris','galen','lyra','morrow','thalia','sable']);
  const harborHeroes=new Set(['maren','oren','ada','siv']);
  function portrait(h){
    const key=h.key||h.art;
    const version=harborHeroes.has(key)?7:newKeys.has(key)?6:h.awake>0?5:2;
    return `assets/${key}${h.awake>0?'-awakened':''}-v${version}.jpg`;
  }
  const UNLIMITED_GEMS=true;
  const CHAPTERS=[
    {name:'雾锁印斯茅斯',en:'INNSMOUTH',story:'一封潮湿的信，把你带到这座没有钟声的港口。',color:'#7fc7b0',bossKey:'watcher',bossArt:'assets/watcher-v3.png',strategy:'借助同伴援护突破雾港，离开凝视光束与孢子毒池。'},
    {name:'沉没的圣堂',en:'THE DROWNED CHAPEL',story:'钟楼沉入海底之后，祷告仍然没有停止。',color:'#a6b8e4',bossKey:'warden',bossArt:'assets/warden-v3.png',strategy:'十字光带留下四角空隙，破甲与毒伤可以穿透圣堂铁壁。'},
    {name:'群星归位之夜',en:"R’LYEH",story:'在梦与现实的缝隙中，旧日之城终于浮出水面。',color:'#d2a6cb',bossKey:'cthulhu',bossArt:'assets/boss-v2.png',strategy:'预留落点躲开黑潮；蚀月降临前进入安全圆。'},
    {name:'碎月镜廊',en:'THE FRACTURED MOON',story:'月光在破碎镜廊里折返，每一道影子都在寻找自己的主人。',color:'#bba6e5',bossKey:'prism',bossArt:'assets/prism-v6.png',strategy:'镜柱将战场分成斜向通道。十字激光与折射光束适合贯穿分散敌人。'},
    {name:'熔星铸炉',en:'THE STARFORGE',story:'矿工从地底挖出一颗仍在跳动的星，铸炉从此不再熄灭。',color:'#dfa26e',bossKey:'forge',bossArt:'assets/forge-v6.png',strategy:'绕过炉心进入侧翼。圆形爆破能清理聚集的铸炉眷属，热浪中注意内外安全区。'},
    {name:'黑山胎园',en:'THE BLACKWOOD CRADLE',story:'失踪者的低语藏在树根深处，黑山的母亲正在等待下一次春天。',color:'#9dbc82',bossKey:'garden',bossArt:'assets/garden-v6.png',strategy:'用引力井聚拢小怪，再以荆棘轨迹、毒雾或连携引爆清场；避免停留在根系和毒域中。'}
  ];
  CHAPTERS.push(
    {name:'漂骨湾',en:'THE OSSUARY SOUND',story:'退潮时，海面浮出一排白肋。第二天，它们离港口更近了。',color:'#91c9bd',bossKey:'whale',bossArt:'assets/whale-v7.png',strategy:'穿过两股鲸汐之间的航道。鲸歌响起前，靠近两座避潮灯中的任意一座。'},
    {name:'哑钟修院',en:'THE SILENT BELFRY',story:'修院封了七十年。今夜，全镇的钟摆都转向了它。',color:'#d2ab81',bossKey:'prior',bossArt:'assets/prior-v7.png',strategy:'绕到钟摆侧面躲扇斩。回声环内外皆可停留，裂钟落地时会夺走圈内队友的秘术能量。'}
  );
  const names=['潮湿的来信','没有归途的街','雾港的凝视者','深海阶梯','无声的祷告','圣堂守门人','异星回廊','群星之门','旧日支配者','镜中的陌生人','折返的月光','镜渊织母','落星矿道','永夜炉心','熔星监工','不眠的苗圃','荆棘摇篮','黑山母树','浮肋浅滩','无人灯桩','拾骨鲸','逆摆阶梯','悼钟回廊','盲钟司祭'];
  const QUESTS=names.map((name,i)=>({id:i,name,chapter:Math.floor(i/3),number:`${Math.floor(i/3)+1}-${i%3+1}`,cost:6+i*2,level:1+i*4,power:700+i*200,gold:700+i*220,exp:18+i*6,gems:150+i*25,sigils:1+Math.floor(i/3),boss:i%3===2}));
  const MISSIONS=[{id:'first',name:'第一次调查',desc:'完成任意关卡 1 次',stat:'wins',target:1,gems:300,gold:1000},{id:'summoner',name:'回应群星的呼唤',desc:'累计召唤 10 次',stat:'pulls',target:10,gems:600,gold:2000},{id:'training',name:'黑暗中的灯火',desc:'累计提升角色等级 10 次',stat:'levels',target:10,gems:300,gold:2500},{id:'chapter1',name:'雾港调查报告',desc:'通关主线 1-3',quest:2,gems:500,gold:3000},{id:'chapter2',name:'沉没的秘密',desc:'通关主线 2-3',quest:5,gems:700,gold:5000},{id:'chapter3',name:'让群星归于沉寂',desc:'通关主线 3-3',quest:8,gems:1200,gold:10000},{id:'chapter4',name:'镜中的月亮',desc:'通关主线 4-3',quest:11,gems:1400,gold:12000},{id:'chapter5',name:'熄灭亡星',desc:'通关主线 5-3',quest:14,gems:1600,gold:15000},{id:'chapter6',name:'黎明不会缺席',desc:'通关主线 6-3',quest:17,gems:2000,gold:18000}];
  MISSIONS.push(
    {id:'chapter7',name:'为归船留灯',desc:'通关主线 7-3',quest:20,gems:2100,gold:20000},
    {id:'chapter8',name:'最后一响',desc:'通关主线 8-3',quest:23,gems:2400,gold:22000}
  );
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
  const layouts={
    prism:[
      {mobs:[[105,186],[250,244],[395,186],[120,350],[380,350]],pillars:[{x:250,y:350,r:24}]},
      {mobs:[[110,180],[250,180],[390,180],[110,340],[390,340]],pillars:[{x:188,y:280,r:19},{x:312,y:280,r:19}]},
      {mobs:[[95,280],[405,280],[150,375],[350,375]],pillars:[{x:250,y:315,r:22}]}
    ],
    forge:[
      {mobs:[[125,180],[375,180],[180,300],[320,300],[250,390]],pillars:[{x:100,y:315,r:23},{x:400,y:315,r:23}]},
      {mobs:[[100,200],[250,175],[400,200],[180,350],[320,350]],pillars:[{x:250,y:280,r:25}]},
      {mobs:[[95,285],[405,285],[195,365],[305,365]],pillars:[{x:140,y:365,r:17},{x:360,y:365,r:17}]}
    ],
    garden:[
      {mobs:[[170,170],[330,170],[250,260],[130,355],[370,355]],pillars:[{x:105,y:255,r:21},{x:395,y:255,r:21}]},
      {mobs:[[100,190],[250,200],[400,190],[200,340],[300,340]],pillars:[{x:125,y:390,r:20},{x:375,y:390,r:20}]},
      {mobs:[[140,275],[360,275],[95,375],[405,375]],pillars:[{x:205,y:350,r:18},{x:295,y:350,r:18}]}
    ]
  };
  layouts.whale=[
    {mobs:[[90,200],[300,195],[415,260],[175,328],[330,370]],pillars:[{x:190,y:240,r:20},{x:400,y:365,r:17}]},
    {mobs:[[90,238],[240,180],[395,218],[155,380],[340,320]],pillars:[{x:205,y:280,r:20}]},
    {mobs:[[96,260],[405,298],[194,368],[340,380]],pillars:[{x:175,y:282,r:18},{x:320,y:278,r:18}]}
  ];
  layouts.prior=[
    {mobs:[[90,195],[250,255],[409,195],[145,360],[355,360]],pillars:[{x:174,y:256,r:18},{x:328,y:256,r:18}]},
    {mobs:[[120,180],[380,180],[115,315],[380,334],[250,365]],pillars:[{x:250,y:250,r:23}]},
    {mobs:[[113,276],[381,263],[98,372],[392,385]],pillars:[{x:200,y:336,r:20},{x:300,y:336,r:20}]}
  ];
  function waves(q){
    const c=q.chapter,scale=.62+q.id*.23;
    if(c<3)return [0,1,2].map(wave=>{const original=base.STAGES[c],modifier=scale*(.72+wave*.20);return {...original,name:`${q.name} · ${wave===2?'首领':`第 ${wave+1} 战`}`,title:wave===2?original.title:['巡游的深潜者','深渊的眷属'][wave],reward:100,enemies:original.enemies.map((e,i)=>({...e,sprite:i===0&&wave===2?['watcher','warden','boss'][c]:'minion',bossKind:i===0&&wave===2?CHAPTERS[c].bossKey:undefined,counter:i===0&&wave===2?1:e.cooldown,hp:Math.round(e.hp*modifier*(i===0&&wave===2?1.9:1)),damage:Math.round(e.damage*(.7+q.id*.13)),art:wave<2&&i===0?'deep-one':e.art,name:wave<2&&i===0?'精英深潜者':e.name,x:wave===1?500-e.x:e.x}))};});
    const chapter=CHAPTERS[c],kind=chapter.bossKey,progress=q.id-9,local=q.id%3;
    const mobName={prism:'碎镜眷属',forge:'炉灰行者',garden:'黑荆幼体',whale:'沉船拾骨者',prior:'失声侍僧'}[kind];
    return [0,1,2].map(wave=>{
      const final=wave===2,layout=layouts[kind][final?2:(wave+local)%3],flip=local===1;
      const enemies=layout.mobs.map(([x,y],i)=>({x:flip?500-x:x,y,r:30+(i%2)*3,hp:Math.round((1000+progress*110)*(1+wave*.16)),art:'deep-one',sprite:kind==='prism'?'mirrorling':'minion',name:mobName,cooldown:2+i%2,counter:2+i%2,damage:Math.round(260+progress*20+wave*20)}));
      if(final)enemies.unshift({x:250,y:165+(kind==='forge'?15:0),r:kind==='garden'?66:62,hp:Math.round(11600+progress*900),art:kind,sprite:kind,bossKind:kind,name:kit.BOSSES[kind].name,cooldown:2,counter:1,damage:Math.round(540+progress*35)});
      else {enemies[0].name=`精英${mobName}`;enemies[0].hp=Math.round(enemies[0].hp*1.4);enemies[0].r=35;}
      return {name:`${q.name} · ${final?'首领':`第 ${wave+1} 战`}`,place:chapter.en,subtitle:chapter.name,title:final?enemies[0].name:wave===0?'迷失的巡游者':'深渊结阵',objective:`调查${chapter.name}`,description:chapter.strategy,reward:100,biome:kind,pillars:layout.pillars.map(p=>({...p,x:flip?500-p.x:p.x})),enemies};
    });
  }
  class Campaign{
    constructor(storage,now=Date.now){this.storage=storage;this.now=now;this.saveError=false;let raw;try{raw=JSON.parse(storage?.getItem(KEY)||'null');}catch{}this.state=normalize(raw,this.now());this.tick();}
    save(){try{this.storage?.setItem(KEY,JSON.stringify(this.state));this.saveError=false;}catch{this.saveError=true;}return !this.saveError;}
    tick(){const s=this.state,now=this.now(),gain=Math.floor((now-s.staminaAt)/300000);if(s.stamina>=60)s.staminaAt=now;else if(gain>0){s.stamina=Math.min(60,s.stamina+gain);s.staminaAt=s.stamina===60?now:s.staminaAt+gain*300000;}return s.stamina;}
    hero(key){const h=CATALOG.find(h=>h.key===key);return h?stats(h,this.state.owned[key]):null;}
    party(){return this.state.team.map(k=>this.hero(k));}
    power(){return this.party().reduce((n,h)=>n+h.attack,0);}
    canSpendGems(cost){return UNLIMITED_GEMS||this.state.gems>=cost;}
    spendGems(cost){if(!Number.isFinite(cost)||cost<0)throw new Error('无效的星晶消耗');if(!this.canSpendGems(cost))throw new Error('星晶不足');if(!UNLIMITED_GEMS)this.state.gems-=cost;}
    unlocked(id){return id===0||!!this.state.clears[id-1];}
    summon(count,rng=Math.random){
      if(count!==1&&count!==10)throw new Error('请选择单次或十连召唤');const s=this.state,cost=count===10?2700:300;
      const results=[];this.spendGems(cost);
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
    train(key,count=1){
      const hero=this.state.owned[key];
      if(!hero) throw new Error('尚未拥有这位调查员');
      if(count!==1 && count!==5) throw new Error('无效的强化次数');
      const levels=Math.min(count,20+hero.awake*20-hero.level);
      if(levels<=0) throw new Error('已达等级上限，觉醒后可继续强化');
      hero.level+=levels;this.state.stats.levels+=levels;this.save();return levels;
    }
    awaken(key){
      const hero=this.state.owned[key];
      if(!hero) throw new Error('尚未拥有这位调查员');
      if(hero.awake>=4) throw new Error('已完成全部觉醒');
      if(hero.level<20+hero.awake*20) throw new Error('达到当前等级上限后可觉醒');
      hero.awake++;this.save();
    }
    trainLuck(key){
      const hero=this.state.owned[key];
      if(!hero) throw new Error('尚未拥有这位调查员');
      if(hero.luck>=99) throw new Error('幸运已满');
      hero.luck=Math.min(99,hero.luck+5);this.save();
    }
    exchangeShards(key){
      if(!this.state.owned[key]) throw new Error('尚未拥有这位调查员');
      this.state.exp+=30;this.save();
    }
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
    buy(item){const s=this.state;if(item==='energy'){this.tick();if(s.stamina===60)throw new Error('体力已满');this.spendGems(50);s.stamina=Math.min(60,s.stamina+30);}else if(item==='exp'){s.exp+=30;}else if(item==='sigil'){this.spendGems(100);s.sigils+=3;}else throw new Error('未知商品');this.save();}
  }
  const api={portrait,Campaign,CATALOG,CHAPTERS,QUESTS,MISSIONS,KEY,UNLIMITED_GEMS,fresh,normalize,stats,waves};if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,{AbyssProgress:api});
})(typeof window!=='undefined'?window:globalThis);
