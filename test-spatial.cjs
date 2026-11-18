'use strict';
const assert=require('node:assert/strict');
const {AbyssEngine}=require('./dist/engine.js');
const {SKILLS,BOSSES,inGeometry,inPlan,reflectedRay}=require('./dist/combat-kit.js');
let assertions=0;
const check=(value,message)=>{assert.ok(value,message);assertions++;};
const enemy=(x,y,extra={})=>({x,y,r:6,hp:10000,cooldown:9,damage:100,name:'fixture',art:'deep-one',...extra});
function battle(key,enemies,extra={}){
  const events=[],engine=new AbyssEngine(e=>events.push(e));
  const keys=['evelyn',key,'lucia','silas'];
  engine.reset({tactical:true,maxHp:100000,party:keys.map(k=>({key:k,art:k,name:k,attack:1,type:'贯通',supportScale:1})),stages:[{reward:0,pillars:[],enemies,...extra}]});
  engine.heroes.forEach((h,i)=>Object.assign(h,{x:40+i*130,y:500}));
  Object.assign(engine.heroes[1],{x:250,y:250});Object.assign(engine.current,{x:300,y:250,vx:500,vy:0});
  events.length=0;return {engine,events,hero:engine.heroes[1]};
}
function use(key,enemies,position){const b=battle(key,enemies);if(position)Object.assign(b.hero,position);b.engine.support(b.hero);return b;}

