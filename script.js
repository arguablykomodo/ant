/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d", {
	alpha: false,
	// TODO: Unsure what this option does
	// desynchronized: false
});

const image = context.createImageData(canvas.width, canvas.height);

const layout = new Map([
	["data", canvas.width * canvas.height],
	// RGBA8. Sadly there seems to be no way to get rid of the alpha channel
	["pixels", canvas.width * canvas.height * 4],
	["pallete", (2 ** 8) * 4],
]);

// WebAssembly allocates in 4kb pages
const memorySize = Array.from(layout.values()).reduce((acc, mem) => acc + mem);
const memory = new WebAssembly.Memory({
	initial: Math.ceil(memorySize / 65536),
});

const buffers = {};
const imports = { memory };
[...layout].reduce((acc, [name, size]) => {
	buffers[name] = new Uint8Array(memory.buffer, acc, size);
	if (acc > 0) imports[name] = new WebAssembly.Global({ value: "i32" }, acc);
	return acc + size;
}, 0);

// cyan to magenta gradient
const palleteSize = layout.get("pallete");
for (let i = 0; i < palleteSize; i += 4) {
	buffers.pallete[i] = (i / palleteSize) * 256;
	buffers.pallete[i + 1] = 255 - (i / palleteSize) * 256;
	buffers.pallete[i + 2] = 255;
	buffers.pallete[i + 3] = 255;
}

WebAssembly.instantiateStreaming(fetch("main.wasm"), { "js": imports }).then(wasm => {
	wasm.instance.exports.fill();
	wasm.instance.exports.draw();
	image.data.set(buffers.pixels);
	context.putImageData(image, 0, 0);
});
