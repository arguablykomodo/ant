(module
	(import "js" "memory" (memory 1))
	(func (export "fill") (param $size i32)
		(local $i i32)
		(loop $loop
			(i32.store (local.get $i) (i32.const 0xFFFFFFFF))
			(local.set $i (i32.add (local.get $i) (i32.const 8)))
			(br_if $loop (i32.lt_u (local.get $i) (local.get $size)))
		)
	)
)
