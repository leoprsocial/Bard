const ExcelJS = require('exceljs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');

async function exportarAExcel() {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err.message);
            process.exit(1);
        }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tareas');

    // Configurar columnas
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Título', key: 'titulo', width: 30 },
        { header: 'Descripción', key: 'descripcion', width: 50 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Prioridad', key: 'prioridad', width: 12 },
        { header: 'Asignado a', key: 'asignado', width: 20 },
        { header: 'Fecha Inicio', key: 'fecha_inicio', width: 15 },
        { header: 'Fecha Fin', key: 'fecha_fin', width: 15 },
        { header: 'Progreso (%)', key: 'progreso', width: 12 },
        { header: 'Categoría', key: 'categoria', width: 15 },
        { header: 'Etiquetas', key: 'etiquetas', width: 20 },
        { header: 'Notas', key: 'notas', width: 40 }
    ];

    // Estilos de encabezado
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Obtener tareas de la base de datos
    db.all('SELECT * FROM tareas ORDER BY id', async (err, rows) => {
        if (err) {
            console.error('Error al obtener tareas:', err.message);
            db.close();
            process.exit(1);
        }

        // Agregar datos
        rows.forEach(tarea => {
            const row = worksheet.addRow({
                id: tarea.id,
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                estado: tarea.estado,
                prioridad: tarea.prioridad,
                asignado: tarea.asignado,
                fecha_inicio: tarea.fecha_inicio ? new Date(tarea.fecha_inicio) : null,
                fecha_fin: tarea.fecha_fin ? new Date(tarea.fecha_fin) : null,
                progreso: tarea.progreso,
                categoria: tarea.categoria,
                etiquetas: tarea.etiquetas,
                notas: tarea.notas
            });

            // Formatear fechas
            if (tarea.fecha_inicio) {
                row.getCell('fecha_inicio').numFmt = 'dd/mm/yyyy';
            }
            if (tarea.fecha_fin) {
                row.getCell('fecha_fin').numFmt = 'dd/mm/yyyy';
            }

            // Formatear porcentaje
            row.getCell('progreso').numFmt = '0"%"';

            // Colorear según estado
            const estado = tarea.estado;
            if (estado === 'Completada') {
                row.getCell('estado').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF92D050' }
                };
            } else if (estado === 'En Progreso') {
                row.getCell('estado').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC000' }
                };
            } else if (estado === 'Pendiente') {
                row.getCell('estado').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF6B6B' }
                };
            }

            // Colorear según prioridad
            const prioridad = tarea.prioridad;
            if (prioridad === 'Urgente' || prioridad === 'Alta') {
                row.getCell('prioridad').font = { color: { argb: 'FFFF0000' }, bold: true };
            } else if (prioridad === 'Media') {
                row.getCell('prioridad').font = { color: { argb: 'FFFF8C00' } };
            }
        });

        // Crear hoja de estadísticas
        const resumenSheet = workbook.addWorksheet('Resumen');

        resumenSheet.getCell('A1').value = 'ESTADÍSTICAS DE TAREAS';
        resumenSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF4472C4' } };
        resumenSheet.mergeCells('A1:D1');

        resumenSheet.getCell('A3').value = 'Estado';
        resumenSheet.getCell('B3').value = 'Cantidad';
        resumenSheet.getRow(3).font = { bold: true };

        resumenSheet.getCell('A4').value = 'Pendientes';
        resumenSheet.getCell('B4').value = { formula: 'COUNTIF(Tareas!D:D,"Pendiente")' };

        resumenSheet.getCell('A5').value = 'En Progreso';
        resumenSheet.getCell('B5').value = { formula: 'COUNTIF(Tareas!D:D,"En Progreso")' };

        resumenSheet.getCell('A6').value = 'Completadas';
        resumenSheet.getCell('B6').value = { formula: 'COUNTIF(Tareas!D:D,"Completada")' };

        resumenSheet.getCell('A7').value = 'Canceladas';
        resumenSheet.getCell('B7').value = { formula: 'COUNTIF(Tareas!D:D,"Cancelada")' };

        resumenSheet.getCell('A9').value = 'Total de Tareas';
        resumenSheet.getCell('B9').value = { formula: 'COUNTA(Tareas!A:A)-1' };
        resumenSheet.getCell('A9').font = { bold: true };
        resumenSheet.getCell('B9').font = { bold: true };

        resumenSheet.getColumn('A').width = 20;
        resumenSheet.getColumn('B').width = 15;

        // Guardar archivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const exportPath = path.join(__dirname, `../exports/tareas_${timestamp}.xlsx`);

        // Crear directorio exports si no existe
        const fs = require('fs');
        const exportsDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir);
        }

        await workbook.xlsx.writeFile(exportPath);

        console.log(`✓ Datos exportados exitosamente a: ${exportPath}`);
        console.log(`✓ Total de tareas exportadas: ${rows.length}`);

        db.close();
    });
}

exportarAExcel().catch(console.error);
