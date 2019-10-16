const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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










module.exports=app;