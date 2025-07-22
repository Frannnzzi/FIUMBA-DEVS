document.addEventListener('DOMContentLoaded', function() {

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }
  
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

  const form = document.getElementById('form-crear-proyecto');

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
    const respuesta = await fetch('http://localhost:3000/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        id_usuario: idUsuario
      })
    });
    if (!respuesta.ok) {
      throw new Error('Error al crear el proyecto');
    }
    return await respuesta.json();
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
      const datos = obtenerDatosFormulario(form);
      if (datos.fecha_final < datos.fecha_inicio) {
        alert('La fecha final no puede ser menor a la fecha de inicio.');
        return;
      }
      await crearProyecto(datos, usuario.id_usuario);
      window.location.href = '../proyectos/proyectos.html';
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert(error.message);
    }
  });
});