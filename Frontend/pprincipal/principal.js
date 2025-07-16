// Actualiza la fecha cada segundo
document.addEventListener('DOMContentLoaded', function() {
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
    document.getElementById('saludo-usuario').textContent = `Hola ${usuario.nombre},`;
  } else {
    document.getElementById('saludo-usuario').textContent = 'Hola Usuario,';
    // Si quieres redirigir al login si no hay usuario, descomenta la siguiente línea:
    // window.location.href = "/login/login.html";
  }

  // (Opcional) Si quieres que los botones lleven a otras páginas en el futuro:
  // document.querySelectorAll('.boton-principal-dashboard')[0].onclick = () => { window.location.href = '/proyectos/crear-proyecto.html'; };
  // document.querySelectorAll('.boton-principal-dashboard')[1].onclick = () => { window.location.href = '/tareas/crear-tarea.html'; };
});
