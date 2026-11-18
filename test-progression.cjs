const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Campaign,CATALOG,CHAPTERS,QUESTS,KEY,UNLIMITED_GEMS,portrait,normalize,waves,stats}=require('./dist/progression.js');
const {AbyssEngine}=require('./dist/engine.js');
let now=100000000;
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
const store=memory();let c=new Campaign(store,()=>now);
assert.equal(c.party().length,4);assert.equal(c.state.gems,3000);assert.equal(c.unlocked(1),false);
assert.throws(()=>c.begin(1),/前一关/);assert.equal(c.state.stamina,60);
const start=c.begin(0);assert.equal(c.state.stamina,54);assert.equal(start.stages.length,3);assert.throws(()=>c.begin(0),/当前调查/);
const reward=c.finish(true,{hpRatio:.8,shots:10,score:6000});assert.equal(reward.stars,3);assert.equal(reward.gems,150);assert(c.unlocked(1));const balance=c.state.gold;assert.equal(c.finish(true),null);assert.equal(c.state.gold,balance,'Rewards cannot be claimed twice');
c.begin(0);assert.equal(c.finish(true,{hpRatio:.3,shots:22}).gems,0);assert.equal(c.state.clears[0].stars,3,'Replay cannot downgrade stars');
c.begin(1);c.finish(false);assert(!c.state.clears[1]);
now+=300000*2;const before=c.state.stamina;c.tick();assert.equal(c.state.stamina,before+2);c.tick();assert.equal(c.state.stamina,before+2);
c.dailyClaim();assert.throws(()=>c.dailyClaim(),/已经领取/);now+=86400000;c.dailyClaim();assert.equal(c.state.stamina,60);
c=new Campaign(memory(),()=>now);c.state.gems=0;const ten=c.summon(10,()=>.9);assert.equal(c.state.gems,0);assert.equal(ten.length,10);assert(ten.some(h=>h.rarity>=5),'Ten-pull minimum rarity');assert(c.state.owned[ten[0].key].shards>0,'Duplicates become shards');assert(UNLIMITED_GEMS);assert(c.canSpendGems(2700));assert.throws(()=>c.summon(5),/单次或十连/);
c.state.pity=29;const pity=c.summon(1,()=>.9);assert.equal(pity[0].rarity,6);assert.equal(c.state.pity,0);assert.equal(c.state.stats.pulls,11);
// Free summons stay usable at zero stored gems, including after save/reload.
const freeStore=memory();let free=new Campaign(freeStore,()=>now);free.state.gems=0;
for(let i=0;i<20;i++)assert.equal(free.summon(10,()=>.9).length,10);
free=new Campaign(freeStore,()=>now);assert.equal(free.state.gems,0);assert.equal(free.state.stats.pulls,200);free.summon(10,()=>.9);assert.equal(free.state.stats.pulls,210);assert(Number.isFinite(JSON.parse(freeStore.getItem(KEY)).gems));
free.state.stamina=0;free.buy('energy');assert.equal(free.state.stamina,30);const seals=free.state.sigils;free.buy('sigil');assert.equal(free.state.sigils,seals+3);assert.equal(free.state.gems,0,'All star-gem purchases honor the unlimited wallet');
for(const h of CATALOG){const pool=CATALOG.filter(x=>x.rarity===h.rarity);let roll=0;const probe=new Campaign(memory(),()=>now);const result=probe.summon(1,()=>roll++%2===0?(h.rarity===6?.01:h.rarity===5?.1:.8):(pool.indexOf(h)+.5)/pool.length);assert.equal(result[0].key,h.key,'Every catalog hero is obtainable from the advertised rarity pool');}
const newKey=pity[0].key;c.equip(newKey,2);assert.equal(c.state.team[2],newKey);const original=c.state.team[0];c.equip(original,2);assert.equal(c.state.team[2],original);assert.equal(new Set(c.state.team).size,4,'No duplicate team members');assert.throws(()=>c.equip('fake',0));
const attack=c.hero('evelyn').attack;const gold=c.state.gold,exp=c.state.exp;c.train('evelyn',5);assert.equal(c.state.owned.evelyn.level,6);assert(c.hero('evelyn').attack>attack);assert(c.state.gold===gold&&c.state.exp===exp);assert.throws(()=>c.awaken('evelyn'),/等级上限/);
c.state.owned.evelyn.level=20;c.state.sigils=6;c.state.gold=10000;c.awaken('evelyn');assert.equal(c.state.owned.evelyn.awake,1);assert.equal(c.state.sigils,6);c.train('evelyn');assert.equal(c.state.owned.evelyn.level,21);
// A zero-balance legacy save can reach all four awakenings and maximum luck.
const emptyStore=memory();
const empty=new Campaign(emptyStore,()=>now);
Object.assign(empty.state,{gold:0,exp:0,sigils:0});
empty.save();
const returning=new Campaign(emptyStore,()=>now);
const hero=returning.state.owned.evelyn;
while(hero.level<100){
  const cap=20+hero.awake*20;
  if(hero.level===cap) returning.awaken('evelyn');
  else returning.train('evelyn',5);
}
while(hero.luck<99) returning.trainLuck('evelyn');
assert.deepEqual(hero,{level:100,awake:4,shards:0,luck:99});
assert.throws(()=>returning.awaken('evelyn'),/全部觉醒/);
assert.throws(()=>returning.train('evelyn'),/等级上限/);
assert.throws(()=>returning.trainLuck('evelyn'),/已满/);
assert.throws(()=>returning.trainLuck('maren'),/尚未拥有/);
assert.deepEqual([returning.state.gold,returning.state.exp,returning.state.sigils],[0,0,0]);
const maxed=new Campaign(emptyStore,()=>now);
assert.deepEqual(maxed.state.owned.evelyn,hero);
c.exchangeShards('evelyn');
assert(c.missionReady({stat:'levels',target:5}));
c.state.stats.wins=1;c.claim('first');assert.throws(()=>c.claim('first'));
assert.throws(()=>c.claim('chapter3'));
c.state.stamina=60;assert.throws(()=>c.buy('energy'),/已满/);c.state.gold=0;c.buy('exp');assert.equal(c.state.gold,0);
c.save();const loaded=new Campaign(c.storage,()=>now);assert.equal(loaded.hero('evelyn').level,21);assert.deepEqual(loaded.state.team,c.state.team);assert.deepEqual(loaded.state.owned,c.state.owned);
const malicious=normalize({...c.state,team:['evil','evelyn','evelyn'],gold:-20,gems:Infinity,owned:{...c.state.owned,evelyn:{level:9999,awake:99,luck:-1}}},now);assert.equal(malicious.gold,0);assert.equal(malicious.owned.evelyn.level,100);assert.equal(malicious.team.length,4);assert.equal(new Set(malicious.team).size,4);assert(!malicious.team.includes('evil'));
const corrupt=memory();corrupt.setItem(KEY,'{bad JSON');assert.equal(new Campaign(corrupt).state.gems,3000);const denied=new Campaign({getItem(){throw Error()},setItem(){throw Error()}});assert.equal(denied.save(),false);assert(denied.saveError);
assert.equal(CATALOG.length,24);assert.equal(CHAPTERS.length,8);assert.equal(QUESTS.length,24);
const legacy=normalize({...c.state,clears:Object.fromEntries(QUESTS.slice(0,9).map(q=>[q.id,{stars:3,best:1234,count:2}]))},now);const migrated=new Campaign(memory(),()=>now);migrated.state=legacy;assert(migrated.unlocked(9));assert.equal(migrated.state.owned.evelyn.level,21);assert.equal(migrated.state.clears[8].best,1234);
for(const q of QUESTS.slice(9)){const stages=waves(q);assert.equal(stages.length,3);assert.equal(stages[2].enemies[0].bossKind,CHAPTERS[q.chapter].bossKey);assert(stages.every(s=>Array.isArray(s.pillars)&&s.enemies.length>=4));for(const stage of stages)for(const enemy of stage.enemies)for(const pillar of stage.pillars)assert(Math.hypot(enemy.x-pillar.x,enemy.y-pillar.y)>enemy.r+pillar.r,'Authored formations never start inside pillars');}
assert.equal(new Set(QUESTS.slice(9).map(q=>JSON.stringify(waves(q).map(s=>s.enemies.map(e=>[e.x,e.y]))))).size,QUESTS.slice(9).length,'Each new quest has a distinct formation sequence');
// A slotted healer retains their actual skill; a pierce hero passes through enemies.
const customized=new AbyssEngine();customized.reset({stages:waves(QUESTS[0]),party:[stats(CATALOG[8],{level:10,awake:0}),stats(CATALOG[2],{level:10,awake:0}),stats(CATALOG[1],{level:10,awake:0}),stats(CATALOG[0],{level:10,awake:0})],maxHp:12000});customized.hp=10000;customized.launch(0,-1);customized.support(customized.heroes[1]);assert(customized.hp>10500);const enemy=customized.enemies[0];customized.current.x=enemy.x;customized.current.y=enemy.y+enemy.r+21;customized.current.vx=0;customized.current.vy=-400;customized.update(1/120);assert(customized.current.vy<0,'Piercing hero does not reflect off enemies');
function simulate(g){let n=0;while(g.mode==='moving'&&n++<900)g.update(1/120);assert(n<900);}
// Play every quest, including the final boss, through the actual physics engine.
const summary=[];
function playQuest(q,lineup=CATALOG.slice(0,4)){const level=Math.max(1,q.level),party=lineup.map(h=>stats(h,{level,awake:Math.floor((level-1)/20)}));const g=new AbyssEngine();g.reset({tactical:true,stages:waves(q),party,maxHp:party.reduce((n,h)=>n+h.hp,0)});let turns=0;
 while(g.mode!=='victory'&&g.mode!=='defeat'&&turns<60){if(g.mode==='cleared'){g.nextStage();continue;}let bestAngle=0,bestValue=-Infinity;for(let i=0;i<48;i++){const sim=new AbyssEngine();for(const[k,v]of Object.entries(g))if(typeof v!=='function')sim[k]=JSON.parse(JSON.stringify(v));if(sim.energy===100)sim.armUltimate();const a=i*Math.PI/24;sim.launch(Math.cos(a),Math.sin(a));simulate(sim);const value=g.stageHp-sim.stageHp+Math.max(0,sim.hp-g.hp)*.25+(sim.mode==='cleared'||sim.mode==='victory'?1000:0);if(value>bestValue){bestValue=value;bestAngle=a;}}if(g.energy===100)g.armUltimate();g.launch(Math.cos(bestAngle),Math.sin(bestAngle));simulate(g);turns++;}
 assert.equal(g.mode,'victory',`Quest ${q.number} must be winnable at its recommended level with ${lineup.map(h=>h.key).join('/')}`);return {quest:q.number,level,shots:g.totalShots,hp:g.hp,sanity:g.sanity};}
