class bajasUI {
	constructor(reset = false) {
		if(reset == true) {
			this.form = document.querySelector("#formBajas")
			this.bajaID = document.querySelector("#bajaID")
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
		self.enviar_click()
	}

	cancelar_click(e) {
		this.form.reset()
	}

	volver_click(e) {
		window.location.href = "index.html"
	}

	recuperar(...args) {
		let datos = {}
		for (const arg of args)
			if(UI.hasOwnProperty(arg)) datos[arg] = UI[arg].value
		return datos
	}

	mensaje(texto) {
		alert(texto)
	}

	//
	// Resultados
	//

	enviar_click_resultado(r) {
		try {
			// Convierto el objeto json de la respuesta a un objeto Javascript
			r = JSON.parse(r)
			
			// A consola para verificar
			console.log("Respuesta del servidor:", r)
			
			if(r.ok !== 0 && r.resultado) {
				UI.form.reset()
				
				setTimeout(() => {
					window.location.href = "index.html"
				}, 2000)
			} else {
				const mensaje = self.obtenerMensajeError(r.resultado)
			}
		} catch(e) {
			console.error("Error parseando JSON:", e)
		}
	}
}