// Página principal - Dashboard con resumen de tareas y novedades
document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && usuario && usuario.avatar) {
    logoUsuario.src = `../images/logo${usuario.avatar}.jpeg`;
  }

  // Verificar que el usuario esté logueado, si no, ir al login
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }
  // El avatar del usuario se configura automáticamente con el script común user-avatar.js

  // Variables globales para usar en toda la página
  let proyectos = [];
  let tareas = [];

  // Función para formatear fechas en formato argentino
  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  // Actualizar la fecha actual cada minuto
  function actualizarFecha() {
    const fecha = new Date();
    const fechaFormateada = formatearFecha(fecha);
    document.getElementById('fecha-actual').textContent = `hoy es ${fechaFormateada}`;
  }

  // Mostrar saludo personalizado con el nombre del usuario
  function mostrarSaludo() {
    const nombreUsuario = usuario && usuario.nombre ? usuario.nombre : 'Usuario';
    document.getElementById('saludo-usuario').textContent = `Hola ${nombreUsuario},`;
  }

  // Calcular días restantes hasta la fecha final
  function calcularDiasRestantes(fechaFinal) {
    if (!fechaFinal) return '';
    
    const hoy = new Date();
    const fechaFin = new Date(fechaFinal);
    
    // Resetear horas para comparar solo fechas
    fechaFin.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    const diffTime = fechaFin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      return `(vence en ${diffDays} días)`;
    } else if (diffDays === 1) {
      return '(vence mañana)';
    } else if (diffDays === 0) {
      return '(vence hoy)';
    } else {
      return '(vencida)';
    }
  }

  // Crear una tarjeta de tarea para el dashboard
  function crearTarjetaTarea(tarea) {
    const tareaDiv = document.createElement('div');
    tareaDiv.className = 'tarea-dashboard';
    
    const diasRestantes = calcularDiasRestantes(tarea.fecha_final);
    
    tareaDiv.innerHTML = `
      <b>${tarea.titulo}</b><br>
      <span>${tarea.descripcion}</span><br>
      <span>Estado: ${tarea.estado} <span style='color:#f7c873;font-weight:bold;'>${diasRestantes}</span></span>
    `;
    
    return tareaDiv;
  }

  // Mostrar mensaje cuando no hay tareas
  function mostrarMensajeTareasVacio() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-tarea';
    placeholder.textContent = 'No hay tareas pendientes.';
    return placeholder;
  }

  // Renderizar la lista de tareas pendientes
  function renderizarTareasPendientes() {
    const listaTareas = document.getElementById('lista-tareas');
    listaTareas.innerHTML = '';

    // Filtrar tareas pendientes (pendiente y en curso)
    const tareasPendientes = tareas.filter(t => 
      t.estado === 'pendiente' || t.estado === 'en curso'
    );

    if (tareasPendientes.length === 0) {
      listaTareas.appendChild(mostrarMensajeTareasVacio());
      return;
    }

    tareasPendientes.forEach(tarea => {
      const tarjeta = crearTarjetaTarea(tarea);
      listaTareas.appendChild(tarjeta);
    });
  }

  // Crear una tarjeta de novedad para el dashboard
  function crearTarjetaNovedad(novedad) {
    const novDiv = document.createElement('div');
    novDiv.className = 'novedad-dashboard';
    novDiv.innerHTML = `<span>${novedad.fecha} - <b>${novedad.usuario}</b>: ${novedad.mensaje}</span>`;
    return novDiv;
  }

  // Mostrar mensaje cuando no hay novedades
  function mostrarMensajeNovedadesVacio() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-novedad';
    placeholder.textContent = 'No hay novedades.';
    return placeholder;
  }

  // Renderizar la lista de novedades
  function renderizarNovedades() {
    const listaNovedades = document.getElementById('lista-novedades');
    listaNovedades.innerHTML = '';

    // Obtener novedades del localStorage
    let novedades = JSON.parse(localStorage.getItem('novedades')) || [];
    
    // Mostrar todas las novedades, sin filtrar
    const novedadesFiltradas = novedades;

    if (novedadesFiltradas.length === 0) {
      listaNovedades.appendChild(mostrarMensajeNovedadesVacio());
      return;
    }

    // Mostrar las novedades más recientes primero
    novedadesFiltradas.slice().reverse().forEach(novedad => {
      const tarjeta = crearTarjetaNovedad(novedad);
      listaNovedades.appendChild(tarjeta);
    });
  }

  // Configurar el botón de logout
  function configurarLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('usuario');
        window.location.href = '../login/login.html';
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
      tareas = tareasData.filter(t => 
        proyectos.some(p => p.id_proyecto === t.id_proyecto)
      );

      // Renderizar las secciones
      renderizarTareasPendientes();
      renderizarNovedades();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      
      // En lugar de mostrar error, mostrar mensajes estéticos de "no hay datos"
      proyectos = [];
      tareas = [];
      
      // Renderizar las secciones con datos vacíos
      renderizarTareasPendientes();
      renderizarNovedades();
    }
  }

  // Inicializar la página
  function inicializar() {
    // Configurar fecha y saludo
    actualizarFecha();
    mostrarSaludo();
    
    // Actualizar fecha cada minuto
    setInterval(actualizarFecha, 60000);
    
    // Configurar eventos
    configurarLogout();
    
    // Cargar datos
    cargarDatos();
  }

  // Función global para agregar novedades (usada en otras páginas)
  window.agregarNovedad = function(mensaje) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreUsuario = usuario?.nombre || 'Usuario';
    let novedades = JSON.parse(localStorage.getItem('novedades')) || [];
    const fecha = new Date().toLocaleString('es-AR');
    
    novedades.push({ 
      usuario: nombreUsuario, 
      mensaje, 
      fecha 
    });
    
    localStorage.setItem('novedades', JSON.stringify(novedades));
    console.log('Novedad guardada:', mensaje, novedades);
  };
  console.log('Función agregarNovedad cargada');

  // Iniciar la aplicación
  inicializar() 
})
