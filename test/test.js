const expect = require('chai').expect
const util = require('../scripts/util.js')

describe('regno', () => {
  it('regno validation', () => {
    expect(util.regnoCheck('14MSE0052')).to.be.true
    expect(util.regnoCheck('14mse0052')).to.be.false
    expect(util.regnoCheck('00mse0052')).to.be.false
    expect(util.regnoCheck('00ms0052')).to.be.false
  })
})
