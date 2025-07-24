const API_URL='https://fiumba-devs-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
  const mensajeElement = document.getElementById('mensaje-registro');
  let selectedAvatarId = null;

  const botonesLogo = document.querySelectorAll('.boton-logo');

  function configurarSeleccionAvatar() {
    botonesLogo.forEach(boton => {
      boton.addEventListener('click', () => {
        document.querySelectorAll('.img-logo-registro').forEach(img => img.classList.remove('seleccionado'));
        
        const imgDentroDelBoton = boton.querySelector('.img-logo-registro');
        if (imgDentroDelBoton) {
          imgDentroDelBoton.classList.add('seleccionado');
        }

        selectedAvatarId = parseInt(boton.dataset.avatarId, 10);
      });
    });
  }

  function validarFormulario(nombre, apellido, mail, rol, avatar) {
    if (!nombre.trim()) { mensajeElement.textContent = 'Por favor ingresa tu nombre'; return false; }
    if (!apellido.trim()) { mensajeElement.textContent = 'Por favor ingresa tu apellido'; return false; }
    if (!mail.trim()) { mensajeElement.textContent = 'Por favor ingresa tu email'; return false; }
    if (!rol) { mensajeElement.textContent = 'Por favor selecciona un rol'; return false; }
    if (avatar === null || isNaN(avatar)) {
      mensajeElement.textContent = 'Por favor selecciona un avatar';
      return false;
    }
    return true;
  }

  async function registrarUsuario(datos) {
    const respuesta = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!respuesta.ok) {
      const error = await respuesta.json();
      throw new Error(error.error || 'Error al registrarse');
    }
    return await respuesta.json();
  }

  document.getElementById('formulario-registro').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const mail = document.getElementById('correo').value;
    const rol = document.getElementById('rol').value;
    const avatar = selectedAvatarId;

    if (!validarFormulario(nombre, apellido, mail, rol, avatar)) {
      return;
    }

    const datos = { nombre, apellido, rol, avatar, mail };

    try {
      const respuesta = await registrarUsuario(datos);
      const usuarioFinal = respuesta.usuario ? respuesta.usuario : respuesta;
      localStorage.setItem('usuario', JSON.stringify(usuarioFinal));
      window.location.href = '../pprincipal/principal.html';
    } catch (error) {
      console.error('Error en registro:', error);
      mensajeElement.textContent = error.message || 'Error de conexión con el servidor';
    }
  });

  configurarSeleccionAvatar();
});