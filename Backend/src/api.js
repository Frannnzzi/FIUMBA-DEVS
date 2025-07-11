const express = require('express');
const cors = require('cors');

const app = express ();
app.use(express.json());
app.use(cors());

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
app.get('/api/usuarios/:id', async (req, res) => {
    const usuario = await getOneusuario(req.params.id);
    if (!usuario) {
        return res.status(404).json({error: 'Usuario no encontrado'});
    }
    res.json(usuario);
 });

//insert usuario
/* esto es para probar el post a ver si funca bien jeje
   curl --header "Content-Type: application/json" \
   --request POST \
   --data '{"nombre":"Franco","apellido":"Finazzi","rol":"SDR","avatar":1,"mail":"franfinazzi@gmail.com"}' \
   http://localhost:3000/api/usuarios */

app.post('/api/usuarios', async (req, res) => {

    if (!req.body.nombre ||
        !req.body.nombre ||
        !req.body.apellido ||
        !req.body.rol ||
        !req.body.avatar ||
        !req.body.mail) {
            return res.status(400).json({error: 'Se requieren datos'});
        }
    
    const usuario = await Createusuario(
        req.body.nombre,
        req.body.apellido,
        req.body.rol,
        req.body.avatar,
        req.body.mail,
    );

    if (!usuario) {
        return res.status(500).json({error: 'Error al crear usuario'});
    }
    res.json({usuario});
});

//delete usuario
app.delete('/api/usuarios/:id', async (req, res) => {

    const usuario = await Deleteusuario(req.params.id);

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

//login
app.post('/api/login', async (req, res) => {
    const { mail } = req.body;
    if (!mail) {
        return res.status(400).json({ error: 'Falta el mail' });
    }
    // Busca el usuario por mail
    const usuarios = await getAllusuarios();
    const usuario = usuarios.find(u => u.mail === mail);
    if (!usuario) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
});


app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
  });

  