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

const dataSize = canvas.width * canvas.height;
// RGBA8. Sadly there seems to be no way to get rid of the alpha channel
const pixelsSize = canvas.width * canvas.height * 4;
const palleteSize = (2 ** 8) * 4;

// WebAssembly allocates in 4kb pages
const memory = new WebAssembly.Memory({
	initial: Math.ceil((dataSize + pixelsSize + palleteSize) / 65536),
});

const data = new Uint8Array(memory.buffer, 0, dataSize);
const pixels = new Uint8Array(memory.buffer, dataSize, pixelsSize);
const pallete = new Uint8Array(memory.buffer, dataSize + pixelsSize, palleteSize);

// cyan to magenta gradient
for (let i = 0; i < palleteSize; i += 4) {
	pallete[i] = (i / palleteSize) * 256;
	pallete[i + 1] = 255 - (i / palleteSize) * 256;
	pallete[i + 2] = 255;
	pallete[i + 3] = 255;
}

WebAssembly.instantiateStreaming(fetch("main.wasm"), {
	"js": {
		pixels: new WebAssembly.Global({ value: "i32" }, dataSize),
		pallete: new WebAssembly.Global({ value: "i32" }, dataSize + pixelsSize),
		memory,
	}
}).then(wasm => {
	wasm.instance.exports.fill(dataSize);
	wasm.instance.exports.draw(dataSize, dataSize + pixelsSize);
	image.data.set(pixels);
	context.putImageData(image, 0, 0);
});
