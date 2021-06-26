import { buildWasm } from "./wasm.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
/** @type {HTMLInputElement} */
const ruleInput = document.getElementById("rule");
/** @type {HTMLAnchorElement} */
const ruleLink = document.getElementById("ruleLink");
/** @type {HTMLDivElement} */
const ruleContainer = document.getElementById("ruleContainer");
/** @type {HTMLAnchorElement} */
const infoLink = document.getElementById("infoLink");

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

const urlParams = (new URL(document.location)).searchParams;
const rule = urlParams.has("rule")
	? urlParams.get("rule")
	: rules[Math.floor(Math.random() * rules.length)];

ruleInput.value = rule;
ruleLink.href = `?rule=${rule}`;

ruleInput.addEventListener("input", () => {
	ruleLink.href = `?rule=${ruleInput.value}`;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d", { alpha: false });

const image = context.createImageData(canvas.width, canvas.height);

function showControls() {
	ruleContainer.className = "visible";
	infoLink.className = "visible";
}

setTimeout(showControls, 20 * 1000);
buildWasm(canvas.width, canvas.height, rule).then(({ update, pixels }) => {
	let steps = 1;
	function render() {
		const shouldContinue = update(Math.floor(steps)) === 0;
		image.data.set(pixels);
		context.putImageData(image, 0, 0);
		steps = Math.min(steps * 1.01, 1000000); // Max 1 million steps per frame
		if (shouldContinue) requestAnimationFrame(render);
		else showControls();
	}
	requestAnimationFrame(render);
});
