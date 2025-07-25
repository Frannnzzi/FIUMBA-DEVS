const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


const { 
    getAllusuarios,
    getOneusuario,
    createUsuario,
    deleteUsuario,
    usuariosDeProyecto
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

const { 
    agregarUsuarioAProyecto,
    deleteUsuarioDeProyecto
} = require('./usuario_proyectos');

//health route
app.get('/api/health', (req, res) => {
    res.json({status: "Levantado"});
});

//Usuarios
//get all usuarios
app.get('/api/usuarios', async (req, res) => {
    const usuarios = await getAllusuarios();
    console.log('Usuarios desde getAllusuarios:', usuarios);
    res.json(Object.values(usuarios));
});

//get one usuario
app.get('/api/usuarios/:id_usuario', async (req, res) => {
    const usuario = await getOneusuario(req.params.id_usuario);

    if (!usuario){
        return res.status(404).json({error: 'usuario Not found'});
    }
    res.json(usuario);
});

//get usuarios by proyecto id
app.get('/api/usuarios/proyectos/:id_proyecto', async (req, res) => {
    const usuarios = await usuariosDeProyecto(req.params.id_proyecto);

    if (!usuarios){
        return res.status(404).json({error: 'Proyecto not found'})
    }

    res.json(usuarios);
  });

//insert usuario
/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"nombre":"Augusto","apellido":"Florio","rol":"Jefe","avatar":"2","mail":"florioaugusto7@gmail.com"}' \
  http://localhost:3000/api/usuarios
*/
app.post('/api/usuarios', async (req, res) => {

    if (!req.body.nombre || !req.body.apellido || !req.body.rol || !req.body.avatar || !req.body.mail) {
        return res.status(400).json({error: "Missing required fields"});
    }
    try {
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
    } catch (err) {
        res.status(500).json({error: err.message || 'Error interno al crear usuario'});
    }
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
    !req.body.descripcion) {
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

// usuarios_proyectos
// insertar un usuario a un proyecto
/*
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"id_usuario":"2", "id_proyecto":"29"}' \
  http://localhost:3000/api/colaboradores
*/
app.post('/api/colaboradores', async (req, res) => {
    // Permitir emails o id_usuario
    const { id_usuario, id_proyecto, email } = req.body;
    if ((!id_usuario && !email) || !id_proyecto) {
      return res.status(400).json({ error: "Faltan datos" });
    }
    let usuarioId = id_usuario;
    if (email) {
      // Buscar usuario por email
      const result = await require('./usuarios').getAllusuarios();
      const usuario = result.find(u => u.mail === email);
      if (!usuario) {
        return res.status(404).json({ error: "No existe usuario con ese email" });
      }
      usuarioId = usuario.id_usuario;
    }
    const resultado = await agregarUsuarioAProyecto(usuarioId, id_proyecto);
    res.json({resultado});
  });

//delete usuario de proyecto
/*
curl --request DELETE http://localhost:3000/api/colaboradores
*/
  app.delete('/api/colaboradores/:id_usuario/:id_proyecto', async (req, res) => {
    const id_usuario = req.params.id_usuario;
    const id_proyecto = req.params.id_proyecto;

    if (!id_usuario || !id_proyecto) {
      return res.status(400).json({ error: "Faltan datos" });
    }
    const resultado = await deleteUsuarioDeProyecto(id_usuario, id_proyecto);
    res.json({ resultado });
  });

app.listen(PORT, '0.0.0.0', () => {
    console.log("Server Listening on PORT:", PORT);
  });

  