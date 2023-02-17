import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

const img_list = ["assets/img/blocky_photo_studio_1k.jpg", "assets/img/dikhololo_night_1k.jpg", "assets/img/scene-sphere-outside.jpg", "assets/img/st_peters_square_night_1k.jpg"];

let scene, camera, renderer;
let cloakMaterial, cloakTexture;

let controller;

let reticle;

let hitTestSource = null;
let hitTestSourceRequested = false;

init();
animate();

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    let ambientLight = new THREE.AmbientLight(0xcccccc, 1.00);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));



    //Portal useful objects that don't need to be created on each select
    let loader = new THREE.TextureLoader();
    let sphereRadius = 0.2;
    let holeRadius = 0.1;
    let borderThickness = 0.01;

    let halfSphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32, Math.PI, Math.PI); // startAngle, sweepAngle

    let cloakTexture = loader.load("assets/img/color-grid.png");
    cloakMaterial = new THREE.MeshBasicMaterial({ map: cloakTexture, side: THREE.FrontSide, colorWrite: false }); // change colorWrite: true to see the cloak

    function onSelect() {
        if (reticle.visible) {

            /*
            //Inspiration
            const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
            const mesh = new THREE.Mesh(geometry, material);
            reticle.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
            mesh.scale.y = Math.random() * 2 + 1;
            scene.add(mesh);
            */

            //portal
            let halfSphereGroup = new THREE.Group();
            //halfSphereGroup.position.y = 1;

            let sceneTexture = loader.load(img_list[Math.floor(Math.random() * 4)]);
            sceneTexture.offset.x = 0.5;
            sceneTexture.repeat.set(0.5, 1);

            let innerSphere = new THREE.Mesh(halfSphereGeometry, new THREE.MeshBasicMaterial({ map: sceneTexture, side: THREE.BackSide }));
            let outerSphere = new THREE.Mesh(halfSphereGeometry, cloakMaterial);
            let holeMesh = new THREE.Mesh(new THREE.RingGeometry(holeRadius, sphereRadius * 1.01, 32), cloakMaterial);
            let borderMesh = new THREE.Mesh(new THREE.RingGeometry(holeRadius, holeRadius + borderThickness, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
            borderMesh.position.z += 0.001; // avoid depth-fighting artifacts

            halfSphereGroup.add(innerSphere);
            halfSphereGroup.add(outerSphere);
            halfSphereGroup.add(holeMesh);
            halfSphereGroup.add(borderMesh);
            reticle.matrix.decompose(halfSphereGroup.position, halfSphereGroup.quaternion, halfSphereGroup.scale);
            halfSphereGroup.rotateX(- Math.PI / 2);
            halfSphereGroup.rotation.z = 0;
            scene.add(halfSphereGroup);
        }
    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
}

function render(timestamp, frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then(function (referenceSpace) {
                session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
                    hitTestSource = source;
                });
            });

            session.addEventListener('end', function () {
                hitTestSourceRequested = false;
                hitTestSource = null;
            });
            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {
                const hit = hitTestResults[0];

                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('test.glb', gltfReader);
}

function gltfReader(gltf) {
    let testModel = null;

    testModel = gltf.scene;

    if (testModel != null) {
        console.log("Model loaded:  " + testModel);
        scene.add(gltf.scene);
    } else {
        console.log("Load FAILED.  ");
    }
}