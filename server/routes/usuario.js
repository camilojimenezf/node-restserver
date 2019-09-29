const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function (req, res) {

    let desde = Number(req.query.desde) || 0;

    let limite = req.query.limite || 5;
    limite=Number(limite);
    
    Usuario.find({estado: true}, 'nombre email role estado google img')
            .skip(desde)    //se salta la cantidad de registros indicados
            .limit(limite)   //numero de registros que trae de la BDD
            .exec( (err, usuarios) =>{
                if( err ){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }

                Usuario.countDocuments({estado: true}, (err,conteo)=>{

                    res.json({
                        ok:true,
                        usuarios,
                        cantidad: conteo
                    });
                    
                })
            });

});

app.post('/usuario', function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //lo sincronizamos de manera sincrona (sin usar callbacks ni promesas) y el segundo parametro
        role: body.role                               //corresponde al número de veces que se le hara hash                   
    });

    usuario.save( (err,usuarioDB) => {

        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        //usuarioDB.password=null;

        res.json({
            ok: true,
            usuario: usuarioDB
        })

    });
}); 

app.put('/usuario/:id', function (req, res) {

    let id= req.params.id;
    let body = _.pick(req.body, ['nombre','email','img','role','estado']) ;

    //runValidators permite que las validaciones del Schema Usuario sean validas
    Usuario.findByIdAndUpdate( id, body, {new:true, runValidators:true}, (err,usuarioDB)=>{ //el tercer parametro es para que retorne el usuario actualizado
        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        res.json({
            ok:true,
            usuario: usuarioDB
        });
    })

});

app.delete('/usuario/:id', function(req,res) {
    
    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado ,{new:true} ,(err, usuarioBorrado)=>{

        if( err ){
            return res.status(400).json({
                ok:false,
                err
            });
        }

        if( !usuarioBorrado ){
            return res.status(400).json({
                ok:false,
                err:{   //el error es un objeto para mantener el estandar de respuesta de errores
                    message:'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            usuario: usuarioBorrado
        });

    });

});


module.exports=app;