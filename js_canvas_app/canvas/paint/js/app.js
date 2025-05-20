// DOM 要素
const colorPicker = document.getElementById('colorPicker');
const lineWidthRange = document.getElementById('lineWidth');
const lineWidthValue = document.getElementById('lineWidthValue');
const resetButton = document.getElementById('resetButton');
const downloadButton = document.getElementById('downloadButton');

// canvas 要素と描画コンテキストの取得
const canvas = document.getElementById('drawCanvas');
// 2Dコンテキストを取得
const ctx = canvas.getContext('2d');

// 描画状態を管理する変数
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// 現在の描画設定（初期値）
let currentColor = '';
let currentLineWidth = 1;

/**
 * 描画を開始する
 * @param {number} x - 描画の開始 x 座標
 * @param {number} y - 描画の開始 y 座標
 */
function startDrawing(x, y) {
    isDrawing = true;
    [lastX, lastY] = [x, y];
}

/**
 * 描画を続ける
 * @param {number} x - 描画の継続 x 座標
 * @param {number} y - 描画の継続 y 座標
 */
function draw(x, y) {
    if (!isDrawing) return;
    // TODO: 前回の位置から現在の位置まで線を描画
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);

    // 現在の色と線の太さを適用
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
    // ストローク
    ctx.stroke();
    // 座標更新
    [lastX, lastY] = [x, y];
}

/**
 * 描画終了
 * 描画フラグを false に設定し、描画動作を停止する。
 */
function endDrawing() {
    isDrawing = false;
}

// イベント
// TODO: マウスダウン: mousedown
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    console.log('mousedown', e.clientX, e.clientY);
    startDrawing(e.clientX - rect.left, e.clientY - rect.top);
});

// タッチ開始（スマホ・タブレット用）
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
});

// Win: Ctrl + Shift + R
// Mac: Cmd + Shift + R
// マウス移動
// TODO: マウス移動: mousemove
canvas.addEventListener('mousemove', (e) => {
    // TODO: getBoundingClientRect() 座標取得
    const rect = canvas.getBoundingClientRect();
    // マウスイベント e でマウスの座標を取得
    draw(e.clientX - rect.left, e.clientY - rect.top);
});

// タッチ移動（スマホ・タブレット用）
canvas.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
});

// マウスアップ
canvas.addEventListener('mouseup', endDrawing);
// マウスアウト
canvas.addEventListener('mouseout', endDrawing);

// タッチ終了
canvas.addEventListener('touchend', endDrawing);
canvas.addEventListener('touchcancel', endDrawing);

// コントロール変更時のイベントリスナー
colorPicker.addEventListener('change', (e) => {
    // TODO: 色変更処理: currentColor に target.value 設定
    currentColor = e.target.value;
});

// 太さ入力
lineWidthRange.addEventListener('input', (e) => {
    // TODO: 色変更処理: currentLineWidth に target.value 設定
    currentLineWidth = e.target.value;
    lineWidthValue.textContent = currentLineWidth;
});

// リセットボタンクリック
resetButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
        // TODO: キャンバス全体をクリア: clearRect()
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});

// ダウンロードボタンクリック
downloadButton.addEventListener('click', () => {
    // TODO: Canvas の内容を PNG のデータURL に変換: toDataURL() : 'image/png'
    const dataURL = canvas.toDataURL('image/png');

    // 一時的なリンク（aタグ）を生成してクリックし、ダウンロードを実行
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'canvas.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});