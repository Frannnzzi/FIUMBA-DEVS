const botonesLogo = document.querySelectorAll('.boton-logo');
const inputLogo = document.getElementById('logo');
botonesLogo.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesLogo.forEach(b => b.classList.remove('seleccionado'));
    boton.classList.add('seleccionado');
    inputLogo.value = boton.dataset.valor;
  });
});

document.getElementById('formulario-registro').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Tomar los datos del formulario
  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const mail = document.getElementById('correo').value; // CAMBIADO a mail
  const rol = document.getElementById('rol').value;
  const avatar = document.getElementById('logo').value; // CAMBIADO a avatar

  // Armar el objeto a enviar
  const datos = { nombre, apellido, rol, avatar, mail };

  try {
    const resp = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (resp.ok) {
      const usuario = await resp.json();
      // Guardar solo el objeto usuario
      localStorage.setItem('usuario', JSON.stringify(usuario.usuario));
      window.location.href = '/pprincipal/principal.html';
    } else {
      const error = await resp.json();
      document.getElementById('mensaje-registro').textContent = error.error || 'Error al registrarse';
    }
  } catch (err) {
    document.getElementById('mensaje-registro').textContent = 'Error de conexión con el servidor';
  }
});
