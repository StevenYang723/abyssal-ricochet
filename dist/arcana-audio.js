'use strict';
/* Short layered Web Audio cues, synthesized locally; no network audio dependency. */
const ArcanaAudio=window.ArcanaAudio={
  noise:null,impulse:null,last:new Map(),
  profiles:{
    evelyn:[196,'sine',900,'choir'],noah:[95,'triangle',3400,'shot'],
    lucia:[440,'sine',1600,'bell'],silas:[98,'sine',650,'soul'],
    aster:[75,'sine',2400,'fall'],rook:[125,'triangle',2900,'shot'],
    seraph:[330,'sine',1900,'choir'],corvus:[65,'sine',480,'mist'],
    nyra:[110,'sine',1300,'wave'],orion:[185,'triangle',3100,'blade'],
    mira:[660,'sine',2200,'clock'],ren:[145,'triangle',2800,'blade'],
    vesper:[392,'sine',2400,'bell'],bram:[82,'triangle',2000,'fall'],iris:[295,'sine',2700,'blade'],galen:[523,'sine',3000,'clock'],lyra:[220,'sine',1200,'choir'],morrow:[49,'sine',500,'soul'],thalia:[110,'triangle',1100,'mist'],sable:[330,'sine',2000,'bell'],
    prismCross:[260,'sine',2600,'bell'],prismRay:[196,'triangle',3200,'blade'],prismArmor:[660,'sine',2100,'clock'],forgeRing:[55,'triangle',900,'wave'],forgeFalls:[65,'sine',1800,'fall'],forgeSteam:[82,'sine',1400,'mist'],gardenRoots:[73,'triangle',1200,'wave'],gardenPoison:[60,'sine',650,'mist'],gardenSanctum:[147,'sine',950,'choir'],
    gaze:[65,'sine',1100,'soul'],spores:[55,'sine',500,'mist'],fear:[42,'sine',750,'soul'],
    cross:[220,'sine',2400,'bell'],guard:[165,'triangle',1700,'bell'],bells:[110,'sine',1900,'bell'],
    tentacles:[48,'sine',750,'wave'],tide:[60,'sine',900,'wave'],eclipse:[38,'sine',600,'choir']
  },
  play(key,ultimate=false,phase){
    if(!sound)return;
    try{
      if(!audioContext)audioContext=new (window.AudioContext||window.webkitAudioContext)();
      if(audioContext.state==='suspended')audioContext.resume();
      const ac=audioContext,t=ac.currentTime,soundKey=phase==='prepare'?key+'-prepare':key;
      const old=this.last.get(soundKey)||-1;
      if(t-old<.13)return;this.last.set(soundKey,t);
      const [freq,wave,filter,kind]=this.profiles[key]||this.profiles.evelyn,span=ultimate?1.55:.65;
      if(!this.noise){this.noise=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=this.noise.getChannelData(0);let low=0;for(let i=0;i<d.length;i++){low=.94*low+.06*(Math.random()*2-1);d[i]=(Math.random()*2-1)*.35+low*2;}}
      const master=ac.createGain(),delay=ac.createDelay(.6),feedback=ac.createGain(),wet=ac.createGain();
      master.gain.value=ultimate?.7:.45;delay.delayTime.value=kind==='clock'?.13:.19;feedback.gain.value=.22;wet.gain.value=.24;
      master.connect(ac.destination);master.connect(delay);delay.connect(wet);wet.connect(ac.destination);delay.connect(feedback);feedback.connect(delay);
      const voice=(start,hz,length,level,type=wave,end=hz*.8)=>{
        const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(hz,start);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),start+length);
        g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(level,start+.025);g.gain.exponentialRampToValueAtTime(.0001,start+length);
        o.connect(g);g.connect(master);o.start(start);o.stop(start+length+.02);o.onended=()=>{o.disconnect();g.disconnect();};
      };
      const gust=(start,length,level,rising=false)=>{
        const n=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();n.buffer=this.noise;f.type='bandpass';f.Q.value=.65;
        f.frequency.setValueAtTime(rising?filter*.3:filter,start);f.frequency.exponentialRampToValueAtTime(rising?filter:Math.max(120,filter*.2),start+length);
        g.gain.setValueAtTime(.001,start);g.gain.exponentialRampToValueAtTime(level,start+length*.18);g.gain.exponentialRampToValueAtTime(.001,start+length);
        n.connect(f);f.connect(g);g.connect(master);n.start(start);n.stop(start+length);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};
      };
      if(phase==='prepare'){
        // A brief metal resonance on the caster; the attack sounds at contact.
        voice(t,freq*2,.13,.06,'sine',freq*3);
        voice(t+.09,freq*3,.19,.04,'triangle',freq*3.2);
      }else{
        gust(t,span*.8,kind==='shot'?.2:.12,['wave','soul','mist'].includes(kind));
        if(['choir','soul'].includes(kind)){[1,1.5,2].forEach((v,i)=>voice(t+i*.04,freq*v,span,.045/(i+1),'sine',freq*v*1.01));}
        else if(kind==='bell'||kind==='clock'){[1,2.76,4.07].forEach((v,i)=>voice(t+i*.06,freq*v,span*(1-i*.12),.075/(i+1),'sine',freq*v*.995));}
        else if(kind==='shot'){for(let i=0;i<(ultimate?3:1);i++){voice(t+i*.13,freq*1.5,.18,.15,'triangle',35);gust(t+i*.13,.18,.18);}}
        else if(kind==='blade'){voice(t,freq*4,.28,.065,'triangle',freq);voice(t+.12,65,.3,.11,'sine',30);gust(t+.08,.34,.19);}
        else if(kind==='fall'){gust(t,.42,.2);voice(t+.3,125,.5,.16,'sine',28);voice(t+.34,880,.8,.03,'sine',440);}
        else{voice(t,freq,span,.1,'sine',Math.max(28,freq*.55));}
        if(ultimate){voice(t+.22,48,.65,.11,'sine',28);if(['choir','bell','clock'].includes(kind))voice(t+.18,freq*3,1.1,.028,'sine',freq*3);}
      }
      setTimeout(()=>{master.disconnect();delay.disconnect();feedback.disconnect();wet.disconnect();},(span+1.7)*1000);
    }catch{}
  }
};
