document.addEventListener('DOMContentLoaded', function() {

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }
  
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

  let proyectos = [];
  let tareas = [];
  const selectProyecto = document.querySelector('.kanban-proyecto-select');

  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function mapearEstadoKanban(estado) {
    if (estado === 'en curso') return 'en-curso';
    if (estado === 'finalizada' || estado === 'terminado') return 'terminado';
    return 'sin-asignar'; // pendiente
  }

  function mapearEstadoBackend(estadoKanban) {
    if (estadoKanban === 'en-curso') return 'en curso';
    if (estadoKanban === 'terminado') return 'finalizada';
    return 'pendiente'; // sin-asignar
  }

  function poblarSelectProyectos() {
    selectProyecto.innerHTML = '';
    selectProyecto.style.display = 'none';
    
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
    `;

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

    let tareasFiltradas = tareas;
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

      proyectos = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);
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
});