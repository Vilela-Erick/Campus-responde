# CampusResponde — Asistente Verificable de Trámites Universitarios

Sistema MVP desarrollado en la asignatura **Modelado Ágil de Software (2026-2)** — Universidad Laica Eloy Alfaro de Manabí (ULEAM), aplicando **Kanban** y **Extreme Programming (XP)**.

## Integrantes y Aportes
- **Diogo Miguel Sánchez Santos:** Arquitectura del tablero Kanban en Notion, buscador base y metadatos (`US-01`, `US-02`), interfaz MVP y validación de reportes (`US-08`).
- **German Joao Frias Mero:** Priorización del Product Backlog, criterios de aceptación, edición con historial de versiones (`US-05`), retiro de fuentes obsoletas (`US-06`) y panel de vencidas (`US-09`).
- **Derick Paolo Pazmiño Granillo:** Manejo de incertidumbre con estado *«Información insuficiente»* (`US-03`), derivación a revisión editorial humana (`US-04`) y pruebas negativas.
- **Erick Vilela Cevallos:** Facilitador del flujo Kanban, configuración del repositorio e Integración Continua (`CI`), e implementación del cambio de requisito de vigencia (`US-07`).

## Ejecución Local
1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd campus-responde
   ```
2. Ejecutar la suite de pruebas automatizadas (requiere Node.js 18 o superior, sin dependencias externas):
   ```bash
   npm test
   ```
3. Levantar el prototipo web localmente:
   ```bash
   npx serve .
   ```
   Luego abrir `http://localhost:3000` en el navegador.
