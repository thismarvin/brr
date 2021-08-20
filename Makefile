$(VERBOSE).SILENT:

.PHONY: dev
dev:
	deno run --allow-read mod.ts $(ARGS)

.PHONY: test
test:
	deno test

.PHONY: format
format:
	deno fmt
