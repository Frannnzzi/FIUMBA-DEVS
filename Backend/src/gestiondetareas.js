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

async function getOneusuario(id) {
    const result = await dbclient.query('SELECT * FROM usuarios WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0];
}

async function Createusuario(
    nombre,
	apellido,
	rol,
	avatar,
	mail,
) {
    const result = await dbclient.query(
        'INSERT INTO usuarios(nombre, apellido, rol, avatar, mail) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [nombre, apellido, rol, avatar, mail]
    );

    if (result.rowCount === 0) {
        return undefined
    }
        return result.rows[0];
}

async function Deleteusuario(id) {
    const result = await dbclient.query('DELETE * FROM usuarios WHERE id = $1', [id]);

    if (result.rowCount === 0) {
        return undefined;
    }
    return id;
}

module.exports = {
    getAllusuarios,
    getOneusuario,
    Createusuario,
    Deleteusuario,
};