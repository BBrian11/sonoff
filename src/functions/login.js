const firebase = require("firebase/app");

require("firebase/auth");


const login = async(email, password, res)=>{
    const user = firebase.auth().currentUser;
    if(user){
        console.log("Ya logueado");
    }else{
        firebase.auth().signInWithEmailAndPassword(email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            setTimeout(() => {
                res.redirect('/');
              }, 500);
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
            res.render("login", {error: true})
          });
    }
}

module.exports = {login};