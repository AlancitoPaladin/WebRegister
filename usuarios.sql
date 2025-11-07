-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.4.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para usuarios
DROP DATABASE IF EXISTS `usuarios`;
CREATE DATABASE IF NOT EXISTS `usuarios` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `usuarios`;

-- Volcando estructura para procedimiento usuarios.ALTAS
DROP PROCEDURE IF EXISTS `ALTAS`;
DELIMITER //
CREATE PROCEDURE `ALTAS`(
	IN `iNOMBRE` VARCHAR(250) CHARSET utf8mb4,
	IN `iPAPELLIDO` VARCHAR(250) CHARSET utf8mb4,
	IN `iSAPELLIDO` VARCHAR(250) CHARSET utf8mb4,
	IN `iNACIMIENTO` VARCHAR(50) CHARSET utf8mb4,
	IN `iGENERO` INT,
	IN `iLOGIN` VARCHAR(50) CHARSET utf8mb4,
	IN `iPWD` VARCHAR(50) CHARSET utf8mb4
)
BEGIN
	# Constantes a manejar
	DECLARE CADENA_VACIA VARCHAR(1) DEFAULT "";
	DECLARE INDEFINIDO INT DEFAULT CN("INDEFINIDO");
	DECLARE CAMPO_ACTIVO INT DEFAULT CN("CAMPO_ACTIVO");
	DECLARE NO_DEFINIDO VARCHAR(250) DEFAULT CC("NO_DEFINIDO");

	# Banderas para la validación
	DECLARE loginOK INT;
	DECLARE generoOK INT;
	DECLARE pApellidoOK INT;
	DECLARE sApellidoOK INT;
	DECLARE nacimientoOK INT;

	# Id del usuario
	DECLARE iID VARCHAR(19) DEFAULT usuarios.ID(NO_DEFINIDO);

	# Manejo de excepciones
	DECLARE EXIT HANDLER FOR 1022, 1062, 1291, 1452, 1859 # Problemas con llaves
	BEGIN
		ROLLBACK;
		SELECT 0 AS ok, CN('ALTA_FALLIDA') as resultado, ROL;
	END;

	# Si ya existe el login no se puede realizar el alta
	IF EXISTS(SELECT * FROM login WHERE login = iLOGIN) THEN
		SELECT 0 AS ok, CN('LOGIN_EXISTENTE') as resultado;
	ELSE
		START TRANSACTION;

		# 1.- Registro el nombre
		INSERT INTO nombre(id, nombre) VALUES(iID, iNOMBRE);

		# 2.- Registro el apellido paterno
		IF iPAPELLIDO <> NO_DEFINIDO AND iPAPELLIDO <> CADENA_VACIA THEN
			INSERT INTO papellido(id, papellido) VALUES(iID, iPAPELLIDO);
		END IF;

		# 3.- Registro el segundo apellido
		IF iSAPELLIDO <> NO_DEFINIDO AND iSAPELLIDO <> CADENA_VACIA THEN
			INSERT INTO sapellido(id, sapellido) VALUES(iID, iSAPELLIDO);
		END IF;

		# 4- Registro la fecha de nacimiento
		IF iNACIMIENTO <> NO_DEFINIDO AND iNACIMIENTO <> CADENA_VACIA THEN
			INSERT INTO nacimiento(id, nacimiento) VALUES(iID, iNACIMIENTO);
		END IF;

		# 5- Registro el genero
		IF iGENERO <> INDEFINIDO THEN
			INSERT INTO genero(id, genero) VALUES(iID, iGENERO);
		END IF;

		# 6- Registro el login
		INSERT INTO login(id, login, pwd) VALUES(iID, iLOGIN, AES_ENCRYPT(iPWD, '19701019'));

		# 7.- Configuro banderas
		SET pApellidoOK = IF(iPAPELLIDO <> NO_DEFINIDO AND iPAPELLIDO <> CADENA_VACIA AND NOT EXISTS(SELECT * FROM papellido WHERE id = iID), 0, 1);
		SET sApellidoOK = IF(iSAPELLIDO <> NO_DEFINIDO AND iSAPELLIDO <> CADENA_VACIA AND NOT EXISTS(SELECT * FROM sapellido WHERE id = iID), 0, 1);
		SET generoOK = IF(iGENERO <> INDEFINIDO AND NOT EXISTS(SELECT * FROM genero WHERE id = iID), 0, 1);
		SET loginOK = IF(iLOGIN <> NO_DEFINIDO AND iLOGIN <> CADENA_VACIA AND NOT EXISTS(SELECT * FROM login WHERE id = iID), 0, 1);

		# 8.- Valido la transacción
		IF  PApellidoOk = 1 AND sApellidoOk = 1 AND generoOk = 1 AND loginOk = 1 THEN
			COMMIT;
			SELECT CN("ALTA_EXITOSA") AS resultado;
		ELSE
			ROLLBACK;
			SELECT 0 AS ok, CN("ALTA_FALLIDA") AS resultado;
		END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento usuarios.BAJAS
