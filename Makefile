EXC=brr
PERMISSIONS=--allow-read

$(VERBOSE).SILENT:

all: clean release

bin:
	mkdir $@

bin/$(EXC): mod.ts | bin
	deno compile --output $@ $(PERMISSIONS) $<

.PHONY: release
release: bin/$(EXC)
	@echo Done

.PHONY: test
test:
	deno test

.PHONY: format
format:
	deno fmt

.PHONY: clean
clean:
	if [ -d "./bin" ]; then rm -rf bin; fi
	@echo Done
