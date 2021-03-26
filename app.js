var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var db = require('./config/connection')
var userHelper = require('./helper/userHelper')
var moment = require('moment')
var http = require('http');
var fs = require('fs')
var fileupload = require('express-fileupload')
var SocketIOFileUpload = require('socketio-file-upload')
var socketio = require('socket.io')
var ffmpeg = require('ffmpeg')
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var msgFormat = require('./chat/message')
var { userJoin, getCurrentUser } = require('./chat/users');
const e = require('express');
var app = express();
var server = http.createServer(app);
const io = socketio(server)
const botName = 'Juschat Bot'
io.on('connection', socket => {
  var uploader = new SocketIOFileUpload();
  uploader.dir = path.join(__dirname, '/public/chat-images');
  uploader.listen(socket);
  socket.on('joinChat', ({ sender, receiver }) => {
    const user = userJoin(socket.id, sender, receiver)
    socket.join(receiver)
    // socket.emit('message',msgFormat.formatMessage(botName,'Welcome To Juschat'))
    //  socket.broadcast.to(receiver).emit('message',msgFormat.formatMessage(botName,'A user Connected to Chat'))
  })

  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)
    console.log(user);
    let end = user.sender.length - 25
    let sendUser = user.sender.slice(0, end)
    let senderId = user.sender.slice(end, user.sender.length)
    let dat = new Date()
    let time = moment(dat).format('h:mm a')
    let date = moment(dat).format('YYYY/MM/DD')

    let receiveLen = user.receiver.length
    let firstId = user.receiver.slice((receiveLen - 48), (receiveLen - 24))
    let secondId = user.receiver.slice((receiveLen - 24), (receiveLen))
    let receiveUser = user.receiver.slice(0, (receiveLen - 48))
    let newReceiver = sendUser + secondId + firstId
    io.to(user.receiver).emit('message', msgFormat.formatMessage('You', msg))
    io.to(newReceiver).emit('message', msgFormat.formatMessage(sendUser, msg))

    let obj = {
      message: msg,
      sender: senderId.slice(0, senderId.length - 1),
      receiver: firstId,
      time: time,
      date: date,
      senderName: sendUser,
      receiverName: receiveUser
    }
    userHelper.insertChat(obj)

  })
  socket.on('rec', blob => {
    const user = getCurrentUser(socket.id)
    console.log(user);
    let end = user.sender.length - 25
    let sendUser = user.sender.slice(0, end)
    let senderId = user.sender.slice(end, user.sender.length)
    let dat = new Date()
    let time = moment(dat).format('h:mm a')
    let date = moment(dat).format('YYYY/MM/DD')
    let receiveLen = user.receiver.length
    let firstId = user.receiver.slice((receiveLen - 48), (receiveLen - 24))
    let secondId = user.receiver.slice((receiveLen - 24), (receiveLen))
    let receiveUser = user.receiver.slice(0, (receiveLen - 48))
    let newReceiver = sendUser + secondId + firstId
    console.log("blob", blob);
    // io.to(newReceiver).emit('record', msgFormat.formatMessage(sendUser, blobUrl))

  })
  // Do something when a file is saved:
  uploader.on("saved", function (event) {
    console.log(event.file);

    const user = getCurrentUser(socket.id)
    let end = user.sender.length - 25
    let sendUser = user.sender.slice(0, end)
    let senderId = user.sender.slice(end, user.sender.length)
    let dat = new Date()
    let time = moment(dat).format('h:mm a')
    let date = moment(dat).format('YYYY/MM/DD')

    let receiveLen = user.receiver.length
    let firstId = user.receiver.slice((receiveLen - 48), (receiveLen - 24))
    let secondId = user.receiver.slice((receiveLen - 24), (receiveLen))
    let receiveUser = user.receiver.slice(0, (receiveLen - 48))
    let newReceiver = sendUser + secondId + firstId
    var file = path.join(__dirname, '/public/chat-images/' + event.file.name)
    var ext = path.extname(file)
    console.log(ext);
    var fileTime = moment(dat).format('hmmss')
    var fileDate = moment(dat).format('YYYYMMDD')
    var fileName = newReceiver + fileTime + fileDate + ext
    var fileNew = path.join(__dirname, '/public/chat-images/', fileName)
    console.log(fileNew);
    fs.rename(file, fileNew, (err) => {
      if (err) {
        console.log("Err", err);
      }
    })
    event.file.name = fileName
    io.to(user.receiver).emit('file', msgFormat.formatFileMessage('You', fileName, ext))
    io.to(newReceiver).emit('file', msgFormat.formatFileMessage(sendUser, fileName, ext))
    if (ext == '.jpg' || ext == '.jpeg' || ext == '.png') {
      let obj = {
        image: fileName,
        sender: senderId.slice(0, senderId.length - 1),
        receiver: firstId,
        time: time,
        date: date,
        senderName: sendUser,
        receiverName: receiveUser
      }
      userHelper.insertChat(obj)
    }
    if (ext == '.mp4' || ext == '.mpeg' || ext == '.mkv') {
      let obj = {
        video: fileName,
        sender: senderId.slice(0, senderId.length - 1),
        receiver: firstId,
        time: time,
        date: date,
        senderName: sendUser,
        receiverName: receiveUser
      }
      userHelper.insertChat(obj)
    }
    if (ext == '.mp3' || ext == '.webm') {
      let obj = {
        audio: fileName,
        sender: senderId.slice(0, senderId.length - 1),
        receiver: firstId,
        time: time,
        date: date,
        senderName: sendUser,
        receiverName: receiveUser
      }
      userHelper.insertChat(obj)
    }

  });

  //  socket.on('disconnect',()=>
  //  {
  //    io.emit('message',msgFormat.formatMessage(botName,'A user has left the Chat'))
  //  })
})
var port = 3000;
app.set('port', port);
server.listen(port);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(SocketIOFileUpload.router)
app.use(
  session({
    key: 'user_id',
    secret: 'this is random',
    resave: false,
    saveUninitialized: false,
    cookie: {

      expires: 5000000
    }

  })
);
app.use(fileupload())
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
