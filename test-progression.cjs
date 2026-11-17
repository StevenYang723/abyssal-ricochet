const assert=require('node:assert/strict');
const fs=require('node:fs');
const {Campaign,CATALOG,QUESTS,KEY,normalize,waves,stats}=require('./dist/progression.js');
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
c=new Campaign(memory(),()=>now);const ten=c.summon(10,()=>.9);assert.equal(c.state.gems,300);assert.equal(ten.length,10);assert(ten.some(h=>h.rarity>=5),'Ten-pull minimum rarity');assert(c.state.owned[ten[0].key].shards>0,'Duplicates become shards');assert.throws(()=>c.summon(10),/星晶不足/);assert.equal(c.state.gems,300);
c.state.pity=29;const pity=c.summon(1,()=>.9);assert.equal(pity[0].rarity,6);assert.equal(c.state.pity,0);assert.equal(c.state.stats.pulls,11);
const newKey=pity[0].key;c.equip(newKey,2);assert.equal(c.state.team[2],newKey);const original=c.state.team[0];c.equip(original,2);assert.equal(c.state.team[2],original);assert.equal(new Set(c.state.team).size,4,'No duplicate team members');assert.throws(()=>c.equip('fake',0));
const attack=c.hero('evelyn').attack;const gold=c.state.gold,exp=c.state.exp;c.train('evelyn',5);assert.equal(c.state.owned.evelyn.level,6);assert(c.hero('evelyn').attack>attack);assert(c.state.gold<gold&&c.state.exp<exp);assert.throws(()=>c.awaken('evelyn'),/等级上限/);
c.state.owned.evelyn.level=20;c.state.sigils=6;c.state.gold=10000;c.awaken('evelyn');assert.equal(c.state.owned.evelyn.awake,1);assert.equal(c.state.sigils,3);c.train('evelyn');assert.equal(c.state.owned.evelyn.level,21);
c.state.exp=0;const level=c.state.owned.evelyn.level;assert.throws(()=>c.train('evelyn'),/材料不足/);assert.equal(c.state.owned.evelyn.level,level);
c.state.owned.evelyn.shards=20;c.exchangeShards('evelyn');assert.equal(c.state.exp,30);assert.equal(c.state.owned.evelyn.shards,0);assert.throws(()=>c.exchangeShards('evelyn'));
c.state.stats.wins=1;c.claim('first');assert.throws(()=>c.claim('first'));assert.throws(()=>c.claim('chapter3'));
c.state.stamina=60;assert.throws(()=>c.buy('energy'),/已满/);c.state.gold=1000;c.buy('exp');assert.equal(c.state.gold,0);assert.throws(()=>c.buy('exp'),/金币不足/);
c.save();const loaded=new Campaign(c.storage,()=>now);assert.equal(loaded.hero('evelyn').level,21);assert.deepEqual(loaded.state.team,c.state.team);assert.deepEqual(loaded.state.owned,c.state.owned);
const malicious=normalize({...c.state,team:['evil','evelyn','evelyn'],gold:-20,gems:Infinity,owned:{...c.state.owned,evelyn:{level:9999,awake:99,luck:-1}}},now);assert.equal(malicious.gold,0);assert.equal(malicious.owned.evelyn.level,100);assert.equal(malicious.team.length,4);assert.equal(new Set(malicious.team).size,4);assert(!malicious.team.includes('evil'));
const corrupt=memory();corrupt.setItem(KEY,'{bad JSON');assert.equal(new Campaign(corrupt).state.gems,3000);const denied=new Campaign({getItem(){throw Error()},setItem(){throw Error()}});assert.equal(denied.save(),false);assert(denied.saveError);
// A slotted healer retains their actual skill; a pierce hero passes through enemies.
const customized=new AbyssEngine();customized.reset({stages:waves(QUESTS[0]),party:[stats(CATALOG[8],{level:10,awake:0}),stats(CATALOG[2],{level:10,awake:0}),stats(CATALOG[1],{level:10,awake:0}),stats(CATALOG[0],{level:10,awake:0})],maxHp:12000});customized.hp=10000;customized.launch(0,-1);customized.support(customized.heroes[1]);assert(customized.hp>10500);const enemy=customized.enemies[0];customized.current.x=enemy.x;customized.current.y=enemy.y+enemy.r+21;customized.current.vx=0;customized.current.vy=-400;customized.update(1/120);assert(customized.current.vy<0,'Piercing hero does not reflect off enemies');
function simulate(g){let n=0;while(g.mode==='moving'&&n++<900)g.update(1/120);assert(n<900);}
// Play every quest, including the final boss, through the actual physics engine.
const summary=[];
for(const q of QUESTS){const level=Math.max(1,q.level),party=CATALOG.slice(0,4).map(h=>stats(h,{level,awake:Math.floor((level-1)/20)}));const g=new AbyssEngine();g.reset({stages:waves(q),party,maxHp:party.reduce((n,h)=>n+h.hp,0)});let turns=0;
 while(g.mode!=='victory'&&g.mode!=='defeat'&&turns<60){if(g.mode==='cleared'){g.nextStage();continue;}let bestAngle=0,bestValue=-Infinity;for(let i=0;i<48;i++){const sim=new AbyssEngine();for(const[k,v]of Object.entries(g))if(typeof v!=='function')sim[k]=JSON.parse(JSON.stringify(v));if(sim.energy===100)sim.armUltimate();const a=i*Math.PI/24;sim.launch(Math.cos(a),Math.sin(a));simulate(sim);const value=g.stageHp-sim.stageHp+Math.max(0,sim.hp-g.hp)*.25+(sim.mode==='cleared'||sim.mode==='victory'?1000:0);if(value>bestValue){bestValue=value;bestAngle=a;}}if(g.energy===100)g.armUltimate();g.launch(Math.cos(bestAngle),Math.sin(bestAngle));simulate(g);turns++;}
 assert.equal(g.mode,'victory',`Quest ${q.number} must be winnable at its recommended level`);summary.push({quest:q.number,level,shots:g.totalShots,hp:g.hp,sanity:g.sanity});}
for(const h of CATALOG)assert(fs.existsSync(`dist/assets/${h.art}-v2.jpg`));
const lucky=new Campaign(memory());lucky.state.owned.evelyn.luck=11;lucky.begin(0);assert.equal(lucky.finish(true,{hpRatio:1,shots:8}).gold,770,'Leader luck adds the advertised gold bonus');
for(const art of ['watcher-v3','warden-v3','boss-v2'])assert(fs.existsSync(`dist/assets/${art}.png`));
assert.equal(waves(QUESTS[3])[2].enemies[0].sprite,'warden');
console.log(JSON.stringify({result:'PASS',checks:['quest unlocks','stamina and regeneration','one-time rewards','daily supply','ten-pull guarantee','six-star pity','duplicates','team uniqueness','growth affects combat','awakening','material costs','missions','shop','save reload','corrupt save recovery','storage denial','piercing','slotted support','all nine quests'],campaign:summary},null,2));
