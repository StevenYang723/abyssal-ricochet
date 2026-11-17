'use strict';
/* Presentation-only renderer: fixed-step combat rules remain in engine.js. */
const BattleFX={
  hitStop:0,slow:0,flash:0,trauma:0,impacts:[],shards:[],deaths:[],afterimages:[],jolts:new Map(),supportTimer:null,
  atlas:new Image(),boss:new Image(),minion:new Image(),watcher:new Image(),warden:new Image(),masks:new Map(),audioNoise:null,
  init(){
    this.boss.src='assets/boss-v2.png';this.minion.src='assets/deep-one-v2.png';this.watcher.src='assets/watcher-v3.png';this.warden.src='assets/warden-v3.png';
    for(const [key,img]of [['boss',this.boss],['minion',this.minion],['watcher',this.watcher],['warden',this.warden]])img.onload=()=>{const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff7d2';x.fillRect(0,0,c.width,c.height);this.masks.set(key,c);};
  },
  physicsTime(dt){if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-dt);return 0;}if(this.slow>0){this.slow-=dt;return dt*.4;}return dt;},
  reset(){this.hitStop=0;this.slow=0;this.flash=0;this.trauma=0;this.impacts=[];this.shards=[];this.deaths=[];this.afterimages=[];this.jolts.clear();clearTimeout(this.supportTimer);$('supportCall').classList.remove('visible');$('supportCall').textContent='';$('skillCutin').classList.remove('play');},
  punch(el,name){el.classList.remove(name);void el.offsetWidth;el.classList.add(name);},
  impactAudio(weight=1,metal=false){
    if(!sound)return;try{if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();if(audioContext.state==='suspended')audioContext.resume();const ac=audioContext,t=ac.currentTime;
      const bass=ac.createOscillator(),gain=ac.createGain();bass.type='sine';bass.frequency.setValueAtTime(125*weight,t);bass.frequency.exponentialRampToValueAtTime(32,t+.14);gain.gain.setValueAtTime(.16*Math.min(weight,1.5),t);gain.gain.exponentialRampToValueAtTime(.001,t+.22);bass.connect(gain);gain.connect(ac.destination);bass.start(t);bass.stop(t+.23);
      if(!this.audioNoise){this.audioNoise=ac.createBuffer(1,ac.sampleRate*.4,ac.sampleRate);const d=this.audioNoise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);}
      const noise=ac.createBufferSource(),filter=ac.createBiquadFilter(),ng=ac.createGain();noise.buffer=this.audioNoise;filter.type='bandpass';filter.frequency.value=metal?2300:1100;filter.Q.value=.7;ng.gain.setValueAtTime(.2*weight,t);ng.gain.exponentialRampToValueAtTime(.001,t+.12);noise.connect(filter);filter.connect(ng);ng.connect(ac.destination);noise.start(t);noise.stop(t+.17);
      if(metal){const ping=ac.createOscillator(),pg=ac.createGain();ping.type='triangle';ping.frequency.setValueAtTime(960,t);ping.frequency.exponentialRampToValueAtTime(320,t+.15);pg.gain.setValueAtTime(.045,t);pg.gain.exponentialRampToValueAtTime(.001,t+.3);ping.connect(pg);pg.connect(ac.destination);ping.start(t);ping.stop(t+.31);}
    }catch{}
  },
  shatter(x,y,color,n=24,power=1){for(let i=0;i<(reduced?5:n);i++){const a=Math.random()*Math.PI*2,s=80+Math.random()*260*power;this.shards.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.2+Math.random()*.45,max:.65,color,size:1.5+Math.random()*3.5,angle:a,spin:(Math.random()-.5)*12,spark:i%3!==0});}if(this.shards.length>350)this.shards.splice(0,this.shards.length-350);},
  event(e){
    if(e.type==='stage')this.reset();
    if(e.type==='launch'){this.impacts.push({x:game.current.x,y:game.current.y,life:.32,max:.32,color:game.current.color,power:.6,angle:Math.atan2(game.current.vy,game.current.vx),launch:true});this.shatter(game.current.x,game.current.y,game.current.color,18,.7);this.impactAudio(.5);}
    if(e.type==='hit'){
      const heavy=game.powered||e.combo>=5,power=heavy?1.4:1,color=e.kind==='support'?'#a6f4e7':heavy?'#ffe5a0':'#e8d498';
      const angle=Math.atan2(e.y-game.current.y,e.x-game.current.x);this.hitStop=Math.max(this.hitStop,reduced?0:heavy?.065:.038);this.trauma=Math.min(14,this.trauma+(heavy?6:3.5));this.impacts.push({x:e.x,y:e.y,life:.34,max:.34,color,power,angle});this.jolts.set(e.enemy,{x:Math.cos(angle)*8*power,y:Math.sin(angle)*8*power,flash:.16});this.shatter(e.x,e.y,color,heavy?34:23,power);this.impactAudio(heavy?1.1:.75,true);
      const f=floaters[floaters.length-1];if(f)f.power=power;$('comboRating').textContent=e.combo>=10?'超绝连锁':e.combo>=5?'强袭连锁':e.combo>=3?'连锁追击':'';this.punch($('comboDisplay'),'punch');
      if(navigator.vibrate&&!reduced&&e.kind==='hit')navigator.vibrate(heavy?22:10);
    }
    if(e.type==='kill'){
      const dead=game.enemies.find(x=>x.hp<=0&&x.name===e.name&&x.x===e.x&&x.y===e.y);if(dead)this.deaths.push({...dead,life:.7,max:.7});this.hitStop=Math.max(this.hitStop,reduced?0:.08);this.slow=reduced?0:.13;this.trauma+=5;this.shatter(e.x,e.y,'#dbf6be',45,1.5);this.impacts.push({x:e.x,y:e.y,life:.6,max:.6,color:'#edecb2',power:2,angle:0});this.impactAudio(1.35);
    }
    if(e.type==='wall'){this.shatter(e.x,e.y,'#e6cf93',7,.55);this.impacts.push({x:e.x,y:e.y,life:.18,max:.18,color:'#cfe8a8',power:.3,angle:0});this.impactAudio(.22,true);}
    if(e.type==='support'){const h=game.heroes[e.hero];$('supportCall').textContent=`援护发动 · ${h.name}「${h.skill}」`;$('supportCall').style.borderColor=h.color;$('supportCall').classList.add('visible');clearTimeout(this.supportTimer);this.supportTimer=setTimeout(()=>$('supportCall').classList.remove('visible'),1500);this.shatter(e.x,e.y,h.color,15,.6);}
    if(e.type==='ultimate'){this.hitStop=reduced?0:.55;this.slow=reduced?0:.6;this.flash=reduced?0:.16;this.trauma=13;const c=$('skillCutin');c.querySelector('.cutin-portrait').style.setProperty('--portrait-image',`url("assets/${game.current.art}-v2.jpg")`);this.punch(c,'play');this.impacts.push({x:250,y:280,life:1.2,max:1.2,color:'#e7ffc2',power:5,angle:0,ritual:true});this.impactAudio(1.5,true);}
    if(e.type==='enemyAttack'){this.trauma=12;this.punch($('damageVignette'),'flash');this.shatter(game.current.x,game.current.y,'#ef9071',20);this.impactAudio(1.2);}
  },
  heroPortrait(id,x,y,size){const im=images[game.heroes[id].art];if(im.complete&&im.naturalWidth){const w=im.naturalWidth,h=im.naturalHeight;ctx.drawImage(im,w*.1,h*.01,w*.8,h*.8,x,y,size,size);}},
  monster(e,t,death=0){
    const mini=e.art==='deep-one',key=e.sprite||(mini?'minion':e.art==='watcher'?'watcher':'boss'),im=this[key],size=e.r*(mini?3.15:3.55);const j=this.jolts.get(e.id),jolt=j||{x:0,y:0,flash:0};const breath=reduced?0:Math.sin(t*1.65+e.id)*.016,offset=reduced?0:Math.sin(t*1.35+e.id)*3;
    ctx.save();ctx.translate(e.x+jolt.x,e.y+jolt.y+offset);ctx.rotate(reduced?0:Math.sin(t*.8+e.id)*.018);ctx.scale(1+breath+death*.15,1-breath+death*.15);
    if(e.art==='cthulhu')ctx.filter='hue-rotate(15deg) saturate(1.15)';
    if(im.complete&&im.naturalWidth){ctx.drawImage(im,-size/2,-size/2,size,size);ctx.filter='none';if(jolt.flash>0||death){const mask=this.masks.get(key);if(mask){ctx.globalAlpha=Math.min(.85,jolt.flash*5+death*.5);ctx.drawImage(mask,-size/2,-size/2,size,size);}}}
    else{const old=images[e.art];if(old.complete&&old.naturalWidth)ctx.drawImage(old,-size/2,-size/2,size,size);}
    ctx.restore();
  }
};
BattleFX.init();
function runeCircle(x,y,r,t,color,alpha=.6){
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;circle(0,0,r,null,color,1);circle(0,0,r-5,null,color,.5);ctx.rotate(t);for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);line(0,-r-2,0,-r-(i%3===0?8:4),color,i%3===0?1.5:1);}ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI*2/3-Math.PI/2,px=Math.cos(a)*(r-10),py=Math.sin(a)*(r-10);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.strokeStyle=color;ctx.lineWidth=.7;ctx.stroke();ctx.restore();
}
draw=function(t,dt){
  ctx.clearRect(0,0,500,560);ctx.save();const fx=BattleFX;
  fx.trauma=Math.max(0,fx.trauma-dt*34);fx.flash=Math.max(0,fx.flash-dt);if(!reduced&&fx.trauma>0){ctx.translate(Math.sin(t*89)*fx.trauma*.55,Math.cos(t*113)*fx.trauma*.45);const z=1+fx.trauma*.001;ctx.translate(250,280);ctx.scale(z,z);ctx.translate(-250,-280);}
  for(const j of fx.jolts.values()){j.x*=Math.exp(-dt*19);j.y*=Math.exp(-dt*19);j.flash=Math.max(0,j.flash-dt);}
  // Underwater dust and carved obelisks anchor the action to the floor.
  ctx.globalCompositeOperation='lighter';for(let i=0;i<(reduced?8:27);i++){const x=(i*137.3+Math.sin(t*.12+i)*14)%500,y=(i*87-t*(2+i%3)+5000)%560;circle(x,y,.6+i%3*.4,`rgba(165,221,166,${.15+Math.sin(t+i)*.1})`);}ctx.globalCompositeOperation='source-over';
  for(const p of game.pillars){ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,.65);circle(0,7,23,'#010b0790');ctx.rotate(Math.PI/4);const stone=ctx.createLinearGradient(-18,-18,18,18);stone.addColorStop(0,'#8a8461');stone.addColorStop(.4,'#4a5f49');stone.addColorStop(1,'#1c3124');ctx.fillStyle=stone;ctx.fillRect(-17,-17,34,34);ctx.strokeStyle='#b9a573';ctx.lineWidth=1;ctx.strokeRect(-17,-17,34,34);ctx.strokeRect(-12,-12,24,24);ctx.restore();const glow=ctx.createRadialGradient(p.x,p.y-4,0,p.x,p.y-4,21);glow.addColorStop(0,'#adf5bc77');glow.addColorStop(1,'#72bb9200');circle(p.x,p.y-4,21,glow);ctx.save();ctx.translate(p.x,p.y-8);ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(6,0);ctx.lineTo(0,10);ctx.lineTo(-6,0);ctx.closePath();ctx.fillStyle='#a9dfaf';ctx.fill();ctx.strokeStyle='#ecf9c4';ctx.stroke();ctx.restore();}
  for(const e of game.enemies){if(e.hp<=0)continue;ctx.save();ctx.translate(e.x,e.y+e.r*.75);ctx.scale(1,.3);circle(0,0,e.r*.9,'#020b08a0');ctx.restore();runeCircle(e.x,e.y+e.r*.38,e.r*.83,-t*.1,'#82a877',.18);fx.monster(e,t);const by=e.y+e.r+12;ctx.fillStyle='#141b12';ctx.fillRect(e.x-e.r*.55,by,e.r*1.1,4);ctx.fillStyle='#ab9763';ctx.fillRect(e.x-e.r*.55,by,e.r*1.1*e.hp/e.maxHp,4);const bx=e.x+e.r*.9,by2=e.y-e.r*.63;circle(bx,by2,12,'#291d16','#d0ae70',1.2);circle(bx,by2,9,null,'#745134',.7);ctx.font='bold 12px "Space Grotesk",sans-serif';ctx.textAlign='center';ctx.fillStyle=e.counter===1?'#ffba86':'#ffdf9a';ctx.fillText(e.counter,bx,by2+4);}
  for(const d of fx.deaths){d.life-=dt;ctx.save();ctx.globalAlpha=Math.max(0,d.life/d.max);fx.monster(d,t,1-d.life/d.max);ctx.restore();}fx.deaths=fx.deaths.filter(d=>d.life>0);
  drawAim(t);
  // Multi-layer additive trails: colored halo, bright core, fading portrait echoes.
  if(game.mode==='moving'&&fx.hitStop<=0){trail.push({x:game.current.x,y:game.current.y});if(trail.length>32)trail.shift();if(!reduced&&Math.random()<.55){const b=game.current;fx.shards.push({x:b.x,y:b.y,vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40,life:.25,max:.25,color:b.color,size:1.3,angle:0,spin:0,spark:false});}}else if(game.mode!=='moving'&&trail.length)trail.shift();
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(let i=1;i<trail.length;i++){const a=i/trail.length;ctx.globalAlpha=a*.2;line(trail[i-1].x,trail[i-1].y,trail[i].x,game.current.color,a*22);ctx.globalAlpha=a*.6;line(trail[i-1].x,trail[i-1].y,trail[i].x,game.powered?'#fff6c3':'#d7ffe4',a*5);}ctx.restore();
  for(const h of game.heroes){const active=h.id===game.active,speed=Math.hypot(h.vx,h.vy);ctx.save();ctx.translate(h.x,h.y);ctx.shadowColor='#000';ctx.shadowBlur=7;ctx.shadowOffsetY=3;circle(0,0,h.r+4,'#0a211b','#c4ad6f',2);ctx.shadowBlur=0;ctx.shadowOffsetY=0;const medal=ctx.createLinearGradient(-24,-24,24,24);medal.addColorStop(0,'#f7e9b6');medal.addColorStop(.4,'#968852');medal.addColorStop(.7,'#edd99b');medal.addColorStop(1,'#4c5736');circle(0,0,h.r+2,null,medal,3);ctx.save();ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.clip();fx.heroPortrait(h.id,-h.r,-h.r,h.r*2);const glass=ctx.createLinearGradient(-h.r,-h.r,h.r,h.r);glass.addColorStop(0,'#f3ffd733');glass.addColorStop(.5,'#a8d5a800');glass.addColorStop(1,'#03160c33');ctx.fillStyle=glass;ctx.fillRect(-h.r,-h.r,h.r*2,h.r*2);ctx.restore();circle(0,0,h.r,null,h.color,1);circle(17,17,8,'#173524','#dbc389',1);ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f0e5bb';ctx.fillText(h.id+1,17,20);ctx.restore();
    if(active){const pulse=reduced?0:Math.sin(t*3)*2;runeCircle(h.x,h.y,34+pulse,t*.45,game.armed?'#ffe5a0':'#cbf8b5',.8);if(game.mode==='ready'){ctx.save();ctx.shadowColor='#b9ff91';ctx.shadowBlur=10;ctx.fillStyle='#f7ecc0';ctx.beginPath();ctx.moveTo(h.x-6,h.y-48);ctx.lineTo(h.x+6,h.y-48);ctx.lineTo(h.x,h.y-40);ctx.fill();ctx.restore();}if(speed>200){ctx.save();ctx.globalCompositeOperation='lighter';circle(h.x,h.y,h.r+5,null,h.color,2);ctx.restore();}}
  }
  // Lightning and bullet beams use a jagged outer glow plus a white-hot core.
  ctx.save();ctx.globalCompositeOperation='lighter';for(const b of beams){b.life-=dt;const a=Math.max(0,b.life/b.max);ctx.globalAlpha=a;const dx=b.x2-b.x1,dy=b.y2-b.y1,len=Math.hypot(dx,dy)||1,points=[];for(let j=0;j<=8;j++){const u=j/8,jitter=j===0||j===8?0:Math.sin(j*14+t*60)*8;points.push({x:b.x1+dx*u-dy/len*jitter,y:b.y1+dy*u+dx/len*jitter});}for(let j=1;j<points.length;j++){const p=points[j-1],q=points[j];ctx.globalAlpha=a*.25;line(p.x,p.y,q.x,q.y,b.color,12);ctx.globalAlpha=a;line(p.x,p.y,q.x,q.y,b.color,3);line(p.x,p.y,q.x,q.y,'#f7ffe3',1);}}beams=beams.filter(b=>b.life>0);ctx.restore();
  // Expanding rune fields and support rings.
  for(const r of rings){r.r+=dt*180;r.life-=dt;const a=Math.max(0,r.life/r.max);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.5;circle(r.x,r.y,r.r,null,r.color,3);circle(r.x,r.y,r.r*.85,null,r.color,1);ctx.restore();}rings=rings.filter(r=>r.life>0);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const hit of fx.impacts){hit.life-=dt;const a=Math.max(0,hit.life/hit.max),age=1-a,r=(10+age*80)*hit.power;ctx.save();ctx.translate(hit.x,hit.y);ctx.rotate(hit.angle);ctx.globalAlpha=a*.85;circle(0,0,r,null,hit.color,Math.max(.7,3*a));ctx.globalAlpha=a*.18;circle(0,0,r*.68,hit.color);if(hit.ritual){runeCircle(0,0,60+age*250,t*.8,hit.color,a);runeCircle(0,0,40+age*160,-t,hit.color,a*.8);}else{ctx.globalAlpha=a;for(let j=0;j<8;j++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(0,-(18+age*32)*hit.power);ctx.lineTo(2,0);ctx.fillStyle=j%2===0?'#ffffdc':hit.color;ctx.fill();}ctx.rotate(.4);ctx.beginPath();ctx.ellipse(0,0,r*.8,r*.16,0,-.5,Math.PI*1.2);ctx.strokeStyle='#fff7dc';ctx.lineWidth=3*a;ctx.stroke();}ctx.restore();}fx.impacts=fx.impacts.filter(x=>x.life>0);
  for(const p of fx.shards){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-dt*3);p.vy*=Math.exp(-dt*3);p.angle+=p.spin*dt;p.life-=dt;ctx.globalAlpha=Math.max(0,p.life/p.max);if(p.spark){line(p.x,p.y,p.x-p.vx*.025,p.y-p.vy*.025,p.color,1.5);}else{ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.7);ctx.restore();}}fx.shards=fx.shards.filter(p=>p.life>0);ctx.restore();
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;ctx.globalAlpha=Math.max(0,p.life/p.max)*.5;circle(p.x,p.y,p.size,p.color);}particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
  // Damage values kick outward, then float and fade; thick dark outline keeps them readable.
  for(const f of floaters){f.life-=dt;const age=f.max-f.life;f.y-=dt*(age<.12?95:27);const numeric=/^\d+$/.test(f.text),pop=age<.12?1.35-age*2.9:1;ctx.save();ctx.translate(f.x,f.y);ctx.scale(pop,pop);ctx.globalAlpha=Math.min(1,Math.max(0,f.life*3));ctx.font=numeric?'900 italic 28px "Space Grotesk",sans-serif':'bold 13px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.lineJoin='round';ctx.strokeStyle='#24200f';ctx.lineWidth=numeric?4:3;ctx.strokeText(f.text,0,0);ctx.fillStyle=numeric?'#fff1b1':f.color;ctx.fillText(f.text,0,0);ctx.restore();}floaters=floaters.filter(f=>f.life>0);
  if(fx.flash>0&&!reduced){ctx.fillStyle=`rgba(216,239,172,${fx.flash*.9})`;ctx.fillRect(0,0,500,560);}ctx.restore();
};
