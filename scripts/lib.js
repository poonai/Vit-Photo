const parser = require('./parser.js')
const cheerio = require('cheerio')
const request = require('request')
const cache = require('memory-cache')
//  var keen=require('keen-js')
const fs = require('fs')
/*  const keenClient=new keen({
    projectId: process.env.KEEN_ID,
    writeKey: process.env.KEEN_WRITE_KEY,
    readKey: process.env.KEEN_READ_KEY
  })  */
const friends = require('./friends.js')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

const getCookie = (cb) => {
  let jar = request.jar()
  request.get({url: 'https://vtop.vit.ac.in/student/captcha.asp', jar: jar}, (err, res, body) => {
    let pixMap = parser.getPixelMapFromBuffer(new Buffer(res.body))
    let captcha = parser.getCaptcha(pixMap)
    if (err) {
      cb(err, null)
    } else {
      request.post({
        url: 'https://vtop.vit.ac.in/student/stud_login_submit.asp',
        form: {
          regno: process.env.REGNO,
          passwd: process.env.PASS,
          vrfcd: captcha,
          message: ''
        },
        jar: jar
      }, (err, res, body) => {
        if (err) {
          cb(err, null)
        } else {
          cb(null, jar.getCookieString('https://vtop.vit.ac.in/student/stud_login_submit.asp'))
        }
      })
    }
  })
}

let getLoginJar = (cb) => {
  let cookie = cache.get('cookie')
  if (cookie == null) {
    getCookie((err, cookieString) => {
      if (err) {
        cb(err, null)
      } else {
        cache.put('cookie', cookieString, 10000)
        getLoginJar(cb)
      }
    })
  } else {
    let jar = request.jar()
    cache.put('cookie', cookie, 10000)
    cookie.split(';').forEach((x) => {
      jar.setCookie(request.cookie(x), 'https://vtop.vit.ac.in/student/stud_login_submit.asp')
    })
    cb(null, jar)
  }
}

exports.getImage = (regno, cb) => {
  regno = regno.toUpperCase()
  if (friends.indexOf(regno) > -1) {
    cb(null, fs.createReadStream(__dirname+'/photos/'+regno+'.jpg'))
  } else {
    getLoginJar((err, jar) => {
      if (err) {
        cb(err, null)
      } else {
        request.get({
          url: 'https://vtop.vit.ac.in/student/view_photo_2.asp?rgno=' + regno,
          jar: jar
        }, (err, res, body) => {
          if (err) {
            cb(err, null)
          } else {
            let stream = request.get({
              url: 'https://vtop.vit.ac.in/student/view_photo_2.asp?rgno=' + regno,
              jar: jar
            })
            cb(null, stream)
          }
        })
      }
    })
  }
}

exports.getName = (regno, cb) => {
  regno = regno.toUpperCase()
  getLoginJar(function (err, jar) {
    if (err) {
      cb(err, null)
    } else {
      request.get({
        url: 'https://vtop.vit.ac.in/student/hostel_roommate_eligibility.asp',
        jar: jar
      }, (err, res, body) => {
        request.get({
          url: 'https://vtop.vit.ac.in/student/hostel_roommate_eligibility.asp',
          jar: jar
        }, (err, res, body) => {
          request.post({
            url: 'https://vtop.vit.ac.in/student/hostel_roommate_eligibility.asp',
            jar: jar,
            form: {
              stdregno: regno
            }
          }, (err, res, body) => {
            if (err) {
              cb(err, null)
            } else {
              let $ = cheerio.load(res.body)
              let name = $('td').attr('colspan', '2').eq(-2).text()
              cb(null, name)
            }
          })
        })
      })
    }
  })
}
