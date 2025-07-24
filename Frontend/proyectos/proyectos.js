document.addEventListener('DOMContentLoaded', function() {
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    window.location.href = '/login'; // Usar ruta absoluta
    return;
  }
  
  const API_URL = "https://fiumba-devs-backend.onrender.com/api";

  const mapaAvatares = {
    1: '/images/logo1.jpeg',
    2: '/images/logo2.jpeg',
    3: '/images/logo3.jpeg',
    4: '/images/logo4.jpeg',
  };
  const rutaAvatar = mapaAvatares[usuario.avatar];
  const logoUsuario = document.getElementById('logo-usuario');
  if (logoUsuario && rutaAvatar) {
    logoUsuario.src = rutaAvatar;
  }

  // Variables para modales y la página
  const modalColaborador = document.getElementById('modal-colaborador');
  const btnCerrarModalColaborador = document.getElementById('modal-cerrar-btn');
  const formColaborador = document.getElementById('form-colaborador');
  const modalEditar = document.getElementById('modal-editar-proyecto');
  const btnCerrarModalEditar = document.getElementById('modal-editar-cerrar-btn');
  const formEditar = document.getElementById('form-editar-proyecto');
  
  let proyectoSeleccionadoId = null;
  let proyectoEditando = null;
  let todosLosUsuarios = [];
  let proyectos = [];
  let tareas = [];
  const lista = document.querySelector('.lista-proyectos');
  const inputEmailColaborador = document.getElementById('email-colaborador');
  const mensajeModal = document.getElementById('mensaje-modal-colaborador');
  const listaColaboradoresActuales = document.querySelector('#colaboradores-actuales-lista ul');

  // --- DEFINICIÓN DE TODAS LAS FUNCIONES ---

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
        <img src="/images/agregar-colaborador.png" alt="Agregar Colaborador">
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
    tarjeta.querySelector('.btn-agregar-colaborador').addEventListener('click', () => abrirModalColaboradores(proyecto.id_proyecto));
    tarjeta.querySelector('.btn-editar').addEventListener('click', () => editarProyecto(proyecto));
    tarjeta.querySelector('.btn-eliminar').addEventListener('click', () => eliminarProyecto(proyecto));
    return tarjeta;
  }

  function renderizarProyectos(proyectosAMostrar) {
    if (!lista) return;
    lista.innerHTML = '';
    if (!proyectosAMostrar || proyectosAMostrar.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder-proyecto';
      placeholder.textContent = 'No hay proyectos por ahora';
      lista.appendChild(placeholder);
      return;
    }
    proyectosAMostrar.forEach(proyecto => {
      const tarjeta = crearTarjetaProyecto(proyecto);
      lista.appendChild(tarjeta);
    });
  }
  
  async function abrirModalColaboradores(id_proyecto) {
    proyectoSeleccionadoId = id_proyecto;
    if (mensajeModal) mensajeModal.textContent = '';
    if (inputEmailColaborador) inputEmailColaborador.value = '';
    try {
      const res = await fetch(`${API_URL}/usuarios/proyectos/${id_proyecto}`);
      if (!res.ok) throw new Error('No se pudieron cargar los colaboradores.');
      const colaboradores = await res.json();
      if (listaColaboradoresActuales) {
        listaColaboradoresActuales.innerHTML = '';
        if (colaboradores.length > 0) {
          colaboradores.forEach(c => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = `${c.nombre} ${c.apellido} (${c.mail})`;
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn-eliminar-colaborador';
            btnEliminar.textContent = '×';
            btnEliminar.title = 'Eliminar colaborador';
            btnEliminar.addEventListener('click', () => eliminarColaborador(proyectoSeleccionadoId, c.id_usuario));
            li.appendChild(span);
            li.appendChild(btnEliminar);
            listaColaboradoresActuales.appendChild(li);
          });
        } else {
          listaColaboradoresActuales.innerHTML = '<li>No hay colaboradores aún.</li>';
        }
      }
    } catch (error) {
      if (listaColaboradoresActuales) listaColaboradoresActuales.innerHTML = `<li>${error.message}</li>`;
    }
    if (modalColaborador) modalColaborador.classList.remove('modal-colaborador-oculto');
  }

  async function eliminarColaborador(id_proyecto, id_usuario) {
    if (!confirm('¿Estás seguro de que deseas eliminar a este colaborador?')) return;
    try {
      const respuesta = await fetch(`${API_URL}/colaboradores/${id_usuario}/${id_proyecto}`, { method: 'DELETE' });
      if (!respuesta.ok) throw new Error('Error al eliminar el colaborador.');
      abrirModalColaboradores(id_proyecto);
    } catch (error) {
      if (mensajeModal) mensajeModal.textContent = error.message;
    }
  }

  function cerrarModalColaborador() {
    if (modalColaborador) modalColaborador.classList.add('modal-colaborador-oculto');
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
      const res = await fetch(`${API_URL}/colaboradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: usuarioAAgregar.id_usuario, id_proyecto: proyectoSeleccionadoId }),
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

  function abrirModalEditar(proyecto) {
    proyectoEditando = proyecto;
    document.getElementById('editar-nombre').value = proyecto.nombre;
    document.getElementById('editar-descripcion').value = proyecto.descripcion;
    document.getElementById('editar-fecha-inicio').value = proyecto.fecha_inicio.split('T')[0];
    document.getElementById('editar-fecha-final').value = proyecto.fecha_final.split('T')[0];
    document.getElementById('editar-estado').value = proyecto.estado;
    if (modalEditar) modalEditar.classList.remove('modal-editar-proyecto-oculto');
  }

  function cerrarModalEditar() {
    if (modalEditar) modalEditar.classList.add('modal-editar-proyecto-oculto');
  }

  async function manejarSubmitEditar(e) {
    e.preventDefault();
    if (!proyectoEditando) return;
    const datos = {
      nombre: document.getElementById('editar-nombre').value,
      descripcion: document.getElementById('editar-descripcion').value,
      fecha_inicio: document.getElementById('editar-fecha-inicio').value,
      fecha_final: document.getElementById('editar-fecha-final').value,
      estado: document.getElementById('editar-estado').value
    };
    if (datos.fecha_final < datos.fecha_inicio) {
      alert('La fecha final no puede ser menor a la de inicio.');
      return;
    }
    try {
      const respuesta = await fetch(`${API_URL}/proyectos/${proyectoEditando.id_proyecto}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      if (!respuesta.ok) throw new Error('Error al actualizar el proyecto');
      
      if (typeof window.agregarNovedad === 'function') {
        window.agregarNovedad(`editó el proyecto "${datos.nombre}"`);
      }
      location.reload();
    } catch (error) {
      alert(error.message);
    }
  }
  
  function editarProyecto(proyecto) {
    abrirModalEditar(proyecto);
  }

  async function eliminarProyecto(proyecto) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) return;
    try {
      const respuesta = await fetch(`${API_URL}/proyectos/${proyecto.id_proyecto}`, { method: 'DELETE' });
      if (respuesta.ok) {
        if (typeof window.agregarNovedad === 'function') {
          window.agregarNovedad(`eliminó el proyecto "${proyecto.nombre}"`);
        }
        location.reload();
      } else {
        alert('Error al eliminar el proyecto');
      }
    } catch (error) {
      alert('Error de conexión al eliminar el proyecto');
    }
  }
  
  function buscarProyectos() {
    const inputBuscar = document.querySelector('.input-buscar-proyecto');
    const texto = inputBuscar.value.trim().toLowerCase();
    const proyectosFiltrados = proyectos.filter(proyecto =>
      proyecto.nombre.toLowerCase().includes(texto) ||
      (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(texto))
    );
    renderizarProyectos(proyectosFiltrados);
  }

  function configurarBusqueda() {
    const inputBuscar = document.querySelector('#busqueda-proyecto');
    if (inputBuscar) {
      inputBuscar.addEventListener('input', buscarProyectos);
    }
  }
  
  async function cargarDatos() {
    try {
      const [respuestaProyectos, respuestaTareas, respuestaUsuarios] = await Promise.all([
        fetch(`${API_URL}/proyectos/usuarios/${usuario.id_usuario}`),
        fetch(`${API_URL}/tareas`),
        fetch(`${API_URL}/usuarios`),
      ]);
      if (!respuestaProyectos.ok) throw new Error(`Error al cargar proyectos`);
      if (!respuestaTareas.ok) throw new Error(`Error al cargar tareas`);
      if (!respuestaUsuarios.ok) throw new Error(`Error al cargar usuarios`);

      proyectos = await respuestaProyectos.json();
      tareas = await respuestaTareas.json();
      todosLosUsuarios = await respuestaUsuarios.json();
      
      renderizarProyectos(proyectos);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      proyectos = [];
      tareas = [];
      renderizarProyectos(proyectos);
    }
  }
  
  // Asignar eventos a los modales
  if (modalColaborador) {
    btnCerrarModalColaborador.addEventListener('click', cerrarModalColaborador);
    formColaborador.addEventListener('submit', manejarSubmitColaborador);
  }
  if (modalEditar) {
    btnCerrarModalEditar.addEventListener('click', cerrarModalEditar);
    formEditar.addEventListener('submit', manejarSubmitEditar);
  }

  cargarDatos();
  configurarBusqueda();
});

// FUNCIÓN GLOBAL
if (typeof window.agregarNovedad !== 'function') {
  window.agregarNovedad = function(mensaje) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreUsuario = usuario?.nombre || 'Usuario';
    let novedades = JSON.parse(localStorage.getItem('novedades')) || [];
    const fecha = new Date().toLocaleString('es-AR');
    novedades.push({ usuario: nombreUsuario, mensaje, fecha });
    localStorage.setItem('novedades', JSON.stringify(novedades));
  };
}