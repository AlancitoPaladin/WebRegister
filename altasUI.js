class altasUI {
  constructor(reset = false) {
    if(reset == true) {
      this.form = document.querySelector("#formAltas")
      this.nombre = document.querySelector("#nombre")
      this.pApellido = document.querySelector("#pApellido")
      this.sApellido = document.querySelector("#sApellido")
      this.nacimiento = document.querySelector("#nacimiento")
      this.genero = document.querySelector("#genero")
      this.login = document.querySelector("#login")
      this.pwd = document.querySelector("#pwd")
      this.fotoBase64 = document.querySelector("#fotoBase64")
      this.cancelar = document.querySelector("#cancelar")
      this.volver = document.querySelector("#volver")
      this.fijarEventos()
    }
  }

  fijarEventos() {
    this.form.addEventListener("submit", this.form_submit.bind(this))
    this.cancelar.addEventListener("click", this.cancelar_click.bind(this))
    this.volver.addEventListener("click", this.volver_click.bind(this))
  }

  form_submit(e) {
    e.preventDefault()
    

    if(!this.fotoBase64.value) {
      this.mensaje('Por favor, toma una fotografía antes de guardar')
      return
    }
    
    self.enviar_click()
  }

  cancelar_click(e) {
    this.form.reset()
    // Resetear también la cámara
    if(typeof camera !== 'undefined') {
      camera.reset()
    }
  }

  volver_click(e) {
    if(typeof camera !== 'undefined') {
      camera.stopCamera()
    }
    window.location.href = "index.html"
  }

  recuperar(...args) {
    let datos = {}
    for (const arg of args) {
      if(this.hasOwnProperty(arg)) datos[arg] = UI[arg].value
    }
    
    if(this.fotoBase64 && this.fotoBase64.value) {
      datos.foto = this.fotoBase64.value
    }
    
    return datos
  }

  mensaje(texto) {
    alert(texto)
  }

  mostrarMensaje(texto, tipo = 'info') {
    let alertDiv = document.getElementById('alertAltas')
    if(!alertDiv) {
      alertDiv = document.createElement('div')
      alertDiv.id = 'alertAltas'
      alertDiv.className = 'alert'
      this.form.insertBefore(alertDiv, this.form.firstChild)
    }

    alertDiv.textContent = texto
    alertDiv.className = `alert show alert-${tipo}`

    setTimeout(() => {
      alertDiv.classList.remove('show')
    }, 5000)
  }

  //
  // Resultados
  //
  enviar_click_resultado(r) {
    console.log("=== RESPUESTA RECIBIDA ===")
    console.log("Respuesta cruda:", r)
    
    try {
      r = JSON.parse(r)
      console.log("Respuesta parseada:", r)
      console.log("Data completa:", r.data)

      // Verificar si hay data y resultado
      if(r.data && r.data.length > 0) {
        const primerRegistro = r.data[0]
        console.log("Primer registro:", primerRegistro)
        
        const codigo = parseInt(primerRegistro.resultado)
        const ok = primerRegistro.ok !== undefined ? parseInt(primerRegistro.ok) : null
        
        console.log("Código resultado:", codigo)
        console.log("OK:", ok)

        if(codigo === 9 || codigo === 400) {
          console.log("Login ya existe")
          UI.mensaje('El login/CURP ya existe en el sistema')
          return
        }

        if(codigo === 100) {
          console.log("✓ Alta exitosa")
          UI.mensaje('Usuario creado exitosamente')
          UI.form.reset()
          
          if(typeof camera !== 'undefined') {
            camera.reset()
          }
          
          setTimeout(() => {
            window.location.href = "index.html"
          }, 2000)
          return
        }

        if(codigo === 101) {
          console.log("✗ Alta fallida")
          UI.mensaje('Error al crear el usuario. Verifique los datos')
          return
        }

        if(ok === 0) {
          console.log("✗ Error con ok=0")
          const mensaje = self.obtenerMensajeError(codigo)
          UI.mensaje(mensaje)
          return
        }

        if(ok === 2) {
          console.log("✓ Alta correcta")
          UI.mensaje('Usuario creado correctamente')
          return
        }

        console.log("Código desconocido:", codigo)
        const mensaje = self.obtenerMensajeError(codigo)
        UI.mensaje(mensaje)

      } 
      
      else if(r.ok !== undefined) {
        if(r.ok === 1 || r.ok === "1") {
          console.log("✅ Operación exitosa (sin código)")
          UI.mensaje('Usuario creado exitosamente')
          UI.form.reset()
          
          // Limpiar la cámara
          if(typeof camera !== 'undefined') {
            camera.reset()
          }
          
          setTimeout(() => {
            window.location.href = "index.html"
          }, 2000)
        } else {
          console.log("✗ Operación fallida")
          UI.mensaje('Error al crear el usuario')
        }
      }
      // Respuesta inesperada
      else {
        console.log("✗ Respuesta sin estructura reconocida")
        UI.mensaje('Respuesta inesperada del servidor')
      }

    } catch(e) {
      console.error("Error parseando JSON:", e)
      console.error("Respuesta que causó el error:", r)
      UI.mensaje('Error en los datos recibidos del servidor')
    }
  }
}