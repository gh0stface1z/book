import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


/* =========================================
   CENA
========================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x171412);


/* =========================================
   CÂMERA
========================================= */

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(
  5,
  4,
  6
);


/* =========================================
   RENDER
========================================= */

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

document
  .getElementById("scene")
  .appendChild(renderer.domElement);


/* =========================================
   CÂMERA COM MOUSE
========================================= */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

controls.target.set(
  0,
  0,
  0
);

controls.update();


/* =========================================
   LUZ
========================================= */

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x443322,
    3
  )
);


const light =
  new THREE.DirectionalLight(
    0xffffff,
    4
  );

light.position.set(
  5,
  8,
  6
);

scene.add(light);


/* =========================================
   GRUPO CENTRAL
========================================= */

const grupo = new THREE.Group();

scene.add(grupo);


/* =========================================
   CAIXA
========================================= */

const loader = new GLTFLoader();

loader.load(

  "./caixa.glb",

  (gltf) => {

    const caixa = gltf.scene;

    grupo.add(caixa);


    /*
      CENTRO REAL do seu arquivo.

      Eu medi o GLB:
      X ≈ 34.0247
      Y ≈ -0.6852
      Z ≈ 1.3798
    */

    caixa.position.set(
      -34.0247,
      0.6852,
      -1.3798
    );


    /*
      Amplia o grupo inteiro.
    */

    grupo.scale.setScalar(2.4);


    /*
      Só para garantir que os
      materiais apareçam corretamente.
    */

    caixa.traverse((objeto) => {

      if (objeto.isMesh) {

        objeto.material.side =
          THREE.DoubleSide;

        objeto.material.needsUpdate =
          true;

      }

    });


    console.log(
      "CAIXA CARREGADA",
      caixa
    );

  },

  (xhr) => {

    if (xhr.total) {

      console.log(
        Math.round(
          xhr.loaded /
          xhr.total *
          100
        ) + "%"
      );

    }

  },

  (erro) => {

    console.error(
      "ERRO NO GLB:",
      erro
    );

  }

);


/* =========================================
   LOOP
========================================= */

function animate() {

  requestAnimationFrame(
    animate
  );

  controls.update();

  renderer.render(
    scene,
    camera
  );

}

animate();


/* =========================================
   RESPONSIVO
========================================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);
