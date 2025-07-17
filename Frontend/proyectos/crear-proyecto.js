// JS base para crear proyecto

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.form-crear-proyecto');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Obtener los valores de los campos
      const campos = form.querySelectorAll('.input-form-proyecto');
      const nombre = campos[0].value;
      const descripcion = campos[1].value;
      const fechaInicio = campos[2].value;
      const fechaFinal = campos[3].value;
      const estado = campos[4].value;
      // Validar fechas
      if (fechaFinal < fechaInicio) {
        alert('La fecha final no puede ser menor a la fecha de inicio.');
        return;
      }
      // Guardar en localStorage (array de proyectos)
      let proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];
      proyectos.push({ nombre, descripcion, fechaInicio, fechaFinal, estado });
      localStorage.setItem('proyectos', JSON.stringify(proyectos));
      // Redirigir a la página de proyectos
      window.location.href = 'proyectos.html';
    });
  }
}); 