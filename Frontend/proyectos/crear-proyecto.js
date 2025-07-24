document.addEventListener('DOMContentLoaded', function() {
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }

  const API_URL = "https://fiumba-devs-backend.onrender.com/api";

  const mapaAvatares = {
    1: '../images/logo1.jpeg',
    2: '../images/logo2.jpeg',
    3: '../images/logo3.jpeg',
    4: '../images/logo4.jpeg',
  };
  const rutaAvatar = mapaAvatares[usuario.avatar];
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && rutaAvatar) {
    logoUsuario.src = rutaAvatar;
  }

  const form = document.querySelector('.form-crear-proyecto');
  let todosLosUsuarios = [];
  let colaboradores = [];
  const inputColaborador = document.querySelector('.input-colaborador');
  const btnAgregarColaborador = document.querySelector('.btn-agregar-colaborador');
  const listaColaboradores = document.querySelector('.lista-colaboradores');

  function validarFechas(fechaInicio, fechaFinal) {
    if (fechaFinal < fechaInicio) {
      alert('La fecha final no puede ser menor a la fecha de inicio.');
      return false;
    }
    return true;
  }

  function obtenerDatosFormulario(form) {
    const campos = form.querySelectorAll('.input-form-proyecto');
    return {
      nombre: campos[0].value,
      descripcion: campos[1].value,
      fecha_inicio: campos[2].value,
      fecha_final: campos[3].value,
      estado: campos[4].value
    };
  }

  async function crearProyecto(datos, idUsuario) {
    const respuesta = await fetch(`${API_URL}/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        id_usuario: idUsuario
      })
    });
    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.error || 'Error al crear el proyecto');
    }
    return await respuesta.json();
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API_URL}/usuarios`);
      if (res.ok) {
        todosLosUsuarios = await res.json();
      }
    } catch (e) { console.error('Error cargando usuarios', e); }
  }
  cargarUsuarios();

  function renderizarColaboradores() {
    listaColaboradores.innerHTML = '';
    colaboradores.forEach((colab, idx) => {
      const li = document.createElement('li');
      li.textContent = `${colab.nombre} (${colab.mail})`;
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = '✖';
      btnEliminar.title = 'Eliminar';
      btnEliminar.className = 'btn-eliminar-colaborador';
      btnEliminar.onclick = () => {
        colaboradores.splice(idx, 1);
        renderizarColaboradores();
      };
      li.appendChild(btnEliminar);
      listaColaboradores.appendChild(li);
    });
  }

  if (btnAgregarColaborador) {
    btnAgregarColaborador.addEventListener('click', function() {
      const mail = inputColaborador.value.trim().toLowerCase();
      if (!mail) return;
      if (colaboradores.some(c => c.mail === mail)) {
        alert('Ya agregaste este colaborador.');
        return;
      }
      const usuarioEncontrado = todosLosUsuarios.find(u => u.mail && u.mail.toLowerCase() === mail);
      if (!usuarioEncontrado) {
        alert('No existe un usuario con ese correo.');
        return;
      }
      if (usuarioEncontrado.id_usuario === usuario.id_usuario) {
        alert('No puedes agregarte a ti mismo como colaborador.');
        return;
      }
      colaboradores.push(usuarioEncontrado);
      renderizarColaboradores();
      inputColaborador.value = '';
    });
  }

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      try {
        const datos = obtenerDatosFormulario(form);
        if (!validarFechas(datos.fecha_inicio, datos.fecha_final)) {
          return;
        }

        const resProyecto = await crearProyecto(datos, usuario.id_usuario);
        const id_proyecto = resProyecto.proyecto?.id_proyecto || resProyecto.id_proyecto;

        for (const colab of colaboradores) {
          await fetch(`${API_URL}/colaboradores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: colab.id_usuario, id_proyecto })
          });
        }
        
        if (typeof agregarNovedad === 'function') {
            const mensajeNovedad = `${usuario?.nombre || 'Usuario'} creó el proyecto "${datos.nombre}"`;
            agregarNovedad(mensajeNovedad);
        }

        setTimeout(() => {
          window.location.href = '../proyectos/proyectos.html';
        }, 150);

      } catch (error) {
        console.error('Error al crear proyecto:', error);
        alert(error.message || 'Error de conexión con el servidor');
      }
    });
  }
});

if (typeof agregarNovedad !== 'function') {
    window.agregarNovedad = function(mensaje) {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const nombreUsuario = usuario?.nombre || 'Usuario';
        let novedades = JSON.parse(localStorage.getItem('novedades')) || [];
        const fecha = new Date().toLocaleString('es-AR');
        novedades.push({ 
            usuario: nombreUsuario, 
            mensaje, 
            fecha 
        });
        localStorage.setItem('novedades', JSON.stringify(novedades));
    };
}