class Ajax {
	constructor(listener) {
		this.listener = listener
	}

	post(datos, funcion) {
		let xhttp = new XMLHttpRequest()
		
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				funcion(this.responseText)
			}
			else if (this.readyState == 4 && this.status != 200) {
				console.error("Error en la petición:", this.status, this.statusText)
				funcion(JSON.stringify({
					ok: 0,
					error: "Error en la petición",
					status: this.status,
					mensaje: this.statusText
				}))
			}
		}
		
		xhttp.onerror = function() {
			console.error("Error de red")
			funcion(JSON.stringify({
				ok: 0,
				error: "Error de red",
				mensaje: "No se pudo conectar con el servidor"
			}))
		}
		
		try {
			// VALIDAR Y SANITIZAR DATOS antes de enviar
			if (window.validator) {
				console.log('Datos originales:', datos)
				
				// Sanitizar primero
				datos = validator.sanitizarObjeto(datos)
				console.log('Datos sanitizados:', datos)
				
				// Validar después (puede lanzar error si hay algo MUY malo)
				validator.validarObjeto(datos)
				
				console.log("Validación exitosa - Enviando al servidor")
			}
			
			xhttp.open("POST", this.listener, true)
			xhttp.setRequestHeader("Content-type", "application/json")
			xhttp.send(JSON.stringify(datos))
			
		} catch(error) {
			console.error("Error de validación:", error)
			console.error("Stack:", error.stack)
			alert("Error de validación:\n" + error.message)
			
			// Devolver error al callback
			funcion(JSON.stringify({
				ok: 0,
				error: "Validación fallida",
				mensaje: error.message
			}))
		}
	}
}