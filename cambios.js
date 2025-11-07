class cambios {
    buscar_usuario() {
        const id = UI.cambioID.value.trim();
        
        if (!id) {
            UI.mensaje("Ingrese un ID para buscar");
            return false;
        }

        const datosServidor = {
            servicio: "CONSULTAS_ID",
            id: id
        };

        ajax.post(datosServidor, UI.buscar_usuario_resultado.bind(UI));
    }

enviar_click() {
    const datos = UI.recuperar(
        "cambioID",
        "cambioNombre",
        "cambioPApellido",
        "cambioSApellido",
        "cambioNacimiento",
        "cambioGenero",
        "cambioLogin",
        "cambioPwd"
        // Nota: 'cambioFoto' se maneja directamente en UI.fotoBase64Actual
    );
    
    if (window.self.validar(datos)) {  // Cambiado de this.validar a window.self.validar
        // Preparar datos para enviar al servidor
        const datosServidor = {
            servicio: "CAMBIOS",
            id: datos.cambioID,
            nombre: datos.cambioNombre || 'NO_DEFINIDO',
            papellido: datos.cambioPApellido || 'NO_DEFINIDO',
            sapellido: datos.cambioSApellido || 'NO_DEFINIDO',
            nacimiento: datos.cambioNacimiento || 'NO_DEFINIDO',
            genero: datos.cambioGenero || '0',
            login: datos.cambioLogin || 'NO_DEFINIDO',
            pwd: datos.cambioPwd || 'CLAVE_OCULTA',
            foto: UI.fotoBase64Actual || 'NO_DEFINIDO'  // Usar directamente de UI
        };
        
        ajax.post(datosServidor, UI.enviar_click_resultado.bind(UI));
    }
}


    validar(datos) {
        if (!datos.cambioID?.trim()) {
            UI.mensaje("El ID del usuario es obligatorio");
            return false;
        }

        // Validar que al menos un campo esté lleno para modificar
        const hayDatosParaModificar = 
            datos.cambioNombre?.trim() ||
            datos.cambioPApellido?.trim() ||
            datos.cambioSApellido?.trim() ||
            datos.cambioNacimiento?.trim() ||
            datos.cambioGenero ||
            datos.cambioLogin?.trim() ||
            datos.cambioPwd?.trim() ||
            UI.fotoBase64Actual;  // Incluir foto

        if (!hayDatosParaModificar) {
            UI.mensaje("Debe llenar al menos un campo para modificar");
            return false;
        }

        // Si se intenta cambiar el login, validar que no esté vacío
        if (datos.cambioLogin && !datos.cambioLogin.trim()) {
            UI.mensaje("El login no puede estar vacío");
            return false;
        }

        // Si se intenta cambiar la contraseña, validar longitud mínima
        if (datos.cambioPwd && datos.cambioPwd.length > 0 && datos.cambioPwd.length < 6) {
            UI.mensaje("La nueva contraseña debe tener al menos 6 caracteres");
            return false;
        }

        return true;
    }

    obtenerMensajeError(codigo) {
        const mensajes = {
            300: "Cambio exitoso",
            301: "Cambio fallido",
            400: "El login ya existe en el sistema",
            401: "El registro no existe en el sistema"
        };

        return mensajes[codigo] || `Error desconocido (código: ${codigo})`;
    }
}


window.onload = () => {
    window.UI = new cambiosUI(true);
    window.self = new cambios();
    window.ajax = new Ajax("PHP/servicios.php");
};