// Position and velocity, not HP order, determine geometric support hits.
{
  const {engine:e,events}=use('vesper',[enemy(400,250),enemy(250,440),enemy(400,400,{hp:90000})]);
  check(e.enemies[0].hp===9750&&e.enemies[1].hp===9750,'cross hits horizontal and vertical axes');
  check(e.enemies[2].hp===90000,'cross misses the largest enemy outside its axes');
  check(events.find(x=>x.type==='skillFx').geometry.segments.length===2,'cross emits the two actual hit segments');
}
{
  const {engine:e}=use('noah',[enemy(400,250),enemy(100,250,{hp:20000}),enemy(400,310)]);
  check(e.enemies[0].hp===9770&&e.enemies[1].hp===20000&&e.enemies[2].hp===10000,'Noah only hits forward ray');
  const preview=e.supportPreview(e.heroes[1],{x:0,y:-1});
  check(inGeometry(enemy(250,100),preview)&&!inGeometry(enemy(400,250),preview),'aim preview follows supplied direction');
}
for(const key of ['nyra','corvus','bram']){
  const {engine:e,events}=use(key,[enemy(365,250),enemy(440,440)]);
  check(e.enemies[0].hp<10000&&e.enemies[1].hp===10000,`${key} centered disk hits locally and misses distant enemy`);
  check(events.find(x=>x.type==='skillFx').geometry.center.x===250,`${key} keeps caster as center`);
}
{
  const {engine:e,hero}=battle('orion',[enemy(420,250),enemy(100,250),enemy(250,90)]);e.enemies[0].armor=1000;e.support(hero);
  check(e.enemies[0].hp===9700&&e.enemies[0].armor===1000,'Orion forward cone pierces armor');
  check(e.enemies[1].hp===10000&&e.enemies[2].hp===10000,'Orion cone misses behind and to its side');
}
{
  const {engine:e}=use('iris',[enemy(350,250),enemy(350,282),enemy(100,450)],{x:100,y:250});
  check(e.enemies[0].hp===9765,'Iris center projectile hits');
  check(e.enemies[1].hp===10000&&e.enemies[2].hp===10000,'Iris leaves real gaps between fan rays');
}
{
  const rays=reflectedRay({x:250,y:250},{x:1,y:0},1000,3);
  check(rays.length===3&&rays[0][1].x===488&&rays[1][1].x===12,'ray traces the right wall then left wall');
  check(rays.every(l=>l.every(p=>p.x>=12&&p.x<=488&&p.y>=80&&p.y<=535)),'reflected ray stays in arena');
  const corner=reflectedRay({x:488,y:535},{x:1,y:1},900,4);
  check(corner.length>1&&corner.every(l=>Math.hypot(l[1].x-l[0].x,l[1].y-l[0].y)>0),'corner casts reflect without zero-length loops');
  const {engine:e}=use('galen',[enemy(100,250),enemy(100,310)]);
  check(e.enemies[0].hp===9715&&e.enemies[1].hp===10000,'Galen hits behind caster only through reflected segment');
}
{
  const {engine:e,events,hero}=battle('lyra',[enemy(250,200),enemy(250,270)]);
  Object.assign(hero,{x:100,y:200});Object.assign(e.current,{x:400,y:200});e.support(hero);
  for(let i=0;i<40;i++)e.advanceSpatial(.24);
  check(e.enemies[0].hp===10000-66*12&&e.enemies[1].hp===10000,'Lyra ticks exactly twelve times along tether');
  check(events.filter(x=>x.type==='skillFx'&&x.tick).length===12,'tether emits bounded pulse events');
  check(e.spatial[0].remaining===0,'continuous effect exhausts its budget');
  const fresh=battle('lyra',[enemy(250,300)]);Object.assign(fresh.hero,{x:100,y:200});Object.assign(fresh.engine.current,{x:400,y:200});fresh.engine.support(fresh.hero);
  fresh.engine.current.y=400;fresh.engine.advanceSpatial(.24);
  check(fresh.engine.enemies[0].hp===9934,'tether follows moving actor instead of frozen initial line');
}
{
  const {engine:e,events,hero}=battle('morrow',[enemy(300,250),enemy(300,300,{bossKind:'watcher',r:25}),enemy(460,450)]);
  e.support(hero);const initialBoss={x:e.enemies[1].x,y:e.enemies[1].y};
  e.advanceSpatial(.26);
  check(e.enemies[0].x===283,'gravity well pulls small enemy toward its center');
  check(e.enemies[1].x===initialBoss.x&&e.enemies[1].y===initialBoss.y,'gravity never moves bosses');
  check(e.enemies[2].hp===10000,'gravity does not affect distant targets');
  for(let i=0;i<20;i++)e.advanceSpatial(.26);
  check(events.filter(x=>x.type==='skillFx'&&x.tick).length===6,'well emits only six pulses');
  check(e.enemies[1].hp===10000-82*6,'boss receives bounded well damage');
}
{
  const {engine:e,events,hero}=battle('thalia',[enemy(200,200),enemy(200,320)]);
  Object.assign(e.current,{x:100,y:200});e.support(hero);e.current.x=350;
  for(let i=0;i<30;i++)e.advanceSpatial(.24);
  check(e.enemies[0].hp===10000-74*6&&e.enemies[1].hp===10000,'thorn trail hits its path and caps per-enemy ticks at six');
  check(events.filter(x=>x.type==='skillFx'&&x.tick).length===14,'thorn trail bounds visual emission count');
  const snapshot=JSON.parse(JSON.stringify(e.spatial));
  check(snapshot[0].points.length===2&&snapshot[0].hits[0]===6,'spatial runtime survives JSON serialization');
}
{
  // Reflective balls stop outside an enemy's combined collision radius. Their
  // naturally recorded trail must still reach the enemy body after a rebound.
  const {engine:e,events,hero}=battle('thalia',[enemy(250,240,{r:30})]);
  Object.assign(e.current,{x:250,y:460,type:'反射'});Object.assign(hero,{x:250,y:400});
  check(e.supportPreview(hero).width===28,'Thalia support preview uses the playable trail half-width');
  e.launch(0,-1);
  for(let i=0;i<210&&e.mode==='moving';i++)e.update(.025);
  const pulse=events.find(event=>event.type==='skillFx'&&event.key==='thalia'&&event.tick&&event.targets.length);
  check(events.some(event=>event.type==='hit'&&event.kind==='hit'),'reflective launch naturally collides with the enemy');
  check(!!pulse&&pulse.geometry.width===28,'natural reflected path causes thorn damage without hand-placed path points');
  check(!inGeometry(e.enemies[0],{...pulse.geometry,width:12}),'regression path misses with the former too-narrow trail');
  check(events.some(event=>event.type==='hit'&&event.kind==='pierce'&&event.amount===74),'thorn pulse contributes its own damage after collision');
  const ultimate=battle('thalia',[enemy(250,240)]);ultimate.engine.active=1;ultimate.engine.energy=100;ultimate.engine.armUltimate();ultimate.engine.launch(0,-1);
  check(ultimate.engine.spatial[0].width===35&&ultimate.events.find(event=>event.type==='skillFx'&&event.ultimate).geometry.width===35,'Thalia ultimate runtime and visual footprint both use half-width 35');
}
{
  const {engine:e,events}=battle('sable',[enemy(250,90)]);
  e.heroes.forEach((h,i)=>Object.assign(h,{key:'sable',art:'sable',x:200+i*15,y:400}));
  e.support(e.heroes[1]);e.support(e.heroes[1]);
  check(events.filter(x=>x.type==='support').length===4&&e.friends.size===4,'relay activates each ally once without cyclic recursion');
  e.launch(0,-1);e.support(e.heroes[1]);
  check(events.filter(x=>x.type==='support').length===8,'new launch resets support activation budget');
}
{
  const {engine:e,events}=battle('bram',[enemy(250,200)]);
  e.active=1;e.energy=100;e.armUltimate();e.launch(1,0);
  for(let i=0;i<30;i++){const prior={x:e.current.x,y:e.current.y};e.current.x=i%2?150:350;e.advanceSpatial(.1,prior);}
  e.finishSpatial();
  check(events.filter(x=>x.type==='skillFx'&&x.warning).length===10,'Bram lays no more than ten mines');
  check(events.filter(x=>x.type==='skillFx'&&x.tick&&!x.warning).length===10,'each laid mine detonates exactly once');
}
{
  const keys=['vesper','bram','iris','galen','lyra','morrow','thalia','sable'];
  for(const key of keys){
    check(['support','ultimate','form','role','color','motif','text','ultText'].every(k=>SKILLS[key][k]),`${key} kit has complete metadata`);
    const {engine:e,events}=battle(key,[enemy(240,300)]);e.active=1;e.energy=100;e.armUltimate();e.launch(1,-1);
    for(let i=0;i<30;i++)e.update(.025);
    check(events.some(x=>x.type==='skillFx'&&x.key===key&&x.ultimate&&x.geometry),`${key} ultimate emits spatial geometry`);
    check(JSON.stringify(e.spatial).length>0,`${key} runtime is serializable`);
  }
}
// The moving Lyra touches Sable, who relays back to her during the same shot.
{
  const {engine:e,events,hero:sable}=battle('sable',[enemy(260,270),enemy(260,375)]);
  Object.assign(e.current,{key:'lyra',x:120,y:260});
  Object.assign(sable,{x:190,y:260});
  e.launch(1,0);
  for(let i=0;i<430 && e.mode==='moving';i++) e.update(1/120);
  const casts=events.filter(event=>event.type==='skillFx' && event.key==='lyra');
  const pulses=casts.filter(event=>event.tick);
  check(casts.length===13 && pulses.length===12,'self-relay starts one tether with twelve pulses');
  check(casts.every(({geometry:g})=>g.anchorIds[0]===sable.id && g.actorId===0),'Sable anchors the moving Lyra');
  check(pulses.every(({geometry:g})=>Math.hypot(g.segments[0][0].x-g.segments[0][1].x,g.segments[0][0].y-g.segments[0][1].y)>0),'relay pulses span two positions');
  check(pulses.some(p=>p.targets.some(hit=>hit.y===270)) && pulses.every(p=>p.targets.every(hit=>hit.y!==375)),'only the enemy crossed by the string takes pulse damage');
}

