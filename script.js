import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";


/* =====================================================
   CENA
===================================================== */

const scene = new THREE.Scene();


/* =====================================================
   CÂMERA
===================================================== */

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);


/* =====================================================
   RENDER
===================================================== */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
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

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document
  .getElementById("scene")
  .appendChild(renderer.domElement);


/* =====================================================
   CONTROLE DA CÂMERA
===================================================== */

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

controls.dampingFactor = 0.06;

controls.enablePan = false;

controls.enableZoom = true;

controls.enableRotate = true;


/* =====================================================
   LUZ AMBIENTE
===================================================== */

const ambient = new THREE.AmbientLight(
  0xfff2df,
  2
);

scene.add(ambient);


/* =====================================================
   LUZ PRINCIPAL
===================================================== */

const mainLight =
  new THREE.DirectionalLight(
    0xffe6c6,
    3
  );

mainLight.position.set(
  4,
  6,
  5
);

mainLight.castShadow = true;

scene.add(mainLight);


/* =====================================================
   LUZ QUENTE
===================================================== */

const warmLight =
  new THREE.PointLight(
    0xffaa60,
    7,
    10
  );

warmLight.position.set(
  -3,
  3,
  3
);

scene.add(warmLight);


/* =====================================================
   VARIÁVEIS DA CAIXA
===================================================== */

let caixa = null;
let tampa = null;

let caixaAberta = false;


/* =====================================================
   CARREGADOR
===================================================== */

const loader =
  new GLTFLoader();


loader.load(

  "./caixa.glb",

  /* =============================
     MODELO CARREGADO
  ============================= */

  (gltf) => {

    caixa = gltf.scene;

    scene.add(caixa);


    /* =============================
       SOMBRAS
    ============================= */

    caixa.traverse((object) => {

      if (object.isMesh) {

        object.castShadow = true;
        object.receiveShadow = true;

      }

    });


    /* =============================
       MEDIR MODELO ORIGINAL
    ============================= */

    let box =
      new THREE.Box3()
        .setFromObject(caixa);

    const size =
      box.getSize(
        new THREE.Vector3()
      );


    console.log(
      "Tamanho original:",
      size
    );


    /* =============================
       ESCALA

       Aqui fazemos a caixa ter
       aproximadamente 4 unidades
       no maior lado.
    ============================= */

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


    /* =============================
       RECALCULAR DEPOIS DA ESCALA
    ============================= */

    box =
      new THREE.Box3()
        .setFromObject(caixa);

    const center =
      box.getCenter(
        new THREE.Vector3()
      );


    /* =============================
       CENTRALIZAR

       IMPORTANTE:
       centralizamos DEPOIS de
       redimensionar.
    ============================= */

    caixa.position.x -= center.x;
    caixa.position.y -= center.y;
    caixa.position.z -= center.z;


    /* =============================
       RECALCULAR CAIXA FINAL
    ============================= */

    box =
      new THREE.Box3()
        .setFromObject(caixa);

    const finalSize =
      box.getSize(
        new THREE.Vector3()
      );

    const finalCenter =
      box.getCenter(
        new THREE.Vector3()
      );


    console.log(
      "Tamanho final:",
      finalSize
    );


    /* =============================
       ENQUADRAR CÂMERA
    ============================= */

    enquadrarCaixa(
      finalSize,
      finalCenter
    );


    /* =============================
       PROCURAR TAMPA
    ============================= */

    caixa.traverse((object) => {

      if (object.isMesh) {

        console.log(
          "Peça:",
          object.name
        );

      }


      if (
        object.name ===
        "Cube_064_2_0"
      ) {

        tampa = object;

        console.log(
          "TAMPA ENCONTRADA:",
          tampa
        );

      }

    });

  },


  /* =============================
     PROGRESSO
  ============================= */

  (xhr) => {

    if (xhr.total) {

      const porcentagem =
        xhr.loaded /
        xhr.total *
        100;

      console.log(
        `Carregando: ${porcentagem.toFixed(0)}%`
      );

    }

  },


  /* =============================
     ERRO
  ============================= */

  (erro) => {

    console.error(
      "Erro carregando caixa:",
      erro
    );

  }

);


/* =====================================================
   FUNÇÃO QUE APROXIMA A CÂMERA
===================================================== */

function enquadrarCaixa(
  size,
  center
) {

  /*
    Calcula uma distância de câmera
    baseada no tamanho REAL do modelo.
  */

  const altura =
    Math.max(
      size.y,
      0.1
    );

  const largura =
    Math.max(
      size.x,
      size.z
    );


  const fov =
    THREE.MathUtils.degToRad(
      camera.fov
    );


  const distanciaVertical =
    altura /
    (
      2 *
      Math.tan(fov / 2)
    );


  const distanciaHorizontal =
    largura /
    (
      2 *
      Math.tan(fov / 2)
    ) /
    camera.aspect;


  /*
    1.15 deixa uma pequena margem.
    Se quiser ainda MAIOR,
    reduza para 1.0.
  */

  const distancia =
    Math.max(
      distanciaVertical,
      distanciaHorizontal
    ) * 1.15;


  /*
    Vista levemente de cima,
    como uma caixa sobre uma mesa.
  */

  camera.position.set(
    center.x,
    center.y + size.y * 0.75,
    center.z + distancia
  );


  controls.target.copy(
    center
  );


  /*
    Limites do zoom.
  */

  controls.minDistance =
    distancia * 0.55;

  controls.maxDistance =
    distancia * 2.2;


  camera.near =
    Math.max(
      distancia / 100,
      0.01
    );

  camera.far =
    distancia * 100;

  camera.updateProjectionMatrix();

  controls.update();

}


/* =====================================================
   RAYCAST
===================================================== */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


/* =====================================================
   CLIQUE NA CAIXA
===================================================== */

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


/* =====================================================
   ABRIR / FECHAR
===================================================== */

function toggleCaixa() {

  caixaAberta =
    !caixaAberta;

}


/* =====================================================
   LOOP
===================================================== */

function animate() {

  requestAnimationFrame(
    animate
  );


  controls.update();


  /* =============================
     ANIMAÇÃO DA TAMPA
  ============================= */

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
      ) * 0.07;

  }


  renderer.render(
    scene,
    camera
  );

}


animate();


/* =====================================================
   RESPONSIVO
===================================================== */

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
