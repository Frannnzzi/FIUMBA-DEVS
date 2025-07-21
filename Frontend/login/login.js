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
    // Reemplaza la URL por la absoluta y chequea que usuarios sea un array
    fetch('http://localhost:3000/api/usuarios')
      .then(response => response.json())
      .then(usuarios => {
        console.log('Respuesta del backend:', usuarios);
        if (!Array.isArray(usuarios)) {
          alert('Error de conexión con el servidor o datos inválidos.');
          return;
        }
    const usuario = usuarios.find(u => u.mail === email);
    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario));
      window.location.href = '../pprincipal/principal.html';
    } else {
      mensajeElement.textContent = 'Usuario no encontrado. Verifica tu email o regístrate.';
    }
      })
      .catch(error => {
        alert('Error de conexión con el servidor. Intenta nuevamente.');
      });
  } catch (error) {
    console.error('Error en login:', error);
    mensajeElement.textContent = 'Error de conexión con el servidor. Intenta nuevamente.';
  }
});