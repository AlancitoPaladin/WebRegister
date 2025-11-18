class DataValidator {
	constructor() {
		// Caracteres peligrosos que pueden romper JSON o causar inyección
		this.caracteresProhibidos = /[<>{}[\]\\`]/g
		this.caracteresEscape = /[\\"]/g
		
		// Longitudes máximas por tipo de campo
		this.longitudesMaximas = {
			nombre: 250,
			papellido: 250,
			sapellido: 250,
			login: 50,
			pwd: 50,
			nacimiento: 10,
			id: 50
		}
		
		// Patrones de validación
		this.patrones = {
			fecha: /^\d{4}-\d{2}-\d{2}$/,
			numero: /^\d+$/,
			alfanumerico: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s._-]*$/,
			email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		}
	}

	// Sanitizar string: eliminar caracteres peligrosos
	sanitizarString(valor) {
		if (typeof valor !== 'string') return valor
		
		// Eliminar caracteres peligrosos
		let limpio = valor.replace(this.caracteresProhibidos, '')
		
		// Trim espacios
		limpio = limpio.trim()
		
		return limpio
	}

	// Validar longitud según tipo de campo
	validarLongitud(campo, valor) {
		if (typeof valor !== 'string') return true
		
		const maxLongitud = this.longitudesMaximas[campo] || 1000
		
		if (valor.length > maxLongitud) {
			throw new Error(`El campo ${campo} excede la longitud máxima de ${maxLongitud} caracteres`)
		}
		
		return true
	}

	// Validar formato según tipo de campo
	validarFormato(campo, valor) {
		if (!valor || valor === '') return true
		
		// Validar fechas
		if (campo === 'nacimiento' || campo.includes('Nacimiento')) {
			if (!this.patrones.fecha.test(valor)) {
				throw new Error(`Formato de fecha inválido. Use YYYY-MM-DD`)
			}
		}
		
		// Validar números
		if (campo === 'genero' || campo.includes('Genero')) {
			if (valor !== '' && !this.patrones.numero.test(String(valor))) {
				throw new Error(`El campo ${campo} debe ser numérico`)
			}
		}
		
		// Validar IDs
		if (campo === 'id' || campo.includes('ID')) {
			if (!this.patrones.alfanumerico.test(valor)) {
				throw new Error(`ID contiene caracteres no permitidos`)
			}
		}
		
		return true
	}

	// Validar que no haya intentos de inyección SQL básicos
	validarInyeccionSQL(valor) {
		if (typeof valor !== 'string') return true
		
		const patronesSQL = [
			/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
			/(--|\/\*|\*\/|;)/g,
			/('OR'|"OR"|'1'='1'|"1"="1")/gi
		]
		
		for (const patron of patronesSQL) {
			if (patron.test(valor)) {
				throw new Error('Datos sospechosos detectados. Por favor use valores válidos.')
			}
		}
		
		return true
	}

	// Validar objeto completo
	validarObjeto(datos) {
		const errores = []
		
		for (const [campo, valor] of Object.entries(datos)) {
			try {
				// Saltear campos especiales
				if (campo === 'servicio' || campo === 'orden') continue
				
				// Validar inyección SQL
				this.validarInyeccionSQL(valor)
				
				// Validar formato
				this.validarFormato(campo, valor)
				
				// Validar longitud
				this.validarLongitud(campo, valor)
				
			} catch (error) {
				errores.push(error.message)
			}
		}
		
		if (errores.length > 0) {
			throw new Error(errores.join('\n'))
		}
		
		return true
	}

	// Sanitizar objeto completo
	sanitizarObjeto(datos) {
		const datosSanitizados = {}
		
		for (const [campo, valor] of Object.entries(datos)) {
			// No sanitizar el servicio ni la foto base64
			if (campo === 'servicio' || campo === 'orden') {
				datosSanitizados[campo] = valor
			}
			// No sanitizar fotos en base64
			else if (campo === 'foto' && typeof valor === 'string' && valor.startsWith('data:image')) {
				datosSanitizados[campo] = valor
			}
			// Sanitizar strings normales
			else if (typeof valor === 'string') {
				datosSanitizados[campo] = this.sanitizarString(valor)
			}
			// Dejar otros tipos tal cual
			else {
				datosSanitizados[campo] = valor
			}
		}
		
		return datosSanitizados
	}

	// Crear Proxy que valida automáticamente
	crearProxyValidado(datos) {
		const validator = this
		
		return new Proxy(datos, {
			set(target, propiedad, valor) {
				// Permitir configuración inicial
				if (propiedad === 'servicio' || propiedad === 'orden') {
					target[propiedad] = valor
					return true
				}
				
				try {
					// Sanitizar valor
					let valorLimpio = valor
					if (typeof valor === 'string' && !(propiedad === 'foto' && valor.startsWith('data:image'))) {
						valorLimpio = validator.sanitizarString(valor)
					}
					
					// Validar
					validator.validarInyeccionSQL(valorLimpio)
					validator.validarFormato(propiedad, valorLimpio)
					validator.validarLongitud(propiedad, valorLimpio)
					
					// Asignar valor limpio
					target[propiedad] = valorLimpio
					return true
					
				} catch (error) {
					console.error(`Error validando ${propiedad}:`, error.message)
					throw error
				}
			},
			
			get(target, propiedad) {
				return target[propiedad]
			}
		})
	}
}

// Instancia global del validador
window.validator = new DataValidator()