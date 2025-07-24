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

  // Modal editar proyecto
  const modalEditarProyecto = document.getElementById('modal-editar-proyecto');
  const formEditarProyecto = document.getElementById('form-editar-proyecto');
  const btnCerrarModalEditarProyecto = document.getElementById('modal-editar-cerrar-btn');
  const mensajeModalEditar = document.getElementById('mensaje-modal-editar');
  let proyectoEditando = null;
  let tareas = [];
  const lista = document.querySelector('.lista-proyectos');
  const inputBuscarProyecto = document.querySelector('.input-buscar-proyecto');
  let proyectosFiltrados = [];

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
        <img src="../images/agregarPersona.png" alt="Agregar colaborador" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
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
          // Botón eliminar colaborador
          const btnEliminarColaborador = document.createElement('button');
          btnEliminarColaborador.textContent = 'Eliminar';
          btnEliminarColaborador.className = 'btn-eliminar-colaborador';
          btnEliminarColaborador.onclick = async () => {
            if (confirm(`¿Eliminar a ${c.nombre} ${c.apellido} de este proyecto?`)) {
              try {
                const res = await fetch(`http://localhost:3000/api/colaboradores/${c.id_usuario}/${id_proyecto}`, {
                  method: 'DELETE'
                });
                if (!res.ok) throw new Error('No se pudo eliminar el colaborador');
                li.remove();
                mensajeModal.textContent = 'Colaborador eliminado correctamente.';
              } catch (err) {
                mensajeModal.textContent = 'Error al eliminar colaborador.';
              }
            }
          };
          li.appendChild(btnEliminarColaborador);
          listaColaboradoresActuales.appendChild(li);
        });
      } else {
        listaColaboradoresActuales.innerHTML = '<li>No hay colaboradores aún.</li>';
      }
    } catch (error) {
      listaColaboradoresActuales.innerHTML = `<li>${error.message}</li>`;
    }
    modal.classList.remove('modal-colaborador-oculto');
    modal.style.display = 'flex';
  }

  function cerrarModal() {
    modal.classList.add('modal-colaborador-oculto');
    modal.style.display = 'none';
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

  // Filtrado en tiempo real
  if (inputBuscarProyecto) {
    inputBuscarProyecto.addEventListener('input', function() {
      const texto = inputBuscarProyecto.value.trim().toLowerCase();
      if (texto === '') {
        renderizarProyectos(proyectos);
      } else {
        proyectosFiltrados = proyectos.filter(p =>
          p.nombre.toLowerCase().includes(texto) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(texto))
        );
        renderizarProyectos(proyectosFiltrados);
      }
    });
  }
  }

  function abrirModalEditarProyecto(proyecto) {
    proyectoEditando = proyecto;
    document.getElementById('editar-nombre').value = proyecto.nombre || '';
    document.getElementById('editar-descripcion').value = proyecto.descripcion || '';
    document.getElementById('editar-fecha-inicio').value = proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '';
    document.getElementById('editar-fecha-final').value = proyecto.fecha_final ? proyecto.fecha_final.split('T')[0] : '';
    document.getElementById('editar-estado').value = proyecto.estado || 'pendiente';
    mensajeModalEditar.textContent = '';
    modalEditarProyecto.classList.remove('modal-editar-proyecto-oculto');
    modalEditarProyecto.style.display = 'flex';
  }

  btnCerrarModalEditarProyecto.addEventListener('click', () => {
    modalEditarProyecto.classList.add('modal-editar-proyecto-oculto');
    modalEditarProyecto.style.display = 'none';
    proyectoEditando = null;
  });

  formEditarProyecto.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!proyectoEditando) return;
    const datos = {
      nombre: document.getElementById('editar-nombre').value,
      descripcion: document.getElementById('editar-descripcion').value,
      fecha_inicio: document.getElementById('editar-fecha-inicio').value,
      fecha_final: document.getElementById('editar-fecha-final').value,
      estado: document.getElementById('editar-estado').value
    };
    try {
      const res = await fetch(`http://localhost:3000/api/proyectos/${proyectoEditando.id_proyecto}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)

      });
      if (!res.ok) throw new Error('No se pudo editar el proyecto');
      agregarNovedad(`Modificaste el proyecto ${proyectoEditando.nombre}`);
      mensajeModalEditar.textContent = 'Proyecto editado correctamente.';
      setTimeout(() => {
        modalEditarProyecto.classList.add('modal-editar-proyecto-oculto');
        modalEditarProyecto.style.display = 'none';
        proyectoEditando = null;
        location.reload();
      }, 800);
    } catch (err) {
      mensajeModalEditar.textContent = 'Error al editar el proyecto.';
    }
  });

  // Reemplazar la función de editar por el modal
  function editarProyecto(proyecto) {
    abrirModalEditarProyecto(proyecto);
  }

  async function eliminarProyecto(proyecto) {
    if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/proyectos/${proyecto.id_proyecto}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar el proyecto');
      await cargarDatos();
    } catch (error) {
      alert('No se pudo eliminar el proyecto: ' + error.message);
    }
  }

  async function cargarDatos() {
    try {
      const [respuestaProyectos, respuestaUsuarios] = await Promise.all([
        fetch(`http://localhost:3000/api/proyectos/usuarios/${usuario.id_usuario}`),
        fetch('http://localhost:3000/api/usuarios'),
      ]);
      if (!respuestaProyectos.ok) throw new Error(`Error al cargar proyectos: ${respuestaProyectos.status}`);
      if (!respuestaUsuarios.ok) throw new Error(`Error al cargar usuarios: ${respuestaUsuarios.status}`);
      const proyectosData = await respuestaProyectos.json();
      todosLosUsuarios = await respuestaUsuarios.json();
      proyectos = proyectosData.filter(p => p.id_usuario === usuario.id_usuario);
      renderizarProyectos(proyectos);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      proyectos = [];
      renderizarProyectos(proyectos);
    }
  }

  if(modal) {
    btnCerrarModal.addEventListener('click', cerrarModal);
    formColaborador.addEventListener('submit', manejarSubmitColaborador);
  }

  cargarDatos();
  //configurarBusqueda();

});