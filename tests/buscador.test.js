import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buscarTramites, esDocumentoValido } from "../src/buscador.js";

const catalogo = JSON.parse(
  readFileSync(new URL("../data/tramites.json", import.meta.url), "utf8")
);

test("US-01 y US-02: devuelve tramite con fuente oficial, fecha y unidad responsable", () => {
  const resultados = buscarTramites("homologacion de asignaturas", catalogo, "2026-11-26");

  assert.ok(resultados.length >= 1, "Debe encontrar al menos un tramite coincidente");
  const primero = resultados[0];
  assert.equal(primero.id, "TR-001");
  assert.ok(primero.fuenteOficial.length > 0, "Debe incluir fuente oficial");
  assert.ok(primero.fechaPublicacion.length > 0, "Debe incluir fecha de publicacion");
  assert.ok(primero.fechaVigencia.length > 0, "Debe incluir fecha de vigencia");
  assert.ok(primero.unidadResponsable.length > 0, "Debe incluir unidad responsable");
});

test("US-06: excluye documentos marcados con estado Retirado", () => {
  const resultados = buscarTramites("practicas preprofesionales plan 2018", catalogo, "2026-11-26");
  const ids = resultados.map((r) => r.id);

  assert.equal(ids.includes("TR-005"), false, "No debe mostrar fuentes retiradas");
});

test("US-07 (Cambio de requisito): excluye documentos cuya fechaVigencia ha expirado", () => {
  const docExpirado = catalogo.find((d) => d.id === "TR-006");
  assert.equal(esDocumentoValido(docExpirado, "2026-11-26"), false);

  const resultados = buscarTramites("ayudantia de catedra convocatoria", catalogo, "2026-11-26");
  assert.equal(resultados.length, 0, "Documento vencido el 2026-09-15 no debe aparecer en noviembre");
});
