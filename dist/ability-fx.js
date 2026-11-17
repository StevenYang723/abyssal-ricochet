'use strict';
/* Readable silhouettes, separate motion languages and sounds for every kit. */
const AbilityFX=window.AbilityFX={
  effects:[],
  reset(){this.effects=[];},
  event(e){
    if(e.type==='stage'){this.reset();return;}
    if(e.type==='skillFx'){
      const duration=e.ultimate?1.6:e.fall?1.15:.85;this.effects.push({...e,tag:'skill',age:0,duration});
      const notes={evelyn:[660,'sine'],noah:[1200,'triangle'],lucia:[440,'sine'],silas:[135,'sine'],aster:[220,'triangle'],rook:[300,'square'],seraph:[780,'sine'],corvus:[75,'sawtooth'],nyra:[310,'sine'],orion:[900,'triangle'],mira:[1050,'square'],ren:[560,'sawtooth']};
      const [n,type]=notes[e.key];tone(n,e.ultimate?.35:.14,type,.035);if(e.ultimate)setTimeout(()=>tone(n*1.5,.22,type,.025),110);
    }
    if(e.type==='bossCast'){
      this.effects.push({...e,tag:'boss',age:0,duration:1.35});
      if(e.damage){BattleFX.trauma=Math.max(BattleFX.trauma,9);BattleFX.hitStop=reduced?0:.07;BattleFX.punch($('damageVignette'),'flash');}
      tone({gaze:190,spores:80,fear:55,cross:740,guard:180,bells:280,tentacles:70,tide:120,eclipse:45}[e.plan.id],.4,'triangle',.055);
    }
    if(e.type==='bossPhase'){this.effects.push({...e,tag:'phase',age:0,duration:1.2});BattleFX.trauma=reduced?0:8;}
    if(e.type==='statusTick')this.effects.push({...e,tag:'tick',age:0,duration:.7});
    if(e.type==='shieldBlock'||e.type==='armorBlock')this.effects.push({...e,tag:'shield',age:0,duration:.6});
    if(this.effects.length>36)this.effects.splice(0,this.effects.length-36);
  },
  star(x,y,r,color,turn=0){ctx.save();ctx.translate(x,y);ctx.rotate(turn);ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rad=i%2?r*.27:r;const px=Math.cos(a)*rad,py=Math.sin(a)*rad;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.restore();},
  arrow(a,b,color,width=3){line(a.x,a.y,b.x,b.y,color,width);const angle=Math.atan2(b.y-a.y,b.x-a.x);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(0,0);ctx.lineTo(-10,4);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();},
  shield(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.8,y-r*.5);ctx.lineTo(x+r*.7,y+r*.4);ctx.quadraticCurveTo(x+r*.3,y+r*.9,x,y+r);ctx.quadraticCurveTo(x-r*.3,y+r*.9,x-r*.7,y+r*.4);ctx.lineTo(x-r*.8,y-r*.5);ctx.closePath();ctx.fillStyle=color+'24';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();},
  plan(p,alpha=.18,attack=false){
    ctx.save();ctx.beginPath();ctx.rect(12,80,476,455);ctx.clip();ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.setLineDash(attack?[]:[7,6]);ctx.globalAlpha=alpha;
    if(p.shape==='lane'||p.shape==='cross'){for(const [a,b]of p.lines){line(a.x,a.y,b.x,b.y,p.color,p.width*2);ctx.globalAlpha=Math.min(.9,alpha*3);line(a.x,a.y,b.x,b.y,p.color,attack?8:2);ctx.globalAlpha=alpha;}}
    if(p.shape==='circles'){for(const z of p.zones){circle(z.x,z.y,z.r,p.color);ctx.globalAlpha=Math.min(.85,alpha*3);circle(z.x,z.y,z.r,null,p.color,2);line(z.x-9,z.y,z.x+9,z.y,p.color,1);line(z.x,z.y-9,z.x,z.y+9,p.color,1);ctx.globalAlpha=alpha;}}
    if(p.shape==='rows'){for(const y of p.rows){ctx.fillRect(12,y-p.width,476,p.width*2);ctx.globalAlpha=Math.min(.85,alpha*3);line(12,y-p.width,488,y-p.width,p.color,1);line(12,y+p.width,488,y+p.width,p.color,1);ctx.globalAlpha=alpha;}}
    if(p.shape==='edge'){const w=p.width;ctx.fillRect(12,80,476,w);ctx.fillRect(12,535-w,476,w);ctx.fillRect(12,80,w,455);ctx.fillRect(488-w,80,w,455);ctx.globalAlpha=Math.min(.85,alpha*3);ctx.strokeRect(12+w,80+w,476-w*2,455-w*2);}
    if(p.shape==='outside'){ctx.beginPath();ctx.rect(12,80,476,455);ctx.arc(p.safe.x,p.safe.y,p.safe.r,0,Math.PI*2,true);ctx.fill('evenodd');ctx.globalAlpha=.65;circle(p.safe.x,p.safe.y,p.safe.r,null,'#b9e9b3',2);ctx.fillStyle='#cfe9c4';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('安全区',p.safe.x,p.safe.y+3);}
    if(p.shape==='fear'){ctx.globalAlpha=alpha*.6;ctx.fillRect(12,80,476,455);}
    ctx.restore();
  },
  drawUnder(t){if(!game.tactical)return;
    for(const hazard of game.hazards)this.plan(hazard,.12);
    const boss=game.enemies.find(e=>e.hp>0&&e.plan);if(boss){const alpha=boss.counter===1?.15+Math.sin(t*3)*.025:.07;this.plan(boss.plan,reduced?.1:alpha);}
    for(const d of game.delayed){ctx.save();ctx.setLineDash([3,6]);circle(d.x,d.y,d.r,'#9ab9ff12','#abc7ef88',1);ctx.setLineDash([]);this.star(d.x,d.y,15,'#bdd4fc',t*.2);ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#bdd4fc';ctx.fillText('陨星 · 下次弹射结束',d.x,d.y+d.r+13);ctx.restore();}
  },
  drawSkill(f,t){const k=AbyssKit.SKILLS[f.key],c=k.color,o=f.origin,p=Math.min(1,f.age/f.duration),a=Math.sin(p*Math.PI),r=f.ultimate?1.5:1,targets=f.impact?[f.impact]:f.targets.length?f.targets:[o];ctx.save();ctx.globalAlpha*=Math.min(1,a*1.5);ctx.lineCap='round';
    switch(k.motif){
      case'constellation':for(const q of targets){const points=Array.from({length:5},(_,i)=>({x:q.x+Math.cos(i*2.51+t*.2)*50*r,y:q.y+Math.sin(i*2.51+t*.2)*50*r}));for(let i=0;i<5;i++){line(points[i].x,points[i].y,points[(i+1)%5].x,points[(i+1)%5].y,c,1.5);this.star(points[i].x,points[i].y,8*r,'#ecffe3',t);}line(o.x,o.y,q.x,q.y,c,1);}break;
      case'rail':for(const q of targets){const origins=f.ultimate?[{x:18,y:q.y-35},{x:482,y:q.y+35}]:[o];for(const from of origins){const end=f.end||{x:q.x,y:q.y};line(from.x,from.y,end.x,end.y,c,9*r);line(from.x,from.y,end.x,end.y,'#eefaff',2);const u=Math.min(1,p*3);this.star(from.x+(end.x-from.x)*u,from.y+(end.y-from.y)*u,12,c);ctx.strokeStyle='#d9f1ff';ctx.lineWidth=1;ctx.strokeRect(q.x-20,q.y-20,40,40);}}break;
      case'lantern':{const center=f.ultimate?{x:250,y:430}:o;circle(center.x,center.y,28+p*85*r,'#f2c56812',c,2);circle(center.x,center.y,20+p*60*r,null,c,1);for(const q of targets){this.shield(q.x,q.y,30,c,.7);for(let i=0;i<4;i++){const x=q.x+(i-1.5)*12,y=q.y+15-p*65-i%2*8;this.star(x,y,3,c);}}this.star(center.x,center.y-35,20,'#fff0b0');break;}
      case'drain':for(const q of targets){ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.quadraticCurveTo((q.x+o.x)/2+50*Math.sin(p*Math.PI),(q.y+o.y)/2,o.x,o.y);ctx.strokeStyle=c;ctx.lineWidth=3;ctx.stroke();for(let i=0;i<5;i++){const u=(p+i*.15)%1;circle(q.x+(o.x-q.x)*u+Math.sin(u*Math.PI)*35,q.y+(o.y-q.y)*u,4+(1-u)*3,c);}}circle(o.x,o.y,25+p*30,null,c,2);break;
      case'meteor':for(const q of targets){if(f.warning){this.star(q.x,q.y-20-p*20,20*r,c,p);circle(q.x,q.y,30+p*60,null,c,1);}else{const u=Math.min(1,p*2.2),x=q.x-160*(1-u),y=q.y-260*(1-u);line(x-50,y-80,x,y,c,9);line(x-30,y-50,x,y,'#f5f5ff',3);this.star(x,y,14*r,'#d2dfff',p*4);if(p>.4){circle(q.x,q.y,(p-.4)*170*r,null,c,3);for(let i=0;i<8;i++){const v=i*Math.PI/4;this.star(q.x+Math.cos(v)*(p-.4)*110,q.y+Math.sin(v)*(p-.4)*110,5,c,v);}}}}break;
      case'ricochet':{let from=o;for(let i=0;i<targets.length;i++){const q=targets[i];this.arrow(from,q,c,3*r);const u=Math.max(0,Math.min(1,p*3-i*.45));this.star(from.x+(q.x-from.x)*u,from.y+(q.y-from.y)*u,9,'#ffd7a0');if(f.burst||f.ultimate){circle(q.x,q.y,15+p*45,null,c,3);this.star(q.x,q.y,22*a,c,p);}from=q;}break;}
      case'feather':{const center=f.ultimate?{x:250,y:390}:o;for(const side of [-1,1])for(let i=0;i<6;i++){ctx.save();ctx.translate(center.x+side*(20+i*9+p*30),center.y-30+i*10-p*30);ctx.rotate(side*(-.8+i*.09));ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,0,5,22-i*2,0,0,Math.PI*2);ctx.fill();ctx.restore();}for(const q of targets)this.shield(q.x,q.y,29+p*8,c);break;}
      case'poison':for(const q of targets){for(let i=0;i<7;i++){const angle=i*2.4,rad=20+p*50*r,x=q.x+Math.cos(angle)*rad,y=q.y+Math.sin(angle)*rad-p*10;circle(x,y,5+(i%3)*3,c+'33',c,1);}ctx.globalAlpha*=.8;circle(q.x,q.y,30+p*35,c+'24');ctx.globalAlpha/=.8;ctx.fillStyle=c;ctx.font='bold 24px serif';ctx.textAlign='center';ctx.fillText('☠',q.x,q.y+7);}break;
      case'tide':{const q=f.ultimate?{x:250,y:300}:targets[0];for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(q.x,q.y,25+p*(f.ultimate?270:120)+i*12,13+p*(f.ultimate?170:65)+i*6,0,0,Math.PI*2);ctx.strokeStyle=i%2?c:'#caf5eb';ctx.lineWidth=i===0?6*r:2;ctx.stroke();}for(const enemy of targets)circle(enemy.x,enemy.y,enemy.r+10,null,c,2);break;}
      case'blade':for(const q of targets){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(-.8+p*.4);for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,(50+i*10)*r,-1.5,1.7);ctx.strokeStyle=i?'#f6f1ff':c;ctx.lineWidth=i?3:11;ctx.stroke();}line(-55*r,45*r,55*r,-45*r,c,5);ctx.restore();}if(f.ultimate)this.shield(o.x,o.y,37,c);break;
      case'clock':for(const q of f.ultimate?targets:[o,...targets]){const radius=35*r;circle(q.x,q.y,radius,null,c,2);for(let i=0;i<12;i++){const angle=i*Math.PI/6;line(q.x+Math.cos(angle)*(radius-5),q.y+Math.sin(angle)*(radius-5),q.x+Math.cos(angle)*radius,q.y+Math.sin(angle)*radius,c,1);}const angle=reduced?-.8:p*6;line(q.x,q.y,q.x+Math.cos(angle)*radius*.7,q.y+Math.sin(angle)*radius*.7,c,2);line(q.x,q.y,q.x,q.y-radius*.4,'#fff0bc',2);}break;
      case'slash':for(const q of targets){for(let i=0;i<(f.ultimate?5:2);i++){const offset=(i-1)*14,len=(40+25*r)*Math.min(1,p*5);line(q.x-len,q.y+len*.65+offset,q.x+len,q.y-len*.65+offset,c,6-i*.6);line(q.x-len,q.y+len*.65+offset,q.x+len,q.y-len*.65+offset,'#ffdfdf',1);}if(f.ultimate){ctx.save();ctx.translate(q.x+40,q.y+20);ctx.rotate(.3);ctx.strokeStyle=c;ctx.strokeRect(-8,-14,16,28);ctx.fillStyle=c;ctx.font='16px serif';ctx.fillText('封',-8,6);ctx.restore();}}break;
    }ctx.restore();
  },
  drawBoss(f){const p=f.plan,u=f.age/f.duration,a=Math.sin(u*Math.PI);this.plan(p,a*.3,true);ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=p.color;ctx.fillStyle=p.color;
    if(p.id==='gaze'){const [from,to]=p.lines[0];line(from.x,from.y,to.x,to.y,p.color,20*a);line(from.x,from.y,to.x,to.y,'#f1ffd0',5*a);ctx.beginPath();ctx.ellipse(from.x,from.y,35,16,0,0,Math.PI*2);ctx.stroke();circle(from.x,from.y,8,'#edffc5');}
    if(p.id==='spores')for(const z of p.zones){for(let i=0;i<8;i++){const ang=i*.785;circle(z.x+Math.cos(ang)*z.r*u,z.y+Math.sin(ang)*z.r*u,7+u*7,p.color+'88',p.color);}}
    if(p.id==='fear'||p.id==='eclipse'){const x=250,y=p.id==='fear'?210:240;for(let i=0;i<3;i++)circle(x,y,30+u*170+i*20,null,p.color,2);circle(x,y,36,'#25152e',p.color,3);if(p.id==='fear'){ctx.beginPath();ctx.ellipse(x,y,32,10,0,0,Math.PI*2);ctx.stroke();}else{circle(x+13,y-8,29,'#101222');}}
    if(p.id==='cross')for(const [from,to]of p.lines){line(from.x,from.y,to.x,to.y,p.color,20*a);line(from.x,from.y,to.x,to.y,'#fff6cf',4);}
    if(p.id==='guard')this.shield(f.origin.x,f.origin.y,100,p.color);
    if(p.id==='bells')for(const z of p.zones){const fall=Math.max(0,1-u*3);ctx.save();ctx.translate(z.x,z.y-fall*180);ctx.beginPath();ctx.moveTo(-23,-30);ctx.quadraticCurveTo(-25,-57,0,-58);ctx.quadraticCurveTo(25,-57,23,-30);ctx.lineTo(34,6);ctx.lineTo(-34,6);ctx.closePath();ctx.fillStyle='#786047';ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=3;ctx.stroke();circle(0,9,5,p.color);ctx.restore();if(u>.32)circle(z.x,z.y,(u-.32)*110,null,p.color,4);}
    if(p.id==='tentacles')for(let j=0;j<p.rows.length;j++){const y=p.rows[j];ctx.beginPath();const x=j?500:-10;ctx.moveTo(x,y);ctx.bezierCurveTo(j?300:200,y-80*a,j?100:400,y+80*a,j?0:500,y);ctx.strokeStyle='#38264c';ctx.lineWidth=23*a+3;ctx.stroke();ctx.strokeStyle=p.color;ctx.lineWidth=4;ctx.stroke();for(let i=0;i<8;i++)circle(35+i*60,y+Math.sin(i+u*5)*12,3,p.color);}
    if(p.id==='tide')for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(12,100+i*16);for(let x=12;x<=488;x+=8)ctx.lineTo(x,100+i*16+Math.sin(x*.04+u*8)*12+u*30);ctx.strokeStyle=i%2?p.color:'#b3e5d8';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.moveTo(12,520-i*16);for(let x=12;x<=488;x+=8)ctx.lineTo(x,520-i*16+Math.sin(x*.04-u*8)*12-u*30);ctx.stroke();}
    ctx.restore();
  },
  drawOver(t,dt){
    if(game.tactical){if(game.shield>0)for(const h of game.heroes)this.shield(h.x,h.y,29,'#bcd5db',.38);for(const e of game.enemies){if(e.hp<=0)continue;if(e.armor>0)this.shield(e.x,e.y,e.r+12,'#9ec7dd',.5);const marks=[e.poison?'毒':'',e.burn?'灼':'',e.expose?.until>=game.turn?'纹':''].filter(Boolean).join(' ');if(marks){ctx.save();ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillStyle=e.poison?'#ace07b':e.burn?'#ffb084':'#d6d5a6';ctx.fillText(marks,e.x,e.y+e.r+30);ctx.restore();}}}
    for(const f of this.effects){f.age+=dt;if(f.age>=f.duration)continue;ctx.save();if(f.tag==='skill')this.drawSkill(f,t);else if(f.tag==='boss')this.drawBoss(f);else if(f.tag==='shield'){this.shield(f.x,f.y,30+f.age*40,'#b7dded',1-f.age/f.duration);}else if(f.tag==='tick'){circle(f.x,f.y,10+f.age*50,null,f.kind==='poison'?'#98ce73':'#ed9c6c',2);}else if(f.tag==='phase'){ctx.globalAlpha=(1-f.age/f.duration)*.45;circle(f.x,f.y,60+f.age*150,null,'#d18fc6',4);}ctx.restore();}
    this.effects=this.effects.filter(f=>f.age<f.duration);
  }
};
