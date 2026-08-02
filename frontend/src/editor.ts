/**
 * Visual editor for proxon-schema-card.
 *
 * Built on `ha-form` with Home Assistant's own selectors, so the device picker
 * and entity pickers behave exactly like everywhere else in the UI and we do
 * not ship a second implementation of them.
 *
 * The T300 extras are only offered when the selected device actually is a
 * T300 -- on an FWT they would be three dead fields.
 */
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { variantForDevice, type HassLike } from "./entities";
import type { ProxonSchemaCardConfig } from "./proxon-schema-card";

const BASE_SCHEMA = [
  { name: "device_id", required: true, selector: { device: { integration: "proxon" } } },
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "animate", selector: { boolean: {} } },
      {
        name: "animation_speed",
        selector: { number: { min: 0.25, max: 3, step: 0.25, mode: "slider" } },
      },
    ],
  },
];

const EXTRAS_SCHEMA = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } },
  ],
};

const LABELS: Record<string, string> = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss",
};

const HELPERS: Record<string, string> = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss",
};

class ProxonSchemaCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HassLike;
  private _config?: ProxonSchemaCardConfig;

  setConfig(config: ProxonSchemaCardConfig): void {
    this._config = config;
  }

  private _schema() {
    const deviceId = this._config?.device_id;
    const isT300 =
      this._config?.variant === "t300" ||
      (this.hass && deviceId ? variantForDevice(this.hass, deviceId) === "t300" : false);
    return isT300 ? [...BASE_SCHEMA, EXTRAS_SCHEMA] : BASE_SCHEMA;
  }

  private _computeLabel = (s: { name: string }) => LABELS[s.name] ?? s.name;
  private _computeHelper = (s: { name: string }) => HELPERS[s.name] ?? "";

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: ev.detail.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema()}
        .computeLabel=${this._computeLabel}
        .computeHelper=${this._computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="hint">
        Ohne Gerät wählt die Karte selbst, sofern genau ein passendes Proxon-Gerät existiert.
      </div>`;
  }

  static styles = css`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
}

customElements.define("proxon-schema-card-editor", ProxonSchemaCardEditor);
