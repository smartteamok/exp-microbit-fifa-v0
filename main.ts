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
    //% block="Puerto 0"
    Puerto0 = 0,
    //% block="Puerto 1"
    Puerto1 = 1,
    //% block="Puerto 2"
    Puerto2 = 2,
    //% block="Puerto 3"
    Puerto3 = 3
}

enum BeatPuertoAnalog {
    //% block="Puerto 0"
    Puerto0 = 0,
    //% block="Puerto 1"
    Puerto1 = 1
}

enum BeatFanAccion {
    //% block="Girar Izq."
    Izquierda = 0,
    //% block="Girar Der."
    Derecha = 1,
    //% block="Parar"
    Parar = 2
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
    //% block="siguelíneas %posicion en %puerto"
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
     * Devuelve texto para mostrar directamente en pantalla.
     */
    //% block="Distancia (cm) en %puerto"
    //% puerto.defl=BeatPuerto.Puerto1
    //% group="Entradas Digitales"
    //% weight=40
    export function leerDistancia(puerto: BeatPuerto): string {
        // Pines fijos para el conector 1 (Ultrasonido)
        pins.digitalWritePin(DigitalPin.P2, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P2, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P2, 0);
        
        let d = pins.pulseIn(DigitalPin.P1, PulseValue.High, 25000);
        if (d == 0) return "0";
        
        return "" + Math.floor(d / 58);
    }

    // --- GRUPO: ACTUADORES ---

    /**
     * Controla el ventilador conectado al Puerto 1 (P2 y P1).
     */
    //% block="Ventilador %accion"
    //% accion.defl=BeatFanAccion.Parar
    //% group="Actuadores"
    //% weight=85
    export function ventilador(accion: BeatFanAccion): void {
        switch (accion) {
            case BeatFanAccion.Izquierda:
                pins.digitalWritePin(DigitalPin.P2, 1);
                pins.digitalWritePin(DigitalPin.P1, 0);
                break;
            case BeatFanAccion.Derecha:
                pins.digitalWritePin(DigitalPin.P2, 0);
                pins.digitalWritePin(DigitalPin.P1, 1);
                break;
            default:
                pins.digitalWritePin(DigitalPin.P2, 0);
                pins.digitalWritePin(DigitalPin.P1, 0);
                break;
        }
    }

    /**
     * Posiciona un servo en el puerto seleccionado.
     */
    //% block="Posicionar servo en %puerto a %grados°"
    //% grados.min=0 grados.max=180 grados.defl=90
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Actuadores"
    //% weight=80
    export function servoPosicionar(puerto: BeatPuerto, grados: number): void {
        const pin = getServoPin(puerto);
        const clamped = clampServoAngle(grados);
        pins.servoWritePin(pin, clamped);
        servoPosiciones[puertoIndex(puerto)] = clamped;
    }

    /**
     * Mueve el servo gradualmente hasta el ángulo deseado.
     */
    //% block="Mover servo en %puerto a %grados° gradualmente cada %ms ms"
    //% grados.min=0 grados.max=180 grados.defl=90
    //% ms.min=1 ms.defl=10
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Actuadores"
    //% weight=75
    export function servoMoverGradual(puerto: BeatPuerto, grados: number, ms: number): void {
        const pin = getServoPin(puerto);
        const target = clampServoAngle(grados);
        const index = puertoIndex(puerto);
        let current = servoPosiciones[index];
        if (ms < 1) ms = 1;
        if (current === target) {
            pins.servoWritePin(pin, target);
            return;
        }
        const step = current < target ? 1 : -1;
        for (let pos = current; pos != target; pos += step) {
            pins.servoWritePin(pin, pos);
            basic.pause(ms);
        }
        pins.servoWritePin(pin, target);
        servoPosiciones[index] = target;
    }

    // --- GRUPO: SENSORES ---

