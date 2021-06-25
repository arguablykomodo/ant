// HSL magic courtesy of https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative

/**
 * @param {number} n
 * @param {number} h
 * @param {number} s
 * @param {number} l
 */
function magic(n, h, s, l) {
	const k = (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} l
 */
function HslToRgb(h, s, l) {
	return [magic(0, h, s, l), magic(8, h, s, l), magic(4, h, s, l)]
}

const phi = (1 + Math.sqrt(5)) / 2;
const s = 0.5;

/**
 * @param {Uint8Array} buffer
 */
export function randomPallete(buffer, ruleSize) {
	let h = Math.random() * 360;
	let l = 0;
	for (let i = 0; i < ruleSize * 4; i += 4) {
		const [r, g, b] = HslToRgb(h, s, l);
		buffer[i] = Math.floor(r * 256);
		buffer[i + 1] = Math.floor(g * 256);
		buffer[i + 2] = Math.floor(b * 256);
		buffer[i + 3] = 255;
		l = (l + phi) % 1;
		h = (h + 1 / ruleSize * 120) % 360;
	}
}
