const API_URL = 'https://fiumba-devs-backend.onrender.com/api';

document.getElementById('formulario-login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('correo').value;
  const mensajeElement = document.getElementById('mensaje-login');

  if (!email.trim()) {
    mensajeElement.textContent = 'Por favor ingresa tu email';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios`);
    
    if (!response.ok) {
        throw new Error('Error de conexión con el servidor.');
    }
    
    const usuarios = await response.json();
    const usuario = usuarios.find(u => u.mail === email);

    if (usuario) {
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