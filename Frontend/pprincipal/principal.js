// Actualiza la fecha cada segundo
function actualizarFecha() {
  const fecha = new Date();
  const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
  const fechaFormateada = fecha.toLocaleDateString('es-AR', opciones);
  document.getElementById('fecha-actual').textContent = `hoy es ${fechaFormateada}`;
}
actualizarFecha();
setInterval(actualizarFecha, 60000); // Actualiza cada minuto

// Mostrar saludo personalizado con nombre
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (usuario && usuario.nombre) {
  document.getElementById('saludo-usuario').textContent = `Hola ${usuario.nombre} ${usuario.apellido} (${usuario.rol}),`;
  document.getElementById('saludo-usuario').textContent = `Hola ${usuario.nombre},`;
} else {
  // Si no hay usuario, redirige al login
  window.location.href = "/login/login.html";
}

// (Opcional) Si quieres que los botones lleven a otras páginas en el futuro:
// document.querySelectorAll('.boton-principal-dashboard')[0].onclick = () => { /* ir a crear proyecto */ };
// document.querySelectorAll('.boton-principal-dashboard')[1].onclick = () => { /* ir a crear tarea */ };
