// Página de login - Maneja la autenticación de usuarios
document.getElementById('formulario-login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('correo').value;
  const mensajeElement = document.getElementById('mensaje-login');

  // Validar que se ingresó un email
  if (!email.trim()) {
    mensajeElement.textContent = 'Por favor ingresa tu email';
    return;
  }

  try {
    // Buscar el usuario en el backend
    const respuesta = await fetch('http://localhost:3000/api/usuarios');
    const usuarios = await respuesta.json();
    
    // Buscar usuario por email
    const usuario = usuarios.find(u => u.mail === email);

    if (usuario) {
      // Guardar usuario en localStorage y redirigir
      localStorage.setItem('usuario', JSON.stringify(usuario));
      window.location.href = '../pprincipal/principal.html';
    } else {
      mensajeElement.textContent = 'Usuario no encontrado. Verifica tu email o regístrate.';
    }
  } catch (error) {
    console.error('Error en login:', error);
    mensajeElement.textContent = 'Error de conexión con el servidor. Intenta nuevamente.';
  }
});