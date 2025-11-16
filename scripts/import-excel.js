const ExcelJS = require('exceljs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

async function importarDesdeExcel(archivoExcel) {
    if (!archivoExcel) {
        console.error('Error: Debes proporcionar la ruta del archivo Excel');
        console.log('Uso: npm run import-excel -- ruta/archivo.xlsx');
        process.exit(1);
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err.message);
            process.exit(1);
        }
    });

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(archivoExcel);

        const worksheet = workbook.getWorksheet('Tareas');
        if (!worksheet) {
            console.error('Error: No se encontró la hoja "Tareas" en el archivo');
            process.exit(1);
        }

        let tareasImportadas = 0;
        let errores = 0;

        // Preparar statement de inserción
        const stmt = db.prepare(`
            INSERT INTO tareas
            (titulo, descripcion, estado, prioridad, asignado, fecha_inicio, fecha_fin, progreso, categoria, etiquetas, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // Iterar sobre las filas (empezando desde la fila 2, después del encabezado)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezado

            try {
                const tarea = {
                    titulo: row.getCell(2).value, // B
                    descripcion: row.getCell(3).value, // C
                    estado: row.getCell(4).value || 'Pendiente', // D
                    prioridad: row.getCell(5).value || 'Media', // E
                    asignado: row.getCell(6).value, // F
                    fecha_inicio: row.getCell(7).value, // G
                    fecha_fin: row.getCell(8).value, // H
                    progreso: row.getCell(9).value || 0, // I
                    categoria: row.getCell(10).value, // J
                    etiquetas: row.getCell(11).value, // K
                    notas: row.getCell(12).value // L
                };

                // Validar título (requerido)
                if (!tarea.titulo) {
                    console.log(`⚠️  Fila ${rowNumber}: Omitida (sin título)`);
                    return;
                }

                // Formatear fechas
                if (tarea.fecha_inicio instanceof Date) {
                    tarea.fecha_inicio = tarea.fecha_inicio.toISOString().split('T')[0];
                }
                if (tarea.fecha_fin instanceof Date) {
                    tarea.fecha_fin = tarea.fecha_fin.toISOString().split('T')[0];
                }

                // Insertar en base de datos
                stmt.run(
                    tarea.titulo,
                    tarea.descripcion,
                    tarea.estado,
                    tarea.prioridad,
                    tarea.asignado,
                    tarea.fecha_inicio,
                    tarea.fecha_fin,
                    tarea.progreso,
                    tarea.categoria,
                    tarea.etiquetas,
                    tarea.notas,
                    (err) => {
                        if (err) {
                            console.error(`✗ Error en fila ${rowNumber}:`, err.message);
                            errores++;
                        } else {
                            tareasImportadas++;
                        }
                    }
                );
            } catch (error) {
                console.error(`✗ Error procesando fila ${rowNumber}:`, error.message);
                errores++;
            }
        });

        stmt.finalize((err) => {
            if (err) {
                console.error('Error al finalizar importación:', err.message);
            } else {
                console.log('\n✓ Importación completada');
                console.log(`  - Tareas importadas: ${tareasImportadas}`);
                if (errores > 0) {
                    console.log(`  - Errores: ${errores}`);
                }
            }

            db.close();
        });
    } catch (error) {
        console.error('Error al leer archivo Excel:', error.message);
        db.close();
        process.exit(1);
    }
}

// Obtener archivo de argumentos de línea de comandos
const archivoExcel = process.argv[2];
importarDesdeExcel(archivoExcel);
