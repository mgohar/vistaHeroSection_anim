import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

//===================================================== SHADERS
const vertexShader = `
varying vec2 vUv;
varying float vDistance;
  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vDistance = -mvPosition.z; 
  }
`;

const fragmentShader = `
  uniform sampler2D cityTexture;
  varying vec2 vUv;
  uniform float opacity;
  varying float vDistance;

  void main() {
    float opacityT = clamp(5.4 - (vDistance / 2.0), 0.0, 1.0);
    vec4 color = texture2D(cityTexture, vUv);
    color.a *= opacityT*opacity;

    gl_FragColor = color; // Adjust the color as needed
  }
`;

//===================================================== Variables
let canvas,
  activeScene,
  contemporary,
  minimalist,
  modern,
  scandinavian,
  contemporaryL,
  minimalistL,
  modernL,
  scandinavianL;
canvas = document.querySelector(".canvas");
//===================================================== Create a WebGL renderer
var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  powerPreference: "high-performance",
  alpha: true,
  antialias: true,
  stencil: false,
  depth: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
//===================================================== Create an empty scene
var scene = new THREE.Scene();
// scene.background=new THREE.TextureLoader().load("/city_bg.jpg");
//===================================================== Create a perpsective camera
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);
camera.position.z = 4.5;

//===================================================== Orbit Controls
// const orbitControls = new OrbitControls(camera, canvas);
// orbitControls.enableDamping = true;
//===================================================== Resize
window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

//===================================================== Create a mesh

//===================================================== Create a point light in our scene
var light = new THREE.PointLight(new THREE.Color("white"), 10, 10);
var ambientLight = new THREE.AmbientLight("#ffffff", 10);
scene.add(ambientLight, light);

//===================================================== Animate

const clock = new THREE.Clock();

function Animation() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(Animation);
}

Animation();
//===================================================== TransformControls

function TControl(name, type = "P", group = true) {
  let tControl = new TransformControls(camera, renderer.domElement);
  tControl.addEventListener("dragging-changed", (event) => {
    orbitControls.enabled = !event.value;
  });
  tControl.attach(name);
  scene.add(tControl);

  tControl.addEventListener("change", () => {
    // The object's position has changed
    const newPosition = name.position;
    const newRotate = name.rotation;
    const newScale = name.scale;
    type == "R"
      ? (console.log("New Rotation:", {
          x: parseFloat(newRotate.x.toFixed(2)),
          y: parseFloat(newRotate.y.toFixed(2)),
          z: parseFloat(newRotate.z.toFixed(2)),
        }),
        tControl.setMode("rotate"))
      : type == "S"
      ? (console.log("New Scale:", {
          x: parseFloat(newScale.x.toFixed(2)),
          y: parseFloat(newScale.y.toFixed(2)),
          z: parseFloat(newScale.z.toFixed(2)),
        }),
        tControl.setMode("scale"))
      : (console.log("New Position:", {
          x: parseFloat(newPosition.x.toFixed(2)),
          y: parseFloat(newPosition.y.toFixed(2)),
          z: parseFloat(newPosition.z.toFixed(2)),
        }),
        tControl.setMode("translate"));
  });
}
//===================================================== Debugger

const axesHelper = new THREE.AxesHelper(1000); // Adjust the size as needed
// scene.add(axesHelper);

//===================================================== Init function

