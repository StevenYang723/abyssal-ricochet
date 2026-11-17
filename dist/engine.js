(function (root) {
  'use strict';
  const HEROES = [
    { name: '伊芙琳', role: '秘学家', type: '反射', color: '#c3dfad', art: 'evelyn', attack: 150, skill: '星芒追击', description: '援护：星芒自动追击最虚弱的敌人，造成 180 伤害。', lore: '她在禁书的页边，找到了另一片星空。' },
    { name: '诺亚', role: '调查员', type: '反射', color: '#a2c8d8', art: 'noah', attack: 175, skill: '银弹齐射', description: '援护：向所有敌人发射银弹，各造成 100 伤害。', lore: '最后一班前往印斯茅斯的列车，没有回程。' },
    { name: '露西亚', role: '守灯人', type: '反射', color: '#e0cd91', art: 'lucia', attack: 130, skill: '不灭灯火', description: '援护：恢复小队 500 生命与 5 点理智，并灼烧最近的敌人。', lore: '只要灯还亮着，就总有人能找到归途。' },
    { name: '塞拉斯', role: '通灵者', type: '反射', color: '#c8b2db', art: 'silas', attack: 160, skill: '虚空回声', description: '援护：对最强大的敌人造成 240 伤害。', lore: '他听见的声音，来自尚未发生的梦。' }
  ];
  const STAGES = [
    { name:'雾港来客', place:'INNSMOUTH', subtitle:'印斯茅斯 · 失落港口', title:'雾港的凝视者', objective:'驱散雾港的阴影', description:'消灭港口的异变生物，寻找通往海底遗迹的航路。', reward:300, enemies:[{x:250,y:183,r:58,hp:780,art:'watcher',name:'凝视者',cooldown:3,damage:420},{x:110,y:302,r:33,hp:300,art:'deep-one',name:'深潜者',cooldown:2,damage:190},{x:390,y:302,r:33,hp:300,art:'deep-one',name:'深潜者',cooldown:2,damage:190}] },
    { name:'沉没圣堂', place:'THE DROWNED CHAPEL', subtitle:'海底遗迹 · 破碎圣堂', title:'圣堂的守门者', objective:'打破古老的封印', description:'圣堂已经苏醒。借助同伴的援护，在理智耗尽前击败守门者。', reward:600, enemies:[{x:250,y:167,r:61,hp:1200,art:'watcher',name:'守门者',cooldown:2,damage:500},{x:125,y:310,r:35,hp:440,art:'deep-one',name:'圣堂眷属',cooldown:2,damage:240},{x:375,y:310,r:35,hp:440,art:'deep-one',name:'圣堂眷属',cooldown:3,damage:240}] },
    { name:'拉莱耶之梦', place:"R'LYEH", subtitle:'旧日之城 · 终焉之门', title:'旧日支配者 · 克苏鲁', objective:'让旧日之神重归沉睡', description:'群星的位置已经改变。释放古印的力量，在祂完全苏醒前封闭深渊。', reward:1200, enemies:[{x:250,y:190,r:72,hp:2400,art:'cthulhu',name:'克苏鲁',cooldown:2,damage:700},{x:100,y:330,r:32,hp:440,art:'deep-one',name:'旧日眷属',cooldown:3,damage:230},{x:400,y:330,r:32,hp:440,art:'deep-one',name:'旧日眷属',cooldown:3,damage:230}] }
  ];
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  class AbyssEngine {
    constructor(onEvent = ()=>{}) {this.onEvent=onEvent;this.reset();}
    emit(type,data={}) {this.onEvent({type,...data});}
    reset(options={}) {this.stages=options.stages||STAGES;this.party=options.party||HEROES;this.stage=0;this.turn=1;this.active=0;this.hp=options.maxHp||8000;this.maxHp=this.hp;this.sanity=100;this.energy=0;this.score=0;this.maxCombo=0;this.totalShots=0;this.totalKills=0;this.armed=false;this.powered=false;this.mode='ready';this.time=0;this.combo=0;this.loadStage();}
    loadStage() {
      this.enemies=this.stages[this.stage].enemies.map((e,i)=>({...e,id:i,maxHp:e.hp,counter:e.cooldown,hitAt:-10,flash:0}));
      this.heroes=this.party.map((h,i)=>({...h,supportKind:h.supportKind??i,supportScale:h.supportScale||1,id:i,x:[170,330,90,410][i],y:[447,447,495,495][i],r:22,vx:0,vy:0}));
      this.pillars=[{x:175,y:338,r:17},{x:325,y:338,r:17}];this.mode='ready';this.armed=false;this.combo=0;this.emit('stage',{stage:this.stage});
    }
    get current(){return this.heroes[this.active];}
    get stageHp(){return this.enemies.reduce((s,e)=>s+Math.max(0,e.hp),0);}
    get stageMaxHp(){return this.enemies.reduce((s,e)=>s+e.maxHp,0);}
    armUltimate(){if(this.mode!=='ready'||this.energy<100)return false;this.armed=!this.armed;this.emit('armed',{armed:this.armed});return true;}
    launch(dx,dy,power=1){
      if(this.mode!=='ready'||!Number.isFinite(dx)||!Number.isFinite(dy)||Math.hypot(dx,dy)<.01)return false;
      const length=Math.hypot(dx,dy),speed=650+clamp(power,0,1)*470;
      this.mode='moving';this.shotTime=0;this.combo=0;this.friends=new Set();this.trail=[];this.totalShots++;
      this.current.vx=dx/length*speed;this.current.vy=dy/length*speed;this.powered=this.armed;this.armed=false;
      if(this.powered){this.energy=0;for(const e of this.enemies)if(e.hp>0)this.damage(e,220*this.current.supportScale,'ritual');this.sanity=Math.min(100,this.sanity+10);this.emit('ultimate',{x:this.current.x,y:this.current.y});}
      this.emit('launch',{hero:this.active});return true;
    }
    damage(enemy,amount,kind='hit'){
      if(enemy.hp<=0)return;const actual=Math.min(enemy.hp,Math.round(amount));enemy.hp-=actual;enemy.flash=.16;this.score+=actual;this.combo++;this.maxCombo=Math.max(this.combo,this.maxCombo);if(!this.powered)this.energy=clamp(this.energy+7,0,100);
      this.emit('hit',{x:enemy.x,y:enemy.y,amount:actual,kind,combo:this.combo,enemy:enemy.id});
      if(enemy.hp<=0){this.totalKills++;this.score+=80;this.emit('kill',{x:enemy.x,y:enemy.y,name:enemy.name});}
    }
    support(hero){
      if(this.friends.has(hero.id))return;this.friends.add(hero.id);this.energy=clamp(this.energy+9,0,100);this.emit('support',{hero:hero.id,x:hero.x,y:hero.y});
      const alive=this.enemies.filter(e=>e.hp>0);if(!alive.length)return;
      const scale=hero.supportScale||1,kind=hero.supportKind??hero.id;
      if(kind===0){const e=alive.sort((a,b)=>a.hp-b.hp)[0];this.emit('beam',{from:hero,to:e,color:hero.color});this.damage(e,180*scale,'support');}
      if(kind===1){for(const e of alive){this.emit('beam',{from:hero,to:e,color:hero.color});this.damage(e,100*scale,'support');}}
      if(kind===2){const heal=Math.round(500*scale);this.hp=Math.min(this.maxHp,this.hp+heal);this.sanity=Math.min(100,this.sanity+5);this.emit('heal',{x:hero.x,y:hero.y,amount:heal});const e=alive.sort((a,b)=>Math.hypot(a.x-hero.x,a.y-hero.y)-Math.hypot(b.x-hero.x,b.y-hero.y))[0];this.emit('beam',{from:hero,to:e,color:hero.color});this.damage(e,80*scale,'support');}
      if(kind===3){const e=alive.sort((a,b)=>b.hp-a.hp)[0];this.emit('beam',{from:hero,to:e,color:hero.color});this.damage(e,240*scale,'support');}
    }
    collide(ball,object,rebound=true){
      const dx=ball.x-object.x,dy=ball.y-object.y,dist=Math.hypot(dx,dy),radius=ball.r+object.r;
      if(dist>=radius)return false;const nx=dist>0?dx/dist:1,ny=dist>0?dy/dist:0;
      if(rebound){ball.x=object.x+nx*(radius+.5);ball.y=object.y+ny*(radius+.5);const dot=ball.vx*nx+ball.vy*ny;if(dot<0){ball.vx-=2*dot*nx;ball.vy-=2*dot*ny;}}
      return true;
    }
    update(dt){
      if(this.mode!=='moving')return;dt=clamp(dt,0,.025);this.time+=dt;this.shotTime+=dt;const b=this.current;b.x+=b.vx*dt;b.y+=b.vy*dt;
      const minX=12+b.r,maxX=488-b.r,minY=80+b.r,maxY=535-b.r;
      if(b.x<minX||b.x>maxX){b.x=clamp(b.x,minX,maxX);b.vx*=-1;this.emit('wall',{x:b.x,y:b.y});}
      if(b.y<minY||b.y>maxY){b.y=clamp(b.y,minY,maxY);b.vy*=-1;this.emit('wall',{x:b.x,y:b.y});}
      for(const p of this.pillars)if(this.collide(b,p)){this.emit('wall',{x:b.x,y:b.y});}
      for(const e of this.enemies){if(e.hp<=0)continue;e.flash=Math.max(0,e.flash-dt);if(this.collide(b,e,b.type!=='贯通')&&this.time-e.hitAt>(b.type==='贯通'?.3:.13)){e.hitAt=this.time;this.damage(e,b.attack*(this.powered?2.2:1)*(1+Math.min(this.combo,12)*.04));}}
      for(const h of this.heroes)if(h.id!==this.active&&Math.hypot(b.x-h.x,b.y-h.y)<b.r+h.r+8)this.support(h);
      const drag=Math.exp(-.55*dt);b.vx*=drag;b.vy*=drag;
      if(this.stageHp<=0){b.vx=0;b.vy=0;this.mode=this.stage===this.stages.length-1?'victory':'cleared';this.score+=this.stages[this.stage].reward;this.emit(this.mode,{stage:this.stage});return;}
      if(Math.hypot(b.vx,b.vy)<90||this.shotTime>=4.8)this.finishShot();
    }
    finishShot(){
      this.current.vx=0;this.current.vy=0;let damage=0;
      for(const e of this.enemies)if(e.hp>0){e.counter--;if(e.counter<=0){damage+=e.damage;e.counter=e.cooldown;this.emit('enemyAttack',{x:e.x,y:e.y,damage:e.damage});}}
      this.hp=Math.max(0,this.hp-damage);this.sanity=Math.max(0,this.sanity-(this.stage===2?6:4));
      if(this.sanity<30){const cost=160;this.hp=Math.max(0,this.hp-cost);this.emit('madness',{damage:cost});}
      this.energy=clamp(this.energy+12,0,100);this.turn++;this.active=(this.active+1)%4;this.mode=this.hp<=0||this.sanity<=0?'defeat':'ready';this.powered=false;this.emit('turn',{damage});if(this.mode==='defeat')this.emit('defeat');
    }
    nextStage(){if(this.mode!=='cleared')return false;this.stage++;this.hp=Math.min(this.maxHp,this.hp+1000);this.sanity=Math.min(100,this.sanity+15);this.active=(this.active+1)%4;this.turn++;this.loadStage();return true;}
  }
  const exports={AbyssEngine,HEROES,STAGES,clamp};if(typeof module!=='undefined'&&module.exports)module.exports=exports;else Object.assign(root,exports);
})(typeof window!=='undefined'?window:globalThis);
