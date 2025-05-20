import * as THREE from 'three';

// スタンプ画像設定をオブジェクトに統合
const faceImages = {
    dog1: { scale: 400, point: 1, dx: 5, dy: 80 },
    cat1: { scale: 400, point: 1, dx: 5, dy: 100 },
    dog2: { scale: 600, point: 1, dx: 5, dy: 100 },
    panda1: { scale: 600, point: 1, dx: 5, dy: 100 },
    bear1: { scale: 600, point: 1, dx: 5, dy: 100 },
    monkey1: { scale: 600, point: 1, dx: 5, dy: 100 },
};
// デフォルト
let currentFaceImage = Object.keys(faceImages)[0];

// 画像の縦横比
const decoImageRatios = {};

// Three.jsの準備
const canvasEl = document.getElementById('canvas');
const videoEl = document.getElementById('video');

// 動画サイズ
const videoWidth = 640;
const videoHeight = 480;

// メッシュ
let mesh;
// 検出器
let detector;
// 検出結果
let results;
// 顔の法線
let faceNormalVector;

let positionX = 0;
let positionY = 0;
// 法線の強度
const depthStrength = 200;
// 法線のオフセット
const zOffset = 300;

let scene, camera, renderer;

// Three.jsの初期設定を行う関数
function setupWebGL() {
    // レンダラーを作成
    renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true
    });
    // ピクセル比を設定
    renderer.setPixelRatio(window.devicePixelRatio);
    // サイズを設定
    renderer.setSize(videoWidth, videoHeight);
    // 背景色を設定
    renderer.setClearColor(0x000000, 0);

    // シーンを作成
    scene = new THREE.Scene();

    // カメラを作成
    const fov = 45;
    // 縦横比を設定
    camera = new THREE.PerspectiveCamera(fov, videoWidth / videoHeight, 1, 1000);
    // カメラの位置を設定
    camera.position.set(0, 0, 680);

    createDecoPlane();
}

/**
 * FaceMesh検出器を設定する
 * @returns {Promise<void>} 設定が完了したpromise
 */
async function loadModels() {
    // 検出モデルを選択
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'
    };
    // 検出器を作成
    detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
}

/**
 * スタンプ切り替えボタンとスタンプ位置調整ボタンを生成する
 * 
 * スタンプ切り替えボタンを生成し、スタンプ位置調整ボタンを生成する。
 * スタンプ位置調整ボタンは、TOP, BOTTOM, LEFT, RIGHTの4種類があり、各々のボタンを
 * クリックすると、スタンプの位置が5pxずつ移動する。
 */
function createImageButtons() {
    // スタンプ切り替えボタンを生成
    const buttonContainer = document.querySelector('.image-buttons');
    Object.keys(faceImages).forEach(name => {
        const button = document.createElement('button');
        button.classList.add('image-button', 'border', 'border-gray-300', 'rounded-full', 'p-1');
        button.dataset.deco = name;

        const img = document.createElement('img');
        img.src = `images/${name}.png`;
        img.alt = name;
        img.classList.add('w-20');

        button.appendChild(img);
        button.addEventListener('click', () => {
            document.querySelectorAll('.image-button').forEach(btn => btn.classList.remove('current'));
            button.classList.add('current');
            positionX = 0;
            positionY = 0;
            currentFaceImage = name;
            updateFace();
        });

        buttonContainer.appendChild(button);
    });
}

/**
 * スタンプ位置調整ボタンを生成する
 * 
 * TOP, BOTTOM, LEFT, RIGHTの4種類のボタンを生成し、各々のボタンを
 * クリックすると、スタンプの位置が5pxずつ移動する。
 */
function createPositionButtons() {
    // スタンプ位置調整ボタンを生成
    const positionContainer = document.querySelector('.position-buttons');
    const positions = ['top', 'bottom', 'left', 'right'];
    const positionSymbols = { top: '↑', bottom: '↓', left: '←', right: '→' };

    // 各位置のボタンを生成
    positions.forEach(pos => {
        const button = document.createElement('button');
        button.classList.add('position-controllerButton', 'bg-gray-500', 'hover:bg-blue-600', 'text-white', 'font-semibold', 'px-4', 'py-2', 'rounded-full');
        button.dataset.position = pos;
        button.textContent = positionSymbols[pos];

        button.addEventListener('click', () => {
            if (pos === 'top') positionY += 5;
            if (pos === 'bottom') positionY -= 5;
            if (pos === 'left') positionX += 5;
            if (pos === 'right') positionX -= 5;
        });

        positionContainer.appendChild(button);
    });
}

/**
 * スタンプ画像を読み込み
 * 
 * すべての画像が読み込まれたら、setupWebGL() を呼び出す。
 */