const Init = (bgScene) => {
  /*
         ________  ________  ________   _________  _______   ________  ________  ________  ________  ________      ___    ___ 
        |\   ____\|\   __  \|\   ___  \|\___   ___\\  ___ \ |\   __  \|\   __  \|\   __  \|\   __  \|\   __  \    |\  \  /  /|
        \ \  \___|\ \  \|\  \ \  \\ \  \|___ \  \_\ \   __/|\ \  \|\  \ \  \|\  \ \  \|\  \ \  \|\  \ \  \|\  \   \ \  \/  / /
         \ \  \    \ \  \\\  \ \  \\ \  \   \ \  \ \ \  \_|/_\ \   ____\ \  \\\  \ \   _  _\ \   __  \ \   _  _\   \ \    / / 
          \ \  \____\ \  \\\  \ \  \\ \  \   \ \  \ \ \  \_|\ \ \  \___|\ \  \\\  \ \  \\  \\ \  \ \  \ \  \\  \|   \/  /  /  
           \ \_______\ \_______\ \__\\ \__\   \ \__\ \ \_______\ \__\    \ \_______\ \__\\ _\\ \__\ \__\ \__\\ _\ __/  / /    
            \|_______|\|_______|\|__| \|__|    \|__|  \|_______|\|__|     \|_______|\|__|\|__|\|__|\|__|\|__|\|__|\___/ /     
                                                                                                                 \|___|/      
*/
  //===================================================== CONTEPORARY PODIUM
  contemporary = new THREE.Group();
  const contemporaryPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/podium.png`
  );
  const contemporaryPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const contemporaryPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryPodium = new THREE.Mesh(
    contemporaryPodiumGeo,
    contemporaryPodiumMat
  );

  contemporaryPodium.position.set(-0.455, -0.451, 0);
  contemporaryPodium.name = "contemporaryPodium";
  contemporary.add(contemporaryPodium);

  // TControl(contemporaryPodium)

  //===================================================== CONTEPORARY CHAIR
  const contemporaryChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/armchair.png`
  );
  const contemporaryChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryChair = new THREE.Mesh(
    contemporaryChairGeo,
    contemporaryChairMat
  );
  contemporaryChair.position.set(0.001, 0.049, 0.021);
  contemporaryChair.scale.set(0.208, 1.635, 0);
  contemporary.add(contemporaryChair);
  // TControl(contemporaryPodium)

  //===================================================== CONTEPORARY LAMP
  const contemporaryLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/lamp.png`
  );
  const contemporaryLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryLamp = new THREE.Mesh(
    contemporaryLampGeo,
    contemporaryLampMat
  );
  contemporaryLamp.position.set(-0.1, 0.4, 0.04);
  contemporaryLamp.scale.set(0.31, 2.99, 0);
  contemporary.add(contemporaryLamp);
  // TControl(contemporaryLamp,"P")

  //===================================================== CONTEPORARY DESK
  const contemporaryDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/desk.png`
  );
  const contemporaryDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryDesk = new THREE.Mesh(
    contemporaryDeskGeo,
    contemporaryDeskMat
  );
  contemporaryDesk.position.set(0.991, 0.115, 0.06);
  contemporaryDesk.scale.set(0.111, 2.1, 0);
  contemporary.add(contemporaryDesk);
  // TControl(contemporaryDesk,"P")

  //===================================================== CONTEPORARY Plant
  const contemporaryPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/plant.png`
  );
  const contemporaryPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryPlant = new THREE.Mesh(
    contemporaryPlantGeo,
    contemporaryPlantMat
  );
  contemporaryPlant.position.set(-1.116, 0.242, 0.094);
  contemporaryPlant.scale.set(0.171, 2.362, 0);
  contemporary.add(contemporaryPlant);
  // TControl(contemporaryPlant,"P")

  //===================================================== CONTEPORARY Ball 1
  const contemporaryBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/ball1.png`
  );
  const contemporaryBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryBall = new THREE.Mesh(
    contemporaryBallGeo,
    contemporaryBallMat
  );
  contemporaryBall.position.set(-0.624, -0.269, 0.094);
  contemporaryBall.scale.set(0.062, 0.62, 0);
  contemporary.add(contemporaryBall);
  // TControl(contemporary,"P")

  //===================================================== CONTEPORARY Ball 1
  const contemporaryBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/ball2.png`
  );
  const contemporaryBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryBall2 = new THREE.Mesh(
    contemporaryBall2Geo,
    contemporaryBall2Mat
  );
  contemporaryBall2.position.set(1.38, -0.24, 0.094);
  contemporaryBall2.scale.set(0.05, 0.5, 0);
  contemporary.add(contemporaryBall2);
  // TControl(contemporaryBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const contemporaryHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/halfBall.png`
  );
  const contemporaryHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryHalfBall = new THREE.Mesh(
    contemporaryHalfBallGeo,
    contemporaryHalfBallMat
  );
  contemporaryHalfBall.position.set(-1.17, -0.26, 0.094);
  contemporaryHalfBall.scale.set(0.05, 0.45, 0);
  contemporary.add(contemporaryHalfBall);
  // TControl(contemporaryHalfBall, "P");
  /*
  _____ ______   ___  ________   ___  _____ ______   ________  ___       ___  ________  _________   
 |\   _ \  _   \|\  \|\   ___  \|\  \|\   _ \  _   \|\   __  \|\  \     |\  \|\   ____\|\___   ___\ 
 \ \  \\\__\ \  \ \  \ \  \\ \  \ \  \ \  \\\__\ \  \ \  \|\  \ \  \    \ \  \ \  \___|\|___ \  \_| 
  \ \  \\|__| \  \ \  \ \  \\ \  \ \  \ \  \\|__| \  \ \   __  \ \  \    \ \  \ \_____  \   \ \  \  
   \ \  \    \ \  \ \  \ \  \\ \  \ \  \ \  \    \ \  \ \  \ \  \ \  \____\ \  \|____|\  \   \ \  \ 
    \ \__\    \ \__\ \__\ \__\\ \__\ \__\ \__\    \ \__\ \__\ \__\ \_______\ \__\____\_\  \   \ \__\
     \|__|     \|__|\|__|\|__| \|__|\|__|\|__|     \|__|\|__|\|__|\|_______|\|__|\_________\   \|__|
                                                                                \|_________|        
*/
  //===================================================== CONTEPORARY PODIUM
  minimalist = new THREE.Group();
  const minimalistPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/shadowPodium.png`
  );
  const minimalistPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const minimalistPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistPodium = new THREE.Mesh(
    minimalistPodiumGeo,
    minimalistPodiumMat
  );
  minimalistPodium.position.set(-0.455, -0.451, 0);
  minimalist.add(minimalistPodium);
  // TControl(minimalistPodium)

  //===================================================== CONTEPORARY CHAIR
  const minimalistChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/armchair.png`
  );
  const minimalistChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistChair = new THREE.Mesh(
    minimalistChairGeo,
    minimalistChairMat
  );
  minimalistChair.position.set(-0.23, 0.01, 0.02);
  minimalistChair.scale.set(0.2, 1.84, 0);
  minimalist.add(minimalistChair);
  // TControl(minimalistChair,"P")

  //===================================================== CONTEPORARY LAMP
  const minimalistLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/lamp.png`
  );
  const minimalistLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistLamp = new THREE.Mesh(minimalistLampGeo, minimalistLampMat);
  minimalistLamp.position.set(0.46, 0.29, 0.04);
  minimalistLamp.scale.set(0.1, 2.6, 0);
  minimalist.add(minimalistLamp);
  // TControl(minimalistLamp,"P")

  //===================================================== CONTEPORARY DESK
  const minimalistDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/desk.png`
  );
  const minimalistDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistDesk = new THREE.Mesh(minimalistDeskGeo, minimalistDeskMat);
  minimalistDesk.position.set(0.86, 0.15, 0.06);
  minimalistDesk.scale.set(0.13, 2.18, 0);
  minimalist.add(minimalistDesk);
  // TControl(minimalistDesk,"P")

  //===================================================== CONTEPORARY Plant
  const minimalistPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/plant.png`
  );
  const minimalistPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistPlant = new THREE.Mesh(
    minimalistPlantGeo,
    minimalistPlantMat
  );
  minimalistPlant.position.set(-0.81, 0.28, 0.09);
  minimalistPlant.scale.set(0.18, 2.6, 0);
  minimalist.add(minimalistPlant);
  // TControl(minimalistPlant,"P")

  //===================================================== CONTEPORARY Ball 1
  const minimalistBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/ball1.png`
  );
  const minimalistBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistBall = new THREE.Mesh(minimalistBallGeo, minimalistBallMat);
  minimalistBall.position.set(-1.18, -0.26, 0.094);
  minimalistBall.scale.set(0.055, 0.55, 0);
  minimalist.add(minimalistBall);
  // TControl(minimalistBall,"P")

  //===================================================== CONTEPORARY Ball 1
  const minimalistBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/ball2.png`
  );
  const minimalistBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistBall2 = new THREE.Mesh(
    minimalistBall2Geo,
    minimalistBall2Mat
  );
  minimalistBall2.position.set(0.32, -0.34, 0.094);
  minimalistBall2.scale.set(0.04, 0.4, 0);
  minimalist.add(minimalistBall2);
  // TControl(minimalistBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const minimalistHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/halfBall.png`
  );
  const minimalistHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistHalfBall = new THREE.Mesh(
    minimalistHalfBallGeo,
    minimalistHalfBallMat
  );
  minimalistHalfBall.position.set(1.28, -0.26, 0.09);
  minimalistHalfBall.scale.set(0.07, 0.585, 0);
  minimalist.add(minimalistHalfBall);
  // TControl(minimalistHalfBall, "P");

  /*_____ ______   ________  ________  _______   ________  ________      
 |\   _ \  _   \|\   __  \|\   ___ \|\  ___ \ |\   __  \|\   ___  \    
 \ \  \\\__\ \  \ \  \|\  \ \  \_|\ \ \   __/|\ \  \|\  \ \  \\ \  \   
  \ \  \\|__| \  \ \  \\\  \ \  \ \\ \ \  \_|/_\ \   _  _\ \  \\ \  \  
   \ \  \    \ \  \ \  \\\  \ \  \_\\ \ \  \_|\ \ \  \\  \\ \  \\ \  \ 
    \ \__\    \ \__\ \_______\ \_______\ \_______\ \__\\ _\\ \__\\ \__\
     \|__|     \|__|\|_______|\|_______|\|_______|\|__|\|__|\|__| \|__|
*/
  //===================================================== CONTEPORARY PODIUM
  modern = new THREE.Group();
  const modernPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/shadowPodium.png`
  );
  const modernPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const modernPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernPodium = new THREE.Mesh(modernPodiumGeo, modernPodiumMat);
  modernPodium.position.set(-0.455, -0.451, 0);
  modern.add(modernPodium);
  // TControl(modernPodium)

  //===================================================== CONTEPORARY CHAIR
  const modernChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/armchair.png`
  );
  const modernChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernChair = new THREE.Mesh(modernChairGeo, modernChairMat);
  modernChair.position.set(0.03, 0.03, 0.02);
  modernChair.scale.set(0.2, 1.84, 0);
  modern.add(modernChair);
  // TControl(modernChair,"P")

  //===================================================== CONTEPORARY LAMP
  const modernLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/lamp.png`
  );
  const modernLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernLamp = new THREE.Mesh(modernLampGeo, modernLampMat);
  modernLamp.position.set(-0.47, 0.27, 0.04);
  modernLamp.scale.set(0.1, 2.6, 0);
  modern.add(modernLamp);
  // TControl(modernLamp,"P")

  //===================================================== CONTEPORARY DESK
  const modernDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/desk.png`
  );
  const modernDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernDesk = new THREE.Mesh(modernDeskGeo, modernDeskMat);
  modernDesk.position.set(0.9, -0.02, 0.06);
  modernDesk.scale.set(0.11, 1.6, 0);
  modern.add(modernDesk);
  // TControl(modernDesk,"P")

  //===================================================== CONTEPORARY Plant
  const modernPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/plant.png`
  );
  const modernPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernPlant = new THREE.Mesh(modernPlantGeo, modernPlantMat);
  modernPlant.position.set(-1.05, 0.28, 0.09);
  modernPlant.scale.set(0.18, 2.6, 0);
  modern.add(modernPlant);
  // TControl(modernPlant,"P")

  //===================================================== CONTEPORARY Ball 2
  const modernBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/ball2.png`
  );
  const modernBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernBall2 = new THREE.Mesh(modernBall2Geo, modernBall2Mat);
  modernBall2.position.set(1.3, -0.25, 0.094);
  modernBall2.scale.set(0.04, 0.4, 0);
  modern.add(modernBall2);
  // TControl(modernBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const modernHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/halfBall.png`
  );
  const modernHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernHalfBall = new THREE.Mesh(modernHalfBallGeo, modernHalfBallMat);
  modernHalfBall.position.set(-0.62, -0.3, 0.09);
  modernHalfBall.scale.set(0.058, 0.5, 0);
  modern.add(modernHalfBall);
  // TControl(modernHalfBall, "P");

  /*
  ________  ________  ________  ________   ________  ___  ________   ________  ___      ___ ___  ________  ________      
 |\   ____\|\   ____\|\   __  \|\   ___  \|\   ___ \|\  \|\   ___  \|\   __  \|\  \    /  /|\  \|\   __  \|\   ___  \    
 \ \  \___|\ \  \___|\ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \ \  \\ \  \ \  \|\  \ \  \  /  / | \  \ \  \|\  \ \  \\ \  \   
  \ \_____  \ \  \    \ \   __  \ \  \\ \  \ \  \ \\ \ \  \ \  \\ \  \ \   __  \ \  \/  / / \ \  \ \   __  \ \  \\ \  \  
   \|____|\  \ \  \____\ \  \ \  \ \  \\ \  \ \  \_\\ \ \  \ \  \\ \  \ \  \ \  \ \    / /   \ \  \ \  \ \  \ \  \\ \  \ 
     ____\_\  \ \_______\ \__\ \__\ \__\\ \__\ \_______\ \__\ \__\\ \__\ \__\ \__\ \__/ /     \ \__\ \__\ \__\ \__\\ \__\
    |\_________\|_______|\|__|\|__|\|__| \|__|\|_______|\|__|\|__| \|__|\|__|\|__|\|__|/       \|__|\|__|\|__|\|__| \|__|
    \|_________|                                                                                                         
*/
  //===================================================== CONTEPORARY PODIUM
  scandinavian = new THREE.Group();
  const scandinavianPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/shadowPodium.png`
  );
  const scandinavianPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const scandinavianPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianPodium = new THREE.Mesh(
    scandinavianPodiumGeo,
    scandinavianPodiumMat
  );
  scandinavianPodium.position.set(-0.455, -0.451, 0);
  scandinavian.add(scandinavianPodium);
  // TControl(scandinavianPodium)

  //===================================================== CONTEPORARY CHAIR
  const scandinavianChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/armchair.png`
  );
  const scandinavianChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianChair = new THREE.Mesh(
    scandinavianChairGeo,
    scandinavianChairMat
  );
  scandinavianChair.position.set(0.03, 0.03, 0.02);
  scandinavianChair.scale.set(0.2, 1.84, 0);
  scandinavian.add(scandinavianChair);
  // TControl(scandinavianChair,"P")

  //===================================================== CONTEPORARY LAMP
  const scandinavianLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/lamp.png`
  );
  const scandinavianLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianLamp = new THREE.Mesh(
    scandinavianLampGeo,
    scandinavianLampMat
  );
  scandinavianLamp.position.set(0.63, 0.28, 0.04);
  scandinavianLamp.scale.set(0.1, 2.6, 0);
  scandinavian.add(scandinavianLamp);
  // TControl(scandinavianLamp,"P")

  //===================================================== CONTEPORARY DESK
  const scandinavianDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/desk.png`
  );
  const scandinavianDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianDesk = new THREE.Mesh(
    scandinavianDeskGeo,
    scandinavianDeskMat
  );
  scandinavianDesk.position.set(-0.82, 0.31, 0.06);
  scandinavianDesk.scale.set(0.13, 2.7, 0);
  scandinavian.add(scandinavianDesk);
  // TControl(scandinavianDesk,"P")

  //===================================================== CONTEPORARY Plant
  const scandinavianPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/plant.png`
  );
  const scandinavianPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianPlant = new THREE.Mesh(
    scandinavianPlantGeo,
    scandinavianPlantMat
  );
  scandinavianPlant.position.set(1.05, 0.28, 0.09);
  scandinavianPlant.scale.set(0.18, 2.48, 0);
  scandinavian.add(scandinavianPlant);
  // TControl(scandinavianPlant,"S")

  //===================================================== CONTEPORARY Ball 2
  const scandinavianBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/ball2.png`
  );
  const scandinavianBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianBall2 = new THREE.Mesh(
    scandinavianBall2Geo,
    scandinavianBall2Mat
  );
  scandinavianBall2.position.set(-1.21, -0.25, 0.094);
  scandinavianBall2.scale.set(0.04, 0.4, 0);
  scandinavian.add(scandinavianBall2);
  // TControl(scandinavianBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const scandinavianHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/halfBall.png`
  );
  const scandinavianHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianHalfBall = new THREE.Mesh(
    scandinavianHalfBallGeo,
    scandinavianHalfBallMat
  );
  scandinavianHalfBall.position.set(1.33, -0.22, 0.09);
  scandinavianHalfBall.scale.set(0.058, 0.5, 0);
  scandinavian.add(scandinavianHalfBall);
  // TControl(scandinavianHalfBall, "P");

  // contemporary.position.y = "-0.532";
  scene.add(contemporary);
  contemporary.position.set(-0.05, -0.56, 0);
  // TControl(contemporary, "P");

  minimalist.position.set(-5.33, -0.92, -5.25);
  // minimalist.scale.set(0.45, 0.47, 0)
  scene.add(minimalist);
  // TControl(minimalist, "P");

  modern.position.set(0, 0.04, -15);
  // modern.scale.set(0.2, 0.21, 0)
  scene.add(modern);
  // TControl(modern, "P");

  scandinavian.position.set(5.2, -0.93, -5.25);
  // scandinavian.scale.set(0.45, 0.47, 0)
  scene.add(scandinavian);
  // TControl(scandinavian, "P");
};
const InitLight = (bgScene) => {
  /*
         ________  ________  ________   _________  _______   ________  ________  ________  ________  ________      ___    ___ 
        |\   ____\|\   __  \|\   ___  \|\___   ___\\  ___ \ |\   __  \|\   __  \|\   __  \|\   __  \|\   __  \    |\  \  /  /|
        \ \  \___|\ \  \|\  \ \  \\ \  \|___ \  \_\ \   __/|\ \  \|\  \ \  \|\  \ \  \|\  \ \  \|\  \ \  \|\  \   \ \  \/  / /
         \ \  \    \ \  \\\  \ \  \\ \  \   \ \  \ \ \  \_|/_\ \   ____\ \  \\\  \ \   _  _\ \   __  \ \   _  _\   \ \    / / 
          \ \  \____\ \  \\\  \ \  \\ \  \   \ \  \ \ \  \_|\ \ \  \___|\ \  \\\  \ \  \\  \\ \  \ \  \ \  \\  \|   \/  /  /  
           \ \_______\ \_______\ \__\\ \__\   \ \__\ \ \_______\ \__\    \ \_______\ \__\\ _\\ \__\ \__\ \__\\ _\ __/  / /    
            \|_______|\|_______|\|__| \|__|    \|__|  \|_______|\|__|     \|_______|\|__|\|__|\|__|\|__|\|__|\|__|\___/ /     
                                                                                                                 \|___|/      
*/
  //===================================================== CONTEPORARY PODIUM
  contemporaryL = new THREE.Group();
  const contemporaryPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/shadowPodium.png`
  );
  const contemporaryPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const contemporaryPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryPodium = new THREE.Mesh(
    contemporaryPodiumGeo,
    contemporaryPodiumMat
  );

  contemporaryPodium.position.set(-0.455, -0.451, 0);
  contemporaryPodium.name = "contemporaryPodium";
  contemporaryL.add(contemporaryPodium);

  // TControl(contemporaryPodium)

  //===================================================== CONTEPORARY CHAIR
  const contemporaryChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/armchair.png`
  );
  const contemporaryChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryChair = new THREE.Mesh(
    contemporaryChairGeo,
    contemporaryChairMat
  );
  contemporaryChair.position.set(0.001, 0.049, 0.021);
  contemporaryChair.scale.set(0.208, 1.635, 0);
  contemporaryL.add(contemporaryChair);
  // TControl(contemporaryPodium)

  //===================================================== CONTEPORARY LAMP
  const contemporaryLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/lamp.png`
  );
  const contemporaryLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryLamp = new THREE.Mesh(
    contemporaryLampGeo,
    contemporaryLampMat
  );
  contemporaryLamp.position.set(-0.1, 0.4, 0.04);
  contemporaryLamp.scale.set(0.31, 2.99, 0);
  contemporaryL.add(contemporaryLamp);
  // TControl(contemporaryLamp,"P")

  //===================================================== CONTEPORARY DESK
  const contemporaryDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/desk.png`
  );
  const contemporaryDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryDesk = new THREE.Mesh(
    contemporaryDeskGeo,
    contemporaryDeskMat
  );
  contemporaryDesk.position.set(0.991, 0.115, 0.06);
  contemporaryDesk.scale.set(0.111, 2.1, 0);
  contemporaryL.add(contemporaryDesk);
  // TControl(contemporaryDesk,"P")

  //===================================================== CONTEPORARY Plant
  const contemporaryPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/plant.png`
  );
  const contemporaryPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryPlant = new THREE.Mesh(
    contemporaryPlantGeo,
    contemporaryPlantMat
  );
  contemporaryPlant.position.set(-1.116, 0.242, 0.094);
  contemporaryPlant.scale.set(0.171, 2.362, 0);
  contemporaryL.add(contemporaryPlant);
  // TControl(contemporaryPlant,"P")

  //===================================================== CONTEPORARY Ball 1
  const contemporaryBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/ball1.png`
  );
  const contemporaryBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryBall = new THREE.Mesh(
    contemporaryBallGeo,
    contemporaryBallMat
  );
  contemporaryBall.position.set(-0.624, -0.269, 0.094);
  contemporaryBall.scale.set(0.062, 0.62, 0);
  contemporaryL.add(contemporaryBall);
  // TControl(contemporary,"P")

  //===================================================== CONTEPORARY Ball 1
  const contemporaryBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/ball2.png`
  );
  const contemporaryBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryBall2 = new THREE.Mesh(
    contemporaryBall2Geo,
    contemporaryBall2Mat
  );
  contemporaryBall2.position.set(1.38, -0.24, 0.094);
  contemporaryBall2.scale.set(0.05, 0.5, 0);
  contemporaryL.add(contemporaryBall2);
  // TControl(contemporaryBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const contemporaryHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/contemporary/${bgScene}/halfBall.png`
  );
  const contemporaryHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const contemporaryHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: contemporaryHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const contemporaryHalfBall = new THREE.Mesh(
    contemporaryHalfBallGeo,
    contemporaryHalfBallMat
  );
  contemporaryHalfBall.position.set(-1.17, -0.26, 0.094);
  contemporaryHalfBall.scale.set(0.05, 0.45, 0);
  contemporaryL.add(contemporaryHalfBall);
  // TControl(contemporaryHalfBall, "P");
  /*
  _____ ______   ___  ________   ___  _____ ______   ________  ___       ___  ________  _________   
 |\   _ \  _   \|\  \|\   ___  \|\  \|\   _ \  _   \|\   __  \|\  \     |\  \|\   ____\|\___   ___\ 
 \ \  \\\__\ \  \ \  \ \  \\ \  \ \  \ \  \\\__\ \  \ \  \|\  \ \  \    \ \  \ \  \___|\|___ \  \_| 
  \ \  \\|__| \  \ \  \ \  \\ \  \ \  \ \  \\|__| \  \ \   __  \ \  \    \ \  \ \_____  \   \ \  \  
   \ \  \    \ \  \ \  \ \  \\ \  \ \  \ \  \    \ \  \ \  \ \  \ \  \____\ \  \|____|\  \   \ \  \ 
    \ \__\    \ \__\ \__\ \__\\ \__\ \__\ \__\    \ \__\ \__\ \__\ \_______\ \__\____\_\  \   \ \__\
     \|__|     \|__|\|__|\|__| \|__|\|__|\|__|     \|__|\|__|\|__|\|_______|\|__|\_________\   \|__|
                                                                                \|_________|        
*/
  //===================================================== CONTEPORARY PODIUM
  minimalistL = new THREE.Group();
  const minimalistPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/shadowPodium.png`
  );
  const minimalistPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const minimalistPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistPodium = new THREE.Mesh(
    minimalistPodiumGeo,
    minimalistPodiumMat
  );
  minimalistPodium.position.set(-0.455, -0.451, 0);
  minimalistL.add(minimalistPodium);
  // TControl(minimalistPodium)

  //===================================================== CONTEPORARY CHAIR
  const minimalistChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/armchair.png`
  );
  const minimalistChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistChair = new THREE.Mesh(
    minimalistChairGeo,
    minimalistChairMat
  );
  minimalistChair.position.set(-0.23, 0.01, 0.02);
  minimalistChair.scale.set(0.2, 1.84, 0);
  minimalistL.add(minimalistChair);
  // TControl(minimalistChair,"P")

  //===================================================== CONTEPORARY LAMP
  const minimalistLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/lamp.png`
  );
  const minimalistLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistLamp = new THREE.Mesh(minimalistLampGeo, minimalistLampMat);
  minimalistLamp.position.set(0.46, 0.29, 0.04);
  minimalistLamp.scale.set(0.1, 2.6, 0);
  minimalistL.add(minimalistLamp);
  // TControl(minimalistLamp,"P")

  //===================================================== CONTEPORARY DESK
  const minimalistDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/desk.png`
  );
  const minimalistDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistDesk = new THREE.Mesh(minimalistDeskGeo, minimalistDeskMat);
  minimalistDesk.position.set(0.86, 0.15, 0.06);
  minimalistDesk.scale.set(0.13, 2.18, 0);
  minimalistL.add(minimalistDesk);
  // TControl(minimalistDesk,"P")

  //===================================================== CONTEPORARY Plant
  const minimalistPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/plant.png`
  );
  const minimalistPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistPlant = new THREE.Mesh(
    minimalistPlantGeo,
    minimalistPlantMat
  );
  minimalistPlant.position.set(-0.81, 0.28, 0.09);
  minimalistPlant.scale.set(0.18, 2.6, 0);
  minimalistL.add(minimalistPlant);
  // TControl(minimalistPlant,"P")

  //===================================================== CONTEPORARY Ball 1
  const minimalistBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/ball1.png`
  );
  const minimalistBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistBall = new THREE.Mesh(minimalistBallGeo, minimalistBallMat);
  minimalistBall.position.set(-1.18, -0.26, 0.094);
  minimalistBall.scale.set(0.055, 0.55, 0);
  minimalistL.add(minimalistBall);
  // TControl(minimalistBall,"P")

  //===================================================== CONTEPORARY Ball 1
  const minimalistBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/ball2.png`
  );
  const minimalistBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistBall2 = new THREE.Mesh(
    minimalistBall2Geo,
    minimalistBall2Mat
  );
  minimalistBall2.position.set(0.32, -0.34, 0.094);
  minimalistBall2.scale.set(0.04, 0.4, 0);
  minimalistL.add(minimalistBall2);
  // TControl(minimalistBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const minimalistHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/minimalist/${bgScene}/halfBall.png`
  );
  const minimalistHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const minimalistHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: minimalistHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const minimalistHalfBall = new THREE.Mesh(
    minimalistHalfBallGeo,
    minimalistHalfBallMat
  );
  minimalistHalfBall.position.set(1.28, -0.26, 0.09);
  minimalistHalfBall.scale.set(0.07, 0.585, 0);
  minimalistL.add(minimalistHalfBall);
  // TControl(minimalistHalfBall, "P");

  /*_____ ______   ________  ________  _______   ________  ________      
 |\   _ \  _   \|\   __  \|\   ___ \|\  ___ \ |\   __  \|\   ___  \    
 \ \  \\\__\ \  \ \  \|\  \ \  \_|\ \ \   __/|\ \  \|\  \ \  \\ \  \   
  \ \  \\|__| \  \ \  \\\  \ \  \ \\ \ \  \_|/_\ \   _  _\ \  \\ \  \  
   \ \  \    \ \  \ \  \\\  \ \  \_\\ \ \  \_|\ \ \  \\  \\ \  \\ \  \ 
    \ \__\    \ \__\ \_______\ \_______\ \_______\ \__\\ _\\ \__\\ \__\
     \|__|     \|__|\|_______|\|_______|\|_______|\|__|\|__|\|__| \|__|
*/
  //===================================================== CONTEPORARY PODIUM
  modernL = new THREE.Group();
  const modernPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/shadowPodium.png`
  );
  const modernPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const modernPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernPodium = new THREE.Mesh(modernPodiumGeo, modernPodiumMat);
  modernPodium.position.set(-0.455, -0.451, 0);
  modernL.add(modernPodium);
  // TControl(modernPodium)

  //===================================================== CONTEPORARY CHAIR
  const modernChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/armchair.png`
  );
  const modernChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernChair = new THREE.Mesh(modernChairGeo, modernChairMat);
  modernChair.position.set(0.03, 0.03, 0.02);
  modernChair.scale.set(0.2, 1.84, 0);
  modernL.add(modernChair);
  // TControl(modernChair,"P")

  //===================================================== CONTEPORARY LAMP
  const modernLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/lamp.png`
  );
  const modernLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernLamp = new THREE.Mesh(modernLampGeo, modernLampMat);
  modernLamp.position.set(-0.47, 0.27, 0.04);
  modernLamp.scale.set(0.1, 2.6, 0);
  modernL.add(modernLamp);
  // TControl(modernLamp,"P")

  //===================================================== CONTEPORARY DESK
  const modernDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/desk.png`
  );
  const modernDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernDesk = new THREE.Mesh(modernDeskGeo, modernDeskMat);
  modernDesk.position.set(0.9, -0.02, 0.06);
  modernDesk.scale.set(0.11, 1.6, 0);
  modernL.add(modernDesk);
  // TControl(modernDesk,"P")

  //===================================================== CONTEPORARY Plant
  const modernPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/plant.png`
  );
  const modernPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernPlant = new THREE.Mesh(modernPlantGeo, modernPlantMat);
  modernPlant.position.set(-1.05, 0.28, 0.09);
  modernPlant.scale.set(0.18, 2.6, 0);
  modernL.add(modernPlant);
  // TControl(modernPlant,"P")

  //===================================================== CONTEPORARY Ball 2
  const modernBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/ball2.png`
  );
  const modernBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernBall2 = new THREE.Mesh(modernBall2Geo, modernBall2Mat);
  modernBall2.position.set(1.3, -0.25, 0.094);
  modernBall2.scale.set(0.04, 0.4, 0);
  modernL.add(modernBall2);
  // TControl(modernBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const modernHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/modern/${bgScene}/halfBall.png`
  );
  const modernHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const modernHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: modernHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const modernHalfBall = new THREE.Mesh(modernHalfBallGeo, modernHalfBallMat);
  modernHalfBall.position.set(-0.62, -0.3, 0.09);
  modernHalfBall.scale.set(0.058, 0.5, 0);
  modernL.add(modernHalfBall);
  // TControl(modernHalfBall, "P");

  /*
  ________  ________  ________  ________   ________  ___  ________   ________  ___      ___ ___  ________  ________      
 |\   ____\|\   ____\|\   __  \|\   ___  \|\   ___ \|\  \|\   ___  \|\   __  \|\  \    /  /|\  \|\   __  \|\   ___  \    
 \ \  \___|\ \  \___|\ \  \|\  \ \  \\ \  \ \  \_|\ \ \  \ \  \\ \  \ \  \|\  \ \  \  /  / | \  \ \  \|\  \ \  \\ \  \   
  \ \_____  \ \  \    \ \   __  \ \  \\ \  \ \  \ \\ \ \  \ \  \\ \  \ \   __  \ \  \/  / / \ \  \ \   __  \ \  \\ \  \  
   \|____|\  \ \  \____\ \  \ \  \ \  \\ \  \ \  \_\\ \ \  \ \  \\ \  \ \  \ \  \ \    / /   \ \  \ \  \ \  \ \  \\ \  \ 
     ____\_\  \ \_______\ \__\ \__\ \__\\ \__\ \_______\ \__\ \__\\ \__\ \__\ \__\ \__/ /     \ \__\ \__\ \__\ \__\\ \__\
    |\_________\|_______|\|__|\|__|\|__| \|__|\|_______|\|__|\|__| \|__|\|__|\|__|\|__|/       \|__|\|__|\|__|\|__| \|__|
    \|_________|                                                                                                         
*/
  //===================================================== CONTEPORARY PODIUM
  scandinavianL = new THREE.Group();
  const scandinavianPodiumTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/shadowPodium.png`
  );
  const scandinavianPodiumGeo = new THREE.BoxGeometry(6, 0.5, 0);
  const scandinavianPodiumMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianPodiumTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianPodium = new THREE.Mesh(
    scandinavianPodiumGeo,
    scandinavianPodiumMat
  );
  scandinavianPodium.position.set(-0.455, -0.451, 0);
  scandinavianL.add(scandinavianPodium);
  // TControl(scandinavianPodium)

  //===================================================== CONTEPORARY CHAIR
  const scandinavianChairTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/armchair.png`
  );
  const scandinavianChairGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianChairMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianChairTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianChair = new THREE.Mesh(
    scandinavianChairGeo,
    scandinavianChairMat
  );
  scandinavianChair.position.set(0.03, 0.03, 0.02);
  scandinavianChair.scale.set(0.2, 1.84, 0);
  scandinavianL.add(scandinavianChair);
  // TControl(scandinavianChair,"P")

  //===================================================== CONTEPORARY LAMP
  const scandinavianLampTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/lamp.png`
  );
  const scandinavianLampGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianLampMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianLampTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianLamp = new THREE.Mesh(
    scandinavianLampGeo,
    scandinavianLampMat
  );
  scandinavianLamp.position.set(0.63, 0.28, 0.04);
  scandinavianLamp.scale.set(0.1, 2.6, 0);
  scandinavianL.add(scandinavianLamp);
  // TControl(scandinavianLamp,"P")

  //===================================================== CONTEPORARY DESK
  const scandinavianDeskTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/desk.png`
  );
  const scandinavianDeskGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianDeskMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianDeskTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianDesk = new THREE.Mesh(
    scandinavianDeskGeo,
    scandinavianDeskMat
  );
  scandinavianDesk.position.set(-0.82, 0.31, 0.06);
  scandinavianDesk.scale.set(0.13, 2.7, 0);
  scandinavianL.add(scandinavianDesk);
  // TControl(scandinavianDesk,"P")

  //===================================================== CONTEPORARY Plant
  const scandinavianPlantTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/plant.png`
  );
  const scandinavianPlantGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianPlantMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianPlantTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianPlant = new THREE.Mesh(
    scandinavianPlantGeo,
    scandinavianPlantMat
  );
  scandinavianPlant.position.set(1.05, 0.28, 0.09);
  scandinavianPlant.scale.set(0.18, 2.48, 0);
  scandinavianL.add(scandinavianPlant);
  // TControl(scandinavianPlant,"S")

  //===================================================== CONTEPORARY Ball 2
  const scandinavianBall2Texture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/ball2.png`
  );
  const scandinavianBall2Geo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianBall2Mat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianBall2Texture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianBall2 = new THREE.Mesh(
    scandinavianBall2Geo,
    scandinavianBall2Mat
  );
  scandinavianBall2.position.set(-1.21, -0.25, 0.094);
  scandinavianBall2.scale.set(0.04, 0.4, 0);
  scandinavianL.add(scandinavianBall2);
  // TControl(scandinavianBall2, "P");

  //===================================================== CONTEPORARY Half Ball
  const scandinavianHalfBallTexture = new THREE.TextureLoader().load(
    `https://cdn.jsdelivr.net/gh/mgohar/vistaHeroSection_anim@0.0.3/src/assets/images/scandinavian/${bgScene}/halfBall.png`
  );
  const scandinavianHalfBallGeo = new THREE.BoxGeometry(5, 0.5, 0);
  const scandinavianHalfBallMat = new THREE.ShaderMaterial({
    uniforms: {
      cityTexture: { value: scandinavianHalfBallTexture },
      opacity: { value: 1 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
  });
  const scandinavianHalfBall = new THREE.Mesh(
    scandinavianHalfBallGeo,
    scandinavianHalfBallMat
  );
  scandinavianHalfBall.position.set(1.33, -0.22, 0.09);
  scandinavianHalfBall.scale.set(0.058, 0.5, 0);
  scandinavianL.add(scandinavianHalfBall);
  // TControl(scandinavianHalfBall, "P");

  scene.add(contemporaryL);
  contemporaryL.position.set(-0.05, -0.56, 0);

  minimalistL.position.set(-5.33, -0.92, -5.25);
  scene.add(minimalistL);

  modernL.position.set(0, 0.04, -15);
  scene.add(modernL);

  scandinavianL.position.set(5.2, -0.93, -5.25);
  scene.add(scandinavianL);

  contemporaryL.children.forEach((child) => {
    child.material.uniforms.opacity.value = 0;
  });
  minimalistL.children.forEach((child) => {
    child.material.uniforms.opacity.value = 0;
  });
  modernL.children.forEach((child) => {
    child.material.uniforms.opacity.value = 0;
  });
  scandinavianL.children.forEach((child) => {
    child.material.uniforms.opacity.value = 0;
  });
};

Init("without_light");
InitLight("with_light");

//===================================================== Move Next
const MoveNext = () => {
  if (activeScene < 3) {
    activeScene++;
  } else {
    activeScene = 0;
  }
  console.log("activeScene:", activeScene);
  gsap.to(contemporary.position, {
    x: minimalist.position.x,
    y: minimalist.position.y,
    z: minimalist.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(minimalist.position, {
    x: modern.position.x,
    y: modern.position.y,
    z: modern.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(modern.position, {
    x: scandinavian.position.x,
    y: scandinavian.position.y,
    z: scandinavian.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(scandinavian.position, {
    x: contemporary.position.x,
    y: contemporary.position.y,
    z: contemporary.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(contemporaryL.position, {
    x: minimalistL.position.x,
    y: minimalistL.position.y,
    z: minimalistL.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(minimalistL.position, {
    x: modernL.position.x,
    y: modernL.position.y,
    z: modernL.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(modernL.position, {
    x: scandinavianL.position.x,
    y: scandinavianL.position.y,
    z: scandinavianL.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(scandinavianL.position, {
    x: contemporaryL.position.x,
    y: contemporaryL.position.y,
    z: contemporaryL.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
};
const MovePref = () => {
  gsap.to(elem1.position, {
    x: elem4.position.x,
    y: elem4.position.y,
    z: elem4.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(elem2.position, {
    x: elem1.position.x,
    y: elem1.position.y,
    z: elem1.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(elem3.position, {
    x: elem2.position.x,
    y: elem2.position.y,
    z: elem2.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
  gsap.to(elem4.position, {
    x: elem3.position.x,
    y: elem3.position.y,
    z: elem3.position.z,
    duration: 1,
    ease: "power1.inOut",
  });
};
let prevData = [];
const ElivateObjects = (
  name,
  ElemGroup,
  indexOfElem,
  y = ElemGroup.children[indexOfElem]?.position.y,
  duration = 1,
  rotate = 0,
  x = ElemGroup.children[indexOfElem]?.position.x,
  ease = "power1.out"
) => {
  let isdataExist = prevData.filter((v) => {
    return v.name == name ? 1 : 0;
  });
  if (isdataExist == 0) {
    prevData.push({
      name: name,
      y: ElemGroup.children[indexOfElem]?.position?.y,
      elem: ElemGroup.children[indexOfElem],
    });
  }
  if (ElemGroup.children[indexOfElem]?.position)
    gsap.to(ElemGroup.children[indexOfElem]?.position, {
      x,
      y,
      duration: duration,
      ease: "power1.out",
    });
  if (rotate != 0) {
    gsap.to(ElemGroup.children[indexOfElem].rotation, {
      z: rotate,
      duration: duration,
      ease: "power1.out",
    });
  }
};
const DeElivateObjects = (name, duration, ease = "power1.out") => {
  let isdataExist = prevData.filter((v) => {
    return v.name == name ? v : null;
  });
  if (isdataExist[0]?.elem) {
    let elem = isdataExist[0];
    if (isdataExist[0].elem)
      gsap.to(elem.elem.position, {
        y: elem.y,
        duration,
        ease: "power1.out",
      });
    gsap.to(elem.elem.rotation, {
      z: 0,
      duration,
      ease: "power1.out",
    });
  }
};
activeScene = 0;

// setInterval(() => {
//   MoveNext();
// }, 5000);
let nextbtn = document.querySelector(".next");
let prevbtn = document.querySelector(".prev");
nextbtn.addEventListener("click", () => {
  setTimeout(() => {
    prevData = [];
    MoveNext();
  }, 300);
});
prevbtn.addEventListener("click", () => {
  setTimeout(() => {
    prevData = [];
    MovePref();
  }, 300);
});
//===================================================== Move Pref

const ActiveBoxGeo = new THREE.BoxGeometry(2.8, 1.65, 0.1);
const ActiveBoxMat = new THREE.MeshBasicMaterial({
  color: "red",
  transparent: true,
  opacity: 0,
});
const ActiveBox = new THREE.Mesh(ActiveBoxGeo, ActiveBoxMat);
ActiveBox.position.set(0, -0.32, 0.5);
ActiveBox.scale.set(0.9, 0.71);
scene.add(ActiveBox);

let lightScenes = [contemporaryL, scandinavianL, modernL, minimalistL];

let witoutLightScenes = [contemporary, scandinavian, modern, minimalist];
window.addEventListener("mousemove", function (event) {
  var mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(ActiveBox, true);

  if (intersects.length > 0) {
    lightScenes[activeScene].children.forEach((child) => {
      gsap.to(child.material.uniforms.opacity, {
        value: 1,
        duration: 0.8,
      });
    });
    ElivateObjects("ball1", witoutLightScenes[activeScene], 5, 0.3, 0.8);
    ElivateObjects("bitBall", witoutLightScenes[activeScene], 6, 0.5, 1.3);
    ElivateObjects("halfball", witoutLightScenes[activeScene], 7, 0.2, 1.5);
    // ElivateObjects("desk", witoutLightScenes[activeScene], 3, 0.5, 1.4, 0.2);
    ElivateObjects("plant", witoutLightScenes[activeScene], 4, 0.5, 1.2, 0.1);

    ElivateObjects("ball1L", lightScenes[activeScene], 5, 0.3, 0.8);
    ElivateObjects("bitBallL", lightScenes[activeScene], 6, 0.5, 1.3);
    ElivateObjects("halfballL", lightScenes[activeScene], 7, 0.2, 1.5);
    // ElivateObjects("deskL", lightScenes[activeScene], 3, 0.5, 1.4, 0.2);
    ElivateObjects("plantL", lightScenes[activeScene], 4, 0.5, 1.2, 0.1);
  } else {
    console.log("de");
    DeElivateObjects("ball1", 0.8);
    DeElivateObjects("bitBall", 0.8);
    DeElivateObjects("halfball", 0.8);
    // DeElivateObjects("desk", 0.8);
    DeElivateObjects("plant", 0.8);

    DeElivateObjects("ball1L", 0.8);
    DeElivateObjects("bitBallL", 0.8);
    DeElivateObjects("halfballL", 0.8);
    // DeElivateObjects("deskL", 0.8);
    DeElivateObjects("plantL", 0.8);
    lightScenes[activeScene].children.forEach((child) => {
      gsap.to(child.material.uniforms.opacity, {
        value: 0,
        duration: 0.8,
      });
    });
  }
});

const raycaster2 = new THREE.Raycaster();
const mouse2 = new THREE.Vector2();

// Add a click event listener to the renderer's domElement
renderer.domElement.addEventListener("click", onClick);
let back = document.querySelector(".back");
back.style.display="none"
function onClick(event) {
  // Calculate mouse2 coordinates
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  // Set the mouse2 position
  mouse2.set(x, y);

  // Cast a ray from the camera through the mouse2 position
  raycaster2.setFromCamera(mouse2, camera);

  // Find intersections with the cube
  const intersects = raycaster2.intersectObject(ActiveBox);

  if (intersects.length > 0) {
    // The mouse2 click intersects with the cube
    // You can call your function here
    back.style.display="flex"
    gsap.to(witoutLightScenes[activeScene].position, {z: 2.3,x:0.8,duration: 1,});
    gsap.to(lightScenes[activeScene].position, {z: 2.3,x:0.8,duration: 1,});
    gsap.to(camera.position, {z: 6,duration: 1,});
  }
}


back.addEventListener("click",()=>{
  back.style.display="none"
    gsap.to(witoutLightScenes[activeScene].position, {z: 0,x:-0,duration: 1,});
    gsap.to(lightScenes[activeScene].position, {z: 0,x:-0,duration: 1,});
    gsap.to(camera.position, {z: 4.5,duration: 1,});
})