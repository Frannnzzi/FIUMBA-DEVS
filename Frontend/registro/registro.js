// Página de registro - Maneja la creación de nuevos usuarios
document.addEventListener('DOMContentLoaded', function() {
  const botonesLogo = document.querySelectorAll('.boton-logo');
  const inputLogo = document.getElementById('logo');
  const mensajeElement = document.getElementById('mensaje-registro');

  // Configurar selección de avatar/logo
  function configurarSeleccionAvatar() {
    botonesLogo.forEach(boton => {
      boton.addEventListener('click', () => {
        // Quitar selección de todos los botones
        botonesLogo.forEach(b => b.classList.remove('seleccionado'));
        // Seleccionar el botón clickeado
        boton.classList.add('seleccionado');
        // Actualizar el input hidden
        inputLogo.value = boton.dataset.valor;
      });
    });
  }

  // Validar datos del formulario
  function validarFormulario(nombre, apellido, mail, rol, avatar) {
    if (!nombre.trim()) {
      mensajeElement.textContent = 'Por favor ingresa tu nombre';
      return false;
    }
    if (!apellido.trim()) {
      mensajeElement.textContent = 'Por favor ingresa tu apellido';
      return false;
    }
    if (!mail.trim()) {
      mensajeElement.textContent = 'Por favor ingresa tu email';
      return false;
    }
    if (!rol) {
      mensajeElement.textContent = 'Por favor selecciona un rol';
      return false;
    }
    if (!avatar) {
      mensajeElement.textContent = 'Por favor selecciona un avatar';
      return false;
    }
    return true;
  }

  // Enviar datos de registro al backend
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

  // Manejar el envío del formulario
  document.getElementById('formulario-registro').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Obtener datos del formulario
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const mail = document.getElementById('correo').value;
    const rol = document.getElementById('rol').value;
    const avatar = document.getElementById('logo').value;

    // Validar datos
    if (!validarFormulario(nombre, apellido, mail, rol, avatar)) {
      return;
    }

    // Preparar datos para enviar
    const datos = { nombre, apellido, rol, avatar, mail };

    try {
      // Registrar usuario en el backend
      const respuesta = await registrarUsuario(datos);
      
      // Manejar respuesta (puede venir como {usuario: {...}} o {...})
      const usuarioFinal = respuesta.usuario ? respuesta.usuario : respuesta;
      
      // Guardar usuario en localStorage y redirigir
      localStorage.setItem('usuario', JSON.stringify(usuarioFinal));
      window.location.href = '../pprincipal/principal.html';
      
    } catch (error) {
      console.error('Error en registro:', error);
      mensajeElement.textContent = error.message || 'Error de conexión con el servidor';
    }
  });

  // Inicializar la página
  configurarSeleccionAvatar();
});
