export const FECHA_ACTUAL_SISTEMA = "2026-11-26";

export function normalizarTexto(texto) {
  if (!texto || typeof texto !== "string") return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function buscarTramites(consulta, catalogo) {
  const consultaNormalizada = normalizarTexto(consulta);
  if (!consultaNormalizada) return [];

  const tokens = consultaNormalizada.split(/\s+/).filter((p) => p.length >= 3);
  if (tokens.length === 0) return [];

  const resultados = [];

  for (const doc of catalogo) {
    const tituloNorm = normalizarTexto(doc.titulo);
    const respuestaNorm = normalizarTexto(doc.respuesta);
    const clavesNorm = (doc.palabrasClave || []).map(normalizarTexto);

    let puntaje = 0;
    for (const token of tokens) {
      if (clavesNorm.some((c) => c.includes(token) || token.includes(c))) puntaje += 2;
      if (tituloNorm.includes(token)) puntaje += 2;
      if (respuestaNorm.includes(token)) puntaje += 1;
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
