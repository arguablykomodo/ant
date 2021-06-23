WebAssembly.instantiateStreaming(fetch("main.wasm")).then(wasm => {
	console.log("2 + 2 = " + wasm.instance.exports.add(2, 2));
});
