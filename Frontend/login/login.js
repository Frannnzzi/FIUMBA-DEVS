document.getElementById('formulario-login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const mail = document.getElementById('correo').value;

  try {
    const resp = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail })
    });

    if (resp.ok) {
      const usuario = await resp.json();
      localStorage.setItem('usuario', JSON.stringify(usuario));
      window.location.href = '/pprincipal/principal.html';
    } else {
      const error = await resp.json();
      document.getElementById('mensaje-login').textContent = error.error || 'Usuario o contraseña incorrectos';
    }
  } catch (err) {
    document.getElementById('mensaje-login').textContent = 'Error de conexión con el servidor';
  }
});