(function(root){
  'use strict';
  const SKILLS={
    evelyn:{support:'星纹封缄',ultimate:'禁书·七星连锁',form:'星书的见证者',role:'印记 / 增伤',color:'#9bd1b0',motif:'constellation',text:'追击最虚弱的敌人并施加 2 回合星纹：受到伤害增加 25%。',ultText:'对全体进行三段星击，施加 3 回合的 40% 增伤星纹。强星纹优先，到期后仍有效的普通星纹继续生效。本次弹射伤害提升。'},
    noah:{support:'银线狙击',ultimate:'终幕·交叉火线',form:'最后的守望者',role:'直线 / 穿透',color:'#8ac8ef',motif:'rail',text:'沿撞触者的前进方向射出一枚银弹，贯穿射线内的敌人；可通过弹射角度瞄准。',ultText:'从战场两侧进行三轮交叉射击，打击全体敌人。'},
    lucia:{support:'归途灯火',ultimate:'不灭·灯塔圣域',form:'长夜的引灯人',role:'治疗 / 净化',color:'#f2c568',motif:'lantern',text:'恢复 500×成长倍率生命、5 理智，获得 220×倍率护盾并清除中毒。',ultText:'恢复 1,000×倍率生命，建立 900×倍率护盾，净化所有危险地形与中毒。'},
    silas:{support:'灵魂汲取',ultimate:'彼岸·亡灵回响',form:'彼岸的渡魂者',role:'吸血 / 续航',color:'#b392da',motif:'drain',text:'汲取最强敌人生命，并将实际伤害的 70% 转为治疗。',ultText:'链接全体敌人汲取生命，实际伤害的 60% 转为治疗，并恢复 12 理智。'},
    aster:{support:'坠星预告',ultimate:'天穹·陨星雨',form:'群星的导航者',role:'延迟 / 范围',color:'#9ab9ff',motif:'meteor',text:'在最强敌人处标记陨星，下次弹射结束时对范围内造成高伤害。',ultText:'在存活敌人处落下陨星，对各落点范围内的敌人造成伤害。'},
    rook:{support:'追猎弹跳',ultimate:'狩夜·爆裂装填',form:'深红猎手',role:'跳弹 / 反弹爆破',color:'#e79a65',motif:'ricochet',text:'猎矢依次弹跳最多三个敌人，后续命中伤害依次降低。',ultText:'本次弹射强化至 3 倍；前 6 次撞墙或障碍时发射爆裂猎矢追击最近敌人。'},
    seraph:{support:'白羽守誓',ultimate:'赦令·圣翼庇护',form:'白羽的裁决者',role:'护盾 / 控制',color:'#e8e2b6',motif:'feather',text:'获得 480×倍率护盾，清除一个危险区域与中毒。',ultText:'获得 850×倍率护盾，恢复 15 理智，并将所有敌人的行动倒计时延长 2。'},
    corvus:{support:'疫瓶破裂',ultimate:'黑羽·腐蚀蔓延',form:'翡翠疫使',role:'毒域 / 破甲',color:'#92c96e',motif:'poison',text:'自身周围半径 175 的疫雾腐蚀敌人，施加 3 次无视护甲的毒伤。',ultText:'强化疫雾笼罩全场，立即腐蚀并附加 4 次高额毒伤，无视护甲。每回合结算一次，强毒先结算，余下的弱毒随后生效。'},
    nyra:{support:'回旋潮汐',ultimate:'深海·月引洪流',form:'万海的继承者',role:'环波 / 延时',color:'#6ed6d0',motif:'tide',text:'以自身为中心掀起半径 160 的圆形潮波，伤害范围内敌人并将行动延后 1。',ultText:'洪流冲击全体，清除危险地形、中毒，并将敌人行动延后 1。'},
    orion:{support:'裂星剑弧',ultimate:'誓剑·星骸冲锋',form:'破晓星骑',role:'扇斩 / 破甲',color:'#c4bcf4',motif:'blade',text:'沿撞触者的前进方向挥出半径 220 的前向扇形剑弧，无视护甲。',ultText:'获得 650×倍率护盾，本次切换贯通、伤害提升至 3 倍；首次命中追加破甲剑弧。'},
    mira:{support:'加速指针',ultimate:'时隙·第十三刻',form:'停摆时刻',role:'加速 / 延时',color:'#e4b76f',motif:'clock',text:'使当前弹射加速 18%，补充 18 秘术能量，并延后最强敌人行动 1。',ultText:'所有敌人行动延后 2；本次弹射加速 25%、减速阻力降低。'},
    ren:{support:'双月斩',ultimate:'封魔·绯刃无明',form:'赤月封魔者',role:'连斩 / 灼烧',color:'#ef8890',motif:'slash',text:'对最近敌人进行两段斩击，附加 2 次灼烧。',ultText:'本次切换贯通、伤害提升至 2.8 倍；每次碰撞追加火焰斩，最多 8 次。'},
    vesper:{support:'星棺十字',ultimate:'晚祷·八芒裁决',form:'无星夜的审判者',role:'十字 / 光束',color:'#bdb1f0',motif:'cross',text:'从自身向上下左右放出十字激光，贯穿光带内的全部敌人。',ultText:'十字与斜十字同时展开，八方向的宽光束造成高额伤害。'},
    bram:{support:'炉心震爆',ultimate:'余烬·移动雷阵',form:'熔星的铸钟人',role:'环爆 / 布雷',color:'#eea46d',motif:'nova',text:'自身周围半径 140 发生环形爆破；靠近敌群再触发效果更强。',ultText:'本次沿弹射路径埋下最多 10 枚熔星雷，短暂蓄能后各自引爆半径 82 的区域。'},
    iris:{support:'虹膜散射',ultimate:'万华·虹雨星轮',form:'虹膜彼端的占星师',role:'扇幕 / 角度',color:'#b4dce7',motif:'fan',text:'沿撞触者前进方向扇形射出五枚晶矢。同一敌人即使被多条弹道穿过，也只受一次伤害。',ultText:'从自身向十二个方向发射晶矢，形成覆盖整圈的虹雨星轮。'},
    galen:{support:'镜廊折光',ultimate:'无尽·双镜回廊',form:'镜渊的巡礼者',role:'折射 / 反弹',color:'#82c9d5',motif:'mirror',text:'沿撞触方向发射一束激光，在战场边界最多折射三次，可绕过空隙命中敌人。',ultText:'两束反向镜光各折射四次，形成贯穿战场的镜廊。'},
    lyra:{support:'幽弦合奏',ultimate:'安魂·四重奏',form:'彼岸的奏鸣者',role:'连线 / 持续',color:'#e3afd6',motif:'tether',text:'弦线连接莉拉与行动队友，最多脉冲 12 次。莉拉自己弹射时，可与触发接力的塞布尔连线。每次脉冲伤害线上的敌人。',ultText:'行动角色与其余三位队友相连，三条弦线持续脉冲，重叠命中不重复计伤。'},
    morrow:{support:'微型坍缩',ultimate:'终夜·寂静奇点',form:'终夜的观测者',role:'引力 / 聚怪',color:'#9ca3df',motif:'gravity',text:'在自身周围半径 155 生成引力井，六次脉冲伤害并牵引小怪；首领不会被移动。',ultText:'半径 215 的奇点持续九次脉冲，聚拢小怪并延后范围内敌人的行动。'},
    thalia:{support:'荆棘随行',ultimate:'荒园·血蔷薇径',form:'黑山的花冠祭司',role:'路径 / 陷阱',color:'#b7c18b',motif:'thorns',text:'本次弹射经过的路径长出荆棘，沿轨迹周期性伤害，每个敌人最多受击 6 次。',ultText:'本次转为贯通，留下更宽的血蔷薇轨迹，每个敌人最多受击 8 次。'},
    sable:{support:'无面传令',ultimate:'秘宴·群星应答',form:'千面之夜的司仪',role:'接力 / 援护',color:'#dec48e',motif:'relay',text:'唤起自身半径 150 内队友的援护；同一角色每次弹射仅触发一次，接力不会循环。',ultText:'立即唤起另外三位队友的援护，可组合光束、引力井、弦线与荆棘。'}
  };
  Object.assign(SKILLS,{
    maren:{support:'双舷破浪',ultimate:'海图·纵贯四潮',form:'雾海提督',role:'双轨 / 侧击',color:'#88cdc5',motif:'wake',text:'沿触发者前进方向，在左右各 60 距离送出一道潮线。两道潮线之间留有空隙。',ultText:'沿弹射轴线向前后展开四条平行潮道。穿过多条潮道的敌人只受一次伤害。'},
    oren:{support:'空心钟鸣',ultimate:'悼歌·三声晚钟',form:'最后的报钟人',role:'音环 / 间距',color:'#dcb879',motif:'chime',text:'敲响空心音环，伤害距自身 78 至 166 范围的敌人。贴身的敌人可避开。',ultText:'从起手处由近及远依次敲响三道音环。找准距离，大型敌人可以被相邻音环分别命中。'},
    ada:{support:'滞光底片',ultimate:'暗房·双重曝光',form:'镜后的见证者',role:'定点 / 延时',color:'#cba9ce',motif:'negative',text:'沿来球方向在前方留下底片框。半秒后显影，只伤害显影时仍在框内的敌人。',ultText:'沿弹射方向留下近、远两张底片，依次显影。两框交叠处可以受到两次伤害。'},
    siv:{support:'航道浮灯',ultimate:'返航·三盏引渡灯',form:'长夜的引渡人',role:'拾取 / 救援',color:'#acd7b9',motif:'buoy',text:'在前方航道放下浮灯。本次弹射碰到它时恢复 420×倍率生命，并获得 180×倍率护盾。',ultText:'沿弹射方向依次投下三盏浮灯。每拾取一盏恢复 360×倍率生命，获得 220×倍率护盾，并解除队伍中毒。'}
  });
  const BOSSES={
    watcher:{name:'凝视者',phase:'瞳孔裂开 · 凝视范围扩大',moves:[{id:'gaze',name:'断魂凝视',hint:'避开锁定的直线光束',shape:'lane',color:'#b2df81'},{id:'spores',name:'孢子孵化',hint:'离开圆形孢子区；可用净化驱散毒池',shape:'circles',color:'#85bf67'},{id:'fear',name:'无声尖啸',hint:'损失理智；灯火和汲取可帮助恢复',shape:'fear',color:'#b894df'}]},
    warden:{name:'圣堂守门人',phase:'钟楼崩裂 · 刑钟与十字扩张',moves:[{id:'cross',name:'十字钟鸣',hint:'停在十字光带外侧',shape:'cross',color:'#d8ba77'},{id:'guard',name:'圣堂铁壁',hint:'获得护甲；破甲剑技和毒伤可穿透',shape:'guard',color:'#a5c9db'},{id:'bells',name:'坠落刑钟',hint:'离开落点；残留碎石会减慢弹射',shape:'circles',color:'#d8b083'}]},
    cthulhu:{name:'克苏鲁',phase:'旧日苏醒 · 触腕与黑潮扩张',moves:[{id:'tentacles',name:'深海触腕',hint:'避开两条横向扫击带',shape:'rows',color:'#a586cf'},{id:'tide',name:'吞岸黑潮',hint:'远离战场边缘；净化可消除残留黑潮',shape:'edge',color:'#5cbfc0'},{id:'eclipse',name:'梦境蚀月',hint:'将调查员停入明亮的安全圆内',shape:'outside',color:'#bba1dc'}]},
    prism:{name:'镜渊织母',phase:'万镜开眼 · 折光带扩张',moves:[{id:'prismCross',name:'菱镜斜十字',hint:'离开两条对角光带，中央十字间隙可躲避',shape:'lines',color:'#a7c7ed'},{id:'prismRay',name:'镜廊巡光',hint:'沿墙折射的光束将落下，避开全部反射线段',shape:'lines',color:'#a3e1df'},{id:'prismArmor',name:'千面镜甲',hint:'镜面护甲展开；破甲与毒伤可穿透',shape:'guard',color:'#b5b4eb'}]},
    forge:{name:'熔星监工',phase:'熔炉失控 · 热浪与蒸汽扩张',moves:[{id:'forgeRing',name:'熔炉环震',hint:'站在内圈或最外侧，躲开发亮的环形热浪',shape:'annulus',color:'#f1af71'},{id:'forgeFalls',name:'熔星坠铸',hint:'离开标记落点；熔火会残留两回合',shape:'circles',color:'#e99266'},{id:'forgeSteam',name:'高压蒸汽',hint:'避开两条竖向蒸汽带，中央通道安全',shape:'lines',color:'#e5c89d'}]},
    garden:{name:'黑山母树',phase:'万根苏生 · 荆棘侵蚀',moves:[{id:'gardenRoots',name:'荆根缚途',hint:'避开从母树伸出的三条荆根线',shape:'lines',color:'#c4b887'},{id:'gardenPoison',name:'腐花毒域',hint:'离开两片腐花圆域；净化可驱散残毒',shape:'circles',color:'#9fc67b'},{id:'gardenSanctum',name:'黑山祷告',hint:'进入明亮的安全圆，圆外将被荆潮吞没',shape:'outside',color:'#caacd2'}]}
  };
  BOSSES.whale={name:'拾骨鲸',phase:'鲸骨开潮 · 潮沟变宽，避潮灯范围收窄',moves:[
    {id:'whaleWake',name:'双舷鲸汐',hint:'两道斜潮从上方掠过，在中间航道或两翼停留。',shape:'lines',color:'#7dc3b6'},
    {id:'whaleJaws',name:'浮骨鲸落',hint:'三片搁浅的鲸骨落在标记圆内，并留下两回合碎骨。',shape:'circles',color:'#ddd1ae'},
    {id:'whaleRefuge',name:'深水鲸歌',hint:'让调查员停进任意一座避潮灯的绿色圆内。',shape:'refuges',color:'#8ebda9'}
  ]};
  BOSSES.prior={name:'盲钟司祭',phase:'裂钟复鸣 · 扫击扇面张开，回声环变宽',moves:[
    {id:'priorSwing',name:'钟舌摆斩',hint:'钟摆会锁定扇面。弹到侧面，或绕到司祭身后。',shape:'sector',color:'#d9ad78'},
    {id:'priorEcho',name:'失声回廊',hint:'避开回声环，可以贴近钟心或退到外圈。',shape:'annulus',color:'#d5ba86'},
    {id:'priorShards',name:'裂钟雨',hint:'碎钟锁定两名队友的位置。每有一人在落点内，队伍额外失去 8 点秘术能量。',shape:'circles',color:'#c9a2a8'}
  ]};
  const pos=o=>({x:o.x,y:o.y,r:o.r||0});
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy);}
  const point=o=>({x:o.x,y:o.y});
  const ARENA={left:12,right:488,top:80,bottom:535};
  function heading(vector){const length=Math.hypot(vector?.vx??vector?.x??0,vector?.vy??vector?.y??0);return length>.001?{x:(vector.vx??vector.x)/length,y:(vector.vy??vector.y)/length}:{x:0,y:-1};}
  function ray(origin,dir,length){return [point(origin),{x:origin.x+dir.x*length,y:origin.y+dir.y*length}];}
  function radial(origin,count,length,angle=0){return Array.from({length:count},(_,i)=>ray(origin,{x:Math.cos(angle+i*Math.PI*2/count),y:Math.sin(angle+i*Math.PI*2/count)},length));}
  function reflectedRay(origin,direction,length=1300,bounces=3,bounds=ARENA){
    let p={x:Math.max(bounds.left,Math.min(bounds.right,origin.x)),y:Math.max(bounds.top,Math.min(bounds.bottom,origin.y))},d=heading(direction),left=length;const segments=[];
    for(let i=0;i<=bounces&&left>.01;i++){
      let tx=d.x>1e-8?(bounds.right-p.x)/d.x:d.x< -1e-8?(bounds.left-p.x)/d.x:Infinity;
      let ty=d.y>1e-8?(bounds.bottom-p.y)/d.y:d.y< -1e-8?(bounds.top-p.y)/d.y:Infinity;
      // Reflect immediately when a cast begins on a boundary, without consuming a bounce.
      if(tx<1e-7){d.x*=-1;tx=d.x>0?(bounds.right-p.x)/d.x:(bounds.left-p.x)/d.x;}
      if(ty<1e-7){d.y*=-1;ty=d.y>0?(bounds.bottom-p.y)/d.y:(bounds.top-p.y)/d.y;}
      const step=Math.min(left,tx,ty),end={x:p.x+d.x*step,y:p.y+d.y*step};segments.push([point(p),end]);left-=step;
      if(left<.01)break;
      if(Math.abs(step-tx)<1e-6)d.x*=-1;if(Math.abs(step-ty)<1e-6)d.y*=-1;p=end;
    }
    return segments;
  }
  function polygonHit(body,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];if(segmentDistance(body,a,b)<= (body.r||0))return true;
    if((a.y>body.y)!==(b.y>body.y)&&body.x<(b.x-a.x)*(body.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
  }return inside;}
  function inGeometry(body,g){if(!g)return false;const r=body.r||0;
    if(g.shape==='frame'||g.shape==='sector') return polygonHit(body,g.points);
    if(g.shape==='refuges') return !g.zones.some(zone=>distance(body,zone)+r<=zone.r);
    if(['disk','well','relay'].includes(g.shape))return distance(body,g.center)<=g.radius+r;
    if(g.shape==='annulus'){const d=distance(body,g.center);return d+r>=g.innerRadius&&d-r<=g.radius;}
    if(g.shape==='outside')return distance(body,g.center)+r>g.radius;
    if(g.shape==='circles')return g.zones.some(z=>distance(body,z)<z.r+r);
    if(g.shape==='fan'&&g.points?.length>=3)return polygonHit(body,g.points);
    return (g.segments||[]).some(l=>segmentDistance(body,l[0],l[1])<= (g.width||0)+r);
  }
  function oriented(origin,d,forward,side){
    return {x:origin.x+d.x*forward-d.y*side,y:origin.y+d.y*forward+d.x*side};
  }
  function wakeGeometry(hero,d,ultimate=false){
    const offsets=ultimate?[-108,-42,42,108]:[-60,60];
    return {shape:'lines',center:point(hero),width:ultimate?21:15,
      segments:offsets.map(side=>[oriented(hero,d,ultimate?-700:0,side),oriented(hero,d,700,side)])};
  }
  function filmGeometry(hero,d,range,length,width){
    const center=oriented(hero,d,range,0);
    return {shape:'frame',center,points:[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>oriented(center,d,x*length/2,y*width/2))};
  }
  function buoys(hero,d,distances){
    const radius=hero.r||22;
    const bounds={left:ARENA.left+radius,right:ARENA.right-radius,top:ARENA.top+radius,bottom:ARENA.bottom-radius};
    return {shape:'buoys',center:point(hero),points:distances.map(distance=>reflectedRay(hero,d,distance,4,bounds).at(-1)[1])};
  }
  function soundRing(hero,inner,outer){return {shape:'annulus',center:point(hero),innerRadius:inner,outer,radius:outer};}
  function supportGeometry(hero,vector,heroes=[],actor=vector){const key=hero.key||hero.art,center=point(hero),d=heading(vector),angle=Math.atan2(d.y,d.x);
    if(key==='maren') return wakeGeometry(hero,d);
    if(key==='oren') return soundRing(hero,78,166);
    if(key==='ada') return filmGeometry(hero,d,130,150,110);
    if(key==='siv') return buoys(hero,d,[108]);
    if(key==='vesper')return {shape:'lines',center,width:17,segments:[[{x:ARENA.left,y:hero.y},{x:ARENA.right,y:hero.y}],[{x:hero.x,y:ARENA.top},{x:hero.x,y:ARENA.bottom}]]};
    if(['bram','nyra','corvus','morrow','sable'].includes(key))return {shape:key==='morrow'?'well':key==='sable'?'relay':'disk',center,radius:{bram:140,nyra:160,corvus:175,morrow:155,sable:150}[key],points:key==='sable'?heroes.filter(h=>h.id!==hero.id&&distance(h,hero)<=150).map(point):[]};
    if(key==='noah')return {shape:'lines',center,width:20,segments:[ray(hero,d,850)]};
    if(key==='iris')return {shape:'fan',center,width:11,segments:[-.52,-.26,0,.26,.52].map(a=>ray(hero,{x:Math.cos(angle+a),y:Math.sin(angle+a)},365))};
    if(key==='galen')return {shape:'lines',center,width:14,segments:reflectedRay(hero,d)};
    if(key==='orion'){const points=[center];for(let i=0;i<=16;i++){const a=angle-.8+i*1.6/16;points.push({x:hero.x+Math.cos(a)*220,y:hero.y+Math.sin(a)*220});}return {shape:'fan',center,radius:220,width:0,points,segments:points.slice(1,-1).map((p,i)=>[p,points[i+2]])};}
    if(key==='lyra')return {shape:'tether',center,width:13,segments:actor?[ [center,point(actor)] ]:[]};
    if(key==='thalia')return {shape:'trail',center,width:28,points:actor?[point(actor)]:[],segments:[]};
    return null;
  }
  function inPlan(h,p){if(p.shape==='refuges'||p.shape==='sector')return inGeometry(h,p.geometry);if(['lane','cross','lines'].includes(p.shape))return p.lines.some(l=>segmentDistance(h,l[0],l[1])<(p.width||30)+(h.r||0));if(p.shape==='annulus')return inGeometry(h,p.geometry);if(p.shape==='circles')return p.zones.some(z=>distance(h,z)<z.r+(h.r||0));if(p.shape==='rows')return p.rows.some(y=>Math.abs(h.y-y)<p.width+(h.r||0));if(p.shape==='edge')return h.x<34+p.width||h.x>466-p.width||h.y<102+p.width||h.y>513-p.width;if(p.shape==='outside')return distance(h,p.safe)>p.safe.r-(h.r||0);return false;}
  function exposureAt(enemy,turn){
    let mark=enemy.expose;
    while(mark && mark.until<turn) mark=mark.next;
    return mark;
  }
  function markEnemy(enemy,turn,mult,until){
    const current=exposureAt(enemy,turn);
    const incoming={mult,until};
    if(!current || mult>current.mult){
      if(current && current.until>until) incoming.next=current;
      enemy.expose=incoming;
    }else if(mult===current.mult){
      current.until=Math.max(current.until,until);
      enemy.expose=current;
    }else if(until>current.until){
      current.next={mult,until:Math.max(current.next?.until||0,until)};
    }
  }
  // One tick per turn. Equal potency refreshes, weaker doses wait their turn.
  function addDose(current,power,ticks){
    if(!current) return {power,ticks};
    if(power>current.power) return {power,ticks,next:current};
    if(power===current.power) current.ticks=Math.max(current.ticks,ticks);
    else current.next=addDose(current.next,power,ticks);
    return current;
  }
  const methods={
    tetherGeometry(anchors,width){
      const actor=this.current;
      return {shape:'tether',center:point(actor),actorId:actor.id,anchorIds:anchors,
        turn:this.turn,width,segments:anchors.map(id=>[point(this.heroes[id]),point(actor)])};
    },
    initTactics(){this.shield=0;this.partyPoison=null;this.delayed=[];this.hazards=[];this.shotKit=null;this.spatial=[];},
    prepareTactics(){this.delayed=[];this.hazards=[];this.partyPoison=null;this.shotKit=null;this.spatial=[];for(const e of this.enemies){e.phase=1;e.moveIndex=0;e.armor=0;if(e.bossKind)this.planBoss(e);}},
    beginShotTactics(){this.spatial=[];},
    supportPreview(hero,direction=this.current){return supportGeometry(hero,direction,this.heroes,this.current);},
    hitGeometry(geometry,power,kind='support'){const targets=this.enemies.filter(e=>e.hp>0&&inGeometry(e,geometry));for(const e of targets)this.damage(e,power,kind);return targets;},
    addSpatial(hero,type,options={}){const effect={owner:hero.id,key:hero.key||hero.art,type,scale:hero.supportScale||1,elapsed:0,remaining:12,period:.24,power:65,ultimate:false,hits:{},...options};this.spatial.push(effect);return effect;},
    kit(hero=this.current){return SKILLS[hero.key||hero.art]||SKILLS.evelyn;},
    skillFx(hero,ultimate,targets=[],extra={}){this.emit('skillFx',{key:hero.key||hero.art,ultimate,origin:pos(hero),targets:targets.map(pos),...extra});},
    healing(n,hero=this.current){const amount=Math.min(this.maxHp-this.hp,Math.round(n));this.hp+=amount;if(amount>0)this.emit('heal',{...pos(hero),amount});return amount;},
    protect(n,hero=this.current){this.shield=Math.min(Math.round(this.maxHp*.5),this.shield+Math.round(n));this.emit('ward',{amount:this.shield,hero:hero.id});},
    hurtParty(n){const amount=Math.max(0,Math.round(n)),absorbed=Math.min(this.shield||0,amount);this.shield-=absorbed;const actual=Math.min(this.hp,amount-absorbed);this.hp-=actual;if(absorbed)this.emit('shieldBlock',{amount:absorbed,x:this.current.x,y:this.current.y});return actual;},
    cleanse(all=true){if(all)this.hazards=[];else this.hazards.shift();this.partyPoison=null;},
    delayEnemy(e,n){e.counter=Math.min(e.counter+n,e.cooldown+3);},
    tacticalSupport(hero,relaySource){
      const alive=this.enemies.filter(e=>e.hp>0);if(!alive.length)return;
      const scale=hero.supportScale||1,key=hero.key||hero.art,weak=[...alive].sort((a,b)=>a.hp-b.hp)[0],strong=[...alive].sort((a,b)=>b.hp-a.hp)[0],near=[...alive].sort((a,b)=>distance(a,hero)-distance(b,hero));
      let targets=[],geometry=this.supportPreview(hero);const hit=(e,n,kind='support')=>this.damage(e,n*scale,kind);
      switch(key){
        case'maren':targets=this.hitGeometry(geometry,260*scale);break;
        case'oren':targets=this.hitGeometry(geometry,295*scale);break;
        case'ada':this.queueImprint(hero,geometry,.5,355,false);return;
        case'siv':this.placeBuoys(hero,geometry,false);return;
        case'evelyn':targets=[weak];markEnemy(weak,this.turn,1.25,this.turn+2);hit(weak,155);break;
        case'noah':targets=this.hitGeometry(geometry,230*scale);break;
        case'lucia':targets=this.heroes;this.healing(500*scale,hero);this.sanity=Math.min(100,this.sanity+5);this.protect(220*scale,hero);this.partyPoison=null;break;
        case'silas':targets=[strong];this.healing(hit(strong,250,'drain')*.7,hero);break;
        case'aster':targets=[strong];this.delayed.push({x:strong.x,y:strong.y,r:105,due:this.turn+1,power:480*scale,key,hero:hero.id});this.skillFx(hero,false,targets,{warning:true});return;
        case'rook':{let from=hero,remaining=[...alive];for(let i=0;i<3&&remaining.length;i++){remaining.sort((a,b)=>distance(a,from)-distance(b,from));const e=remaining.shift();targets.push(e);hit(e,160*Math.pow(.78,i));from=e;}break;}
        case'seraph':targets=this.heroes;this.protect(480*scale,hero);this.cleanse(false);break;
        case'corvus':targets=this.hitGeometry(geometry,65*scale);for(const e of targets)e.poison=addDose(e.poison,65*scale,3);break;
        case'nyra':targets=this.hitGeometry(geometry,240*scale);for(const e of targets)this.delayEnemy(e,1);break;
        case'orion':targets=this.hitGeometry(geometry,300*scale,'pierce');break;
        case'mira':targets=[strong];this.current.vx*=1.18;this.current.vy*=1.18;this.energy=Math.min(100,this.energy+18);this.delayEnemy(strong,1);break;
        case'ren':targets=[near[0]];hit(near[0],95);hit(near[0],95);near[0].burn=addDose(near[0].burn,35*scale,2);break;
        case'vesper':targets=this.hitGeometry(geometry,250*scale);break;
        case'bram':targets=this.hitGeometry(geometry,310*scale,'blast');break;
        case'iris':targets=this.hitGeometry(geometry,235*scale);break;
        case'galen':targets=this.hitGeometry(geometry,285*scale);break;
        case'lyra':{
          const anchor=hero.id===this.active ? relaySource : hero;
          const anchors=anchor && anchor.id!==this.active ? [anchor.id] : [];
          geometry=this.tetherGeometry(anchors,13);
          if(anchors.length) this.addSpatial(hero,'tether',{anchors,width:13,power:66,remaining:12});
          break;
        }
        case'morrow':this.addSpatial(hero,'well',{center:point(hero),radius:155,power:82,remaining:6,period:.26});break;
        case'thalia':this.addSpatial(hero,'trail',{points:[point(this.current)],width:28,power:74,remaining:14,cap:6});break;
        case'sable':{
          const allies=this.heroes.filter(h=>h.id!==hero.id&&distance(h,hero)<=150&&!this.friends.has(h.id));
          this.skillFx(hero,false,allies,{geometry:{...geometry,points:allies.map(point)}});
          for(const ally of allies)this.support(ally,hero);return;
        }
      }
      const duration=key==='noah' ? .48 : key==='iris' ? .7 : undefined;
      this.skillFx(hero,false,targets,geometry?{geometry,duration}:{});
    },
    tacticalUltimate(){const h=this.current,key=h.key||h.art,s=h.supportScale||1,alive=this.enemies.filter(e=>e.hp>0);this.shotKit={key,mult:2.2,wallLeft:0,followLeft:0,pierce:false,drag:.55};
      switch(key){
        case'maren':{
          const g=wakeGeometry(h,heading(h),true);
          this.skillFx(h,true,this.hitGeometry(g,565*s),{geometry:g});return;
        }
        case'oren':{
          for(const [index,inner] of [35,112,189].entries()){
            this.queueImprint(h,soundRing(h,inner,inner+79),.15+index*.32,330,true);
          }
          return;
        }
        case'ada':{
          const d=heading(h);
          this.queueImprint(h,filmGeometry(h,d,95,184,180),.35,395,true);
          this.queueImprint(h,filmGeometry(h,d,215,204,128),.78,465,true);
          return;
        }
        case'siv':this.placeBuoys(h,buoys(h,heading(h),[82,170,268]),true);return;
        case'evelyn':for(const e of alive){markEnemy(e,this.turn,1.4,this.turn+3);for(let i=0;i<3;i++)this.damage(e,95*s,'ritual');}break;
        case'noah':{
          const salvo=this.addSpatial(h,'volley',{remaining:2,period:.3,power:130,ultimate:true});
          this.fireVolley(salvo);
          return;
        }
        case'lucia':this.healing(1000*s);this.protect(900*s);this.cleanse();this.sanity=Math.min(100,this.sanity+12);break;
        case'silas':{let drained=0;for(const e of alive)drained+=this.damage(e,330*s,'drain');this.healing(drained*.6);this.sanity=Math.min(100,this.sanity+12);break;}
        case'aster':for(const target of alive){for(const e of alive)if(e.hp>0&&distance(e,target)<100+e.r)this.damage(e,360*s,'meteor');}break;
        case'rook':this.shotKit.mult=3;this.shotKit.wallLeft=6;break;
        case'seraph':this.protect(850*s);this.sanity=Math.min(100,this.sanity+15);alive.forEach(e=>this.delayEnemy(e,2));break;
        case'corvus':for(const e of alive){this.damage(e,180*s,'poison');e.poison=addDose(e.poison,110*s,4);}break;
        case'nyra':for(const e of alive){this.damage(e,340*s,'tide');this.delayEnemy(e,1);}this.cleanse();break;
        case'orion':this.shotKit.mult=3;this.shotKit.pierce=true;this.shotKit.followLeft=1;this.protect(650*s);break;
        case'mira':this.shotKit.drag=.3;this.current.vx*=1.25;this.current.vy*=1.25;alive.forEach(e=>this.delayEnemy(e,2));break;
        case'ren':this.shotKit.mult=2.8;this.shotKit.pierce=true;this.shotKit.followLeft=8;break;
        case'vesper':{const geometry={shape:'lines',center:point(h),width:27,segments:radial(h,8,720)};this.skillFx(h,true,this.hitGeometry(geometry,550*s),{geometry});return;}
        case'bram':{this.shotKit.mult=2.7;this.addSpatial(h,'mines',{remaining:10,travel:0,mines:[],power:220,ultimate:true,radius:82});this.skillFx(h,true,[],{geometry:{shape:'trail',center:point(h),points:[point(h)],segments:[],width:18}});return;}
        case'iris':{const geometry={shape:'fan',center:point(h),width:17,segments:radial(h,12,650,Math.atan2(h.vy,h.vx))};this.skillFx(h,true,this.hitGeometry(geometry,470*s),{geometry,duration:.9});return;}
        case'galen':{const d=heading(h),geometry={shape:'lines',center:point(h),width:23,segments:[...reflectedRay(h,d,1800,4),...reflectedRay(h,{x:-d.x,y:-d.y},1800,4)]};this.skillFx(h,true,this.hitGeometry(geometry,535*s),{geometry});return;}
        case'lyra':{const anchors=this.heroes.filter(a=>a.id!==h.id).map(a=>a.id);this.addSpatial(h,'tether',{anchors,width:19,power:100,remaining:16,ultimate:true});this.skillFx(h,true,[],{geometry:this.tetherGeometry(anchors,19)});return;}
        case'morrow':{const geometry={shape:'well',center:point(h),radius:215};for(const e of alive.filter(e=>inGeometry(e,geometry)))this.delayEnemy(e,1);this.addSpatial(h,'well',{center:point(h),radius:215,power:125,remaining:9,period:.25,ultimate:true});this.skillFx(h,true,[],{geometry});return;}
        case'thalia':{this.shotKit.pierce=true;this.shotKit.drag=.42;this.addSpatial(h,'trail',{points:[point(h)],width:35,power:112,remaining:16,cap:8,ultimate:true});this.skillFx(h,true,[],{geometry:{shape:'trail',center:point(h),width:35,points:[point(h)],segments:[]}});return;}
        case'sable':{this.friends.add(h.id);const allies=this.heroes.filter(a=>a.id!==h.id);this.skillFx(h,true,allies,{geometry:{shape:'relay',center:point(h),radius:650,points:allies.map(point),segments:allies.map(a=>[point(h),point(a)]),width:4}});for(const ally of allies)this.support(ally,h);return;}
      }
      if(['rook','orion','ren'].includes(key)){
        this.skillFx(h,true,[],{phase:'prepare',actorId:h.id,turn:this.turn,angle:Math.atan2(h.vy,h.vx),duration:.68});
        return;
      }
      this.skillFx(h,true,['lucia','seraph'].includes(key)?this.heroes:alive);
    },
    queueImprint(hero,geometry,delay,power,ultimate){
      this.addSpatial(hero,'imprint',{geometry,power,period:delay,remaining:1,ultimate});
      this.skillFx(hero,ultimate,[],{geometry,warning:true,duration:delay,tick:false});
    },
    develop(effect){
      const targets=this.hitGeometry(effect.geometry,effect.power*effect.scale);
      this.skillFx(this.heroes[effect.owner],effect.ultimate,targets,{geometry:effect.geometry,tick:true,duration:.57});
    },
    placeBuoys(hero,geometry,ultimate){
      this.addSpatial(hero,'buoys',{points:geometry.points.map(point),ultimate});
      this.skillFx(hero,ultimate,[],{geometry,duration:.5});
    },
    collectBuoys(effect,previous,actor){
      effect.points=effect.points.filter(buoy=>{
        if(segmentDistance(buoy,previous,actor)>actor.r+12) return true;
        this.healing((effect.ultimate?360:420)*effect.scale,actor);
        this.protect((effect.ultimate?220:180)*effect.scale,actor);
        if(effect.ultimate) this.partyPoison=null;
        this.skillFx(this.heroes[effect.owner],effect.ultimate,[],{tick:true,collected:true,geometry:{shape:'buoys',center:point(buoy),points:[buoy]},duration:.6});
        return false;
      });
    },
    fireVolley(salvo){
      const targets=this.enemies.filter(e=>e.hp>0);
      if(!targets.length) return;
      for(const enemy of targets) this.damage(enemy,salvo.power*salvo.scale,'ritual');
      this.skillFx(this.heroes[salvo.owner],true,targets,{round:2-salvo.remaining,duration:.34});
    },
    advanceSpatial(dt,previous=point(this.current)){
      if(!this.tactical||!this.spatial.length)return;const actor=this.current;
      for(const effect of this.spatial){const hero=this.heroes[effect.owner];if(!hero)continue;
        if(effect.type==='buoys'){this.collectBuoys(effect,previous,actor);continue;}
        if(effect.type==='mines'){
          effect.travel+=distance(previous,actor);
          if(effect.remaining>0&&effect.travel>=76){effect.travel%=76;effect.remaining--;const mine={...point(actor),age:0};effect.mines.push(mine);this.skillFx(hero,true,[],{tick:true,warning:true,geometry:{shape:'disk',center:point(mine),radius:effect.radius}});}
          for(const mine of effect.mines){mine.age+=dt;if(mine.age>=.52&&!mine.done){mine.done=true;const geometry={shape:'disk',center:point(mine),radius:effect.radius};this.skillFx(hero,true,this.hitGeometry(geometry,effect.power*effect.scale,'blast'),{tick:true,geometry});}}
          effect.mines=effect.mines.filter(m=>!m.done);continue;
        }
        if(effect.remaining<=0)continue;
        if(effect.type==='trail'){
          const last=effect.points[effect.points.length-1];if(distance(last,actor)>8&&effect.points.length<260)effect.points.push(point(actor));
        }
        effect.elapsed+=dt;if(effect.elapsed<effect.period)continue;effect.elapsed%=effect.period;effect.remaining--;
        if(effect.type==='imprint'){this.develop(effect);continue;}
        if(effect.type==='volley'){this.fireVolley(effect);continue;}
        let geometry,targets;
        if(effect.type==='tether')geometry=this.tetherGeometry(effect.anchors,effect.width);
        if(effect.type==='well')geometry={shape:'well',center:point(effect.center),radius:effect.radius};
        if(effect.type==='trail')geometry={shape:'trail',center:point(hero),width:effect.width,points:effect.points.map(point),segments:effect.points.slice(1).map((p,i)=>[point(effect.points[i]),point(p)])};
        if(!geometry)continue;
        targets=this.enemies.filter(e=>e.hp>0&&inGeometry(e,geometry)&&(!effect.cap||(effect.hits[e.id]||0)<effect.cap));
        // Test the visible geometry before applying pull; bosses stay fixed in the arena.
        for(const enemy of targets){this.damage(enemy,effect.power*effect.scale,effect.type==='trail'?'pierce':'support');effect.hits[enemy.id]=(effect.hits[enemy.id]||0)+1;
          if(effect.type==='well'&&!enemy.bossKind&&enemy.hp>0){const d=distance(enemy,effect.center),step=Math.min(effect.ultimate?23:17,Math.max(0,d-24));if(d>0){enemy.x+=(effect.center.x-enemy.x)/d*step;enemy.y+=(effect.center.y-enemy.y)/d*step;}}
        }
        this.skillFx(hero,effect.ultimate,targets,{tick:true,geometry,duration:effect.period+.08});
      }
    },
    finishSpatial(){
      for(const effect of this.spatial) if(effect.type==='imprint' && effect.remaining>0) this.develop(effect);
      for(const salvo of this.spatial.filter(effect=>effect.type==='volley')){
        while(salvo.remaining>0){salvo.remaining--;this.fireVolley(salvo);}
      }
      // Mines remaining at the end of a short shot still detonate at their recorded positions.
      for(const effect of this.spatial){if(effect.type!=='mines')continue;const hero=this.heroes[effect.owner];for(const mine of effect.mines){const geometry={shape:'disk',center:point(mine),radius:effect.radius};this.skillFx(hero,true,this.hitGeometry(geometry,effect.power*effect.scale,'blast'),{tick:true,geometry});}}
      this.spatial=[];
    },
    wallSkill(p){if(!this.tactical||!this.powered||!this.shotKit?.wallLeft)return;const target=this.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(a,p)-distance(b,p))[0];if(!target)return;this.shotKit.wallLeft--;this.damage(target,105*this.current.supportScale,'blast');this.skillFx(this.current,false,[target],{origin:pos(p),burst:true,duration:.55});},
    contactSkill(enemy){
      const kit=this.shotKit;
      if(!this.tactical||!this.powered||!kit?.followLeft) return;
      if(kit.key==='ren' && enemy.hp<=0) return;
      kit.followLeft--;
      const impact={phase:'contact',follow:true,origin:pos(enemy),angle:Math.atan2(this.current.vy,this.current.vx),duration:.5};
      if(kit.key==='orion'){
        const geometry={shape:'disk',center:point(enemy),radius:135};
        const targets=this.hitGeometry(geometry,220*this.current.supportScale,'pierce');
        this.skillFx(this.current,false,targets,{...impact,geometry});
      }else if(kit.key==='ren'){
        this.damage(enemy,85*this.current.supportScale,'burn');
        this.skillFx(this.current,false,[enemy],impact);
      }
    },
    resolveTurnEffects(){let damage=0;for(const e of this.enemies){for(const kind of ['poison','burn']){const status=e[kind];if(e.hp>0&&status?.ticks>0){this.damage(e,status.power,kind);status.ticks--;this.emit('statusTick',{kind,...pos(e)});}if(status?.ticks===0)e[kind]=status.next||null;}}
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
      if(p.id==='whaleWake'){
        p.width=phase===2?41:29;
        p.lines=[[-10,178],[237,425]].map(([top,bottom])=>[{x:top,y:80},{x:bottom,y:535}]);
      }
      if(p.id==='whaleJaws') p.zones=[[132,299],[337,245],[324,437]].map(([x,y])=>({x,y,r:phase===2?76:58}));
      if(p.id==='whaleRefuge') p.geometry={shape:'refuges',zones:[{x:130,y:340},{x:368,y:405}].map(q=>({...q,r:phase===2?76:94}))};
      if(p.id==='priorSwing'){
        const target=this.current,angle=Math.atan2(target.y-e.y,target.x-e.x),spread=phase===2?.64:.43;
        const points=[point(e)];
        for(let i=0;i<=20;i++) points.push({x:e.x+Math.cos(angle-spread+2*spread*i/20)*520,y:e.y+Math.sin(angle-spread+2*spread*i/20)*520});
        p.geometry={shape:'sector',center:point(e),angle,spread,points};
      }
      if(p.id==='priorEcho') p.geometry=soundRing({x:250,y:330},phase===2?85:108,phase===2?204:180);
      if(p.id==='prismCross'){p.width=phase===2?27:18;p.lines=[[{x:35,y:85},{x:465,y:515}],[{x:465,y:85},{x:35,y:515}]];}
      if(p.id==='prismRay'){p.width=phase===2?29:20;const target=this.heroes[(this.active+1)%this.heroes.length];p.lines=reflectedRay(e,{x:target.x-e.x,y:target.y-e.y},1300,3);}
      if(p.id==='prismArmor')p.geometry={shape:'disk',center:point(e),radius:e.r+18};
      if(p.id==='forgeRing'){p.center={x:250,y:300};p.innerRadius=phase===2?88:105;p.radius=phase===2?214:198;p.geometry={shape:'annulus',center:p.center,innerRadius:p.innerRadius,radius:p.radius};}
      if(p.id==='forgeFalls')p.zones=[this.heroes[(this.active+1)%4],this.heroes[(this.active+3)%4]].map(h=>({...point(h),r:phase===2?83:64}));
      if(p.id==='forgeSteam'){p.width=phase===2?37:26;p.lines=[145,355].map(x=>[{x,y:80},{x,y:535}]);}
      if(p.id==='gardenRoots'){p.width=phase===2?29:20;p.lines=[0,1,3].map(i=>{const target=this.heroes[(this.active+i)%4],d=heading({x:target.x-e.x,y:target.y-e.y});return ray(e,d,650);});}
      if(p.id==='gardenPoison'){p.zones=[{x:130,y:305,r:phase===2?98:79},{x:370,y:365,r:phase===2?98:79}];}
      if(p.id==='gardenSanctum')p.safe={x:250,y:425,r:phase===2?87:112};
      if(p.lines)p.geometry={shape:'lines',segments:p.lines.map(l=>l.map(point)),width:p.width,center:point(e)};
      if(p.zones)p.geometry={shape:'circles',zones:p.zones.map(z=>({...z})),points:p.zones.map(point)};
      if(p.safe)p.geometry={shape:'outside',center:point(p.safe),radius:p.safe.r};
      if(p.rows)p.geometry={shape:'lines',segments:p.rows.map(y=>[{x:12,y},{x:488,y}]),width:p.width};
      e.plan=p;this.emit('bossTelegraph',{plan:p,counter:e.counter});
    },
    executeBoss(e){const p=e.plan,book=BOSSES[e.bossKind];if(!p)return 0;const hit=this.heroes.filter(h=>inPlan(h,p)),scale=e.phase===2?1.25:1;let damage=0;
      if(p.id==='guard'||p.id==='prismArmor'){e.armor=Math.round(e.maxHp*(e.phase===2?.27:.22));}
      else if(p.id==='fear'){this.sanity=Math.max(0,this.sanity-(e.phase===2?16:12));}
      else{damage=this.hurtParty(hit.length?e.damage*(.5+hit.length*.45)*scale:0);if(['spores','gardenPoison'].includes(p.id)&&hit.length)this.partyPoison={ticks:2,power:Math.round(e.damage*.18)};if(['eclipse','gardenSanctum'].includes(p.id)&&hit.length)this.sanity=Math.max(0,this.sanity-8);if(['spores','bells','tide','forgeFalls','gardenPoison','whaleJaws'].includes(p.id))this.hazards.push({...JSON.parse(JSON.stringify(p)),ticks:2,power:Math.round(e.damage*.15)});}
      const energyLost=p.id==='priorShards'?Math.min(this.energy,8*hit.length):0;
      this.energy-=energyLost;
      this.emit('bossCast',{energyLost,plan:JSON.parse(JSON.stringify(p)),origin:pos(e),targets:hit.map(pos),damage,blocked:this.shield>0,name:book.name});e.moveIndex++;e.counter=e.cooldown;this.planBoss(e);return damage;
    },
    checkBossPhase(e){if(!e.bossKind||e.phase===2||e.hp<=0||e.hp>e.maxHp*.5)return;e.phase=2;e.counter=Math.min(e.counter,1);this.planBoss(e);this.emit('bossPhase',{boss:e.id,name:BOSSES[e.bossKind].phase,...pos(e)});}
  };
  const api={SKILLS,BOSSES,methods,exposureAt,segmentDistance,inPlan,inGeometry,supportGeometry,reflectedRay};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AbyssKit=api;
})(typeof window!=='undefined'?window:globalThis);
