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

enum BeatJoystickEje {
    //% block="eje X"
    EjeX = 0,
    //% block="eje Y"
    EjeY = 1,
    //% block="pulsador"
    Pulsador = 2
}

enum BeatPuertoJoystick {
    //% block="Puerto 1"
    Puerto1 = 1
}

enum BeatColorCanal {
    //% block="R"
    Rojo = 0,
    //% block="G"
    Verde = 1,
    //% block="B"
    Azul = 2
}

enum BeatColorDetectado {
    //% block="rojo"
    Rojo = 0,
    //% block="verde"
    Verde = 1,
    //% block="azul"
    Azul = 2
}

enum BeatLedIndex {
    //% block="0"
    Led0 = 0,
    //% block="1"
    Led1 = 1,
    //% block="2"
    Led2 = 2,
    //% block="3"
    Led3 = 3,
    //% block="4"
    Led4 = 4,
    //% block="5"
    Led5 = 5
}

enum BeatLedSeleccion {
    //% block="todos"
    Todos = -1,
    //% block="0"
    Led0 = 0,
    //% block="1"
    Led1 = 1,
    //% block="2"
    Led2 = 2,
    //% block="3"
    Led3 = 3,
    //% block="4"
    Led4 = 4,
    //% block="5"
    Led5 = 5
}

