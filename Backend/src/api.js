const express = require('express');

const app = express ();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const { 
    getAllusuarios,
    getOneusuario,
    Createusuario,
    Deleteusuario,
} = require('./gestiondetareas');

//health route
app.get('/api/health', (req, res) => {
    res.json({status: "Levantado"});
});

//Usuarios
//get all usuarios
app.get('/api/usuarios', async (req, res) => {
    const usuarios = await getAllusuarios();
    res.json(usuarios);
});

//get one usuarios
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

    if (!req.body.nombre || !req.body.edad || !req.body.vida || !req.body.pasado ||
    !req.body.nivel_de_poder || req.body.nacionalidad || req.body.tipo) {
    return res.status(400).json({error: "Missin required fields"});
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
app.delete('/api/usuarios/:id', async (req, res) => {

    const usuario = await deleteUsuario(req.params.id);

    if (!personaje) {
        return res.status(404).json({error: 'Ususario id: ' + req.params.id + ' no encontrado'});
    }
    res.json({status: 'Ok', id: usuario});
});

//update usuario
app.put('/api/usuarios', (req, res) => {
    res.json({status: 'Ok'})
});


//Proyectos

//Tareas




app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

  