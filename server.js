const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión a la base de datos
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('✓ Conectado a la base de datos SQLite');
    }
});

// ============= RUTAS DE TAREAS =============

// GET - Obtener todas las tareas
app.get('/api/tareas', (req, res) => {
    const { estado, prioridad, categoria, asignado } = req.query;

    let query = 'SELECT * FROM tareas WHERE 1=1';
    const params = [];

    if (estado) {
        query += ' AND estado = ?';
        params.push(estado);
    }
    if (prioridad) {
        query += ' AND prioridad = ?';
        params.push(prioridad);
    }
    if (categoria) {
        query += ' AND categoria = ?';
        params.push(categoria);
    }
    if (asignado) {
        query += ' AND asignado LIKE ?';
        params.push(`%${asignado}%`);
    }

    query += ' ORDER BY fecha_creacion DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tareas: rows });
    });
});

// GET - Obtener una tarea por ID
app.get('/api/tareas/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM tareas WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.json({ tarea: row });
    });
});

// POST - Crear nueva tarea
app.post('/api/tareas', (req, res) => {
    const {
        titulo,
        descripcion,
        estado = 'Pendiente',
        prioridad = 'Media',
        asignado,
        fecha_inicio,
        fecha_fin,
        progreso = 0,
        categoria,
        etiquetas,
        notas
    } = req.body;

    if (!titulo) {
        return res.status(400).json({ error: 'El título es requerido' });
    }

    const query = `
        INSERT INTO tareas
        (titulo, descripcion, estado, prioridad, asignado, fecha_inicio, fecha_fin, progreso, categoria, etiquetas, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        query,
        [titulo, descripcion, estado, prioridad, asignado, fecha_inicio, fecha_fin, progreso, categoria, etiquetas, notas],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(201).json({
                message: 'Tarea creada exitosamente',
                id: this.lastID
            });
        }
    );
});

// PUT - Actualizar tarea
app.put('/api/tareas/:id', (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        descripcion,
        estado,
        prioridad,
        asignado,
        fecha_inicio,
        fecha_fin,
        progreso,
        categoria,
        etiquetas,
        notas
    } = req.body;

    const query = `
        UPDATE tareas SET
            titulo = COALESCE(?, titulo),
            descripcion = COALESCE(?, descripcion),
            estado = COALESCE(?, estado),
            prioridad = COALESCE(?, prioridad),
            asignado = COALESCE(?, asignado),
            fecha_inicio = COALESCE(?, fecha_inicio),
            fecha_fin = COALESCE(?, fecha_fin),
            progreso = COALESCE(?, progreso),
            categoria = COALESCE(?, categoria),
            etiquetas = COALESCE(?, etiquetas),
            notas = COALESCE(?, notas),
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(
        query,
        [titulo, descripcion, estado, prioridad, asignado, fecha_inicio, fecha_fin, progreso, categoria, etiquetas, notas, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Tarea no encontrada' });
                return;
            }
            res.json({ message: 'Tarea actualizada exitosamente' });
        }
    );
});

// DELETE - Eliminar tarea
app.delete('/api/tareas/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM tareas WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.json({ message: 'Tarea eliminada exitosamente' });
    });
});

// ============= RUTAS DE ESTADÍSTICAS =============

app.get('/api/estadisticas', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM tareas',
        por_estado: 'SELECT estado, COUNT(*) as count FROM tareas GROUP BY estado',
        por_prioridad: 'SELECT prioridad, COUNT(*) as count FROM tareas GROUP BY prioridad',
        por_categoria: 'SELECT categoria, COUNT(*) as count FROM tareas GROUP BY categoria',
        progreso_promedio: 'SELECT AVG(progreso) as promedio FROM tareas'
    };

    const estadisticas = {};

    // Total
    db.get(queries.total, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        estadisticas.total = row.count;

        // Por estado
        db.all(queries.por_estado, (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            estadisticas.por_estado = rows;

            // Por prioridad
            db.all(queries.por_prioridad, (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                estadisticas.por_prioridad = rows;

                // Por categoría
                db.all(queries.por_categoria, (err, rows) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    estadisticas.por_categoria = rows;

                    // Progreso promedio
                    db.get(queries.progreso_promedio, (err, row) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        estadisticas.progreso_promedio = Math.round(row.promedio || 0);

                        res.json(estadisticas);
                    });
                });
            });
        });
    });
});

// ============= RUTAS DE CATEGORÍAS =============

app.get('/api/categorias', (req, res) => {
    db.all('SELECT * FROM categorias ORDER BY nombre', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ categorias: rows });
    });
});

// ============= RUTAS DE USUARIOS =============

app.get('/api/usuarios', (req, res) => {
    db.all('SELECT * FROM usuarios WHERE activo = 1 ORDER BY nombre', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ usuarios: rows });
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});

// Manejar cierre
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error al cerrar la base de datos:', err.message);
        }
        console.log('\n✓ Conexión a base de datos cerrada');
        process.exit(0);
    });
});
