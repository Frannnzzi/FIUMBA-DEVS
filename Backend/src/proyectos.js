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

async function getAllproyectos() {
    const result = await dbclient.query('SELECT * FROM proyectos');
    return result.rows;
}

async function getAllporyectosByUsuarioId(id_usuario){
    const result = await dbclient.query('SELECT * FROM proyectos WHERE id_usuario = $1', [id_usuario]);
    if (result.rowCount === 0){
        return undefined;
    }
    return result.rows;
}

async function getOneproyecto(id_proyecto){
    const result = await dbclient.query('SELECT * FROM proyectos WHERE id_proyecto = $1 LIMIT 1', [id_proyecto]);
    return result.rows[0];
}

async function createProyecto(nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario){
    const result = await dbclient.query(
      'INSERT INTO proyectos (nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario) VALUES($1, $2, $3, $4, $5, $6)',
      [nombre, fecha_inicio, fecha_final, estado, descripcion, id_usuario]
    );
    return result.rowCount;
}


async function deleteProyecto(id_proyecto) {
    const result = await dbclient.query('DELETE FROM proyectos WHERE id_proyecto = $1', [id_proyecto]);

    if (result.rowCount === 0) {
        return undefined;
    }
    return id_proyecto;
}

async function updateProyecto(id_proyecto, camposNuevos){
    const campos = Object.keys(camposNuevos); //Esto nos guarda en en un array campos, el nombre de los campos que fueron actualizados
    if (campos.length === 0){
        return undefined
    }

    const valores = Object.values(camposNuevos);
    const camposAmodificar = campos.map((campo, i) => `${campo} = $${i + 2}`).join(', '); /* El map modifica cada campo del array y lo iguala a $1,$2 etc 
                                                                                            para luego armar la query
                                                                                            */
//El ...valores descompone el array en todos sus elementos por separado y asi se pueden pasar los valores de cada campo
    const result = await dbclient.query(`UPDATE proyectos SET ${camposAmodificar} WHERE id_proyecto = $1`, [id_proyecto, ...valores]); 

    if (result.rowCount === 0) {
        return undefined;
    }
    return result.rows[0];
}

module.exports = {
    getAllproyectos,
    getAllporyectosByUsuarioId,
    getOneproyecto,
    createProyecto,
    deleteProyecto,
    updateProyecto,
};