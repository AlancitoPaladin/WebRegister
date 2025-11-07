<?php
require_once("BD.php");

class usuarios extends BD {
    public $ok;
    
    public function __construct() {
        try {
            parent::__construct("localhost", "usuarios", "alancito", "Alan123", 3306);
            $this->ok = true;
        } catch (Exception $e) {
            $this->ok = false;
            error_log("Error usuarios: " . $e->getMessage());
        }
    }

    private function ejecutarSP($sql, $params = []) {
        try {
            $stmt = $this->prepare($sql);
            $stmt->execute($params);
            
            // Intentamos traer resultados si hay SELECT
            $resultado = [];
            if ($stmt->columnCount() > 0) {
                $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            return [
                "ok" => 1,
                "mensaje" => "Operación ejecutada correctamente",
                "data" => $resultado
            ];
        } catch (PDOException $e) {
            return [
                "ok" => 0,
                "error" => "Error ejecutando SP",
                "mensaje" => $e->getMessage()
            ];
        }
    }

    public function ALTAS($datos) {
        $sql = "CALL ALTAS(?, ?, ?, ?, ?, ?, ?, ?)";
        return $this->ejecutarSP($sql, [
            $datos->nombre ?? '',
            $datos->papellido ?? 'NO_DEFINIDO',
            $datos->sapellido ?? 'NO_DEFINIDO',
            $datos->nacimiento ?? 'NO_DEFINIDO',
            $datos->genero ?? 0,
            $datos->login ?? '',
            $datos->pwd ?? '',
            $datos->foto ?? 'NO_DEFINIDO'
        ]);
    }   

    public function BAJAS($datos) {
        $sql = "CALL BAJAS(?)";
        return $this->ejecutarSP($sql, [$datos->id ?? '']);
    }

    public function CAMBIOS($datos) {
        $sql = "CALL CAMBIOS(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return $this->ejecutarSP($sql, [
            $datos->id ?? '',
            $datos->nombre ?? 'NO_DEFINIDO',
            $datos->papellido ?? 'NO_DEFINIDO',
            $datos->sapellido ?? 'NO_DEFINIDO',
            $datos->nacimiento ?? 'NO_DEFINIDO',
            $datos->genero ?? 0,
            $datos->login ?? 'NO_DEFINIDO',
            $datos->pwd ?? 'CLAVE_OCULTA',
            $datos->foto ?? 'NO_DEFINIDO'
        ]);
    }

    public function CONSULTAS($datos) {
        $sql = "CALL CONSULTAS(?)";
        return $this->ejecutarSP($sql, [$datos->orden ?? 1]);
    }

    public function CONSULTAS_LOGIN($datos) {
        $sql = "CALL CONSULTAS_LOGIN(?)";
        return $this->ejecutarSP($sql, [$datos->login ?? '']);
    }

    public function CONSTANTES() {
        $sql = "CALL CONSTANTES()";
        return $this->ejecutarSP($sql);
    }

    public function CONSULTAS_ID($datos) {
    $sql = "CALL CONSULTAS_ID(?)";
    return $this->ejecutarSP($sql, [$datos->id ?? '']);
    }
}
?>