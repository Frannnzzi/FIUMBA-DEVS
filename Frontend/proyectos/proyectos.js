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

  const modal = document.getElementById('modal-colaborador');
  const btnCerrarModal = document.getElementById('modal-cerrar-btn');
  const formColaborador = document.getElementById('form-colaborador');
  const inputEmailColaborador = document.getElementById('email-colaborador');
  const mensajeModal = document.getElementById('mensaje-modal-colaborador');
  const listaColaboradoresActuales = document.querySelector('#colaboradores-actuales-lista ul');
  let proyectoSeleccionadoId = null;
  let todosLosUsuarios = [];
  let proyectos = [];
  let tareas = [];
  const lista = document.querySelector('.lista-proyectos');

  function formatearFecha(fecha) {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function calcularProgreso(proyecto) {
    const tareasProyecto = tareas.filter(t => t.id_proyecto === proyecto.id_proyecto);
    if (tareasProyecto.length === 0) return 0;
    const finalizadas = tareasProyecto.filter(t => t.estado === 'finalizada' || t.estado === 'terminado').length;
    return Math.round((finalizadas / tareasProyecto.length) * 100);
  }
  
  function crearTarjetaProyecto(proyecto) {
    const porcentaje = calcularProgreso(proyecto);
    const fechaInicio = formatearFecha(proyecto.fecha_inicio);
    const fechaFinal = formatearFecha(proyecto.fecha_final);

    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-proyecto';
    tarjeta.innerHTML = `
      <button class="btn-agregar-colaborador" title="Agregar colaborador">
        <svg fill="#000000" height="20px" width="20px" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
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

    tarjeta.querySelector('.btn-agregar-colaborador').addEventListener('click', () => {
      abrirModalColaboradores(proyecto.id_proyecto);
    });

    const btnEditar = tarjeta.querySelector('.btn-editar');
    const btnEliminar = tarjeta.querySelector('.btn-eliminar');
    btnEditar.addEventListener('click', () => editarProyecto(proyecto));
    btnEliminar.addEventListener('click', () => eliminarProyecto(proyecto));
    return tarjeta;
  }
  
  async function abrirModalColaboradores(id_proyecto) {
    proyectoSeleccionadoId = id_proyecto;
    mensajeModal.textContent = '';
    inputEmailColaborador.value = '';
    
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/proyectos/${id_proyecto}`);
      if (!res.ok) throw new Error('No se pudieron cargar los colaboradores.');
      const colaboradores = await res.json();
      listaColaboradoresActuales.innerHTML = '';
      if (colaboradores.length > 0) {
        colaboradores.forEach(c => {
          const li = document.createElement('li');
          li.textContent = `${c.nombre} ${c.apellido} (${c.mail})`;
          listaColaboradoresActuales.appendChild(li);
        });
      } else {
        listaColaboradoresActuales.innerHTML = '<li>No hay colaboradores aún.</li>';
      }
    } catch (error) {
      listaColaboradoresActuales.innerHTML = `<li>${error.message}</li>`;
    }
    modal.classList.remove('modal-colaborador-oculto');
  }

  function cerrarModal() {
    modal.classList.add('modal-colaborador-oculto');
  }

  async function manejarSubmitColaborador(e) {
    e.preventDefault();
    const mail = inputEmailColaborador.value.trim().toLowerCase();
    if (!mail) return;
    const usuarioAAgregar = todosLosUsuarios.find(u => u.mail && u.mail.toLowerCase() === mail);
    if (!usuarioAAgregar) {
      mensajeModal.textContent = 'No se encontró ningún usuario con ese correo.';
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: usuarioAAgregar.id_usuario,
          id_proyecto: proyectoSeleccionadoId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al agregar colaborador.');
      }
      mensajeModal.textContent = '¡Colaborador agregado con éxito!';
      inputEmailColaborador.value = '';
      setTimeout(() => abrirModalColaboradores(proyectoSeleccionadoId), 500);
    } catch (error) {
      mensajeModal.textContent = error.message;
    }
  }

  function mostrarMensajeVacio(mensaje) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder-proyecto';
    placeholder.textContent = mensaje;
    return placeholder;
  }

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

  async function editarProyecto(proyecto) { /* ...tu código de editar ... */ }
  async function eliminarProyecto(proyecto) { /* ...tu código de eliminar ... */ }
  function buscarProyectos() { /* ...tu código de buscar ... */ }
  function configurarBusqueda() { /* ...tu código de configurar búsqueda ... */ }

  async function cargarDatos() {
    try {
      const [respuestaProyectos, respuestaTareas, respuestaUsuarios] = await Promise.all([
        fetch('http://localhost:3000/api/proyectos'),
        fetch('http://localhost:3000/api/tareas'),
        fetch('http://localhost:3000/api/usuarios'),
      ]);
      if (!respuestaProyectos.ok) throw new Error(`Error al cargar proyectos: ${respuestaProyectos.status}`);
      if (!respuestaTareas.ok) throw new Error(`Error al cargar tareas: ${respuestaTareas.status}`);
      if (!respuestaUsuarios.ok) throw new Error(`Error al cargar usuarios: ${respuestaUsuarios.status}`);
      const proyectosData = await respuestaProyectos.json();
      const tareasData = await respuestaTareas.json();
      todosLosUsuarios = await respuestaUsuarios.json();
      proyectos = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);
      tareas = tareasData;
      renderizarProyectos(proyectos);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      proyectos = [];
      tareas = [];
      renderizarProyectos(proyectos);
    }
  }
  
  if(modal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
    formColaborador.addEventListener('submit', manejarSubmitColaborador);
  }

  cargarDatos();
  configurarBusqueda();
});