DROP PROCEDURE IF EXISTS `BAJAS`;
DELIMITER //
CREATE PROCEDURE `BAJAS`(
	IN `iID` VARCHAR(50) CHARSET utf8mb4
)
BEGIN
	-- Si el id del usuario no existe, se trata de un error
	IF NOT EXISTS(SELECT * FROM nombre WHERE id = iID) THEN
		SELECT 0 AS ok, CN("REGISTRO_INEXISTENTE") AS resultado;
	ELSE
		START TRANSACTION;
		DELETE FROM nombre WHERE id = iID;

		IF NOT EXISTS(SELECT * FROM nombre WHERE id = iID) THEN
			COMMIT;
			SELECT CN("BAJA_EXITOSA") AS resultado;
		ELSE
			ROLLBACK;
			SELECT 0 AS ok, CN("BAJA_FALLIDA") AS resultado;
		END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para procedimiento usuarios.CAMBIOS
DROP PROCEDURE IF EXISTS `CAMBIOS`;
DELIMITER //
CREATE PROCEDURE `CAMBIOS`(
	IN `iID` VARCHAR(50) CHARSET utf8mb4,
	IN `iNOMBRE` VARCHAR(250) CHARSET utf8mb4,
	IN `iPAPELLIDO` VARCHAR(250) CHARSET utf8mb4,
	IN `iSAPELLIDO` VARCHAR(250) CHARSET utf8mb4,
	IN `iNACIMIENTO` VARCHAR(50) CHARSET utf8mb4,
	IN `iGENERO` INT,
	IN `iLOGIN` VARCHAR(50) CHARSET utf8mb4,
	IN `iPWD` VARCHAR(50) CHARSET utf8mb4
)
BEGIN
	# Constantes a manejar
	DECLARE CADENA_VACIA VARCHAR(1) DEFAULT "";
	DECLARE CAMPO_ACTIVO INT DEFAULT CN("CAMPO_ACTIVO");
	DECLARE INDEFINIDO VARCHAR(250) DEFAULT CN("INDEFINIDO");
	DECLARE NO_DEFINIDO VARCHAR(250) DEFAULT CC("NO_DEFINIDO");

	# Banderas para la validación
	DECLARE loginOK INT;
	DECLARE generoOK INT;
	DECLARE pApellidoOK INT;
	DECLARE sApellidoOK INT;

	# Gestión de excepciones
	DECLARE EXIT HANDLER FOR 1022, 1062, 1291, 1452, 1859 # Problemas con llaves
	BEGIN
		ROLLBACK;
		SELECT 0 AS ok, CN('CAMBIO_FALLIDO') as resultado;
	END;

	# si ya existe un usuario con el nuevo login, no se pueden realizar los cambios
	IF EXISTS(SELECT * FROM login WHERE login = iLOGIN AND id <> iID) THEN
		SELECT 0 AS ok, CN('LOGIN_EXISTENTE') as resultado;
	ELSE
		START TRANSACTION;

		# 1.- Actualizo el nombre
		IF iNOMBRE <> NO_DEFINIDO AND iNOMBRE <> CADENA_VACIA THEN
			UPDATE nombre SET nombre = iNOMBRE WHERE id = iID;
		END IF;

		# 2.- Actualizo el primer apellido
		DELETE FROM papellido WHERE id = iID;
		IF iPAPELLIDO <> NO_DEFINIDO AND iPAPELLIDO <> CADENA_VACIA THEN
			INSERT INTO papellido(id, pApellido) VALUES(iID, iPAPELLIDO);
		END IF;

		# 3.- Actualizo el segundo apellido
		DELETE FROM sapellido WHERE id = iID;
		IF iSAPELLIDO <> NO_DEFINIDO AND iSAPELLIDO <> CADENA_VACIA THEN
			INSERT INTO sapellido(id, sApellido) VALUES(iID, iSAPELLIDO);
		END IF;

		# 4.- Actualizo la fecha de nacimiento
		DELETE FROM nacimiento WHERE id = iID;
		IF iNACIMIENTO <> NO_DEFINIDO AND iNACIMIENTO <> CADENA_VACIA THEN
			INSERT INTO nacimiento(id, nacimiento) VALUES(iID, iNACIMIENTO);
		END IF;

		# 5.- Actualización del genero
		DELETE FROM genero WHERE id = iID;
		IF iGENERO <> INDEFINIDO THEN
			INSERT INTO genero(id, genero) VALUES(iID, iGENERO);
		END IF;

		# 6.- Actualizo el login
		IF iPWD = CC("CLAVE_OCULTA") THEN
			SET iPWD = AES_DECRYPT((SELECT pwd FROM login WHERE id = iID), '19701019');
		END IF;

		DELETE FROM login WHERE id = iID;
		IF iLOGIN <> NO_DEFINIDO AND iLOGIN <> "" THEN
			INSERT INTO login(id, login, pwd) VALUES(iID, iLOGIN, AES_ENCRYPT(iPWD, '19701019'));
		END IF;

		# 7.- Configuro banderas
		SET pApellidoOK = IF(iPAPELLIDO <> NO_DEFINIDO AND iPAPELLIDO <> "" AND NOT EXISTS(SELECT * FROM papellido WHERE id = iID), 0, 1);
		SET sApellidoOK = IF(iSAPELLIDO <> NO_DEFINIDO AND iSAPELLIDO <> "" AND NOT EXISTS(SELECT * FROM sapellido WHERE id = iID), 0, 1);
		SET generoOK = IF(iGENERO <> INDEFINIDO AND NOT EXISTS(SELECT * FROM genero WHERE id = iID), 0, 1);
		SET loginOK = IF(iLOGIN <> NO_DEFINIDO AND iLOGIN <> "" AND NOT EXISTS(SELECT * FROM login WHERE id = iID), 0, 1);
		
		# 8.- Valido la transacción
		IF  PApellidoOk = 1 AND sApellidoOk = 1 AND generoOk = 1 AND loginOk = 1 THEN
			COMMIT;
			SELECT CN("CAMBIO_EXITOSO") AS resultado;
		ELSE
			ROLLBACK;
			SELECT 0 as ok, CN("CAMBIO_FALLIDO") AS resultado;
		END IF;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para función usuarios.CC
