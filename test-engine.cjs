const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {AbyssEngine}=require('./dist/engine.js');
function simulate(g){let steps=0;while(g.mode==='moving'&&steps++<1000)g.update(1/120);assert(steps<1000,'Every shot must finish');}
let g=new AbyssEngine();
assert.equal(g.stageHp,1380);assert.equal(g.launch(0,0),false);assert.equal(g.launch(NaN,0),false);
g.launch(-1,0);for(let i=0;i<35;i++)g.update(1/120);assert(g.current.vx>0,'Left wall reflects velocity');simulate(g);assert.equal(g.turn,2);assert.equal(g.active,1);
g=new AbyssEngine();g.launch(0,-1);const target=g.enemies[0];g.current.x=target.x;g.current.y=target.y+target.r+g.current.r+1;g.current.vx=0;g.current.vy=-400;g.update(1/120);assert(target.hp<target.maxHp,'Collision damages enemy');assert(g.current.vy>0,'Enemy collision reflects');
g=new AbyssEngine();g.hp=7000;g.sanity=80;g.launch(1,0);g.support(g.heroes[2]);assert.equal(g.hp,7500);assert.equal(g.sanity,85);g.support(g.heroes[2]);assert.equal(g.hp,7500,'Support fires only once per shot');
g=new AbyssEngine();assert.equal(g.armUltimate(),false);g.energy=100;assert(g.armUltimate());g.launch(0,-1);assert.equal(g.energy,0);assert.equal(g.powered,true);assert(g.enemies.every(e=>e.hp===e.maxHp-220));
g=new AbyssEngine();g.hp=10;g.sanity=5;g.enemies.forEach(e=>e.counter=1);g.launch(0,1);g.finishShot();assert.equal(g.mode,'defeat');assert.equal(g.launch(0,-1),false);
g=new AbyssEngine();g.enemies.forEach(e=>e.hp=1);g.energy=100;g.armUltimate();g.launch(0,-1);g.update(1/120);assert.equal(g.mode,'cleared');assert(g.nextStage());assert.equal(g.stage,1);assert.equal(g.mode,'ready');assert.equal(g.nextStage(),false);
// Play the full campaign through real physics using a deterministic angle search.
g=new AbyssEngine();let turns=0;const summaries=[];
while(g.mode!=='victory'&&g.mode!=='defeat'&&turns<35){
  if(g.mode==='cleared'){summaries.push({stage:g.stage+1,shots:g.totalShots,hp:g.hp,sanity:g.sanity});g.nextStage();continue;}
  let bestAngle=0,bestValue=-Infinity;
  for(let i=0;i<48;i++){
    const sim=new AbyssEngine();for(const [k,v]of Object.entries(g)){if(typeof v==='function')continue;sim[k]=JSON.parse(JSON.stringify(v));}
    if(sim.energy===100)sim.armUltimate();const angle=i*Math.PI/24;sim.launch(Math.cos(angle),Math.sin(angle));simulate(sim);
    const value=(g.stageHp-sim.stageHp)+Math.max(0,sim.hp-g.hp)*.35+(sim.mode==='cleared'||sim.mode==='victory'?1000:0);
    if(value>bestValue){bestValue=value;bestAngle=angle;}
  }
  if(g.energy===100)g.armUltimate();g.launch(Math.cos(bestAngle),Math.sin(bestAngle));simulate(g);turns++;
}
assert.equal(g.mode,'victory','Campaign should be winnable through normal shots');assert(g.hp>0);assert(g.sanity>0);summaries.push({stage:3,shots:g.totalShots,hp:g.hp,sanity:g.sanity});
const html=fs.readFileSync(path.join(__dirname,'dist/index.html'),'utf8');for(const src of [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1])){if(src==='./'||src.startsWith('http'))continue;assert(fs.existsSync(path.join(__dirname,'dist',src)),`Missing ${src}`);}
for(const art of ['sigil','arena','watcher','deep-one','cthulhu','evelyn','noah','lucia','silas'])assert(fs.existsSync(path.join(__dirname,'dist/assets',art+'.svg')));
console.log(JSON.stringify({result:'PASS',checks:['wall reflection','enemy collision and damage','single-use support','healing','ultimate energy and damage','defeat','stage progression','three-stage campaign','asset integrity'],campaign:summaries},null,2));
