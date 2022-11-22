const firebase = require("firebase/app");

require("firebase/auth");


const logout = async(res)=>{
    const user = firebase.auth().currentUser;
    firebase.auth().signOut().then(() => {
        console.log("Logout correcto");
        setTimeout(() => {
            res.redirect('/');
          }, 500);
      }).catch((error) => {
        console.log(error)
      });
    
}

module.exports = {logout};