function loadImages() {
    let imagesLoaded = 0;
    const keys = Object.keys(faceImages);
    keys.forEach(name => {
        const img = new Image();
        img.onload = () => {
            decoImageRatios[name] = img.width / img.height;
            imagesLoaded++;
            if (imagesLoaded === keys.length) {
                setupWebGL();
            }
        };
        img.src = `images/${name}.png`;
    });
}

function createDecoPlane() {
    const settings = faceImages[currentFaceImage];
    const ratio = decoImageRatios[currentFaceImage];
    const geometry = new THREE.PlaneGeometry(ratio, 1); // 縦横比を設定してジオメトリを作成
    const loader = new THREE.TextureLoader();
    const texture = loader.load(`images/${currentFaceImage}.png`, function (map) {
        map.colorSpace = THREE.SRGBColorSpace;
    });

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(settings.scale, settings.scale, 0);

    scene.add(mesh);
}

// スタンププレーンを更新する関数
function updateFace() {
    if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        mesh = null;
    }
    // 新しいメッシュを作成
    createDecoPlane();
}

// スタンプのためのプレーンの位置と回転、スケールを更新
// スタンプのためのプレーンの位置と回転、スケールを更新
function updatemesh() {
    if (!results || results.length === 0) {
        return;
    }

    // 顔の傾き
    const quaternion = calculateNormalVector();
    // スタンプの回転
    mesh.quaternion.copy(quaternion);
    // スタンプの位置
    const settings = faceImages[currentFaceImage];
    // スタンプの位置調整
    const landmark = fixLandmarkValue(results[0].keypoints);

    // 鼻の位置
    const position = landmark[settings.point];
    // スタンプの高さ調整
    const faceCenter = new THREE.Vector3(
        position.x + positionX + settings.dx,
        position.y + positionY + settings.dy,
        position.z - zOffset,
    );

    // 鼻のY座標の中間点を計算
    const leftNose = landmark[279];
    const rightNose = landmark[49];
    const noseYMidpoint = (leftNose.y + rightNose.y) / 2;

    // 鼻のY座標の中間点に位置を調整
    faceCenter.y = noseYMidpoint + settings.dy;

    // デコレーションを適切に配置
    mesh.position.copy(faceCenter);
}


/**
 * 顔の向き（法線ベクトル）を計算し、three.jsのクォータニオンに変換
 * @return {THREE.Quaternion} 顔の向きを表すクォータニオン
 */
function calculateNormalVector() {
    if (!results || results.length === 0) {
        return;
    }

    // ランドマーク取得
    const landmark = fixLandmarkValue(results[0].keypoints);
    // 鼻の先端のキーポイント
    const noseTip = landmark[1];
    // 鼻の左端のキーポイント
    const leftNose = landmark[279];
    // 鼻の右端のキーポイント
    const rightNose = landmark[49];

    // 鼻の中央を計算（x, y, z）
    const midpoint = {
        x: (leftNose.x + rightNose.x) / 2,
        y: (leftNose.y + rightNose.y) / 2,
        z: (leftNose.z + rightNose.z) / 2,
    };

    //  顔の向き（法線ベクトル）を計算
    faceNormalVector = new THREE.Vector3(noseTip.x, noseTip.y, noseTip.z)
        .sub(new THREE.Vector3(midpoint.x, midpoint.y, midpoint.z))
        .normalize();

    // 法線ベクトルとZ軸の単位ベクトルを使用してクォータニオンを作成
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), faceNormalVector);
    return quaternion;
}

/**
 * Webカメラを有効化する
 * - getUserMediaを使用してWebカメラの映像を取得
 * - video要素に映像を設定
 * - video要素を再生
 * @return {Promise<HTMLVideoElement>} streamの取得が完了したpromise
 */
async function setupCamera() {
    const constraints = {
        video: {
            width: videoWidth,
            height: videoHeight,
            facingMode: 'user',
        },
        audio: false
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoEl.srcObject = stream;
        await videoEl.play();
        return videoEl;
    } catch (error) {
        console.error(error);
    }
}

// 顔を検知
async function detectFace() {
    const estimationConfig = { flipHorizontal: false };
    results = await detector.estimateFaces(videoEl, estimationConfig);
}

/**
 * Face Landmark の座標を Three.js で使用できる形に変換
 * @param {Object[]} data Face Landmark の座標データ
 * @return {Object[]} Three.js で使用できる座標データ
 */
function fixLandmarkValue(data) {
    return data.map((el) => {
        return {
            x: el.x - videoEl.videoWidth / 2,
            y: -el.y + videoEl.videoHeight / 2,
            z: ((el.z / 100) * -1 + 1) * depthStrength
        };
    });
}

async function render() {
    await detectFace();
    updatemesh();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

// 初期化関数
async function init() {
    createImageButtons();
    createPositionButtons();
    loadImages();
    await setupCamera();
    await loadModels();
    render();
}

init();