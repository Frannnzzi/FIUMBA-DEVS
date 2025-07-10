const express = require('express');

const app = express ();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const { getAllusuarios } = require('./gestiondetareas');

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
// app.get('/api/usuarios/:id', (req, res) => {
//     //res.json({status: 'Ok'})
// });

//insert usuario

//update usuario


//Proyectos

//Tareas




app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

  
