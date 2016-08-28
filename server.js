const express=require('express')
const app=express()
const viewer=require('./lib.js').viewer
app.get('/',function (req,res,next) {
  res.json({
    status:true,
    description:'vit student photo viewer made with love मोहब्बत அன்பு',
    author:'SchoolBoy',
    rep:'https://github.com/sch00lb0y/Vit-Photo',
    twitter:'https://twitter.com/rbalajis25',
    example:'http://summaa.herokuapp.com/14MSE0052 replace the existing regno with your regno'
  })
})
app.get('/:regno',viewer)
app.listen(process.env.PORT||2000)
