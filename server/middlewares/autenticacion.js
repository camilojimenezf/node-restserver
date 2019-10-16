const jwt = require('jsonwebtoken');


// =========================================================================================================== //
// Verificar Token //
// =========================================================================================================== //
let verificaToken = ( req, res, next) =>{

    let token = req.get('token'); //nombre de la variable en los Headers

    jwt.verify( token, process.env.SEED, (err,decoded) => {

        if( err ){
            return res.status(401).json({
                ok:false,
                err:{
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario; //obtiene al usuario, ya que viene en el payload del token

        next(); //next permite que continue ejecutando la ruta que corresponda

    });


};

// =========================================================================================================== //
// Verifica AdminRole //
// =========================================================================================================== //

let verificaAdmin_Role=(req,res,next) =>{

    let usuario=req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        next();
    }else{
        return res.json({
            ok:false,
            err:{
                message:'El usuario no es administrador'
            }
        });
    }
};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}