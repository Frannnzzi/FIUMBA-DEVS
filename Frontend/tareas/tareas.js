// JS base para el kanban de tareas

document.addEventListener('DOMContentLoaded', function() {
  // Leer tareas reales (en el futuro desde backend, por ahora localStorage)
  let tareas = JSON.parse(localStorage.getItem('tareas')) || [];

  function renderKanban() {
    const cols = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };
    // Limpiar columnas
    Object.values(cols).forEach(col => col.innerHTML = '');
    if (tareas.length === 0) {
      Object.values(cols).forEach(col => {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder-tarea-kanban';
        placeholder.textContent = 'No hay tareas para este proyecto.';
        col.appendChild(placeholder);
      });
      return;
    }
    // Renderizar tareas reales
    tareas.forEach((t, idx) => {
      // Determinar columna según estado
      let estado = 'sin-asignar';
      if (t.estado === 'en curso') estado = 'en-curso';
      if (t.estado === 'finalizada' || t.estado === 'terminado') estado = 'terminado';
      const card = document.createElement('div');
      card.className = 'kanban-tarjeta';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-idx', idx);
      card.style.background = '#0a0f0e';
      card.innerHTML = `
        <div class="kanban-tarea-titulo">${t.titulo || ''}</div>
        <div class="kanban-tarea-desc">${t.descripcion || ''}</div>
        <div class="kanban-tarea-autor">${t.prioridad ? 'Prioridad: ' + t.prioridad : ''}</div>
        <div class="kanban-tarea-fecha">${t.fechaFinal ? 'Fecha final: ' + t.fechaFinal : ''}</div>
      `;
      // Drag events
      card.addEventListener('dragstart', dragStart);
      cols[estado].appendChild(card);
    });
    // Permitir drop en columnas
    Object.entries(cols).forEach(([estado, col]) => {
      col.addEventListener('dragover', e => e.preventDefault());
      col.addEventListener('drop', e => {
        e.preventDefault();
        const idx = e.dataTransfer.getData('text/plain');
        let nuevoEstado = estado;
        if (estado === 'en-curso') nuevoEstado = 'en curso';
        if (estado === 'terminado') nuevoEstado = 'finalizada';
        if (estado === 'sin-asignar') nuevoEstado = 'pendiente';
        if (tareas[idx].estado !== nuevoEstado) {
          tareas[idx].estado = nuevoEstado;
          localStorage.setItem('tareas', JSON.stringify(tareas));
          renderKanban();
        }
      });
    });
  }

  function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-idx'));
  }

  renderKanban();
  // Aquí irá la lógica para filtrar por proyecto usando el select
}); 