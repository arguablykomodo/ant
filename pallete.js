// HSV magic courtesy of https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative

/**
 * @param {number} n
 * @param {number} h
 * @param {number} s
 * @param {number} v
 */
function magic(n, h, s, v) {
	const k = (n + h / 60) % 6;
	return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} v
 */
function HslToRgb(h, s, v) {
	return [magic(5, h, s, v), magic(3, h, s, v), magic(1, h, s, v)];
}

const phi = (1 + Math.sqrt(5)) / 2;
const s = 0.5;

/**
 * @param {Uint8Array} buffer
 */
export function randomPallete(buffer, ruleSize) {
	let h = Math.random() * 360;
	let v = 0;
	for (let i = 0; i < ruleSize * 4; i += 4) {
		const [r, g, b] = HslToRgb(h, s, v);
		buffer[i] = Math.floor(r * 256);
		buffer[i + 1] = Math.floor(g * 256);
		buffer[i + 2] = Math.floor(b * 256);
		buffer[i + 3] = 255;
		v = (v + phi) % 1;
		h = (h + 1 / ruleSize * 120) % 360;
	}
}