for(const q of QUESTS)summary.push(playQuest(q));
const spatialParties=[playQuest(QUESTS[11],CATALOG.slice(12,16)),playQuest(QUESTS[17],CATALOG.slice(16,20)),playQuest(QUESTS[20],CATALOG.slice(20,24)),playQuest(QUESTS[23],CATALOG.slice(20,24))];
for(const h of CATALOG)for(const awake of [0,1])assert(fs.existsSync(`dist/${portrait({...h,awake})}`),`Missing portrait for ${h.key}, awake ${awake}`);
const lucky=new Campaign(memory());lucky.state.owned.evelyn.luck=11;lucky.begin(0);assert.equal(lucky.finish(true,{hpRatio:1,shots:8}).gold,770,'Leader luck adds the advertised gold bonus');
for(const chapter of CHAPTERS)assert(fs.existsSync(`dist/${chapter.bossArt}`),`Missing boss art for ${chapter.name}`);
assert.equal(waves(QUESTS[3])[2].enemies[0].sprite,'warden');
console.log(JSON.stringify({result:'PASS',checks:['quest unlocks','stamina and regeneration','one-time rewards','daily supply','unlimited free summons at zero balance','free star-gem shop','all 24 heroes obtainable','ten-pull guarantee','six-star pity','duplicates','team uniqueness','growth affects combat','awakening','free growth at zero balance through level 100 and luck 99','missions','shop','save reload and legacy migration','corrupt save recovery','storage denial','piercing','slotted support','distinct expansion quest formations','all 24 quests','new parties complete boss quests'],campaign:summary,spatialParties},null,2));
