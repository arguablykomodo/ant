/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const context = canvas.getContext("2d", {
	alpha: false,
	// TODO: Unsure what this option does
	// desynchronized: false
});

// RGBA8. Sadly there seems to be no way to get rid of the alpha channel
const pixelsSize = canvas.width * canvas.height * 4;
// WebAssembly allocates in 4kb pages
const memory = new WebAssembly.Memory({ initial: Math.ceil(pixelsSize / 65536) });
const pixels = new Uint8Array(memory.buffer, 0, pixelsSize);

const image = context.createImageData(canvas.width, canvas.height);

WebAssembly.instantiateStreaming(fetch("main.wasm"), { "js": { memory } }).then(wasm => {
	wasm.instance.exports.fill(pixelsSize);
	image.data.set(pixels);
	context.putImageData(image, 0, 0);
});
