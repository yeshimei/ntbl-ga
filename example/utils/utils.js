
function joinToText (arr, key, separator = ', ') {
  return arr.map(el => el[key]).join(separator)
}

function wait (time = 2000) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve()
    }, time)
  })
}

module.exports = {
  joinToText,
  wait,
}