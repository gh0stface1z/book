import * as THREE from "three";

import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";


/* =========================================
   CENA
========================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xc9b7aa);


/* =========================================
   CÂMERA
========================================= */

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(
  5.5,
  3.4,
  7.2
);

camera.lookAt(
  0,
  0.6,
  0
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

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

document
  .getElementById("scene")
  .appendChild(renderer.domElement);


/* =========================================
   LUZ AMBIENTE
========================================= */

const ambient =
  new THREE.HemisphereLight(
    0xfff3e6,
    0x7a6256,
    2.2
  );

scene.add(ambient);


/* =========================================
   LUZ PRINCIPAL
========================================= */

const mainLight =
  new THREE.DirectionalLight(
    0xffe2c2,
    3
  );

mainLight.position.set(
  4,
  7,
  5
);

mainLight.castShadow = true;

mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;

scene.add(mainLight);


/* =========================================
   LUZ QUENTE
========================================= */

const warmLight =
  new THREE.PointLight(
    0xffb276,
    18,
    14
  );

warmLight.position.set(
  -3,
  3,
  3
);

scene.add(warmLight);


/* =========================================
   CHÃO
========================================= */

const floorGeometry =
  new THREE.PlaneGeometry(
    10,
    10
  );

const floorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xb89473,
    roughness: 0.9
  });

const floor =
  new THREE.Mesh(
    floorGeometry,
    floorMaterial
  );

floor.rotation.x =
  -Math.PI / 2;

floor.position.y = -1.15;

floor.receiveShadow = true;

scene.add(floor);


/* =========================================
   PAREDE DO FUNDO
========================================= */

const wallBackGeometry =
  new THREE.PlaneGeometry(
    10,
    6
  );

const wallBackMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe7d8cf,
    roughness: 1
  });

const wallBack =
  new THREE.Mesh(
    wallBackGeometry,
    wallBackMaterial
  );

wallBack.position.set(
  0,
  1.85,
  -4.1
);

wallBack.receiveShadow = true;

scene.add(wallBack);


/* =========================================
   PAREDE LATERAL
========================================= */

const wallSideGeometry =
  new THREE.PlaneGeometry(
    10,
    6
  );

const wallSideMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xd7c2b6,
    roughness: 1
  });

const wallSide =
  new THREE.Mesh(
    wallSideGeometry,
    wallSideMaterial
  );

wallSide.rotation.y =
  Math.PI / 2;

wallSide.position.set(
  -4.1,
  1.85,
  0
);

wallSide.receiveShadow = true;

scene.add(wallSide);


/* =========================================
   RODAPÉ DO FUNDO
========================================= */

const baseboardBack =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      8.2,
      0.14,
      0.12
    ),
    new THREE.MeshStandardMaterial({
      color: 0xf1e7df
    })
  );

baseboardBack.position.set(
  0,
  -1.07,
  -4
);

scene.add(baseboardBack);


/* =========================================
   RODAPÉ LATERAL
========================================= */

const baseboardSide =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.12,
      0.14,
      8.2
    ),
    new THREE.MeshStandardMaterial({
      color: 0xf1e7df
    })
  );

baseboardSide.position.set(
  -4,
  -1.07,
  0
);

scene.add(baseboardSide);


/* =========================================
   TAPETE
========================================= */

const rugGeometry =
  new THREE.PlaneGeometry(
    4.8,
    3.3
  );

const rugMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xbfa8b6,
    roughness: 1
  });

const rug =
  new THREE.Mesh(
    rugGeometry,
    rugMaterial
  );

rug.rotation.x =
  -Math.PI / 2;

rug.position.set(
  0.4,
  -1.135,
  0.3
);

rug.receiveShadow = true;

scene.add(rug);


/* =========================================
   CAIXA
========================================= */

const grupoCaixa =
  new THREE.Group();

scene.add(grupoCaixa);

let caixa = null;

let tampa = null;

let papel = null;

let prego = null;


const loader =
  new GLTFLoader();


loader.load(

  "./caixa.glb",

  (gltf) => {

    caixa = gltf.scene;

    grupoCaixa.add(caixa);


    /* =====================================
       POSIÇÃO ORIGINAL DO ARQUIVO
    ===================================== */

    caixa.position.set(
      -34.0247,
      0.6852,
      -1.3798
    );


    /* =====================================
       TAMANHO
    ===================================== */

    grupoCaixa.scale.setScalar(
      2.15
    );


    /* =====================================
       POSIÇÃO NO CENÁRIO
    ===================================== */

    grupoCaixa.position.set(
      0.5,
      -0.75,
      0.2
    );


    /* =====================================
       LEVE ROTAÇÃO
    ===================================== */

    grupoCaixa.rotation.y =
      -0.18;


    /* =====================================
       IDENTIFICAR PEÇAS
    ===================================== */

    caixa.traverse((objeto) => {

      if (!objeto.isMesh) {
        return;
      }


      objeto.castShadow = true;
      objeto.receiveShadow = true;


      if (objeto.material) {

        if (
          Array.isArray(
            objeto.material
          )
        ) {

          objeto.material.forEach(
            (material) => {

              material.side =
                THREE.DoubleSide;

              material.needsUpdate =
                true;

            }
          );

        } else {

          objeto.material.side =
            THREE.DoubleSide;

          objeto.material.needsUpdate =
            true;

        }

      }


      if (
        objeto.name.startsWith(
          "Cube_036"
        )
      ) {

        tampa = objeto;

      }


      if (
        objeto.name.startsWith(
          "Cube_064"
        )
      ) {

        papel = objeto;

        papel.visible = false;

      }


      if (
        objeto.name.startsWith(
          "Cube_063"
        )
      ) {

        prego = objeto;

        prego.visible = false;

      }

    });

  },

  undefined,

  (erro) => {

    console.error(
      "Erro carregando caixa:",
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
