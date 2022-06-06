/* eslint-env browser */

const msgOk = `[test] ok!`
const msgFail = `[test] fail`

try {
  await import(`./all_test.mjs`)
  await import(`./dom_test.mjs`)

  document.title = msgOk
  document.body.innerHTML = `<p class="size-double text-cen">${msgOk}</p>`

  console.log(msgOk)
}
catch (err) {
  console.error(err)

  document.title = msgFail
  document.body.textContent = err.stack
}
