export async function generateZipWithSettings(name, format, list) {
    const response = await fetch('data.json');
    const allBlocks = await response.json();
    const zip = new JSZip();

    if (!list) return;

    // 各項目を処理
    const filePromises = allBlocks.map(async (item) => {
        const edited = list.find(t => t.id === item.id);
        const dataUrl = edited ? edited.data : item.url;
        if (!dataUrl) return;

        // カテゴリ名からフォルダ名を決定 (複数形を単数形に)
        // blocks -> block, items -> item
        const categoryDir = item.category === 'blocks' ? 'block' : 'item';
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

    // pack.mcmeta 作成
    const packMcmeta = {
        "pack": {
            "pack_format": format,
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
