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
  45,
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
   CONTROLES
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

controls.minDistance = 3;
controls.maxDistance = 10;


/* =====================================================
   LUZES
===================================================== */

const ambient = new THREE.AmbientLight(
  0xfff3e2,
  2.5
);

scene.add(ambient);


const principal = new THREE.DirectionalLight(
  0xffe5c4,
  4
);

principal.position.set(
  4,
  6,
  5
);

principal.castShadow = true;

scene.add(principal);


const luzQuente = new THREE.PointLight(
  0xffa65c,
  10,
  12
);

luzQuente.position.set(
  -4,
  3,
  4
);

scene.add(luzQuente);


/* =====================================================
   GRUPO DA CAIXA

   Em vez de mover a cena inteira,
   colocamos o modelo aqui dentro.
===================================================== */

const grupoCaixa = new THREE.Group();

scene.add(grupoCaixa);


/* =====================================================
   VARIÁVEIS
===================================================== */

let caixa = null;
let tampa = null;

let caixaAberta = false;


/* =====================================================
   CARREGAR MODELO
===================================================== */

const loader = new GLTFLoader();


loader.load(

  "./caixa.glb",

  (gltf) => {

    caixa = gltf.scene;

    grupoCaixa.add(caixa);


    /* ---------------------------------------------
       ATUALIZAR MATRIZES
    --------------------------------------------- */

    caixa.updateMatrixWorld(true);


    /* ---------------------------------------------
       DESCOBRIR LIMITES ORIGINAIS
    --------------------------------------------- */

    let box =
      new THREE.Box3()
        .setFromObject(caixa);

    const center =
      box.getCenter(
        new THREE.Vector3()
      );


    console.log(
      "Centro original:",
      center
    );


    /*
      O seu modelo veio longe do ponto 0.
      Isso traz a geometria de volta.
    */

    caixa.position.x -= center.x;
    caixa.position.y -= center.y;
    caixa.position.z -= center.z;


    caixa.updateMatrixWorld(true);


    /* ---------------------------------------------
       MEDIR DE NOVO
    --------------------------------------------- */

    box =
      new THREE.Box3()
        .setFromObject(caixa);

    const size =
      box.getSize(
        new THREE.Vector3()
      );


    console.log(
      "Tamanho:",
      size
    );


    /* ---------------------------------------------
       ESCALA AUTOMÁTICA

       Queremos a maior dimensão
       com aproximadamente 4 unidades.
    --------------------------------------------- */

    const maiorLado =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    const escala =
      4 / maiorLado;


    grupoCaixa.scale.setScalar(
      escala
    );


    grupoCaixa.updateMatrixWorld(true);


    /* ---------------------------------------------
       SOMBRAS
    --------------------------------------------- */

    caixa.traverse((objeto) => {

      if (objeto.isMesh) {

        objeto.castShadow = true;
        objeto.receiveShadow = true;

      }

    });


    /* ---------------------------------------------
       PROCURAR TAMPA
    --------------------------------------------- */

    caixa.traverse((objeto) => {

      if (objeto.isMesh) {

        console.log(
          "PEÇA:",
          objeto.name
        );

      }


      if (
        objeto.name ===
        "Cube_064_2_0"
      ) {

        tampa = objeto;

        console.log(
          "Possível tampa:",
          tampa
        );

      }

    });


    /* ---------------------------------------------
       POSIÇÃO DA CÂMERA

       Vista diagonal para mostrar
       que a caixa é 3D.
    --------------------------------------------- */

    camera.position.set(
      5,
      3.5,
      6
    );


    controls.target.set(
      0,
      0,
      0
    );


    controls.update();


    console.log(
      "CAIXA CARREGADA!"
    );

  },


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


  (erro) => {

    console.error(
      "ERRO AO CARREGAR:",
      erro
    );

  }

);


/* =====================================================
   CLIQUE
===================================================== */

const raycaster =
  new THREE.Raycaster();

const pointer =
  new THREE.Vector2();


renderer.domElement.addEventListener(
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


    const meshes = [];


    caixa.traverse((objeto) => {

      if (objeto.isMesh) {

        meshes.push(objeto);

      }

    });


    const hits =
      raycaster.intersectObjects(
        meshes,
        true
      );


    if (hits.length > 0) {

      console.log(
        "Clicou em:",
        hits[0].object.name
      );

      caixaAberta =
        !caixaAberta;

    }

  }
);


/* =====================================================
   ANIMAÇÃO
===================================================== */

function animate() {

  requestAnimationFrame(
    animate
  );


  controls.update();


  /*
    Por enquanto mantemos a tentativa
    de animação da tampa.

    Depois vamos acertar a dobradiça
    corretamente.
  */

  if (tampa) {

    const destino =
      caixaAberta
        ? -Math.PI * 0.55
        : 0;


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
