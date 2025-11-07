class altas {
enviar_click() {
  const datos = UI.recuperar("nombre", "pApellido", "sApellido", "nacimiento", "genero", "login", "pwd", "fotoBase64")

  if(self.validar(datos)) {
    const datosServidor = {
      servicio: "ALTAS",
      nombre: datos.nombre,
      papellido: datos.pApellido || 'NO_DEFINIDO',
      sapellido: datos.sApellido || 'NO_DEFINIDO',
      nacimiento: datos.nacimiento || 'NO_DEFINIDO',
      genero: datos.genero || '3',
      login: datos.login,
      pwd: datos.pwd,
      foto: datos.foto || ''
    }

    console.log("Enviando datos al servidor:", {
      ...datosServidor,
      foto: datos.foto ? `[BASE64: ${datos.foto.length} caracteres]` : 'VACIO'
    });

    ajax.post(datosServidor, UI.enviar_click_resultado)
  }
}

  validar(datos) {
    if (!datos.nombre?.trim()) {
      UI.mensaje("El nombre es obligatorio")
      return false
    }

    if (!datos.pApellido?.trim()) {
      UI.mensaje("Apellido paterno es obligatorio")
      return false
    }

    if (!datos.sApellido?.trim()) {
      UI.mensaje("Apellido materno es obligatorio")
      return false
    }

    if (!datos.nacimiento) {
      UI.mensaje("Fecha de nacimiento es obligatoria")
      return false
    }

    if (!["1", "2", "3"].includes(datos.genero)) {
      UI.mensaje("Selecciona un género válido")
      return false
    }

    if (!this.validarCURP(datos.login)) {
      UI.mensaje("CURP inválido")
      return false
    }

    if (!datos.pwd?.trim()) {
      UI.mensaje("La contraseña es obligatoria")
      return false
    }

    if (datos.pwd.length < 6) {
      UI.mensaje("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    if (!datos.foto?.trim()) {
      UI.mensaje("Por favor, toma una fotografía antes de guardar")
      return false
    }

    if (!datos.foto.startsWith('data:image/')) {
      UI.mensaje("La fotografía no es válida. Por favor, tómala nuevamente.")
      return false
    }

    return true
  }


  validarCURP(curp) {
    const regexCURP = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])(H|M)(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

    if (!regexCURP.test(curp)) {
      return false;
    }

    if (curp !== curp.toUpperCase()) {
      return false;
    }

    const palabrasProhibidas = ['BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO',
      'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE', 'COGI', 'COJA', 'COJE',
      'COJI', 'COJO', 'COLA', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEI',
      'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA',
      'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA',
      'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME', 'MAMO',
      'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 'MOKO', 'MULA',
      'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO',
      'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO',
      'RUIN', 'SENO', 'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI',
      'VUEY', 'WUEI', 'WUEY'];

    const primeras4Letras = curp.substring(0, 4);
    if (palabrasProhibidas.includes(primeras4Letras)) {
      return false;
    }

    // Validar que la fecha sea real
    const año = parseInt(curp.substring(4, 6));
    const mes = parseInt(curp.substring(6, 8));
    const dia = parseInt(curp.substring(8, 10));

    // Determinar siglo (si el año es <= 24, es 2000+, si no es 1900+)
    const añoCompleto = año <= 24 ? 2000 + año : 1900 + año;

    const fecha = new Date(añoCompleto, mes - 1, dia);

    if (fecha.getFullYear() !== añoCompleto ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia) {
      return false;
    }

    // Validar dígito verificador
    const diccionario = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    let suma = 0;

    for (let i = 0; i < 17; i++) {
      suma += diccionario.indexOf(curp.charAt(i)) * (18 - i);
    }

    const digitoEsperado = 10 - (suma % 10);
    const digitoVerificador = digitoEsperado === 10 ? 0 : digitoEsperado;

    if (curp.charAt(17) != digitoVerificador) {
      return false;
    }

    return true;
  }

  obtenerMensajeError(codigo) {
    const mensajes = {
      100: "Alta exitosa",
      101: "Alta fallida",
      400: "El login ya existe en el sistema",
      401: "Registro inexistente",
      2: "Alta correcta"
    }

    return mensajes[codigo] || `Error desconocido (código: ${codigo})`
  }
}

window.onload = () => {
  window.UI = new altasUI(true)
  window.self = new altas()
  window.ajax = new Ajax("PHP/servicios.php")
}