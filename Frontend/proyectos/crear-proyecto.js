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

  const form = document.getElementById('form-crear-proyecto');

  // Colaboradores
  const inputColaborador = document.getElementById('input-colaborador');
  const btnAgregarColaborador = document.getElementById('btn-agregar-colaborador');
  const listaColaboradores = document.getElementById('lista-colaboradores');
  let colaboradores = [];

  btnAgregarColaborador.addEventListener('click', function() {
    const email = inputColaborador.value.trim();
    if (email && !colaboradores.includes(email)) {
      colaboradores.push(email);
      renderColaboradores();
      inputColaborador.value = '';
    }
  });

  function renderColaboradores() {
    listaColaboradores.innerHTML = '';
    colaboradores.forEach((email, idx) => {
      const li = document.createElement('li');
      li.className = 'colaborador-item';
      li.textContent = email;
      const btnQuitar = document.createElement('button');
      btnQuitar.textContent = '✕';
      btnQuitar.className = 'btn-eliminar-colaborador';
      btnQuitar.onclick = function() {
        colaboradores.splice(idx, 1);
        renderColaboradores();
      };
      li.appendChild(btnQuitar);
      listaColaboradores.appendChild(li);
    });
  }

  function obtenerDatosFormulario(form) {
    const campos = form.querySelectorAll('.input-form-proyecto');
    return {
      nombre: campos[0].value,
      descripcion: campos[1].value,
      fecha_inicio: campos[2].value,
      fecha_final: campos[3].value,
      estado: campos[4].value
    };
  }

  async function crearProyecto(datos, idUsuario) {
    const respuesta = await fetch('http://localhost:3000/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...datos,
        id_usuario: idUsuario
      })
    });
    if (!respuesta.ok) {
      throw new Error('Error al crear el proyecto');
    }
    return await respuesta.json();
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
      const datos = obtenerDatosFormulario(form);
      if (datos.fecha_final < datos.fecha_inicio) {
        alert('La fecha final no puede ser menor a la fecha de inicio.');
        return;
      }
      
      // Enviar colaboradores uno por uno, verificando existencia
      const proyectoCreado = await crearProyecto(datos, usuario.id_usuario);
      let erroresColaboradores = [];
      for (const email of colaboradores) {
        const resp = await fetch('http://localhost:3000/api/colaboradores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, id_proyecto: proyectoCreado.id_proyecto })
        });
        if (!resp.ok) {
          const err = await resp.json();
          erroresColaboradores.push(email + ': ' + (err.error || 'Error desconocido'));
        }
      }
      if (erroresColaboradores.length > 0) {
        alert('Algunos colaboradores no se agregaron:\n' + erroresColaboradores.join('\n'));
      }
      window.location.href = '../proyectos/proyectos.html';
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      alert(error.message);
    }
  });
});