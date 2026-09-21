# QA Automation Framework - API Testing

Este repositorio contiene un framework de automatización de pruebas API para `restful-api.dev`. Está construido con **Playwright + TypeScript**, y cumple con una arquitectura por capas orientada a mantenimiento, trazabilidad, validación de contratos y resiliencia para fallos de red.

## 1. Justificación técnica de las herramientas

### Lenguaje: TypeScript
Se eligió TypeScript porque permite:
- tipado fuerte y mejor mantenibilidad del código
- menos errores en integración de endpoints y payloads
- escalabilidad y legibilidad en proyectos de automatización API
- compatibilidad directa con Playwright y Node.js

### Librería de API / framework: Playwright Test
Se eligió Playwright porque:
- ofrece soporte nativo para requests HTTP con `APIRequestContext`
- facilita validación de headers, status code y tiempos de respuesta
- ofrece reportería HTML nativa
- permite ejecución paralela y configuración de CI/CD
- es adecuado para tests funcionales y de integridad de API

### Gestor de dependencias: npm
Se usa npm por su integración nativa con Node.js y con Playwright, además de ser el estándar del ecosistema JavaScript para proyectos de automatización.

### Test Runner: Playwright Test
Se usó Playwright Test porque permite:
- ejecutar validaciones por suite y por caso
- organizar pruebas con `describe`, `test`, `beforeEach`
- integrar fácilmente con reportes y artefactos
- mantener estructuras tipo BDD/QA con buena trazabilidad

### Reportería: Playwright HTML + Nodemailer
Se eligió esta combinación porque:
- el HTML report de Playwright es nativo y fácil de interpretar
- el archivo puede compartirse como artefacto en CI
- el envío por correo agrega trazabilidad operativa para equipos de QA

## 2. Arquitectura y diseño

La estructura del proyecto está organizada por capas para separar responsabilidades:

- `src/builders/`: patrón Builder para crear payloads dinámicos
- `src/services/`: centraliza endpoints y peticiones HTTP
- `src/schemas/`: validación del contrato JSON mediante JSON Schema
- `utils/`: validadores, reporte por correo y logger estructurado
- `data/`: datos de prueba externos
- `tests/`: casos de validación funcional y de excepción

## 3. Requisitos funcionales cubiertos

### Patrón Builder
El proyecto usa `DeviceBuilder` para construir payloads sin hardcode, con propiedades dinámicas y reutilizables.

### Centralización de endpoints
La lógica de las llamadas HTTP se concentra en `DeviceService`, evitando duplicación y manteniendo la base URL y los endpoints en un único punto de cambio.

### Validación de JSON
Se utiliza AJV para validar la estructura de la respuesta de la API contra un esquema predefinido.

### Aserciones sobre status, body, SLA y headers
Se validan:
- status code
- estructura del body
- tiempos de respuesta
- headers `Content-Type` y otros relevantes

### Manejo de errores y reintentos
El servicio implementa un wrapper de reintentos para cubrir:
- errores de red
- errores 5xx
- timeouts
- fallos de parse JSON

### Logs de request/response y trazabilidad
El logger guarda en archivo y también imprime por consola la información relevante de cada ejecución, incluyendo headers y body.

### Docker
El proyecto está preparado para ejecutarse mediante Docker y Docker Compose.

### GitHub Actions
Existe una pipeline de integración continua para ejecutar pruebas automáticamente en cada push o pull request.

## 4. Configuración previa

1. Clonar el repositorio.
2. Ejecutar:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz con contenido similar a:

```env
BASE_URL=https://api.restful-api.dev
API_KEY=tu_api_key
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_RECEIVER=correo_destino@gmail.com
```

## 5. Ejecución local

### Ejecutar la suite
```bash
npm run test
```

### Ejecutar suite completa con envío de correo
```bash
npm run test:full
```

## 6. Ejecución con Docker

```bash
docker compose up --build
```

## 7. Integración con GitHub Actions

El flujo definido en `.github/workflows/api-tests.yml`:
- instala dependencias
- prepara Playwright
- ejecuta la suite
- sube el artefacto del reporte HTML
- deja el proyecto listo para integración continua

## 8. Consideraciones sobre la API

Durante la implementación se observó que la API pública de ejemplo puede rechazar algunas rutas o autenticaciones según el endpoint utilizado. Por ello, el proyecto usa la colección específica `qa-automation-framework` con la estructura recomendada por la API para mantener el entorno de pruebas consistente y con autenticación por `x-api-key`.

## 9. Requisitos no funcionales y mejoras adicionales

El proyecto ya contempla las siguientes mejoras para robustez:
- reintentos automáticos
- logs persistentes
- validación JSON
- reportes HTML
- integración con CI/CD
- entorno configurable con variables externas

Asimismo, se puede ampliar en futuras iteraciones con:
- autenticación dinámica Bearer/OAuth2
- manejo de entorno por profiles (dev, qa, prod)
- configuración de Slack/Jira/Xray
- reintentos más avanzados con backoff por tipo de error
- separación de payloads por CSV/JSON/YAML

## 10. Ejemplo de arquitectura de ejecución

La suite sigue este flujo:

1. lectura de datos externos desde JSON o variables de entorno
2. construcción del payload por Builder
3. ejecución del request a través del servicio
4. validación del esquema y del status code
5. escritura de logs
6. generación de reporte
7. envío opcional por correo

## 11. Notas finales

El proyecto representa una base sólida para automatización API con Playwright, combinando buenas prácticas de calidad, trazabilidad y despliegue en entorno de CI. La estructura permite escalar fácilmente si se requiere agregar más endpoints, más validaciones o más escenarios de negocio.