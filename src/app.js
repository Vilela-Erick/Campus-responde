import { FECHA_ACTUAL_SISTEMA } from "./buscador.js";
import { evaluarConsulta, derivarARevisionHumana } from "./incertidumbre.js";
import { editarFichaConHistorial, retirarFuenteObsoleta } from "./editorial.js";

let catalogo = [];
const bandejaEditorial = [];

async function inicializar() {
  document.getElementById("fecha-sistema-label").textContent = FECHA_ACTUAL_SISTEMA;

  const respuesta = await fetch("./data/tramites.json");
  catalogo = await respuesta.json();

  configurarNavegacion();
  configurarBuscador();
  renderizarCatalogoEditorial();
  renderizarBandejaDerivadas();
}

function configurarNavegacion() {
  const botones = document.querySelectorAll(".tab-btn");
  const paneles = document.querySelectorAll(".tab-panel");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      botones.forEach((b) => b.classList.remove("active"));
      paneles.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

function configurarBuscador() {
  const form = document.getElementById("form-busqueda");
  const input = document.getElementById("input-consulta");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ejecutarConsulta(input.value);
  });

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.query;
      ejecutarConsulta(chip.dataset.query);
    });
  });
}

function ejecutarConsulta(consulta) {
  const contenedor = document.getElementById("contenedor-resultados");
  const evaluacion = evaluarConsulta(consulta, catalogo, FECHA_ACTUAL_SISTEMA);

  if (evaluacion.estado === "Informacion insuficiente") {
    contenedor.innerHTML = `
      <div class="alert-insuficiente">
        <h3>Estado: «Información insuficiente»</h3>
        <p>${evaluacion.mensaje}</p>
        <form id="form-derivar" class="form-derivacion">
          <div class="form-group">
            <input type="email" id="correo-estudiante" placeholder="Correo institucional para notificación (opcional)" />
          </div>
          <div class="form-group">
            <textarea id="detalle-consulta" rows="2" placeholder="Detalle adicional de su trámite para el editor de contenidos..."></textarea>
          </div>
          <div>
            <button type="submit" class="btn-primary">Derivar consulta a revisión editorial humana</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("form-derivar").addEventListener("submit", (e) => {
      e.preventDefault();
      const ticket = derivarARevisionHumana(bandejaEditorial, {
        consulta,
        correoContacto: document.getElementById("correo-estudiante").value,
        detalleAdicional: document.getElementById("detalle-consulta").value,
        fecha: FECHA_ACTUAL_SISTEMA
      });
      renderizarBandejaDerivadas();
      contenedor.innerHTML = `
        <div class="card">
          <h3>Consulta derivada correctamente (${ticket.id})</h3>
          <p>Su solicitud <strong>"${ticket.consulta}"</strong> fue registrada en la bandeja del editor de contenidos sin generar respuestas no verificadas.</p>
        </div>
      `;
    });
    return;
  }

  contenedor.innerHTML = evaluacion.resultados
    .map(
      (item) => `
      <article class="result-card">
        <h3>${item.titulo} <small>(v${item.version})</small></h3>
        <p>${item.respuesta}</p>
        <div class="meta-grid">
          <div class="meta-item">
            <strong>Fuente Oficial</strong>
            <span>${item.fuenteOficial}</span>
          </div>
          <div class="meta-item">
            <strong>Fecha de Publicación</strong>
            <span>${item.fechaPublicacion}</span>
          </div>
          <div class="meta-item">
            <strong>Vigencia Documental</strong>
            <span>Vigente hasta ${item.fechaVigencia}</span>
          </div>
          <div class="meta-item">
            <strong>Unidad Responsable</strong>
            <span>${item.unidadResponsable}</span>
          </div>
        </div>
      </article>
    `
    )
    .join("");
}

function renderizarBandejaDerivadas() {
  document.getElementById("contador-derivadas").textContent = String(bandejaEditorial.length);
  const lista = document.getElementById("lista-derivadas");

  if (bandejaEditorial.length === 0) {
    lista.innerHTML = `<p class="helper-text">No hay consultas pendientes en la bandeja editorial.</p>`;
    return;
  }

  lista.innerHTML = bandejaEditorial
    .map(
      (t) => `
      <div class="item-box">
        <strong>${t.id} — ${t.consulta}</strong>
        <p>Detalle: ${t.detalleAdicional || "Sin detalle adicional"} | Contacto: ${t.correoContacto}</p>
        <small>Registrado el ${t.fechaRegistro} · Estado: ${t.estado}</small>
      </div>
    `
    )
    .join("");
}

function renderizarCatalogoEditorial() {
  const lista = document.getElementById("lista-catalogo-editorial");

  lista.innerHTML = catalogo
    .map((doc) => {
      const expirado = doc.estado !== "Retirado" && doc.fechaVigencia < FECHA_ACTUAL_SISTEMA;
      const claseEstado =
        doc.estado === "Retirado"
          ? "status-retirado"
          : expirado
          ? "status-expirado"
          : "status-vigente";
      const textoEstado =
        doc.estado === "Retirado"
          ? "Retirado"
          : expirado
          ? "Expirado (Excluido US-07)"
          : "Vigente";

      return `
        <div class="item-box">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <strong>${doc.id}: ${doc.titulo} (v${doc.version})</strong>
            <span class="status-pill ${claseEstado}">${textoEstado}</span>
          </div>
          <p style="font-size:13px; margin:6px 0;">${doc.respuesta}</p>
          <small>Fuente: ${doc.fuenteOficial} | Vigencia: ${doc.fechaVigencia} | ${doc.unidadResponsable}</small>
          <div class="actions-row">
            <button class="btn-secondary" data-editar="${doc.id}">Registrar nueva versión (US-05)</button>
            ${
              doc.estado !== "Retirado"
                ? `<button class="btn-danger" data-retirar="${doc.id}">Retirar fuente obsoleta (US-06)</button>`
                : ""
            }
          </div>
          ${
            doc.historialVersiones.length > 0
              ? `<div class="historial-box">
                  <strong>Historial de versiones anteriores:</strong>
                  <ul>
                    ${doc.historialVersiones
                      .map(
                        (h) =>
                          `<li>v${h.version} (${h.fechaCambio}) — Motivo: ${h.motivo} | Texto previo: "${h.respuesta}"</li>`
                      )
                      .join("")}
                  </ul>
                </div>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  lista.querySelectorAll("[data-editar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ficha = catalogo.find((d) => d.id === btn.dataset.editar);
      const nuevaRespuesta = window.prompt("Nuevo texto oficial de la ficha:", ficha.respuesta);
      if (!nuevaRespuesta) return;
      const motivo = window.prompt("Motivo obligatorio de la actualización normativa:");
      if (!motivo) return;

      editarFichaConHistorial(
        ficha,
        { respuesta: nuevaRespuesta },
        motivo,
        "Editor Académico ULEAM",
        FECHA_ACTUAL_SISTEMA
      );
      renderizarCatalogoEditorial();
    });
  });

  lista.querySelectorAll("[data-retirar]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ficha = catalogo.find((d) => d.id === btn.dataset.retirar);
      const motivo = window.prompt("Motivo de retiro de la fuente obsoleta:");
      if (!motivo) return;

      retirarFuenteObsoleta(ficha, motivo, "Editor Académico ULEAM", FECHA_ACTUAL_SISTEMA);
      renderizarCatalogoEditorial();
    });
  });
}

inicializar();
