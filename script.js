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

// 1 is R, 3 is L
const rule = [3, 1];

const layout = new Map([
	["data", canvas.width * canvas.height],
	// RGBA8. Sadly there seems to be no way to get rid of the alpha channel
	["pixels", canvas.width * canvas.height * 4],
	["pallete", (2 ** 8) * 4],

	["rule", rule.length],
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
	imports[name + "_size"] = new WebAssembly.Global({ value: "i32" }, size);
	return acc + size;
}, 0);

buffers.pallete[0] = 10;
buffers.pallete[1] = 10;
buffers.pallete[2] = 20;
buffers.pallete[3] = 255;

buffers.pallete[4] = 127;
buffers.pallete[5] = 127;
buffers.pallete[6] = 255;
buffers.pallete[7] = 255;

for (let i = 0; i < rule.length; i++) {
	buffers.rule[i] = rule[i];
}

imports.width = new WebAssembly.Global({ value: "i32" }, canvas.width);
imports.height = new WebAssembly.Global({ value: "i32" }, canvas.height);
imports.position = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
imports.direction = new WebAssembly.Global({ value: "i32", mutable: true }, 0);

WebAssembly.instantiateStreaming(fetch("main.wasm"), { "js": imports }).then(wasm => {
	function update() {
		wasm.instance.exports.update();
		image.data.set(buffers.pixels);
		context.putImageData(image, 0, 0);
		requestAnimationFrame(update);
	}
	update();
});