    /**
     * Lee humedad de suelo en el puerto seleccionado.
     */
    //% block="Leer humedad de suelo en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Sensores"
    //% weight=70
    export function leerHumedadSuelo(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee intensidad de luz en el puerto seleccionado.
     */
    //% block="Leer luz en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Sensores"
    //% weight=68
    export function leerLuz(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee potenciómetro en el puerto seleccionado.
     */
    //% block="Leer potenciómetro en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Sensores"
    //% weight=66
    export function leerPotenciometro(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee el estado de un botón táctil digital.
     */
    //% block="Botón táctil en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Sensores"
    //% weight=60
    export function leerBotonTactil(puerto: BeatPuerto): boolean {
        return pins.digitalReadPin(getDigitalPin(puerto)) == 1;
    }

    /**
     * Lee temperatura (°C) del DHT11 y devuelve texto.
     * Devuelve "ERR" si la lectura falla.
     */
    //% block="Temperatura DHT11 (°C) en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Sensores"
    //% weight=58
    export function leerTemperaturaDHT11(puerto: BeatPuerto): string {
        const data = dht11Read(getDigitalPin(puerto));
        if (data.length < 5) return "ERR";
        return "" + data[2];
    }

    /**
     * Lee humedad (%) del DHT11 y devuelve texto.
     * Devuelve "ERR" si la lectura falla.
     */
    //% block="Humedad DHT11 (%) en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Sensores"
    //% weight=56
    export function leerHumedadDHT11(puerto: BeatPuerto): string {
        const data = dht11Read(getDigitalPin(puerto));
        if (data.length < 5) return "ERR";
        return "" + data[0];
    }

    // --- GRUPO: PANTALLA ---

    /**
     * Inicializa el LCD 1602 por I2C.
     */
    //% block="Iniciar LCD 1602"
    //% group="Pantalla"
    //% weight=50
    export function lcdIniciar(): void {
        lcdEnsureInit();
    }

    /**
     * Borra la pantalla LCD 1602.
     */
    //% block="Borrar LCD 1602"
    //% group="Pantalla"
    //% weight=48
    export function lcdBorrar(): void {
        lcdEnsureInit();
        lcdCommand(0x01);
        basic.pause(2);
    }

    /**
     * Muestra texto en la posición (x, y).
     */
    //% block="LCD 1602 mostrar %texto en x %x y %y"
    //% x.min=0 x.max=15 x.defl=0
    //% y.min=0 y.max=1 y.defl=0
    //% group="Pantalla"
    //% weight=46
    export function lcdMostrar(texto: string, x: number, y: number): void {
        lcdEnsureInit();
        lcdSetCursor(x, y);
        const limit = 16;
        for (let i = 0; i < texto.length && i < limit; i++) {
            lcdData(texto.charCodeAt(i));
        }
    }

    // --- UTILIDADES INTERNAS ---

    let lcdInicializado = false;
    const LCD_ADDR = 0x27;
    const LCD_BACKLIGHT = 0x08;
    const LCD_ENABLE = 0x04;
    const servoPosiciones = [90, 90, 90, 90];

    function lcdEnsureInit(): void {
        if (lcdInicializado) return;
        lcdInicializado = true;
        basic.pause(50);
        lcdWrite4(0x30, 0);
        control.waitMicros(4500);
        lcdWrite4(0x30, 0);
        control.waitMicros(4500);
        lcdWrite4(0x30, 0);
        control.waitMicros(150);
        lcdWrite4(0x20, 0);
        lcdCommand(0x28); // 4-bit, 2-line
        lcdCommand(0x0C); // display on
        lcdCommand(0x06); // entry mode
        lcdCommand(0x01); // clear
        basic.pause(2);
    }

    function lcdWrite4(data: number, mode: number): void {
        const value = data | mode | LCD_BACKLIGHT;
        pins.i2cWriteNumber(LCD_ADDR, value | LCD_ENABLE, NumberFormat.Int8LE);
        control.waitMicros(1);
        pins.i2cWriteNumber(LCD_ADDR, value & ~LCD_ENABLE, NumberFormat.Int8LE);
        control.waitMicros(50);
    }

    function lcdSend(value: number, mode: number): void {
        const high = value & 0xF0;
        const low = (value << 4) & 0xF0;
        lcdWrite4(high, mode);
        lcdWrite4(low, mode);
    }

    function lcdCommand(cmd: number): void {
        lcdSend(cmd, 0);
    }

    function lcdData(data: number): void {
        lcdSend(data, 1);
    }

    function lcdSetCursor(x: number, y: number): void {
        const col = clamp(x, 0, 15);
        const row = clamp(y, 0, 1);
        const rowOffsets = [0x00, 0x40];
        lcdCommand(0x80 | (col + rowOffsets[row]));
    }

    function getAnalogPin(puerto: BeatPuertoAnalog): AnalogPin {
        switch (puerto) {
            case BeatPuertoAnalog.Puerto0:
                return AnalogPin.P0;
            default:
                return AnalogPin.P2;
        }
    }

    function getDigitalPin(puerto: BeatPuerto): DigitalPin {
        switch (puerto) {
            case BeatPuerto.Puerto0:
                return DigitalPin.P0;
            case BeatPuerto.Puerto1:
                return DigitalPin.P2;
            case BeatPuerto.Puerto2:
                return DigitalPin.P11;
            default:
                return DigitalPin.P5;
        }
    }

    function getServoPin(puerto: BeatPuerto): AnalogPin {
        return <AnalogPin><number>getDigitalPin(puerto);
    }

    function puertoIndex(puerto: BeatPuerto): number {
        switch (puerto) {
            case BeatPuerto.Puerto0:
                return 0;
            case BeatPuerto.Puerto1:
                return 1;
            case BeatPuerto.Puerto2:
                return 2;
            default:
                return 3;
        }
    }

    function clampServoAngle(value: number): number {
        return clamp(value, 0, 180);
    }

    function clamp(value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function dht11Read(pin: DigitalPin): number[] {
        const data = [0, 0, 0, 0, 0];

        pins.digitalWritePin(pin, 0);
        basic.pause(18);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(30);
        pins.setPull(pin, PinPullMode.PullUp);

        if (pins.pulseIn(pin, PulseValue.Low, 1000) == 0) return [];
        if (pins.pulseIn(pin, PulseValue.High, 1000) == 0) return [];

        for (let i = 0; i < 40; i++) {
            if (pins.pulseIn(pin, PulseValue.Low, 1000) == 0) return [];
            const high = pins.pulseIn(pin, PulseValue.High, 1000);
            if (high == 0) return [];
            const index = i >> 3;
            data[index] <<= 1;
            if (high > 40) data[index] |= 1;
        }

        const checksum = (data[0] + data[1] + data[2] + data[3]) & 0xFF;
        if (checksum != data[4]) return [];
        return data;
    }
}
