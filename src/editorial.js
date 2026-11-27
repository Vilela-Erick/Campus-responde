import { FECHA_ACTUAL_SISTEMA } from "./buscador.js";

/**
 * US-05: Edita una ficha documental conservando la version anterior
 * con fecha de cambio y motivo obligatorio.
 */
export function editarFichaConHistorial(
  ficha,
  cambios,
  motivo,
  editor = "Equipo Editorial",
  fecha = FECHA_ACTUAL_SISTEMA
) {
  if (!ficha) {
    throw new Error("Ficha documental no encontrada.");
  }
  if (!motivo || !motivo.trim()) {
    throw new Error("Debe registrar un motivo para modificar la ficha.");
  }

  if (!Array.isArray(ficha.historialVersiones)) {
    ficha.historialVersiones = [];
  }

  ficha.historialVersiones.push({
    version: ficha.version || 1,
    titulo: ficha.titulo,
    respuesta: ficha.respuesta,
    fuenteOficial: ficha.fuenteOficial,
    fechaVigencia: ficha.fechaVigencia,
    estado: ficha.estado,
    fechaCambio: fecha,
    motivo: motivo.trim(),
    editor
  });

  Object.assign(ficha, cambios);
  ficha.version = (ficha.version || 1) + 1;

  return ficha;
}

/**
 * US-06: Marca un documento como «Retirado» conservando trazabilidad en su historial.
 */
export function retirarFuenteObsoleta(
  ficha,
  motivo,
  editor = "Equipo Editorial",
  fecha = FECHA_ACTUAL_SISTEMA
) {
  return editarFichaConHistorial(
    ficha,
    { estado: "Retirado" },
    motivo || "Retiro por obsolescencia normativa",
    editor,
    fecha
  );
}
