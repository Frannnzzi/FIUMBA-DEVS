const API_URL='https://fiumba-devs-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
  // Mapea el estado del Kanban al estado del backend
  function mapearEstadoBackend(estadoKanban) {
    if (estadoKanban === 'en-curso') return 'en curso';
    if (estadoKanban === 'terminado') return 'finalizada';
    return 'pendiente';
  }

  // Obtener id_proyecto de la URL si existe
  function getIdProyectoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.has('id_proyecto') ? params.get('id_proyecto') : null;
  }

  // Inicializar usuario y mapaAvatares antes de cualquier uso
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }
  const mapaAvatares = {
    1: '../images/logo1.jpeg',
    2: '../images/logo2.jpeg',
    3: '../images/logo3.jpeg',
    4: '../images/logo4.jpeg'
  };

  // Mostrar el logo del usuario correctamente
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && usuario.avatar && mapaAvatares[usuario.avatar]) {
    logoUsuario.src = mapaAvatares[usuario.avatar];
    logoUsuario.style.display = '';
  }

  // Formatea la fecha en formato local
  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Mapea el estado del backend al estado del Kanban
  function mapearEstadoKanban(estado) {
    if (estado === 'en curso') return 'en-curso';
    if (estado === 'finalizada' || estado === 'terminado') return 'terminado';
    return 'sin-asignar'; // pendiente
  }

  // Variables globales para todo el script
  let proyectos = [];
  let tareas = [];
  const selectProyecto = document.querySelector('.kanban-proyecto-select');
  async function editarTarea(tarea) {
    abrirModalEditarTarea(tarea);
  }

  async function eliminarTarea(tarea) {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tareas/${tarea.id_tarea}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar la tarea');
      location.reload();
    } catch (error) {
      alert('No se pudo eliminar la tarea: ' + error.message);
    }
  }

  function poblarSelectProyectos() {
    const idProyectoUrl = getIdProyectoFromUrl();
    const valorActual = selectProyecto.value;
    const idProyectoStorage = localStorage.getItem('kanban_id_proyecto');
    selectProyecto.innerHTML = '';
    selectProyecto.style.display = '';

    if (!proyectos || proyectos.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No hay proyectos disponibles';
      opt.disabled = false;
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

    // Seleccionar el proyecto si viene en la URL, localStorage o mantener el actual
    if (idProyectoUrl) {
      selectProyecto.value = idProyectoUrl;
      localStorage.removeItem('kanban_id_proyecto');
    } else if (idProyectoStorage) {
      selectProyecto.value = idProyectoStorage;
      localStorage.removeItem('kanban_id_proyecto');
    } else if (valorActual) {
      selectProyecto.value = valorActual;
    } else {
      selectProyecto.selectedIndex = 0;
    }
  }

  function crearTarjetaTarea(tarea) {
    const card = document.createElement('div');
    card.className = 'kanban-tarjeta';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id-tarea', tarea.id_tarea);
    const fechaFinal = formatearFecha(tarea.fecha_final);
    
    card.innerHTML = `
      <div class="kanban-tarea-titulo">${tarea.titulo || ''}</div>
      <div class="kanban-tarea-desc">${tarea.descripcion || ''}</div>
      <div class="kanban-tarea-prioridad">Prioridad: ${tarea.prioridad || ''}</div>
      <div class="kanban-tarea-fecha">Vence: ${fechaFinal || ''}</div>
      <div class="kanban-tarea-acciones">
        <button class="btn-editar-tarea" title="Editar tarea">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </button>
        <button class="btn-eliminar-tarea" title="Eliminar tarea">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </button>
      </div>
    `;

    // Acciones editar/eliminar
    card.querySelector('.btn-editar-tarea').addEventListener('click', function(e) {
      e.stopPropagation();
      editarTarea(tarea);
    });
    card.querySelector('.btn-eliminar-tarea').addEventListener('click', function(e) {
      e.stopPropagation();
      eliminarTarea(tarea);
    });

    card.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', tarea.id_tarea);
    });
    return card;
  }

  function configurarDragDrop() {
    const columnas = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };

    Object.entries(columnas).forEach(([estadoKanban, columna]) => {
      columna.addEventListener('dragover', function(e) { e.preventDefault(); });
      columna.addEventListener('drop', async function(e) {
        e.preventDefault();
        const idTarea = e.dataTransfer.getData('text/plain');
        const nuevoEstado = mapearEstadoBackend(estadoKanban);
        const tarea = tareas.find(t => t.id_tarea == idTarea);
        if (tarea && tarea.estado !== nuevoEstado) {
          try {
            const respuesta = await fetch(`http://localhost:3000/api/tareas/${tarea.id_tarea}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: nuevoEstado })
            });
            if (respuesta.ok) {

              // Mantener el proyecto seleccionado al recargar
              const idProyectoActual = selectProyecto.value;
              window.location.href = `tareas.html?id_proyecto=${idProyectoActual}`;
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

  function renderizarKanban() {
    const columnas = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };
    Object.values(columnas).forEach(columna => columna.innerHTML = '');

    // Solo mostrar tareas del proyecto seleccionado
    let tareasFiltradas = [];
    if (proyectos.length > 0 && selectProyecto.value) {
      const idProyecto = parseInt(selectProyecto.value);
      tareasFiltradas = tareas.filter(t => t.id_proyecto === idProyecto);
    }
    tareasFiltradas.forEach(tarea => {
      const estadoKanban = mapearEstadoKanban(tarea.estado);
      if (columnas[estadoKanban]) {
        const tarjeta = crearTarjetaTarea(tarea);
        columnas[estadoKanban].appendChild(tarjeta);
      }
    });
  }

  async function cargarDatos() {
    try {
      const [respuestaProyectos, respuestaTareas] = await Promise.all([
        fetch('http://localhost:3000/api/proyectos'),
        fetch('http://localhost:3000/api/tareas')
      ]);
      if (!respuestaProyectos.ok) throw new Error('Error al cargar proyectos');
      if (!respuestaTareas.ok) throw new Error('Error al cargar tareas');
      
      const proyectosData = await respuestaProyectos.json();
      const tareasData = await respuestaTareas.json();

      // Filtrar proyectos donde el usuario es dueño
      let proyectosFiltrados = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);
      // agregar proyectos colaborativos
      try {
        const proyectosUsuario = await fetch(`http://localhost:3000/api/proyectos/usuarios/${usuario.id_usuario}`);
        if (proyectosUsuario.ok) {
          const colaborativos = await proyectosUsuario.json();
          // Unir y eliminar duplicados
          const ids = new Set();
          proyectosFiltrados = [...proyectosFiltrados, ...colaborativos].filter(p => {
            if (!ids.has(p.id_proyecto)) {
              ids.add(p.id_proyecto);
              return true;
            }
            return false;
          });
        }
      } catch (e) {
        console.error('Error al cargar proyectos colaborativos:', e);
      }
      proyectos = proyectosFiltrados;
      tareas = tareasData.filter(t => proyectos.some(p => p.id_proyecto === t.id_proyecto));

      poblarSelectProyectos();
      renderizarKanban();
      selectProyecto.style.display = '';
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  selectProyecto.addEventListener('change', renderizarKanban);
  configurarDragDrop();
  cargarDatos();

  // Fin del bloque principal

  // Modal editar tarea
  const modalEditarTarea = document.getElementById('modal-editar-tarea');
  const formEditarTarea = document.getElementById('form-editar-tarea');
  const btnCerrarModalEditarTarea = document.getElementById('modal-editar-tarea-cerrar-btn');
  const mensajeModalEditarTarea = document.getElementById('mensaje-modal-editar-tarea');
  let tareaEditando = null;

  function abrirModalEditarTarea(tarea) {
    tareaEditando = tarea;
    document.getElementById('editar-titulo').value = tarea.titulo || '';
    document.getElementById('editar-descripcion').value = tarea.descripcion || '';
    document.getElementById('editar-prioridad').value = tarea.prioridad || 'media';
    document.getElementById('editar-fecha-final').value = tarea.fecha_final ? tarea.fecha_final.split('T')[0] : '';
    mensajeModalEditarTarea.textContent = '';
    modalEditarTarea.classList.remove('modal-editar-tarea-oculto');
    modalEditarTarea.style.display = 'flex';
  }

  btnCerrarModalEditarTarea.addEventListener('click', () => {
    modalEditarTarea.classList.add('modal-editar-tarea-oculto');
    modalEditarTarea.style.display = 'none';
    tareaEditando = null;
  });

  formEditarTarea.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!tareaEditando) return;
    const datos = {
      titulo: document.getElementById('editar-titulo').value,
      descripcion: document.getElementById('editar-descripcion').value,
      prioridad: document.getElementById('editar-prioridad').value,
      fecha_final: document.getElementById('editar-fecha-final').value
    };
    try {
      const res = await fetch(`http://localhost:3000/api/tareas/${tareaEditando.id_tarea}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (!res.ok) throw new Error('No se pudo editar la tarea');
      mensajeModalEditarTarea.textContent = 'Tarea editada correctamente.';
      setTimeout(() => {
        modalEditarTarea.classList.add('modal-editar-tarea-oculto');
        modalEditarTarea.style.display = 'none';
        tareaEditando = null;
        location.reload();
      }, 800);
    } catch (err) {
      mensajeModalEditarTarea.textContent = 'Error al editar la tarea.';
    }
  });
});