// Gestores de eventos y callbacks para la pantalla "Cambios"
class cambiosUI {
  constructor(reset = false) {
    if (reset === true) {
      // Referencias DOM
      this.form = document.querySelector("#formCambios");
      this.cambioID = document.querySelector("#cambioID");
      this.cambioNombre = document.querySelector("#cambioNombre");
      this.cambioPApellido = document.querySelector("#cambioPApellido");
      this.cambioSApellido = document.querySelector("#cambioSApellido");
      this.cambioNacimiento = document.querySelector("#cambioNacimiento");
      this.cambioGenero = document.querySelector("#cambioGenero");
      this.cambioLogin = document.querySelector("#cambioLogin");
      this.cambioPwd = document.querySelector("#cambioPwd");

      // Elementos de cámara y previsualización
      this.cambioFoto = document.querySelector("#cambioFoto");
      this.btnTomarFoto = document.querySelector("#btnTomarFoto");
      this.btnCapturar = document.querySelector("#btnCapturar");
      this.btnCancelarCamara = document.querySelector("#btnCancelarCamara");
      this.video = document.querySelector("#video");
      this.canvas = document.querySelector("#canvas");
      this.imgPreview = document.querySelector("#imgPreview");
      this.fotoPreviewContainer = document.querySelector("#fotoPreviewContainer");

      // Botones generales
      this.btnBuscar = document.querySelector("#btnBuscar");
      this.cancelar = document.querySelector("#cancelar");
      this.volver = document.querySelector("#volver");

      // Estado
      this.fotoBase64Actual = ''; // Guardar foto actual
      this.stream = null; // Stream de la cámara

      this.fijarEventos();
      window.addEventListener('beforeunload', () => { this.detenerCamara(); });
    }
  }

  fijarEventos() {
    if (this.form) this.form.addEventListener("submit", this.form_submit.bind(this));
    if (this.btnBuscar) this.btnBuscar.addEventListener("click", this.btnBuscar_click.bind(this));
    if (this.cambioFoto) this.cambioFoto.addEventListener("change", this.cambioFoto_change.bind(this));
    if (this.cancelar) this.cancelar.addEventListener("click", this.cancelar_click.bind(this));
    if (this.volver) this.volver.addEventListener("click", this.volver_click.bind(this));
    if (this.btnTomarFoto) this.btnTomarFoto.addEventListener("click", () => this.iniciarCamara());
    if (this.btnCapturar) this.btnCapturar.addEventListener("click", () => this.capturarFoto());
    if (this.btnCancelarCamara) this.btnCancelarCamara.addEventListener("click", () => this.cancelarCamara());
  }

  form_submit(e) {
    e.preventDefault();
    const control = window.self?.enviar_click || window.CONTROLADOR?.enviar_click || window.CONTROL?.enviar_click;
    if (typeof control === 'function') control();
    else this.mensaje('Error interno: controlador no disponible');
  }

  btnBuscar_click() {
    const buscar = window.self?.buscar_usuario || window.CONTROLADOR?.buscar_usuario || window.CONTROL?.buscar_usuario;
    if (typeof buscar === 'function') buscar();
    else this.mensaje('Error interno: controlador no disponible');
  }

