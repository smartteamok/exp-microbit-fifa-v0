/**
 * Bloques personalizados para Beat Mundial
 */

enum BeatMotor {
    //% block="Ambos"
    Ambos = 0,
    //% block="Motor Izq."
    Izquierdo = 1,
    //% block="Motor Der."
    Derecho = 2
}

enum BeatDireccion {
    //% block="adelante"
    Adelante = 0,
    //% block="atrás"
    Atras = 1,
    //% block="izquierda"
    Izquierda = 2,
    //% block="derecha"
    Derecha = 3
}

enum BeatPosicionLinea {
    //% block="Izquierda"
    Izquierda,
    //% block="Centro"
    Centro,
    //% block="Derecha"
    Derecha,
    //% block="Ninguna / Otra"
    Ninguna
}

//% color="#228B22" weight=100 icon="\uf1e3" block="Beat Mundial"
namespace beatMundial {

    // --- GRUPO: MOTORES ---

    /**
     * Mueve el robot en la dirección indicada a una velocidad por defecto (50%).
     */
    //% block="Mover %direccion %motor"
    //% motor.defl=BeatMotor.Ambos
    //% group="Motores"
    //% weight=90
    export function mover(direccion: BeatDireccion, motor: BeatMotor): void {
        moverVelocidad(direccion, motor, 50);
    }

    /**
     * Mueve el robot con velocidad controlada (0 a 100).
     */
    //% block="Mover %direccion %motor con velocidad %velocidad"
    //% motor.defl=BeatMotor.Ambos
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=100
    //% group="Motores"
    //% weight=80
    export function moverVelocidad(direccion: BeatDireccion, motor: BeatMotor, velocidad: number): void {
        let pwm = pins.map(velocidad, 0, 100, 0, 1023);
        if (pwm < 0) pwm = 0; if (pwm > 1023) pwm = 1023;

        // Pines según documentación 
        // Motor Izquierdo: P15 (Dir), P16 (PWM). Adelante=1, Atrás=0.
        // Motor Derecho:   P13 (Dir), P14 (PWM). Adelante=0, Atrás=1.

        let dirIzq = 0; 
        let dirDer = 0;
        let pwmIzq = pwm;
        let pwmDer = pwm;

        // Definir direcciones lógicas
        switch (direccion) {
            case BeatDireccion.Adelante:
                dirIzq = 1; dirDer = 0; // Ambos avanzan
                break;
            case BeatDireccion.Atras:
                dirIzq = 0; dirDer = 1; // Ambos retroceden
                break;
            case BeatDireccion.Izquierda:
                dirIzq = 0; dirDer = 0; // Izq atrás, Der adelante (Giro s/eje)
                break;
            case BeatDireccion.Derecha:
                dirIzq = 1; dirDer = 1; // Izq adelante, Der atrás (Giro s/eje)
                break;
        }

        // Aplicar a los motores seleccionados
        // Si se elige un solo motor, ignoramos los giros "izquierda/derecha" y aplicamos adelante/atras relativo al motor
        
        // Motor Izquierdo
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Izquierdo) {
            // Si es giro y solo seleccionó motor izquierdo, forzamos comportamiento seguro (o silencio)
            // Aquí aplicamos la lógica calculada arriba.
            pins.digitalWritePin(DigitalPin.P15, dirIzq);
            pins.analogWritePin(AnalogPin.P16, pwmIzq);
        }

        // Motor Derecho
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Derecho) {
            pins.digitalWritePin(DigitalPin.P13, dirDer);
            pins.analogWritePin(AnalogPin.P14, pwmDer);
        }
    }

    /**
     * Detiene los motores.
     */
    //% block="Parar %motor"
    //% group="Motores"
    //% weight=70
    export function parar(motor: BeatMotor): void {
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Izquierdo) {
            pins.analogWritePin(AnalogPin.P16, 0);
        }
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Derecho) {
            pins.analogWritePin(AnalogPin.P14, 0);
        }
    }

    // --- GRUPO: ENTRADAS DIGITALES (Sensores) ---

    /**
     * Determina la posición de la línea negra basándose en la lógica del documento.
     * Izquierda (P10), Centro (P1), Derecha (P2).
     * Devuelve: Izquierda, Centro, Derecha o Ninguna.
     */
    //% block="Leer estado línea"
    //% group="Entradas Digitales"
    //% weight=50
    export function leerEstadoLinea(): BeatPosicionLinea {
        // Pines definidos en la documentación 
        let valIzq = pins.analogReadPin(AnalogPin.P10);
        let valCen = pins.analogReadPin(AnalogPin.P1);
        let valDer = pins.analogReadPin(AnalogPin.P2);

        // Lógica de validación exacta del documento:
        // "Validación: detección color blanco con menor o igual a 30."
        
        // Caso Derecha: if (seguidorDerecha <= 30 && (seguidorIzquierda > 30 && seguidorCentro > 30))
        if (valDer <= 30 && valIzq > 30 && valCen > 30) {
            return BeatPosicionLinea.Derecha;
        }

        // Caso Centro: if (seguidorDerecha > 30 && (seguidorIzquierda > 30 && seguidorCentro > 30))
        if (valDer > 30 && valIzq > 30 && valCen > 30) {
            return BeatPosicionLinea.Centro;
        }

        // Caso Izquierda: if (seguidorIzquierda <= 30 && (seguidorDerecha > 30 && seguidorCentro > 30))
        if (valIzq <= 30 && valDer > 30 && valCen > 30) {
            return BeatPosicionLinea.Izquierda;
        }

        return BeatPosicionLinea.Ninguna;
    }

    /**
     * Lee la distancia en cm (Ultrasonido).
     */
    //% block="Leer distancia (cm)"
    //% group="Entradas Digitales"
    //% weight=40
    export function leerDistancia(): number {
        // Pines P2 (Trig) y P1 (Echo) 
        pins.digitalWritePin(DigitalPin.P2, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P2, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P2, 0);
        
        let d = pins.pulseIn(DigitalPin.P1, PulseValue.High, 25000);
        if (d == 0) return 0;
        return Math.floor(d / 58);
    }
}