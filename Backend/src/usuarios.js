const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');
const { getAllporyectosByUsuarioId } = require('./proyectos');
/*
const dbclient = new Pool({
    user: 'postgres',
    port: 5432,
    host: '127.0.0.1',
    database: 'dbFiumba',
    password: 'augusto18'
});
*/
require('dotenv').config();

const dbclient = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function getAllusuarios() {
    const result = await dbclient.query(`
        SELECT 
            usuarios.id_usuario, 
            usuarios.nombre AS nombre_usuario, 
            usuarios.apellido, 
            usuarios.rol, 
            usuarios.avatar, 
            usuarios.mail,
            proyectos.id_proyecto, 
            proyectos.nombre AS nombre_proyecto
        FROM usuarios LEFT JOIN proyectos ON usuarios.id_usuario = proyectos.id_usuario 
    `);

    const usuarios = {};

    result.rows.forEach((row) => {
        if (!usuarios[row.id_usuario]) {
            usuarios[row.id_usuario] = {
                id_usuario: row.id_usuario,
                nombre: row.nombre_usuario,
                apellido: row.apellido,
                rol: row.rol,
                avatar: row.avatar,
                mail: row.mail,
                proyectos: []
            };
        }

        if (row.id_proyecto) {
            usuarios[row.id_usuario].proyectos.push({
                id_proyecto: row.id_proyecto,
                nombre: row.nombre_proyecto
            });
        }  
    });

    // ¡ESTA LÍNEA ES LA CLAVE!
    return Object.values(usuarios);
}

async function getOneusuario(id_usuario){
    const result = await dbclient.query(`
        SELECT 
            usuarios.id_usuario, 
            usuarios.nombre AS nombre_usuario, 
            usuarios.apellido, 
            usuarios.rol, 
            usuarios.avatar, 
            usuarios.mail,
            proyectos.id_proyecto, 
            proyectos.nombre AS nombre_proyecto
        FROM usuarios LEFT JOIN proyectos ON usuarios.id_usuario = proyectos.id_usuario WHERE usuarios.id_usuario = $1 
    `, [id_usuario]); // Usamos un LEFT JOIN para poder traernos de la base de datos tambien los usuarios que no tienen proyectos

    if (result.rows.length === 0){
        return undefined;
    };

    const usuario = {
        id_usuario: result.rows[0].id_usuario,
        nombre: result.rows[0].nombre,
        apellido: result.rows[0].apellido,
        rol: result.rows[0].apellido,
        avatar: result.rows[0].avatar,
        mail: result.rows[0].mail,
        proyectos: []
    };

    result.rows.forEach(row => {
        if (row.id_proyecto){ //En este caso este if chequea que el usuario tenga proyectos para mostrar y que no se creen proyectos inexistentes
            usuario.proyectos.push({
                id_proyecto: row.id_proyecto,
                proyecto: row.nombre_proyecto

            });
        }
    });

    return usuario;

}

async function createUsuario(nombre, apellido, rol, avatar, mail){
    const result = await dbclient.query('INSERT INTO usuarios (nombre, apellido, rol, avatar, mail) VALUES($1, $2, $3, $4, $5)',
         [nombre, apellido, rol, avatar, mail]);

    console.log("result", result);
    console.log("result", result.rowCount);
    return result.rowCount;
}

async function deleteUsuario(id_usuario) {
    const result = await dbclient.query('DELETE FROM usuarios WHERE id_usuario = $1', [id_usuario]);

    if (result.rowCount === 0) {
        return undefined;
    }
    return id_usuario;
}

module.exports = {
    getAllusuarios,
    getOneusuario,
    createUsuario,
    deleteUsuario,
};