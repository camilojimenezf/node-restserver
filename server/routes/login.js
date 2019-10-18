const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req,res) =>{

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB)=>{

        if( err ){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if( !usuarioDB ){
            return res.status(400).json({
                ok:false,
                err:{
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if( !bcrypt.compareSync( body.password, usuarioDB.password )){ //esta función devuelve un true o false dependiendo si la contraseña hace match
            return res.status(400).json({
                ok:false,
                err:{
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({ //ingresamos los datos que iran en el payload
            usuario: usuarioDB 
        }, process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN}); //equivalente a 30 dias

        res.json({
            ok:true,
            usuario: usuarioDB,
            token
        });

    });

});

// Configuraciones de Google
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

app.post('/google', async (req,res) =>{

    let token = req.body.idtoken; //esto es enviado desde index.html en onSignIn()
    let googleUser;
    try{
        googleUser = await verify(token);
    } catch( err ){
        return res.status(403).json({
            ok:false,
            err:{
                message:"Token is not valid"
            }
        });
    }
      
   

    console.log("Verifico usuario");
    console.log(googleUser.email);

    Usuario.findOne({email:googleUser.email}, (err, usuarioDB)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(usuarioDB){
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'Debe de usar su autenticación normal'
                    }
                });
            }else{

                console.log("Entra en el else para logear usuario");
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google= true;
            usuario.password =':)'; //nunca se va a usar ya que es usuario de google, sin embargo es requerida para crear un usuario

            usuario.save( (err,usuarioDB)=>{

                if(err){
                    return res.status(500).json({
                        ok:false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN});

                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                });

            });
        }

    });

});










module.exports=app;