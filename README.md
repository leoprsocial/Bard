# Sistema de Seguimiento de Tareas

Sistema completo de gestión y seguimiento de tareas con plantilla Excel, base de datos SQLite y dashboard web interactivo.

## Características

- **📊 Dashboard Web Interactivo**: Interfaz moderna y responsive para gestión de tareas
- **📝 Plantilla Excel**: Archivo Excel personalizado con formato y validaciones
- **💾 Base de Datos SQLite**: Almacenamiento persistente de datos
- **🔄 Importación/Exportación**: Scripts para sincronizar datos entre Excel y la base de datos
- **📈 Estadísticas en Tiempo Real**: Visualización de métricas y progreso
- **🎯 API REST Completa**: Endpoints para operaciones CRUD

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/leoprsocial/Bard.git
cd Bard
```

2. Instalar dependencias:
```bash
npm install
```

3. Inicializar la base de datos:
```bash
npm run init-db
```

4. Crear la plantilla Excel:
```bash
npm run create-template
```

## Uso

### Iniciar el Servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Modo Desarrollo (con auto-restart)

```bash
npm run dev
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia el servidor en modo desarrollo |
| `npm run init-db` | Inicializa la base de datos con datos de ejemplo |
| `npm run create-template` | Genera la plantilla Excel |
| `npm run export-excel` | Exporta tareas de BD a Excel |
| `npm run import-excel -- archivo.xlsx` | Importa tareas desde Excel a BD |

## Estructura del Proyecto

```
Bard/
├── public/              # Archivos del dashboard web
│   ├── index.html      # Página principal
│   ├── styles.css      # Estilos CSS
│   └── app.js          # Lógica del frontend
├── scripts/            # Scripts de utilidad
│   ├── init-db.js      # Inicialización de BD
│   ├── create-template.js  # Creación de plantilla
│   ├── export-excel.js # Exportación a Excel
│   └── import-excel.js # Importación desde Excel
├── templates/          # Plantillas Excel generadas
├── exports/            # Archivos Excel exportados
├── server.js           # Servidor Express y API
├── database.db         # Base de datos SQLite
└── package.json        # Configuración del proyecto
```

## API REST

### Tareas

#### Obtener todas las tareas
```http
GET /api/tareas
```

**Parámetros de query opcionales:**
- `estado`: Filtrar por estado (Pendiente, En Progreso, Completada, Cancelada)
- `prioridad`: Filtrar por prioridad (Baja, Media, Alta, Urgente)
- `categoria`: Filtrar por categoría
- `asignado`: Filtrar por persona asignada

#### Obtener una tarea
```http
GET /api/tareas/:id
```

#### Crear tarea
```http
POST /api/tareas
Content-Type: application/json

{
  "titulo": "Nueva tarea",
  "descripcion": "Descripción de la tarea",
  "estado": "Pendiente",
  "prioridad": "Alta",
  "asignado": "Juan Pérez",
  "fecha_inicio": "2025-10-22",
  "fecha_fin": "2025-10-30",
  "progreso": 0,
  "categoria": "Desarrollo",
  "etiquetas": "backend, API",
  "notas": "Notas adicionales"
}
```

#### Actualizar tarea
```http
PUT /api/tareas/:id
Content-Type: application/json

{
  "estado": "En Progreso",
  "progreso": 50
}
```

#### Eliminar tarea
```http
DELETE /api/tareas/:id
```

### Estadísticas

#### Obtener estadísticas
```http
GET /api/estadisticas
```

Devuelve:
- Total de tareas
- Tareas por estado
- Tareas por prioridad
- Tareas por categoría
- Progreso promedio

### Categorías

#### Obtener categorías
```http
GET /api/categorias
```

### Usuarios

#### Obtener usuarios
```http
GET /api/usuarios
```

## Uso de la Plantilla Excel

### Estructura de la Plantilla

La plantilla Excel incluye dos hojas:

