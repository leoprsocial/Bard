const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
        process.exit(1);
    }
    console.log('✓ Conectado a la base de datos SQLite');
});

// Crear tabla de tareas
db.run(`
    CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'Pendiente',
        prioridad TEXT DEFAULT 'Media',
        asignado TEXT,
        fecha_inicio DATE,
        fecha_fin DATE,
        progreso INTEGER DEFAULT 0,
        categoria TEXT,
        etiquetas TEXT,
        notas TEXT,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error al crear tabla tareas:', err.message);
    } else {
        console.log('✓ Tabla tareas creada');
    }
});

// Crear tabla de categorías
db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#4472C4',
        descripcion TEXT
    )
`, (err) => {
    if (err) {
        console.error('Error al crear tabla categorias:', err.message);
    } else {
        console.log('✓ Tabla categorias creada');
    }
});

// Crear tabla de usuarios
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        rol TEXT DEFAULT 'usuario',
        activo INTEGER DEFAULT 1
    )
`, (err) => {
    if (err) {
        console.error('Error al crear tabla usuarios:', err.message);
    } else {
        console.log('✓ Tabla usuarios creada');
    }
});

// Insertar datos de ejemplo
db.serialize(() => {
    // Categorías de ejemplo
    const categorias = [
        ['Desarrollo', '#4472C4', 'Tareas de desarrollo de software'],
        ['Diseño', '#ED7D31', 'Tareas de diseño UI/UX'],
        ['Infraestructura', '#70AD47', 'Tareas de infraestructura y DevOps'],
        ['Documentación', '#FFC000', 'Tareas de documentación'],
        ['Testing', '#5B9BD5', 'Tareas de pruebas y QA']
    ];

    const insertCategoria = db.prepare('INSERT OR IGNORE INTO categorias (nombre, color, descripcion) VALUES (?, ?, ?)');
    categorias.forEach(cat => {
        insertCategoria.run(cat);
    });
    insertCategoria.finalize();

    // Usuarios de ejemplo
    const usuarios = [
        ['Juan Pérez', 'juan.perez@example.com', 'admin'],
        ['María González', 'maria.gonzalez@example.com', 'usuario'],
        ['Carlos López', 'carlos.lopez@example.com', 'usuario']
    ];

    const insertUsuario = db.prepare('INSERT OR IGNORE INTO usuarios (nombre, email, rol) VALUES (?, ?, ?)');
    usuarios.forEach(user => {
        insertUsuario.run(user);
    });
    insertUsuario.finalize();

    // Tareas de ejemplo
    const tareas = [
        ['Configurar servidor', 'Instalar y configurar servidor de producción', 'En Progreso', 'Alta', 'Juan Pérez', '2025-10-20', '2025-10-25', 60, 'Infraestructura', 'servidor, DevOps', 'Requiere acceso VPN'],
        ['Diseño UI/UX', 'Crear mockups de la interfaz principal', 'Pendiente', 'Media', 'María González', '2025-10-22', '2025-10-30', 0, 'Diseño', 'UI, diseño', 'Usar paleta de colores corporativa'],
        ['Implementar API REST', 'Desarrollar endpoints para módulo de usuarios', 'Completada', 'Alta', 'Carlos López', '2025-10-15', '2025-10-20', 100, 'Desarrollo', 'backend, API', 'Incluye autenticación JWT'],
        ['Documentar API', 'Crear documentación técnica de la API', 'Pendiente', 'Media', 'Juan Pérez', '2025-10-23', '2025-10-28', 0, 'Documentación', 'API, docs', 'Usar Swagger/OpenAPI'],
        ['Testing unitario', 'Escribir pruebas unitarias para módulo de usuarios', 'En Progreso', 'Alta', 'Carlos López', '2025-10-21', '2025-10-26', 40, 'Testing', 'tests, QA', 'Cobertura mínima 80%']
    ];

    const insertTarea = db.prepare(`
        INSERT OR IGNORE INTO tareas
        (titulo, descripcion, estado, prioridad, asignado, fecha_inicio, fecha_fin, progreso, categoria, etiquetas, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    tareas.forEach(tarea => {
        insertTarea.run(tarea);
    });
    insertTarea.finalize();

    console.log('✓ Datos de ejemplo insertados');
});

// Cerrar la conexión
db.close((err) => {
    if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
    } else {
        console.log('✓ Base de datos inicializada correctamente');
    }
});
