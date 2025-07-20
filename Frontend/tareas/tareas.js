// Página de tareas - Maneja el kanban de tareas con drag & drop
document.addEventListener('DOMContentLoaded', function() {
  // Verificar que el usuario esté logueado, si no, ir al login
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }

  // Variables globales para usar en toda la página
  let proyectos = [];
  let tareas = [];
  const selectProyecto = document.querySelector('.kanban-proyecto-select');

  // Función para formatear fechas en formato argentino
  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  // Mapear estados del backend a estados del kanban
  function mapearEstadoKanban(estado) {
    if (estado === 'en curso') return 'en-curso';
    if (estado === 'finalizada' || estado === 'terminado') return 'terminado';
    return 'sin-asignar'; // pendiente
  }

  // Mapear estados del kanban a estados del backend
  function mapearEstadoBackend(estadoKanban) {
    if (estadoKanban === 'en-curso') return 'en curso';
    if (estadoKanban === 'terminado') return 'finalizada';
    return 'pendiente'; // sin-asignar
  }

  // Llenar el select con los proyectos del usuario
  function poblarSelectProyectos() {
    selectProyecto.innerHTML = '';
    
    if (proyectos.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No hay proyectos disponibles';
      opt.disabled = true;
      opt.selected = true;
      selectProyecto.appendChild(opt);
      return;
    }

    proyectos.forEach(proyecto => {
      const opt = document.createElement('option');
      opt.value = proyecto.id_proyecto;
      opt.textContent = proyecto.nombre;
      selectProyecto.appendChild(opt);
    });
  }

  // Crear una tarjeta de tarea para el kanban
  function crearTarjetaTarea(tarea) {
    const card = document.createElement('div');
    card.className = 'kanban-tarjeta';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id-tarea', tarea.id_tarea);
    card.style.background = '#0a0f0e';

    const fechaFinal = formatearFecha(tarea.fecha_final);
    
    card.innerHTML = `
      <div class="kanban-tarea-titulo">${tarea.titulo || ''}</div>
      <div class="kanban-tarea-desc">${tarea.descripcion || ''}</div>
      <div class="kanban-tarea-autor">${tarea.prioridad ? 'Prioridad: ' + tarea.prioridad : ''}</div>
      <div class="kanban-tarea-fecha">${fechaFinal ? 'Fecha final: ' + fechaFinal : ''}</div>
      <div style="display:flex; gap:4px; margin-top:6px;">
        <button class="btn-circular btn-editar-tarea" title="Editar">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="btn-circular btn-eliminar-tarea" title="Eliminar">
          <svg viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/></svg>
        </button>
      </div>
    `;

    // Configurar eventos de drag & drop
    card.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', tarea.id_tarea);
    });

    // Configurar eventos de los botones
    const btnEditar = card.querySelector('.btn-editar-tarea');
    const btnEliminar = card.querySelector('.btn-eliminar-tarea');

    btnEditar.addEventListener('click', () => editarTarea(tarea));
    btnEliminar.addEventListener('click', () => eliminarTarea(tarea));

    return card;
  }

  // Mostrar mensaje cuando no hay tareas
  function mostrarMensajeVacio(columna) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-tarea-kanban';
    placeholder.textContent = 'No hay tareas para este proyecto.';
    columna.appendChild(placeholder);
  }

  // Editar una tarea usando prompts (temporal, después se puede mejorar con un modal)
  async function editarTarea(tarea) {
    const nuevoTitulo = prompt('Editar título de la tarea:', tarea.titulo);
    if (nuevoTitulo === null) return; // Usuario canceló

    const nuevaDescripcion = prompt('Editar descripción:', tarea.descripcion);
    if (nuevaDescripcion === null) return;

    const nuevaFechaFinal = prompt('Editar fecha final (YYYY-MM-DD):', tarea.fecha_final);
    if (nuevaFechaFinal === null) return;

    const nuevoEstado = prompt('Editar estado:', tarea.estado);
    if (nuevoEstado === null) return;

    const nuevaPrioridad = prompt('Editar prioridad:', tarea.prioridad);
    if (nuevaPrioridad === null) return;

    try {
      const respuesta = await fetch('http://localhost:3000/api/tareas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tarea: tarea.id_tarea,
          titulo: nuevoTitulo,
          descripcion: nuevaDescripcion,
          fecha_final: nuevaFechaFinal,
          estado: nuevoEstado,
          prioridad: nuevaPrioridad,
          id_proyecto: tarea.id_proyecto,
          id_usuario: tarea.id_usuario
        })
      });

      if (respuesta.ok) {
        location.reload(); // Recargar para mostrar los cambios
      } else {
        alert('Error al actualizar la tarea');
      }
    } catch (error) {
      alert('Error de conexión al actualizar la tarea');
    }
  }

  // Eliminar una tarea
  async function eliminarTarea(tarea) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/tareas/${tarea.id_tarea}`, { 
        method: 'DELETE' 
      });

      if (respuesta.ok) {
        location.reload(); // Recargar para mostrar los cambios
      } else {
        alert('Error al eliminar la tarea');
      }
    } catch (error) {
      alert('Error de conexión al eliminar la tarea');
    }
  }

  // Configurar eventos de drag & drop para las columnas
  function configurarDragDrop() {
    const columnas = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };

    Object.entries(columnas).forEach(([estadoKanban, columna]) => {
      columna.addEventListener('dragover', function(e) { 
        e.preventDefault(); 
      });

      columna.addEventListener('drop', async function(e) {
        e.preventDefault();
        const idTarea = e.dataTransfer.getData('text/plain');
        const nuevoEstado = mapearEstadoBackend(estadoKanban);
        
        const tarea = tareas.find(t => t.id_tarea == idTarea);
        if (tarea && tarea.estado !== nuevoEstado) {
          try {
            const respuesta = await fetch('http://localhost:3000/api/tareas', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...tarea, estado: nuevoEstado })
            });

            if (respuesta.ok) {
              location.reload(); // Recargar para mostrar los cambios
            } else {
              alert('Error al actualizar el estado de la tarea');
            }
          } catch (error) {
            alert('Error de conexión al actualizar el estado');
          }
        }
      });
    });
  }

  // Renderizar el kanban completo
  function renderizarKanban() {
    const columnas = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };

    // Limpiar todas las columnas
    Object.values(columnas).forEach(columna => columna.innerHTML = '');

    // Filtrar tareas por proyecto seleccionado
    let tareasFiltradas = tareas;
    if (proyectos.length > 0 && selectProyecto.value !== '') {
      const idProyecto = parseInt(selectProyecto.value);
      tareasFiltradas = tareas.filter(t => t.id_proyecto === idProyecto);
    }

    // Si no hay tareas, mostrar mensaje en todas las columnas
    if (tareasFiltradas.length === 0) {
      Object.values(columnas).forEach(columna => {
        mostrarMensajeVacio(columna);
      });
      return;
    }

    // Distribuir tareas en las columnas según su estado
    tareasFiltradas.forEach(tarea => {
      const estadoKanban = mapearEstadoKanban(tarea.estado);
      const columna = columnas[estadoKanban];
      const tarjeta = crearTarjetaTarea(tarea);
      columna.appendChild(tarjeta);
    });
  }

  // Cargar datos iniciales desde el backend
  async function cargarDatos() {
    try {
      // Traer proyectos y tareas en paralelo para ser más rápido
      const [respuestaProyectos, respuestaTareas] = await Promise.all([
        fetch('http://localhost:3000/api/proyectos'),
        fetch('http://localhost:3000/api/tareas')
      ]);

      // Verificar si las respuestas son exitosas
      if (!respuestaProyectos.ok) {
        throw new Error(`Error al cargar proyectos: ${respuestaProyectos.status}`);
      }
      if (!respuestaTareas.ok) {
        throw new Error(`Error al cargar tareas: ${respuestaTareas.status}`);
      }

      const proyectosData = await respuestaProyectos.json();
      const tareasData = await respuestaTareas.json();

      // Filtrar solo los proyectos del usuario logueado
      proyectos = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);
      tareas = tareasData.filter(t => 
        proyectos.some(p => p.id_proyecto === t.id_proyecto)
      );

      // Configurar la página
      poblarSelectProyectos();
      configurarDragDrop();
      renderizarKanban();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      
      // En lugar de mostrar error, mostrar kanban vacío con mensajes estéticos
      proyectos = [];
      tareas = [];
      
      // Configurar la página con datos vacíos
      poblarSelectProyectos();
      configurarDragDrop();
      renderizarKanban();
    }
  }

  // Configurar eventos
  function configurarEventos() {
    if (selectProyecto) {
      selectProyecto.addEventListener('change', renderizarKanban);
    }
  }

  // Inicializar la página
  cargarDatos();
  configurarEventos();
}); 