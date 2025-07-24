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
  const logoElemento = document.getElementById('logo-usuario');
  if (logoElemento && rutaAvatar) {
    logoElemento.src = rutaAvatar;
  }

  const selectProyecto = document.querySelector('.select-proyecto-tarea');
  const form = document.getElementById('form-crear-tarea');

  async function cargarProyectos() {
    if (!selectProyecto) return;

    try {
      const respuesta = await fetch(`${API_URL}/proyectos/usuarios/${usuario.id_usuario}`);
      const proyectos = await respuesta.json();
      
      selectProyecto.innerHTML = '<option value="">Seleccione un proyecto</option>';
      proyectos.forEach(proyecto => {
        const option = document.createElement('option');
        option.value = proyecto.id_proyecto;
        option.textContent = proyecto.nombre;
        selectProyecto.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  }

  function obtenerDatosFormulario(form) {
    const campos = form.querySelectorAll('.input-form-tarea');
    return {
      id_proyecto: parseInt(campos[0].value),
      titulo: campos[1].value,
      descripcion: campos[2].value,
      fecha_final: campos[3].value,
      estado: campos[4].value,
      prioridad: campos[5].value
    };
  }

  async function crearTarea(datos, idUsuario) {
    const respuesta = await fetch(`${API_URL}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        id_usuario: idUsuario
      })
    });
    if (!respuesta.ok) {
      throw new Error('Error al crear la tarea');
    }
    return await respuesta.json();
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
      const datos = obtenerDatosFormulario(form);
      if (!datos.id_proyecto) {
          alert('Por favor, seleccione un proyecto.');
          return;
      }
      await crearTarea(datos, usuario.id_usuario);
      window.location.href = '../tareas/tareas.html';
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert(error.message);
    }
  });

  cargarProyectos();
});