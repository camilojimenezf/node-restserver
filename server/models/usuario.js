const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let rolesValidos={
    values: ['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol válido'  //VALUE toma el valor de lo que envie el usuario
};

let usuarioSchema = new Schema({
    nombre:{
        type: String,
        required: [true,'El nombre es necesario']
    },
    email:{
        type: String,
        unique:true,
        required: [true,'El correo es necesario']
    },
    password:{
        type:String,
        required: [true,'La contraseña es obligatoria']
    },
    img:{
        type: String,
        required: false, //si no especifico es false por defecto
    },
    role:{
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado:{
        type: Boolean,
        default: true
    },
    google:{
        type: Boolean,
        default:false
    }
});

usuarioSchema.methods.toJSON = function(){
    //modificamos la respuesta en formato json del schema de usuario, eliminando el envio de la contraseña 
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

usuarioSchema.plugin( uniqueValidator, {message: '{PATH} debe de ser único'}); //PATH hace referencia al campo que no cumple la validación

module.exports = mongoose.model( 'Usuario', usuarioSchema ); //Usuario sera el nombre del modelo que contiene la configuracion de usuarioSchema