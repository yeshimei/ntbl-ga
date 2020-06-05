function noop () {}

function handleError (err) {
  console.log(err);
  process.exit(1)
}


module.exports = {
  noop,
  handleError
}