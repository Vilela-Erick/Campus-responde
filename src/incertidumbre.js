import { buscarTramites, FECHA_ACTUAL_SISTEMA } from "./buscador.js";

// Regla definida en TDD para resolver bloqueo del 10-nov sobre umbral minimo de coincidencia
export const UMBRAL_MINIMO_COINCIDENCIA = 2;

/**
 * US-03: Evalua si existe respaldo documental suficiente.
 * Si no hay coincidencias o el puntaje es inferior al umbral, activa el estado
 * «Informacion insuficiente» y nunca emite una respuesta inventada.
 */
export function evaluarConsulta(consulta, catalogo, fechaReferencia = FECHA_ACTUAL_SISTEMA) {
  const resultados = buscarTramites(consulta, catalogo, fechaReferencia);

  if (resultados.length === 0 || resultados[0].puntaje < UMBRAL_MINIMO_COINCIDENCIA) {
    return {
      estado: "Informacion insuficiente",
      mensaje:
        "Información insuficiente en el catálogo oficial vigente para responder esta consulta con certeza. Puede derivarla a revisión editorial humana.",
      requiereDerivacion: true,
      resultados: []
    };
  }

  return {
    estado: "Resuelta",
    mensaje: "Respuesta verificada con respaldo documental oficial vigente.",
    requiereDerivacion: false,
    resultados
  };
}

/**
 * US-04: Registra una consulta no resuelta en la bandeja del editor de contenidos.
 */
export function derivarARevisionHumana(
  bandejaEditorial,
  { consulta, correoContacto = "", detalleAdicional = "", fecha = FECHA_ACTUAL_SISTEMA }
) {
  if (!consulta || !consulta.trim()) {
    throw new Error("La consulta a derivar no puede estar vacia.");
  }

  const ticket = {
    id: `DER-${String(bandejaEditorial.length + 1).padStart(3, "0")}`,
    consulta: consulta.trim(),
    correoContacto: correoContacto.trim() || "No especificado",
    detalleAdicional: detalleAdicional.trim(),
    estado: "Pendiente de revision",
    fechaRegistro: fecha
  };

  bandejaEditorial.push(ticket);
  return ticket;
}
