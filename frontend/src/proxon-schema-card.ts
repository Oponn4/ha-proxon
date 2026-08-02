/**
 * proxon-schema-card
 *
 * Lovelace card shipped by the proxon integration. Replaces the previous
 * picture-elements setup (four generated SVG files in /config/www, conditional
 * cards per plant state, ~26 hand-wired entity_ids) with one card that takes a
 * device_id and resolves everything else from the entity registry.
 *
 * Which schematic is drawn follows the device model, so the same card type
 * serves the FWT and the T300.
 */
import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { renderFwt } from "./fwt-schema";
import { renderT300 } from "./t300-schema";
import {
  guessDevice,
  keysFor,
  mapByTranslationKey,
  resolveEntities,
  variantForDevice,
  type EntityMap,
  type HassLike,
  type Variant,
} from "./entities";

export interface ProxonSchemaCardConfig {
  type: string;
  device_id?: string;
  variant?: Variant;
  animate?: boolean;
  title?: string;
  /**
   * T300 only: entities that do not belong to the integration (power meter,
   * daily energy, PV surplus helper) and therefore cannot be resolved from the
   * device. Optional -- the labels stay blank without them.
   */
  extras?: { power?: string; energy_daily?: string; pv_surplus?: string };
}

class ProxonSchemaCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _map: { state: true },
    _error: { state: true },
  };

  hass?: HassLike;
  private _config?: ProxonSchemaCardConfig;
  private _map: EntityMap = {};
  private _error?: string;
  private _resolvedFor?: string;
  private _registry?: HassLike["entities"];

  setConfig(config: ProxonSchemaCardConfig): void {
    this._config = { animate: true, ...config };
    this._resolvedFor = undefined;
    this._registry = undefined;
    this._map = {};
  }

  getCardSize(): number {
    return this._variant() === "t300" ? 10 : 6;
  }

  static getStubConfig(hass: HassLike): Partial<ProxonSchemaCardConfig> {
    return { device_id: guessDevice(hass, "fwt") };
  }

  private _variant(): Variant {
    if (this._config?.variant) return this._config.variant;
    const deviceId = this._deviceId();
    if (this.hass && deviceId) {
      const v = variantForDevice(this.hass, deviceId);
      if (v) return v;
    }
    return "fwt";
  }

  private _deviceId(): string | undefined {
    if (this._config?.device_id) return this._config.device_id;
    if (!this.hass) return undefined;
    return guessDevice(this.hass, this._config?.variant ?? "fwt");
  }

  protected willUpdate(changed: PropertyValues): void {
    if (!changed.has("hass") && !changed.has("_config")) return;
    if (!this.hass || !this._config) return;

    const deviceId = this._deviceId();
    if (!deviceId) {
      this._error = "Kein Proxon-Gerät gefunden – device_id in der Karte setzen.";
      return;
    }
    const variant = this._variant();

    // Cheap path: re-run whenever the registry object changes, so a renamed or
    // newly enabled entity is picked up without a reload.
    if (this._registry !== this.hass.entities) {
      this._registry = this.hass.entities;
      const fast = mapByTranslationKey(this.hass, deviceId, keysFor(variant));
      if (Object.keys(fast).length) {
        this._map = fast;
        this._error = undefined;
        this._resolvedFor = deviceId;
        return;
      }
    }

    if (this._resolvedFor === deviceId) return;

    // No translation keys: fall back to the registry over the wire. Guard
    // against a second pass while that call is in flight.
    this._resolvedFor = deviceId;
    resolveEntities(this.hass, deviceId, variant)
      .then((map) => {
        this._map = map;
        this._error = Object.keys(map).length
          ? undefined
          : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
      })
      .catch((err: Error) => {
        this._resolvedFor = undefined;
        this._error = `Entity-Registry nicht lesbar: ${err.message}`;
      });
  }

  private _showMoreInfo = (entityId: string): void => {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    if (this._error) {
      return html`<ha-card><div class="error">${this._error}</div></ha-card>`;
    }
    if (!Object.keys(this._map).length) {
      return html`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    }

    const common = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== false,
      onEntityClick: this._showMoreInfo,
    };

    return html`
      <ha-card .header=${this._config.title ?? nothing}>
        <div class="wrap">
          ${this._variant() === "t300"
            ? renderT300({ ...common, extras: this._config.extras ?? {} })
            : renderFwt(common)}
        </div>
      </ha-card>`;
  }

  static styles = css`
    .wrap {
      padding: 8px;
    }
    /* The viewBox carries the aspect ratio; each schematic also sets it
       inline so portrait and landscape variants both lay out correctly. */
    svg {
      display: block;
      width: 100%;
      height: auto;
    }
    .error {
      padding: 16px;
      color: var(--error-color, #db4437);
    }
    text.port {
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      font-size: 30px;
      font-weight: 700;
      fill: #1a1a1a;
    }
    text.bp,
    text.badge {
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      font-size: 30px;
      font-weight: 700;
    }
    text.tag {
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      font-size: 25px;
      fill: #4a4a4a;
    }
    text.val {
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
      font-weight: 700;
    }
    text.val.core {
      font-size: 42px;
    }
    text.val.detail {
      font-size: 30px;
      font-weight: 400;
    }
    @media (prefers-reduced-motion: reduce) {
      svg * {
        animation: none !important;
      }
    }
  `;
}

customElements.define("proxon-schema-card", ProxonSchemaCard);

(window as any).customCards = (window as any).customCards ?? [];
(window as any).customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: false,
});