function bossPlan(kind,index,phase=1){const b=battle('vesper',[enemy(250,180,{bossKind:kind,r:60,hp:20000})]);const boss=b.engine.enemies[0];boss.moveIndex=index;boss.phase=phase;b.engine.planBoss(boss);return {...b,boss,plan:boss.plan};}
{
  const {plan:p}=bossPlan('forge',0);
  check(!inPlan({x:250,y:300,r:22},p),'forge ring has safe inner circle');
  check(inPlan({x:400,y:300,r:22},p),'forge ring damages annulus');
  check(!inPlan({x:40,y:510,r:22},p),'forge ring has safe outer region');
  check(inPlan({x:250+p.innerRadius-10,y:300,r:22},p),'body overlapping annulus boundary is hit');
  const steam=bossPlan('forge',2).plan;
  check(!inPlan({x:250,y:350,r:22},steam)&&inPlan({x:145,y:350,r:22},steam),'steam columns preserve center lane');
}
{
  const p=bossPlan('prism',0).plan;
  check(inPlan({x:250,y:300,r:22},p)&&!inPlan({x:250,y:480,r:22},p),'prism diagonal cross has actual safe gaps');
  const reflected=bossPlan('prism',1).plan;
  check(reflected.lines.length>1&&reflected.geometry.segments.length===reflected.lines.length,'prism telegraph includes all reflected segments');
  const {engine:e,boss}=bossPlan('prism',2);e.executeBoss(boss);
  check(boss.armor>0,'prism armor move grants real armor');
}
{
  const p=bossPlan('garden',2).plan;
  check(!inPlan({x:p.safe.x,y:p.safe.y,r:22},p),'garden sanctuary protects heroes fully inside');
  check(inPlan({x:p.safe.x+p.safe.r-10,y:p.safe.y,r:22},p),'garden sanctuary hits body partially outside');
  check(bossPlan('garden',2,2).plan.safe.r<p.safe.r,'enrage reduces sanctuary radius');
}
{
  const {engine:e}=use('maren',[enemy(365,250),enemy(365,190),enemy(365,310),enemy(150,190)]);
  assert.deepEqual(e.enemies.map(v=>v.hp),[10000,9740,9740,10000],'both forward wakes hit while the middle and rear lanes stay clear');
}
{
  const {engine:e}=use('oren',[enemy(265,250),enemy(360,250),enemy(445,250)]);
  assert.deepEqual(e.enemies.map(v=>v.hp),[10000,9705,10000],'the bell has a safe central hole and a finite outer edge');
  e.active=1;e.energy=100;e.armUltimate();e.launch(1,0);
  const before=e.enemies.map(v=>v.hp);
  e.advanceSpatial(.16);assert.equal(before[1]-e.enemies[1].hp,330);
  assert.equal(before[2]-e.enemies[2].hp,0);
  e.advanceSpatial(.32);e.advanceSpatial(.32);
  assert.equal(before[2]-e.enemies[2].hp,660,'overlap at the body edge can catch two successive rings');
}
{
  const {engine:e,hero,events}=battle('ada',[enemy(390,250),enemy(180,250)]);
  e.launch(1,0);e.support(hero);
  assert(events.find(event=>event.key==='ada' && event.warning).targets.length===0);
  e.advanceSpatial(.49);
  assert(e.enemies.every(target=>target.hp===10000));
  e.enemies[0].y=365;e.enemies[1].x=350;
  e.advanceSpatial(.02);e.finishSpatial();
  assert.deepEqual(e.enemies.map(v=>v.hp),[10000,9645],'film uses the original frame and the enemies present at development, exactly once');
}
{
  const {engine:e,hero}=battle('siv',[enemy(100,170)]);
  e.launch(1,0);e.hp=e.maxHp-2000;e.support(hero);const hp=e.hp;
  assert.equal(e.shield,0,'placing a buoy gives no instant shield');
  const buoy=e.spatial.find(s=>s.type==='buoys').points[0];
  const previous={x:buoy.x-55,y:buoy.y};Object.assign(e.current,{x:buoy.x+55,y:buoy.y});
  e.advanceSpatial(.02,previous);e.advanceSpatial(.02,previous);
  assert.equal(e.hp-hp,420);assert.equal(e.shield,180,'a swept pickup counts once');
  e.finishSpatial();assert.equal(e.spatial.length,0);
}
{
  const p=bossPlan('whale',2).plan;
  for(const safe of p.geometry.zones) assert(!inPlan({...safe,r:22},p));
  assert(inPlan({x:250,y:340,r:22},p),'the gap between refuges is dangerous');
  assert(bossPlan('whale',2,2).plan.geometry.zones[0].r<p.geometry.zones[0].r);
  const {boss,plan}=bossPlan('prior',0);
  const a=plan.geometry.angle;
  assert(inPlan({x:boss.x+100*Math.cos(a),y:boss.y+100*Math.sin(a),r:8},plan));
  assert(!inPlan({x:boss.x-100*Math.cos(a),y:boss.y-100*Math.sin(a),r:8},plan),'behind the pendulum is safe');
  const whale=bossPlan('whale',1);whale.engine.executeBoss(whale.boss);
  assert.equal(whale.engine.hazards[0].ticks,2);
  const prior=bossPlan('prior',2),g=prior.engine;
  const victims=g.heroes.filter(h=>inPlan(h,prior.plan));
  assert(victims.length>=2);g.energy=70;g.executeBoss(prior.boss);
  assert.equal(g.energy,70-victims.length*8);
  g.heroes.forEach(h=>Object.assign(h,{x:100,y:115}));
  g.energy=0;g.executeBoss(prior.boss);assert.equal(g.energy,0);
}
for(const kind of ['prism','forge','garden','whale','prior']){
  const {engine:e,boss}=bossPlan(kind,0),seen=[];
  for(let i=0;i<3;i++){seen.push(boss.plan.id);e.executeBoss(boss);}
  check(new Set(seen).size===3&&boss.plan.id===seen[0],`${kind} cycles three distinct skills`);
  e.damage(boss,11000,'pierce');
  check(boss.phase===2&&boss.plan.phase===2,`${kind} enrages at half HP`);
  check(BOSSES[kind].moves.length===3,`${kind} exposes all three move descriptions`);
}
{
  const {engine:e}=battle('vesper',[enemy(250,150)],{pillars:[{x:222,y:333,r:24}]});
  check(e.pillars.length===1&&e.pillars[0].r===24,'stage-specific pillars load into physics');
  e.pillars[0].x=100;check(e.stages[0].pillars[0].x===222,'physics does not mutate stage pillar definitions');
  check(battle('vesper',[enemy(250,150)]).engine.pillars.length===0,'empty pillar layout remains empty');
}
console.log(`Spatial combat passed: ${assertions} assertions (geometry, misses, reflections, bounded effects, relay, boss safe zones).`);
