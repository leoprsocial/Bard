# 🚀 GUÍA RÁPIDA DE INICIO

## Paso 1: Ir al directorio del proyecto
```bash
cd /home/user/Bard
```

## Paso 2: Instalar dependencias
```bash
npm install
```
Esto instalará:
- express (servidor web)
- sqlite3 (base de datos)
- cors (permisos CORS)
- exceljs (manejo de archivos Excel)

## Paso 3: Inicializar la base de datos
```bash
npm run init-db
```
Esto creará:
- Base de datos `database.db`
- Tablas: tareas, categorias, usuarios
- Datos de ejemplo (5 tareas, 5 categorías, 3 usuarios)

## Paso 4: Crear la plantilla Excel
```bash
npm run create-template
```
Esto generará:
- Archivo `templates/plantilla_tareas.xlsx`
- Con ejemplos y formato predefinido

## Paso 5: Iniciar el servidor
```bash
npm start
```
El servidor se iniciará en: http://localhost:3000

## 🎯 Acceder al Dashboard

Abre tu navegador en:
```
http://localhost:3000
```

## 📋 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Iniciar servidor (puerto 3000) |
| `npm run init-db` | Crear/reiniciar base de datos |
| `npm run create-template` | Generar plantilla Excel |
| `npm run export-excel` | Exportar BD → Excel |
| `npm run import-excel -- archivo.xlsx` | Importar Excel → BD |

## ✅ Verificación

Si todo funciona correctamente verás:
```
✓ Conectado a la base de datos SQLite
✓ Servidor corriendo en http://localhost:3000
```

## 🔧 Solución de Problemas

### Error: Cannot find module
```bash
npm install
```

### Error: Database locked
```bash
rm database.db
npm run init-db
```

### Puerto 3000 ocupado
Edita `server.js` línea 6:
```javascript
const PORT = process.env.PORT || 3001;  // Cambiar puerto
```

## 📱 Uso del Dashboard

1. **Ver tareas**: Se cargan automáticamente
2. **Nueva tarea**: Clic en botón "➕ Nueva Tarea"
3. **Editar**: Clic en "✏️ Editar" en cualquier tarea
4. **Eliminar**: Clic en "🗑️ Eliminar"
5. **Filtrar**: Usar los selectores en la parte superior
6. **Exportar**: Clic en "📥 Exportar a Excel"

## 🔄 Flujo de Trabajo Excel

### Exportar datos actuales:
```bash
npm run export-excel
```
Archivo generado en: `exports/tareas_[fecha].xlsx`

### Importar desde Excel:
```bash
npm run import-excel -- ruta/al/archivo.xlsx
```

## 🌐 API Endpoints

Base URL: `http://localhost:3000/api`

- GET `/tareas` - Listar todas las tareas
- GET `/tareas/:id` - Ver tarea específica
- POST `/tareas` - Crear nueva tarea
- PUT `/tareas/:id` - Actualizar tarea
- DELETE `/tareas/:id` - Eliminar tarea
- GET `/estadisticas` - Obtener métricas
- GET `/categorias` - Listar categorías
- GET `/usuarios` - Listar usuarios
