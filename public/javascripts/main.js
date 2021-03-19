const chatForm = document.getElementById('chat-input')
const chatMessages = document.querySelector('.testChat');
const {sender,receiver} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
console.log(sender,receiver);

const socket = io()
socket.emit('joinChat',{sender,receiver})
socket.on('message', message => {
    console.log("client",socket.id);
    
    console.log(message);  
    outputMessage(message)
    chatMessages.scrollTop=chatMessages.scrollHeight
})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.msg.value
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
}) 

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