1. **Tareas**: Contiene todas las tareas con las siguientes columnas:
   - ID
   - Título
   - Descripción
   - Estado (con validación de datos)
   - Prioridad (con validación de datos)
   - Asignado a
   - Fecha Inicio
   - Fecha Fin
   - Progreso (%)
   - Categoría
   - Etiquetas
   - Notas

2. **Resumen**: Dashboard con estadísticas automáticas

### Importar Datos desde Excel

```bash
npm run import-excel -- ruta/al/archivo.xlsx
```

**Importante:**
- El archivo debe tener una hoja llamada "Tareas"
- La primera fila debe ser el encabezado
- El campo "Título" es obligatorio

### Exportar Datos a Excel

```bash
npm run export-excel
```

Genera un archivo en la carpeta `exports/` con todas las tareas actuales de la base de datos.

## Características del Dashboard

### Estadísticas en Tiempo Real
- Total de tareas
- Tareas pendientes
- Tareas en progreso
- Tareas completadas
- Progreso promedio

### Filtros
- Por estado
- Por prioridad
- Por categoría

### Gestión de Tareas
- Crear nuevas tareas
- Editar tareas existentes
- Eliminar tareas
- Ver detalles completos

### Indicadores Visuales
- Colores por estado
- Colores por prioridad
- Barras de progreso
- Etiquetas categorizadas

## Base de Datos

### Tablas

#### tareas
- `id`: ID único (autoincremental)
- `titulo`: Título de la tarea (requerido)
- `descripcion`: Descripción detallada
- `estado`: Estado actual (Pendiente, En Progreso, Completada, Cancelada)
- `prioridad`: Prioridad (Baja, Media, Alta, Urgente)
- `asignado`: Persona asignada
- `fecha_inicio`: Fecha de inicio
- `fecha_fin`: Fecha de finalización
- `progreso`: Porcentaje de progreso (0-100)
- `categoria`: Categoría de la tarea
- `etiquetas`: Etiquetas separadas por coma
- `notas`: Notas adicionales
- `fecha_creacion`: Timestamp de creación
- `fecha_actualizacion`: Timestamp de última actualización

#### categorias
- `id`: ID único
- `nombre`: Nombre de la categoría
- `color`: Color en formato hexadecimal
- `descripcion`: Descripción de la categoría

#### usuarios
- `id`: ID único
- `nombre`: Nombre del usuario
- `email`: Email (único)
- `rol`: Rol del usuario
- `activo`: Estado activo/inactivo

## Personalización

### Colores y Estilos

Los colores principales se pueden modificar en `public/styles.css`:

```css
/* Colores principales */
--color-primary: #667eea;
--color-secondary: #764ba2;
--color-success: #51cf66;
--color-danger: #fa5252;
--color-warning: #ffc107;
```

### Agregar Nuevas Categorías

Editar `scripts/init-db.js` y agregar en el array `categorias`:

```javascript
['Nombre Categoría', '#COLOR', 'Descripción'],
```

## Seguridad

- La API acepta peticiones CORS para desarrollo
- Para producción, configurar CORS apropiadamente
- Implementar autenticación según necesidades
- No exponer el servidor directamente a internet sin medidas de seguridad

## Solución de Problemas

### Error al conectar a la base de datos
```bash
# Reinicializar la base de datos
rm database.db
npm run init-db
```

### Error al importar Excel
- Verificar que el archivo tenga una hoja llamada "Tareas"
- Verificar que la primera fila sea el encabezado
- Verificar que haya al menos una columna "Título"

### El dashboard no se conecta al servidor
- Verificar que el servidor esté corriendo en el puerto 3000
- Verificar que no haya otro proceso usando el puerto
- Revisar la consola del navegador para errores

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - Ver archivo LICENSE para más detalles

## Soporte

Para reportar problemas o solicitar características, por favor abre un issue en el repositorio de GitHub.

---

**Desarrollado con Node.js, Express, SQLite y ExcelJS**
