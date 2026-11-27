export const FECHA_ACTUAL_SISTEMA = "2026-11-26";

export function normalizarTexto(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Regla unificada de elegibilidad documental (Refactorizacion US-06 + Cambio US-07):
 * Excluye documentos marcados como "Retirado" y documentos cuya fechaVigencia haya expirado.
 */
export function esDocumentoValido(documento, fechaReferencia = FECHA_ACTUAL_SISTEMA) {
  if (!documento) return false;
  if (documento.estado === "Retirado") return false;
  if (documento.fechaVigencia && documento.fechaVigencia < fechaReferencia) {
    return false;
  }
  return true;
}

/**
 * US-01 y US-02: Busca tramites por palabras clave y garantiza que cada resultado
 * exponga fuente oficial, fecha de publicacion, vigencia y unidad responsable.
 */
export function buscarTramites(consulta, catalogo, fechaReferencia = FECHA_ACTUAL_SISTEMA) {
  const consultaNormalizada = normalizarTexto(consulta);
  if (!consultaNormalizada) return [];

  const tokens = consultaNormalizada
    .split(/\s+/)
    .filter((palabra) => palabra.length >= 3);

  if (tokens.length === 0) return [];

  const resultados = [];

  for (const doc of catalogo) {
    if (!esDocumentoValido(doc, fechaReferencia)) continue;

    const tituloNorm = normalizarTexto(doc.titulo);
    const respuestaNorm = normalizarTexto(doc.respuesta);
    const clavesNorm = (doc.palabrasClave || []).map(normalizarTexto);

    let puntaje = 0;

    for (const token of tokens) {
      if (clavesNorm.some((clave) => clave.includes(token) || token.includes(clave))) {
        puntaje += 2;
      }
      if (tituloNorm.includes(token)) {
        puntaje += 2;
      }
      if (respuestaNorm.includes(token)) {
        puntaje += 1;
      }
    }

    if (puntaje > 0) {
      resultados.push({
        id: doc.id,
        titulo: doc.titulo,
        respuesta: doc.respuesta,
        fuenteOficial: doc.fuenteOficial,
        fechaPublicacion: doc.fechaPublicacion,
        fechaVigencia: doc.fechaVigencia,
        unidadResponsable: doc.unidadResponsable,
        version: doc.version || 1,
        puntaje
      });
    }
  }

  return resultados.sort((a, b) => b.puntaje - a.puntaje);
}
