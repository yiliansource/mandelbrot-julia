import { JuliaView } from "./juliaView.js";

const mandelbrot = new JuliaView(document.querySelector("canvas#mandelbrot"));
mandelbrot.center = [-0.65, 0];
mandelbrot.render(
    (x, y) => [x, y],
    () => [0, 0]
);

const julia = new JuliaView(document.querySelector("canvas#julia"));
julia.render(
    () => [-0.77, -0.22],
    (x, y) => [x, y]
);

const controlHandle = document.querySelector(".control-handle");
const container = controlHandle.parentElement;
container.addEventListener("mousedown", function (e) {
    const rect = this.getBoundingClientRect();
    const pixelX = -rect.left + e.clientX,
        pixelY = -rect.top + e.clientY;
    controlHandle.style.left = pixelX + "px";
    controlHandle.style.top = pixelY + "px";
    const c = mandelbrot.pixelToLocal(pixelX, pixelY);
    julia.render(
        () => c,
        (x, y) => [x, y]
    );
});
