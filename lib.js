var unirest=require('unirest');
var parser=require('./parser.js');
var cheerio=require('cheerio');
var request=require('request')
var cache=require('memory-cache')
var keen=require('keen-js')
const keenClient=new keen({
    projectId: process.env.KEEN_ID, // String (required always)
    writeKey: process.env.KEEN_WRITE_KEY,   // String (required for sending data)
    readKey: process.env.KEEN_READ_KEY      // String (required for querying data)

    // protocol: "https",         // String (optional: https | http | auto)
    // host: "api.keen.io/3.0",   // String (optional)
    // requestType: "jsonp"       // String (optional: jsonp, xhr, beacon)
  })
const friends=require('./friends.js')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const fs=require('fs')

const getCookie=function (cb) {
  cachedCookie=cache.get('mycookie')

  if(cachedCookie==null){
    unirest.get("https://vtop.vit.ac.in/student/captcha.asp").headers({'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20150101 Firefox/44.0 (Chrome)'}).end(function(response){
              const key = Object.keys(response.cookies)[0];
              Serial=key+'='+response.cookies[key]

                 var CookieJar = unirest.jar();
                 CookieJar.add(unirest.cookie(Serial),"https://vtop.vit.ac.in/student/stud_login_submit.asp");
              pixMap=parser.getPixelMapFromBuffer(new Buffer(response.body));
              captcha=parser.getCaptcha(pixMap);
             unirest.post("https://vtop.vit.ac.in/student/stud_login_submit.asp").headers({'User-Agent':'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20150101 Firefox/44.0 (Chrome)'}).jar(CookieJar).form({
                  regno:process.env.REGNO,
                  passwd:process.env.PASS,
                  vrfcd:captcha
              }).end(function(response){

                cache.put('mycookie',Serial,1*30*1000);

                 cb(Serial)
                 console.log("no cached");
            })

    })
  }else {
    cb(cachedCookie)
    console.log("cached");
  }
}
exports.viewer = function (Sreq,Sres) {
  regno=Sreq.params.regno.toUpperCase()
  keenClient.addEvent("regno",{"regno":regno,"keen": {
    timestamp: new Date().toISOString()
  }},function (err,result) {
   console.log("keen log");
      console.log(result);
  })
  if(friends.indexOf(regno)>-1){
    fs.createReadStream(__dirname+'/photos/'+regno+'.jpg').pipe(Sres)
  }else {
    getCookie(function (Serial) {
                  console.log(Serial);
         if(Serial!=null){
        var jar=request.jar();
        jar.setCookie(request.cookie(Serial),'https://vtop.vit.ac.in/student/view_photo_2.asp?rgno=14MSE0001');
        request.get({url:'https://vtop.vit.ac.in/student/view_photo_2.asp?rgno='+regno,jar:jar},function (err,res,body) {
        request.get({url:'https://vtop.vit.ac.in/student/view_photo_2.asp?rgno='+regno,jar:jar}).pipe(Sres)
        })
}else{
  Sres.json({
    status:false,
    message:"sorry for inconvenience..pls blame vtop server don't blame me :-("
  })
}

    })
  }


};
