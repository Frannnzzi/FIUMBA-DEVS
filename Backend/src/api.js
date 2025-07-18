const express = require('express');

const app = express ();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const { 
    getAllusuarios,
    getOneusuario,
    createUsuario,
    deleteUsuario,
} = require('./usuarios');

const { 
    getAllproyectos,
    getAllporyectosByUsuarioId,
    getOneproyecto,
    createProyecto,
    deleteProyecto,
    updateProyecto
} = require('./proyectos');

const { 
    getAlltareas,
    getAlltareasByUsuarioId,
    getOnetarea,
    createTarea,
    deleteTarea,
    updateTarea
} = require('./tareas');

//health route
app.get('/api/health', (req, res) => {
    res.json({status: "Levantado"});
});

//Usuarios
//get all usuarios
app.get('/api/usuarios', async (req, res) => {
    const usuarios = await getAllusuarios();

    if (!usuarios){
        return res.status(404).json({error: "No existen usuarios registrados"})
    }
    res.json(usuarios);
});

//get one usuario
app.get('/api/usuarios/:id_usuario', async (req, res) => {
    const usuario = await getOneusuario(req.params.id_usuario);

    if (!usuario){
        return res.status(404).json({error: 'usuario Not found'});
    }
    res.json(usuario);
});


//insert usuario
/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"nombre":"Augusto","apellido":"Florio","rol":"Jefe","avatar":"2","mail":"florioaugusto7@gmail.com"}' \
  http://localhost:3000/api/usuarios
*/
app.post('/api/usuarios', async (req, res) => {

    if (!req.body.nombre || !req.body.apellido || !req.body.rol || !req.body.avatar ||
    !req.body.mail) {
    return res.status(400).json({error: "Missing required fields"});
}

    const usuario = await createUsuario(
        req.body.nombre, 
        req.body.apellido,
        req.body.rol,
        req.body.avatar,
        req.body.mail
    );
    
    if (!usuario) {
        return res.status(500).json({error: 'Error al crear usuario'});
    }
    res.json({usuario});
});

//delete usuario
app.delete('/api/usuarios/:id_usuario', async (req, res) => {

    const usuario = await deleteUsuario(req.params.id_usuario);

    if (!usuario) {
        return res.status(404).json({error: 'Ususario id: ' + req.params.id_usuario + ' no encontrado'});
    }
    res.json({status: 'Ok', id_usuario: usuario});
});

//update usuario
app.put('/api/usuarios', (req, res) => {
    res.json({status: 'Ok'})
});


//Proyectos
//get all proyectos
app.get('/api/proyectos', async (req, res) => {
    const proyectos = await getAllproyectos();
    res.json(proyectos);
});

//Proyectos
//get all proyectos by id_usuario
app.get('/api/proyectos/usuarios/:id_usuario', async (req, res) => {
    const proyectos = await getAllporyectosByUsuarioId(req.params.id_usuario);

    if (!proyectos){
        return res.status(404).json({error:"Usuario not found"})
    }

    res.json(proyectos);

});

//get one proyecto
app.get('/api/proyectos/:id_proyecto', async (req, res) => {
    const proyecto = await getOneproyecto(req.params.id_proyecto);

    if (!proyecto){
        return res.status(404).json({error: 'Proyecto Not found'});
    }
    res.json(proyecto);
});

//insert proyecto
/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"nombre":"Software de música","fecha_inicio":"2025-05-07","fecha_final":"2025-08-05","estado":"En proceso","descripcion":"Es un software para crear música", "id_usuario": 1}' \
  http://localhost:3000/api/proyectos
*/
app.post('/api/proyectos', async (req, res) => {

    if (!req.body.nombre || !req.body.fecha_inicio || !req.body.fecha_final || !req.body.estado ||
    !req.body.descripcion || !req.body.id_usuario) {
    return res.status(400).json({error: "Missing required fields"});
}

    const proyecto = await createProyecto(
        req.body.nombre, 
        req.body.fecha_inicio,
        req.body.fecha_final,
        req.body.estado,
        req.body.descripcion,
        req.body.id_usuario
    );
    
    if (!proyecto) {
        return res.status(500).json({error: 'Error al crear usuario'});
    }
    res.json({proyecto});
});


