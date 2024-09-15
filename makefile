MAKEFLAGS := --silent --always-make
MAKE_PAR := $(MAKE) -j 128
# `--unstable` enables `Deno?.consoleSize` which is used for benchmark printing.
DENO := deno run -A --no-check --allow-hrtime --unstable
RUN := $(if $(run),--run="$(run)",)
FEAT := $(or $(feat),all_deno)
VERB := $(if $(filter $(verb),true),--verb,)
PREC := $(if $(filter $(prec),true),--prec,)
ONCE := $(if $(filter $(once),true),--once,)
TEST := test/$(FEAT)_test.mjs $(VERB) $(RUN)
BENCH := test/$(FEAT)_bench.mjs $(VERB) $(PREC) $(ONCE) $(RUN)
CMD_SRV := test/cmd_srv.mjs
CMD_DOC := doc/cmd_doc.mjs
CMD_VER_INC := doc/cmd_ver_inc.mjs
PKG := package.json
HOOK_PRE_COMMIT_FILE := .git/hooks/pre-commit
WATCH := watchexec -r -d=0 -n
WATCH_SRC := $(WATCH) -e=mjs

# This is a "function" that must be defined with "=", not ":=".
VER = $(shell jq -r '.version' < $(PKG))

test_w:
	$(DENO) --watch $(TEST) --clear

test:
	$(DENO) $(TEST)

bench_w:
	$(DENO) --watch $(BENCH)

bench:
	$(DENO) $(BENCH)

srv_w:
	$(DENO) --watch $(CMD_SRV)

srv:
	$(DENO) $(CMD_SRV)

lint_w:
	$(MAKE_PAR) lint_deno_w lint_eslint_w

lint: lint_deno lint_eslint

lint_deno_w:
	$(WATCH_SRC) -- $(MAKE) lint_deno

lint_deno:
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super,no-self-assign

lint_eslint_w:
	$(WATCH_SRC) -- $(MAKE) lint_eslint

lint_eslint:
	eslint --config=.eslintrc --ext=mjs .

doc_w:
	$(DENO) --watch $(CMD_DOC) --watch

doc:
	$(DENO) $(CMD_DOC)

watch:
	$(MAKE_PAR) test_w lint_w doc_w

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
#   * `make release`.
#
# Note: publishing to NPM is done automatically via GitHub Actions.
release: tag push

define HOOK_PRE_COMMIT
#!/bin/sh
export NO_COLOR=""
make doc && git add readme.md docs/*.md
endef
export HOOK_PRE_COMMIT

# Should be run once, after cloning the repo.
hook:
	echo "$${HOOK_PRE_COMMIT}" > $(HOOK_PRE_COMMIT_FILE)
	chmod +x $(HOOK_PRE_COMMIT_FILE)
