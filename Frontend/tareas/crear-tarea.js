// Página de crear tarea - Maneja la creación de nuevas tareas
document.addEventListener('DOMContentLoaded', function() {
  const selectProyecto = document.querySelector('.select-proyecto-tarea');
  const form = document.querySelector('.form-crear-tarea');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Verificar que el usuario esté logueado
  function verificarUsuario() {
    if (!usuario) {
      alert('Debes estar logueado para crear una tarea.');
      return false;
    }
    return true;
  }

  // Cargar proyectos del usuario en el select
  async function cargarProyectos() {
    if (!selectProyecto || !usuario) return;

    try {
      const respuesta = await fetch('http://localhost:3000/api/proyectos');
      const proyectos = await respuesta.json();
      
      // Filtrar solo los proyectos del usuario logueado
      const proyectosUsuario = proyectos.filter(p => p.id_usuario === usuario.id_usuario);
      
      // Llenar el select con los proyectos
      proyectosUsuario.forEach(proyecto => {
        const option = document.createElement('option');
        option.value = proyecto.id_proyecto;
        option.textContent = proyecto.nombre;
        selectProyecto.appendChild(option);
      });
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      alert('Error al cargar los proyectos');
    }
  }

  // Obtener datos del formulario
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

  // Enviar tarea al backend
  async function crearTarea(datos, idUsuario) {
    const respuesta = await fetch('http://localhost:3000/api/tareas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        id_usuario: idUsuario
      })
    });

    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.error || 'Error al crear la tarea');
    }

    return await respuesta.json();
  }

  // Manejar el envío del formulario
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      try {
        // Verificar usuario logueado
        if (!verificarUsuario()) {
          return;
        }

        // Obtener datos del formulario
        const datos = obtenerDatosFormulario(form);

        // Crear tarea en el backend
        await crearTarea(datos, usuario.id_usuario);

        // Agregar novedad con mensaje corto
        const usuarioActual = JSON.parse(localStorage.getItem('usuario'));
        const mensajeNovedad = `${usuarioActual?.nombre || 'Usuario'} creó la tarea "${datos.titulo}"`;
        window.agregarNovedad?.(mensajeNovedad);

        // Esperar antes de redirigir
        setTimeout(() => {
          window.location.href = 'tareas.html';
        }, 150);

      } catch (error) {
        console.error('Error al crear tarea:', error);
        alert(error.message || 'Error de conexión con el servidor');
      }
    });
  }

  // Inicializar la página
  cargarProyectos();
}); 

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
  console.log('Novedad guardada:', mensaje, novedades);
}; 