//delete proyecto
/*
curl --request DELETE http://localhost:3000/api/proyectos/:id_proyecto
*/
app.delete('/api/proyectos/:id_proyecto', async (req, res) => {

    const proyecto = await deleteProyecto(req.params.id_proyecto);

    if (!proyecto) {
        return res.status(404).json({error: 'Proyecto id: ' + req.params.id_proyecto + ' no encontrado'});
    }
    res.json({status: 'Ok', id_proyecto: proyecto});
});

// update proyecto 
/* curl --header "Content-Type: application/json" \
  --request PATCH \
  --data '{"estado":"Finalizado"}' \
  http://localhost:3000/api/proyectos/1
*/
app.patch('/api/proyectos/:id_proyecto', async (req, res) => {
    const id = req.params.id_proyecto;
    const cambios = req.body;
    const proyectoActualizado = await updateProyecto (id, cambios);

    if (proyectoActualizado === 0 ){
        return res.status(404).json({error: 'No se encontro el proyecto de id ' + id});
    }

    res.json(proyectoActualizado);
})

//Tareas

//get all tareas
app.get('/api/tareas', async (req, res) => {
    const tareas = await getAlltareas();
    res.json(tareas);
});

//get all tareas por usuario
app.get('/api/tareas/usuarios/:id_usuario', async (req, res) => {
    const proyectos = await getAlltareasByUsuarioId(req.params.id_usuario);

    if (!proyectos){
        return res.status(404).json({error:"Usuario not found"})
    }

    res.json(proyectos);

});

//get one tarea
app.get('/api/tareas/:id_tarea', async (req, res) => {
    const tarea = await getOnetarea(req.params.id_tarea);

    if (!tarea){
        return res.status(404).json({error: 'tarea Not found'});
    }
    res.json(tarea);
});

//insert tarea
/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"titulo":"agregar algo","estado":"en proceso","descripcion":"agregar algo para que haga algo","fecha_final":"2025-08-05","prioridad":"Importante","id_proyecto":1, "id_usuario":1}' \
  http://localhost:3000/api/tareas
*/
app.post('/api/tareas', async (req, res) => {

    if (!req.body.titulo || !req.body.estado || !req.body.descripcion || !req.body.fecha_final ||
    !req.body.prioridad || !req.body.id_proyecto || !req.body.id_usuario) {
    return res.status(400).json({error: "Missing required fields"});
}

    const tarea = await createTarea(
        req.body.titulo, 
        req.body.estado,
        req.body.descripcion,
        req.body.fecha_final,
        req.body.prioridad,
        req.body.id_proyecto,
        req.body.id_usuario
    );
    
    if (!tarea) {
        return res.status(500).json({error: 'Error al crear tarea'});
    }
    res.json({tarea});
});

//delete tarea
/*
curl --request DELETE http://localhost:3000/api/tareas/:id_proyecto
*/
app.delete('/api/tareas/:id_tarea', async (req, res) => {

    const tarea = await deleteTarea(req.params.id_tarea);

    if (!tarea) {
        return res.status(404).json({error: 'Tarea id: ' + req.params.id_tarea + ' no encontrado'});
    }
    res.json({status: 'Ok', id_tarea: tarea});
});

// update tarea 
/* curl --header "Content-Type: application/json" \
  --request PATCH \
  --data '{"estado":"Finalizado"}' \
  http://localhost:3000/api/tareas/1
*/
app.patch('/api/tareas/:id_tarea', async (req, res) => {
    const id = req.params.id_tarea;
    const cambios = req.body;
    const tareaActualizada = await updateTarea (id, cambios);

    if (tareaActualizada === 0 ){
        return res.status(404).json({error: 'No se encontro el proyecto de id ' + id});
    }

    res.json(tareaActualizada);
})

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

  