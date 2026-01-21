```markdown
# Extensión Robótica FIFA (v0)

Este paquete permite controlar de forma sencilla el kit de robótica educativa basado en la placa de expansión micro:bit v2. Incluye control de motores y lectura de sensores básicos.

## 🔌 Conexiones de Hardware

La extensión asume la siguiente configuración de pines según la placa de expansión:

### Motores DC
| Motor | Pin Dirección | Pin Velocidad (PWM) |
| :--- | :--- | :--- |
| **Izquierdo** | P15 | P16 |
| **Derecho** | P13 | P14 |

### Sensores
| Sensor | Pines | Notas |
| :--- | :--- | :--- |
| **Ultrasonido** | Trig: P2, Echo: P1 | Conector dedicado |
| **Seguidor de Línea** | Izq: P10, Centro: P1, Der: P2 | Conector de 3 sensores |

> **⚠️ CONFLICTO DE PINES IMPORTANTE:**
> El sensor **Ultrasonido** y el **Seguidor de Línea** comparten los pines **P1 y P2**.
> * **NO** conectes ambos sensores físicamente al mismo tiempo.
> * **NO** uses bloques de "Ultrasonido" y "Seguidor de Línea (Centro/Derecha)" en el mismo programa, o tendrás lecturas erróneas.

---

## 🚀 Uso

### Control de Motores
Mueve el robot controlando ambos motores o cada uno individualmente. La velocidad es de 0 a 100%.

```typescript
// Mover hacia adelante al 50% de velocidad
roboticaFifa.moverMotor(Motor.Ambos, Direccion.Adelante, 50)

// Girar (Motor izquierdo adelante, derecho atrás)
roboticaFifa.moverMotor(Motor.Izquierdo, Direccion.Adelante, 40)
roboticaFifa.moverMotor(Motor.Derecho, Direccion.Atras, 40)

// Parar después de 1 segundo
basic.pause(1000)
roboticaFifa.pararMotor(Motor.Ambos)

```

### Sensor de Distancia (Ultrasonido)

Lee la distancia en centímetros frente al robot.

```typescript
let distancia = roboticaFifa.leerDistancia()
if (distancia < 15 && distancia > 0) {
    roboticaFifa.pararMotor(Motor.Ambos)
}

```

### Seguidor de Línea

Detecta líneas negras sobre fondo blanco. Devuelve `true` si detecta negro.

```typescript
// Ejemplo básico de seguidor de línea
if (roboticaFifa.detectarLinea(SensorLinea.Centro)) {
    // Si el centro ve negro, avanzar
    roboticaFifa.moverMotor(Motor.Ambos, Direccion.Adelante, 30)
} else {
    // Si no, buscar línea (girar suave)
    roboticaFifa.moverMotor(Motor.Izquierdo, Direccion.Adelante, 30)
    roboticaFifa.moverMotor(Motor.Derecho, Direccion.Atras, 30)
}

```

---

## 🛠 Solución de Problemas

1. **El robot gira en lugar de ir recto:**
* Es posible que un motor esté conectado al revés. Verifica los cables rojo/negro en la bornera, o usa el bloque con dirección opuesta para ese motor específico.


2. **El ultrasonido devuelve siempre 0:**
* Revisa que el interruptor de la batería esté encendido (la micro:bit por sí sola a veces no da suficiente energía al sensor).
* Asegúrate de no tener el seguidor de línea conectado interfiriendo en los pines P1/P2.


3. **El seguidor de línea no detecta nada:**
* Ajusta la altura del sensor al suelo (idealmente entre 5mm y 1cm).
* Asegúrate de que la superficie tenga buen contraste (negro mate sobre blanco brillante).



## Licencia

MIT

```

```