  cambioFoto_change(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.mensaje('Por favor seleccione un archivo de imagen válido');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.mensaje('La imagen no debe superar 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.fotoBase64Actual = event.target.result;
      this.mostrarFoto(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  async iniciarCamara() {
    if (!this.video || !this.canvas) {
      this.mensaje('Funcionalidad de cámara no disponible en esta vista');
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      this.video.srcObject = this.stream;
      this.video.style.display = 'block';
      await this.video.play();

      this.btnTomarFoto.style.display = 'none';
      this.btnCapturar.style.display = 'inline-block';
      this.btnCancelarCamara.style.display = 'inline-block';
      if (this.fotoPreviewContainer) this.fotoPreviewContainer.style.display = 'none';
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      this.mensaje('No se pudo acceder a la cámara. Verifica permisos del navegador.');
    }
  }

  capturarFoto() {
    if (!this.video || !this.canvas) {
      this.mensaje('Cámara no disponible');
      return;
    }
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    const fotoBase64 = this.canvas.toDataURL('image/jpeg', 0.8);
    this.fotoBase64Actual = fotoBase64;
    this.mostrarFoto(fotoBase64);
    this.detenerCamara();
  }

  detenerCamara() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.video) this.video.style.display = 'none';
    if (this.btnTomarFoto) this.btnTomarFoto.style.display = 'inline-block';
    if (this.btnCapturar) this.btnCapturar.style.display = 'none';
    if (this.btnCancelarCamara) this.btnCancelarCamara.style.display = 'none';
  }

  cancelarCamara() {
    this.detenerCamara();
    if (this.fotoBase64Actual) this.mostrarFoto(this.fotoBase64Actual);
    else this.ocultarFoto();
  }

  cancelar_click() {
    if (this.form) this.form.reset();
    this.detenerCamara();
    this.ocultarFoto();
  }

  volver_click() {
    this.detenerCamara();
    window.location.href = "index.html";
  }

  recuperar(...args) {
    const datos = {};
    for (const arg of args) {
      if (arg === 'cambioFoto')
        datos[arg] = this.fotoBase64Actual?.startsWith('data:') ? this.fotoBase64Actual : null;
      else if (this[arg]?.value !== undefined)
        datos[arg] = this[arg].value;
      else datos[arg] = null;
    }
    return datos;
  }

  buscar_usuario_resultado(r) {
    try {
      if (typeof r === 'string') r = JSON.parse(r);
      if (r.ok === 1 && r.data?.length) {
        const usuario = r.data[0];
        this.cambioNombre.value = usuario.nombre || '';
        this.cambioPApellido.value = usuario.papellido || '';
        this.cambioSApellido.value = usuario.sapellido || '';
        this.cambioNacimiento.value = usuario.nacimiento || '';
        this.cambioGenero.value = usuario.genero || '';
        this.cambioLogin.value = usuario.login || '';

        if (usuario.foto) {
          const foto = usuario.foto.startsWith('data:') ? usuario.foto : `data:image/jpeg;base64,${usuario.foto}`;
          this.fotoBase64Actual = foto;
          this.mostrarFoto(foto);
        } else this.ocultarFoto();

        this.mostrarMensaje('Usuario encontrado. Modifique los campos necesarios', 'success');
      } else {
        this.mostrarMensaje('No se encontró ningún usuario con ese ID', 'error');
        this.limpiarCampos();
      }
    } catch (e) {
      console.error("Error procesando respuesta de búsqueda:", e);
      this.mostrarMensaje("Error al buscar usuario: " + e.message, 'error');
    }
  }
  
enviar_click_resultado(r) {
    try {
        // Intentar parsear la respuesta
        r = JSON.parse(r);
        console.log("Respuesta del servidor:", r);

        // Si la respuesta es exitosa (ok === 1)
        if (r.ok === 1) {
            this.mostrarMensaje('Usuario modificado exitosamente', 'success');
            if (this.form) this.form.reset();
            setTimeout(() => { window.location.href = "index.html"; }, 2000);
            return;
        }
        
        // Si hay un error específico
        if (r.error) {
            this.mostrarMensaje(r.mensaje || r.error, 'error');
            return;
        }

        // Si no hay indicación clara de éxito o error
        this.mostrarMensaje('Error al modificar el usuario', 'error');
        
    } catch (e) {
        console.error("Error parseando JSON:", e);
        this.mostrarMensaje('Error en la respuesta del servidor', 'error');
    }
}


  limpiarCampos() {
    ["cambioNombre","cambioPApellido","cambioSApellido","cambioNacimiento","cambioGenero","cambioLogin","cambioPwd"].forEach(id => {
      if (this[id]) this[id].value = '';
    });
    if (this.cambioFoto) this.cambioFoto.value = '';
    this.fotoBase64Actual = '';
    this.ocultarFoto();
  }

  mostrarFoto(fotoBase64) {
    if (this.imgPreview && this.fotoPreviewContainer) {
      this.imgPreview.src = fotoBase64.startsWith('data:') ? fotoBase64 : `data:image/jpeg;base64,${fotoBase64}`;
      this.fotoPreviewContainer.style.display = 'block';
    }
  }

  ocultarFoto() {
    if (this.fotoPreviewContainer) this.fotoPreviewContainer.style.display = 'none';
    if (this.imgPreview) this.imgPreview.src = '';
  }

  mensaje(texto) {
    alert(texto);
  }

  mostrarMensaje(texto, tipo = 'info') {
    let alertDiv = document.getElementById('alertCambios');
    if (!alertDiv && this.form) {
      alertDiv = document.createElement('div');
      alertDiv.id = 'alertCambios';
      alertDiv.className = 'alert';
      this.form.insertBefore(alertDiv, this.form.firstChild);
    }
    if (!alertDiv) return this.mensaje(texto);
    alertDiv.textContent = texto;
    alertDiv.className = `alert show alert-${tipo}`;
    setTimeout(() => alertDiv.classList.remove('show'), 5000);
  }
}
