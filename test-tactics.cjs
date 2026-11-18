const assert=require('node:assert/strict');
const {AbyssEngine}=require('./dist/engine.js');
const {SKILLS,BOSSES,inPlan}=require('./dist/combat-kit.js');
const {CATALOG,stats,waves,QUESTS,portrait,Campaign}=require('./dist/progression.js');
const fs=require('node:fs');
const scripts=[...fs.readFileSync('dist/index.html','utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);assert(scripts.includes('spatial-fx.js'));assert(scripts.indexOf('spatial-fx.js')<scripts.indexOf('ability-fx.js'),'Spatial renderer loads before ability dispatch');for(const file of scripts)assert(fs.existsSync('dist/'+file));
function battle(key,kind){const events=[],g=new AbyssEngine(e=>events.push(e));const leader=CATALOG.find(h=>h.key===key);const party=[leader,...CATALOG.filter(h=>h.key!==key).slice(0,3)].map(h=>stats(h,{level:1,awake:0,luck:1}));const stage=waves(QUESTS[0])[2];stage.enemies=stage.enemies.map((e,i)=>({...e,hp:20000,damage:400,bossKind:i===0?kind:undefined,counter:1}));g.reset({tactical:true,stages:[stage],party,maxHp:16000});g.hp=8000;g.friends=new Set();return {g,events};}
const seen=[];
for(const h of CATALOG){const {g,events}=battle(h.key);g.current.vx=300;g.current.vy=-200;g.tacticalSupport(g.current);assert(events.some(e=>e.type==='skillFx'&&e.key===h.key&&!e.ultimate));const signature=JSON.stringify({damage:g.enemies.map(e=>e.maxHp-e.hp),shield:g.shield,hp:g.hp,delayed:g.delayed.length,poison:g.enemies[0].poison,burn:g.enemies[0].burn,energy:g.energy,velocity:g.current.vx});seen.push(signature);
 const u=battle(h.key);u.g.energy=100;assert(u.g.armUltimate());u.g.launch(0,-1);assert.equal(u.g.energy,h.key==='sable'?27:0);assert(u.events.some(e=>e.type==='skillFx'&&e.key===h.key&&e.ultimate));if(['lucia','seraph'].includes(h.key)){const effect=u.events.find(e=>e.type==='skillFx'&&e.ultimate);assert.deepEqual(effect.targets.map(q=>[q.x,q.y]),u.g.heroes.map(q=>[q.x,q.y]),'Protection visuals follow party members');}assert(Number.isFinite(u.g.hp));assert(u.g.enemies.every(e=>Number.isFinite(e.hp)));}
assert.equal(CATALOG.length,24,'Twenty-four playable investigators');
assert.equal(new Set(Object.values(SKILLS).map(s=>s.motif)).size,CATALOG.length,'Each hero uses its own visual vocabulary');
let {g}=battle('evelyn');g.tacticalSupport(g.current);const marked=g.enemies.find(e=>e.expose),hp=marked.hp;g.damage(marked,100);assert.equal(hp-marked.hp,125);
({g}=battle('noah'));g.current.x=170;g.current.y=447;g.current.vx=0;g.current.vy=-300;g.enemies[0].x=170;g.enemies[0].y=180;g.enemies[1].x=170;g.enemies[1].y=300;g.enemies[2].x=450;g.enemies[2].y=220;g.tacticalSupport(g.current);assert(g.enemies[0].hp<20000&&g.enemies[1].hp<20000);assert.equal(g.enemies[2].hp,20000,'Rail respects line geometry');
({g}=battle('lucia'));g.partyPoison={ticks:2,power:200};g.tacticalSupport(g.current);assert.equal(g.hp,8500);assert.equal(g.shield,220);assert.equal(g.partyPoison,null);const oldHp=g.hp;assert.equal(g.hurtParty(100),0);assert.equal(g.hp,oldHp);assert.equal(g.shield,120);
({g}=battle('silas'));g.tacticalSupport(g.current);assert.equal(g.hp,8175,'Drain heals from actual damage');
({g}=battle('aster'));g.tacticalSupport(g.current);assert.equal(g.enemies[0].hp,20000);g.resolveTurnEffects();assert.equal(g.enemies[0].hp,20000);g.turn++;g.resolveTurnEffects();assert(g.enemies[0].hp<20000);assert.equal(g.delayed.length,0);
({g}=battle('seraph'));g.hazards=[{shape:'circles',zones:[],ticks:2},{shape:'circles',zones:[],ticks:2}];g.tacticalSupport(g.current);assert.equal(g.shield,480);assert.equal(g.hazards.length,1);
({g}=battle('corvus'));g.current.x=g.enemies[0].x;g.current.y=g.enemies[0].y;g.enemies.forEach(e=>e.armor=1000);g.tacticalSupport(g.current);const armor=g.enemies[0].armor;g.resolveTurnEffects();assert.equal(g.enemies[0].hp,19935);assert.equal(g.enemies[0].armor,armor,'Poison bypasses armor');
({g}=battle('orion'));g.current.x=g.enemies[0].x;g.current.y=g.enemies[0].y+130;g.current.vy=-300;g.enemies[0].armor=1000;g.tacticalSupport(g.current);assert.equal(g.enemies[0].hp,19700);assert.equal(g.enemies[0].armor,1000);
({g}=battle('mira'));g.current.vx=300;const counter=g.enemies[0].counter;g.tacticalSupport(g.current);assert.equal(g.current.vx,354);assert.equal(g.energy,18);assert.equal(g.enemies[0].counter,counter+1);
({g}=battle('rook'));g.energy=100;g.armUltimate();g.launch(1,0);for(let i=0;i<9;i++)g.wallSkill({x:12,y:200});assert.equal(g.shotKit.wallLeft,0,'Wall follow-up is capped');
({g}=battle('ren'));g.energy=100;g.armUltimate();g.launch(0,-1);assert(g.shotKit.pierce);for(let i=0;i<10;i++)g.contactSkill(g.enemies[0]);assert.equal(g.shotKit.followLeft,0);
for(const key of Object.keys(BOSSES)){const {g,events}=battle('evelyn',key),boss=g.enemies[0],moves=[];for(let i=0;i<3;i++){moves.push(boss.plan.id);g.executeBoss(boss);}assert.deepEqual(moves,BOSSES[key].moves.map(m=>m.id));assert.equal(boss.plan.id,moves[0]);boss.hp=boss.maxHp*.49;g.checkBossPhase(boss);g.checkBossPhase(boss);assert.equal(events.filter(e=>e.type==='bossPhase').length,1);assert.equal(boss.counter,1);assert.equal(boss.plan.phase,2);}
({g}=battle('evelyn','watcher'));const boss=g.enemies[0],plan=boss.plan;const safe={x:450,y:110,r:22};assert(!inPlan(safe,plan));g.heroes.forEach(h=>Object.assign(h,safe));const before=g.hp;assert.equal(g.executeBoss(boss),0);assert.equal(g.hp,before,'Telegraphed beam can be dodged');
({g}=battle('evelyn','cthulhu'));g.enemies[0].moveIndex=2;g.planBoss(g.enemies[0]);g.heroes.forEach(h=>{h.x=250;h.y=405;});assert.equal(g.executeBoss(g.enemies[0]),0,'Eclipse safe zone prevents damage');
({g}=battle('lucia','cthulhu'));g.hazards=[{shape:'edge',width:100,ticks:2,power:100}];g.partyPoison={ticks:3,power:100};g.energy=100;g.armUltimate();g.launch(0,-1);assert.equal(g.hazards.length,0);assert.equal(g.partyPoison,null);
({g}=battle('corvus'));g.enemies.forEach(e=>{e.hp=10;e.poison={ticks:1,power:20};});g.launch(0,-1);g.finishShot();assert.equal(g.mode,'victory','Damage over time can finish a stage without an extra shot');
const state=new Map(),c=new Campaign({getItem:k=>state.get(k),setItem:(k,v)=>state.set(k,v)});c.state.owned.evelyn.level=20;c.awaken('evelyn');const restored=new Campaign(c.storage);assert(portrait(restored.hero('evelyn')).includes('awakened-v5'));assert(portrait({...restored.hero('evelyn'),awake:0}).includes('-v2.jpg'));
// Exercise actual gameplay events through every rendering branch. Reject invalid
// coordinates before they can break a canvas frame on mobile.
for(const key of ['rook','orion','ren']){
  const {g,events}=battle(key);
  Object.assign(g.current,{x:140,y:290});
  Object.assign(g.enemies[0],{x:265,y:290,r:18});
  g.enemies.slice(1).forEach((e,i)=>Object.assign(e,{x:340+i*60,y:450,r:12}));
  g.energy=100;
  g.armUltimate();
  g.launch(key==='rook'?-1:1,0);
  const ready=events.find(e=>e.type==='skillFx');
  assert.equal(ready.phase,'prepare');
  assert.deepEqual(ready.targets,[]);
  assert(!events.some(e=>e.type==='hit'),key+' starts without enemy damage');
  for(let i=0;i<70 && !events.some(e=>e.burst||e.follow);i++) g.update(1/120);
  const impact=events.find(e=>e.burst||e.follow);
  assert.equal(impact?.key,key,key+' produces an effect on a real collision');
  assert.equal(impact.targets.length,1);
  assert(events.slice(0,events.indexOf(impact)).some(e=>e.type==='hit'),'impact follows damage');
  if(key==='rook') assert(events.some(e=>e.type==='wall' && e.x===impact.origin.x));
  else assert.equal(impact.origin.x,g.enemies[0].x);
}
{
  const {g}=battle('evelyn');
  const enemy=g.enemies[0],start=g.turn;
  g.tacticalSupport(g.current);
  g.tacticalUltimate();
  g.tacticalSupport(g.current);
  assert.equal(g.damage(enemy,100),140);
  g.turn=start+3;
  g.tacticalSupport(g.current);
  assert.equal(g.damage(enemy,100),140,'weak mark cannot shorten or extend strong mark');
  g.turn++;
  assert.equal(g.damage(enemy,100),125,'later ordinary mark survives for its own remaining duration');
  g.turn+=2;
  assert.equal(g.damage(enemy,100),100,'both marks expire');
}
{
  const {g,events}=battle('noah');
  g.enemies[0].hp=130;
  g.energy=100;g.armUltimate();g.launch(1,0);
  const rounds=()=>events.filter(e=>e.type==='skillFx' && e.key==='noah' && e.ultimate);
  assert.deepEqual(rounds().map(e=>e.round),[0]);
  assert.equal(g.enemies[1].hp,19870,'only the first round lands at launch');
  g.advanceSpatial(.29);
  assert.equal(rounds().length,1);
  g.advanceSpatial(.02);
  assert.deepEqual(rounds().map(e=>[e.round,e.targets.length]),[[0,3],[1,2]],'second round skips the defeated target');
  g.advanceSpatial(.30);
  g.finishSpatial();
  assert.deepEqual(rounds().map(e=>e.round),[0,1,2]);
  assert.equal(g.enemies[1].hp,19610,'the three salvos retain their total damage');
}
for(const weakFirst of [false,true]){
  const {g}=battle('corvus'),enemy=g.enemies[0];
  Object.assign(g.current,{x:enemy.x,y:enemy.y});
  if(weakFirst) g.tacticalSupport(g.current);
  g.tacticalUltimate();
  g.resolveTurnEffects();
  g.tacticalSupport(g.current);
  g.tacticalSupport(g.current);
  enemy.armor=1000;
  const damage=[];
  for(let i=0;i<7;i++){
    const before=enemy.hp;
    g.resolveTurnEffects();
    damage.push(before-enemy.hp);
  }
  assert.deepEqual(damage,[110,110,110,65,65,65,0],'strong poison finishes first, equal doses refresh once');
  assert.equal(enemy.poison,null);
  assert.equal(enemy.armor,1000);
}

const vm=require('node:vm');
const numeric=(...values)=>values.forEach(v=>{if(typeof v==='number')assert(Number.isFinite(v),'Finite drawing coordinate required');else if(Array.isArray(v))numeric(...v);});
const canvasMethods=['save','restore','translate','rotate','beginPath','closePath','moveTo','lineTo','arc','ellipse','quadraticCurveTo','bezierCurveTo','fill','stroke','rect','clip','setLineDash','fillRect','strokeRect','fillText','scale','clearRect','strokeText','drawImage','setTransform'];
const context=Object.fromEntries(canvasMethods.map(k=>[k,(...v)=>numeric(...v)]));context.globalAlpha=1;context.createRadialGradient=(...v)=>{numeric(...v);return {addColorStop:()=>{}};};context.createLinearGradient=context.createRadialGradient;
class MockImage{constructor(){this.complete=true;this.naturalWidth=this.width=1254;this.naturalHeight=this.height=1254;}set src(v){this.path=v;if(this.onload)this.onload();}}
const sandbox={Image:MockImage,document:{createElement:()=>({width:0,height:0,getContext:()=>context})},window:{},AbyssKit:require('./dist/combat-kit.js'),ctx:context,game:null,reduced:false,tone:()=>{},setTimeout:()=>{},BattleFX:{trauma:0,hitStop:0,punch:()=>{}},$:()=>({}),line:(x,y,x2,y2,...v)=>{[x,y,x2,y2].forEach(n=>assert(Number.isFinite(n)));numeric(...v);},circle:(x,y,r,...v)=>{[x,y,r].forEach(n=>assert(Number.isFinite(n)));assert(r>=0);numeric(...v);}};
const renderContext=vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/spatial-fx.js','utf8'),renderContext);vm.runInContext(fs.readFileSync('dist/ability-fx.js','utf8'),renderContext);
const renderer=sandbox.window.AbilityFX;
for(const h of CATALOG){const sample=battle(h.key,'watcher');sandbox.game=sample.g;sample.g.onEvent=e=>renderer.event(e);renderer.reset();sample.g.tacticalSupport(sample.g.current);sample.g.energy=100;sample.g.armUltimate();sample.g.launch(0,-1);sample.g.wallSkill({x:12,y:180});sample.g.contactSkill(sample.g.enemies[0]);sample.g.turn++;sample.g.resolveTurnEffects();sample.g.showSupportRanges=true;for(let tick=0;tick<32;tick++)sample.g.advanceSpatial(.12);for(const dt of [.1,.25,.3]){renderer.drawUnder(.5);renderer.drawOver(.5,dt);}}
for(const kind of Object.keys(BOSSES)){const sample=battle('lucia',kind);sandbox.game=sample.g;sample.g.onEvent=e=>renderer.event(e);renderer.reset();for(let i=0;i<3;i++){renderer.drawUnder(.5);sample.g.executeBoss(sample.g.enemies[0]);for(const dt of [.1,.25,.3])renderer.drawOver(.5,dt);}sample.g.enemies[0].hp=5000;sample.g.checkBossPhase(sample.g.enemies[0]);sample.g.protect(500);sample.g.hurtParty(200);renderer.drawOver(.5,.1);}
// Render the complete battlefield as well: catches missing trail coordinates,
// not just isolated ability primitives. Exercise both motion settings.
const element={classList:{add:()=>{},remove:()=>{}},style:{setProperty:()=>{}},querySelector(){return this;},textContent:'',offsetWidth:1};
Object.assign(sandbox,{sound:false,navigator:{},$:()=>element,images:{},particles:[],floaters:[],beams:[],rings:[],trail:[],draw:()=>{},drawAim:()=>{},portraitKey:h=>h.art+(h.awake>0?'-awakened':''),AbyssProgress:require('./dist/progression.js'),clearTimeout:()=>{}});
for(const h of CATALOG)for(const suffix of ['','-awakened'])sandbox.images[h.art+suffix]=new MockImage();
for(const key of ['watcher','deep-one','cthulhu'])sandbox.images[key]=new MockImage();
vm.runInContext(fs.readFileSync('dist/battle-fx.js','utf8'),renderContext);
const battlefield=vm.runInContext('BattleFX',renderContext);
for(const reducedMotion of [false,true]){
 sandbox.reduced=reducedMotion;
 const sample=battle('orion','warden');sandbox.game=sample.g;sample.g.showSupportRanges=true;
 sample.g.onEvent=e=>{battlefield.event(e);renderer.event(e);};sample.g.energy=100;sample.g.armUltimate();sample.g.launch(0,-1);
 sandbox.trail=[{x:170,y:447},{x:171,y:430},{x:175,y:410}];
 for(let i=0;i<8;i++){sample.g.update(1/120);sandbox.draw(i/60,1/60);}
}

// Long moving trails must not hide other skills or leave obsolete damage shapes.
const spatialRenderer=sandbox.window.SpatialFX,positions=Array.from({length:151},(_,i)=>({x:25+(i%20)*23,y:100+Math.floor(i/20)*45}));
const trailEvent={type:'skillFx',key:'thalia',origin:{x:170,y:447},targets:[],tick:true,geometry:{shape:'trail',center:{x:170,y:447},width:12,points:positions,segments:positions.slice(1).map((p,i)=>[positions[i],p])}};
renderer.reset();renderer.event(trailEvent);renderer.event(trailEvent);assert.equal(renderer.effects.length,1,'Moving geometry replaces its stale snapshot');
renderer.drawBudget=160;spatialRenderer.drawSkill({...trailEvent,age:.12,duration:.32},0);assert(renderer.drawBudget>=120,'Long thorn trail preserves texture budget for other effects');
const oldDrawImage=context.drawImage;let gravityRendered=false;context.drawImage=(texture,...args)=>{if(texture===spatialRenderer.textures[5])gravityRendered=true;oldDrawImage(texture,...args);};spatialRenderer.drawSkill({key:'morrow',origin:{x:250,y:300},targets:[],geometry:{shape:'well',center:{x:250,y:300},radius:155},age:.2,duration:.5},0);context.drawImage=oldDrawImage;assert(gravityRendered,'Gravity remains visible after a long thorn trail');
// A refuge telegraph paints the danger mask once, through the translucent geometry pass.
{
  const sample=battle('maren','whale'),boss=sample.g.enemies[0];
  boss.moveIndex=2;sample.g.planBoss(boss);sandbox.game=sample.g;
  const originalFill=context.fill;
  let maskCount=0;
  context.fill=(rule,...args)=>{if(rule==='evenodd')maskCount++;return originalFill(rule,...args);};
  spatialRenderer.plan(boss.plan,.15);
  context.fill=originalFill;
  assert.equal(maskCount,1,'no opaque second mask over the arena');
}
// Observe the materials actually drawn, including the live string between damage pulses.
{
  const samples={};
  for(const name of ['silverShot','crystalFlight','beam']){
    const draw=spatialRenderer[name];
    samples[name]=draw;
    spatialRenderer[name]=function(...args){samples.calls.push(name);return draw.apply(this,args);};
  }
  for(const [key,material,supportCount,ultimateCount] of [
    ['noah','silverShot',1,3],['iris','crystalFlight',5,12],['vesper','beam',2,8]
  ]){
    const {g,events}=battle(key);
    sandbox.game=g;
    g.tacticalSupport(g.current);
    g.energy=100;g.armUltimate();g.launch(0,-1);
    for(const ultimate of [false,true]){
      samples.calls=[];
      const fx=events.find(e=>e.type==='skillFx' && !!e.ultimate===ultimate);
      renderer.drawBudget=160;
      renderer.drawSkill({...fx,age:.24,duration:1},0);
      assert.deepEqual(samples.calls,Array(ultimate?ultimateCount:supportCount).fill(material));
    }
  }
  for(const name of ['silverShot','crystalFlight','beam']) spatialRenderer[name]=samples[name];
  const {g,events}=battle('lyra');
  sandbox.game=g;g.energy=100;g.armUltimate();g.launch(1,0);
  const fx=events.find(e=>e.key==='lyra' && e.ultimate);
  g.current.x+=64;
  const ribbon=renderer.ribbon;
  const ends=[];
  renderer.ribbon=(from,to)=>ends.push(to);
  spatialRenderer.drawSkill({...fx,duration:1,age:.12},0);
  assert.equal(ends.length,9);
  assert(ends.some(to=>to.x===g.current.x && to.y===g.current.y),'drawn string follows actor between pulses');
  ends.length=0;g.finishShot();
  spatialRenderer.drawSkill({...fx,duration:1,age:.18},0);
  assert.equal(ends.length,0,'expired tether never attaches to the next player');
  renderer.ribbon=ribbon;
}
assert.equal(renderer.textures.length,16,'All sixteen material textures are prepared');
assert(fs.existsSync('dist/assets/arcana-vfx-v5.png'));assert.equal(sandbox.window.SpatialFX.textures.length,16);assert(fs.existsSync('dist/assets/spatial-vfx-v6.png'));
for(const kind of ['prism','forge','garden','mirrorling'])assert(fs.existsSync('dist/assets/'+kind+'-v6.png'));
for(const kind of Object.keys(BOSSES)){const sample=battle('vesper',kind);sandbox.game=sample.g;sample.g.enemies[0].sprite=kind==='cthulhu'?'boss':kind;sandbox.draw(.5,1/60);}
for(const h of CATALOG)for(const awake of [0,1])assert(fs.existsSync('dist/'+portrait({...h,awake})),`Missing ${h.key} form ${awake}`);
console.log(JSON.stringify({result:'PASS',heroes:CATALOG.length,supportSkills:CATALOG.length,ultimateSkills:CATALOG.length,bossSkills:Object.values(BOSSES).reduce((n,b)=>n+b.moves.length,0),checks:['unique mechanics and visual motifs','rail geometry','shields and cleanse','life steal','delayed impacts','armor bypass','bounded follow-ups','boss rotation','enrage','telegraph dodge','safe zone','damage-over-time victory','awakening save and portraits','all skill and boss renderer branches']},null,2));
