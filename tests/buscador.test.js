import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buscarTramites } from "../src/buscador.js";

const catalogo = JSON.parse(
  readFileSync(new URL("../data/tramites.json", import.meta.url), "utf8")
);

test("US-01 y US-02: devuelve tramite con fuente oficial, fecha y unidad responsable", () => {
  const resultados = buscarTramites("homologacion de asignaturas", catalogo);

  assert.ok(resultados.length >= 1);
  assert.equal(resultados[0].id, "TR-001");
  assert.ok(resultados[0].fuenteOficial.length > 0);
  assert.ok(resultados[0].fechaPublicacion.length > 0);
  assert.ok(resultados[0].unidadResponsable.length > 0);
});
