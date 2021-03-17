var express = require('express');
var router = express.Router();
var userHelper = require('../helper/userHelper')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('loginPage',{'mob':req.session.logMob,'psd':req.session.logPsd});
  req.session.logMob=false
  req.session.logPsd=false
});
router.get('/signup',(req,res)=>
{
  res.render('signupPage',{'mobErr':req.session.mob,'emailErr':req.session.email})
  req.session.mob=false
  req.session.email=false
})
router.post('/login',(req,res)=>
{
  console.log(req.body);
  userHelper.login(req.body).then((result)=>
  {
    if(result.success)
    {
      console.log("Success Login");
      res.redirect('/chat')
    }
    if(result.invalidPassword)
    {
      req.session.logPsd="Invalid Password"
      res.redirect('/')
      console.log("Invalid psd");
    }
    if(result.invalidUser)
    {
      req.session.logMob="Invalid User"
      res.redirect('/')
      console.log("Invalid user");
    }
  })
})
router.post('/signup',(req,res)=>
{
  console.log(req.body);
  userHelper.signup(req.body).then((response)=>
  {
    if(response.insert)
    {
      console.log("Value Inserted");
      res.redirect('/')
    }
    if(response.email)
    {
      req.session.email="Email Already Exists"
      res.redirect('/signup')
      console.log("email already exist");
    }
    else{
      req.session.mob="Phone Number Already Exists"
      res.redirect('/signup')
      console.log("phone already exist");
    }
  })

})
router.get('/chat',(req,res)=>
{
  res.render('chat')
})

module.exports = router;
