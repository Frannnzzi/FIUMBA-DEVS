// JS base para la página de proyectos
// Aquí irá la lógica para agregar, editar y eliminar proyectos dinámicamente

document.addEventListener('DOMContentLoaded', function() {
  const lista = document.querySelector('.lista-proyectos');
  // Limpiar lista
  lista.innerHTML = '';
  // Leer proyectos de localStorage
  let proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];
  if (proyectos.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-proyecto';
    placeholder.textContent = 'No hay proyectos por ahora';
    lista.appendChild(placeholder);
  } else {
    proyectos.forEach(proy => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'tarjeta-proyecto';
      tarjeta.innerHTML = `
        <div class="info-proyecto">
          <div class="nombre-proyecto">${proy.nombre}</div>
          <div class="desc-proyecto">${proy.descripcion}</div>
          <div class="fechas-proyecto">${proy.fechaInicio} - ${proy.fechaFinal}</div>
          <div class="estado-proyecto">Estado: <b>${proy.estado}</b></div>
        </div>
        <div class="acciones-proyecto">
          <button class="btn-editar">Editar</button>
          <button class="btn-eliminar">Eliminar</button>
        </div>
        <div class="barra-progreso">
          <div class="progreso" style="width: ${progresoPorEstado(proy.estado)}%"></div>
          <span class="porcentaje">${progresoPorEstado(proy.estado)}%</span>
        </div>
      `;
      lista.appendChild(tarjeta);
    });
  }

  function progresoPorEstado(estado) {
    if (estado === 'pendiente') return 0;
    if (estado === 'en curso') return 50;
    if (estado === 'finalizado') return 100;
    return 0;
  }

  // Funcionalidad de búsqueda
  const inputBuscar = document.querySelector('.input-buscar-proyecto');
  const btnBuscar = document.querySelector('.btn-buscar-proyecto');

  function buscarProyecto() {
    const texto = inputBuscar.value.trim().toLowerCase();
    // Filtrar proyectos
    const filtrados = proyectos.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion.toLowerCase().includes(texto)
    );
    lista.innerHTML = '';
    if (filtrados.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder-proyecto';
      placeholder.textContent = 'No hay proyectos que coincidan con la búsqueda';
      lista.appendChild(placeholder);
    } else {
      filtrados.forEach(proy => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-proyecto';
        tarjeta.innerHTML = `
          <div class="info-proyecto">
            <div class="nombre-proyecto">${proy.nombre}</div>
            <div class="desc-proyecto">${proy.descripcion}</div>
            <div class="fechas-proyecto">${proy.fechaInicio} - ${proy.fechaFinal}</div>
            <div class="estado-proyecto">Estado: <b>${proy.estado}</b></div>
          </div>
          <div class="acciones-proyecto">
            <button class="btn-editar">Editar</button>
            <button class="btn-eliminar">Eliminar</button>
          </div>
          <div class="barra-progreso">
            <div class="progreso" style="width: ${progresoPorEstado(proy.estado)}%"></div>
            <span class="porcentaje">${progresoPorEstado(proy.estado)}%</span>
          </div>
        `;
        lista.appendChild(tarjeta);
      });
    }
  }

  if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarProyecto);
  }
  if (inputBuscar) {
    inputBuscar.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        buscarProyecto();
      }
    });
  }
}); 