class Ajax {
	constructor(listener) {
		this.listener = listener
	}

	post(datos, funcion) {
		let xhttp = new XMLHttpRequest()
		
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				// Validar que la respuesta sea JSON válido
				try {
					// Verificar si la respuesta comienza con '<'
					if (this.responseText.trim().startsWith('<')) {
						throw new Error('La respuesta parece ser HTML en lugar de JSON');
					}
					
					// Intentar parsear el JSON
					JSON.parse(this.responseText);
					funcion(this.responseText);
				} catch (e) {
					console.error("Error en la respuesta:", e);
					console.log("Respuesta raw:", this.responseText);
					funcion(JSON.stringify({
						ok: 0,
						error: "Error en el formato de la respuesta",
						mensaje: "El servidor no devolvió un JSON válido"
					}));
				}
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
		
		xhttp.open("POST", this.listener, true)
		xhttp.setRequestHeader("Content-type", "application/json")
		xhttp.send(JSON.stringify(datos))
	}
}