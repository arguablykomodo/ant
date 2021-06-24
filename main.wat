(module
	(import "js" "memory" (memory 1))
	(import "js" "data_size" (global $data_size i32))
	(import "js" "pixels" (global $pixels i32))
	(import "js" "pallete" (global $pallete i32))
	(import "js" "rule" (global $rule i32))
	(import "js" "rule_size" (global $rule_size i32))

	(import "js" "width" (global $width i32))
	(import "js" "height" (global $height i32))
	(import "js" "position" (global $position (mut i32)))
	(import "js" "direction" (global $direction (mut i32)))

	(func $set_pixel (param $i i32) (param $color i32)
		(i32.store
			(i32.add
				(i32.mul
					(local.get $i)
					(i32.const 4))
				(global.get $pixels))
			(i32.load
				(i32.add
					(i32.mul
						(local.get $color)
						(i32.const 4))
					(global.get $pallete)))))

	(start $setup)
	(func $setup (export "setup")
		(local $i i32)
		(global.set $direction (i32.const 2))
		(global.set $position
			(i32.add
				(i32.mul
					(i32.div_u
						(global.get $height)
						(i32.const 2))
					(global.get $width))
				(i32.div_u
					(global.get $width)
					(i32.const 2))))
		(loop $loop
			(i32.store8
				(local.get $i)
				(i32.const 0))
			(call $set_pixel
				(local.get $i)
				(i32.const 0))
			(local.set $i
				(i32.add
					(local.get $i)
					(i32.const 1)))
			(br_if $loop
				(i32.lt_u
					(local.get $i)
					(global.get $data_size)))))

	(func $update (export "update")
		(local $state i32)
		(local.set $state
			(i32.load8_u
				(global.get $position)))
		(i32.store8
			(global.get $position)
			(i32.rem_u
				(i32.add
					(local.get $state)
					(i32.const 1))
				(global.get $rule_size)))
		(call $set_pixel
			(global.get $position)
			(i32.load8_u
				(global.get $position)))
		(global.set $direction
			(i32.rem_u
				(i32.add
					(global.get $direction)
					(i32.load8_u
						(i32.add
							(local.get $state)
							(global.get $rule))))
				(i32.const 4)))
		(if
			(i32.eq
				(global.get $direction)
				(i32.const 0))
			(then
				(global.set $position
					(i32.add
						(global.get $position)
						(i32.const 1))))
		(else (if
			(i32.eq
				(global.get $direction)
				(i32.const 1))
			(then
				(global.set $position
					(i32.sub
						(global.get $position)
						(global.get $width))))
		(else (if
			(i32.eq
				(global.get $direction)
				(i32.const 2))
			(then
				(global.set $position
					(i32.sub
						(global.get $position)
						(i32.const 1))))
		(else (if
			(i32.eq
				(global.get $direction)
				(i32.const 3))
			(then
				(global.set $position
					(i32.add
						(global.get $position)
						(global.get $width)))))))))))))