DROP FUNCTION IF EXISTS `CC`;
DELIMITER //
CREATE FUNCTION `CC`(`iCONSTANTE` VARCHAR(250) CHARSET utf8mb4) RETURNS varchar(250) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
IF(EXISTS(SELECT * FROM constantes WHERE constante = iCONSTANTE AND numerica = "0")) THEN
	RETURN (SELECT valor FROM constantes WHERE constante = iCONSTANTE AND numerica = "0");
ELSE
	RETURN "ND";
END IF//
DELIMITER ;

-- Volcando estructura para función usuarios.CN
DROP FUNCTION IF EXISTS `CN`;
DELIMITER //
CREATE FUNCTION `CN`(`iCONSTANTE` VARCHAR(250) CHARSET utf8mb4) RETURNS int(11)
IF(EXISTS(SELECT * FROM constantes WHERE constante = iCONSTANTE AND numerica = "1")) THEN
	RETURN (SELECT CAST(valor AS INT) FROM constantes WHERE constante = iCONSTANTE AND numerica = "1");
ELSE
	RETURN -1;
END IF//
DELIMITER ;

-- Volcando estructura para procedimiento usuarios.CONSTANTES
DROP PROCEDURE IF EXISTS `CONSTANTES`;
DELIMITER //
CREATE PROCEDURE `CONSTANTES`()
SELECT constante, valor, numerica FROM constantes ORDER BY constante//
DELIMITER ;

