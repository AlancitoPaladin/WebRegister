class indexV {
	constructor(reset = false) {
		if(reset == true) {
			this.CONSTANTES = document.querySelector("#CONSTANTES")
			this.CONSULTAS = document.querySelector("#CONSULTAS")
			this.CONSULTAS_DESCENDENTE = document.querySelector("#CONSULTAS_DESCENDENTE")
			this.login = document.querySelector("#login")
			this.CONSULTAS_LOGIN = document.querySelector("#CONSULTAS_LOGIN")
			this.tableHeader = document.querySelector("#tableHeader")
			this.tableBody = document.querySelector("#tableBody")
			this.resultsCount = document.querySelector("#resultsCount")

			this.fijarEventos()
		}
	}

	//
	// Peticiones al server
	//

	CONSTANTES_click(e) {
		controlador.CONSTANTES()
	}

	CONSULTAS_click(e) {
		controlador.CONSULTAS()
	}

	CONSULTAS_DESCENDENTE_click(e) {
		controlador.CONSULTAS_DESCENDENTE()
	}

	CONSULTAS_LOGIN_click(e) {
		controlador.CONSULTAS_LOGIN()
	}

	//
	// Resultados
	//

	CONSTANTES_click_resultado(r) {
		try{
			r = JSON.parse(r)
			vista.mostrarResultados(r)
		}
		catch {vista.mensaje("Error en los datos")}
	}

	CONSULTAS_click_resultado(r) {
		console.log("Respuesta raw:", r);
		try{
			r = JSON.parse(r)
			vista.mostrarResultados(r)
		}
		catch(e) {
			console.error("Error parseando JSON:", e)
			console.log("Contenido de la respuesta:", r) // Agregar esta línea
			vista.mensaje("Error en los datos")
		}
	}

	CONSULTAS_LOGIN_click_resultado(r) {
		console.log("Respuesta CONSULTAS_LOGIN:", r);
		try {
			const data = JSON.parse(r);
			vista.mostrarResultados(data);
		} catch(e) {
			console.error("Error parseando JSON:", e, "Respuesta completa:", r);
			vista.mensaje("Error en los datos");
		}
	}

	fijarEventos() {
		this.CONSTANTES.addEventListener("click", this.CONSTANTES_click.bind(this))
		this.CONSULTAS.addEventListener("click", this.CONSULTAS_click.bind(this))
		this.CONSULTAS_DESCENDENTE.addEventListener("click", this.CONSULTAS_DESCENDENTE_click.bind(this))
		this.CONSULTAS_LOGIN.addEventListener("click", this.CONSULTAS_LOGIN_click.bind(this))
	}

	recuperar(...args) {
		let datos = {}

		for (const arg of args)
			if(this.hasOwnProperty(arg)) datos[arg] = this[arg].value
		return datos
	}

	mensaje(texto) {
		alert(texto)
	}

	mostrarResultados(resultados) {
		// Limpiar la tabla
		this.tableHeader.innerHTML = "";
		this.tableBody.innerHTML = "";

		// Si la respuesta tiene una propiedad "data" que es un array, usar eso
		if (resultados.hasOwnProperty("data") && Array.isArray(resultados.data)) {
			resultados = resultados.data;
		}

		if (!Array.isArray(resultados)) resultados = [resultados];

		if (resultados.length === 0) {
			// Si no hay resultados, mostrar un mensaje
			const row = this.tableBody.insertRow();
			const cell = row.insertCell();
			cell.colSpan = 1;
			cell.textContent = "No se encontraron resultados.";
			cell.style.textAlign = "center";
			cell.style.padding = "2rem";
			if (this.resultsCount) {
				this.resultsCount.textContent = "0 registro(s)";
			}
			return;
		}

		// Obtener las claves del primer registro para los headers
		const headers = Object.keys(resultados[0]);

		// Crear headers
		headers.forEach(header => {
			const th = document.createElement("th");
			th.textContent = header;
			this.tableHeader.appendChild(th);
		});

		// Crear filas para cada registro
		resultados.forEach(registro => {
			const row = this.tableBody.insertRow();
			headers.forEach(header => {
				const cell = row.insertCell();
				let valor = registro[header];

				// Si es objeto, convertirlo a JSON string
				if (typeof valor === "object" && valor !== null) {
					valor = JSON.stringify(valor);
				}

				cell.textContent = valor || "";
			});
		});

		if (this.resultsCount) {
			this.resultsCount.textContent = `${resultados.length} registro(s)`;
		}
	}
}
