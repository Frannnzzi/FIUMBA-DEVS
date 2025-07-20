const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

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

async function getAlltareas() {
    const result = await dbclient.query('SELECT * FROM tareas');
    return result.rows;
}

async function getAlltareasByUsuarioId(id_usuario){
    const result = await dbclient.query('SELECT * FROM tareas WHERE id_usuario = $1', [id_usuario]);
    if (result.rowCount === 0){
        return undefined;
    }
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

async function updateTarea(id_tarea, camposNuevos){
    const campos = Object.keys(camposNuevos); //Esto nos guarda en en un array campos, el nombre de los campos que fueron actualizados
    if (campos.length === 0){
        return undefined
    }

    const valores = Object.values(camposNuevos);
    const camposAmodificar = campos.map((campo, i) => `${campo} = $${i + 2}`).join(', '); /* El map modifica cada campo del array y lo iguala a $1,$2 etc 
                                                                                            para luego armar la query
                                                                                            */
//El ...valores descompone el array en todos sus elementos por separado y asi se pueden pasar los valores de cada campo
    const result = await dbclient.query(`UPDATE tareas SET ${camposAmodificar} WHERE id_tarea = $1`, [id_tarea, ...valores]); 

    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}

module.exports = {
    getAlltareas,
    getAlltareasByUsuarioId,
    getOnetarea,
    createTarea,
    deleteTarea,
    updateTarea
};