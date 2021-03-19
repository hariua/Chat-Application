var express = require('express');
var router = express.Router();
var userHelper = require('../helper/userHelper')

/* GET home page. */
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/')
  }
}
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect('/allUsers')
  }
  else {
    res.render('loginPage', { 'mob': req.session.logMob, 'psd': req.session.logPsd });
    req.session.logMob = false
    req.session.logPsd = false
  }
});
router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/allUsers')
  }
  else {
    res.render('signupPage', { 'mobErr': req.session.mob, 'emailErr': req.session.email })
    req.session.mob = false
    req.session.email = false
  }

})
router.post('/login', (req, res) => {
  console.log(req.body);
  userHelper.login(req.body).then((result) => {
    if (result.success) {
      console.log("Success Login");
      req.session.user = result.user
      req.session.loggedIn = true;
      res.redirect('/allUsers')
    }
    if (result.invalidPassword) {
      req.session.logPsd = "Invalid Password"
      res.redirect('/')
      console.log("Invalid psd");
    }
    if (result.invalidUser) {
      req.session.logMob = "Invalid User"
      res.redirect('/')
      console.log("Invalid user");
    }
  })
})
router.post('/signup', (req, res) => {
  console.log(req.body);
  userHelper.signup(req.body).then((response) => {
    if (response.insert) {
      console.log("Value Inserted");
      res.redirect('/')
    }
    if (response.email) {
      req.session.email = "Email Already Exists"
      res.redirect('/signup')
      console.log("email already exist");
    }
    else {
      req.session.mob = "Phone Number Already Exists"
      res.redirect('/signup')
      console.log("phone already exist");
    }
  })

})
router.get('/chat', verifyLogin, async (req, res) => {
  let end = req.query.sender.length - 25
  let sender = req.query.sender.slice(end, req.query.sender.length - 1)
  let receiveLen = req.query.receiver.length
  let receiver = req.query.receiver.slice((receiveLen - 48), (receiveLen - 24))
  let chat = await userHelper.getChat(sender, receiver)
  let len = req.query.receiver.length
  let user = req.query.receiver.slice(0, len - 48)
  res.render('chat', { recepient: user, chat })
})
router.get('/allUsers', verifyLogin, async (req, res) => {
  let users = await userHelper.getAllUsers(req.session.user._id)
  res.render('allUsers', { users, sender: req.session.user })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.loggedIn = false
  res.redirect('/')
})
module.exports = router;
