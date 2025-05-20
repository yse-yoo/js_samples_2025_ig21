// シーンの初期化
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// カメラの初期位置と向き
const defaultCameraPosition = new THREE.Vector3(0, 150, 250);
const defaultLookAt = new THREE.Vector3(0, 0, 0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
camera.position.copy(defaultCameraPosition);
camera.lookAt(defaultLookAt);

// WebGLレンダリング
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 太陽 ---
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff5500 })
);
scene.add(sun);

// --- 環境光 ---
const pointLight = new THREE.PointLight(0xffffff, 1.5, 0);
pointLight.position.copy(sun.position);
scene.add(pointLight);

// --- 惑星 ---
const planets = [];

planetData.forEach(data => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: data.color });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 軌道リング
    const segments = 128;
    const orbitPoints = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(
            data.orbitRadius * Math.cos(angle),
            0,
            data.orbitRadius * Math.sin(angle)
        ));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitLine = new THREE.LineLoop(
        orbitGeometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
    );
    scene.add(orbitLine);

    planets.push({
        name: data.name,
        mesh: mesh,
        orbitRadius: data.orbitRadius,
        orbitPeriod: data.orbitPeriod
    });
});

// --- DOMリスト生成とズーム処理 ---
const planetListEl = document.querySelector('#planetList ul');
let isZooming = false;
let zoomStart = new THREE.Vector3();
let zoomEnd = new THREE.Vector3();
let zoomLookAt = new THREE.Vector3();
let zoomProgress = 0;

planets.forEach(planet => {
    const li = document.createElement('li');
    li.textContent = planet.name;
    li.addEventListener('click', () => {
        zoomStart.copy(camera.position);
        zoomLookAt.copy(planet.mesh.position);
        zoomEnd.copy(zoomLookAt).add(new THREE.Vector3(0, 10, 20));
        zoomProgress = 0;
        isZooming = true;
    });
    planetListEl.appendChild(li);
});

// --- リセット ---
document.getElementById('resetButton').addEventListener('click', () => {
    zoomStart.copy(camera.position);
    zoomEnd.copy(defaultCameraPosition);
    zoomLookAt.copy(defaultLookAt);
    zoomProgress = 0;
    isZooming = true;
});

// --- アニメーション ---
function animate() {
    requestAnimationFrame(animate);
    const elapsed = performance.now() / 1000;

    planets.forEach(planet => {
        const angle = (elapsed / planet.orbitPeriod) * Math.PI * 2;
        planet.mesh.position.x = planet.orbitRadius * Math.cos(angle);
        planet.mesh.position.z = planet.orbitRadius * Math.sin(angle);
    });

    // カメラズーム補間
    if (isZooming) {
        zoomProgress += 0.02;
        if (zoomProgress >= 1) {
            zoomProgress = 1;
            isZooming = false;
        }
        camera.position.lerpVectors(zoomStart, zoomEnd, zoomProgress);
        camera.lookAt(zoomLookAt);
    }

    renderer.render(scene, camera);
}
animate();

// --- リサイズ対応 ---
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
