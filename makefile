MAKEFLAGS := --silent --always-make
PAR := $(MAKE) -j 128
DENO := deno run --no-check --unstable --allow-hrtime
RUN := $(if $(run),--run="$(run)",)
FEAT := $(or $(feat),all_deno)
VERB := $(if $(filter $(verb),true),--verb,)
PREC := $(if $(filter $(prec),true),--prec,)
TEST := test/$(FEAT)_test.mjs $(VERB) $(RUN)
BENCH := test/$(FEAT)_bench.mjs $(VERB) $(PREC) $(RUN)
DOC := doc/doc.mjs
VER = $(or $(ver),$(shell cat ver))

test_w:
	$(DENO) --watch $(TEST)

test:
	$(DENO) $(TEST)

bench_w:
	$(DENO) --watch $(BENCH)

bench:
	$(DENO) $(BENCH)

srv_w:
	$(DENO) -A --watch test/srv.mjs

lint_w:
	watchexec -r -c -d=0 -e=mjs -n -- $(MAKE) lint

lint:
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super

doc_w:
	$(DENO) -A --watch $(DOC) --watch

doc:
	$(DENO) -A $(DOC)

watch:
	$(PAR) test_w lint_w doc_w

prep: test
	$(PAR) lint doc

ver:
	printf '%s' "$(VER)" > ver

tag:
	git tag $(VER)

untag:
	git tag -d $(VER)

# Usage:
#
#   make ver doc ver=<new_ver>
#   <commit>
#   make tag push
push:
	git push origin $(VER)

define PRE_COMMIT
#!/bin/sh
export NO_COLOR=""
make doc && git add readme.md docs/*.md
endef
export PRE_COMMIT

# Should be run once, after cloning the repo. Requires Unix.
hook:
	$(eval OUT := .git/hooks/pre-commit)
	echo "$${PRE_COMMIT}" > $(OUT)
	chmod +x $(OUT)
