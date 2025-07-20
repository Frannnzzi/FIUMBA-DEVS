// Página de crear proyecto - Maneja la creación de nuevos proyectos
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-crear-proyecto');

  // Validar fechas del proyecto
  function validarFechas(fechaInicio, fechaFinal) {
    if (fechaFinal < fechaInicio) {
      alert('La fecha final no puede ser menor a la fecha de inicio.');
      return false;
    }
    return true;
  }

  // Obtener datos del formulario
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

  // Verificar que el usuario esté logueado
  function verificarUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
      alert('Debes estar logueado para crear un proyecto.');
      return null;
    }
    return usuario;
  }

  // Enviar proyecto al backend
  async function crearProyecto(datos, idUsuario) {
    const respuesta = await fetch('http://localhost:3000/api/proyectos', {
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

  // Manejar el envío del formulario
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      try {
        // Obtener datos del formulario
        const datos = obtenerDatosFormulario(form);

        // Validar fechas
        if (!validarFechas(datos.fecha_inicio, datos.fecha_final)) {
          return;
        }

        // Verificar usuario logueado
        const usuario = verificarUsuario();
        if (!usuario) {
          return;
        }

        // Crear proyecto en el backend
        await crearProyecto(datos, usuario.id_usuario);

        // Redirigir a la página de proyectos
        window.location.href = 'proyectos.html';

      } catch (error) {
        console.error('Error al crear proyecto:', error);
        alert(error.message || 'Error de conexión con el servidor');
      }
    });
  }
}); 