const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');

require('dotenv').config();

const dbclient = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function agregarUsuarioAProyecto(id_usuario, id_proyecto){
    result = await dbclient.query('INSERT INTO usuarios_proyectos (id_usuario, id_proyecto) VALUES ($1, $2)', [id_usuario, id_proyecto]);

    if (result.rowCount === 0){
        return undefined;
    }   

    return result.rowCount;
}

async function deleteUsuarioDeProyecto(id_usuario, id_proyecto){
    result = await dbclient.query('DELETE FROM usuarios_proyectos WHERE id_usuario = $1 AND id_proyecto = $2', [id_usuario, id_proyecto]);

    if (result.rowCount === 0 ){
        return undefined;
    }

    return result.rowCount;
}

module.exports = {
    agregarUsuarioAProyecto,
    deleteUsuarioDeProyecto
};