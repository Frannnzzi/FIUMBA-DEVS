const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

const dbclient = new Pool({
    user: 'postgres',
    port: 5432,
    host: '127.0.0.1',
    database: 'dbFiumba',
    password: 'augusto18'
});

async function getAlltareas() {
    const result = await dbclient.query('SELECT * FROM tareas');
    return result.rows;
}

async function getOnetarea(id_tarea){
    const result = await dbclient.query('SELECT * FROM tareas WHERE id_tarea = $1 LIMIT 1', [id_tarea]);
    return result.rows[0];
}

async function createTarea(titulo, estado, descripcion, fecha_final, prioridad, id_proyecto, id_usuario){
    const result = await dbclient.query('INSERT INTO tareas (titulo, estado, descripcion, fecha_final, prioridad, id_proyecto, id_usuario) VALUES($1, $2, $3, $4, $5, $6, $7)',
         [titulo, estado, descripcion, fecha_final, prioridad, id_proyecto, id_usuario]);

    console.log("result", result);
    console.log("result", result.rowCount);
    return result.rowCount;
}

async function deleteTarea(id_tarea) {
    const result = await dbclient.query('DELETE FROM tareas WHERE id_tarea = $1', [id_tarea]);

    if (result.rowCount === 0) {
        return undefined;
    }
    return id_tarea;
}

module.exports = {
    getAlltareas,
    getOnetarea,
    createTarea,
    deleteTarea,
};