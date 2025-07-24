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

  let proyectos = [];
  let tareas = [];

  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function actualizarFecha() {
    const fecha = new Date();
    const fechaFormateada = formatearFecha(fecha);
    document.getElementById('fecha-actual').textContent = `hoy es ${fechaFormateada}`;
  }

  function mostrarSaludo() {
    const nombreUsuario = usuario && usuario.nombre ? usuario.nombre : 'Usuario';
    document.getElementById('saludo-usuario').textContent = `Hola ${nombreUsuario},`;
  }

  function calcularDiasRestantes(fechaFinal) {
    if (!fechaFinal) return '';
    const hoy = new Date();
    const fechaFin = new Date(fechaFinal);
    fechaFin.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    const diffTime = fechaFin - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return `(vence en ${diffDays} días)`;
    if (diffDays === 1) return '(vence mañana)';
    if (diffDays === 0) return '(vence hoy)';
    return '(vencida)';
  }

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

  function mostrarMensajeTareasVacio() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-tarea';
    placeholder.textContent = 'No hay tareas pendientes.';
    return placeholder;
  }

  function renderizarTareasPendientes() {
    const listaTareas = document.getElementById('lista-tareas');
    listaTareas.innerHTML = '';
    const tareasPendientes = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en curso');
    if (tareasPendientes.length === 0) {
      listaTareas.appendChild(mostrarMensajeTareasVacio());
      return;
    }
    tareasPendientes.forEach(tarea => {
      const tarjeta = crearTarjetaTarea(tarea);
      listaTareas.appendChild(tarjeta);
    });
  }

  function crearTarjetaNovedad(novedad) {
    const novDiv = document.createElement('div');
    novDiv.className = 'novedad-dashboard';
    novDiv.innerHTML = `<span>${novedad.fecha} - <b>${novedad.usuario}</b>: ${novedad.mensaje}</span>`;
    return novDiv;
  }

  function mostrarMensajeNovedadesVacio() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-novedad';
    placeholder.textContent = 'No hay novedades.';
    return placeholder;
  }
  
  function agregarNovedad(mensaje) {
    const novedades = JSON.parse(localStorage.getItem('novedades')) || [];
    const nuevaNovedad = {
      usuario: usuario.nombre,
      mensaje: mensaje,
      fecha: new Date().toLocaleString('es-AR')
    };
    novedades.push(nuevaNovedad);
    localStorage.setItem('novedades', JSON.stringify(novedades));
  }

  function renderizarNovedades() {
    const listaNovedades = document.getElementById('lista-novedades');
    listaNovedades.innerHTML = '';
    let novedades = JSON.parse(localStorage.getItem('novedades')) || [];
    if (novedades.length === 0) {
      listaNovedades.appendChild(mostrarMensajeNovedadesVacio());
      return;
    }
    novedades.slice().reverse().forEach(novedad => {
      const tarjeta = crearTarjetaNovedad(novedad);
      listaNovedades.appendChild(tarjeta);
    });
  }

  function configurarLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = '../login/login.html';
      });
    }
  }

  async function cargarDatos() {
    try {
      const [respuestaProyectos, respuestaTareas] = await Promise.all([
        fetch(`${API_URL}/proyectos/usuarios/${usuario.id_usuario}`),
        fetch(`${API_URL}/tareas/usuarios/${usuario.id_usuario}`)
      ]);

      if (!respuestaProyectos.ok) throw new Error(`Error al cargar proyectos`);
      if (!respuestaTareas.ok) throw new Error(`Error al cargar tareas`);

      const proyectosData = await respuestaProyectos.json();
      const tareasData = await respuestaTareas.json();
      
      proyectos = proyectosData;
      tareas = tareasData.filter(t => proyectos.some(p => p.id_proyecto === t.id_proyecto));

      renderizarTareasPendientes();
      renderizarNovedades();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      renderizarTareasPendientes();
      renderizarNovedades();
    }
  }

  window.agregarNovedad = agregarNovedad;
  
  function inicializar() {
    actualizarFecha();
    mostrarSaludo();
    setInterval(actualizarFecha, 60000);
    configurarLogout();
    cargarDatos();
  }

  inicializar();
});