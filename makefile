MAKEFLAGS := --silent --always-make
MAKE_CONC := $(MAKE) -j 128 clear=$(or $(clear),false)
RUN ?= $(and $(run),--run="$(run)")
FEAT ?= $(or $(feat),all)
VERB ?= $(if $(filter true,$(verb)),--verb,)
PREC ?= $(if $(filter true,$(prec)),--prec,)
ONCE ?= $(if $(filter true,$(once)),--once,)
TEST ?= test/$(FEAT)_test.mjs $(VERB) $(RUN)
BENCH ?= test/$(FEAT)_bench.mjs $(VERB) $(PREC) $(ONCE) $(RUN)
CMD_DOC ?= doc/cmd_doc.mjs
PKG ?= package.json
HOOK_PRE_COMMIT_FILE ?= .git/hooks/pre-commit
CLEAR ?= $(if $(filter false,$(clear)),, )
CMD_CLEAR ?= $(and $(CLEAR),--clear)
CMD_SRV ?= test/cmd_srv.mjs
WATCH ?= watchexec $(and $(CLEAR),-c) -q -r -d=1ms -n
WATCH_SRC ?= $(WATCH) -e=mjs
ESLINT ?= bunx --bun eslint@9.31.0 --config .eslint.config.mjs --ignore-pattern=local .

ifeq ($(engine),deno)
	JS_RUN ?= deno run -A --no-check --quiet --v8-flags=--expose_gc
else ifeq ($(engine),node)
	JS_RUN ?= node
else
	JS_RUN ?= bun run
endif

JS_WATCH ?= $(JS_RUN) --watch $(or $(CLEAR),--no-clear-screen)

ifeq ($(engine),deno)
	JS_WATCH_HOT ?= $(JS_RUN) --watch-hmr $(or $(CLEAR),--no-clear-screen)
else ifeq ($(engine),node)
	JS_WATCH_HOT ?= $(JS_WATCH)
else
	JS_WATCH_HOT ?= $(JS_WATCH) --hot
endif

# Defined with "=" for lazy execution.
VER = $(shell jq -r '.version' < $(PKG))

test_w:
	$(JS_WATCH) $(TEST) $(CMD_CLEAR)

test:
	$(JS_RUN) $(TEST)

bench_w:
	$(JS_WATCH) $(BENCH) $(CMD_CLEAR)

bench:
	$(JS_RUN) $(BENCH)

srv_w:
	$(JS_WATCH_HOT) $(CMD_SRV) --live

srv:
	$(JS_RUN) $(CMD_SRV) --live

lint_w:
	$(MAKE_CONC) lint_deno_w lint_eslint_w

lint: lint_deno lint_eslint

lint_deno_w:
	$(WATCH_SRC) -- $(MAKE) lint_deno

lint_deno:
	deno lint

lint_eslint_w:
	$(WATCH_SRC) -- $(MAKE) lint_eslint

lint_eslint:
	$(ESLINT)

doc_w:
	$(JS_WATCH) $(CMD_DOC) --watch $(CMD_CLEAR)

doc:
	$(JS_RUN) $(CMD_DOC)

watch:
	$(MAKE_CONC) test_w lint_w doc_w

prep: test lint doc

tag:
	git tag $(VER)

untag:
	git tag -d $(VER)

push:
	git push origin $(VER) $$(git symbolic-ref --short HEAD)

# Usage:
#
#   * Update the version in `package.json`.
#   * `make prep`.
#   * Commit.
#   * `make pub`.
#
# Note: publishing to NPM is done automatically via GitHub Actions.
pub: prep tag push

# Trims trailing whitespace from all tracked files, then rebuilds the docs.
# The `-i ''` is required on MacOS, do not remove.
define HOOK_PRE_COMMIT
#!/bin/sh
git ls-files | xargs sed -i '' 's/[[:space:]]*$$//' &&
NO_COLOR=true make doc &&
git add -u
endef
export HOOK_PRE_COMMIT

# Should be run once, after cloning the repo.
hook:
	echo "$${HOOK_PRE_COMMIT}" > $(HOOK_PRE_COMMIT_FILE)
	chmod +x $(HOOK_PRE_COMMIT_FILE)
