exports.regnoCheck = (regno) => {
  let pattern = new RegExp(/[0-1]{1}[1-7]{1}[A-Z]{3}[0-9]{4}/)
  return pattern.test(regno)
}
