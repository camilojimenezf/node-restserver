const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion:{
        type: String,
        unique:true,
        required: [true,'La descripcion es necesaria'],
    },
    usuario:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Usuario'
    }
});

categoriaSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'}); //PATH hace referencia al campo que no cumple la validación



module.exports = mongoose.model( 'Categoria', categoriaSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema