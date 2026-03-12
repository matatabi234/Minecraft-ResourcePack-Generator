// tools.js
export const tools = {
    pen: {
        draw(ctx, x, y, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    },
    line: {
        draw(ctx, x, y) {
            alert("直線ツールは現在調整中です！また今度実装しますね。");
        }
    },
    fill: {
        draw(ctx, startX, startY, color) {
            const imageData = ctx.getImageData(0, 0, 16, 16);
            const data = imageData.data;
            const targetColor = this.getPixel(data, startX, startY);
            const fillColor = this.hexToRgba(color);

            if (this.colorsMatch(targetColor, fillColor)) return;

            // スタックを使った塗りつぶし（再帰よりメモリに優しい）
            const stack = [[startX, startY]];
            while (stack.length > 0) {
                const [x, y] = stack.pop();
                const i = (y * 16 + x) * 4;

                if (this.colorsMatch(this.getPixel(data, x, y), targetColor)) {
                    data[i] = fillColor[0];
                    data[i+1] = fillColor[1];
                    data[i+2] = fillColor[2];
                    data[i+3] = fillColor[3];

                    if (x + 1 < 16) stack.push([x + 1, y]);
                    if (x - 1 >= 0) stack.push([x - 1, y]);
                    if (y + 1 < 16) stack.push([x, y + 1]);
                    if (y - 1 >= 0) stack.push([x, y - 1]);
                }
            }
            ctx.putImageData(imageData, 0, 0);
        },
        getPixel(data, x, y) {
            const i = (y * 16 + x) * 4;
            return [data[i], data[i+1], data[i+2], data[i+3]];
        },
        colorsMatch(c1, c2) { return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3]; },
        hexToRgba(hex) {
            return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
        }
    },
    eraser: {
        draw(ctx, x, y) {
            // その地点を透明にする
            ctx.clearRect(x, y, 1, 1);
        }
    }
};