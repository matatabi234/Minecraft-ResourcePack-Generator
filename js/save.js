// save.js の中
// 引数に list を追加
export async function generateZipWithSettings(name, format, list) {
    const zip = new JSZip();
    const folder = zip.folder("assets/minecraft/textures");

    // 受け取った list を使う
    list.forEach((t) => {
        const base64Data = t.data.split(',')[1];
        folder.file(`${t.name}.png`, base64Data, { base64: true });
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