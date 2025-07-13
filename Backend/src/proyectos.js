const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

const dbclient = new Pool({
    user: 'postgres',
    port: 5432,
    host: '127.0.0.1',
    database: 'dbFiumba',
    password: 'augusto18'
});

async function getAllproyectos() {
    const result = await dbclient.query('SELECT * FROM proyectos');
    return result.rows;
}

async function getOneproyecto(id_proyecto){
    const result = await dbclient.query('SELECT * FROM proyectos WHERE id_proyecto = $1 LIMIT 1', [id_proyecto]);
    return result.rows[0];
}

async function createProyecto(nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario){
    const result = await dbclient.query('INSERT INTO proyectos (nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario) VALUES($1, $2, $3, $4, $5, $6)',
         [nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario]);

    console.log("result", result);
    console.log("result", result.rowCount);
    return result.rowCount;
}


async function deleteProyecto(id_proyecto) {
    const result = await dbclient.query('DELETE FROM proyectos WHERE id_proyecto = $1', [id_proyecto]);

    if (result.rowCount === 0) {
        return undefined;
    }
    return id_proyecto;
}

module.exports = {
    getAllproyectos,
    getOneproyecto,
    createProyecto,
    deleteProyecto,
};