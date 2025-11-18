class DataValidator {
	constructor() {
		// Caracteres peligrosos que pueden romper JSON o causar problemas
		this.caracteresProhibidos = /[<>\\`]/g  // Solo los realmente peligrosos
		
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
			// Permitimos más caracteres en nombres
			nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s._\-:{}[\]]*$/
		}
	}

	// Sanitizar string: eliminar solo caracteres realmente peligrosos
	sanitizarString(valor) {
		if (typeof valor !== 'string') return valor
		
		// Eliminar SOLO caracteres muy peligrosos
		let limpio = valor.replace(this.caracteresProhibidos, '')
		
		// Escapar comillas para evitar problemas con JSON
		limpio = limpio.replace(/"/g, '\\"')
		
		// Trim espacios al inicio y final
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
				throw new Error(`Formato de fecha inválido en ${campo}. Use YYYY-MM-DD`)
			}
		}
		
		// Validar números
		if (campo === 'genero' || campo.includes('Genero')) {
			const valorStr = String(valor)
			if (valorStr !== '' && valorStr !== '0' && !this.patrones.numero.test(valorStr)) {
				throw new Error(`El campo ${campo} debe ser numérico`)
			}
		}
		
		return true
	}

	// Validar inyección SQL - VERSIÓN CORREGIDA
	validarInyeccionSQL(valor) {
		if (typeof valor !== 'string') return true
		if (valor === '' || valor === 'NO_DEFINIDO') return true
		
		// Convertir a mayúsculas para comparación
		const valorUpper = valor.toUpperCase()
		
		// Solo detectar patrones MUY específicos y peligrosos
		const patronesPeligrosos = [
			// SQL keywords COMPLETOS con espacios (no dentro de palabras)
			/\bDROP\s+TABLE\b/i,
			/\bDELETE\s+FROM\b/i,
			/\bTRUNCATE\s+TABLE\b/i,
			// Comentarios SQL explícitos
			/--\s*$/,
			/\/\*.*\*\//,
			// Bypass authentication obvios
			/'\s*OR\s*'1'\s*=\s*'1/i,
			/"\s*OR\s*"1"\s*=\s*"1/i,
			/'\s*OR\s*1\s*=\s*1/i,
			// UNION attacks
			/\bUNION\s+ALL\s+SELECT\b/i,
			/\bUNION\s+SELECT\b/i,
			// Intentos de cerrar queries
			/';\s*DROP/i,
			/";\s*DROP/i
		]
		
		for (const patron of patronesPeligrosos) {
			if (patron.test(valor)) {
				console.error('🚨 Patrón SQL peligroso detectado:', valor)
				throw new Error('Patrón sospechoso detectado en los datos')
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
				if (campo === 'servicio' || campo === 'orden' || campo === 'foto') continue
				
				// Validar inyección SQL (solo patrones muy obvios)
				this.validarInyeccionSQL(valor)
				
				// Validar formato
				this.validarFormato(campo, valor)
				
				// Validar longitud
				this.validarLongitud(campo, valor)
				
			} catch (error) {
				errores.push(`${campo}: ${error.message}`)
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
			// No tocar el servicio ni el orden
			if (campo === 'servicio' || campo === 'orden') {
				datosSanitizados[campo] = valor
			}
			// No sanitizar fotos en base64
			else if (campo === 'foto' && typeof valor === 'string' && valor.startsWith('data:image')) {
				datosSanitizados[campo] = valor
			}
			// Sanitizar strings normales (solo quitar caracteres MUY peligrosos)
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

	// Log de sanitización (útil para debugging)
	logSanitizacion(original, sanitizado) {
		const cambios = []
		
		for (const [campo, valor] of Object.entries(original)) {
			if (sanitizado[campo] !== valor && campo !== 'foto') {
				cambios.push({
					campo,
					original: valor,
					sanitizado: sanitizado[campo]
				})
			}
		}
		
		if (cambios.length > 0) {
			console.warn('⚠️ Datos sanitizados:', cambios)
		}
		
		return cambios
	}
}

// Instancia global del validador
window.validator = new DataValidator()