var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var db = require('./config/connection')
var http = require('http');
var socketio = require('socket.io')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var msgFormat = require('./chat/message')
var {userJoin,getCurrentUser} = require('./chat/users')
var app = express();
var server = http.createServer(app);
const io = socketio(server)
const botName = 'Juschat Bot'
io.on('connection', socket=>
 {
   
   socket.on('joinChat',({sender,receiver})=>
   {
     const user = userJoin(socket.id,sender,receiver)
     socket.join(receiver)
    socket.emit('message',msgFormat.formatMessage(botName,'Welcome To Juschat'))
  //  socket.broadcast.to(receiver).emit('message',msgFormat.formatMessage(botName,'A user Connected to Chat'))
   })
   
   socket.on('chatMessage',msg =>
   {
     const user = getCurrentUser(socket.id)
     console.log(user);
     let end = user.sender.length-25
     let sendUser = user.sender.slice(0,end)

    let receiveLen = user.receiver.length
    let firstId = user.receiver.slice((receiveLen-48),(receiveLen-24))
    let secondId = user.receiver.slice((receiveLen-24),(receiveLen))
    let receiveUser = user.receiver.slice(0,(receiveLen-48))
    let newReceiver = sendUser+secondId+firstId
     io.to(user.receiver).emit('message',msgFormat.formatMessage(sendUser,msg))
     io.to(newReceiver).emit('message',msgFormat.formatMessage(sendUser,msg))
   }) 
   socket.on('disconnect',()=>
   {
     io.emit('message',msgFormat.formatMessage(botName,'A user has left the Chat'))
   })
 })
var port = 3000;
app.set('port', port);
server.listen(port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(
  session({
    key:'user_id',
    secret:'this is random',
    resave:false,
    saveUninitialized:false,
    cookie:{

      expires:5000000
    }

  })
  );

  app.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  })
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err) => {
  if (err) {
    console.log("Database Connection Error");
  }
  else {
    console.log("Database Connection Success");
  }
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
