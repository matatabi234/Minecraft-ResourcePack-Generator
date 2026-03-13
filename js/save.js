// save.js の中
// 引数に list を追加
export async function generateZipWithSettings(name, format, list) {
    const response = await fetch('data.json');
    const allBlocks = await response.json(); // 全リスト
    const zip = new JSZip();
    const folder = zip.folder("assets/minecraft/textures");
    if (!list) return;

allBlocks.forEach(block => {
    // 1. 編集データがあるか確認
    const edited = list.find(t => t.id === block.id);
    const dataUrl = edited ? edited.data : block.url;

    // 2. Base64 データの抽出
    if (dataUrl && dataUrl.includes('base64,')) {
        // 編集されたデータがある場合
        const base64Data = dataUrl.split(',')[1];
        folder.file(`${block.id}.png`, base64Data, { base64: true });
    } else if (dataUrl && !dataUrl.startsWith('data:')) {
        // 初期画像(URL)の場合: JSZipに渡すには fetch が必要
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                // ファイルとして追加
                // folder.file(`${block.category}/${block.id}.png`, blob);
                folder.file(`${block.id}.png`, blob);
            })
            .catch(err => console.error("画像取得失敗:", err));
    }
});

    list.forEach((t) => {
        // データがある場合だけ処理する
        if (t.data && t.data.includes(',')) {
            const base64Data = t.data.split(',')[1];
            folder.file(`${t.category}/${t.id}.png`, base64Data, { base64: true });
        } else {
            console.warn(`${t.name} は有効な画像データを持っていません`);
        }
    });

    const packMcmeta = {
        "pack": {
            "pack_format": format,
            "supported_formats": [format, 75],
            "description": "Custom Pack"
        }
    };
    zip.file("pack.mcmeta", JSON.stringify(packMcmeta, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${name}.zip`;
    link.click();
}