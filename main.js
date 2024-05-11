import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);
camera.position.setX(-3);

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#bg') });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

let mixer; // Declare mixer variable to handle animations

// Load Earth GLTF Model
const loader = new GLTFLoader();
let earth;

loader.load(
    'earth2.glb',
    function (gltf) {
        earth = gltf.scene;
        scene.add(earth);
        earth.scale.set(7.11, 7.11, 7.11); // Adjust scale as needed
        earth.position.set(0, 0, 0); // Adjust position as needed

        // Check if there are animations
        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(earth);
            const action = mixer.clipAction(gltf.animations[0]); // Assuming the first animation
            action.play();
        }
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Stars
function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background
const spaceTexture = new THREE.TextureLoader().load('d7.jpg');
scene.background = spaceTexture;

// Avatar
const jeffTexture = new THREE.TextureLoader().load('pro.png');
const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));
scene.add(jeff);
jeff.position.z = -5;
jeff.position.x = 2;

// Moon
const moonTexture = new THREE.TextureLoader().load('t1.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshStandardMaterial({
        map: moonTexture,
        normalMap: normalTexture,
    })
);
scene.add(moon);
moon.position.z = 30;
moon.position.setX(-10);

// Scroll Animation
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    moon.rotation.x += 0.05;
    moon.rotation.y += 0.075;
    moon.rotation.z += 0.05;
    jeff.rotation.y += 0.01;
    jeff.rotation.z += 0.01;
    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(0.01); // Update the mixer with a delta time (e.g., 0.01)
    }
    if (earth) {
        earth.rotation.y += 0.005; // Rotate the Earth
    }
    renderer.render(scene, camera);
}
animate();
