/**
 * Bloques personalizados para el Kit de Robótica FIFA - Versión v0
 */

enum Motor {
    //% block="Izquierdo"
    Izquierdo,
    //% block="Derecho"
    Derecho,
    //% block="Ambos"
    Ambos
}

enum Direccion {
    //% block="Adelante"
    Adelante,
    //% block="Atrás"
    Atras
}

enum SensorLinea {
    //% block="Izquierda (P10)"
    Izquierda = AnalogPin.P10,
    //% block="Centro (P1)"
    Centro = AnalogPin.P1,
    //% block="Derecha (P2)"
    Derecha = AnalogPin.P2
}

//% color="#E63022" weight=100 icon="\uf1ec" block="Robótica FIFA"
namespace roboticaFifa {

    /**
     * Controla la velocidad y dirección de los motores.
     * La velocidad va de 0 a 100.
     */
    //% block="mover motor %motor %direccion velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% weight=90
    export function moverMotor(motor: Motor, direccion: Direccion, velocidad: number): void {
        // Mapeamos 0-100 a 0-1023 usando la función nativa de pines
        let pwm = pins.map(velocidad, 0, 100, 0, 1023);
        
        // Limite de seguridad
        if (pwm < 0) pwm = 0;
        if (pwm > 1023) pwm = 1023;

        // --- MOTOR IZQUIERDO (P15 Dir, P16 Vel) ---
        // Lógica: Avanzar P15=1, Retroceder P15=0
        if (motor == Motor.Izquierdo || motor == Motor.Ambos) {
            let dirValue = (direccion == Direccion.Adelante) ? 1 : 0;
            pins.digitalWritePin(DigitalPin.P15, dirValue);
            pins.analogWritePin(AnalogPin.P16, pwm);
        }

        // --- MOTOR DERECHO (P13 Dir, P14 Vel) ---
        // Lógica: Avanzar P13=0, Retroceder P13=1 (Inverso al izquierdo)
        if (motor == Motor.Derecho || motor == Motor.Ambos) {
            let dirValue = (direccion == Direccion.Adelante) ? 0 : 1;
            pins.digitalWritePin(DigitalPin.P13, dirValue);
            pins.analogWritePin(AnalogPin.P14, pwm);
        }
    }

    /**
     * Detiene los motores suavemente.
     */
    //% block="parar motor %motor"
    //% weight=85
    export function pararMotor(motor: Motor): void {
        if (motor == Motor.Izquierdo || motor == Motor.Ambos) {
            pins.analogWritePin(AnalogPin.P16, 0);
        }
        if (motor == Motor.Derecho || motor == Motor.Ambos) {
            pins.analogWritePin(AnalogPin.P14, 0);
        }
    }

    /**
     * Lee la distancia en cm usando el sensor ultrasónico.
     * Nota: Por defecto usa pines P2 (Trig) y P1 (Echo).
     */
    //% block="distancia ultrasónico (cm)"
    //% weight=80
    export function leerDistancia(): number {
        // Pines fijos
        let trig = DigitalPin.P2;
        let echo = DigitalPin.P1;

        // Generar pulso de trigger
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // Leer eco (Max 25ms espera)
        let d = pins.pulseIn(echo, PulseValue.High, 25000);
        
        if (d == 0) return 0;
        
        // Calcular distancia cm: tiempo / 58
        return Math.floor(d / 58);
    }

    /**
     * Devuelve el valor analógico (0-1023) del sensor de línea seleccionado.
     * Negro suele ser > 30 (valor alto) y Blanco < 30 (valor bajo).
     */
    //% block="leer línea %sensor"
    //% weight=70
    export function leerLinea(sensor: SensorLinea): number {
        return pins.analogReadPin(sensor);
    }

    /**
     * Devuelve verdadero si detecta línea negra (basado en umbral).
     */
    //% block="¿detecta línea en %sensor?"
    //% weight=65
    export function detectarLinea(sensor: SensorLinea): boolean {
        // Asumimos negro > 50 (margen de seguridad sobre el 30 de la doc)
        return pins.analogReadPin(sensor) > 50;
    }
}