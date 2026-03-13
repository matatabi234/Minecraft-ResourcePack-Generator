// script.js
const galleryList = document.getElementById('galleryList');
const blockModal = document.getElementById('blockModal');
const blockSelector = document.getElementById('blockSelector');
const confirmModal = document.getElementById('confirmModal');
let itemToRemove = null; 
let selectedDiv = null;

const exportModal = document.getElementById('export-modal');
const modalExportBtn = document.getElementById('modal-export');

document.getElementById('modal-cancel').onclick = () => modal.style.display = 'none';

// 【重要】関数の外で取得しておく

export let textureList = [];

import { generateZipWithSettings } from './save.js';

window.addEventListener('DOMContentLoaded', () => {
    confirmModal.style.display = 'none';
    blockModal.style.display = 'none';
});

document.getElementById('addBtn').addEventListener('click', () => {
    blockModal.style.display = 'block';
});

// JSONからブロック読み込み
async function loadBlockData() {
    try {
        const response = await fetch('data.json');
        const blocks = await response.json();
        blocks.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        blocks.forEach(block => {
            const div = document.createElement('div');
            div.className = 'modal-item';
            div.innerHTML = `<img src="${block.url}" width="48"><br>${block.name}`;
            
            // クリック時に addToInventory を呼ぶだけにする
            div.onclick = () => {
                addToInventory(block.name, block.url, block.id); 
                blockModal.style.display = 'none';
            };
            
            blockSelector.appendChild(div);
        });
    } catch (e) { 
        console.error("JSON読み込み失敗:", e); 
    }
}

function addToInventory(name, imageUrl, id) {
    // if ([...galleryList.querySelectorAll('.thumb span')].some(s => s.textContent === name)) {
    //     alert(name + " は既に追加されています！");
    //     return;
    // }
    // galleryList.appendChild(div);
    // const div = document.createElement('div');
    // div.className = 'thumb';
    // div.dataset.url = imageUrl;
    // div.dataset.id = id;
    const div = document.createElement('div');
    div.className = 'thumb';
    div.dataset.url = imageUrl;
    div.dataset.id = id; // idを保持しておく
    
    // リスト形式に合わせたHTML
    div.innerHTML = `
        <button class="delete-btn">×</button>
        <img src="${imageUrl}">
        <span>${name}</span>
    `;
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        itemToRemove = { div, imageUrl, name }; 
        confirmModal.style.display = 'block';
    };
    
    // 削除ボタンのイベント
    div.querySelector('.delete-btn').onclick = (e) => {
        e.stopPropagation();
        itemToRemove = { div: e.currentTarget.parentElement, imageUrl, name };
        confirmModal.style.display = 'block';
    };
    div.onclick = (e) => {
        // e.currentTarget を使うことで div という変数名に依存しなくなる
        const clickedDiv = e.currentTarget; 
        
        document.querySelectorAll('.thumb').forEach(el => el.classList.remove('selected'));
        clickedDiv.classList.add('selected');
        selectedDiv = clickedDiv;

        // データの検索とイベント送信
        const savedTexture = textureList.find(t => t.name === name);
        const dataToLoad = savedTexture ? savedTexture.data : imageUrl;
        document.dispatchEvent(new CustomEvent('selectTexture', { detail: dataToLoad }));
    };
    
galleryList.appendChild(div);
    
    // リストへの追加（idを含める）
    textureList.push({ id: id, name: name, data: imageUrl });
}

// script.js の 確定ボタン処理 を修正
document.getElementById('confirmYes').onclick = () => {
    // 削除対象があるか確認し、かつHTML構造が生きているかチェック
    if (itemToRemove && itemToRemove.div && itemToRemove.div.parentNode) {
        
        // Canvasのクリア依頼
        document.dispatchEvent(new CustomEvent('clearCanvas', { detail: itemToRemove.imageUrl }));
        
        // 削除処理
        itemToRemove.div.remove();
        itemToRemove = null;
    }
    
    // 最後に必ず閉じる
    confirmModal.style.display = 'none';
};

document.getElementById('confirmNo').onclick = () => {
    confirmModal.style.display = 'none';
};

const toolBtns = document.querySelectorAll('.tool-btn');

toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. 全てのボタンから active を外す
        toolBtns.forEach(b => b.classList.remove('active'));
        
        // 2. クリックしたボタンに active を付ける
        btn.classList.add('active');
        
        // 3. ツール切り替え処理（例）
        const toolType = btn.getAttribute('data-tool');
        window.currentTool = btn.getAttribute('data-tool');
        console.log("選択したツール:", toolType);
    });
});

    // script.js
document.addEventListener('DOMContentLoaded', () => {
    const toolBtns = document.querySelectorAll('.tool-btn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const modalCancelBtn = document.getElementById('modal-cancel');
    // script.js
    // 1. セーブ用ボタン
    if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
        console.log("キャンセルが押されました"); // ここで動作確認できる
        exportModal.style.display = 'none'; // モーダルを消す
    });
    }
    document.getElementById('saveBtn').addEventListener('click', () => {
            if (!selectedDiv) {
                alert("保存するブロックを選択してください！");
                return;
            }

            const canvas = document.getElementById('canvas');
            const imageData = canvas.toDataURL("image/png");
            const name = selectedDiv.querySelector('span').textContent;

        const index = textureList.findIndex(t => t.name === name);
        if (index !== -1) {
            textureList[index].data = imageData;
        } else {
            textureList.push({ id: selectedDiv.dataset.id, name: name, data: imageData });
        }
        updateThumbnail(imageData); 
    
        alert(name + " を保存しました！");
    });

document.getElementById('exportBtn').addEventListener('click', () => {
    exportModal.style.display = 'block'; // ここで modal ではなく exportModal を使う
});
    document.getElementById('modal-export').addEventListener('click', () => {
    const packName = document.getElementById('modal-pack-name').value;
    const format = parseInt(document.getElementById('modal-pack-format').value);
    
    exportModal.style.display = 'none';
    
    // 【重要】ここで textureList を引数として渡す！
    generateZipWithSettings(packName, format, textureList); 
    });
    // ボタンのクリックイベント設定
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const toolType = btn.getAttribute('data-tool');

            // 全消しボタンなら確認モーダルを出す
            if (toolType === 'all eraser') {
                confirmModal.style.display = 'block';
                return; 
            }

            // それ以外のツールなら通常通り切り替える
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // paint.js に伝えるために window を使用
            window.currentTool = toolType;
            console.log("ツール切り替え:", toolType);
        });
    });

    // 確認画面の「はい」
    confirmYes.addEventListener('click', () => {
        // paint.js に全消しを通知
        document.dispatchEvent(new CustomEvent('clearCanvas', { detail: null }));
        confirmModal.style.display = 'none';
    });

    // 確認画面の「いいえ」
    confirmNo.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });
});
// script.js に追加
function updateCurrentTextureInList() {
    const canvas = document.getElementById('canvas');
    const newData = canvas.toDataURL("image/png");
    
    if (selectedDiv) {
        const name = selectedDiv.querySelector('span').textContent;
        const texture = textureList.find(t => t.name === name);
        if (texture) {
            texture.data = newData;
        } else {
            // まだリストにない場合は追加（新規作成時など）
            textureList.push({ name: name, data: newData });
        }
    }
}

// script.js に配置
function saveToInventory() {
    if (!selectedDiv) return; // 何も選ばれていなければ何もしない

    const canvas = document.getElementById('canvas');
    const imageData = canvas.toDataURL("image/png");
    const name = selectedDiv.querySelector('span').textContent;

    // リストを検索してデータを更新
    const texture = textureList.find(t => t.name === name);
    if (texture) {
        texture.data = imageData;
        console.log(`${name} を保存しました！`);
    } else {
        // 新規登録なら追加
        textureList.push({ name: name, data: imageData });
    }
}
// script.js に追加
function updateThumbnail() {
    if (!selectedDiv) return;

    const canvas = document.getElementById('canvas');
    const newData = canvas.toDataURL("image/png");

    // 選択中のdivの中にあるimgタグを探してsrcを更新
    const imgElement = selectedDiv.querySelector('img');
    if (imgElement) {
        imgElement.src = newData;
    }
}

function filterBlocks() {
    const query = document.getElementById('blockSearch').value.toLowerCase();
    const items = document.querySelectorAll('.modal-item');
    
    items.forEach(item => {
        // item の中にあるテキスト（ブロック名）を取得
        const name = item.textContent.toLowerCase();
        // 含まれていれば表示、なければ非表示
        if (name.includes(query)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// 最後に実行
loadBlockData();