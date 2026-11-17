(function(root){
  'use strict';
  const SKILLS={
    evelyn:{support:'星纹封缄',ultimate:'禁书·七星连锁',form:'星书的见证者',role:'印记 / 增伤',color:'#9bd1b0',motif:'constellation',text:'追击最虚弱的敌人并施加 2 回合星纹：受到伤害增加 25%。',ultText:'对全体进行三段星击，施加 3 回合星纹；本次弹射伤害提升。'},
    noah:{support:'银线狙击',ultimate:'终幕·交叉火线',form:'最后的守望者',role:'直线 / 穿透',color:'#8ac8ef',motif:'rail',text:'瞄准最强敌人发射银线，贯穿同一直线上的所有目标。',ultText:'从战场两侧进行三轮交叉射击，打击全体敌人。'},
    lucia:{support:'归途灯火',ultimate:'不灭·灯塔圣域',form:'长夜的引灯人',role:'治疗 / 净化',color:'#f2c568',motif:'lantern',text:'恢复 500×成长倍率生命、5 理智，获得 220×倍率护盾并清除中毒。',ultText:'恢复 1,000×倍率生命，建立 900×倍率护盾，净化所有危险地形与中毒。'},
    silas:{support:'灵魂汲取',ultimate:'彼岸·亡灵回响',form:'彼岸的渡魂者',role:'吸血 / 续航',color:'#b392da',motif:'drain',text:'汲取最强敌人生命，并将实际伤害的 70% 转为治疗。',ultText:'链接全体敌人汲取生命，实际伤害的 60% 转为治疗，并恢复 12 理智。'},
    aster:{support:'坠星预告',ultimate:'天穹·陨星雨',form:'群星的导航者',role:'延迟 / 范围',color:'#9ab9ff',motif:'meteor',text:'在最强敌人处标记陨星，下次弹射结束时对范围内造成高伤害。',ultText:'在存活敌人处落下陨星，对各落点范围内的敌人造成伤害。'},
    rook:{support:'追猎弹跳',ultimate:'狩夜·爆裂装填',form:'深红猎手',role:'跳弹 / 反弹爆破',color:'#e79a65',motif:'ricochet',text:'猎矢依次弹跳最多三个敌人，后续命中伤害依次降低。',ultText:'本次弹射强化至 3 倍；前 6 次撞墙或障碍时发射爆裂猎矢追击最近敌人。'},
    seraph:{support:'白羽守誓',ultimate:'赦令·圣翼庇护',form:'白羽的裁决者',role:'护盾 / 控制',color:'#e8e2b6',motif:'feather',text:'获得 480×倍率护盾，清除一个危险区域与中毒。',ultText:'获得 850×倍率护盾，恢复 15 理智，并将所有敌人的行动倒计时延长 2。'},
    corvus:{support:'疫瓶破裂',ultimate:'黑羽·腐蚀蔓延',form:'翡翠疫使',role:'毒伤 / 破甲',color:'#92c96e',motif:'poison',text:'毒瓶命中全体，并施加 3 次持续毒伤；毒伤无视首领护甲。',ultText:'强化疫雾笼罩全场，立即腐蚀并附加 4 次高额毒伤，无视护甲。'},
    nyra:{support:'回旋潮汐',ultimate:'深海·月引洪流',form:'万海的继承者',role:'水波 / 清场',color:'#6ed6d0',motif:'tide',text:'以最近敌人为中心扩散水波，伤害附近敌人，并使受击敌人行动延后 1。',ultText:'洪流冲击全体，清除危险地形、中毒，并将敌人行动延后 1。'},
    orion:{support:'裂星剑弧',ultimate:'誓剑·星骸冲锋',form:'破晓星骑',role:'破甲 / 冲锋',color:'#c4bcf4',motif:'blade',text:'剑弧斩向最强敌人，无视护甲造成伤害。',ultText:'获得 650×倍率护盾，本次切换贯通、伤害提升至 3 倍；首次命中追加破甲剑弧。'},
    mira:{support:'加速指针',ultimate:'时隙·第十三刻',form:'停摆时刻',role:'加速 / 延时',color:'#e4b76f',motif:'clock',text:'使当前弹射加速 18%，补充 18 秘术能量，并延后最强敌人行动 1。',ultText:'所有敌人行动延后 2；本次弹射加速 25%、减速阻力降低。'},
    ren:{support:'双月斩',ultimate:'封魔·绯刃无明',form:'赤月封魔者',role:'连斩 / 灼烧',color:'#ef8890',motif:'slash',text:'对最近敌人进行两段斩击，附加 2 次灼烧。',ultText:'本次切换贯通、伤害提升至 2.8 倍；每次碰撞追加火焰斩，最多 8 次。'}
  };
  const BOSSES={
    watcher:{name:'凝视者',phase:'瞳孔裂开 · 凝视范围扩大',moves:[{id:'gaze',name:'断魂凝视',hint:'避开锁定的直线光束',shape:'lane',color:'#b2df81'},{id:'spores',name:'孢子孵化',hint:'离开圆形孢子区；可用净化驱散毒池',shape:'circles',color:'#85bf67'},{id:'fear',name:'无声尖啸',hint:'损失理智；灯火和汲取可帮助恢复',shape:'fear',color:'#b894df'}]},
    warden:{name:'圣堂守门人',phase:'钟楼崩裂 · 刑钟与十字扩张',moves:[{id:'cross',name:'十字钟鸣',hint:'停在十字光带外侧',shape:'cross',color:'#d8ba77'},{id:'guard',name:'圣堂铁壁',hint:'获得护甲；破甲剑技和毒伤可穿透',shape:'guard',color:'#a5c9db'},{id:'bells',name:'坠落刑钟',hint:'离开落点；残留碎石会减慢弹射',shape:'circles',color:'#d8b083'}]},
    cthulhu:{name:'克苏鲁',phase:'旧日苏醒 · 触腕与黑潮扩张',moves:[{id:'tentacles',name:'深海触腕',hint:'避开两条横向扫击带',shape:'rows',color:'#a586cf'},{id:'tide',name:'吞岸黑潮',hint:'远离战场边缘；净化可消除残留黑潮',shape:'edge',color:'#5cbfc0'},{id:'eclipse',name:'梦境蚀月',hint:'将调查员停入明亮的安全圆内',shape:'outside',color:'#bba1dc'}]}
  };
  const pos=o=>({x:o.x,y:o.y,r:o.r||0});
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy);}
  function inPlan(h,p){if(p.shape==='lane'||p.shape==='cross')return p.lines.some(l=>segmentDistance(h,l[0],l[1])<(p.width||30)+h.r);if(p.shape==='circles')return p.zones.some(z=>distance(h,z)<z.r+h.r);if(p.shape==='rows')return p.rows.some(y=>Math.abs(h.y-y)<p.width+h.r);if(p.shape==='edge')return h.x<34+p.width||h.x>466-p.width||h.y<102+p.width||h.y>513-p.width;if(p.shape==='outside')return distance(h,p.safe)>p.safe.r-h.r;return false;}
  const methods={
    initTactics(){this.shield=0;this.partyPoison=null;this.delayed=[];this.hazards=[];this.shotKit=null;},
    prepareTactics(){this.delayed=[];this.hazards=[];this.partyPoison=null;this.shotKit=null;for(const e of this.enemies){e.phase=1;e.moveIndex=0;e.armor=0;if(e.bossKind)this.planBoss(e);}},
    kit(hero=this.current){return SKILLS[hero.key||hero.art]||SKILLS.evelyn;},
    skillFx(hero,ultimate,targets=[],extra={}){this.emit('skillFx',{key:hero.key||hero.art,ultimate,origin:pos(hero),targets:targets.map(pos),...extra});},
    healing(n,hero=this.current){const amount=Math.min(this.maxHp-this.hp,Math.round(n));this.hp+=amount;if(amount>0)this.emit('heal',{...pos(hero),amount});return amount;},
    protect(n,hero=this.current){this.shield=Math.min(Math.round(this.maxHp*.5),this.shield+Math.round(n));this.emit('ward',{amount:this.shield,hero:hero.id});},
    hurtParty(n){const amount=Math.max(0,Math.round(n)),absorbed=Math.min(this.shield||0,amount);this.shield-=absorbed;const actual=Math.min(this.hp,amount-absorbed);this.hp-=actual;if(absorbed)this.emit('shieldBlock',{amount:absorbed,x:this.current.x,y:this.current.y});return actual;},
    cleanse(all=true){if(all)this.hazards=[];else this.hazards.shift();this.partyPoison=null;},
    delayEnemy(e,n){e.counter=Math.min(e.counter+n,e.cooldown+3);},
    tacticalSupport(hero){
      const alive=this.enemies.filter(e=>e.hp>0);if(!alive.length)return;
      const scale=hero.supportScale||1,key=hero.key||hero.art,weak=[...alive].sort((a,b)=>a.hp-b.hp)[0],strong=[...alive].sort((a,b)=>b.hp-a.hp)[0],near=[...alive].sort((a,b)=>distance(a,hero)-distance(b,hero));
      let targets=[];const hit=(e,n,kind='support')=>this.damage(e,n*scale,kind);
      switch(key){
        case'evelyn':targets=[weak];weak.expose={until:this.turn+2,mult:1.25};hit(weak,155);break;
        case'noah':{const dx=strong.x-hero.x,dy=strong.y-hero.y,len=Math.hypot(dx,dy)||1,end={x:hero.x+dx/len*900,y:hero.y+dy/len*900};targets=alive.filter(e=>segmentDistance(e,hero,end)<e.r+23);targets.forEach(e=>hit(e,210));this.skillFx(hero,false,targets,{end});return;}
        case'lucia':targets=this.heroes;this.healing(500*scale,hero);this.sanity=Math.min(100,this.sanity+5);this.protect(220*scale,hero);this.partyPoison=null;break;
        case'silas':targets=[strong];this.healing(hit(strong,250,'drain')*.7,hero);break;
        case'aster':targets=[strong];this.delayed.push({x:strong.x,y:strong.y,r:105,due:this.turn+1,power:480*scale,key,hero:hero.id});this.skillFx(hero,false,targets,{warning:true});return;
        case'rook':{let from=hero,remaining=[...alive];for(let i=0;i<3&&remaining.length;i++){remaining.sort((a,b)=>distance(a,from)-distance(b,from));const e=remaining.shift();targets.push(e);hit(e,160*Math.pow(.78,i));from=e;}break;}
        case'seraph':targets=this.heroes;this.protect(480*scale,hero);this.cleanse(false);break;
        case'corvus':targets=alive;for(const e of alive){hit(e,45);e.poison={ticks:3,power:55*scale};}break;
        case'nyra':targets=alive.filter(e=>distance(e,near[0])<145+e.r);for(const e of targets){hit(e,180);this.delayEnemy(e,1);}break;
        case'orion':targets=[strong];hit(strong,265,'pierce');break;
        case'mira':targets=[strong];this.current.vx*=1.18;this.current.vy*=1.18;this.energy=Math.min(100,this.energy+18);this.delayEnemy(strong,1);break;
        case'ren':targets=[near[0]];hit(near[0],95);hit(near[0],95);near[0].burn={ticks:2,power:35*scale};break;
      }
      this.skillFx(hero,false,targets);
    },
    tacticalUltimate(){const h=this.current,key=h.key||h.art,s=h.supportScale||1,alive=this.enemies.filter(e=>e.hp>0);this.shotKit={key,mult:2.2,wallLeft:0,followLeft:0,pierce:false,drag:.55};
      switch(key){
        case'evelyn':for(const e of alive){e.expose={until:this.turn+3,mult:1.4};for(let i=0;i<3;i++)this.damage(e,95*s,'ritual');}break;
        case'noah':for(let i=0;i<3;i++)for(const e of alive)this.damage(e,130*s,'ritual');break;
        case'lucia':this.healing(1000*s);this.protect(900*s);this.cleanse();this.sanity=Math.min(100,this.sanity+12);break;
        case'silas':{let drained=0;for(const e of alive)drained+=this.damage(e,330*s,'drain');this.healing(drained*.6);this.sanity=Math.min(100,this.sanity+12);break;}
        case'aster':for(const target of alive){for(const e of alive)if(e.hp>0&&distance(e,target)<100+e.r)this.damage(e,360*s,'meteor');}break;
        case'rook':this.shotKit.mult=3;this.shotKit.wallLeft=6;break;
        case'seraph':this.protect(850*s);this.sanity=Math.min(100,this.sanity+15);alive.forEach(e=>this.delayEnemy(e,2));break;
        case'corvus':for(const e of alive){this.damage(e,180*s,'poison');e.poison={ticks:4,power:110*s};}break;
        case'nyra':for(const e of alive){this.damage(e,340*s,'tide');this.delayEnemy(e,1);}this.cleanse();break;
        case'orion':this.shotKit.mult=3;this.shotKit.pierce=true;this.shotKit.followLeft=1;this.protect(650*s);break;
        case'mira':this.shotKit.drag=.3;this.current.vx*=1.25;this.current.vy*=1.25;alive.forEach(e=>this.delayEnemy(e,2));break;
        case'ren':this.shotKit.mult=2.8;this.shotKit.pierce=true;this.shotKit.followLeft=8;break;
      }
      this.skillFx(h,true,['lucia','seraph'].includes(key)?this.heroes:alive);
    },
    wallSkill(p){if(!this.tactical||!this.powered||!this.shotKit?.wallLeft)return;const target=this.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(!target)return;this.shotKit.wallLeft--;this.damage(target,105*this.current.supportScale,'blast');this.skillFx(this.current,false,[target],{origin:pos(p),burst:true});},
    contactSkill(enemy){const k=this.shotKit;if(!this.tactical||!this.powered||!k?.followLeft)return;k.followLeft--;if(k.key==='orion'){const targets=this.enemies.filter(e=>e.hp>0&&distance(e,enemy)<135+e.r);for(const e of targets)this.damage(e,220*this.current.supportScale,'pierce');this.skillFx(this.current,true,targets,{follow:true});}else if(k.key==='ren'){this.damage(enemy,85*this.current.supportScale,'burn');this.skillFx(this.current,false,[enemy],{follow:true});}},
    resolveTurnEffects(){let damage=0;for(const e of this.enemies){for(const kind of ['poison','burn']){const status=e[kind];if(e.hp>0&&status?.ticks>0){this.damage(e,status.power,kind);status.ticks--;this.emit('statusTick',{kind,...pos(e)});}if(status?.ticks===0)e[kind]=null;}}
      for(const strike of this.delayed.filter(d=>d.due<=this.turn)){const targets=this.enemies.filter(e=>e.hp>0&&distance(e,strike)<strike.r+e.r);targets.forEach(e=>this.damage(e,strike.power,'meteor'));this.skillFx(this.heroes[strike.hero],false,targets,{impact:pos(strike),fall:true});}this.delayed=this.delayed.filter(d=>d.due>this.turn);
      if(this.partyPoison?.ticks>0){damage+=this.hurtParty(this.partyPoison.power);this.partyPoison.ticks--;this.emit('partyPoison',{amount:this.partyPoison.power});if(!this.partyPoison.ticks)this.partyPoison=null;}
      for(const hazard of this.hazards){const count=this.heroes.filter(h=>inPlan(h,hazard)).length;if(count)damage+=this.hurtParty(count*hazard.power);hazard.ticks--;}
      this.hazards=this.hazards.filter(h=>h.ticks>0);return damage;
    },
    planBoss(e){const book=BOSSES[e.bossKind];if(!book)return;const move=book.moves[e.moveIndex%book.moves.length],phase=e.phase||1,w=phase===2?42:28;const p={...move,phase,width:w,boss:e.id};
      if(p.shape==='lane'){const target=this.heroes[(this.active+1)%4],dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy)||1;p.lines=[[pos(e),{x:e.x+dx/len*1000,y:e.y+dy/len*1000}]];}
      if(p.shape==='cross')p.lines=[[{x:250,y:85},{x:250,y:535}],[{x:15,y:330},{x:485,y:330}]];
      if(p.shape==='circles')p.zones=[this.heroes[(this.active+1)%4],this.heroes[(this.active+3)%4]].map(h=>({...pos(h),r:phase===2?72:53}));
      if(p.shape==='rows'){p.rows=[265,435];p.width=phase===2?42:28;}
      if(p.shape==='edge')p.width=phase===2?62:43;
      if(p.shape==='outside')p.safe={x:250,y:405,r:phase===2?95:122};
      e.plan=p;this.emit('bossTelegraph',{plan:p,counter:e.counter});
    },
    executeBoss(e){const p=e.plan,book=BOSSES[e.bossKind];if(!p)return 0;const hit=this.heroes.filter(h=>inPlan(h,p)),scale=e.phase===2?1.25:1;let damage=0;
      if(p.id==='guard'){e.armor=Math.round(e.maxHp*.24);}
      else if(p.id==='fear'){this.sanity=Math.max(0,this.sanity-(e.phase===2?16:12));}
      else{damage=this.hurtParty(hit.length?e.damage*(.5+hit.length*.45)*scale:0);if(p.id==='spores'&&hit.length)this.partyPoison={ticks:2,power:Math.round(e.damage*.18)};if(p.id==='eclipse'&&hit.length)this.sanity=Math.max(0,this.sanity-8);if(['spores','bells','tide'].includes(p.id))this.hazards.push({...JSON.parse(JSON.stringify(p)),ticks:2,power:Math.round(e.damage*.15)});}
      this.emit('bossCast',{plan:JSON.parse(JSON.stringify(p)),origin:pos(e),targets:hit.map(pos),damage,blocked:this.shield>0,name:book.name});e.moveIndex++;e.counter=e.cooldown;this.planBoss(e);return damage;
    },
    checkBossPhase(e){if(!e.bossKind||e.phase===2||e.hp<=0||e.hp>e.maxHp*.5)return;e.phase=2;e.counter=Math.min(e.counter,1);this.planBoss(e);this.emit('bossPhase',{boss:e.id,name:BOSSES[e.bossKind].phase,...pos(e)});}
  };
  const api={SKILLS,BOSSES,methods,segmentDistance,inPlan};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AbyssKit=api;
})(typeof window!=='undefined'?window:globalThis);
