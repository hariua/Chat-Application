const chatForm = document.getElementById('chat-input')
const chatMessages = document.querySelector('.testChat');
const {sender,receiver} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
console.log(sender,receiver);

const socket = io.connect()
var siofu = new SocketIOFileUpload(socket);
siofu.listenOnInput(document.getElementById("upload_input"));
function blobFunVideo(blob)
{
    socket.emit('rec',blob)
}


siofu.addEventListener("progress", function(event){
    var percent = event.bytesLoaded / event.file.size * 100;
    console.log("File is", percent.toFixed(2), "percent loaded");
    progressDisplay(percent.toFixed(2))
});

// Do something when a file is uploaded:
siofu.addEventListener("complete", function(event){
    console.log(event.success);
    console.log(event.file);
});



socket.emit('joinChat',{sender,receiver})
socket.on('message', message => {
    console.log("client",socket.id);
    
    console.log(message); 
    if(message.urlCheck)
    {
        urlText(message)
    }else{
        outputMessage(message)
    }
    
    chatMessages.scrollTop=chatMessages.scrollHeight
})
socket.on('file',data=>
{
    console.log(data,"file arrived")
    console.log("extention",data.extention);
    if(data.extention == '.jpg'|| data.extention == '.jpeg'|| data.extention == '.png')
    {
        imageFile(data)
    }
    if(data.extention == '.mp4'|| data.extention == '.mpeg'|| data.extention == '.mkv')
    {
        videoFile(data)
    }
    if(data.extention == '.mp3'|| data.extention == '.webm')
    {
        audioFile(data)
    }
})
socket.on('record',data=>{
    console.log("rec received",data);
    recordAudio(data)
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.msg.value
    // const img = e.target.files.files[0]
    
    
    // console.log("files",img);
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
}) 
function progressDisplay(percent)
{
    var bar = document.getElementById('myBar')
    bar.style.width=percent+"%"
   document.getElementById('progressText').innerHTML=percent+"%"
}
function outputMessage(message) {
    const par = document.getElementsByClassName('testChat')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${message.userName} :</p>
    <p class="mb-0" style="padding-left:20px">
        ${message.text}
    </p>
    
    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i>
        <span class="align-middle">${message.time}</span>
    </p>
    
</div>`

    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.testChat').appendChild(div)
}
function urlText(message) {
    const par = document.getElementsByClassName('testChat')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${message.userName} :</p>
    <a href="https://${message.text}" target="_blank"><span class="text-white ml-2">${message.text}</span></a>
    
    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i>
        <span class="align-middle">${message.time}</span>
    </p>
    
</div>`

    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.testChat').appendChild(div)
}
function imageFile(data) {

    const par = document.getElementsByClassName('testChat')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${data.userName} :</p>
    <img src="http://localhost:3000/chat-images/${data.file}" style="width:350px;height:200px" class="img-responsive m-auto" alt="">
    
    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i>
        <span class="align-middle">${data.time}</span>
    </p>
    
</div>`

    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.testChat').appendChild(div)
}
function videoFile(data) {

    const par = document.getElementsByClassName('testChat')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${data.userName} :</p>
    <video width="320" height="240" controls >
  <source src="http://localhost:3000/chat-images/${data.file}" type="video/mp4">
Your browser does not support the video tag.
</video>
    
    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i>
        <span class="align-middle">${data.time}</span>
    </p>
    
</div>`

    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.testChat').appendChild(div)
}
function audioFile(data) {

    const par = document.getElementsByClassName('testChat')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${data.userName} :</p>
    <audio controls >
  <source src="http://localhost:3000/chat-images/${data.file}" type="video/mp4">
Your browser does not support the video tag.
</audio>
    
    <p class="chat-time mb-0"><i class="ri-time-line align-middle"></i>
        <span class="align-middle">${data.time}</span>
    </p>
    
</div>`

    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.testChat').appendChild(div)
}