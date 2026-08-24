import * as THREE from "three";

import { GLTFLoader }
from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls }
from "three/addons/controls/OrbitControls.js";


/* =========================
   CENA
========================= */

const scene = new THREE.Scene();


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
  4,
  3,
  5
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
controls.maxDistance = 8;

controls.maxPolarAngle =
  Math.PI / 2.05;

controls.target.set(
  0,
  0.4,
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
   LUZ QUENTE
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

const box = new THREE.Box3().setFromObject(caixa);

const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());

// centraliza a caixa
caixa.position.sub(center);

// recalcula depois de centralizar
const maxDim = Math.max(size.x, size.y, size.z);

// tamanho visual que queremos
const targetSize = 4;

const scale = targetSize / maxDim;

caixa.scale.setScalar(scale);

// recalcula o tamanho FINAL
const finalBox = new THREE.Box3().setFromObject(caixa);
const finalSize = finalBox.getSize(new THREE.Vector3());

// câmera posicionada de acordo com o tamanho real
const distance =
  Math.max(finalSize.x, finalSize.y, finalSize.z) * 1.8;

camera.position.set(
  distance * 0.8,
  distance * 0.55,
  distance
);

controls.target.set(
  0,
  0,
  0
);

controls.update();


/* =========================
   CARREGAR CAIXA
========================= */

const loader =
  new GLTFLoader();

let caixa = null;
let tampa = null;

let caixaAberta = false;


loader.load(

  "./caixa.glb",

  (gltf) => {

    caixa = gltf.scene;

    scene.add(caixa);


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
       MEDIR MODELO
    ========================= */

    const box =
      new THREE.Box3()
        .setFromObject(caixa);

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    const center =
      box.getCenter(
        new THREE.Vector3()
      );


    console.log(
      "Tamanho original:",
      size
    );

    console.log(
      "Centro original:",
      center
    );


    /* =========================
       CENTRALIZAR
    ========================= */

    caixa.position.set(
      -center.x,
      -center.y,
      -center.z
    );


    /* =========================
       ESCALA AUTOMÁTICA
    ========================= */

    const maiorLado =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    const tamanhoDesejado = 4;

    const escala =
      tamanhoDesejado /
      maiorLado;

    caixa.scale.setScalar(
      escala
    );


    /* =========================
       COLOCAR SOBRE O CHÃO
    ========================= */

    const boxDepois =
      new THREE.Box3()
        .setFromObject(caixa);

    const minY =
      boxDepois.min.y;

    caixa.position.y +=
      -0.6 - minY;


    /* =========================
       PROCURAR PEÇAS
    ========================= */

    caixa.traverse(
      (object) => {

        console.log(
          "Objeto da caixa:",
          object.name
        );

        if (
          object.name ===
          "Cube_064_2_0"
        ) {

          tampa = object;

          console.log(
            "Possível tampa encontrada:",
            tampa
          );

        }

      }
    );


    /* =========================
       AJUSTAR CÂMERA
    ========================= */

    controls.target.set(
      0,
      0.4,
      0
    );

    controls.update();

  },


  /* progresso */

  (xhr) => {

    if (xhr.total) {

      const porcentagem =
        (
          xhr.loaded /
          xhr.total
        ) * 100;

      console.log(
        "Carregando:",
        porcentagem.toFixed(0) + "%"
      );

    }

  },


  /* erro */

  (erro) => {

    console.error(
      "Erro carregando caixa:",
      erro
    );

  }

);


/* =========================
   RAYCAST
========================= */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


/* =========================
   CLIQUE
========================= */

renderer.domElement
  .addEventListener(
    "click",
    (event) => {

      if (!caixa) {
        return;
      }


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


      const meshes = [];


      caixa.traverse(
        (object) => {

          if (object.isMesh) {

            meshes.push(
              object
            );

          }

        }
      );


      const hits =
        raycaster.intersectObjects(
          meshes,
          true
        );


      if (
        hits.length > 0
      ) {

        console.log(
          "Clicou em:",
          hits[0].object.name
        );

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
     ANIMAR TAMPA
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
   RESPONSIVO
========================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera
      .updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);
