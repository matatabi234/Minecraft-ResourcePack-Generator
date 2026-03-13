// paint.js 全体
import { tools } from './tools.js';

console.log("paint.js 読み込み完了");

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
let isDrawing = false;
let currentImageUrl = "";
window.currentTool = 'pen';
let currentCanvasData = "";
import { saveState } from './undo_redo.js';
let currentBrushSize = 1;

canvas.width = 16;
canvas.height = 16;
ctx.imageSmoothingEnabled = false;
document.addEventListener('selectTexture', (e) => {
    currentImageUrl = e.detail;
    console.log("読み込もうとしているURL:", currentImageUrl); // ← ここを見る
    
    const img = new Image();
    img.src = currentImageUrl;
    img.onload = () => {
        console.log("画像のサイズ:", img.width, img.height); // ← サイズが0なら読み込めていない
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 16, 16);
    };
});
document.getElementById('brushSize').addEventListener('change', (e) => {
    currentBrushSize = e.target.value;
});

document.addEventListener('clearCanvas', (e) => {
    if (currentImageUrl === e.detail) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentImageUrl = "";
    }
});

// paint.js の全消去イベントを書き換え
document.addEventListener('clearCanvas', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 必要であれば currentImageUrl = ""; も消す
});

// マウスのキャンバス内座標を計算する共通関数
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / 16));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / 16));
    return { x, y };
}

// 描画イベント
canvas.addEventListener('mousedown', (e) => {
    // 【超重要】描画を始める「直前」のキャンバスの状態を保存しておく！
    recordAction(); 
    
    isDrawing = true;
    
    if (window.currentTool === 'line') {
        alert("直線ツールは現在調整中です！");
        window.currentTool = 'pen';
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="pen"]').classList.add('active');
        return; 
    }

    const { x, y } = getMousePos(e);
    if (window.currentTool === 'eraser') {
        tools.eraser.draw(ctx, x, y);
    } else {
        tools[window.currentTool].draw(ctx, x, y, colorPicker.value, currentBrushSize);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    // currentTool = btn.getAttribute('data-tool');
    if (currentTool === 'line') return;
        if (currentTool === 'line') {
        alert("直線ツールは現在調整中です！");
        currentTool = 'pen';
        
        // 画面上のボタンの見た目もペンに戻す（おまけ）
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tool="pen"]').classList.add('active');
        return; // この後の描画処理は実行しない
    }
    const { x, y } = getMousePos(e);
    tools[currentTool].draw(ctx, x, y, colorPicker.value, currentBrushSize);
});
window.addEventListener('mouseup', () => {
    isDrawing = false;
});

function recordAction() {
    const canvas = document.getElementById('canvas');
    const state = canvas.toDataURL();
    saveState(state);
    console.log("描画前の状態を保存しました！");
}

// ツール切り替え用（外部から currentTool を更新できるようにする）
window.setCurrentTool = (tool) => {
    currentTool = tool;
};

export function updateTextureFromCanvas(id) {
    const canvas = document.getElementById('canvas');
    const newData = canvas.toDataURL("image/png");
    
    // textureList の該当するIDを探してデータを更新
    const texture = textureList.find(t => t.id === id);
    if (texture) {
        texture.data = newData;
    }
}