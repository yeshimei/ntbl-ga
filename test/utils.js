
export async function sendKey (app, key) {
  await app.$router.push('/' + key)
}

export async function wait (time = 1000) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time);
  })
}

