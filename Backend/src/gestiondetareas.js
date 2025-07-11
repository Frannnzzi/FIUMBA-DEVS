const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

const dbclient = new Pool({
    user: 'postgres',
    port: 5432,
    host: '127.0.0.1',
    database: 'dbFiumba',
    password: 'augusto18'
});

async function getAllusuarios() {
    const result = await dbclient.query('SELECT * FROM usuarios');
    return result.rows;
}

async function getOneusuario(id_usuario){
    const result = await dbclient.query('SELECT * FROM usuarios WHERE id_usuario = $1 LIMIT 1', [id_usuario]);
    return result.rows[0];
}

async function createUsuario(nombre, apellido, rol, avatar, mail){
    const result = await dbclient.query('INSERT INTO usuarios (nombre, apellido, rol, avatar, mail) VALUES($1, $2, $3, $4, $5)',
         [nombre, apellido, rol, avatar, mail]);

    console.log("result", result);
    console.log("result", result.rowCount);
    return result.rowCount;
}

module.exports = {
    getAllusuarios, 
    getOneusuario,
    createUsuario,
};