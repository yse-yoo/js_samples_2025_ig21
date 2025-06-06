// Canvas 要素を取得し、2D コンテキストを取得
const canvas = document.getElementById('myCanvas');
// TODO: 2D コンテキスト
const ctx = canvas.getContext('2d');
console.log(ctx)

// ブラウザのキャッシュのショートカット
// Ctrl + Shift + R
/**
 * drawSquare()
 */
function drawSquare() {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';

    // TODO: 矩形を塗り  
    // x, y, width, height:例 0, 0, 100, 50
    ctx.fillRect(0, 0, 100, 50);

    // TODO: 矩形をストローク 
    // x, y, width, height:例 0, 0, 100, 50
    ctx.strokeRect(0, 0, 100, 50);
}


/**
 * drawTriangle()
 */
function drawTriangle() {
    // パス開始
    ctx.beginPath();
    // 三角形を描画
    // TODO: 座標移動: x, y = 50, 0
    ctx.moveTo(200, 0);

    // TODO: 線を引く: x, y = 150, 0
    ctx.lineTo(150, 0);

    // TODO: 線を引く: x, y = 100, 100
    ctx.lineTo(100, 100);

    // パス終了
    ctx.closePath();
    // 線を描画
    ctx.stroke();
}

/**
 * drawCircle()
 */
function drawCircle() {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    // TODO: 円を描画
    // arc(x, y, radius, startAngle, endAngle)
    ctx.arc(300, 50, 50, 0, Math.PI * 2, false);

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

/**
 * drawTextOnCanvas();
 * @param {*} text
 * @param {*} x 
 * @param {*} y 
 * @param {*} font 
 * @param {*} color 
 */
function drawTextOnCanvas(text, x, y, font, color) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    // TODO: 文字を描画
    ctx.fillText(text, x, y);
}

// 描画
drawTriangle();
drawSquare();
drawCircle();

drawTextOnCanvas('Hello, Canvas!', 150, 150, '20px Arial', 'blue');
drawTextOnCanvas('この文字はCanvasを使って描画しています', 0, 200, '20px Arial', 'blue');