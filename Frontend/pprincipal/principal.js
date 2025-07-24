const API_URL='https://fiumba-devs-backend.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && usuario && usuario.avatar) {
    logoUsuario.src = `../images/logo${usuario.avatar}.jpeg`;
  }

  // Si el usuario no esta logueado, mandarlo al login.
  if (!usuario) {
    window.location.href = '../login/login.html';
    return;
  }

  // Variables globales para usar en toda la página
  let proyectos = [];
  let tareas = [];

  // Función para formatear fechas en formato arg
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

// Función para agregar una novedad al localStorage
function agregarNovedad(mensaje) {
  const novedades = JSON.parse(localStorage.getItem('novedades')) || [];
  const nuevaNovedad = {
    usuario: usuario.nombre,
    mensaje: mensaje,
    fecha: formatearFecha(new Date())
  };

  novedades.push(nuevaNovedad); // 👈 esto iba afuera por error
  localStorage.setItem('novedades', JSON.stringify(novedades));
}


  // Novedades
  function renderizarNovedades() {
  const listaNovedades = document.getElementById('lista-novedades');
  listaNovedades.innerHTML = '';

  let novedades = JSON.parse(localStorage.getItem('novedades')) || [];

  // Filtrar solo las novedades hechas por el usuario logueado
  novedades = novedades.filter(nov => nov.usuario === usuario.nombre);

  if (novedades.length === 0) {
    listaNovedades.appendChild(mostrarMensajeNovedadesVacio());
    return;
  }

  novedades.slice().reverse().forEach(novedad => {
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
      // Traer proyectos y tareas
      const [respuestaProyectos, respuestaTareas] = await Promise.all([
        fetch(`http://localhost:3000/api/proyectos/usuarios/${usuario.id_usuario}`),
        fetch(`http://localhost:3000/api/tareas/usuarios/${usuario.id_usuario}`)
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

      // Filtrar solo los proyectos del usuario logueado (dueño)
      let proyectosUsuario = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);

      //agregar proyectos colaborativos
      try {
        const colaborativosRes = await fetch(`http://localhost:3000/api/proyectos/usuarios/${usuario.id_usuario}`);
        if (colaborativosRes.ok) {
          const colaborativos = await colaborativosRes.json();
          const ids = new Set();
          proyectosUsuario = [...proyectosUsuario, ...colaborativos].filter(p => {
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

      proyectos = proyectosUsuario;
      // Filtrar tareas pendientes relacionadas a los proyectos del usuario
      tareas = tareasData.filter(t => proyectos.some(p => p.id_proyecto === t.id_proyecto) && (t.estado === 'pendiente' || t.estado === 'en curso'));

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

  window.agregarNovedad = agregarNovedad;
  
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

  // Iniciar la aplicación
  inicializar();
});
