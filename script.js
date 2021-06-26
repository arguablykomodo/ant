import { randomPallete } from "./pallete.js"

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

const rules = [
	"LR",
	"RRLR",
	"RLRRLLRLLLLL",
	"RRLLLRLLLRLL",
	"LLRR",
	"RLLR",
	"RRLLLRLLLRRR",
	"RRRLRRLRRR",
	"RRLRLLRLRR",
	"RRLLLRLLLR",
	"RRLRLLRRRRLL",
	"RLLLLRRRLLL",
	"RLLLLLLRRRRL",
	"RRLLLRLLLLL",
	"RRLRRRLLLLLL",
	"RLLRRRLRRRRR",
	"RLRLRRRRRRRL"
];
const ruleText = rules[Math.floor(Math.random() * rules.length)];
document.getElementById("rule").value = ruleText
const rule = ruleText.split("").map(char => char === "R" ? 1 : 3);

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

for (let i = 0; i < rule.length; i++) {
	buffers.rule[i] = rule[i];
}

imports.width = new WebAssembly.Global({ value: "i32" }, canvas.width);
imports.position = new WebAssembly.Global({ value: "i32", mutable: true }, 0);
imports.direction = new WebAssembly.Global({ value: "i32", mutable: true }, 0);

randomPallete(buffers.pallete, buffers.rule.length);

WebAssembly.instantiateStreaming(fetch("main.wasm"), { "js": imports }).then(wasm => {
	let steps = 1;
	function update() {
		const result = wasm.instance.exports.update(Math.floor(steps));
		image.data.set(buffers.pixels);
		context.putImageData(image, 0, 0);
		steps = Math.min(steps * 1.01, 1000000); // Max 1 million steps per frame
		if (result === 0) requestAnimationFrame(update);
		else {
			document.getElementById("ruleContainer").className = "visible";
			document.getElementById("link").className = "visible";
		}
	}
	update();
});
