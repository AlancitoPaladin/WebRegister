class index {
	CONSTANTES() {
		ajax.post({servicio: "CONSTANTES"}, vista.CONSTANTES_click_resultado.bind(vista))
	}

	CONSULTAS() {
		ajax.post({servicio: "CONSULTAS", orden: 1}, vista.CONSULTAS_click_resultado.bind(vista))
	}

	CONSULTAS_DESCENDENTE() {
		ajax.post({servicio: "CONSULTAS", orden: 0}, vista.CONSULTAS_click_resultado.bind(vista))
	}

	CONSULTAS_LOGIN() {
		const datos = vista.recuperar("login")
		if(controlador.validar(datos))
			ajax.post({servicio: "CONSULTAS_LOGIN", login: datos.login}, vista.CONSULTAS_LOGIN_click_resultado.bind(vista))
	}

	validar(datos) {
		let mensaje = ""
		
		if(datos.hasOwnProperty("login") && datos.login === "")
			mensaje = "Login inválido"
		else 
			return true

		vista.mensaje(mensaje)
		return false
	}
}

window.onload = () => {
	window.vista = new indexV(true)
	window.controlador = new index()
	window.ajax = new Ajax("PHP/servicios.php")
}