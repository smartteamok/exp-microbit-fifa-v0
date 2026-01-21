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
    //% block="izquierda"
    Izquierda,
    //% block="centro"
    Centro,
    //% block="derecha"
    Derecha,
    //% block="ninguna (todos negro)"
    Ninguna
}

//% color="#228B22" weight=100 icon="\uf1e3" block="Beat Mundial"
namespace beatMundial {

    // --- GRUPO: MOTORES ---

    /**
     * Mueve el robot en la dirección indicada a velocidad media (50%).
     */
    //% block="Mover %direccion %motor"
    //% motor.defl=BeatMotor.Ambos
    //% group="Motores"
    //% weight=90
    export function mover(direccion: BeatDireccion, motor: BeatMotor): void {
        moverVelocidad(direccion, motor, 50);
    }

    /**
     * Mueve el robot controlando dirección y velocidad (0 a 100).
     */
    //% block="Mover %direccion %motor con velocidad %velocidad"
    //% motor.defl=BeatMotor.Ambos
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=100
    //% group="Motores"
    //% weight=80
    export function moverVelocidad(direccion: BeatDireccion, motor: BeatMotor, velocidad: number): void {
        // Mapear 0-100 a PWM 0-1023
        let pwm = pins.map(velocidad, 0, 100, 0, 1023);
        if (pwm < 0) pwm = 0; 
        if (pwm > 1023) pwm = 1023;

        // Pines según documentación:
        // Motor Izq: P15 (Dir), P16 (PWM). Avanzar=1
        // Motor Der: P13 (Dir), P14 (PWM). Avanzar=0 (Invertido)

        let dirIzq = 0; 
        let dirDer = 0;
        let pwmIzq = pwm;
        let pwmDer = pwm;

        // Definir lógica de direcciones
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

        // Aplicar a Motor Izquierdo
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Izquierdo) {
            pins.digitalWritePin(DigitalPin.P15, dirIzq);
            pins.analogWritePin(AnalogPin.P16, pwmIzq);
        }

        // Aplicar a Motor Derecho
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Derecho) {
            pins.digitalWritePin(DigitalPin.P13, dirDer);
            pins.analogWritePin(AnalogPin.P14, pwmDer);
        }
    }

    /**
     * Detiene los motores seleccionados.
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

    // --- GRUPO: ENTRADAS DIGITALES ---

    /**
     * Comprueba si el sensor indicado detecta línea negra.
     * Umbral: Negro > 30.
     */
    //% block="siguelíneas %posicion"
    //% group="Entradas Digitales"
    //% weight=50
    export function siguelineas(posicion: BeatPosicionLinea): boolean {
        // Lectura de pines (P10=Izq, P1=Cen, P2=Der)
        let valIzq = pins.analogReadPin(AnalogPin.P10);
        let valCen = pins.analogReadPin(AnalogPin.P1);
        let valDer = pins.analogReadPin(AnalogPin.P2);
        
        // Umbral según documentación: Blanco <= 30. Asumimos Negro > 30.
        const UMBRAL = 30;

        switch (posicion) {
            case BeatPosicionLinea.Izquierda:
                return (valIzq > UMBRAL);
            
            case BeatPosicionLinea.Centro:
                return (valCen > UMBRAL);
            
            case BeatPosicionLinea.Derecha:
                return (valDer > UMBRAL);
            
            case BeatPosicionLinea.Ninguna:
                // Retorna verdadero si TODOS detectan línea (negro)
                return (valIzq > UMBRAL && valCen > UMBRAL && valDer > UMBRAL);
        }
        return false;
    }

    /**
     * Lee la distancia en cm usando el sensor ultrasónico.
     * Pines: Trig P2, Echo P1.
     */
    //% block="Leer distancia (cm)"
    //% group="Entradas Digitales"
    //% weight=40
    export function leerDistancia(): number {
        // Pines fijos P2/P1
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