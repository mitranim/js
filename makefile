MAKEFLAGS := --silent --always-make
MAKE_CONC := $(MAKE) -j 128 clear=$(or $(clear),false)
RUN ?= $(if $(run),--run="$(run)",)
FEAT ?= $(or $(feat),all_deno)
VERB ?= $(if $(filter true,$(verb)),--verb,)
PREC ?= $(if $(filter true,$(prec)),--prec,)
ONCE ?= $(if $(filter true,$(once)),--once,)
TEST ?= test/$(FEAT)_test.mjs $(VERB) $(RUN)
BENCH ?= test/$(FEAT)_bench.mjs $(VERB) $(PREC) $(ONCE) $(RUN)
CMD_SRV ?= test/cmd_srv.mjs
CMD_DOC ?= doc/cmd_doc.mjs
CMD_VER_INC ?= doc/cmd_ver_inc.mjs
PKG ?= package.json
HOOK_PRE_COMMIT_FILE ?= .git/hooks/pre-commit
CLEAR ?= $(if $(filter false,$(clear)),, )
CMD_CLEAR ?= $(and $(CLEAR),--clear)
DENO_RUN ?= deno run -A --no-check --node-modules-dir=false
DENO_WATCH ?= $(DENO_RUN) --watch $(if $(CLEAR),,--no-clear-screen)
WATCH ?= watchexec $(and $(CLEAR),-c) -r -d=1ms -n
WATCH_SRC ?= $(WATCH) -e=mjs

# This is a "function" that must be defined with "=", not ":=".
VER = $(shell jq -r '.version' < $(PKG))

test_w:
	$(DENO_WATCH) $(TEST) $(CMD_CLEAR)

test:
	$(DENO_RUN) $(TEST)

bench_w:
	$(DENO_WATCH) $(BENCH) $(CMD_CLEAR)

bench:
	$(DENO_RUN) $(BENCH)

srv_w:
	$(DENO_WATCH) $(CMD_SRV)

srv:
	$(DENO_RUN) $(CMD_SRV)

lint_w:
	$(MAKE_CONC) lint_deno_w lint_eslint_w

lint: lint_deno lint_eslint

lint_deno_w:
	$(WATCH_SRC) -- $(MAKE) lint_deno

lint_deno:
	deno lint --rules-exclude=no-empty,require-yield,require-await,constructor-super,no-self-assign

lint_eslint_w:
	$(WATCH_SRC) -- $(MAKE) lint_eslint

# Requires `eslint` to be installed globally.
lint_eslint:
	eslint --config=.eslintrc --ext=mjs .

doc_w:
	$(DENO_WATCH) $(CMD_DOC) --watch $(CMD_CLEAR)

doc:
	$(DENO_RUN) $(CMD_DOC)

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
pub: tag push

# Trims trailing whitespace from all tracked files, then rebuilds the docs.
# The `-i ''` is required on MacOS, do not remove.
define HOOK_PRE_COMMIT
#!/bin/sh
git ls-files | xargs sed -i '' 's/[[:space:]]*$$//' &&
NO_COLOR= make doc &&
git add -u
endef
export HOOK_PRE_COMMIT

# Should be run once, after cloning the repo.
hook:
	echo "$${HOOK_PRE_COMMIT}" > $(HOOK_PRE_COMMIT_FILE)
	chmod +x $(HOOK_PRE_COMMIT_FILE)
