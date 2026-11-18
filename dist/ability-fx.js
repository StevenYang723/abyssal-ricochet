'use strict';
/* Material-based arcana renderer. The simulation owns damage; this file owns timing,
   light, texture, motion and aftermath. All coordinates remain in the 500×560 arena. */
const AbilityFX=window.AbilityFX={
  effects:[],textures:[],atlas:new Image(),drawBudget:160,
  tiles:{seal:0,rail:1,lantern:2,soul:3,meteor:4,blast:5,wings:6,venom:7,tide:8,blade:9,clock:10,slash:11,eye:12,bell:13,tentacle:14,eclipse:15},
  init(){
    this.atlas.onload=()=>{
      const cellW=this.atlas.naturalWidth/4,cellH=this.atlas.naturalHeight/4;
      this.textures=Array.from({length:16},(_,i)=>{
        const tile=document.createElement('canvas');tile.width=tile.height=320;
        const x=tile.getContext('2d');x.drawImage(this.atlas,(i%4)*cellW,Math.floor(i/4)*cellH,cellW,cellH,0,0,320,320);
        x.globalCompositeOperation='destination-in';
        const edge=x.createRadialGradient(160,160,108,160,160,160);edge.addColorStop(0,'#fff');edge.addColorStop(1,'#fff0');
        x.fillStyle=edge;x.fillRect(0,0,320,320);return tile;
      });
    };
    this.atlas.src='assets/arcana-vfx-v5.png';
  },
  reset(){this.effects=[];},
  add(f){this.effects.push({...f,age:0});if(this.effects.length>24)this.effects.splice(0,this.effects.length-24);},
  event(e){
    if(e.type==='stage'){this.reset();return;}
    if(e.type==='skillFx'){
      if(e.tick&&['tether','well','trail'].includes(e.geometry?.shape))this.effects=this.effects.filter(f=>!(f.tag==='skill'&&f.key===e.key&&f.geometry?.shape===e.geometry.shape && (e.geometry.shape!=='tether'||f.ultimate===e.ultimate)));
      this.add({...e,tag:'skill',duration:e.duration||(e.tick?(e.warning?.52:.32):e.ultimate?2.35:e.fall?1.5:1.3)});
      if(window.ArcanaAudio&&!e.tick)ArcanaAudio.play(e.key,!!e.ultimate && e.round===undefined,e.phase);
    }
    if(e.type==='bossCast'){
      this.add({...e,tag:'boss',duration:2.15});
      if(e.damage){BattleFX.trauma=Math.max(BattleFX.trauma,8);BattleFX.hitStop=reduced?0:.09;BattleFX.punch($('damageVignette'),'flash');}
      if(window.ArcanaAudio)ArcanaAudio.play(e.plan.id,true);
    }
    if(e.type==='bossPhase')this.add({...e,tag:'phase',duration:1.8});
    if(e.type==='statusTick')this.add({...e,tag:'tick',duration:1});
    if(e.type==='shieldBlock'||e.type==='armorBlock')this.add({...e,tag:'shield',duration:.85});
  },
  ease(v){v=Math.max(0,Math.min(1,v));return 1-Math.pow(1-v,3);},
  envelope(p){return Math.min(1,p*9)*Math.pow(Math.max(0,1-p),.65);},
  sprite(name,x,y,w,h=w,rotation=0,alpha=1,blend='screen'){
    if(alpha<.005||w<=0||h<=0||this.drawBudget--<=0)return;
    const texture=this.textures[this.tiles[name]];if(!texture)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=Math.min(1,Math.max(0,alpha));
    ctx.globalCompositeOperation=blend;ctx.drawImage(texture,-w/2,-h/2,w,h);ctx.restore();
  },
  glow(x,y,r,color,alpha=.5){
    if(r<1||alpha<=0)return;
    ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha*=alpha;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+'bb');g.addColorStop(.18,color+'65');g.addColorStop(.58,color+'20');g.addColorStop(1,color+'00');
    ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
  },
  sparks(x,y,p,color,count=14,spread=85,seed=0){
    const n=reduced?Math.min(4,count):count;
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<n;i++){
      const angle=i*2.39996+seed,speed=.45+(i*17%11)/10,d=this.ease(p)*spread*speed;
      const px=x+Math.cos(angle)*d,py=y+Math.sin(angle)*d+p*p*22;
      ctx.globalAlpha*=1;ctx.globalAlpha=this.envelope(p)*(.4+(i%3)*.2);
      line(px-Math.cos(angle)*(3+8*(1-p)),py-Math.sin(angle)*(3+8*(1-p)),px,py,i%3?color:'#fff1d2',i%3?.8:1.6);
    }ctx.restore();
  },
  shock(x,y,p,color,scale=1){
    const r=(16+this.ease(p)*98)*scale;
    ctx.save();ctx.translate(x,y);ctx.scale(1,.64);ctx.globalCompositeOperation='screen';ctx.globalAlpha*=Math.pow(1-p,1.5);
    const ring=ctx.createRadialGradient(0,0,r*.72,0,0,r);
    ring.addColorStop(0,color+'00');ring.addColorStop(.6,color+'04');ring.addColorStop(.86,color+'8a');ring.addColorStop(.94,'#fff0c466');ring.addColorStop(1,color+'00');
    circle(0,0,r,ring);ctx.restore();
  },
  ribbon(a,b,color,p,width=5,bend=0){
    ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
    const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
    for(let layer=0;layer<3;layer++){
      ctx.beginPath();ctx.moveTo(a.x,a.y);
      const sway=bend+Math.sin(p*9+layer)*12;
      ctx.bezierCurveTo(a.x+dx*.3+nx*sway,a.y+dy*.3+ny*sway,a.x+dx*.7-nx*sway,a.y+dy*.7-ny*sway,b.x,b.y);
      ctx.strokeStyle=layer===2?'#fff4dc':color;ctx.globalAlpha*=layer===0?.22:1;
      ctx.lineWidth=layer===0?width*4:layer===1?width:Math.max(.6,width*.18);ctx.stroke();
      if(layer===0)ctx.globalAlpha/=.22;
    }ctx.restore();
  },
  ward(x,y,r,color,alpha=.7){
    ctx.save();ctx.globalAlpha*=alpha;ctx.globalCompositeOperation='screen';
    const g=ctx.createRadialGradient(x-r*.25,y-r*.35,r*.12,x,y,r);
    g.addColorStop(0,color+'00');g.addColorStop(.65,color+'08');g.addColorStop(.91,color+'19');g.addColorStop(.98,color+'91');g.addColorStop(1,color+'00');
    circle(x,y,r,g);ctx.beginPath();ctx.ellipse(x,y,r*.74,r,-.3,-2.8,-.4);ctx.strokeStyle=color+'a0';ctx.lineWidth=.8;ctx.stroke();
    this.sprite('seal',x,y+r*.7,r*2.3,r*.85,0,.42);ctx.restore();
  },
  plan(p,alpha=.14,attack=false){
    if(window.SpatialFX&&SpatialFX.plan(p,alpha))return;
    ctx.save();ctx.beginPath();ctx.rect(12,80,476,455);ctx.clip();ctx.globalAlpha*=alpha;
    ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=1.2;
    if(p.shape==='lane'||p.shape==='cross'){
      for(const [a,b]of p.lines){
        const angle=Math.atan2(b.y-a.y,b.x-a.x),len=Math.hypot(b.x-a.x,b.y-a.y);
        ctx.save();ctx.translate(a.x,a.y);ctx.rotate(angle);
        const g=ctx.createLinearGradient(0,-p.width,0,p.width);g.addColorStop(0,p.color+'00');g.addColorStop(.1,p.color+'bb');g.addColorStop(.4,p.color+'38');g.addColorStop(.6,p.color+'38');g.addColorStop(.9,p.color+'bb');g.addColorStop(1,p.color+'00');
        ctx.fillStyle=g;ctx.fillRect(0,-p.width,len,p.width*2);ctx.setLineDash([16,9]);ctx.strokeRect(0,-p.width,len,p.width*2);ctx.restore();
      }
    }
    if(p.shape==='circles')for(const z of p.zones){this.glow(z.x,z.y,z.r,p.color,.8);circle(z.x,z.y,z.r,null,p.color,1.2);this.sprite(p.id==='bells'?'clock':'venom',z.x,z.y,z.r*2,z.r*2,0,.75);}
    if(p.shape==='rows')for(const y of p.rows){ctx.fillRect(12,y-p.width,476,p.width*2);line(12,y-p.width,488,y-p.width,p.color,1);line(12,y+p.width,488,y+p.width,p.color,1);}
    if(p.shape==='edge'){const w=p.width;ctx.fillRect(12,80,476,w);ctx.fillRect(12,535-w,476,w);ctx.fillRect(12,80,w,455);ctx.fillRect(488-w,80,w,455);ctx.strokeRect(12+w,80+w,476-w*2,455-w*2);}
    if(p.shape==='outside'){
      ctx.beginPath();ctx.rect(12,80,476,455);ctx.arc(p.safe.x,p.safe.y,p.safe.r,0,Math.PI*2,true);ctx.fill('evenodd');
      ctx.globalAlpha=Math.max(.5,alpha);circle(p.safe.x,p.safe.y,p.safe.r,null,'#c7e4b5',1.5);this.sprite('seal',p.safe.x,p.safe.y,p.safe.r*1.9,p.safe.r*1.9,0,.18);
      ctx.font='11px serif';ctx.textAlign='center';ctx.fillStyle='#e4efc7';ctx.fillText('安全区',p.safe.x,p.safe.y+3);
    }
    if(p.shape==='fear'){ctx.fillRect(12,80,476,455);this.sprite('eye',250,200,175,125,0,.8);}
    ctx.restore();
  },
  drawUnder(t){
    this.drawBudget=reduced?65:160;
    if(!game.tactical)return;if(reduced)t=0;
    if(window.SpatialFX)SpatialFX.preview();
    const cinematic=this.effects.reduce((n,f)=>Math.max(n,(f.ultimate||f.tag==='boss')?this.envelope(f.age/f.duration):0),0);
    if(cinematic){ctx.fillStyle='rgba(2,6,12,'+(cinematic*.24)+')';ctx.fillRect(0,70,500,490);}
    for(const hazard of game.hazards){
      this.plan(hazard,.12);
      if(hazard.zones)for(const z of hazard.zones)this.sprite(hazard.id==='bells'?'clock':'venom',z.x,z.y,z.r*2.3,z.r*1.8,Math.sin(t*.3)*.1,.28);
      if(hazard.id==='tide')for(const y of [100,510])this.sprite('tide',250,y,520,140,t*.05,.3);
    }
    const boss=game.enemies.find(e=>e.hp>0&&e.plan);
    if(boss)this.plan(boss.plan,boss.counter===1?.21+Math.sin(t*2)*.03:.13);
    for(const d of game.delayed){
      this.sprite('seal',d.x,d.y,d.r*2,d.r*1.2,t*.08,.5);this.glow(d.x,d.y,55,'#91b6ee',.25);
      ctx.save();ctx.font='10px serif';ctx.textAlign='center';ctx.fillStyle='#bed7ef';ctx.fillText('陨星 · 下次弹射结束',d.x,d.y+d.r+13);ctx.restore();
    }
  },
  weaponPhase(f){
    const color=AbyssKit.SKILLS[f.key].color;
    const age=f.age/f.duration,p=reduced?.45:age;
    ctx.save();
    SpatialFX.clip();
    ctx.globalAlpha*=this.envelope(age);
    if(f.phase==='prepare'){
      if(game.turn===f.turn && game.active===f.actorId && game.mode==='moving'){
        const caster=game.current;
        if(f.key==='rook'){
          for(let i=0;i<3;i++){
            const angle=f.angle+(i-1)*.46+Math.PI,r=39-12*p;
            this.sprite('rail',caster.x+Math.cos(angle)*r,caster.y+Math.sin(angle)*r,37,15,angle+Math.PI,.88);
          }
        }else if(f.key==='orion'){
          this.ward(caster.x,caster.y,36+4*p,color,.9);
          this.sprite('blade',caster.x,caster.y,67,67,f.angle+.7,.72);
        }else{
          this.sprite('slash',caster.x,caster.y,78,65,f.angle-p*.45,.84);
        }
      }
    }else{
      const at=f.origin;
      if(f.key==='orion'){
        const size=f.geometry.radius*2*this.ease(.3+p);
        this.sprite('blade',at.x,at.y,size,size,f.angle+Math.PI/2,.95);
        this.shock(at.x,at.y,p,color,1.2);
      }else{
        this.sprite('slash',at.x,at.y,108,76,f.angle+Math.PI*.25,.95);
      }
      for(const hit of f.targets) this.sparks(hit.x,hit.y,p,color,10,39,hit.x);
    }
    ctx.restore();
  },
  drawSkill(f,t){
    if(f.phase==='prepare'||f.phase==='contact'){this.weaponPhase(f);return;}
    if(window.SpatialFX&&SpatialFX.drawSkill(f,t))return;
    const k=AbyssKit.SKILLS[f.key],c=k.color,o=f.origin,p=reduced?.55:Math.min(1,f.age/f.duration),a=this.envelope(f.age/f.duration),u=f.ultimate?1.6:1;
    const targets=f.impact?[f.impact]:f.targets.length?f.targets:[o];
    ctx.save();ctx.globalAlpha*=a;
    if(f.ultimate && k.motif!=='rail'){this.sprite(k.motif==='clock'?'clock':'seal',o.x,o.y,190,110,-p*.25,.45);this.glow(o.x,o.y,100,c,.55);}
    switch(k.motif){
      case'constellation':
        for(const q of targets){
          this.sprite('seal',q.x,q.y,135*u,135*u,-p*.35,.9);
          this.sprite('soul',q.x,q.y,100*u,115*u,p*.4,.25);
          for(let i=0;i<(f.ultimate?5:3);i++){const ang=i*2.4+p*.65,rr=(38+Math.sin(p*3)*15)*u;const v={x:q.x+Math.cos(ang)*rr,y:q.y+Math.sin(ang)*rr};this.glow(v.x,v.y,12,c,.7);if(f.ultimate)this.ribbon(v,q,c,p,1.1);}
          this.sparks(q.x,q.y,p,c,13,70*u,q.x);this.shock(q.x,q.y,p,c,.65*u);
        }break;
      case'rail':{
        const round=f.round,shot=p;
        ctx.save();SpatialFX.clip();
        for(const [index,q] of f.targets.entries()){
          const left=(index+round)%2===0;
          const muzzle={x:left?12:488,y:Math.max(80,Math.min(535,q.y+(left?-55:55)))};
          SpatialFX.silverShot(muzzle,q,reduced?.35:shot);
          if(shot>.35) SpatialFX.silverImpact(q,(shot-.35)/.65);
        }
        ctx.restore();break;
      }
      case'lantern':{
        const center=f.ultimate?{x:250,y:405}:o;
        this.sprite('lantern',center.x,center.y-32,190*u,230*u,0,.9);
        this.sprite('seal',center.x,center.y+40,250*u,100*u,p*.12,.5);
        this.glow(center.x,center.y,145*u,c,.55);
        for(const q of targets){this.ward(q.x,q.y,34+12*p,c);this.ribbon(center,q,c,p,.8,28);for(let i=0;i<3;i++)this.glow(q.x+Math.sin(i*2+p)*20,q.y+18-p*65-i*8,4,c,.85);}
        break;
      }
      case'drain':
        for(const q of targets){
          for(let i=0;i<3;i++){const v=(p+i*.28)%1,x=q.x+(o.x-q.x)*v+Math.sin(v*Math.PI)*45,y=q.y+(o.y-q.y)*v;this.sprite('soul',x,y,70+30*u,95+35*u,Math.atan2(o.y-q.y,o.x-q.x)-.7,.8);}
          this.ribbon(q,o,c,p,2.2,35);this.glow(q.x,q.y,75,c,.3);
        }this.sprite('seal',o.x,o.y,115,100,-p*.4,.6);this.shock(o.x,o.y,p,c,.7);break;
      case'meteor':
        targets.forEach((q,i)=>{
          if(f.warning){this.sprite('clock',q.x,q.y,125,100,p*.2,.65);this.sprite('meteor',q.x-35,q.y-100,90,110,-.1,.65);return;}
          const v=Math.max(0,Math.min(1,(p-.09*i)*2.9)),fall=this.ease(v);
          const x=q.x-210*(1-fall),y=q.y-290*(1-fall);
          this.sprite('meteor',x-22,y-25,120*u,160*u,-.12,.95);
          if(v>.55){const impact=(v-.55)/.45;this.sprite('blast',q.x,q.y,95+impact*120*u,95+impact*120*u,p*.3,.7);this.glow(q.x,q.y,115*u,c,.65);this.shock(q.x,q.y,impact,c,1.25*u);this.sparks(q.x,q.y,impact,c,20,95*u,i);}
        });break;
      case'ricochet':{
        let from=o;
        targets.forEach((q,i)=>{const v=Math.max(0,Math.min(1,p*2.4-i*.23));this.ribbon(from,q,c,v,2);this.sprite('blast',q.x,q.y,(75+v*80)*u,(75+v*80)*u,v,.85);this.sparks(q.x,q.y,v,c,16,90,i);this.shock(q.x,q.y,v,c,.8);from=q;});
        break;
      }
      case'feather':{
        const center=f.ultimate?{x:250,y:370}:o;
        this.sprite('wings',center.x,center.y-55,300*u,240*u,Math.sin(p*3)*.06,.95);
        this.sprite('lantern',center.x,center.y,95,140,0,.45);
        for(const q of targets){this.ward(q.x,q.y,34+12*p,c,.9);this.sparks(q.x,q.y,p,c,8,45,q.x);}
        this.shock(center.x,center.y,p,c,1.8);break;
      }
      case'poison':
        targets.forEach((q,i)=>{
          for(let j=0;j<3;j++){const ang=j*2.1+p*.7;this.sprite('venom',q.x+Math.cos(ang)*22*u,q.y+Math.sin(ang)*18-p*24,120*u,115*u,ang*.3,.58);}
          this.sprite('seal',q.x,q.y+20,120*u,60*u,-p*.15,.3);this.sparks(q.x,q.y,p,c,8,55,i);
        });break;
      case'tide':{
        const q=f.ultimate?{x:250,y:315}:targets[0],size=(130+this.ease(p)*95)*u;
        this.sprite('tide',q.x,q.y,size,size*.8,-p*1.2,.95);
        this.sprite('tide',q.x,q.y,size*.75,size*.65,p*.85,.42);
        this.shock(q.x,q.y,p,c,2*u);this.sparks(q.x,q.y,p,'#c7f3eb',20,140*u,2);
        for(const e of targets)this.glow(e.x,e.y,55,c,.25);
        break;
      }
      case'blade':
        for(const q of targets){
          this.sprite('blade',q.x,q.y,185*u,160*u,-.2+p*.3,.95);
          if(f.ultimate)this.sprite('blade',q.x,q.y+15,145*u,140*u,2.9-p*.2,.6);
          this.sparks(q.x,q.y,p,'#e2d8ff',17,100*u);this.shock(q.x,q.y,p,c,u);
        }if(f.ultimate)this.ward(o.x,o.y,43,c);break;
      case'clock':
        for(const q of f.ultimate?targets:[o,...targets]){
          const r=90*u;
          this.sprite('clock',q.x,q.y,r*1.6,r*1.6,-p*.38,.9);
          this.sprite('seal',q.x,q.y,r*2,r*1.3,p*.22,.2);
          for(let i=0;i<4;i++){const ang=i*Math.PI/2-p*.7;this.glow(q.x+Math.cos(ang)*r*.7,q.y+Math.sin(ang)*r*.7,7,c,.8);}
          this.shock(q.x,q.y,p,c,.8);
        }break;
      case'slash':
        targets.forEach((q,j)=>{
          const count=f.ultimate?3:2;
          for(let i=0;i<count;i++){const v=Math.max(0,Math.min(1,(p-i*.13)*2.2));if(v<=0)continue;
            this.sprite('slash',q.x+(i-1)*8,q.y+(i-1)*14,(140+this.ease(v)*65)*u,155*u,(i%2?2.7:-.2)+v*.18,Math.pow(1-v,.4));
          }
          this.sprite('blast',q.x,q.y,105*u,90*u,p,.28);this.sparks(q.x,q.y,p,c,20,100*u,j);
        });break;
    }
    ctx.restore();
  },
  drawBoss(f,t){
    if(window.SpatialFX&&SpatialFX.drawBoss(f,t))return;
    const p=f.plan,u=reduced?.55:Math.min(1,f.age/f.duration),a=this.envelope(f.age/f.duration);
    ctx.save();ctx.globalAlpha*=a;this.plan(p,.2,true);
    if(p.id==='gaze'){
      const [from,to]=p.lines[0],reach={x:from.x+(to.x-from.x)*this.ease(u*3),y:from.y+(to.y-from.y)*this.ease(u*3)};
      this.sprite('eye',from.x,from.y,210,150,0,.95);this.glow(from.x,from.y,130,p.color,.8);
      this.ribbon(from,reach,p.color,u,15);this.sprite('seal',from.x,from.y,220,220,u*.2,.45);
      f.targets.forEach(q=>{this.sprite('blast',q.x,q.y,140,120,u,.55);this.sparks(q.x,q.y,u,p.color,18,95);});
    }
    if(p.id==='spores')for(const z of p.zones){this.sprite('venom',z.x,z.y,z.r*3.2,z.r*3,-u*.35,.8);this.sprite('venom',z.x-15,z.y-20,z.r*2,z.r*2,u*.5,.6);this.shock(z.x,z.y,u,p.color,1);this.sparks(z.x,z.y,u,p.color,13,z.r*1.5);}
    if(p.id==='fear'){this.sprite('eye',250,215,310,200,-.06,.85);this.sprite('soul',250,230,430,400,u*.4,.35);for(let i=0;i<3;i++)this.shock(250,215,(u+i*.2)%1,p.color,2.7);}
    if(p.id==='cross')for(const [from,to]of p.lines){this.ribbon(from,to,p.color,u,12);this.sprite('lantern',(from.x+to.x)/2,(from.y+to.y)/2,200,280,Math.atan2(to.y-from.y,to.x-from.x)-Math.PI/2,.8);this.sparks(250,330,u,p.color,30,170);}
    if(p.id==='guard'){this.ward(f.origin.x,f.origin.y,115,p.color,.95);this.sprite('clock',f.origin.x,f.origin.y,265,265,-u*.3,.7);this.sprite('wings',f.origin.x,f.origin.y-30,320,240,0,.5);}
    if(p.id==='bells')for(const z of p.zones){const fall=1-this.ease(u*2.8);this.sprite('bell',z.x,z.y-190*fall,150,190,Math.sin(u*6)*.08,.95,'source-over');this.glow(z.x,z.y,100,p.color,.4);if(u>.27){const v=(u-.27)/.73;this.sprite('blast',z.x,z.y,200,145,u,.65);this.shock(z.x,z.y,v,p.color,1.4);this.sparks(z.x,z.y,v,p.color,22,110);}}
    if(p.id==='tentacles')for(let j=0;j<p.rows.length;j++){const y=p.rows[j],sweep=this.ease(u*2.8);for(let i=0;i<3;i++){const x=j?530-sweep*(180+i*135):-30+sweep*(180+i*135);this.sprite('tentacle',x,y,215,180,(j?-1:1)*Math.PI/2+Math.sin(u*4+i)*.17,.95,'source-over');this.glow(x,y,70,p.color,.2);}this.sparks(250,y,u,p.color,22,170,j);}
    if(p.id==='tide')for(const y of [90,520]){this.sprite('tide',250,y,640,210,Math.sin(u*2)*.2,.95);this.sprite('tide',250,y,480,170,-u*.4,.5);this.sparks(250,y,u,'#9fcbd1',28,200);}
    if(p.id==='eclipse'){this.sprite('eclipse',250,230,370,370,u*.1,1,'source-over');this.glow(250,230,220,p.color,.35);this.sprite('seal',p.safe.x,p.safe.y,p.safe.r*2,p.safe.r*2,-u*.12,.4);this.shock(250,230,u,p.color,3);for(let i=0;i<4;i++){const ang=i*1.57-u*.3;this.sprite('soul',250+Math.cos(ang)*155,230+Math.sin(ang)*145,110,140,ang,.45);}}
    ctx.restore();
  },
  drawOver(t,dt){
    if(game.tactical){
      if(game.shield>0)for(const h of game.heroes)this.ward(h.x,h.y,32,'#d5d4af',.38);
      for(const e of game.enemies){
        if(e.hp<=0)continue;
        if(e.armor>0)this.ward(e.x,e.y,e.r+14,'#b5cbd5',.48);
        const marked=AbyssKit.exposureAt(e,game.turn);
        if(marked)this.sprite('seal',e.x,e.y+e.r*.45,e.r*1.8,e.r*.8,t*.04,.3);
        const marks=[e.poison?'毒 '+e.poison.ticks:'',e.burn?'灼':'',marked?'星纹 +'+Math.round((marked.mult-1)*100)+'%':''].filter(Boolean).join(' · ');
        if(marks){ctx.save();ctx.font='10px serif';ctx.textAlign='center';ctx.fillStyle=e.poison?'#b0d98b':e.burn?'#efbc8c':'#d6d5a6';ctx.fillText(marks,e.x,e.y+e.r+30);ctx.restore();}
      }
    }
    for(const f of this.effects){
      f.age+=dt;if(f.age>=f.duration)continue;ctx.save();
      if(f.tag==='skill')this.drawSkill(f,t);
      else if(f.tag==='boss')this.drawBoss(f,t);
      else if(f.tag==='shield'){this.ward(f.x,f.y,40+f.age*40,'#e2d6aa',1-f.age/f.duration);this.sparks(f.x,f.y,f.age/f.duration,'#e9d6a6',14,65);}
      else if(f.tag==='tick'){const v=f.age/f.duration;this.sprite(f.kind==='poison'?'venom':'blast',f.x,f.y-20*v,80+v*40,90+v*40,0,this.envelope(v)*.6);}
      else if(f.tag==='phase'){const v=f.age/f.duration;this.sprite('eclipse',f.x,f.y,210+v*100,210+v*100,-v*.15,this.envelope(v)*.8);this.shock(f.x,f.y,v,'#d18fc6',2.5);}
      ctx.restore();
    }
    this.effects=this.effects.filter(f=>f.age<f.duration);
  }
};
AbilityFX.init();
