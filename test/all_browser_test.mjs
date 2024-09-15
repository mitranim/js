/* eslint-env browser */

const msgOk = `[test] ok!`
const msgFail = `[test] fail`

try {
  (await import(`../dom_reg.mjs`)).Reg.main.setDefiner(customElements)
  await import(`./all_test.mjs`)
  await import(`./lang_browser_test.mjs`)
  await import(`./dom_browser_test.mjs`)
  await import(`./iter_browser_test.mjs`)

  document.title = msgOk
  document.body.innerHTML = `<p class="size-double text-cen">${msgOk}</p>`
  console.log(msgOk)
}
catch (err) {
  console.error(err)
  document.title = msgFail
  document.body.textContent = err.stack
}
