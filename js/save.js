export async function generateZipWithSettings(name, format, list) {
    const zip = new JSZip();

    const response = await fetch('data.json');
    const allBlocks = await response.json();

    // 1. 空チェック
    if (!list || list.length === 0) {
        alert("テクスチャが選択されていません");
        return;
    }

    // 2. 選択されたリストだけを処理
    const filePromises = list.map(async (item) => {
        const dataUrl = item.data;
        if (!dataUrl) return;

        // 2. data.json の中から現在の item.id に一致するデータを探す
        const originalData = allBlocks.find(b => b.id === item.id);
        
        // 3. カテゴリ情報を originalData から取得 (なければデフォルトで 'item')
        let category = originalData ? originalData.category : 'items';
        
        // 4. パス変換
        let categoryDir = (category === 'blocks') ? 'block' : 'item';
        const folder = zip.folder(`assets/minecraft/textures/${categoryDir}`);

        if (dataUrl.includes('base64,')) {
            const base64Data = dataUrl.split(',')[1];
            folder.file(`${item.id}.png`, base64Data, { base64: true });
        } else {
            try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                folder.file(`${item.id}.png`, blob);
            } catch (err) {
                console.error("画像取得失敗:", item.id, err);
            }
        }
    });

    await Promise.all(filePromises);

    // 3. pack.mcmeta 作成
    const packMcmeta = {
        "pack": {
            "pack_format": format,
            "supported_formats": [format, 75],
            "description": "Custom Pack"
        }
    };
    zip.file("pack.mcmeta", JSON.stringify(packMcmeta, null, 2));

    // 4. ダウンロード実行
    // const content = await zip.generateAsync({ type: "blob" });
    // const link = document.createElement('a');
    // link.href = URL.createObjectURL(content);
    // link.download = `${name}.zip`;
    // link.click();
    // js/save.js

    const content = await zip.generateAsync({ type: "blob" });

    // 一時保存
    const url = URL.createObjectURL(content);

    // sessionStorageに保存
    sessionStorage.setItem("generatedZip", url);
    sessionStorage.setItem("zipName", `${name}.zip`);

    setTimeout(()=>{
    location.href="generating.html";
    },1000);
    }