-- Volcando estructura para tabla usuarios.constantes
DROP TABLE IF EXISTS `constantes`;
CREATE TABLE IF NOT EXISTS `constantes` (
  `constante` varchar(250) NOT NULL,
  `valor` varchar(250) NOT NULL,
  `numerica` int(11) NOT NULL DEFAULT 1,
  `descripcion` varchar(250) NOT NULL,
  UNIQUE KEY `constantes_indice` (`constante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.constantes: ~23 rows (aproximadamente)
DELETE FROM `constantes`;
INSERT INTO `constantes` (`constante`, `valor`, `numerica`, `descripcion`) VALUES
	('ALTA_EXITOSA', '2', 1, 'Reporta un alta exitosa sobre una base de datos.'),
	('ALTA_FALLIDA', '3', 1, 'Reporta un alta fallida sobre una base de datos.'),
	('ASCENDENTE', '1', 1, 'Indica modo de orden ascendente'),
	('BAJA_EXITOSA', '4', 1, 'Reporta una baja exitosa sobre una base de datos.'),
	('BAJA_FALLIDA', '5', 1, 'Reporta una baja fallida sobre una base de datos.'),
	('CAMBIO_EXITOSO', '6', 1, 'Reporta un cambio exitoso sobre una base de datos.'),
	('CAMBIO_FALLIDO', '7', 1, 'Reporta un cambio fallido sobre una base de datos.'),
	('CAMPO_ACTIVO', '1', 1, 'Indica que el campo debe ser considerado en las consultas.'),
	('CAMPO_INACTIVO', '0', 1, 'Indica que el campo no debe ser considerado en las consultas'),
	('CLAVE_OCULTA', 'CLAVE_OCULTA', 0, 'Auxiliar para no mostrar la clave real'),
	('CONSULTA_EXITOSA', '1', 1, 'Reporta una consulta exitosa sobre una base de datos.'),
	('CONSULTA_FALLIDA', '0', 1, 'Reporta una consulta sin resultados sobre una base de datos.'),
	('CONSULTA_SIN_RESULTADOS', '11', 1, 'Indica que la consulta no produjo resultados'),
	('DATOS_INVALIDOS', '8', 1, 'Indica que uno o más de los datos requeridos para hacer la operación son inválidos.'),
	('DESCENDENTE', '0', 1, 'Indica modo de orden descendente'),
	('FECHA_INDEFINIDA', '0000-00-00 00:00:00', 0, 'Indica que no se registró fecha'),
	('INDEFINIDO', '-1', 1, 'Indica cualquier valor no definido de tipo numérico'),
	('LOGIN_EXISTENTE', '9', 1, 'Indica que ya existe un usuario con el login indicado.'),
	('NO_DEFINIDO', 'ND', 0, 'Representa cualquier valor no definido de tipo cadena de caracteres'),
	('OPERACION_NO_PERMITIDA', '10', 1, 'Indica que la operación no debe realizarse'),
	('PAGINADOR', '50', 1, 'Indica el número de registros a recuperar por consulta.'),
	('REGISTRO_EXISTENTE', '1', 1, 'Indica que un registro con la información proporcionada ya existe en la BD.'),
	('REGISTRO_INEXISTENTE', '0', 1, 'Indica que después de una búsqueda no se encontró un registro con los datos indicados.');

-- Volcando estructura para procedimiento usuarios.CONSULTAS
DROP PROCEDURE IF EXISTS `CONSULTAS`;
DELIMITER //
CREATE PROCEDURE `CONSULTAS`(
	IN `iORDEN` INT
)
BEGIN
	DECLARE ORDEN VARCHAR(4) DEFAULT IF(iORDEN = CN("ASCENDENTE"), "ASC ", "DESC ");

	SET @sql = CONCAT("SELECT id, LOGIN(id) AS login, NOMBRE(id) AS nombre, PAPELLIDO(id) AS papellido, SAPELLIDO(id) AS sapellido, NOMBRECOMPLETO(id) AS nombrecompleto, NACIMIENTO(id) AS nacimiento, GENERO(id) AS genero FROM nombre ORDER BY NOMBRECOMPLETO(id) ", ORDEN, ";");
	PREPARE stm FROM @sql;
	EXECUTE stm;
	DEALLOCATE PREPARE stm;
	-- SELECT @sql as consulta;
END//
DELIMITER ;

-- Volcando estructura para procedimiento usuarios.CONSULTAS_LOGIN
DROP PROCEDURE IF EXISTS `CONSULTAS_LOGIN`;
DELIMITER //
CREATE PROCEDURE `CONSULTAS_LOGIN`(
	IN `iLOGIN` VARCHAR(50)
)
BEGIN
	IF EXISTS(SELECT 1 FROM login WHERE login = iLOGIN) THEN
		SELECT id, NOMBRE(ID) AS nombre, PAPELLIDO(ID) AS papellido, SAPELLIDO(ID) AS sApellido, NOMBRECOMPLETO(ID) AS nombrecompleto, NACIMIENTO(ID) AS nacimiento, GENERO(ID) AS genero
		FROM nombre WHERE LOGIN(id) = iLOGIN ORDER BY NOMBRECOMPLETO(id);
	ELSE
		SELECT 0 AS ok, CN("REGISTRO_INEXISTENTE") AS resultado;
	END IF;
END//
DELIMITER ;

-- Volcando estructura para función usuarios.EDAD
DROP FUNCTION IF EXISTS `EDAD`;
DELIMITER //
CREATE FUNCTION `EDAD`(`iID` VARCHAR(50) CHARSET utf8) RETURNS int(11)
BEGIN
	DECLARE nacimiento VARCHAR(50) DEFAULT NACIMIENTO(iID);

	IF nacimiento = CC("NO_DEFINIDO") THEN
		RETURN CN("INDEFINIDO");
	ELSE
		RETURN TIMESTAMPDIFF(YEAR, nacimiento, CURDATE());
	END IF;
END//
DELIMITER ;

-- Volcando estructura para función usuarios.GENERO
DROP FUNCTION IF EXISTS `GENERO`;
DELIMITER //
CREATE FUNCTION `GENERO`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS int(11)
RETURN IFNULL((SELECT genero FROM genero WHERE id = iID), CN("INDEFINIDO"))//
DELIMITER ;

-- Volcando estructura para tabla usuarios.genero
DROP TABLE IF EXISTS `genero`;
CREATE TABLE IF NOT EXISTS `genero` (
  `id` varchar(50) NOT NULL,
  `genero` int(11) NOT NULL,
  KEY `genero_nombre` (`id`),
  KEY `genero_generos` (`genero`),
  CONSTRAINT `genero_generos` FOREIGN KEY (`genero`) REFERENCES `generos` (`genero`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `genero_nombre` FOREIGN KEY (`id`) REFERENCES `nombre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.genero: ~20 rows (aproximadamente)
DELETE FROM `genero`;
INSERT INTO `genero` (`id`, `genero`) VALUES
	('ID20241219193220753', 1),
	('ID20250129095634288', 1),
	('ID20250129112547687', 1),
	('ID20250129112735175', 0),
	('ID20250129113015529', 1),
	('ID20250130105432698', 1),
	('ID20250129095044244', 0),
	('ID20250129113244217', 0),
	('ID20250207145812395', 0),
	('ID20250212190550109', 0),
	('ID20250212191632900', 1),
	('ID20250212214100379', 1),
	('ID20250213023047260', 0),
	('ID20250213045236276', 1),
	('ID20250213095009848', 0),
	('ID20250213093917370', 1),
	('ID20250213181359933', 1),
	('ID20250213195103623', 0),
	('ID20250213201805264', 1),
	('ID20240618210545865', 1);

-- Volcando estructura para tabla usuarios.generos
DROP TABLE IF EXISTS `generos`;
CREATE TABLE IF NOT EXISTS `generos` (
  `genero` int(11) NOT NULL,
  `Descripcion` varchar(250) NOT NULL,
  UNIQUE KEY `generos_indice` (`genero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.generos: ~3 rows (aproximadamente)
DELETE FROM `generos`;
INSERT INTO `generos` (`genero`, `Descripcion`) VALUES
	(0, 'Femenino'),
	(1, 'Masculino'),
	(2, 'Otro');

-- Volcando estructura para función usuarios.ID
DROP FUNCTION IF EXISTS `ID`;
DELIMITER //
CREATE FUNCTION `ID`(`iID` VARCHAR(2) CHARSET utf8mb4) RETURNS varchar(19) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
BEGIN
	DECLARE FECHA DATETIME DEFAULT NOW();
	DECLARE ANIO VARCHAR(4) DEFAULT SUBSTRING(CONCAT("0000", YEAR(FECHA)), -4);
	DECLARE MES VARCHAR(2) DEFAULT SUBSTRING(CONCAT("00", MONTH(FECHA)), -2);
	DECLARE DIA VARCHAR(2) DEFAULT SUBSTRING(CONCAT("00", DAY(FECHA)), -2);
	DECLARE HORA VARCHAR(2) DEFAULT SUBSTRING(CONCAT("00", HOUR(FECHA)), -2);
	DECLARE MINUTO VARCHAR(2) DEFAULT SUBSTRING(CONCAT("00", MINUTE(FECHA)), -2);
	DECLARE SEGUNDO VARCHAR(2) DEFAULT SUBSTRING(CONCAT("00", SECOND(FECHA)), -2);
	DECLARE MILISEGUNDO VARCHAR(3) DEFAULT SUBSTRING(CONCAT("000", FLOOR(((RAND() * (999 - 1)) + 1))), -3);

	IF iID = CC("NO_DEFINIDO") OR iID = "" THEN
		SET iID = "ID";
	END IF;

	RETURN CONCAT(iID, ANIO, MES, DIA, HORA, MINUTO, SEGUNDO, MILISEGUNDO);
END//
DELIMITER ;

-- Volcando estructura para tabla usuarios.login
DROP TABLE IF EXISTS `login`;
CREATE TABLE IF NOT EXISTS `login` (
  `id` varchar(50) NOT NULL,
  `login` varchar(50) NOT NULL,
  `pwd` blob NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_LOGIN_USUARIOS` (`login`),
  CONSTRAINT `login_nombre` FOREIGN KEY (`id`) REFERENCES `nombre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.login: ~20 rows (aproximadamente)
DELETE FROM `login`;
INSERT INTO `login` (`id`, `login`, `pwd`) VALUES
	('ID20240618210545865', 'FIGJ701019HVZGRR00', _binary 0x36492092c0758f2cd2573597e30d937f),
	('ID20241219193220753', 'SARC020725HPLNDRA7', _binary 0xc1de448c065a6c2349c7b64b5702bf59),
	('ID20250129095044244', 'SARK020725MPLNDRA7', _binary 0xa38ec6a4caff5754026a660d88e8fd1e),
	('ID20250129095634288', 'SAMS751205HVZNNM00', _binary 0x1039a3fcde9aedb8052121ee423adcf7),
	('ID20250129112547687', 'GOMJ790101HVZNRS05', _binary 0x37ad06c052c7d0fd33eac22ffc1b5cf9),
	('ID20250129112735175', 'MORI721001MVZLZR07', _binary 0xb8fb69691188f86b9bc9f2b6a5f1aced),
	('ID20250129113015529', 'MOXJ380612HVZLXN04', _binary 0x1e064c2c8d662d3cd3d8c9201d9013ea),
	('ID20250129113244217', 'GOMZ020516MVZNLYA0', _binary 0x79349cbc61eb716fc87b503093ef4668),
	('ID20250130105432698', 'EICC910923HVZSBR06', _binary 0x9e24cda9128686065f77629b78b4c6e3),
	('ID20250207145812395', 'CAVM840902MVZMVY02', _binary 0x1fbe29ac715f4a575514cec1b2600b72),
	('ID20250212190550109', 'HEMA020625MDFRRRA4', _binary 0x4ae7363c311381c9b0244fe1ecdc7d53),
	('ID20250212191632900', 'BARL980210HVZRDS02', _binary 0x37781b0a0a60c0f9041516c3f0c2bec8),
	('ID20250212214100379', 'FIGS740420HVZGRR07', _binary 0x0b6d7919bdbf8d482fef20c3f590c5b0),
	('ID20250213023047260', 'FIMA990528MNEGLL04', _binary 0x958511344085c6a03867f98dd9d0e771),
	('ID20250213045236276', 'FIGC710829HVZGRR06', _binary 0x1234cc1148533e0d65e23b822499f193),
	('ID20250213093917370', 'SAMD020904HDFNRLA3', _binary 0xdee498051ec2d04c2816a65ea8039095),
	('ID20250213095009848', 'RUSR520106MVZZLN05', _binary 0x3834c75d033e72d596d187b0c774358b),
	('ID20250213181359933', 'RAGG871106HVZMNR08', _binary 0x08d4053c33c640ca19d8328d6ae834f4),
	('ID20250213195103623', 'MUMA900813MVZXLR00', _binary 0xc408a7b1a278894ff62e9f7f87df4544),
	('ID20250213201805264', 'VIGJ740824HVZLML01', _binary 0x2fdc81f7a4fa428a71c09362d8980e1c);

-- Volcando estructura para función usuarios.LOGIN
DROP FUNCTION IF EXISTS `LOGIN`;
DELIMITER //
CREATE FUNCTION `LOGIN`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IFNULL((SELECT login FROM login WHERE id = iID), CC("NO_DEFINIDO"))//
DELIMITER ;

-- Volcando estructura para tabla usuarios.mensajes
DROP TABLE IF EXISTS `mensajes`;
CREATE TABLE IF NOT EXISTS `mensajes` (
  `id` varchar(50) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  KEY `mensaje` (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Contiene la lista de mensajes posibles que se podrían generar en la gestión de los usuarios';

-- Volcando datos para la tabla usuarios.mensajes: ~41 rows (aproximadamente)
DELETE FROM `mensajes`;
INSERT INTO `mensajes` (`id`, `descripcion`) VALUES
	('NOMBRE_INVALIDO', 'El nombre no es válido'),
	('PAPELLIDO_INVALIDO', 'El primer apellido no es válido'),
	('SAPELLIDO_INVALIDO', 'El segundo apellido no es válido'),
	('FNACIMIENTO_INVALIDA', 'La fecha de nacimiento no es válida'),
	('LOGIN_INVALIDO', 'El login es inválido'),
	('PWD_INVALIDA', 'Contraseña insegura'),
	('GENERO_INVALIDO', 'Genero inválido'),
	('FOTO_INVALIDA', 'Fotografía inválida'),
	('FILTRO_INVALIDO', 'El filtro introducido no es válido'),
	('FINICIO_INVALIDA', 'La fecha de inicio no es válida'),
	('FFIN_INVALIDA', 'La fecha de fin no es válida'),
	('ERROR_DE_PROCESAMIENTO', 'Error de procesamiento, vuelva a intentarlo'),
	('ALTA_EXITOSA', 'Registro de usuario exitoso'),
	('ALTA_FALLIDA', 'Registro de usuario fallido'),
	('BAJA_EXITOSA', 'Baja de usuario exitosa'),
	('BAJA_FALLIDA', 'Baja de usuario fallida'),
	('CAMBIO_EXITOSO', 'Cambio de usuario exitoso'),
	('CAMBIO_FALLIDO', 'Cambio de usuario fallido'),
	('CONSULTA_EXITOSA', 'Consulta exitosa'),
	('CONSULTA_FALLIDA', 'Consulta fallida'),
	('DATOS_INVALIDOS', 'Uno o más datos no son válidos'),
	('LOGIN_EXISTENTE', 'Ya existe el login indicado'),
	('OPERACION_NO_PERMITIDA', 'Error, esta operación no está permitida'),
	('REGISTRO_EXISTENTE', 'Ya existe un registro con los datos indicados'),
	('REGISTRO_INEXISTENTE', 'No existe el registro'),
	('ORDEN_INVALIDO', 'Método de ordenamiento inválido'),
	('PAGINA_INVALIDA', 'El número de página no es válido'),
	('EMAIL_INVALIDO', 'Correo electrónico inválido'),
	('EMAIL_NO_COINCIDE', 'El correo electrónico no coincide'),
	('TELEFONO_INVALIDO', 'El número de teléfono no es válido'),
	('TELEFONO_NO_COINCIDE', 'El número de teléfono no coincide'),
	('PWD_NO_COINCIDE', 'La contraseña no coincide'),
	('ALTAS_ADVERTENCIA', 'Va a registrar al usuario ¿Desea continuar?'),
	('BAJAS_ADVERTENCIA', 'Va a dar de baja al usuario. ¿Desea continuar?'),
	('CAMBIOS_ADVERTENCIA', 'Va a registrar los cambios ¿Desea continuar?'),
	('CONFIRMAR_SETUP_INTERFAZ', '¿Desea conservar la personalización de la interfaz?'),
	('OCR_ERROR', 'El archivo no se pudo procesar correctamente'),
	('OCR_CURP_ADVERTENCIA', 'Va a cargar datos desde un archivo CURP. ¿Desea continua?'),
	('OCR_CURP_EXITO', 'La CURP ha sido procesada correctamente'),
	('SALIR_ADVERTENCIA', 'Va a salir de la aplicación ¿Desea continuar?'),
	('CAMBIAR_PASSWORD_EXITO', 'Cambio de contraseña exitoso');

-- Volcando estructura para función usuarios.NACIMIENTO
DROP FUNCTION IF EXISTS `NACIMIENTO`;
DELIMITER //
CREATE FUNCTION `NACIMIENTO`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(11) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IFNULL((SELECT nacimiento FROM nacimiento WHERE id = iID), CC("NO_DEFINIDO"))//
DELIMITER ;

-- Volcando estructura para tabla usuarios.nacimiento
DROP TABLE IF EXISTS `nacimiento`;
CREATE TABLE IF NOT EXISTS `nacimiento` (
  `id` varchar(50) NOT NULL,
  `nacimiento` date NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `nacimiento_nombre` FOREIGN KEY (`id`) REFERENCES `nombre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.nacimiento: ~20 rows (aproximadamente)
DELETE FROM `nacimiento`;
INSERT INTO `nacimiento` (`id`, `nacimiento`) VALUES
	('ID20240618210545865', '1970-10-19'),
	('ID20241219193220753', '2002-07-25'),
	('ID20250129095044244', '2002-07-25'),
	('ID20250129095634288', '1975-12-05'),
	('ID20250129112547687', '1979-01-01'),
	('ID20250129112735175', '1972-10-01'),
	('ID20250129113015529', '1938-06-12'),
	('ID20250129113244217', '2002-05-16'),
	('ID20250130105432698', '1991-09-23'),
	('ID20250207145812395', '1984-09-02'),
	('ID20250212190550109', '2002-06-25'),
	('ID20250212191632900', '1998-02-10'),
	('ID20250212214100379', '1974-04-20'),
	('ID20250213023047260', '1999-05-28'),
	('ID20250213045236276', '1971-08-29'),
	('ID20250213093917370', '2002-09-04'),
	('ID20250213095009848', '1952-01-06'),
	('ID20250213181359933', '1987-11-06'),
	('ID20250213195103623', '1990-08-13'),
	('ID20250213201805264', '1974-08-24');

-- Volcando estructura para tabla usuarios.nombre
DROP TABLE IF EXISTS `nombre`;
CREATE TABLE IF NOT EXISTS `nombre` (
  `id` varchar(50) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `creacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.nombre: ~20 rows (aproximadamente)
DELETE FROM `nombre`;
INSERT INTO `nombre` (`id`, `nombre`, `creacion`) VALUES
	('ID20240618210545865', 'JORGE MARIO', '2024-06-18 21:05:45'),
	('ID20241219193220753', 'CRISTIAN', '2024-12-19 19:32:20'),
	('ID20250129095044244', 'KAREN ITZEL', '2025-01-29 09:50:44'),
	('ID20250129095634288', 'SIMON', '2025-01-29 09:56:34'),
	('ID20250129112547687', 'JESUS', '2025-01-29 11:25:47'),
	('ID20250129112735175', 'IRMA', '2025-01-29 11:27:35'),
	('ID20250129113015529', 'JUAN', '2025-01-29 11:30:15'),
	('ID20250129113244217', 'ZAYRA LIZETH', '2025-01-29 11:32:44'),
	('ID20250130105432698', 'JOSE CARLOS ', '2025-01-30 10:54:32'),
	('ID20250207145812395', 'MAYTE', '2025-02-07 14:58:12'),
	('ID20250212190550109', 'ARANTZA', '2025-02-12 19:05:50'),
	('ID20250212191632900', 'LUIS ANTONIO', '2025-02-12 19:16:32'),
	('ID20250212214100379', 'SERGIO', '2025-02-12 21:41:00'),
	('ID20250213023047260', 'ALONDRA', '2025-02-13 02:30:47'),
	('ID20250213045236276', 'CARLOS', '2025-02-13 04:52:36'),
	('ID20250213093917370', 'DILAN ENRIQUE', '2025-02-13 09:39:17'),
	('ID20250213095009848', 'REINALDA', '2025-02-13 09:50:09'),
	('ID20250213181359933', 'GERARDO', '2025-02-13 18:13:59'),
	('ID20250213195103623', 'AURORA', '2025-02-13 19:51:03'),
	('ID20250213201805264', 'JULIO CESAR', '2025-02-13 20:18:05');

-- Volcando estructura para función usuarios.NOMBRE
DROP FUNCTION IF EXISTS `NOMBRE`;
DELIMITER //
CREATE FUNCTION `NOMBRE`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(250) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IFNULL((SELECT nombre FROM nombre WHERE id = iID), CC("NO_DEFINIDO"))//
DELIMITER ;

-- Volcando estructura para función usuarios.NOMBRECOMPLETO
DROP FUNCTION IF EXISTS `NOMBRECOMPLETO`;
DELIMITER //
CREATE FUNCTION `NOMBRECOMPLETO`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(1250) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
BEGIN
	DECLARE NO_DEFINIDO VARCHAR(50) DEFAULT CC("NO_DEFINIDO");
	DECLARE nombre VARCHAR(250) DEFAULT NOMBRE(iID);
	DECLARE pApellido VARCHAR(250) DEFAULT PAPELLIDO(iID);
	DECLARE sApellido VARCHAR(250) DEFAULT SAPELLIDO(iID);

	IF pApellido <> NO_DEFINIDO THEN
		SET nombre = CONCAT(nombre, " ", pApellido);
	END IF;

	IF sApellido <> NO_DEFINIDO THEN
		SET nombre = CONCAT(nombre, " ", sApellido);
	END IF;

	RETURN nombre;
END//
DELIMITER ;

-- Volcando estructura para función usuarios.ORDEN
DROP FUNCTION IF EXISTS `ORDEN`;
DELIMITER //
CREATE FUNCTION `ORDEN`(`iORDEN` INT) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IF(iORDEN = CN("ASCENDENTE"), "ASC", "DESC")//
DELIMITER ;

-- Volcando estructura para tabla usuarios.papellido
DROP TABLE IF EXISTS `papellido`;
CREATE TABLE IF NOT EXISTS `papellido` (
  `id` varchar(50) NOT NULL,
  `pApellido` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `papellido_nombre` FOREIGN KEY (`id`) REFERENCES `nombre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.papellido: ~20 rows (aproximadamente)
DELETE FROM `papellido`;
INSERT INTO `papellido` (`id`, `pApellido`) VALUES
	('ID20240618210545865', 'FIGUEROA'),
	('ID20241219193220753', 'SANCHEZ'),
	('ID20250129095044244', 'SANCHEZ'),
	('ID20250129095634288', 'SANCHEZ'),
	('ID20250129112547687', 'GONZALEZ'),
	('ID20250129112735175', 'MOLINA'),
	('ID20250129113015529', 'MOLINA'),
	('ID20250129113244217', 'GONZALEZ'),
	('ID20250130105432698', 'ESPIRITU'),
	('ID20250207145812395', 'CAMACHO'),
	('ID20250212190550109', 'HERNANDEZ'),
	('ID20250212191632900', 'BARRADAS'),
	('ID20250212214100379', 'FIGUEROA'),
	('ID20250213023047260', 'FIGUEROA'),
	('ID20250213045236276', 'FIGUEROA'),
	('ID20250213093917370', 'SANCHEZ'),
	('ID20250213095009848', 'RUIZ'),
	('ID20250213181359933', 'RAMIREZ'),
	('ID20250213195103623', 'MUÑOZ'),
	('ID20250213201805264', 'VILLALBA');

-- Volcando estructura para función usuarios.PAPELLIDO
DROP FUNCTION IF EXISTS `PAPELLIDO`;
DELIMITER //
CREATE FUNCTION `PAPELLIDO`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(250) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IFNULL((SELECT pApellido FROM papellido WHERE id = iID), CC("NO_DEFINIDO"))//
DELIMITER ;

-- Volcando estructura para tabla usuarios.sapellido
DROP TABLE IF EXISTS `sapellido`;
CREATE TABLE IF NOT EXISTS `sapellido` (
  `id` varchar(50) NOT NULL,
  `sApellido` varchar(250) NOT NULL,
  KEY `sApellidos_datosPersonales` (`id`),
  CONSTRAINT `sapellido_nombre` FOREIGN KEY (`id`) REFERENCES `nombre` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Volcando datos para la tabla usuarios.sapellido: ~20 rows (aproximadamente)
DELETE FROM `sapellido`;
INSERT INTO `sapellido` (`id`, `sApellido`) VALUES
	('ID20241219193220753', 'RODRIGUEZ'),
	('ID20250129095634288', 'MENDEZ'),
	('ID20250129112547687', 'MORAN'),
	('ID20250129112735175', 'RUIZ'),
	('ID20250129113015529', 'X'),
	('ID20250130105432698', 'CABAÑAS'),
	('ID20250129095044244', 'RODRIGUEZ'),
	('ID20250129113244217', 'MOLINA'),
	('ID20250207145812395', 'VIVEROS'),
	('ID20250212190550109', 'MARTINEZ'),
	('ID20250212191632900', 'RODRIGUEZ'),
	('ID20250212214100379', 'GARCÍA'),
	('ID20250213023047260', 'MALDONADO'),
	('ID20250213045236276', 'GARCÍA'),
	('ID20250213095009848', 'SALAS'),
	('ID20250213093917370', 'MORALES'),
	('ID20250213181359933', 'GONZALEZ'),
	('ID20250213195103623', 'MALPICA'),
	('ID20250213201805264', 'GOMEZ'),
	('ID20240618210545865', 'GARCÍA');

-- Volcando estructura para función usuarios.SAPELLIDO
DROP FUNCTION IF EXISTS `SAPELLIDO`;
DELIMITER //
CREATE FUNCTION `SAPELLIDO`(`iID` VARCHAR(50) CHARSET utf8mb4) RETURNS varchar(250) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
RETURN IFNULL((SELECT sapellido FROM sapellido WHERE id = iID), CC("NO_DEFINIDO"))//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
