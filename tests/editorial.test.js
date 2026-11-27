import test from "node:test";
import assert from "node:assert/strict";
import { editarFichaConHistorial, retirarFuenteObsoleta } from "../src/editorial.js";
import { buscarTramites } from "../src/buscador.js";

test("US-05: conserva la version anterior con fecha y motivo tras una modificacion aprobada", () => {
  const ficha = {
    id: "TR-010",
    titulo: "Solicitud de prorroga de matricula",
    palabrasClave: ["prorroga", "matricula"],
    respuesta: "Plazo de 5 dias habiles.",
    fuenteOficial: "Resolucion 2026-01",
    fechaPublicacion: "2026-04-01",
    fechaVigencia: "2027-04-01",
    unidadResponsable: "Secretaria General",
    estado: "Vigente",
    version: 1,
    historialVersiones: []
  };

  editarFichaConHistorial(
    ficha,
    { respuesta: "Plazo ampliado a 10 dias habiles." },
    "Actualizacion por resolucion del Consejo Universitario",
    "German Frias",
    "2026-11-16"
  );

  assert.equal(ficha.version, 2);
  assert.equal(ficha.respuesta, "Plazo ampliado a 10 dias habiles.");
  assert.equal(ficha.historialVersiones.length, 1);
  assert.equal(ficha.historialVersiones[0].version, 1);
  assert.equal(ficha.historialVersiones[0].respuesta, "Plazo de 5 dias habiles.");
  assert.equal(ficha.historialVersiones[0].fechaCambio, "2026-11-16");
  assert.match(ficha.historialVersiones[0].motivo, /Consejo Universitario/);
});

test("US-06: un documento marcado como Retirado deja de aparecer en las busquedas", () => {
  const catalogoPrueba = [
    {
      id: "TR-020",
      titulo: "Guia de carnetizacion fisica antigua",
      palabrasClave: ["carnetizacion", "carnet", "fisico"],
      respuesta: "Acudir a ventanilla.",
      fuenteOficial: "Circular 2021",
      fechaPublicacion: "2021-05-01",
      fechaVigencia: "2027-01-01",
      unidadResponsable: "Bienestar Universitario",
      estado: "Vigente",
      version: 1,
      historialVersiones: []
    }
  ];

  assert.equal(buscarTramites("carnetizacion fisica", catalogoPrueba, "2026-11-26").length, 1);

  retirarFuenteObsoleta(
    catalogoPrueba[0],
    "Reemplazado por carnet digital institucional",
    "German Frias",
    "2026-11-19"
  );

  assert.equal(catalogoPrueba[0].estado, "Retirado");
  assert.equal(buscarTramites("carnetizacion fisica", catalogoPrueba, "2026-11-26").length, 0);
});
