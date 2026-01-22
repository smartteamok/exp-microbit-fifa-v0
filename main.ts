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

enum BeatPuerto {
    //% block="1"
    Puerto1 = 1
}

//% color="#228B22" weight=100 icon="\uf1e3" block="Beat Mundial"
namespace beatMundial {

    // --- GRUPO: CONFIGURACIÓN ---

    /**
     * Desactiva la matriz de LEDs de la micro:bit.
     * Úsalo en "Al iniciar" para evitar interferencias con el sensor de línea (P10).
     */
    //% block="Deshabilitar matriz LED"
    //% group="Configuración"
    //% weight=100
    export function deshabilitarMatriz(): void {
        led.enable(false);
    }

    /**
     * Activa la matriz de LEDs de la micro:bit.
     */
    //% block="Habilitar matriz LED"
    //% group="Configuración"
    //% weight=99
    export function habilitarMatriz(): void {
        led.enable(true);
    }

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
        let pwm = pins.map(velocidad, 0, 100, 0, 1023);
        if (pwm < 0) pwm = 0; 
        if (pwm > 1023) pwm = 1023;

        // AJUSTE DE LÓGICA (Corrección Usuario):
        // Motor Izquierdo (Bloque) -> Ahora controla P13/P14 (Físico)
        // Motor Derecho (Bloque)   -> Ahora controla P15/P16 (Físico)
        
        // DIRECCIONES INVERTIDAS:
        // P13 (Nuevo Izq): Antes Adelante=0 -> Ahora Adelante=1
        // P15 (Nuevo Der): Antes Adelante=1 -> Ahora Adelante=0

        let dirIzq = 0; 
        let dirDer = 0;
        let pwmIzq = pwm;
        let pwmDer = pwm;

        switch (direccion) {
            case BeatDireccion.Adelante:
                dirIzq = 1; // P13 en 1 para avanzar
                dirDer = 0; // P15 en 0 para avanzar
                break;
            case BeatDireccion.Atras:
                dirIzq = 0; // P13 en 0 para retroceder
                dirDer = 1; // P15 en 1 para retroceder
                break;
            case BeatDireccion.Izquierda:
                // Giro sobre eje a la izquierda: Izq Atrás, Der Adelante
                dirIzq = 0; 
                dirDer = 0; 
                break;
            case BeatDireccion.Derecha:
                // Giro sobre eje a la derecha: Izq Adelante, Der Atrás
                dirIzq = 1; 
                dirDer = 1; 
                break;
        }

        // Aplicar lógica al MOTOR IZQUIERDO (Ahora mapeado a P13/P14)
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Izquierdo) {
            pins.digitalWritePin(DigitalPin.P13, dirIzq);
            pins.analogWritePin(AnalogPin.P14, pwmIzq);
        }

        // Aplicar lógica al MOTOR DERECHO (Ahora mapeado a P15/P16)
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Derecho) {
            pins.digitalWritePin(DigitalPin.P15, dirDer);
            pins.analogWritePin(AnalogPin.P16, pwmDer);
        }
    }

    /**
     * Detiene los motores seleccionados.
     */
    //% block="Parar %motor"
    //% group="Motores"
    //% weight=70
    export function parar(motor: BeatMotor): void {
        // Apagar Izquierdo (P14 PWM)
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Izquierdo) {
            pins.analogWritePin(AnalogPin.P14, 0);
        }
        // Apagar Derecho (P16 PWM)
        if (motor === BeatMotor.Ambos || motor === BeatMotor.Derecho) {
            pins.analogWritePin(AnalogPin.P16, 0);
        }
    }

    // --- GRUPO: ENTRADAS DIGITALES ---

    /**
     * Comprueba la posición de la línea en el pin 1.
     */
    //% block="siguelíneas %posicion en pin %puerto"
    //% puerto.defl=BeatPuerto.Puerto1
    //% group="Entradas Digitales"
    //% weight=50
    export function siguelineas(posicion: BeatPosicionLinea, puerto: BeatPuerto): boolean {
        // Pines fijos para el conector 1
        let valIzq = pins.analogReadPin(AnalogPin.P10);
        let valCen = pins.analogReadPin(AnalogPin.P1);
        let valDer = pins.analogReadPin(AnalogPin.P2);
        
        const UMBRAL = 30;

        switch (posicion) {
            case BeatPosicionLinea.Izquierda:
                return (valIzq <= UMBRAL && valDer > UMBRAL && valCen > UMBRAL);
            
            case BeatPosicionLinea.Centro:
                return (valCen <= UMBRAL && valIzq > UMBRAL && valDer > UMBRAL);
            
            case BeatPosicionLinea.Derecha:
                return (valDer <= UMBRAL && valIzq > UMBRAL && valCen > UMBRAL);
            
            case BeatPosicionLinea.Ninguna:
                return (valDer > UMBRAL && valIzq > UMBRAL && valCen > UMBRAL);
        }
        return false;
    }

    /**
     * Lee la distancia en cm usando el sensor ultrasónico conectado al pin 1.
     */
    //% block="Leer distancia (cm) en pin %puerto"
    //% puerto.defl=BeatPuerto.Puerto1
    //% group="Entradas Digitales"
    //% weight=40
    export function leerDistancia(puerto: BeatPuerto): number {
        // Pines fijos para el conector 1 (Ultrasonido)
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