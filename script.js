import * as THREE from "three";

import { GLTFLoader }
from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls }
from "three/addons/controls/OrbitControls.js";


/* =========================
   CENA
========================= */

const scene =
  new THREE.Scene();


/* =========================
   CÂMERA
========================= */

const camera =
  new THREE.PerspectiveCamera(
    40,
    window.innerWidth /
    window.innerHeight,
    0.1,
    100
  );

camera.position.set(
  3.5,
  2.5,
  4.5
);


/* =========================
   RENDER
========================= */

const renderer =
  new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.shadowMap.enabled = true;

document
  .getElementById("scene")
  .appendChild(
    renderer.domElement
  );


/* =========================
   CONTROLES
========================= */

const controls =
  new OrbitControls(
    camera,
    renderer.domElement
  );

controls.enableDamping = true;

controls.enablePan = false;

controls.minDistance = 3;
controls.maxDistance = 7;

controls.maxPolarAngle =
  Math.PI / 2.05;

controls.target.set(
  0,
  0.3,
  0
);


/* =========================
   LUZ AMBIENTE
========================= */

const ambient =
  new THREE.AmbientLight(
    0xfff4e5,
    1.8
  );

scene.add(ambient);


/* =========================
   LUZ PRINCIPAL
========================= */

const mainLight =
  new THREE.DirectionalLight(
    0xffe2b7,
    3
  );

mainLight.position.set(
  3,
  5,
  4
);

mainLight.castShadow = true;

scene.add(mainLight);


/* =========================
   LUZ QUENTE LATERAL
========================= */

const warmLight =
  new THREE.PointLight(
    0xffb36b,
    12,
    8
  );

warmLight.position.set(
  -2,
  2,
  2
);

scene.add(warmLight);


/* =========================
   CHÃO
========================= */

const floor =
  new THREE.Mesh(
    new THREE.CircleGeometry(
      4,
      64
    ),

    new THREE.MeshStandardMaterial({
      color: 0x15120f,
      roughness: 0.95
    })
  );

floor.rotation.x =
  -Math.PI / 2;

floor.position.y = -0.48;

floor.receiveShadow = true;

scene.add(floor);


/* =========================
   CARREGAR CAIXA
========================= */

const loader =
  new GLTFLoader();

let caixa;

let tampa;

let caixaAberta = false;

loader.load(

  "./caixa.glb",

  (gltf) => {

    caixa = gltf.scene;

    scene.add(caixa);


    /* =========================
       ESCALA
    ========================= */

    caixa.scale.setScalar(2);


    /* =========================
       CENTRALIZAR MODELO
    ========================= */

    const box =
      new THREE.Box3()
        .setFromObject(caixa);

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    caixa.position.x -=
      center.x * 2;

    caixa.position.z -=
      center.z * 2;


    /* =========================
       SOMBRAS
    ========================= */

    caixa.traverse(
      (object) => {

        if (object.isMesh) {

          object.castShadow = true;
          object.receiveShadow = true;

        }

      }
    );


    /* =========================
       PROCURAR TAMPA
    ========================= */

    caixa.traverse(
      (object) => {

        console.log(
          "Objeto:",
          object.name
        );

        if (
          object.name ===
          "Cube_064_2_0"
        ) {

          tampa = object;

          console.log(
            "Tampa encontrada!",
            tampa
          );

        }

      }
    );

  },

  undefined,

  (erro) => {

    console.error(
      "Erro carregando caixa:",
      erro
    );

  }

);


/* =========================
   CLIQUE
========================= */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


renderer.domElement
  .addEventListener(
    "click",
    (event) => {

      if (!caixa) return;


      pointer.x =
        (
          event.clientX /
          window.innerWidth
        ) * 2 - 1;

      pointer.y =
        -(
          event.clientY /
          window.innerHeight
        ) * 2 + 1;


      raycaster.setFromCamera(
        pointer,
        camera
      );


      const objects = [];

      caixa.traverse(
        (object) => {

          if (object.isMesh) {
            objects.push(object);
          }

        }
      );


      const hits =
        raycaster.intersectObjects(
          objects,
          true
        );


      if (hits.length > 0) {

        toggleCaixa();

      }

    }
  );


/* =========================
   ABRIR / FECHAR
========================= */

function toggleCaixa() {

  caixaAberta =
    !caixaAberta;

}


/* =========================
   ANIMAÇÃO
========================= */

function animate() {

  requestAnimationFrame(
    animate
  );


  controls.update();


  /* =========================
     TAMPA
  ========================= */

  if (tampa) {

    const fechada = 0;

    const aberta =
      -Math.PI * 0.55;


    const destino =
      caixaAberta
        ? aberta
        : fechada;


    tampa.rotation.z +=
      (
        destino -
        tampa.rotation.z
      ) * 0.06;

  }


  renderer.render(
    scene,
    camera
  );

}

animate();


/* =========================
   REDIMENSIONAR
========================= */

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
