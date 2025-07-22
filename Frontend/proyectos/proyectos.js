// Página de proyectos - Maneja la lista, edición y eliminación de proyectos
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
  const lista = document.querySelector('.lista-proyectos');

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

  // Calcular el progreso de un proyecto basado en sus tareas
  function calcularProgreso(proyecto) {
    const tareasProyecto = tareas.filter(t => t.id_proyecto === proyecto.id_proyecto);
    if (tareasProyecto.length === 0) return 0;
    
    const finalizadas = tareasProyecto.filter(t => 
      t.estado === 'finalizada' || t.estado === 'terminado'
    ).length;
    
    return Math.round((finalizadas / tareasProyecto.length) * 100);
  }

  // Crear el HTML de una tarjeta de proyecto
  function crearTarjetaProyecto(proyecto) {
    const porcentaje = calcularProgreso(proyecto);
    const fechaInicio = formatearFecha(proyecto.fecha_inicio);
    const fechaFinal = formatearFecha(proyecto.fecha_final);

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-proyecto';
    tarjeta.innerHTML = `
      <div class="info-proyecto">
        <div class="nombre-proyecto">${proyecto.nombre}</div>
        <div class="desc-proyecto">${proyecto.descripcion}</div>
        <div class="fechas-proyecto">${fechaInicio} - ${fechaFinal}</div>
        <div class="estado-proyecto">Estado: <b>${proyecto.estado}</b></div>
      </div>
      <div class="acciones-proyecto">
        <button class="btn-editar">Editar</button>
        <button class="btn-eliminar">Eliminar</button>
      </div>
      <div class="barra-progreso">
        <div class="progreso" style="width: ${porcentaje}%"></div>
        <span class="porcentaje">${porcentaje}%</span>
      </div>
    `;

    // Agregar eventos a los botones de la tarjeta
    const btnEditar = tarjeta.querySelector('.btn-editar');
    const btnEliminar = tarjeta.querySelector('.btn-eliminar');

    btnEditar.addEventListener('click', () => editarProyecto(proyecto));
    btnEliminar.addEventListener('click', () => eliminarProyecto(proyecto));

    return tarjeta;
  }

  // Mostrar mensaje cuando no hay proyectos
  function mostrarMensajeVacio(mensaje) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-proyecto';
    placeholder.textContent = mensaje;
    return placeholder;
  }

  // Renderizar la lista de proyectos
  function renderizarProyectos(proyectosAMostrar) {
    lista.innerHTML = '';
    
    if (proyectosAMostrar.length === 0) {
      lista.appendChild(mostrarMensajeVacio('No hay proyectos por ahora'));
      return;
    }

    proyectosAMostrar.forEach(proyecto => {
      const tarjeta = crearTarjetaProyecto(proyecto);
      lista.appendChild(tarjeta);
    });
  }

  // Editar un proyecto usando prompts
  async function editarProyecto(proyecto) {
    const nuevoNombre = prompt('Editar nombre del proyecto:', proyecto.nombre);
    if (nuevoNombre === null) return; // Usuario canceló

    const nuevaDescripcion = prompt('Editar descripción del proyecto:', proyecto.descripcion);
    if (nuevaDescripcion === null) return;

    const nuevaFechaInicio = prompt('Editar fecha de inicio (YYYY-MM-DD):', proyecto.fecha_inicio);
    if (nuevaFechaInicio === null) return;

    const nuevaFechaFinal = prompt('Editar fecha final (YYYY-MM-DD):', proyecto.fecha_final);
    if (nuevaFechaFinal === null) return;

    const nuevoEstado = prompt('Editar estado:', proyecto.estado);
    if (nuevoEstado === null) return;

    // Validar que la fecha final no sea menor que la de inicio
    if (nuevaFechaFinal < nuevaFechaInicio) {
      alert('La fecha final no puede ser menor a la fecha de inicio.');
      return;
    }

    try {
      // Enviar cambios al backend
      const respuesta = await fetch(`http://localhost:3000/api/proyectos/${proyecto.id_proyecto}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_proyecto: proyecto.id_proyecto,
          nombre: nuevoNombre,
          descripcion: nuevaDescripcion,
          fecha_inicio: nuevaFechaInicio,
          fecha_final: nuevaFechaFinal,
          estado: nuevoEstado,
          id_usuario: proyecto.id_usuario
        })
      });

      if (respuesta.ok) {
        location.reload(); // Recargar para mostrar los cambios
      } else {
        alert('Error al actualizar el proyecto');
      }
    } catch (error) {
      alert('Error de conexión al actualizar el proyecto');
    }
  }

  // Eliminar un proyecto
  async function eliminarProyecto(proyecto) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) return;

    try {
      const respuesta = await fetch(`http://localhost:3000/api/proyectos/${proyecto.id_proyecto}`, { 
        method: 'DELETE' 
      });

      if (respuesta.ok) {
        location.reload(); // Recargar para mostrar los cambios
      } else {
        alert('Error al eliminar el proyecto');
      }
    } catch (error) {
      alert('Error de conexión al eliminar el proyecto');
    }
  }

  // Buscar proyectos por nombre o descripción
  function buscarProyectos() {
    const inputBuscar = document.querySelector('.input-buscar-proyecto');
    const texto = inputBuscar.value.trim().toLowerCase();
    
    const proyectosFiltrados = proyectos.filter(proyecto =>
      proyecto.nombre.toLowerCase().includes(texto) ||
      proyecto.descripcion.toLowerCase().includes(texto)
    );

    renderizarProyectos(proyectosFiltrados);
  }

  // Configurar eventos de búsqueda
  function configurarBusqueda() {
    const inputBuscar = document.querySelector('.input-buscar-proyecto');
    const btnBuscar = document.querySelector('.btn-buscar-proyecto');

    if (btnBuscar) {
      btnBuscar.addEventListener('click', buscarProyectos);
    }

    if (inputBuscar) {
      inputBuscar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          buscarProyectos();
        }
      });
    }
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
      tareas = tareasData;

      // Mostrar los proyectos
      renderizarProyectos(proyectos);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      
      // En lugar de mostrar error, mostrar mensaje estético de "no hay proyectos"
      proyectos = [];
      tareas = [];
      
      // Mostrar proyectos vacíos
      renderizarProyectos(proyectos);
    }
  }

  // Inicializar la página
  cargarDatos();
  configurarBusqueda();
}); 