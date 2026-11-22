/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vt = globalThis, jt = vt.ShadowRoot && (vt.ShadyCSS === void 0 || vt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Wt = Symbol(), Jt = /* @__PURE__ */ new WeakMap();
let Pe = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Wt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (jt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Jt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Jt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (i) => new Pe(typeof i == "string" ? i : i + "", void 0, Wt), Le = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, o, r) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[r + 1], i[0]);
  return new Pe(e, i, Wt);
}, Ze = (i, t) => {
  if (jt) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), o = vt.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = e.cssText, i.appendChild(s);
  }
}, Qt = jt ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return qe(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Je, defineProperty: Qe, getOwnPropertyDescriptor: ts, getOwnPropertyNames: es, getOwnPropertySymbols: ss, getPrototypeOf: is } = Object, Ft = globalThis, te = Ft.trustedTypes, os = te ? te.emptyScript : "", rs = Ft.reactiveElementPolyfillSupport, ot = (i, t) => i, It = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? os : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, Ne = (i, t) => !Je(i, t), ee = { attribute: !0, type: String, converter: It, reflect: !1, useDefault: !1, hasChanged: Ne };
Symbol.metadata ??= Symbol("metadata"), Ft.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = ee) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(t, s, e);
      o !== void 0 && Qe(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: o, set: r } = ts(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: o, set(n) {
      const l = o?.call(this);
      r?.call(this, n), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? ee;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ot("elementProperties"))) return;
    const t = is(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ot("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ot("properties"))) {
      const e = this.properties, s = [...es(e), ...ss(e)];
      for (const o of s) this.createProperty(o, e[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, o] of e) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const o = this._$Eu(e, s);
      o !== void 0 && this._$Eh.set(o, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const o of s) e.unshift(Qt(o));
    } else t !== void 0 && e.push(Qt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ze(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, s);
    if (o !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : It).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(o) : this.setAttribute(o, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, o = s._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const r = s.getPropertyOptions(o), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : It;
      this._$Em = o;
      const l = n.fromAttribute(e, r.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, o = !1, r) {
    if (t !== void 0) {
      const n = this.constructor;
      if (o === !1 && (r = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Ne)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: o, wrapped: r }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), r !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [o, r] of this._$Ep) this[o] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [o, r] of s) {
        const { wrapped: n } = r, l = this[o];
        n !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, r, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[ot("elementProperties")] = /* @__PURE__ */ new Map(), D[ot("finalized")] = /* @__PURE__ */ new Map(), rs?.({ ReactiveElement: D }), (Ft.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = globalThis, se = (i) => i, At = Yt.trustedTypes, ie = At ? At.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Re = "$lit$", O = `lit$${Math.random().toFixed(9).slice(2)}$`, Ue = "?" + O, ns = `<${Ue}>`, R = document, nt = () => R.createComment(""), at = (i) => i === null || typeof i != "object" && typeof i != "function", Xt = Array.isArray, as = (i) => Xt(i) || typeof i?.[Symbol.iterator] == "function", Tt = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, oe = /-->/g, re = />/g, z = RegExp(`>|${Tt}(?:([^\\s"'>=/]+)(${Tt}*=${Tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ne = /'/g, ae = /"/g, He = /^(?:script|style|textarea|title)$/i, Ie = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), bt = Ie(1), d = Ie(2), X = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), le = /* @__PURE__ */ new WeakMap(), N = R.createTreeWalker(R, 129);
function Be(i, t) {
  if (!Xt(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ie !== void 0 ? ie.createHTML(t) : t;
}
const ls = (i, t) => {
  const e = i.length - 1, s = [];
  let o, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = V;
  for (let l = 0; l < e; l++) {
    const a = i[l];
    let h, u, $ = -1, g = 0;
    for (; g < a.length && (n.lastIndex = g, u = n.exec(a), u !== null); ) g = n.lastIndex, n === V ? u[1] === "!--" ? n = oe : u[1] !== void 0 ? n = re : u[2] !== void 0 ? (He.test(u[2]) && (o = RegExp("</" + u[2], "g")), n = z) : u[3] !== void 0 && (n = z) : n === z ? u[0] === ">" ? (n = o ?? V, $ = -1) : u[1] === void 0 ? $ = -2 : ($ = n.lastIndex - u[2].length, h = u[1], n = u[3] === void 0 ? z : u[3] === '"' ? ae : ne) : n === ae || n === ne ? n = z : n === oe || n === re ? n = V : (n = z, o = void 0);
    const y = n === z && i[l + 1].startsWith("/>") ? " " : "";
    r += n === V ? a + ns : $ >= 0 ? (s.push(h), a.slice(0, $) + Re + a.slice($) + O + y) : a + O + ($ === -2 ? l : y);
  }
  return [Be(i, r + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class lt {
  constructor({ strings: t, _$litType$: e }, s) {
    let o;
    this.parts = [];
    let r = 0, n = 0;
    const l = t.length - 1, a = this.parts, [h, u] = ls(t, e);
    if (this.el = lt.createElement(h, s), N.currentNode = this.el.content, e === 2 || e === 3) {
      const $ = this.el.content.firstChild;
      $.replaceWith(...$.childNodes);
    }
    for (; (o = N.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const $ of o.getAttributeNames()) if ($.endsWith(Re)) {
          const g = u[n++], y = o.getAttribute($).split(O), b = /([.?@])?(.*)/.exec(g);
          a.push({ type: 1, index: r, name: b[2], strings: y, ctor: b[1] === "." ? hs : b[1] === "?" ? ds : b[1] === "@" ? $s : Ct }), o.removeAttribute($);
        } else $.startsWith(O) && (a.push({ type: 6, index: r }), o.removeAttribute($));
        if (He.test(o.tagName)) {
          const $ = o.textContent.split(O), g = $.length - 1;
          if (g > 0) {
            o.textContent = At ? At.emptyScript : "";
            for (let y = 0; y < g; y++) o.append($[y], nt()), N.nextNode(), a.push({ type: 2, index: ++r });
            o.append($[g], nt());
          }
        }
      } else if (o.nodeType === 8) if (o.data === Ue) a.push({ type: 2, index: r });
      else {
        let $ = -1;
        for (; ($ = o.data.indexOf(O, $ + 1)) !== -1; ) a.push({ type: 7, index: r }), $ += O.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = R.createElement("template");
    return s.innerHTML = t, s;
  }
}
function G(i, t, e = i, s) {
  if (t === X) return t;
  let o = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = at(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== r && (o?._$AO?.(!1), r === void 0 ? o = void 0 : (o = new r(i), o._$AT(i, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = o : e._$Cl = o), o !== void 0 && (t = G(i, o._$AS(i, t.values), o, s)), t;
}
class cs {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, o = (t?.creationScope ?? R).importNode(e, !0);
    N.currentNode = o;
    let r = N.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let h;
        a.type === 2 ? h = new ct(r, r.nextSibling, this, t) : a.type === 1 ? h = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (h = new us(r, this, t)), this._$AV.push(h), a = s[++l];
      }
      n !== a?.index && (r = N.nextNode(), n++);
    }
    return N.currentNode = R, o;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class ct {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, o) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = G(this, t, e), at(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : as(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && at(this._$AH) ? this._$AA.nextSibling.data = t : this.T(R.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = lt.createElement(Be(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const r = new cs(o, this), n = r.u(this.options);
      r.p(e), this.T(n), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = le.get(t.strings);
    return e === void 0 && le.set(t.strings, e = new lt(t)), e;
  }
  k(t) {
    Xt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, o = 0;
    for (const r of t) o === e.length ? e.push(s = new ct(this.O(nt()), this.O(nt()), this, this.options)) : s = e[o], s._$AI(r), o++;
    o < e.length && (this._$AR(s && s._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = se(t).nextSibling;
      se(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
let Ct = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, o, r) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(t, e = this, s, o) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) t = G(this, t, e, 0), n = !at(t) || t !== this._$AH && t !== X, n && (this._$AH = t);
    else {
      const l = t;
      let a, h;
      for (t = r[0], a = 0; a < r.length - 1; a++) h = G(this, l[s + a], e, a), h === X && (h = this._$AH[a]), n ||= !at(h) || h !== this._$AH[a], h === c ? t = c : t !== c && (t += (h ?? "") + r[a + 1]), this._$AH[a] = h;
    }
    n && !o && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class hs extends Ct {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class ds extends Ct {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class $s extends Ct {
  constructor(t, e, s, o, r) {
    super(t, e, s, o, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = G(this, t, e, 0) ?? c) === X) return;
    const s = this._$AH, o = t === c && s !== c || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== c && (s === c || o);
    o && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class us {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    G(this, t);
  }
}
const ps = Yt.litHtmlPolyfillSupport;
ps?.(lt, ct), (Yt.litHtmlVersions ??= []).push("3.3.3");
const fs = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let o = s._$litPart$;
  if (o === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = o = new ct(t.insertBefore(nt(), r), r, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = globalThis;
class Y extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = fs(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return X;
  }
}
Y._$litElement$ = !0, Y.finalized = !0, Gt.litElementHydrateSupport?.({ LitElement: Y });
const _s = Gt.litElementPolyfillSupport;
_s?.({ LitElement: Y });
(Gt.litElementVersions ??= []).push("4.2.2");
const ys = /* @__PURE__ */ new Set(["Sommerbetrieb", "Winterbetrieb"]), ms = 2900;
function gs(i) {
  return i !== void 0 && ys.has(i);
}
function vs(i) {
  if (!(i === void 0 || !Number.isFinite(i) || i <= 0))
    return Math.max(1, Math.min(4, Math.round(i / 25)));
}
function bs(i, t, e) {
  return i !== void 0 ? i <= 0 ? void 0 : Math.min(100, i / ms * 100) : t ? e ?? 50 : void 0;
}
const M = "#306291", ws = "#E2E8F2", ut = "#8DC63F", ce = "#F3B229", he = "#79593A", Ot = "#D62631", de = "#1A1A1A", xs = "#7A7A7A", As = "#C3CEDE", $e = "#2F80ED", q = 1600, Z = 900, ue = 210, pe = 120, ks = 1390, Es = 800, Fs = 22, p = 315, f = 605, rt = 62, H = rt / 2, j = 800, pt = 460, W = 168, De = 450, je = 1150, Cs = 42, Ss = 350, ft = 350, _t = 1250, x = 725, P = 900, A = 590, J = 690, I = 1030, E = 240, S = 1360, wt = j - W, xt = j + W, fe = Math.round((wt - E) / (S - E) * 100), _e = Math.round((xt - E) / (S - E) * 100), Ms = 1.29, it = (i) => "M " + i.map(([t, e]) => `${t},${e}`).join(" L ");
function yt(i, t, e, s = 2, o = 36) {
  const r = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const h = i + (e ? a * o : -a * o);
    l.push(d`<path d="M ${h - r},${t - n} L ${h},${t} L ${h - r},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function mt(i, t, e, s = 1) {
  return d`<path id=${e ?? c} d=${it(i)} fill="none" stroke=${t}
    stroke-width=${rt} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function zt(i, t, e, s) {
  return d`<g id=${s}>
    <rect x=${i - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${M} stroke-width="6"/>
    <line x1=${i} y1=${t} x2=${i} y2=${e} stroke=${M} stroke-width="4"/>
  </g>`;
}
function ye(i, t, e) {
  const s = Cs, o = p, r = s * 0.5, n = d`<path d="M ${i - s * 0.78},${o} A ${r} ${r} 0 0 1 ${i},${o}
      A ${r} ${r} 0 0 0 ${i + s * 0.78},${o}" fill="none" stroke=${M}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? c : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${i} ${o}`} to=${`360 ${i} ${o}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return d`<g id=${t}>
    <circle cx=${i} cy=${o} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${M}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function Pt(i, t, e = 4, s = "#FFFFFF") {
  const o = [];
  for (let r = 0; r < e; r++)
    o.push(d`<circle r="9" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${i}`} xlink:href=${`#${i}`}/>
      </animateMotion>
    </circle>`);
  return o;
}
const me = (i, t) => {
  if (!t) return;
  const e = Number(i.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function Ts(i, t) {
  if (!t) return "–";
  const e = i.states[t];
  if (!e) return "–";
  if (i.formatEntityState) return i.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function Os(i, t, e = 3.5, s = 10) {
  return (i === void 0 || i <= 0 ? s : s - Math.min(100, Math.max(0, i)) / 100 * (s - e)) / t;
}
const zs = [
  { key: "t3_frischluft", x: 120, y: p + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: f + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: p + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: f + 22, color: "red", size: "core" },
  { key: "betriebsart", x: 800, y: 165, color: "#1f4e79", size: "core" },
  { key: "lueftung", x: 800, y: 225, color: "dimgray", size: "detail" },
  { key: "geraetefilter_remaining_days", x: 430, y: 195, color: "dimgray", size: "core", prefix: "Filter " },
  { key: "power_total", x: 1250, y: 165, color: "#1f4e79", size: "core" },
  { key: "rf_sensor1", x: 1250, y: 225, color: "dimgray", size: "detail" },
  { key: "drehzahl_zuluft", x: De, y: 420, color: "dimgray", size: "detail" },
  { key: "drehzahl_abluft", x: je, y: 420, color: "dimgray", size: "detail" },
  { key: "kompressor_drehzahl", x: 350, y: 855, color: "dimgray", size: "detail" },
  { key: "kompressor_leistung", x: 620, y: 855, color: "dimgray", size: "detail" },
  { key: "t13_kompressor", x: 880, y: 855, color: "darkred", size: "detail" },
  { key: "bypass_min_frischluft", x: 1130, y: 855, color: "dimgray", size: "detail" },
  { key: "kuehlung_freigabe", x: 1400, y: 855, color: "dimgray", size: "detail", prefix: "Kühlung " }
];
function Ps(i) {
  const { hass: t, map: e, animate: s } = i, o = t.states[e.bypass_offen ?? ""]?.state === "on", r = t.states[e.lueftung ?? ""], n = r?.state === "on", l = r?.attributes?.percentage, a = me(t, e.kompressor_drehzahl), h = me(t, e.drehzahl_zuluft), u = gs(t.states[e.betriebsart ?? ""]?.state), $ = e.vierwege_ventil, y = !!($ && t.states[$]) && t.states[$].state === "on" && (a ?? 0) > 0, b = y ? $e : M, Kt = o ? 0 : 90, K = o ? ut : As, ht = o ? 1 : 0.6, St = o ? 0.18 : 1, dt = bs(h, n, l), v = dt !== void 0, U = Os(dt, i.speed), Vt = s && v, qt = U / 2, Ge = [[E, p], [wt, p], [xt, f], [S, f]], Mt = H + 14, Ke = it([[S, p], [xt, p], [wt, f], [E, f]]), Ve = it([
    [E, p],
    [A, p],
    [A, J],
    [I, J],
    [I, f],
    [S, f]
  ]);
  return d`
    <svg viewBox=${`0 0 ${q} ${Z}`} id="proxon-fwt" data-bypass=${o ? "open" : "closed"}
         style=${`aspect-ratio: ${q} / ${Z}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${E} y1="0" x2=${S} y2="0">
          <stop offset="0%" stop-color=${ut}/><stop offset=${`${fe}%`} stop-color=${ut}/>
          <stop offset=${`${_e}%`} stop-color=${Ot}/><stop offset="100%" stop-color=${Ot}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${S} y1="0" x2=${E} y2="0">
          <stop offset="0%" stop-color=${ce}/><stop offset=${`${fe}%`} stop-color=${ce}/>
          <stop offset=${`${_e}%`} stop-color=${he}/><stop offset="100%" stop-color=${he}/>
        </linearGradient>
        ${o ? d`<mask id="dotsBehindExhaust" maskUnits="userSpaceOnUse" x="0" y="0" width=${q} height=${Z}>
              <rect width=${q} height=${Z} fill="white"/>
              <path d=${Ke} stroke="black" stroke-width=${Mt * 2} fill="none"
                stroke-linejoin="round" stroke-linecap="butt"/>
            </mask>` : c}
      </defs>

      <rect id="backdrop" width=${q} height=${Z} fill="#FFFFFF"/>
      <rect id="case" x=${ue} y=${pe} width=${ks - ue} height=${Es - pe} rx="12"
        fill=${ws} stroke=${M} stroke-width=${Fs}/>

      <g id="flow-extract-exhaust">
        ${mt([[S, p], [xt, p], [wt, f], [E, f]], "url(#gradExhaust)", "flow-exhaust")}
        ${yt(1325, p, !1)}
        ${yt(300, f, !1)}
      </g>

      <g id="flow-fresh-supply">
        ${mt(Ge, "url(#gradSupply)", "flow-supply", St)}
        ${o ? d`${mt([[E, p], [A, p]], ut, "flow-fresh-active")}
                ${mt([[I, f], [S, f]], Ot, "flow-supply-active")}` : c}
        ${yt(275, p, !0)}
        ${yt(1305, f, !0)}
        ${o ? d`<path id="flow-supply-bypass" fill="none" stroke="none" d=${Ve}/>` : c}
      </g>

      <polygon id="heat-exchanger"
        points=${`${j},${pt - W} ${j + W},${pt} ${j},${pt + W} ${j - W},${pt}`}
        fill="none" stroke=${M} stroke-width="10"/>

      <g id="bypass" data-state=${o ? "open" : "closed"}>
        ${[
    it([[A, p + H], [A, f - Mt]]),
    it([[A, f + Mt], [A, J], [I, J], [I, f + H]])
  ].map(
    (w, T) => d`
            <path id=${T === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${w} fill="none"
              stroke=${K} stroke-width=${rt} stroke-linejoin="round" opacity=${ht}/>
            <path d=${w} fill="none" stroke=${M} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${Kt} ${A} ${p + H})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${A - 9} y=${p + H - rt / 2 - 8} width="18" height=${rt + 16} rx="9"
            fill=${M} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${A} cy=${p + H} r="10" fill=${de} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${ye(De, "fan-supply", s && v ? qt : void 0)}
      ${ye(je, "fan-extract", s && v ? qt : void 0)}
      ${zt(Ss, p - 95, p + 95, "preheater")}
      ${zt(ft, f - 110, 700, "evaporator")}
      ${zt(_t, f - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${ft} y1=${x} x2=${_t} y2=${x}
        stroke=${b} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${ft} y1="700" x2=${ft} y2=${x} stroke=${b} stroke-width="7"/>
      <line x1=${_t} y1="700" x2=${_t} y2=${x} stroke=${b} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${P} cy=${x} r="40" fill="#FFFFFF" stroke=${b} stroke-width="9"/>
        <g>
          <path d=${`M ${P - 30},${x - 15} L ${P + 28},${x - 7} L ${P},${x} Z`}
            fill=${b}/>
          ${s && a ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${P} ${x}`} to=${`360 ${P} ${x}`}
                dur=${`${Math.max(1.2, 240 / a) / i.speed}s`} repeatCount="indefinite"/>` : c}
        </g>
        <circle cx=${P} cy=${x} r="7" fill=${de}/>
      </g>

      ${[
    ["Frischluft", 120, p - 30],
    ["Fortluft", 120, f - 30],
    ["Abluft", 1480, p - 30],
    ["Zuluft", 1480, f - 30]
  ].map(
    ([w, T, $t]) => d`<text class="port" x=${T} y=${$t} text-anchor="middle">${w}</text>`
  )}

      <!-- Flow dots live on their own layer above every duct and component.
           Inside the air-path groups they were painted over by whatever came
           later -- the bypass duct alone is a 62-unit opaque stroke. -->
      <g id="flow-dots">
        ${Vt ? Pt("flow-exhaust", U) : c}
        ${Vt ? o ? d`<g mask="url(#dotsBehindExhaust)">
                ${Pt("flow-supply-bypass", U * Ms)}
              </g>` : Pt("flow-supply", U) : c}
      </g>

      ${y ? d`<text class="badge" x="1150" y="700" text-anchor="middle" fill=${$e}>KÜHLEN</text>` : c}

      <text id="bypass-label" class="bp" x=${(A + I) / 2} y=${J - 46}
        text-anchor="middle" fill=${o ? "#4C8C1B" : xs}>
        ${o ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${zs.map((w) => {
    const T = e[w.key];
    let $t = (w.prefix ?? "") + Ts(t, T);
    if (w.key === "lueftung") {
      if (!u) return c;
      const Zt = n ? vs(l) : void 0;
      Zt !== void 0 && ($t = `Stufe ${Zt}`);
    }
    return d`<text class=${`val ${w.size}`} x=${w.x} y=${w.y} text-anchor="middle"
          fill=${w.color} @click=${() => T && i.onEntityClick(T)}
          style=${T ? "cursor: pointer" : "opacity: 0.4"}>
          ${$t}
        </text>`;
  })}
    </svg>`;
}
const Q = "#306291", Ls = "#E2E8F2", Ns = "#F3B229", ge = "#D62631", ve = "#3E8FD0", be = "#1A1A1A", Lt = "#C3CEDE", L = 1e3, Nt = 1500, Rs = 54, we = 20, _ = 210, m = 790, xe = 90, Ae = 520, tt = 520, et = 1430, F = (_ + m) / 2, st = 205, gt = 400, ke = 330, Ee = 38, B = 330, C = 640, k = 455, Rt = 760, Fe = 900, Ce = 1060, Ut = 1140, Ht = 1360, Us = (i) => "M " + i.map(([t, e]) => `${t},${e}`).join(" L ");
function Se(i, t, e, s = 1) {
  return d`<path id=${e} d=${Us(i)} fill="none" stroke=${t} stroke-width=${Rs}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function Me(i, t, e, s = 2, o = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const h = i + a * o;
    l.push(d`<path d="M ${h - 17},${t - 15} L ${h},${t} L ${h - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function Hs(i, t, e, s, o) {
  const r = Ee, n = Ee * 0.5;
  return d`<g id=${e}>
    <circle cx=${i} cy=${t} r=${r} fill="#FFFFFF" fill-opacity="0.6" stroke=${s}
      stroke-width=${Math.round(r * 0.16 * 10) / 10}/>
    <path d="M ${i - r * 0.78},${t} A ${n} ${n} 0 0 1 ${i},${t}
      A ${n} ${n} 0 0 0 ${i + r * 0.78},${t}" fill="none" stroke=${s}
      stroke-width=${Math.round(r * 0.14 * 10) / 10} stroke-linecap="round">
      ${o === void 0 ? c : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${i} ${t}`} to=${`360 ${i} ${t}`} dur=${`${o}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}
function Is(i, t, e, s, o) {
  const r = (e - t) / 7, n = [];
  for (let l = 1; l < 7; l++) {
    const a = t + l * r;
    n.push(d`<line x1=${a} y1=${i - 24} x2=${a} y2=${i + 24} stroke=${o} stroke-width="3.5"/>`);
  }
  return d`<g id=${s}>
    <rect x=${t} y=${i - 24} width=${e - t} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${o} stroke-width="5"/>
    ${n}
  </g>`;
}
function Bs(i, t, e, s, o, r) {
  const l = (s - e) / 5;
  let a = `M ${i},${e}`;
  for (let h = 0; h < 5; h++) {
    const u = e + h * l;
    a += ` L ${t},${u + l * 0.45} L ${i},${u + l * 0.9}`;
  }
  return d`<path id=${o} d=${a} fill="none" stroke=${r} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function Te(i, t, e = 3, s = "#FFFFFF") {
  const o = [];
  for (let r = 0; r < e; r++)
    o.push(d`<circle r="8" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${i}`} xlink:href=${`#${i}`}/>
      </animateMotion>
    </circle>`);
  return o;
}
function Ds(i, t) {
  if (!t) return "–";
  const e = i.states[t];
  if (!e) return "–";
  if (i.formatEntityState) return i.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function js(i) {
  const { hass: t, map: e, extras: s, animate: o } = i, r = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", h = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), u = r ? Ns : Lt, $ = r ? ve : Lt, g = r ? ge : Lt, y = r ? Q : "#8FA3BC", b = r ? 1 : 0.55, K = (10 - (Number.isFinite(h) ? Math.min(100, Math.max(0, h)) : 60) / 100 * (10 - 3.5)) / i.speed, ht = o && r, St = K / 2, dt = [
    { entityId: e.t300_behaelter_avg, x: F, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: F, y: 685, color: "#1f4e79", size: "core" },
    // Clear of the hot-gas line that drops to the condenser coil at
    // DEV_X1 - 60 = 730: a 42 px reading is ~140 wide, so anything centred right
    // of ~655 gets the pipe drawn through it.
    { entityId: e.t300_temp_eheiz, x: m - 160, y: Rt, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: m - 160, y: Fe, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: m - 160, y: Ce, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: F, y: 140, color: "#1f4e79", size: "core" },
    // Between the fan circle (ends at Y_AIR_IN + FAN_RAD = 243) and the
    // evaporator block (starts at EVAP_Y - 24 = 306). Moving EVAP_Y down bought
    // that strip: at the old 300 it was 33 units for a 30 px line, so the label
    // sat on the fan and the block at once.
    { entityId: e.t300_ventilator_pct, x: ke, y: 282, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return d`
    <svg viewBox=${`0 0 ${L} ${Nt}`} id="proxon-t300" data-state=${r ? "running" : "idle"}
         style=${`aspect-ratio: ${L} / ${Nt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${L} height=${Nt} fill="#FFFFFF"/>

      <rect id="tank" x=${_} y=${tt} width=${m - _} height=${et - tt}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${Q} stroke-width=${we}/>
      <path d=${`M ${m},${tt + 90} L ${L - 60},${tt + 90}`} stroke=${ge}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${m},${et - 70} L ${L - 60},${et - 70}`} stroke=${ve}
        stroke-width="24" stroke-linecap="round"/>
      <!-- Left-anchored at the tank wall: right-anchoring at the port end put the
           wider of the two words back over the tank body. -->
      <text class="port" x=${m + 16} y=${tt + 52}>Warmwasser</text>
      <text class="port" x=${m + 16} y=${et - 100}>Kaltwasser</text>

      ${Bs(m - 50, _ + 50, Ut, Ht, "condenser-coil", g)}

      <g id="e-heater">
        <rect x=${_ + 50} y=${Rt - 12} width=${(m - _) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : Q}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${_ + 78},${Rt} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : Q} stroke-width="4.5"/>
      </g>

      ${[[Fe, "T21 Mitte"], [Ce, "T20 unten"]].map(
    ([v, U]) => d`
          <circle cx=${_ + 90} cy=${v} r="9" fill=${be}/>
          <text class="tag" x=${_ + 110} y=${v + 9}>${U}</text>`
  )}

      <rect id="hp-case" x=${_} y=${xe} width=${m - _} height=${Ae - xe}
        rx="24" fill=${Ls} fill-opacity="0.9" stroke=${Q} stroke-width=${we}/>

      ${Se([[40, st], [F, st], [F, B]], u, "flow-air-in", b)}
      ${Se([[F, B], [F, gt], [L - 40, gt]], $, "flow-air-out", b)}
      ${Me(120, st)}
      ${Me(920, gt)}

      ${Hs(ke, st, "fan-t300", y, o && r ? St : void 0)}
      ${Is(B, _ + 60, m - 60, "evaporator", y)}

      <g id="refrigerant" opacity=${b}>
        <path d=${`M ${_ + 150},${B + 24} L ${_ + 150},${k} L ${C - 42},${k}`}
          fill="none" stroke=${g} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${C + 42},${k} L ${m - 60},${k} L ${m - 60},${Ut} L ${m - 50},${Ut}`}
          fill="none" stroke=${g} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${_ + 50},${Ht} L ${_ + 26},${Ht} L ${_ + 26},${B + 24} L ${_ + 62},${B + 24}`}
          fill="none" stroke=${g} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${C} cy=${k} r="42" fill="#FFFFFF" stroke=${y} stroke-width="9"/>
        <g>
          <path d=${`M ${C - 31},${k - 15} L ${C + 29},${k - 7} L ${C},${k} Z`}
            fill=${y}/>
          ${o && r ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${C} ${k}`} to=${`360 ${C} ${k}`}
                dur=${`${1.8 / i.speed}s`} repeatCount="indefinite"/>` : c}
        </g>
        <circle cx=${C} cy=${k} r="7" fill=${be}/>
      </g>

      <!-- Same reason as on the FWT: above the lamellae block and the fan. -->
      <g id="flow-dots">
        ${ht ? Te("flow-air-in", K) : c}
        ${ht ? Te("flow-air-out", K) : c}
      </g>

      <text class="port" x="40" y=${st - 48}>Luft an</text>
      <text class="port" x=${L - 40} y=${gt + 66} text-anchor="end">Luft ab</text>

      ${l ? d`<text class="badge" x=${F} y=${Ae - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : c}
      ${a ? d`<text class="badge" x=${F} y=${et + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : c}

      ${dt.map(
    (v) => d`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => v.entityId && i.onEntityClick(v.entityId)}
          style=${v.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${Ds(t, v.entityId)}
        </text>`
  )}
    </svg>`;
}
const Ws = [
  "t1_zuluft",
  "t3_frischluft",
  "t4_fortluft",
  "t7_abluft",
  "t13_kompressor",
  "betriebsart",
  "lueftung",
  "geraetefilter_remaining_days",
  "power_total",
  "rf_sensor1",
  "drehzahl_zuluft",
  "drehzahl_abluft",
  "kompressor_drehzahl",
  "kompressor_leistung",
  "bypass_offen",
  "bypass_min_frischluft",
  "kuehlung_freigabe",
  // Reversing valve = the plant is actually cooling. Disabled by default in
  // the integration, so the card must cope with it being absent.
  "vierwege_ventil"
], Ys = [
  "t300_betriebsart",
  "t300_behaelter_avg",
  "t300_solltemperatur_akt",
  "t300_temp_eheiz",
  "t300_t20_behaelter_unten",
  "t300_t21_behaelter_mitte",
  "t300_ventilator_pct",
  "t300_ventilator_rpm",
  "t300_kompressor_aktiv",
  "t300_eheiz_aktiv",
  "t300_abtau_aktiv",
  "t300_solar_aktiv"
];
function We(i) {
  return i === "t300" ? Ys : Ws;
}
function Ye(i, t) {
  const e = (i.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function Xs(i, t, e) {
  const s = i.filter(
    (r) => r.device_id === t && r.platform === "proxon" && !r.disabled_by
  ), o = {};
  for (const r of e) {
    const n = `_${r}`, l = s.find((a) => a.unique_id.endsWith(n));
    l && (o[r] = l.entity_id);
  }
  return o;
}
function Xe(i, t, e) {
  const s = {}, o = new Set(e);
  for (const r of Object.values(i.entities ?? {})) {
    if (r.device_id !== t || r.platform !== "proxon") continue;
    const n = r.translation_key;
    n && o.has(n) && (s[n] = r.entity_id);
  }
  return s;
}
async function Gs(i, t, e) {
  const s = We(e), o = Xe(i, t, s);
  if (Object.keys(o).length) return o;
  const r = await i.callWS({
    type: "config/entity_registry/list"
  });
  return Xs(r, t, s);
}
function Oe(i, t = "fwt") {
  const e = t === "t300" ? "T300" : "FWT 2.0", o = Object.values(i.devices ?? {}).filter(
    (r) => (r.identifiers ?? []).some((n) => n[0] === "proxon") && r.model === e
  );
  return o.length === 1 ? o[0].id : void 0;
}
const ze = [
  { name: "device_id", required: !0, selector: { device: { integration: "proxon" } } },
  { name: "title", selector: { text: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "animate", selector: { boolean: {} } },
      {
        name: "animation_speed",
        selector: { number: { min: 0.25, max: 3, step: 0.25, mode: "slider" } }
      }
    ]
  }
], Ks = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } }
  ]
}, Vs = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss"
}, qs = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss"
}, kt = class kt extends Y {
  constructor() {
    super(...arguments), this._computeLabel = (t) => Vs[t.name] ?? t.name, this._computeHelper = (t) => qs[t.name] ?? "";
  }
  setConfig(t) {
    this._config = t;
  }
  _schema() {
    const t = this._config?.device_id;
    return this._config?.variant === "t300" || (this.hass && t ? Ye(this.hass, t) === "t300" : !1) ? [...ze, Ks] : ze;
  }
  _valueChanged(t) {
    t.stopPropagation(), this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: t.detail.value },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return !this.hass || !this._config ? c : bt`
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
};
kt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, kt.styles = Le`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
let Bt = kt;
customElements.define("proxon-schema-card-editor", Bt);
const Et = class Et extends Y {
  constructor() {
    super(...arguments), this._map = {}, this._showMoreInfo = (t) => {
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          detail: { entityId: t },
          bubbles: !0,
          composed: !0
        })
      );
    };
  }
  setConfig(t) {
    this._config = { animate: !0, ...t }, this._resolvedFor = void 0, this._registry = void 0, this._map = {};
  }
  getCardSize() {
    return this._variant() === "t300" ? 10 : 6;
  }
  static getStubConfig(t) {
    return { device_id: Oe(t, "fwt") };
  }
  static getConfigElement() {
    return document.createElement("proxon-schema-card-editor");
  }
  _variant() {
    if (this._config?.variant) return this._config.variant;
    const t = this._deviceId();
    if (this.hass && t) {
      const e = Ye(this.hass, t);
      if (e) return e;
    }
    return "fwt";
  }
  _deviceId() {
    if (this._config?.device_id) return this._config.device_id;
    if (this.hass)
      return Oe(this.hass, this._config?.variant ?? "fwt");
  }
  willUpdate(t) {
    if (!t.has("hass") && !t.has("_config") || !this.hass || !this._config) return;
    const e = this._deviceId();
    if (!e) {
      this._error = "Kein Proxon-Gerät gefunden – device_id in der Karte setzen.";
      return;
    }
    const s = this._variant();
    if (this._registry !== this.hass.entities) {
      this._registry = this.hass.entities;
      const o = Xe(this.hass, e, We(s));
      if (Object.keys(o).length) {
        this._map = o, this._error = void 0, this._resolvedFor = e;
        return;
      }
    }
    this._resolvedFor !== e && (this._resolvedFor = e, Gs(this.hass, e, s).then((o) => {
      this._map = o, this._error = Object.keys(o).length ? void 0 : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
    }).catch((o) => {
      this._resolvedFor = void 0, this._error = `Entity-Registry nicht lesbar: ${o.message}`;
    }));
  }
  render() {
    if (!this.hass || !this._config) return c;
    if (this._error)
      return bt`<ha-card><div class="error">${this._error}</div></ha-card>`;
    if (!Object.keys(this._map).length)
      return bt`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    const t = Number(this._config.animation_speed), e = Number.isFinite(t) && t > 0 ? Math.min(5, Math.max(0.1, t)) : 1, s = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      speed: e,
      onEntityClick: this._showMoreInfo
    };
    return bt`
      <ha-card .header=${this._config.title ?? c}>
        <div class="wrap">
          ${this._variant() === "t300" ? js({ ...s, extras: this._config.extras ?? {} }) : Ps(s)}
        </div>
      </ha-card>`;
  }
};
Et.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, Et.styles = Le`
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
let Dt = Et;
customElements.define("proxon-schema-card", Dt);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
