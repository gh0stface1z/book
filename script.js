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
   VARIÁVEIS DA CAIXA
========================================= */

let caixa = null;

let tampa = null;

let caixaAberta = false;


/* =========================================
   CAIXA
========================================= */

const loader = new GLTFLoader();

loader.load(

  "./caixa.glb",

  (gltf) => {

    caixa = gltf.scene;

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
      Materiais.
    */

    caixa.traverse((objeto) => {

      if (objeto.isMesh) {

        objeto.material.side =
          THREE.DoubleSide;

        objeto.material.needsUpdate =
          true;


        /*
          Mostra no console o nome
          de cada parte do modelo.
        */

        console.log(
          "PEÇA:",
          objeto.name
        );

      }


      /*
        ESTA é a peça que estamos
        testando como tampa.
      */

      if (
        objeto.name ===
        "Cube_036_8_0"
      ) {

        tampa = objeto;

        console.log(
          "TAMPA ENCONTRADA:",
          tampa
        );

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
   CLIQUE NA TAMPA
========================================= */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


renderer.domElement.addEventListener(
  "click",
  (event) => {

    /*
      Se a tampa ainda não carregou,
      não faz nada.
    */

    if (!tampa) {
      return;
    }


    /*
      Converte o clique do mouse
      para coordenadas do Three.js.
    */

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


    /*
      Verifica se clicamos
      especificamente na tampa.
    */

    const hits =
      raycaster.intersectObject(
        tampa,
        true
      );


    if (
      hits.length > 0
    ) {

      caixaAberta =
        !caixaAberta;


      console.log(
        caixaAberta
          ? "ABRINDO CAIXA"
          : "FECHANDO CAIXA"
      );

    }

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


  /* =====================================
     ANIMAÇÃO DA TAMPA
  ===================================== */

  if (tampa) {

    /*
      0 = posição fechada.
    */

    const fechada = 0;


    /*
      Aproximadamente 100 graus.
    */

    const aberta =
      -Math.PI * 0.55;


    const destino =
      caixaAberta
        ? aberta
        : fechada;


    /*
      Movimento suave.
    */

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
