import * as THREE from './vendor/three.module.js';
const mount=document.querySelector('#scene'), art=document.querySelector('.hero-art'), motion=document.querySelector('#motion');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduce.matches, sceneActive=true, renderer, scene, camera, running=false, start=performance.now(), frame=0;
const animated=[], pointer=new THREE.Vector2(), target=new THREE.Vector2();
function setMotion(value){paused=!value;motion.setAttribute('aria-pressed',String(value));motion.setAttribute('aria-label',value?'Tắt chuyển động 3D':'Bật chuyển động 3D');motion.textContent=value?'Ⅱ':'▷';document.body.classList.toggle('motion-paused',!value);if(value)kick();else draw(performance.now());}
motion.addEventListener('click',()=>setMotion(paused));reduce.addEventListener('change',e=>setMotion(!e.matches));
function studioEnvironment(){const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,512);g.addColorStop(0,'#eee0df');g.addColorStop(.43,'#d7bdcd');g.addColorStop(.5,'#897c91');g.addColorStop(.64,'#dbb3bc');g.addColorStop(1,'#ead6c2');ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);ctx.fillStyle='#fff9ec';ctx.fillRect(60,40,115,185);ctx.fillRect(580,60,200,150);ctx.fillStyle='#423444';ctx.fillRect(270,230,80,140);ctx.fillStyle='#fff8f6';ctx.fillRect(840,150,35,180);const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;return t;}
function labelTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=1024;const ctx=c.getContext('2d');
  ctx.fillStyle='#fffdfb';ctx.fillRect(0,0,1024,1024);
  ctx.fillStyle='#39302c';ctx.textAlign='left';ctx.font='24px Arial';
  ctx.fillText('Dedicated to',180,96);ctx.fillText('real results',180,128);
  const goldInk=ctx.createLinearGradient(160,280,820,365);goldInk.addColorStop(0,'#c6ae77');goldInk.addColorStop(.25,'#8c673a');goldInk.addColorStop(.5,'#d3bc88');goldInk.addColorStop(.8,'#9b723d');goldInk.addColorStop(1,'#c6a66a');
  ctx.fillStyle=goldInk;ctx.font='100px Arial';ctx.fillText('medicube',163,375);ctx.font='55px Arial';ctx.fillText('⁺',765,332);
  ctx.fillStyle='#302b2a';ctx.font='34px Arial';ctx.fillText('PDRN PINK',182,491);ctx.fillText('PEPTIDE SERUM',182,539);
  ctx.strokeStyle='#d4beb6';ctx.lineWidth=2;ctx.strokeRect(180,587,614,48);ctx.strokeRect(180,650,614,48);
  ctx.fillStyle='#b89991';ctx.font='23px Arial';ctx.fillText('PDRN (Sodium DNA) 1%',199,619);ctx.fillText('5 Types Peptide Complex',199,683);
  ctx.fillStyle='#39302c';ctx.font='27px Arial';ctx.fillText('30 ml / 1.01 fl. oz.',182,781);
  ctx.fillStyle='#edbcc6';ctx.fillRect(0,880,1024,30);ctx.fillStyle='#f6e4e5';ctx.fillRect(0,917,1024,21);
  const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
}
function crystalGeometry(radius,height){const shape=new THREE.Shape();for(let i=0;i<6;i++){const a=i/6*Math.PI*2; i?shape.lineTo(Math.cos(a)*radius,Math.sin(a)*radius):shape.moveTo(Math.cos(a)*radius,Math.sin(a)*radius)}shape.closePath();const g=new THREE.BufferGeometry(),v=[],n=6;let base=-height/2,shoulder=height*.29,tip=height/2;for(let i=0;i<n;i++){let a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,p=[Math.cos(a)*radius,base,Math.sin(a)*radius],q=[Math.cos(b)*radius,base,Math.sin(b)*radius],u=[p[0],shoulder,p[2]],w=[q[0],shoulder,q[2]];v.push(...p,...q,...u,...q,...w,...u,...u,...w,0,tip,0,0,base,0,...q,...p)}g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;}
function mesh(geometry,material,parent=scene){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function floater(object,speed=.6,amp=.09){animated.push({object,speed,amp,y:object.position.y,phase:animated.length*1.7});return object;}
function init(){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.94;mount.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,1.1,8.8);camera.lookAt(0,.35,0);const pmrem=new THREE.PMREMGenerator(renderer),environment=studioEnvironment();scene.environment=pmrem.fromEquirectangular(environment).texture;environment.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xfff0f3,0x8a667e,1.15));const key=new THREE.DirectionalLight(0xfff4de,2.7);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.normalBias=.03;key.shadow.bias=-.0002;scene.add(key);let rim=new THREE.DirectionalLight(0xe8d4ff,1.9);rim.position.set(4,2,-2);scene.add(rim);let pink=new THREE.PointLight(0xffbcd3,7,10);pink.position.set(-2,1,2);scene.add(pink);
const rose=new THREE.MeshPhysicalMaterial({color:0xc291a8,metalness:.08,roughness:.12,transmission:.72,thickness:.75,ior:1.46,clearcoat:1,clearcoatRoughness:.07,iridescence:.35,iridescenceIOR:1.3,envMapIntensity:1.1});
const quartz=new THREE.MeshPhysicalMaterial({color:0xf2cfdb,roughness:.1,metalness:.04,transmission:.5,thickness:1.2,ior:1.45,clearcoat:1,envMapIntensity:1.3,flatShading:true});
const lavender=quartz.clone();lavender.color.set(0xc4a0d4);lavender.transmission=.35;const clear=quartz.clone();clear.color.set(0xf3e7dd);clear.transmission=.65;
const chrome=new THREE.MeshPhysicalMaterial({color:0xe9d9df,metalness:1,roughness:.1,clearcoat:1,iridescence:1,iridescenceIOR:1.4,envMapIntensity:1.2});
const gold=new THREE.MeshStandardMaterial({color:0xb28b75,metalness:.92,roughness:.24});const ivory=new THREE.MeshPhysicalMaterial({color:0xf1e9e3,roughness:.22,clearcoat:.7});
const floor=mesh(new THREE.CylinderGeometry(2.65,2.75,.13,96),new THREE.MeshStandardMaterial({color:0xd8c5bc,roughness:.7,metalness:.04}));floor.position.set(.1,-1.56,-.15);floor.scale.z=.67;floor.receiveShadow=true;
let shadow=mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.16}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.645;
// Reference-inspired clear cylindrical serum bottle, broad white cap and curved label.
const bottle=new THREE.Group();scene.add(bottle);bottle.position.set(.14,-.03,0);bottle.rotation.set(.025,.04,-.19);
const glass=new THREE.MeshPhysicalMaterial({color:0xffeee7,metalness:0,roughness:.045,transmission:0,transparent:true,opacity:.34,depthWrite:false,thickness:.12,ior:1.49,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:.9});
const liquid=new THREE.MeshPhysicalMaterial({color:0xe8b2a1,roughness:.07,transmission:0,transparent:true,opacity:.4,depthWrite:false,thickness:.85,ior:1.335,clearcoat:.3,envMapIntensity:.55});
const whiteCap=new THREE.MeshPhysicalMaterial({color:0xfffcf7,roughness:.24,metalness:0,clearcoat:.7,clearcoatRoughness:.13});
const rubber=new THREE.MeshPhysicalMaterial({color:0xfffdf9,roughness:.4,clearcoat:.22});
const profile=[ [0,-1.03],[.48,-1.03],[.57,-1.01],[.615,-.97],[.635,-.91],[.64,-.8],[.64,.63],[.635,.73],[.62,.79],[.57,.83],[.46,.865],[.34,.895],[.31,.94],[.31,1.02],[.28,1.06],[0,1.06] ].map(([r,y])=>new THREE.Vector2(r,y));
mesh(new THREE.LatheGeometry(profile,96),glass,bottle);
const contents=mesh(new THREE.CylinderGeometry(.576,.576,1.54,64),liquid,bottle);contents.position.y=-.115;
const meniscus=mesh(new THREE.SphereGeometry(.576,48,16),liquid,bottle);meniscus.position.y=.655;meniscus.scale.y=.025;
const bottomGlass=mesh(new THREE.TorusGeometry(.555,.065,12,72),glass,bottle);bottomGlass.rotation.x=Math.PI/2;bottomGlass.position.y=-.956;
for(const y of [.91,.98]){const thread=mesh(new THREE.TorusGeometry(.314,.021,10,64),glass,bottle);thread.rotation.x=Math.PI/2;thread.position.y=y;}
const cap=mesh(new THREE.CylinderGeometry(.385,.39,.66,72),whiteCap,bottle);cap.position.y=1.325;
const capTop=mesh(new THREE.TorusGeometry(.368,.02,10,72),whiteCap,bottle);capTop.rotation.x=Math.PI/2;capTop.position.y=1.651;
const capBottom=mesh(new THREE.TorusGeometry(.378,.017,10,72),whiteCap,bottle);capBottom.rotation.x=Math.PI/2;capBottom.position.y=1.003;
const bulb=mesh(new THREE.CapsuleGeometry(.196,.40,12,48),rubber,bottle);bulb.position.set(0,1.96,0);
const bulbBase=mesh(new THREE.CylinderGeometry(.23,.275,.13,48),rubber,bottle);bulbBase.position.y=1.68;
const pipette=mesh(new THREE.CylinderGeometry(.026,.026,1.65,16),glass,bottle);pipette.position.y=.02;
const pipetteTip=mesh(new THREE.SphereGeometry(.027,16,12),glass,bottle);pipetteTip.position.y=-.807;pipetteTip.scale.y=1.6;
const wrap=mesh(new THREE.CylinderGeometry(.644,.644,1.34,96,1,true,-Math.PI*.38,Math.PI*.76),new THREE.MeshBasicMaterial({map:labelTexture(),side:THREE.DoubleSide,toneMapped:false}),bottle);wrap.position.y=-.08;wrap.castShadow=false;
// Narrow glints along the curved glass make the transparent wall legible.
const glintMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide});
for(const [angle,width] of [[-.90,.045],[.96,.025]]){const glint=mesh(new THREE.CylinderGeometry(.643,.643,1.82,48,1,true,angle,width),glintMaterial,bottle);glint.position.y=-.04;glint.castShadow=false;}
floater(bottle,.52,.065);
const cluster=new THREE.Group();cluster.position.set(-1.65,-1.03,.35);cluster.rotation.set(0,.5,-.12);scene.add(cluster);for(let i=0;i<6;i++){let r=.16+(i%3)*.035,h=.7+(i%3)*.34;let c=mesh(crystalGeometry(r,h),i%2?quartz:clear,cluster);c.position.set(Math.cos(i*2.2)*.32,h/2-.43,Math.sin(i*2.2)*.3);c.rotation.set(i%2*.17,i*.3,(i-2)*.08)}
const amethyst=new THREE.Group();amethyst.position.set(1.7,-1.15,.65);scene.add(amethyst);for(let i=0;i<12;i++){let h=.24+(Math.sin(i*2.5)+1)*.2;let c=mesh(crystalGeometry(.16,h),i%3?lavender:quartz,amethyst);c.position.set(Math.cos(i*2.4)*(i%3)*.2,h/2-.3,Math.sin(i*2.4)*(i%3)*.2);c.rotation.set(.3*Math.sin(i),i*.6,.3*Math.cos(i))}
const tall=mesh(crystalGeometry(.26,1.75),clear);tall.position.set(1.67,-.42,-.7);tall.rotation.set(.16,.4,-.25);
let orb=mesh(new THREE.SphereGeometry(.44,48,32),chrome);orb.position.set(1.45,1.9,-.3);floater(orb,.7,.14);
let orb2=mesh(new THREE.SphereGeometry(.26,40,24),chrome);orb2.position.set(-1.9,.95,.6);floater(orb2,.65,.12);
let orb3=mesh(new THREE.SphereGeometry(.14,28,20),chrome);orb3.position.set(1.8,-.55,1.05);floater(orb3,.8,.07);
let orb4=mesh(new THREE.SphereGeometry(.11,24,16),ivory);orb4.position.set(-1.03,2.1,-.3);floater(orb4,.85,.1);
const ring=mesh(new THREE.TorusGeometry(1.19,.028,12,100),gold);ring.position.set(.3,.12,-.7);ring.rotation.set(.3,.6,.3);floater(ring,.35,.03);
let pebble=mesh(new THREE.SphereGeometry(.3,40,24),chrome);pebble.position.set(-.7,-1.25,1);pebble.scale.set(1,.5,.7);pebble.rotation.z=.2;
new ResizeObserver(resize).observe(mount);new IntersectionObserver(entries=>{sceneActive=entries[0].isIntersecting;if(sceneActive)kick()},{rootMargin:'100px'}).observe(mount);document.addEventListener('visibilitychange',()=>{if(!document.hidden)kick()});art.addEventListener('pointermove',e=>{let r=art.getBoundingClientRect();target.set(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2);kick()});art.addEventListener('pointerleave',()=>{target.set(0,0)});renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();sceneActive=false;mount.classList.remove('scene-ready')});mount.classList.add('scene-ready');resize();setMotion(!paused);draw(performance.now());}
function resize(){if(!renderer)return;let r=mount.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=camera.aspect<1?10.5:8.8;camera.updateProjectionMatrix();draw(performance.now());}
function draw(now){if(!renderer)return;let t=(now-start)/1000;if(!paused){pointer.lerp(target,.035);camera.position.x=pointer.x*.5;camera.position.y=1.1-pointer.y*.3;camera.lookAt(0,.35,0);animated.forEach(({object,speed,amp,y,phase},i)=>{object.position.y=y+Math.sin(t*speed+phase)*amp;if(i>0)object.rotation.y=t*.12});}renderer.render(scene,camera);}
function kick(){if(running||!renderer||paused||!sceneActive||document.hidden)return;running=true;frame=requestAnimationFrame(t=>{running=false;draw(t);kick()});}
try{init()}catch(error){mount.classList.remove('scene-ready');motion.disabled=true;motion.setAttribute('aria-label','Cảnh 3D không khả dụng trên thiết bị này');console.warn('3D scene unavailable; static artwork remains visible.',error.message)}
// A gentle dimensional response for workspace cards; data controls remain in place.
let tilted=null,tiltFrame=0;document.addEventListener('pointermove',e=>{if(paused||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;let card=e.target.closest('.stat,.entity');if(tilted&&tilted!==card){tilted.style.transform='';tilted=null}if(!card)return;let r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cancelAnimationFrame(tiltFrame);tilted=card;tiltFrame=requestAnimationFrame(()=>{card.style.transform=`perspective(900px) translateY(-4px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`})},{passive:true});document.addEventListener('pointerout',e=>{if(tilted&&!tilted.contains(e.relatedTarget)){tilted.style.transform='';tilted=null}});
