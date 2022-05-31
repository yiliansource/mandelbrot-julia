export class JuliaView {
    get aspectRatio() {
        return this.size[0] / this.size[1];
    }
    get range() {
        return [this.xRange, this.xRange / this.aspectRatio];
    }
    get rangeMin() {
        return [this.center[0] - this.range[0] / 2, this.center[1] - this.range[1] / 2];
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.canvasContext = this.canvas.getContext("2d");
        this.canvasImageData = this.canvasContext.createImageData(this.canvas.width, this.canvas.height);

        this.size = [this.canvas.width, this.canvas.height];
        this.center = [0, 0];
        this.xRange = 3.4;

        this.precision = 500;
    }

    HSLToRGB(h, s, l) {
        s /= 100;
        l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    }

    generateColor(i) {
        return [...this.HSLToRGB(250, 80, 20 + (i / this.precision) * 2000), 255];
    }

    pixelToLocal(x, y) {
        const [minX, minY] = this.rangeMin;
        const [rangeX, rangeY] = this.range;
        const [width, height] = this.size;
        return [minX + x * (rangeX / width), minY + y * (rangeY / height)];
    }

    render(c, z0) {
        const start = window.performance.now();
        const [width, height] = this.size;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // c := a + ib, z := k + il
                const [localX, localY] = this.pixelToLocal(x, y);
                let [a, b] = c(localX, localY);
                let [k, l] = z0(localX, localY);

                let i = 0;

                while (i < this.precision) {
                    let kn = k * k - l * l + a;
                    let ln = 2 * k * l + b;

                    k = kn;
                    l = ln;

                    if (k * k + l * l > 4) {
                        break;
                    }

                    i += 1;
                }

                let pixel_index = y * width + x;
                let pixel_rgba_index = pixel_index * 4;

                const rgb = i < this.precision ? this.generateColor(i) : [0, 0, 0, 255];

                for (let j = 0; j < 4; j++) {
                    this.canvasImageData.data[pixel_rgba_index + j] = rgb[j];
                }
            }
        }

        this.canvasContext.putImageData(this.canvasImageData, 0, 0);

        const end = window.performance.now();
        const dur = end - start;

        console.log("Rendering took %dms.", dur);
    }
}
