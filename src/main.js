import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';

let scene, camera, renderer;
let cloakMaterial, cloakTexture;

let controller;

init();
animate();

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

function init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // camera.position.set(0, 2, 4);
    // camera.lookAt( scene.position );	
    // scene.add( camera );

    let ambientLight = new THREE.AmbientLight(0xcccccc, 1.00);
    scene.add(ambientLight);

    // let pointLight = new THREE.PointLight();
    // camera.add( pointLight );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); //alpha false ?
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    /*
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    */
    window.addEventListener('resize', onWindowResize, false);

    document.body.appendChild(ARButton.createButton(renderer));

    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1).rotateX(Math.PI / 2);

    function onSelect() {

        const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, - 0.3).applyMatrix4(controller.matrixWorld);
        mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
        scene.add(mesh);
        meshList.push(mesh);

    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);


    let loader = new THREE.TextureLoader();

    let halfSphereGroup = new THREE.Group();
    halfSphereGroup.position.y = 1;
    scene.add(halfSphereGroup);

    let sphereRadius = 1;
    let holeRadius = 0.5;
    let borderThickness = 0.05;

    let halfSphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32, Math.PI, Math.PI); // startAngle, sweepAngle


    let cloakTexture = loader.load("assets/img/color-grid.png");
    cloakMaterial = new THREE.MeshBasicMaterial({ map: cloakTexture, side: THREE.FrontSide, colorWrite: false }); // change colorWrite: true to see the cloak

    let sceneTexture = loader.load("assets/img/blocky_photo_studio_1k.jpg");
    sceneTexture.offset.x = 0.5;
    sceneTexture.repeat.set(0.5, 1);

    let innerSphere = new THREE.Mesh(halfSphereGeometry, new THREE.MeshBasicMaterial({ map: sceneTexture, side: THREE.BackSide }));
    let outerSphere = new THREE.Mesh(halfSphereGeometry, cloakMaterial);
    let holeMesh = new THREE.Mesh(new THREE.RingGeometry(holeRadius, sphereRadius * 1.01, 32), cloakMaterial);
    let borderMesh = new THREE.Mesh(new THREE.RingGeometry(holeRadius, holeRadius + borderThickness, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    borderMesh.position.z = 0.001; // avoid depth-fighting artifacts

    halfSphereGroup.add(innerSphere);
    halfSphereGroup.add(outerSphere);
    halfSphereGroup.add(holeMesh);
    halfSphereGroup.add(borderMesh);
}

function render() {
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