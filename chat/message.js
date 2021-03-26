 const moment = require('moment')

 module.exports={
     formatMessage:(userName,urlCheck,text)=>
     {
         return{
             userName,
             text,
             urlCheck,
             time:moment().format('h:mm a')
         }
     },
     formatFileMessage:(userName,file,extention)=>
     {
         return {
             userName,
            file,
            extention,
            time:moment().format('h:mm a')
         }
     }
 }