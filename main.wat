(module
	(import "js" "memory" (memory 1))
	(import "js" "data_size" (global $data_size i32))
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
				(global.get $data_size))
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
				(i32.div_u
					(global.get $data_size)
					(i32.const 2))
				(i32.mul ;; Add half a width if the height is even
					(i32.div_u
						(global.get $width)
						(i32.const 2))
					(i32.xor
						(i32.and
							(global.get $height)
							(i32.const 1))
						(i32.const 1)))))
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

	(func $step (result i32)
		(local $state i32)
		(local $magic i32)
		(local $row_position i32)
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
		(local.set $row_position
			(i32.rem_u
				(global.get $position)
				(global.get $width)))
		(if
			(i32.or
				(i32.or
					(i32.lt_u ;; Top edge
						(global.get $position)
						(global.get $width))
					(i32.gt_u ;; Bottom edge
						(global.get $position)
						(i32.sub
							(global.get $data_size)
							(global.get $width))))
				(i32.or
					(i32.eqz ;; Left edge
						(local.get $row_position))
					(i32.ge_u ;; Right edge
						(local.get $row_position)
						(i32.sub
							(global.get $width)
							(i32.const 2)))))
			(then
				(return
					(i32.const 1))))
		(global.set $direction
			(i32.rem_u
				(i32.add
					(global.get $direction)
					(i32.load8_u
						(i32.add
							(local.get $state)
							(global.get $rule))))
				(i32.const 4)))
		;; Here be dragons
		(local.set $magic
			(i32.sub
				(i32.mul
					(i32.gt_u
						(global.get $direction)
						(i32.const 1))
					(i32.const 2))
				(i32.const 1)))
		(global.set $position
			(i32.add
				(global.get $position)
				(i32.add
					(i32.mul
						(i32.mul
							(i32.add
								(global.get $width)
								(i32.const 1))
							(i32.and
								(global.get $direction)
								(i32.const 1)))
						(local.get $magic))
					(i32.mul
						(local.get $magic)
						(i32.const -1)))))
		(return
			(i32.const 0)))

	(func $update (export "update") (param $steps i32) (result i32)
		(local $i i32)
		(loop $loop
			(if
				(call $step)
				(then
					(return
						(i32.const 1))))
			(local.set $i
				(i32.add
					(local.get $i)
					(i32.const 1)))
			(br_if $loop
				(i32.lt_u
					(local.get $i)
					(local.get $steps))))
		(return
			(i32.const 0))))
