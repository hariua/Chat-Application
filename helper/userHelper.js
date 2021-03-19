const { USER_COLLECTION } = require("../config/collection");
var db = require("../config/connection");
var objectId = require('mongodb').ObjectID
var collection = require("../config/collection");
var bcrypt = require("bcrypt");
module.exports = {
  signup: (userData) => {
    status = {};
    return new Promise(async (resolve, reject) => {
      let email = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email });
      if (email) {
        status.email = true;
      }
      let mobile = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: userData.Mobile });
      if (mobile) {
        status.mobile = true;
      }
      if (email || mobile) {
        resolve(status);
      } else {
        userData.Password = await bcrypt.hash(userData.Password, 10)
        console.log(userData.Password);
        status.insert = true
        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(() => {
          resolve(status);
        });
      }
    });
  },
  login: (userData) => {
     
    return new Promise(async (resolve, reject) => {
      var status = {}
      let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Mobile: userData.Mobile })
      if (user) {
        bcrypt.compare(userData.Password,user.Password).then((result) => {
          if (result) {
            status.user = user
            status.success = true
            console.log("Login Success");
            resolve(status)
          }else {
            status.invalidPassword = true
            resolve(status)
          }

        })
      }
      else {
        status.invalidUser = true
        resolve(status)
      }
    })
  },
  getAllUsers:(user)=>
  {
    return new Promise(async(resolve,reject)=>
    {
      let users = await db.get().collection(collection.USER_COLLECTION).find({_id:{$ne:objectId(user)}}).toArray()
      resolve(users)
    })
  }
}
