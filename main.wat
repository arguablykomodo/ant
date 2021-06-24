(module
	(import "js" "memory" (memory 1))
	(import "js" "pixels" (global $pixels i32))
	(import "js" "pallete" (global $pallete i32))

	(func $pixel_i (param $i i32) (result i32)
		(i32.add
			(i32.mul
				(local.get $i)
				(i32.const 4))
			(global.get $pixels)))

	(func $pallete_i (param $i i32) (result i32)
		(i32.add
			(i32.mul
				(local.get $i)
				(i32.const 4))
			(global.get $pallete)))

	(func $fill (export "fill")
		(local $i i32)
		(local $acc i32)
		(loop $loop
			(i32.store
				(local.get $i)
				(local.get $acc))
			(local.set $i
				(i32.add
					(local.get $i)
					(i32.const 1)))
			(local.set $acc
				(i32.rem_u
					(i32.add
						(local.get $acc)
						(i32.const 1))
					(i32.const 256)))
			(br_if $loop
				(i32.lt_u
					(local.get $i)
					(global.get $pixels)))))

	(func $draw (export "draw")
		(local $i i32)
		(loop $loop
			(i32.store
				(call $pixel_i (local.get $i))
				(i32.load (call $pallete_i (i32.load8_u (local.get $i)))))
			(local.set $i
				(i32.add
					(local.get $i)
					(i32.const 1)))
			(br_if $loop
				(i32.lt_u
					(local.get $i)
					(global.get $pixels))))))
