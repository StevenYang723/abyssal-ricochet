'use strict';
/* Spatial effects consume the same geometry as the simulation. No enemy selection here. */
const SpatialFX=window.SpatialFX={
  atlas:new Image(),textures:[],
  tiles:{prism:0,nova:1,fan:2,mirror:3,strings:4,gravity:5,thorns:6,relay:7,shard:8,molten:9,steam:10,bloom:11,prismRing:12,heatRing:13,roots:14,star:15},
  init(){
    this.atlas.onload=()=>{const w=this.atlas.naturalWidth/4,h=this.atlas.naturalHeight/4;
      this.textures=Array.from({length:16},(_,i)=>{const tile=document.createElement('canvas');tile.width=tile.height=320;const c=tile.getContext('2d');c.drawImage(this.atlas,i%4*w,Math.floor(i/4)*h,w,h,0,0,320,320);c.globalCompositeOperation='destination-in';const fade=c.createRadialGradient(160,160,116,160,160,160);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');c.fillStyle=fade;c.fillRect(0,0,320,320);return tile;});
    };this.atlas.src='assets/spatial-vfx-v6.png';
  },
  sprite(name,x,y,w,h=w,rotation=0,alpha=1,blend='screen'){
    const tex=this.textures[this.tiles[name]];if(!tex||alpha<=0||AbilityFX.drawBudget--<=0)return;
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.globalAlpha*=Math.min(1,alpha);ctx.globalCompositeOperation=blend;ctx.drawImage(tex,-w/2,-h/2,w,h);ctx.restore();
  },
  clip(){ctx.beginPath();ctx.rect(12,80,476,455);ctx.clip();},
  geometry(g,c,alpha=.12,outline=true){
    if(!g)return;ctx.save();this.clip();ctx.globalAlpha*=alpha;ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=1;
    const center=g.center||{x:250,y:300},radius=g.radius||80,segments=g.segments||[];
    if(['disk','well','relay'].includes(g.shape)){circle(center.x,center.y,radius,c,outline?c:undefined,1.2);}
    if(['frame','sector'].includes(g.shape)||(g.shape==='fan'&&g.points?.length>2)){ctx.beginPath();g.points.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();ctx.fill();if(outline)ctx.stroke();}
    if(['lines','fan','tether','trail'].includes(g.shape)&&!(g.shape==='fan'&&g.points?.length>2)){
      ctx.lineCap='round';
      for(const [a,b]of segments){line(a.x,a.y,b.x,b.y,c,(g.width||8)*2);if(outline){ctx.globalAlpha/=2;line(a.x,a.y,b.x,b.y,'#f5eacb',1);ctx.globalAlpha*=2;}}
    }
    if(g.shape==='cone'){const angle=g.angle||0,spread=g.spread||.65;ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.arc(center.x,center.y,radius,angle-spread,angle+spread);ctx.closePath();ctx.fill();if(outline)ctx.stroke();}
    if(g.shape==='buoys') for(const q of g.points) circle(q.x,q.y,12,c,outline?c:undefined,1);
    if(g.shape==='refuges'){
      ctx.beginPath();ctx.rect(12,80,476,455);
      for(const q of g.zones){ctx.moveTo(q.x+q.r,q.y);ctx.arc(q.x,q.y,q.r,0,2*Math.PI,true);}
      ctx.fill('evenodd');
      for(const q of g.zones) circle(q.x,q.y,q.r,null,'#c0f0c9',2);
    }
    if(g.shape==='annulus'){ctx.beginPath();ctx.arc(center.x,center.y,g.outer||radius,0,Math.PI*2);ctx.arc(center.x,center.y,g.innerRadius||radius*.5,0,Math.PI*2,true);ctx.fill('evenodd');if(outline)ctx.stroke();}
    if(g.shape==='circles')for(const q of g.zones||g.circles||[])circle(q.x,q.y,q.r||q.radius,c,outline?c:undefined,1);
    if(g.shape==='outside'){const q=g.safe||{...center,r:radius};ctx.beginPath();ctx.rect(12,80,476,455);ctx.arc(q.x,q.y,q.r,0,Math.PI*2,true);ctx.fill('evenodd');circle(q.x,q.y,q.r,null,'#d2ecc1',1.3);}
    ctx.restore();
  },
  preview(){
    if(!game.showSupportRanges||!game.supportPreview||game.mode!=='ready')return;
    const direction=typeof aim!=='undefined'&&aim?{x:aim.start.x-aim.end.x,y:aim.start.y-aim.end.y}:undefined;
    for(const h of game.heroes){
      if(h.id===game.active&&!window.Meta?.training)continue;
      const g=game.supportPreview(h,direction);if(!g)continue;
      this.geometry(g,h.color,.065,true);
      const center=g.center||h;
      ctx.save();this.clip();ctx.globalAlpha=.48;ctx.setLineDash([4,5]);
      if(g.radius&&['disk','well','relay'].includes(g.shape))circle(center.x,center.y,g.radius,null,h.color,1);
      ctx.restore();
    }
  },
  beam(a,b,c,width,p,texture='prism'){
    const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx),pulse=.7+Math.sin(p*9)*.12;
    ctx.save();this.clip();ctx.globalCompositeOperation='screen';ctx.translate(a.x,a.y);ctx.rotate(ang);
    const g=ctx.createLinearGradient(0,-width,0,width);g.addColorStop(0,c+'00');g.addColorStop(.28,c+'34');g.addColorStop(.46,c+'c0');g.addColorStop(.5,'#fff9e9');g.addColorStop(.54,c+'c0');g.addColorStop(.72,c+'34');g.addColorStop(1,c+'00');ctx.globalAlpha*=pulse;ctx.fillStyle=g;ctx.fillRect(0,-width,len,width*2);ctx.restore();
    for(let i=0,n=Math.min(4,Math.ceil(len/160));i<n;i++){const q=(i+.5)/n;this.sprite(texture,a.x+dx*q,a.y+dy*q,Math.min(230,len/n*1.7),width*4,ang,.68);}
    AbilityFX.glow(a.x,a.y,width*2.5,c,.45);
  },
  impact(targets,c,p){for(const q of targets||[]){this.sprite('star',q.x,q.y,55+35*p,55+35*p,p,.7);AbilityFX.sparks(q.x,q.y,p,c,8,42,q.x);}},
  silverShot(from,to,p){
    const dx=to.x-from.x,dy=to.y-from.y,distance=Math.hypot(dx,dy);
    if(distance<1) return;
    const ux=dx/distance,uy=dy/distance;
    const edgeX=ux>0?488:12,edgeY=uy>0?535:80;
    const length=Math.min(distance,ux?(edgeX-from.x)/ux:Infinity,uy?(edgeY-from.y)/uy:Infinity);
    if(length<1) return;
    const angle=Math.atan2(dy,dx),head=length*Math.min(1,p*2.3),tail=Math.max(0,head-62);
    ctx.save();
    ctx.translate(from.x,from.y);
    ctx.rotate(angle);
    ctx.globalCompositeOperation='screen';
    const wake=ctx.createLinearGradient(tail,0,Math.max(head,tail+.01),0);
    wake.addColorStop(0,'#72858d00');wake.addColorStop(.65,'#a7bcc57a');wake.addColorStop(1,'#fff0ce');
    line(0,1.4,head,1.4,'#bc8d5a80',1);
    line(0,0,head,0,'#cfe4eeae',1.6);
    line(tail,0,head,0,wake,4.4);
    if(p<.48) AbilityFX.sprite('rail',head,0,54,17,0,.95);
    if(p<.38){
      AbilityFX.sprite('blast',9,0,49,20,0,.8*(1-p/.38));
      AbilityFX.glow(0,0,26,'#dba46a',.75);
    }
    ctx.restore();
  },
  silverImpact(hit,p){
    ctx.save();
    ctx.translate(hit.x,hit.y);
    ctx.rotate(-.22);
    const radius=12+10*(1-AbilityFX.ease(p*2));
    for(let i=0;i<4;i++){
      ctx.rotate(Math.PI/2);
      ctx.beginPath();ctx.arc(0,0,radius,-.48,.48);ctx.strokeStyle='#d9ae76';ctx.lineWidth=1.8;ctx.stroke();
      line(radius-3,0,radius+4,0,'#eae5ce',1.4);
    }
    ctx.restore();
    AbilityFX.sparks(hit.x,hit.y,p,'#e4cf9e',7,31,hit.x);
  },
  crystalFlight(from,to,p,index){
    const dx=to.x-from.x,dy=to.y-from.y,angle=Math.atan2(dy,dx);
    ctx.save();
    ctx.translate(from.x,from.y);
    ctx.rotate(angle);
    const length=Math.hypot(dx,dy);
    for(let rank=0;rank<2;rank++){
      const fraction=(p*1.45+.07)-rank*.27-(index%2)*.045;
      if(fraction<0||fraction>1) continue;
      const head=length*fraction,body=rank?19:29;
      ctx.save();
      ctx.translate(head,0);
      this.sprite('shard',-body*.5,0,body*2.2,body,0,.68);
      // Two facets share a sharp silhouette even when the mobile canvas is scaled down.
      ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-body*.64,-5);ctx.lineTo(-body,0);ctx.closePath();
      ctx.fillStyle='#b8e3d9';ctx.fill();
      ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(-body,0);ctx.lineTo(-body*.48,5);ctx.closePath();
      ctx.fillStyle=index%2?'#668eaa':'#568f90';ctx.fill();
      line(-body*.64,-5,4,0,'#eef9e6',1.3);
      line(-body*1.85,0,-body,0,'#9fcac877',1.4);
      ctx.restore();
    }
    ctx.restore();
  },
  wake(g,p,c){
    for(const [from,to] of g.segments){
      const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
      ctx.save();ctx.translate(from.x,from.y);ctx.rotate(angle);
      for(const side of [-1,1]){
        ctx.beginPath();
        for(let x=0;x<=length;x+=12){
          const y=side*(g.width*.65+Math.sin(x*.055-p*7)*3);
          if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle=side>0?c:'#d8e3ce';ctx.lineWidth=side>0?2.4:1.3;ctx.stroke();
      }
      for(let x=(p*74)%74;x<length;x+=74) AbilityFX.sprite('tide',x,0,87,g.width*2.1,0,.65);
      ctx.restore();
    }
  },
  bellRing(g,p,c,warning){
    const o=g.center,r=warning?g.outer:g.innerRadius+(g.outer-g.innerRadius)*AbilityFX.ease(p);
    ctx.save();
    if(warning) ctx.setLineDash([5,6]);
    circle(o.x,o.y,r,null,c,warning?1.3:3.3);
    circle(o.x,o.y,Math.max(1,r-5),null,'#f5e6b8',1);
    if(!warning){
      for(let i=0;i<10;i++){
        const a=i*Math.PI/5;
        this.sprite('star',o.x+r*Math.cos(a),o.y+r*Math.sin(a),21,14,a,.74);
      }
      AbilityFX.sprite('bell',o.x,o.y,61,74,Math.sin(p*6)*.12,.8);
    }
    ctx.restore();
  },
  negative(g,p,warning){
    const pts=g.points;
    ctx.save();
    if(warning) ctx.setLineDash([7,4]);
    ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));
    ctx.closePath();ctx.fillStyle=warning?'#9e6d9f24':'#e6d6e854';ctx.fill();
    ctx.strokeStyle=warning?'#bba1bc':'#f2dae2';ctx.lineWidth=warning?1.8:3;ctx.stroke();
    for(const q of pts) this.sprite('shard',q.x,q.y,23,24,.78,.76);
    const [a,b,c,d]=pts;
    const u=warning?p:1-p;
    line(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,d.x+(c.x-d.x)*u,d.y+(c.y-d.y)*u,'#e4cadf',2);
    ctx.restore();
  },
  buoy(q,t){
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(reduced?0:Math.sin(t*3)*.1);
    AbilityFX.glow(0,-5,26,'#a7e0b5',.9);
    circle(0,3,10,'#8b483b','#ead5ae',1.4);line(-8,3,8,3,'#e6d0aa',3);
    line(0,-3,0,-12,'#d0b27d',2);circle(0,-12,3.5,'#d9f5c4','#8db697',1);
    ctx.restore();
  },
  activeFields(t){
    if(game.mode!=='moving')return;
    ctx.save();this.clip();
    for(const effect of game.spatial){
      if(effect.type==='buoys') for(const q of effect.points) this.buoy(q,t);
      if(effect.type!=='imprint'||effect.remaining===0) continue;
      const progress=reduced?.5:effect.elapsed/effect.period,color=AbyssKit.SKILLS[effect.key].color;
      this.geometry(effect.geometry,color,.08);
      if(effect.key==='ada') this.negative(effect.geometry,progress,true);
      else this.bellRing(effect.geometry,progress,color,true);
    }
    ctx.restore();
  },
  drawSkill(f,t){
    let g=f.geometry;
    if(!g) return false;
    if(f.warning && (f.key==='ada'||f.key==='oren')) return true;
    if(g.shape==='tether' && g.anchorIds){
      if(g.turn!==game.turn || game.mode!=='moving' || g.actorId!==game.active) return true;
      g=game.tetherGeometry(g.anchorIds,g.width);
    }
    const k=AbyssKit.SKILLS[f.key],c=k.color,o=g.center||f.origin,p=reduced?.55:Math.min(1,f.age/f.duration),a=AbilityFX.envelope(f.age/f.duration),r=g.radius||130,u=f.ultimate?1.35:1;
    ctx.save();this.clip();
    const activeString=g.shape==='tether' && game.spatial.some(effect=>effect.type==='tether' && effect.ultimate===!!f.ultimate && effect.remaining>0);
    ctx.globalAlpha*=activeString ? .9 : a;
    // The softly lit footprint uses the exact hit shape and stays below the material.
    if(k.motif!=='rail' && k.motif!=='fan') this.geometry(g,c,.08,false);
    switch(k.motif){
      case'wake':this.wake(g,p,c);this.impact(f.targets,c,p);break;
      case'chime':this.bellRing(g,p,c,f.warning);if(!f.warning)this.impact(f.targets,c,p);break;
      case'negative':this.negative(g,p,f.warning);if(!f.warning)this.impact(f.targets,c,p);break;
      case'buoy':{
        if(f.collected){
          AbilityFX.ward(o.x,o.y,21+31*p,c,.8);
          this.sprite('bloom',o.x,o.y,78,78,p*.16,.75);
        }else for(const q of g.points) AbilityFX.glow(q.x,q.y,37,c,.55);
        break;
      }
      case'rail':{
        for(const [from,to] of g.segments) this.silverShot(from,to,p);
        for(const hit of f.targets) this.silverImpact(hit,p);
        break;
      }
      case'cross':{
        for(const [from,to] of g.segments) this.beam(from,to,c,g.width,p);
        this.sprite('prismRing',o.x,o.y,110*u,110*u,p*.18,.95);
        AbilityFX.sprite('seal',o.x,o.y,69*u,69*u,-p*.24,.68);
        this.impact(f.targets,c,p);
        break;
      }
      case'mirror':{
        for(const [a,b] of g.segments){
          this.beam(a,b,c,g.width,p);
          this.sprite('mirror',a.x,a.y,75*u,100*u,Math.atan2(b.y-a.y,b.x-a.x),.85,'source-over');
          this.sprite('shard',b.x,b.y,65,65,p,.65);
        }
        this.sprite('star',o.x,o.y,140*u,140*u,p*.24,.9);this.impact(f.targets,c,p);break;
      }
      case'nova':{
        if(f.warning){this.sprite('molten',o.x,o.y,55,65,0,.8);this.sprite('heatRing',o.x,o.y,r*1.9,r*1.9,0,.42);break;}
        if(g.shape==='trail'){this.sprite('heatRing',o.x,o.y,100,100,p*.2,.7);break;}
        const size=r*2*(.45+.55*AbilityFX.ease(p*2));
        this.sprite('nova',o.x,o.y,size,size,p*.15,.95);
        this.sprite('heatRing',o.x,o.y,size*1.15,size*1.15,-p*.2,.8);
        AbilityFX.glow(o.x,o.y,r*.75,c,.7);AbilityFX.sparks(o.x,o.y,p,c,24,r*.85);
        for(const q of g.points||[])this.sprite('molten',q.x,q.y,65,65,p*.2,.8);break;
      }
      case'fan':{
        g.segments.forEach(([from,to],index)=>this.crystalFlight(from,to,p,index));
        this.sprite('bloom',o.x,o.y,60*u,60*u,-p*.3,.55);
        for(const hit of f.targets){
          this.sprite('shard',hit.x,hit.y,44,50,p*.55,.7);
          AbilityFX.sparks(hit.x,hit.y,p,'#a9dacc',6,28,hit.y);
        }
        break;
      }
      case'tether':{
        for(const [from,to]of g.segments||[]){const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
          for(let i=-1;i<=1;i++){AbilityFX.ribbon({x:from.x+nx*i*4,y:from.y+ny*i*4},{x:to.x+nx*i*4,y:to.y+ny*i*4},i?'#d6c28b':c,p,i?1.2:3,0);}
          this.sprite('strings',(from.x+to.x)/2,(from.y+to.y)/2,65,len*1.3,Math.atan2(dy,dx)-Math.PI/2,.85);
          for(const q of [from,to])this.sprite('bloom',q.x,q.y,65,65,p*.2,.6);
        }this.impact(f.targets,c,p);break;
      }
      case'gravity':{
        this.sprite('gravity',o.x,o.y,r*2.1,r*1.8,-p*.65,1,'source-over');
        AbilityFX.sprite('eclipse',o.x,o.y,r*.95,r*.95,p*.1,.7,'source-over');
        for(let i=0;i<(reduced?4:12);i++){const theta=i*2.399+p*2.4,rr=r*(1-(p+i*.071)%1);this.sprite('shard',o.x+Math.cos(theta)*rr,o.y+Math.sin(theta)*rr*.8,15,23,theta,.6);}
        break;
      }
      case'thorns':{
        const segments=g.segments||[],length=segments.reduce((n,[a,b])=>n+Math.hypot(b.x-a.x,b.y-a.y),0),step=Math.max(38,length/(reduced?18:36));let distance=step*.5;
        for(const [a,b]of segments){const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);while(distance<len){const q=distance/len;this.sprite('thorns',a.x+dx*q,a.y+dy*q,64,64,Math.atan2(dy,dx)-Math.PI/2,.8,'source-over');distance+=step;}distance-=len;}
        for(const q of f.targets||[])this.sprite('bloom',q.x,q.y,90,90,p*.3,.75);break;
      }
      case'relay':{
        this.sprite('relay',o.x,o.y,165*u,165*u,p*.25,.95);
        const nodes=g.points||f.targets||[];for(const q of nodes){this.beam(o,q,c,6,p,'strings');this.sprite('relay',q.x,q.y,90,90,-p*.2,.85);}
        AbilityFX.shock(o.x,o.y,p,c,r/100);break;
      }
      case'tide':{
        
        AbilityFX.sprite('tide',o.x,o.y,r*2.2,r*2.05,-p*.7,.95);AbilityFX.sprite('tide',o.x,o.y,r*1.65,r*1.5,p*.4,.55);
        AbilityFX.sparks(o.x,o.y,p,'#c7f3eb',20,r*.88);this.impact(f.targets,c,p);break;
      }
      case'poison':{
        for(let i=0;i<5;i++){const ang=i*1.257+p*.3;AbilityFX.sprite('venom',o.x+Math.cos(ang)*r*.4,o.y+Math.sin(ang)*r*.4,r*1.3,r*1.3,ang,.48);}
        AbilityFX.sprite('seal',o.x,o.y,r*1.7,r*1.15,-p*.1,.35);break;
      }
      case'blade':{
        if(g.points?.length>2){const edge=g.points[Math.floor(g.points.length/2)],angle=Math.atan2(edge.y-o.y,edge.x-o.x);AbilityFX.sprite('blade',o.x+Math.cos(angle)*r*.55,o.y+Math.sin(angle)*r*.55,r*1.9,r*1.7,angle+Math.PI/2,.95);}
        if(g.segments&&!g.points)for(const [a,b]of g.segments)this.beam(a,b,c,g.width||12,p,'shard');
        if(g.shape==='cone')AbilityFX.sprite('blade',o.x+Math.cos(g.angle)*r*.5,o.y+Math.sin(g.angle)*r*.5,r*1.6,r*1.6,g.angle+Math.PI/2,.95);
        this.impact(f.targets,c,p);break;
      }
      default:ctx.restore();return false;
    }
    ctx.restore();return true;
  },
  plan(p,alpha){
    if(!p.geometry)return false;
    this.geometry(p.geometry,p.color,alpha,true);
    const g=p.geometry;
    if(g.shape==='refuges') for(const q of g.zones){
      AbilityFX.ward(q.x,q.y,q.r,'#a8dbab',.55);
      ctx.save();ctx.font='11px serif';ctx.fillStyle='#d8ead1';ctx.textAlign='center';ctx.fillText('避潮灯',q.x,q.y+4);ctx.restore();
    }
    if(g.shape==='outside'){const q=g.safe||p.safe||{...g.center,r:g.radius};ctx.save();ctx.fillStyle='#dcebc0';ctx.font='11px serif';ctx.textAlign='center';ctx.fillText('安全区',q.x,q.y+4);ctx.restore();}
    if(g.shape==='buoys') for(const q of g.points) circle(q.x,q.y,12,c,outline?c:undefined,1);
    if(g.shape==='refuges'){
      ctx.beginPath();ctx.rect(12,80,476,455);
      for(const q of g.zones){ctx.moveTo(q.x+q.r,q.y);ctx.arc(q.x,q.y,q.r,0,2*Math.PI,true);}
      ctx.fill('evenodd');
      for(const q of g.zones) circle(q.x,q.y,q.r,null,'#c0f0c9',2);
    }
    if(g.shape==='annulus'){ctx.save();ctx.fillStyle='#e9d8bd';ctx.font='10px serif';ctx.textAlign='center';ctx.fillText('内圈 / 外圈安全',g.center.x,g.center.y+4);ctx.restore();}
    return true;
  },
  drawBoss(f,t){
    const g=f.plan.geometry;if(!g)return false;const p=f.plan,c=p.color,age=reduced?.55:f.age/f.duration,o=g.center||f.origin;
    ctx.save();this.clip();ctx.globalAlpha*=AbilityFX.envelope(f.age/f.duration);this.geometry(g,c,.12,false);
    if(p.id==='whaleWake'){
      this.wake(g,age,c);
    }else if(p.id==='whaleJaws'||p.id==='priorShards'){
      for(const q of g.zones){
        const bone=p.id==='whaleJaws',r=q.r;
        for(let i=0;i<(bone?5:3);i++){
          const angle=i*2.4,offset=r*.44;
          const x=q.x+Math.cos(angle)*offset,y=q.y+Math.sin(angle)*offset;
          this.sprite(bone?'shard':'molten',x,y-(1-AbilityFX.ease(age*3))*64,bone?17:33,bone?57:45,angle,.95);
        }
        AbilityFX.shock(q.x,q.y,age,c,r/90);
      }
    }else if(p.id==='whaleRefuge'){
      for(const q of g.zones){
        this.buoy(q,t);AbilityFX.ward(q.x,q.y,q.r,c,.95);
        AbilityFX.sprite('tide',q.x,q.y,q.r*2.5,q.r*2.5,-age*.3,.55);
      }
    }else if(p.id==='priorSwing'){
      const angle=g.angle+(reduced?0:(age*2-1)*g.spread);
      const tip={x:o.x+Math.cos(angle)*390,y:o.y+Math.sin(angle)*390};
      AbilityFX.ribbon(o,tip,c,age,5);
      AbilityFX.sprite('bell',tip.x,tip.y,86,100,angle-Math.PI/2,.95);
    }else if(p.id==='priorEcho'){
      this.bellRing(g,age,c,false);
    }else if(p.id==='prismCross'||p.id==='prismRay'){
      for(const [a,b]of g.segments||[])this.beam(a,b,c,g.width||22,age,'prism');
      this.sprite('mirror',f.origin.x,f.origin.y,180,220,-age*.1,.95,'source-over');
      this.sprite('prismRing',f.origin.x,f.origin.y,260,260,age*.3,.7);
    }else if(p.id==='prismArmor'){
      for(let i=0;i<5;i++){const angle=i*Math.PI*.4+age*.3;this.sprite('mirror',f.origin.x+Math.cos(angle)*78,f.origin.y+Math.sin(angle)*68,75,110,angle,.8,'source-over');}AbilityFX.ward(f.origin.x,f.origin.y,105,c,.85);
    }else if(p.id==='forgeRing'){
      const radius=g.outer||g.radius||180;this.sprite('heatRing',o.x,o.y,radius*2.1,radius*2.1,-age*.25,.95);
      for(let i=0;i<12;i++){const a=i*Math.PI/6+age*.2,rr=((g.innerRadius||0)+radius)/2;this.sprite('molten',o.x+Math.cos(a)*rr,o.y+Math.sin(a)*rr,80,100,a,.65);}
    }else if(p.id==='forgeFalls'){
      for(const q of g.zones||g.circles||[]){const fall=1-AbilityFX.ease(age*2.8);this.sprite('molten',q.x-90*fall,q.y-200*fall,140,180,-.3,.95);if(age>.25){this.sprite('nova',q.x,q.y,q.r*2.6,q.r*2.6,age,.85);AbilityFX.shock(q.x,q.y,Math.min(1,(age-.25)/.75),c,1.1);}}
    }else if(p.id==='forgeSteam'){
      for(const [a,b]of g.segments||[])for(let i=0;i<5;i++){const u=i/4;this.sprite('steam',a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,110,170,0,.75);}
    }else if(p.id==='gardenRoots'){
      for(const [a,b]of g.segments||[]){const n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/75);for(let i=0;i<=n;i++){const u=i/n;this.sprite('roots',a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,130,130,Math.atan2(b.y-a.y,b.x-a.x),.95,'source-over');}}
    }else if(p.id==='gardenPoison'){
      for(const q of g.zones||g.circles||[]){AbilityFX.sprite('venom',q.x,q.y,q.r*2.6,q.r*2.6,age*.3,.7);this.sprite('bloom',q.x,q.y,q.r*1.5,q.r*1.5,-age*.2,.9);}
    }else if(p.id==='gardenSanctum'){
      const safe=g.safe||p.safe||{...g.center,r:g.radius};
      for(let i=0;i<12;i++){const angle=i*Math.PI/6,rr=safe.r+42;this.sprite('thorns',safe.x+Math.cos(angle)*rr,safe.y+Math.sin(angle)*rr,120,120,angle,.85,'source-over');}
      this.sprite('bloom',safe.x,safe.y,safe.r*1.5,safe.r*1.5,age*.15,.6);AbilityFX.ward(safe.x,safe.y,safe.r,'#e5edbd',.65);
    }else{ctx.restore();return false;}
    this.impact(f.targets,c,age);ctx.restore();return true;
  }
};
SpatialFX.init();
