document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }
  
  const API_URL = "https://fiumba-devs-backend.onrender.com/api";

  const mapaAvatares = {
    1: '../images/logo1.jpeg',
    2: '../images/logo2.jpeg',
    3: '../images/logo3.jpeg',
    4: '../images/logo4.jpeg',
  };
  const rutaAvatar = mapaAvatares[usuario.avatar];
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && rutaAvatar) {
    logoUsuario.src = rutaAvatar;
  }
  
  function mapearEstadoBackend(estadoKanban) {
    if (estadoKanban === 'en-curso') return 'en curso';
    if (estadoKanban === 'terminado') return 'finalizada';
    return 'pendiente';
  }

  function getIdProyectoFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.has('id_proyecto') ? params.get('id_proyecto') : null;
  }

  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function mapearEstadoKanban(estado) {
    if (estado === 'en curso') return 'en-curso';
    if (estado === 'finalizada' || estado === 'terminado') return 'terminado';
    return 'sin-asignar';
  }

  let proyectos = [];
  let tareas = [];
  const selectProyecto = document.querySelector('.kanban-proyecto-select');

  async function editarTarea(tarea) {
    abrirModalEditarTarea(tarea);
  }

  async function eliminarTarea(tarea) {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
    try {
      const res = await fetch(`${API_URL}/tareas/${tarea.id_tarea}`, {
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

    if (idProyectoUrl) {
      selectProyecto.value = idProyectoUrl;
    } else if (idProyectoStorage) {
      selectProyecto.value = idProyectoStorage;
    } else if (valorActual) {
      selectProyecto.value = valorActual;
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
        <button class="btn-editar-tarea" title="Editar tarea">...</button>
        <button class="btn-eliminar-tarea" title="Eliminar tarea">...</button>
      </div>
    `;

    card.querySelector('.btn-editar-tarea').addEventListener('click', (e) => { e.stopPropagation(); editarTarea(tarea); });
    card.querySelector('.btn-eliminar-tarea').addEventListener('click', (e) => { e.stopPropagation(); eliminarTarea(tarea); });
    card.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', tarea.id_tarea));
    return card;
  }

  function configurarDragDrop() {
    const columnas = {
      'sin-asignar': document.getElementById('lista-sin-asignar'),
      'en-curso': document.getElementById('lista-en-curso'),
      'terminado': document.getElementById('lista-terminado')
    };

    Object.entries(columnas).forEach(([estadoKanban, columna]) => {
      columna.addEventListener('dragover', (e) => e.preventDefault());
      columna.addEventListener('drop', async (e) => {
        e.preventDefault();
        const idTarea = e.dataTransfer.getData('text/plain');
        const nuevoEstado = mapearEstadoBackend(estadoKanban);
        const tarea = tareas.find(t => t.id_tarea == idTarea);
        if (tarea && tarea.estado !== nuevoEstado) {
          try {
            const respuesta = await fetch(`${API_URL}/tareas/${tarea.id_tarea}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: nuevoEstado })
            });
            if (respuesta.ok) {
              localStorage.setItem('kanban_id_proyecto', selectProyecto.value);
              location.reload();
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
        fetch(`${API_URL}/proyectos/usuarios/${usuario.id_usuario}`),
        fetch(`${API_URL}/tareas`)
      ]);
      if (!respuestaProyectos.ok) throw new Error('Error al cargar proyectos');
      if (!respuestaTareas.ok) throw new Error('Error al cargar tareas');
      
      const proyectosData = await respuestaProyectos.json();
      const tareasData = await respuestaTareas.json();

      proyectos = proyectosData;
      tareas = tareasData.filter(t => proyectos.some(p => p.id_proyecto === t.id_proyecto));

      poblarSelectProyectos();
      renderizarKanban();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }
  
  selectProyecto.addEventListener('change', () => {
    localStorage.setItem('kanban_id_proyecto', selectProyecto.value);
    renderizarKanban();
  });
  configurarDragDrop();
  cargarDatos();
  
  // Lógica del modal de edición
  const modalEditarTarea = document.getElementById('modal-editar-tarea');
  const formEditarTarea = document.getElementById('form-editar-tarea');
  const btnCerrarModalEditarTarea = document.getElementById('modal-editar-tarea-cerrar-btn');
  let tareaEditando = null;

  function abrirModalEditarTarea(tarea) {
    tareaEditando = tarea;
    document.getElementById('editar-titulo').value = tarea.titulo || '';
    document.getElementById('editar-descripcion').value = tarea.descripcion || '';
    document.getElementById('editar-prioridad').value = tarea.prioridad || 'media';
    document.getElementById('editar-fecha-final').value = tarea.fecha_final ? tarea.fecha_final.split('T')[0] : '';
    modalEditarTarea.style.display = 'flex';
  }

  if(btnCerrarModalEditarTarea) {
    btnCerrarModalEditarTarea.addEventListener('click', () => {
      modalEditarTarea.style.display = 'none';
      tareaEditando = null;
    });
  }

  if(formEditarTarea) {
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
        const res = await fetch(`${API_URL}/tareas/${tareaEditando.id_tarea}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
        if (!res.ok) throw new Error('No se pudo editar la tarea');
        
        localStorage.setItem('kanban_id_proyecto', selectProyecto.value);
        location.reload();
      } catch (err) {
        alert('Error al editar la tarea.');
      }
    });
  }
});