import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluarConsulta, derivarARevisionHumana } from "../src/incertidumbre.js";

const catalogo = JSON.parse(
  readFileSync(new URL("../data/tramites.json", import.meta.url), "utf8")
);

test("US-03: activa estado Informacion insuficiente cuando no hay respaldo oficial", () => {
  const resultado = evaluarConsulta("revalidacion de titulo extranjero", catalogo, "2026-11-26");

  assert.equal(resultado.estado, "Informacion insuficiente");
  assert.equal(resultado.requiereDerivacion, true);
  assert.equal(resultado.resultados.length, 0);
});

test("US-03: activa estado Informacion insuficiente ante coincidencia debil bajo el umbral", () => {
  const resultado = evaluarConsulta("solicitud", catalogo, "2026-11-26");

  assert.equal(resultado.estado, "Informacion insuficiente");
  assert.equal(resultado.resultados.length, 0);
});

test("US-04: deriva consulta no resuelta a la bandeja del editor de contenidos", () => {
  const bandeja = [];
  const ticket = derivarARevisionHumana(bandeja, {
    consulta: "Cambio de paralelo por cruce de horario laboral",
    correoContacto: "estudiante@live.uleam.edu.ec",
    detalleAdicional: "Adjunto certificado laboral",
    fecha: "2026-11-12"
  });

  assert.equal(bandeja.length, 1);
  assert.equal(ticket.id, "DER-001");
  assert.equal(ticket.estado, "Pendiente de revision");
});
