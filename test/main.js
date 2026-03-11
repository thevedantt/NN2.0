import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(1, 1, 1);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new GLTFLoader();

let mixer;
let actions = [];

loader.load("model.glb", (gltf) => {
    const model = gltf.scene;

    // Lower the model so it aligns with the ground in the background
    model.position.y = -0.5;

    scene.add(model);

    console.log("Animations found:", gltf.animations);

    mixer = new THREE.AnimationMixer(model);
    const buttonsContainer = document.getElementById('animation-buttons');

    if (buttonsContainer) {
        const stopBtn = document.createElement('button');
        stopBtn.innerText = "Stand Still 🛑";
        stopBtn.onclick = () => {
            actions.forEach(a => a.fadeOut(0.5));
            document.querySelectorAll('#animation-buttons button').forEach(b => b.classList.remove('active'));
            stopBtn.classList.add('active');
        };
        buttonsContainer.appendChild(stopBtn);
    }

    gltf.animations.forEach((clip, i) => {
        console.log("Animation:", clip.name);
        const action = mixer.clipAction(clip);
        actions.push(action);

        if (buttonsContainer) {
            const btn = document.createElement('button');
            btn.innerText = clip.name || `Animation ${i}`;
            btn.onclick = () => {
                playAnimation(i);
                document.querySelectorAll('#animation-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
            buttonsContainer.appendChild(btn);
        }
    });

    if (actions.length > 0 && buttonsContainer && buttonsContainer.children.length > 0) {
        // Start by standing still
        buttonsContainer.children[0].classList.add('active');
    }
});

function playAnimation(index) {
    actions.forEach(a => {
        if (a.isRunning()) {
            a.fadeOut(0.5);
        } else {
            a.stop();
        }
    });
    actions[index].reset().fadeIn(0.5).play();
    console.log("Playing:", actions[index]._clip.name);
}

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
