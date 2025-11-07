<?php
class BD extends PDO {
    public $ok = true;
    public function __construct($Servidor, $BD, $Usuario = "", $Password = "") {
        try {
            parent::__construct('mysql:host=' . $Servidor . ';dbname=' . $BD, $Usuario, $Password);
            $this->exec("SET NAMES 'utf8'");  // Para el manejo de los acentos y demás
        } catch (Exception $e) { $this->ok = false; }
    }
    public function CONSULTAR($datos) {
        $consulta = $datos->servicio;
        
        if (method_exists($this, $consulta)) {
            $query = $this->$consulta($datos);
            
            // If the method returned an array (already-executed result), return it directly
            if (is_array($query)) {
                return $query;
            }
            // Otherwise, assume it's a SQL string and execute it
            else {
                $res = $this->query($query);
                return $res ? $this->getData($res) : [];
            }
        } else {
            echo get_class($this) . " - Consulta no reconocida";
        }
    }

		protected function getData($data) {
			$registros = [];

			if($data->setFetchMode(PDO::FETCH_ASSOC)){
				while($fila = $data->fetch()){
					$registro = new stdClass();
					foreach ($fila as $campo => $valor)
						$registro->{$campo} = $this->getValor($valor);
					array_push($registros, $registro);
				}
			}
			return count($registros) == 1 ? $registros[0] : $registros;
		}

			protected function getValor($valor){
				if(preg_match('/^[0]+[1-9][0-9]*$/', $valor)) return strval($valor);
				elseif(is_numeric($valor)) return $this->esFlotante($valor) ? floatval($valor) : intval($valor);
				elseif(is_string($valor) && ($valor == "true" || $valor == "false")) return $valor == "true" ? true : false;
				elseif(is_string($valor)) return strval($valor);
				elseif(is_bool($valor)) return boolval($valor);
			}

				protected function esFlotante($valor){
					return preg_match("/^[-]*[0-9]*+\.[0-9]*$/", $valor);
				}
}
?>