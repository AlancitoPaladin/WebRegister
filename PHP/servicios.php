<?php
header('Content-Type: text/html; charset=UTF-8');
spl_autoload_register(function ($class) {
	if(file_exists("./$class.php"))
		require_once("./$class.php");
});

class servicios {
	private $datos;
	private $ambitos;

	public function __construct($DATA) {
		try {
			$this->datos = json_decode($DATA);
			$this->ambitos = [$this, new usuarios()];
		}
		catch(Exception $e) { $this->datos = new stdClass(); }; // Objeto vacío

		if(property_exists($this->datos, "servicio")) {
			$ambito =  $this->ambitoOk();

			if($ambito) {
				// Requerido para la ejecución dinámica del método correspondiente al servicio
				$servicio =  $this->datos->servicio;

				// Si el ámbito resultante tiene el método CONSULTAR significa que se trata de una de base de datos,
				// en este caso, se tiene que ejecutar la consulta a la BD.
				// Si el ámbito resultante no poseé al método CONSULTAR, asumimos que se trata del ámbito de la clase
				// en consecuencia se ejecutará un método sobre el objeto this.
				$resultado = method_exists($ambito, "CONSULTAR") ? $ambito->CONSULTAR($this->datos) : $ambito->$servicio($this->datos);

				// Retorno el resultado al cliente en formato JSON
				echo json_encode($resultado);
			}
		}
		else echo "Servicio desconocido";
	}

	private function ambitoOk() {
		foreach ($this->ambitos as $ambito)
			if(method_exists($ambito, $this->datos->servicio))
				return $ambito;
		return false;
	}

	private function MINUSCULAS($datos) {
		foreach($datos as $atributo => $valor) // Recorro los atributos del objeto
			if(is_string($atributo)) // Identifico los datos de tipo String
				$datos->$atributo = strtolower($valor); // Convierto a mayúsculas
		return $datos;
	}
}

// De esta forma, permito que otras fuentes puedan interactuar con el server
$handle = fopen('php://input','r');
$jsonInput = fgets($handle);
new servicios($jsonInput);