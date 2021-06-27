import { randomPallete } from "./pallete.js";

/**
 * @param {number} value
 * @param {boolean} [mutable=false]
 */
function global(value, mutable = false) {
	return new WebAssembly.Global({ value: "i32", mutable }, value);
}

/**
 * @param {number} width
 * @param {number} height
 * @param {string} rule
 */
export async function buildWasm(width, height, rule) {
	const dataSize = width * height;

	const pixelsStart = dataSize;
	const pixelsSize = dataSize * 4;

	const palleteStart = pixelsStart + pixelsSize;
	const palleteSize = (2 ** 8) * 4;

	const ruleStart = palleteStart + palleteSize;
	const ruleSize = rule.length;

	// WebAssembly allocates in 4kb pages
	const memory = new WebAssembly.Memory({
		initial: Math.ceil((ruleStart + ruleSize) / 65536),
	});

	const imports = {
		memory,
		data_size: global(dataSize),
		pallete: global(palleteStart),
		rule: global(ruleStart),
		rule_size: global(ruleSize),
		width: global(width),
		height: global(height),
		position: global(0, true),
		direction: global(0, true),
	};

	const pixelsBuffer = new Uint8Array(memory.buffer, pixelsStart, pixelsSize);
	const palleteBuffer = new Uint8Array(memory.buffer, palleteStart, palleteSize);
	const ruleBuffer = new Uint8Array(memory.buffer, ruleStart, ruleSize);

	randomPallete(palleteBuffer, ruleSize);

	for (let i = 0; i < ruleSize; i++) {
		ruleBuffer[i] = rule[i] === "R" ? 1 : 3;
	}

	const wasm = await WebAssembly.instantiateStreaming(fetch("main.wasm"), { js: imports });
	return {
		update: wasm.instance.exports.update,
		pixels: pixelsBuffer,
	};
}
