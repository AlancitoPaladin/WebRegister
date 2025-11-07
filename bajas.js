// Colocar todas las acciones y llamadas al servidor en el controlador
class bajas {
	enviar_click() {
		const datos = UI.recuperar("bajaID")
		
		if(self.validar(datos)) {
			if(!confirm(`¿Está seguro de eliminar el usuario con ID: ${datos.bajaID}?`)) {
				return false
			}

			// Preparar datos para enviar al servidor
			const datosServidor = {
				servicio: "BAJAS",
				id: datos.bajaID
			}
			
			ajax.post(datosServidor, UI.enviar_click_resultado)
		}
	}

	validar(datos) {
		if (!datos.bajaID?.trim()) {
			UI.mensaje("El ID del usuario es obligatorio")
			return false
		}

		return true
	}

	obtenerMensajeError(codigo) {
		const mensajes = {
			200: "Baja exitosa",
			201: "Baja fallida",
			401: "El registro no existe en el sistema"
		}

		return mensajes[codigo] || `Error desconocido (código: ${codigo})`
	}
}

window.onload = () => {
	window.UI = new bajasUI(true)
	window.self = new bajas()
	window.ajax = new Ajax("PHP/servicios.php")
}