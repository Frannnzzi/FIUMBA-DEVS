// JS base para crear tarea

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-crear-tarea');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Obtener los valores de los campos
      const campos = form.querySelectorAll('.input-form-tarea');
      const titulo = campos[0].value;
      const descripcion = campos[1].value;
      const fechaFinal = campos[2].value;
      const estado = campos[3].value;
      const prioridad = campos[4].value;
      // Guardar en localStorage (array de tareas)
      let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
      tareas.push({ titulo, descripcion, fechaFinal, estado, prioridad });
      localStorage.setItem('tareas', JSON.stringify(tareas));
      // Redirigir a la página de tareas
      window.location.href = 'tareas.html';
    });
  }
}); 