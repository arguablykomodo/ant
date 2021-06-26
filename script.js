import { buildWasm } from "./wasm.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
/** @type {HTMLInputElement} */
const ruleInput = document.getElementById("rule");
/** @type {HTMLDivElement} */
const ruleContainer = document.getElementById("ruleContainer");
/** @type {HTMLAnchorElement} */
const link = document.getElementById("link");

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
	"RLRLRRRRRRRL",
];

const rule = rules[Math.floor(Math.random() * rules.length)];
ruleInput.value = rule;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d", { alpha: false });

const image = context.createImageData(canvas.width, canvas.height);

buildWasm(canvas.width, canvas.height, rule).then(({ update, pixels }) => {
	let steps = 1;
	function render() {
		const shouldContinue = update(Math.floor(steps)) === 0;
		image.data.set(pixels);
		context.putImageData(image, 0, 0);
		steps = Math.min(steps * 1.01, 1000000); // Max 1 million steps per frame
		if (shouldContinue) requestAnimationFrame(render);
		else {
			ruleContainer.className = "visible";
			link.className = "visible";
		}
	}
	requestAnimationFrame(render);
});
