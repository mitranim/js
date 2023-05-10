await import(`./all_test.mjs`)
await import(`./io_deno_test.mjs`)
await import(`./http_deno_test.mjs`)

if (import.meta.main) console.log(`[test] ok!`)