//% color="#ed6a22" weight=100 icon="\uf1e3" block="Beat Mundial"
//% groups='["Configuración","Entradas Digitales","Entradas Analógicas","Motores","Visualización"]'
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

    // --- GRUPO: MOTORES ---

    /**
     * Controla el ventilador conectado al Puerto 1 (P2 y P1).
     */
    //% block="Ventilador %accion"
    //% accion.defl=BeatFanAccion.Parar
    //% group="Motores"
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
    //% group="Motores"
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
    //% group="Motores"
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
    //% block="Humedad de suelo en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Entradas Analógicas"
    //% weight=70
    export function leerHumedadSuelo(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee intensidad de luz en el puerto seleccionado.
     */
    //% block="Intensidad luminosa en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Entradas Analógicas"
    //% weight=68
    export function leerLuz(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee potenciómetro en el puerto seleccionado.
     */
    //% block="Posición potenciómetro en %puerto"
    //% puerto.defl=BeatPuertoAnalog.Puerto0
    //% group="Entradas Analógicas"
    //% weight=66
    export function leerPotenciometro(puerto: BeatPuertoAnalog): number {
        return pins.analogReadPin(getAnalogPin(puerto));
    }

    /**
     * Lee el nivel de R, G o B del sensor de color TCS34725.
     */
    //% block="Nivel de %canal en sensor de color"
    //% canal.defl=BeatColorCanal.Rojo
    //% group="Entradas Analógicas"
    //% weight=65
    export function leerNivelColor(canal: BeatColorCanal): number {
        const rgb = tcs34725ReadRgb();
        switch (canal) {
            case BeatColorCanal.Rojo:
                return tcs34725ToAnalog(rgb[0]);
            case BeatColorCanal.Verde:
                return tcs34725ToAnalog(rgb[1]);
            default:
                return tcs34725ToAnalog(rgb[2]);
        }
    }

    /**
     * Detecta si el color dominante coincide con la selección.
     * Devuelve 1 si coincide, 0 si no.
     */
    //% block="Color detectado es %color"
    //% color.defl=BeatColorDetectado.Rojo
    //% group="Entradas Analógicas"
    //% weight=63
    export function colorDetectado(color: BeatColorDetectado): number {
        const rgb = tcs34725ReadRgb();
        const r = tcs34725ToAnalog(rgb[0]);
        const g = tcs34725ToAnalog(rgb[1]);
        const b = tcs34725ToAnalog(rgb[2]);
        const min = 100;
        let detected = false;
        switch (color) {
            case BeatColorDetectado.Rojo:
                detected = r > min && r > g && r > b;
                break;
            case BeatColorDetectado.Verde:
                detected = g > min && g > r && g > b;
                break;
            default:
                detected = b > min && b > r && b > g;
                break;
        }
        return detected ? 1 : 0;
    }

    /**
     * Lee el joystick del Puerto 1.
     * Eje X y Y devuelven 0-1023, pulsador devuelve 0 o 1.
     */
    //% block="Joystick %eje en %puerto"
    //% eje.defl=BeatJoystickEje.EjeX
    //% puerto.defl=BeatPuertoJoystick.Puerto1
    //% group="Entradas Analógicas"
    //% weight=64
    export function leerJoystick(eje: BeatJoystickEje, puerto: BeatPuertoJoystick): number {
        switch (eje) {
            case BeatJoystickEje.EjeX:
                return pins.analogReadPin(AnalogPin.P1);
            case BeatJoystickEje.EjeY:
                return pins.analogReadPin(AnalogPin.P2);
            default:
                pins.setPull(DigitalPin.P10, PinPullMode.PullUp);
                return pins.digitalReadPin(DigitalPin.P10) == 0 ? 1 : 0;
        }
    }

    /**
     * Lee el estado de un botón táctil digital.
     */
    //% block="Táctil en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Entradas Digitales"
    //% weight=60
    export function leerBotonTactil(puerto: BeatPuerto): boolean {
        return pins.digitalReadPin(getDigitalPin(puerto)) == 1;
    }

    /**
     * Lee el estado de un pulsador digital.
     */
    //% block="Pulsador en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Entradas Digitales"
    //% weight=59
    export function leerPulsador(puerto: BeatPuerto): boolean {
        return pins.digitalReadPin(getDigitalPin(puerto)) == 0;
    }

    /**
     * Lee temperatura (°C) del DHT11 y devuelve texto.
     * Devuelve "ERR" si la lectura falla.
     */
    //% block="Temperatura DHT11 (°C) en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Entradas Digitales"
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
    //% block="Humedad DHT11 en %puerto"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Entradas Digitales"
    //% weight=56
    export function leerHumedadDHT11(puerto: BeatPuerto): string {
        const data = dht11Read(getDigitalPin(puerto));
        if (data.length < 5) return "ERR";
        return "" + data[0];
    }

    // --- GRUPO: PANTALLA ---

    /**
     * Borra la pantalla LCD.
     */
    //% block="Borrar Pantalla LCD"
    //% group="Visualización"
    //% weight=48
    export function lcdBorrar(): void {
        lcdEnsureInit();
        lcdCommand(0x01);
        basic.pause(2);
    }

    /**
     * Muestra texto en la posición (x, y).
     */
    //% block="Pantalla LCD mostrar %texto en x %x y %y"
    //% x.min=0 x.max=15 x.defl=0
    //% y.min=0 y.max=1 y.defl=0
    //% group="Visualización"
    //% weight=46
    export function lcdMostrar(texto: string, x: number, y: number): void {
        lcdEnsureInit();
        lcdSetCursor(x, y);
        const limit = 16;
        for (let i = 0; i < texto.length && i < limit; i++) {
            lcdData(texto.charCodeAt(i));
        }
    }

    /**
     * Enciende toda la tira RGB o un LED con un color.
     */
    //% block="Tira RGB en %puerto mostrar color %color en %led"
    //% color.shadow="colorNumberPicker"
    //% led.defl=BeatLedSeleccion.Todos
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Visualización"
    //% weight=44
    export function tiraRgbColor(puerto: BeatPuerto, color: number, led: BeatLedSeleccion): void {
        const strip = neoPixelStrip(puerto);
        if (led === BeatLedSeleccion.Todos) {
            strip.showColor(color);
            return;
        }
        strip.setPixelColor(<number>led, color);
        strip.show();
    }

    /**
     * Ajusta el color de un LED individual.
     */
    //% block="Tira RGB en %puerto LED %led R %r G %g B %b"
    //% led.defl=BeatLedIndex.Led0
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=0
    //% b.min=0 b.max=255 b.defl=0
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Visualización"
    //% weight=42
    export function tiraRgbLed(puerto: BeatPuerto, led: BeatLedIndex, r: number, g: number, b: number): void {
        const strip = neoPixelStrip(puerto);
        const index = clamp(<number>led, 0, 5);
        strip.setPixelColor(index, neopixel.rgb(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)));
        strip.show();
    }

    /**
     * Apaga la tira RGB.
     */
    //% block="Tira RGB en %puerto apagar"
    //% puerto.defl=BeatPuerto.Puerto0
    //% group="Visualización"
    //% weight=41
    export function tiraRgbApagar(puerto: BeatPuerto): void {
        const strip = neoPixelStrip(puerto);
        strip.clear();
        strip.show();
    }

    // --- UTILIDADES INTERNAS ---

    let lcdInicializado = false;
    const LCD_ADDR = 0x27;
    const LCD_BACKLIGHT = 0x08;
    const LCD_ENABLE = 0x04;
    const TCS34725_ADDR = 0x29;
    const TCS34725_COMMAND = 0x80;
    const TCS34725_ENABLE = 0x00;
    const TCS34725_ATIME = 0x01;
    const TCS34725_CONTROL = 0x0F;
    const TCS34725_STATUS = 0x13;
    const TCS34725_CDATAL = 0x14;
    const TCS34725_RDATAL = 0x16;
    const TCS34725_GDATAL = 0x18;
    const TCS34725_BDATAL = 0x1A;
    const NEOPIXEL_COUNT = 6;
    const servoPosiciones = [90, 90, 90, 90];
    const neoStrips: neopixel.Strip[] = [null, null, null, null];
    let tcs34725Inicializado = false;

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

    function tcs34725Init(): void {
        if (tcs34725Inicializado) return;
        tcs34725Inicializado = true;
        tcs34725Write(TCS34725_ATIME, 0xEB); // ~50ms integration
        tcs34725Write(TCS34725_CONTROL, 0x01); // 4x gain
        tcs34725Write(TCS34725_ENABLE, 0x01); // PON
        control.waitMicros(3000);
        tcs34725Write(TCS34725_ENABLE, 0x03); // PON + AEN
        basic.pause(60);
    }

    function tcs34725Write(reg: number, value: number): void {
        const buf = pins.createBuffer(2);
        buf[0] = TCS34725_COMMAND | reg;
        buf[1] = value & 0xff;
        pins.i2cWriteBuffer(TCS34725_ADDR, buf);
    }

    function tcs34725Read8(reg: number): number {
        pins.i2cWriteNumber(TCS34725_ADDR, TCS34725_COMMAND | reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(TCS34725_ADDR, NumberFormat.UInt8BE);
    }

    function tcs34725Read16(reg: number): number {
        pins.i2cWriteNumber(TCS34725_ADDR, TCS34725_COMMAND | reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(TCS34725_ADDR, NumberFormat.UInt16LE);
    }

    function tcs34725ReadRgb(): number[] {
        tcs34725Init();
        if ((tcs34725Read8(TCS34725_STATUS) & 0x01) == 0) {
            basic.pause(5);
        }
        const r = tcs34725Read16(TCS34725_RDATAL);
        const g = tcs34725Read16(TCS34725_GDATAL);
        const b = tcs34725Read16(TCS34725_BDATAL);
        return [r, g, b];
    }

    function tcs34725ToAnalog(value: number): number {
        return clamp(Math.floor((value * 1023) / 65535), 0, 1023);
    }

    function neoPixelStrip(puerto: BeatPuerto): neopixel.Strip {
        const index = puertoIndex(puerto);
        let strip = neoStrips[index];
        if (!strip) {
            strip = neopixel.create(getDigitalPin(puerto), NEOPIXEL_COUNT, NeoPixelMode.RGB);
            neoStrips[index] = strip;
        }
        return strip;
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
