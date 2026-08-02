/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vt = globalThis, Bt = vt.ShadowRoot && (vt.ShadyCSS === void 0 || vt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Dt = Symbol(), Gt = /* @__PURE__ */ new WeakMap();
let Ce = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Dt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Bt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Gt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Gt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const We = (o) => new Ce(typeof o == "string" ? o : o + "", void 0, Dt), Se = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((s, i, r) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[r + 1], o[0]);
  return new Ce(e, o, Dt);
}, Ye = (o, t) => {
  if (Bt) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = vt.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, o.appendChild(s);
  }
}, Kt = Bt ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return We(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Xe, defineProperty: Ge, getOwnPropertyDescriptor: Ke, getOwnPropertyNames: Ve, getOwnPropertySymbols: qe, getPrototypeOf: Ze } = Object, Ft = globalThis, Vt = Ft.trustedTypes, Je = Vt ? Vt.emptyScript : "", Qe = Ft.reactiveElementPolyfillSupport, rt = (o, t) => o, Ut = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? Je : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, Te = (o, t) => !Xe(o, t), qt = { attribute: !0, type: String, converter: Ut, reflect: !1, useDefault: !1, hasChanged: Te };
Symbol.metadata ??= Symbol("metadata"), Ft.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = qt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Ge(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = Ke(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const l = i?.call(this);
      r?.call(this, n), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? qt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(rt("elementProperties"))) return;
    const t = Ze(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(rt("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(rt("properties"))) {
      const e = this.properties, s = [...Ve(e), ...qe(e)];
      for (const i of s) this.createProperty(i, e[i]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, i] of e) this.elementProperties.set(s, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const i = this._$Eu(e, s);
      i !== void 0 && this._$Eh.set(i, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const i of s) e.unshift(Kt(i));
    } else t !== void 0 && e.push(Kt(t));
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
    return Ye(t, this.constructor.elementStyles), t;
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
    const s = this.constructor.elementProperties.get(t), i = this.constructor._$Eu(t, s);
    if (i !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : Ut).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Ut;
      this._$Em = i;
      const l = n.fromAttribute(e, r.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (r = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Te)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: r }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), r !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, r] of s) {
        const { wrapped: n } = r, l = this[i];
        n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, r, l);
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
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[rt("elementProperties")] = /* @__PURE__ */ new Map(), D[rt("finalized")] = /* @__PURE__ */ new Map(), Qe?.({ ReactiveElement: D }), (Ft.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const jt = globalThis, Zt = (o) => o, At = jt.trustedTypes, Jt = At ? At.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, Me = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, Oe = "?" + z, ts = `<${Oe}>`, U = document, at = () => U.createComment(""), lt = (o) => o === null || typeof o != "object" && typeof o != "function", Wt = Array.isArray, es = (o) => Wt(o) || typeof o?.[Symbol.iterator] == "function", St = `[ 	
\f\r]`, q = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Qt = /-->/g, te = />/g, L = RegExp(`>|${St}(?:([^\\s"'>=/]+)(${St}*=${St}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ee = /'/g, se = /"/g, ze = /^(?:script|style|textarea|title)$/i, Pe = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), xt = Pe(1), d = Pe(2), X = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ie = /* @__PURE__ */ new WeakMap(), R = U.createTreeWalker(U, 129);
function Le(o, t) {
  if (!Wt(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Jt !== void 0 ? Jt.createHTML(t) : t;
}
const ss = (o, t) => {
  const e = o.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = q;
  for (let l = 0; l < e; l++) {
    const a = o[l];
    let c, u, $ = -1, _ = 0;
    for (; _ < a.length && (n.lastIndex = _, u = n.exec(a), u !== null); ) _ = n.lastIndex, n === q ? u[1] === "!--" ? n = Qt : u[1] !== void 0 ? n = te : u[2] !== void 0 ? (ze.test(u[2]) && (i = RegExp("</" + u[2], "g")), n = L) : u[3] !== void 0 && (n = L) : n === L ? u[0] === ">" ? (n = i ?? q, $ = -1) : u[1] === void 0 ? $ = -2 : ($ = n.lastIndex - u[2].length, c = u[1], n = u[3] === void 0 ? L : u[3] === '"' ? se : ee) : n === se || n === ee ? n = L : n === Qt || n === te ? n = q : (n = L, i = void 0);
    const m = n === L && o[l + 1].startsWith("/>") ? " " : "";
    r += n === q ? a + ts : $ >= 0 ? (s.push(c), a.slice(0, $) + Me + a.slice($) + z + m) : a + z + ($ === -2 ? l : m);
  }
  return [Le(o, r + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class ct {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, n = 0;
    const l = t.length - 1, a = this.parts, [c, u] = ss(t, e);
    if (this.el = ct.createElement(c, s), R.currentNode = this.el.content, e === 2 || e === 3) {
      const $ = this.el.content.firstChild;
      $.replaceWith(...$.childNodes);
    }
    for (; (i = R.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const $ of i.getAttributeNames()) if ($.endsWith(Me)) {
          const _ = u[n++], m = i.getAttribute($).split(z), E = /([.?@])?(.*)/.exec(_);
          a.push({ type: 1, index: r, name: E[2], strings: m, ctor: E[1] === "." ? os : E[1] === "?" ? rs : E[1] === "@" ? ns : Ct }), i.removeAttribute($);
        } else $.startsWith(z) && (a.push({ type: 6, index: r }), i.removeAttribute($));
        if (ze.test(i.tagName)) {
          const $ = i.textContent.split(z), _ = $.length - 1;
          if (_ > 0) {
            i.textContent = At ? At.emptyScript : "";
            for (let m = 0; m < _; m++) i.append($[m], at()), R.nextNode(), a.push({ type: 2, index: ++r });
            i.append($[_], at());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Oe) a.push({ type: 2, index: r });
      else {
        let $ = -1;
        for (; ($ = i.data.indexOf(z, $ + 1)) !== -1; ) a.push({ type: 7, index: r }), $ += z.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = U.createElement("template");
    return s.innerHTML = t, s;
  }
}
function G(o, t, e = o, s) {
  if (t === X) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = lt(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(o), i._$AT(o, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = G(o, i._$AS(o, t.values), i, s)), t;
}
class is {
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
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? U).importNode(e, !0);
    R.currentNode = i;
    let r = R.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new ht(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new as(r, this, t)), this._$AV.push(c), a = s[++l];
      }
      n !== a?.index && (r = R.nextNode(), n++);
    }
    return R.currentNode = U, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class ht {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, i) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    t = G(this, t, e), lt(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : es(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && lt(this._$AH) ? this._$AA.nextSibling.data = t : this.T(U.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = ct.createElement(Le(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new is(i, this), n = r.u(this.options);
      r.p(e), this.T(n), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = ie.get(t.strings);
    return e === void 0 && ie.set(t.strings, e = new ct(t)), e;
  }
  k(t) {
    Wt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new ht(this.O(at()), this.O(at()), this, this.options)) : s = e[i], s._$AI(r), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = Zt(t).nextSibling;
      Zt(t).remove(), t = s;
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
  constructor(t, e, s, i, r) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, i) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) t = G(this, t, e, 0), n = !lt(t) || t !== this._$AH && t !== X, n && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++) c = G(this, l[s + a], e, a), c === X && (c = this._$AH[a]), n ||= !lt(c) || c !== this._$AH[a], c === h ? t = h : t !== h && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class os extends Ct {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class rs extends Ct {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class ns extends Ct {
  constructor(t, e, s, i, r) {
    super(t, e, s, i, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = G(this, t, e, 0) ?? h) === X) return;
    const s = this._$AH, i = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, r = t !== h && (s === h || i);
    i && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class as {
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
const ls = jt.litHtmlPolyfillSupport;
ls?.(ct, ht), (jt.litHtmlVersions ??= []).push("3.3.3");
const cs = (o, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new ht(t.insertBefore(at(), r), r, void 0, e ?? {});
  }
  return i._$AI(o), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = globalThis;
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = cs(e, this.renderRoot, this.renderOptions);
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
Y._$litElement$ = !0, Y.finalized = !0, Yt.litElementHydrateSupport?.({ LitElement: Y });
const hs = Yt.litElementPolyfillSupport;
hs?.({ LitElement: Y });
(Yt.litElementVersions ??= []).push("4.2.2");
const M = "#306291", ds = "#E2E8F2", pt = "#8DC63F", oe = "#F3B229", re = "#79593A", Tt = "#D62631", ne = "#1A1A1A", $s = "#7A7A7A", ps = "#C3CEDE", ae = "#2F80ED", Z = 1600, J = 900, le = 210, ce = 120, us = 1390, fs = 800, _s = 22, p = 315, f = 605, nt = 62, H = nt / 2, j = 800, ut = 460, W = 168, Ne = 450, Re = 1150, ys = 42, ms = 350, ft = 350, _t = 1250, b = 725, N = 900, w = 590, Q = 690, I = 1030, k = 240, T = 1360, bt = j - W, wt = j + W, he = Math.round((bt - k) / (T - k) * 100), de = Math.round((wt - k) / (T - k) * 100), gs = 1.29, ot = (o) => "M " + o.map(([t, e]) => `${t},${e}`).join(" L ");
function yt(o, t, e, s = 2, i = 36) {
  const r = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const c = o + (e ? a * i : -a * i);
    l.push(d`<path d="M ${c - r},${t - n} L ${c},${t} L ${c - r},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function mt(o, t, e, s = 1) {
  return d`<path id=${e ?? h} d=${ot(o)} fill="none" stroke=${t}
    stroke-width=${nt} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function Mt(o, t, e, s) {
  return d`<g id=${s}>
    <rect x=${o - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${M} stroke-width="6"/>
    <line x1=${o} y1=${t} x2=${o} y2=${e} stroke=${M} stroke-width="4"/>
  </g>`;
}
function $e(o, t, e) {
  const s = ys, i = p, r = s * 0.5, n = d`<path d="M ${o - s * 0.78},${i} A ${r} ${r} 0 0 1 ${o},${i}
      A ${r} ${r} 0 0 0 ${o + s * 0.78},${i}" fill="none" stroke=${M}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? h : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${o} ${i}`} to=${`360 ${o} ${i}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return d`<g id=${t}>
    <circle cx=${o} cy=${i} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${M}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function Ot(o, t, e = 4, s = "#FFFFFF") {
  const i = [];
  for (let r = 0; r < e; r++)
    i.push(d`<circle r="9" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${o}`} xlink:href=${`#${o}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
const vs = (o, t) => {
  if (!t) return;
  const e = Number(o.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function xs(o, t) {
  if (!t) return "–";
  const e = o.states[t];
  if (!e) return "–";
  if (o.formatEntityState) return o.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function bs(o, t, e = 3.5, s = 10) {
  return (o === void 0 || o <= 0 ? s : s - Math.min(100, Math.max(0, o)) / 100 * (s - e)) / t;
}
const ws = [
  { key: "t3_frischluft", x: 120, y: p + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: f + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: p + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: f + 22, color: "red", size: "core" },
  { key: "betriebsart", x: 800, y: 165, color: "#1f4e79", size: "core" },
  { key: "lueftung", x: 800, y: 225, color: "dimgray", size: "detail" },
  { key: "geraetefilter_remaining_days", x: 430, y: 195, color: "dimgray", size: "core", prefix: "Filter " },
  { key: "power_total", x: 1250, y: 165, color: "#1f4e79", size: "core" },
  { key: "rf_sensor1", x: 1250, y: 225, color: "dimgray", size: "detail" },
  { key: "drehzahl_zuluft", x: Ne, y: 420, color: "dimgray", size: "detail" },
  { key: "drehzahl_abluft", x: Re, y: 420, color: "dimgray", size: "detail" },
  { key: "kompressor_drehzahl", x: 350, y: 855, color: "dimgray", size: "detail" },
  { key: "kompressor_leistung", x: 620, y: 855, color: "dimgray", size: "detail" },
  { key: "t13_kompressor", x: 880, y: 855, color: "darkred", size: "detail" },
  { key: "bypass_min_frischluft", x: 1130, y: 855, color: "dimgray", size: "detail" },
  { key: "kuehlung_freigabe", x: 1400, y: 855, color: "dimgray", size: "detail", prefix: "Kühlung " }
];
function As(o) {
  const { hass: t, map: e, animate: s } = o, i = t.states[e.bypass_offen ?? ""]?.state === "on", r = t.states[e.lueftung ?? ""], n = r?.state === "on", l = r?.attributes?.percentage, a = vs(t, e.kompressor_drehzahl), c = e.vierwege_ventil, $ = !!(c && t.states[c]) && t.states[c].state === "on" && (a ?? 0) > 0, _ = $ ? ae : M, m = i ? 0 : 90, E = i ? pt : ps, Xt = i ? 1 : 0.6, K = i ? 0.18 : 1, P = bs(n ? l ?? 50 : void 0, o.speed), dt = s && n, $t = P / 2, v = [[k, p], [bt, p], [wt, f], [T, f]], V = H + 14, Be = ot([[T, p], [wt, p], [bt, f], [k, f]]), De = ot([
    [k, p],
    [w, p],
    [w, Q],
    [I, Q],
    [I, f],
    [T, f]
  ]);
  return d`
    <svg viewBox=${`0 0 ${Z} ${J}`} id="proxon-fwt" data-bypass=${i ? "open" : "closed"}
         style=${`aspect-ratio: ${Z} / ${J}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${k} y1="0" x2=${T} y2="0">
          <stop offset="0%" stop-color=${pt}/><stop offset=${`${he}%`} stop-color=${pt}/>
          <stop offset=${`${de}%`} stop-color=${Tt}/><stop offset="100%" stop-color=${Tt}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${T} y1="0" x2=${k} y2="0">
          <stop offset="0%" stop-color=${oe}/><stop offset=${`${he}%`} stop-color=${oe}/>
          <stop offset=${`${de}%`} stop-color=${re}/><stop offset="100%" stop-color=${re}/>
        </linearGradient>
        ${i ? d`<mask id="dotsBehindExhaust" maskUnits="userSpaceOnUse" x="0" y="0" width=${Z} height=${J}>
              <rect width=${Z} height=${J} fill="white"/>
              <path d=${Be} stroke="black" stroke-width=${V * 2} fill="none"
                stroke-linejoin="round" stroke-linecap="butt"/>
            </mask>` : h}
      </defs>

      <rect id="backdrop" width=${Z} height=${J} fill="#FFFFFF"/>
      <rect id="case" x=${le} y=${ce} width=${us - le} height=${fs - ce} rx="12"
        fill=${ds} stroke=${M} stroke-width=${_s}/>

      <g id="flow-extract-exhaust">
        ${mt([[T, p], [wt, p], [bt, f], [k, f]], "url(#gradExhaust)", "flow-exhaust")}
        ${yt(1325, p, !1)}
        ${yt(300, f, !1)}
      </g>

      <g id="flow-fresh-supply">
        ${mt(v, "url(#gradSupply)", "flow-supply", K)}
        ${i ? d`${mt([[k, p], [w, p]], pt, "flow-fresh-active")}
                ${mt([[I, f], [T, f]], Tt, "flow-supply-active")}` : h}
        ${yt(275, p, !0)}
        ${yt(1305, f, !0)}
        ${i ? d`<path id="flow-supply-bypass" fill="none" stroke="none" d=${De}/>` : h}
      </g>

      <polygon id="heat-exchanger"
        points=${`${j},${ut - W} ${j + W},${ut} ${j},${ut + W} ${j - W},${ut}`}
        fill="none" stroke=${M} stroke-width="10"/>

      <g id="bypass" data-state=${i ? "open" : "closed"}>
        ${[
    ot([[w, p + H], [w, f - V]]),
    ot([[w, f + V], [w, Q], [I, Q], [I, f + H]])
  ].map(
    (x, O) => d`
            <path id=${O === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${x} fill="none"
              stroke=${E} stroke-width=${nt} stroke-linejoin="round" opacity=${Xt}/>
            <path d=${x} fill="none" stroke=${M} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${m} ${w} ${p + H})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${w - 9} y=${p + H - nt / 2 - 8} width="18" height=${nt + 16} rx="9"
            fill=${M} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${w} cy=${p + H} r="10" fill=${ne} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${$e(Ne, "fan-supply", s && n ? $t : void 0)}
      ${$e(Re, "fan-extract", s && n ? $t : void 0)}
      ${Mt(ms, p - 95, p + 95, "preheater")}
      ${Mt(ft, f - 110, 700, "evaporator")}
      ${Mt(_t, f - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${ft} y1=${b} x2=${_t} y2=${b}
        stroke=${_} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${ft} y1="700" x2=${ft} y2=${b} stroke=${_} stroke-width="7"/>
      <line x1=${_t} y1="700" x2=${_t} y2=${b} stroke=${_} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${N} cy=${b} r="40" fill="#FFFFFF" stroke=${_} stroke-width="9"/>
        <g>
          <path d=${`M ${N - 30},${b - 15} L ${N + 28},${b - 7} L ${N},${b} Z`}
            fill=${_}/>
          ${s && a ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${N} ${b}`} to=${`360 ${N} ${b}`}
                dur=${`${Math.max(1.2, 240 / a) / o.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${N} cy=${b} r="7" fill=${ne}/>
      </g>

      ${[
    ["Frischluft", 120, p - 30],
    ["Fortluft", 120, f - 30],
    ["Abluft", 1480, p - 30],
    ["Zuluft", 1480, f - 30]
  ].map(
    ([x, O, je]) => d`<text class="port" x=${O} y=${je} text-anchor="middle">${x}</text>`
  )}

      <!-- Flow dots live on their own layer above every duct and component.
           Inside the air-path groups they were painted over by whatever came
           later -- the bypass duct alone is a 62-unit opaque stroke. -->
      <g id="flow-dots">
        ${dt ? Ot("flow-exhaust", P) : h}
        ${dt ? i ? d`<g mask="url(#dotsBehindExhaust)">
                ${Ot("flow-supply-bypass", P * gs)}
              </g>` : Ot("flow-supply", P) : h}
      </g>

      ${$ ? d`<text class="badge" x="1150" y="700" text-anchor="middle" fill=${ae}>KÜHLEN</text>` : h}

      <text id="bypass-label" class="bp" x=${(w + I) / 2} y=${Q - 46}
        text-anchor="middle" fill=${i ? "#4C8C1B" : $s}>
        ${i ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${ws.map((x) => {
    const O = e[x.key];
    return d`<text class=${`val ${x.size}`} x=${x.x} y=${x.y} text-anchor="middle"
          fill=${x.color} @click=${() => O && o.onEntityClick(O)}
          style=${O ? "cursor: pointer" : "opacity: 0.4"}>
          ${(x.prefix ?? "") + xs(t, O)}
        </text>`;
  })}
    </svg>`;
}
const tt = "#306291", ks = "#E2E8F2", Es = "#F3B229", pe = "#D62631", ue = "#3E8FD0", fe = "#1A1A1A", zt = "#C3CEDE", F = 1e3, Pt = 1500, Fs = 54, _e = 20, y = 210, g = 790, ye = 90, me = 520, et = 520, st = 1430, C = (y + g) / 2, it = 205, gt = 400, ge = 330, ve = 38, B = 300, S = 640, A = 455, Lt = 760, xe = 900, be = 1060, Nt = 1140, Rt = 1360, Cs = (o) => "M " + o.map(([t, e]) => `${t},${e}`).join(" L ");
function we(o, t, e, s = 1) {
  return d`<path id=${e} d=${Cs(o)} fill="none" stroke=${t} stroke-width=${Fs}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function Ae(o, t, e, s = 2, i = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const c = o + a * i;
    l.push(d`<path d="M ${c - 17},${t - 15} L ${c},${t} L ${c - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function Ss(o, t, e, s, i) {
  const r = ve, n = ve * 0.5;
  return d`<g id=${e}>
    <circle cx=${o} cy=${t} r=${r} fill="#FFFFFF" fill-opacity="0.6" stroke=${s}
      stroke-width=${Math.round(r * 0.16 * 10) / 10}/>
    <path d="M ${o - r * 0.78},${t} A ${n} ${n} 0 0 1 ${o},${t}
      A ${n} ${n} 0 0 0 ${o + r * 0.78},${t}" fill="none" stroke=${s}
      stroke-width=${Math.round(r * 0.14 * 10) / 10} stroke-linecap="round">
      ${i === void 0 ? h : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${o} ${t}`} to=${`360 ${o} ${t}`} dur=${`${i}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}
function Ts(o, t, e, s, i) {
  const r = (e - t) / 7, n = [];
  for (let l = 1; l < 7; l++) {
    const a = t + l * r;
    n.push(d`<line x1=${a} y1=${o - 24} x2=${a} y2=${o + 24} stroke=${i} stroke-width="3.5"/>`);
  }
  return d`<g id=${s}>
    <rect x=${t} y=${o - 24} width=${e - t} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${i} stroke-width="5"/>
    ${n}
  </g>`;
}
function Ms(o, t, e, s, i, r) {
  const l = (s - e) / 5;
  let a = `M ${o},${e}`;
  for (let c = 0; c < 5; c++) {
    const u = e + c * l;
    a += ` L ${t},${u + l * 0.45} L ${o},${u + l * 0.9}`;
  }
  return d`<path id=${i} d=${a} fill="none" stroke=${r} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function ke(o, t, e = 3, s = "#FFFFFF") {
  const i = [];
  for (let r = 0; r < e; r++)
    i.push(d`<circle r="8" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${o}`} xlink:href=${`#${o}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
function Os(o, t) {
  if (!t) return "–";
  const e = o.states[t];
  if (!e) return "–";
  if (o.formatEntityState) return o.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function zs(o) {
  const { hass: t, map: e, extras: s, animate: i } = o, r = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", c = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), u = r ? Es : zt, $ = r ? ue : zt, _ = r ? pe : zt, m = r ? tt : "#8FA3BC", E = r ? 1 : 0.55, K = (10 - (Number.isFinite(c) ? Math.min(100, Math.max(0, c)) : 60) / 100 * (10 - 3.5)) / o.speed, P = i && r, dt = K / 2, $t = [
    { entityId: e.t300_behaelter_avg, x: C, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: C, y: 685, color: "#1f4e79", size: "core" },
    { entityId: e.t300_temp_eheiz, x: g - 95, y: Lt, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: g - 110, y: xe, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: g - 110, y: be, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: C, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: e.t300_ventilator_pct, x: ge, y: 264, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return d`
    <svg viewBox=${`0 0 ${F} ${Pt}`} id="proxon-t300" data-state=${r ? "running" : "idle"}
         style=${`aspect-ratio: ${F} / ${Pt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${F} height=${Pt} fill="#FFFFFF"/>

      <rect id="tank" x=${y} y=${et} width=${g - y} height=${st - et}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${tt} stroke-width=${_e}/>
      <path d=${`M ${g},${et + 90} L ${F - 60},${et + 90}`} stroke=${pe}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${g},${st - 70} L ${F - 60},${st - 70}`} stroke=${ue}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${F - 60} y=${et + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${F - 60} y=${st - 100} text-anchor="end">Kaltwasser</text>

      ${Ms(g - 50, y + 50, Nt, Rt, "condenser-coil", _)}

      <g id="e-heater">
        <rect x=${y + 50} y=${Lt - 12} width=${(g - y) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : tt}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${y + 78},${Lt} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : tt} stroke-width="4.5"/>
      </g>

      ${[[xe, "T21 Mitte"], [be, "T20 unten"]].map(
    ([v, V]) => d`
          <circle cx=${y + 90} cy=${v} r="9" fill=${fe}/>
          <text class="tag" x=${y + 110} y=${v + 9}>${V}</text>`
  )}

      <rect id="hp-case" x=${y} y=${ye} width=${g - y} height=${me - ye}
        rx="24" fill=${ks} fill-opacity="0.9" stroke=${tt} stroke-width=${_e}/>

      ${we([[40, it], [C, it], [C, B]], u, "flow-air-in", E)}
      ${we([[C, B], [C, gt], [F - 40, gt]], $, "flow-air-out", E)}
      ${Ae(120, it)}
      ${Ae(920, gt)}

      ${Ss(ge, it, "fan-t300", m, i && r ? dt : void 0)}
      ${Ts(B, y + 60, g - 60, "evaporator", m)}

      <g id="refrigerant" opacity=${E}>
        <path d=${`M ${y + 150},${B + 24} L ${y + 150},${A} L ${S - 42},${A}`}
          fill="none" stroke=${_} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${S + 42},${A} L ${g - 60},${A} L ${g - 60},${Nt} L ${g - 50},${Nt}`}
          fill="none" stroke=${_} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${y + 50},${Rt} L ${y + 26},${Rt} L ${y + 26},${B + 24} L ${y + 62},${B + 24}`}
          fill="none" stroke=${_} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${S} cy=${A} r="42" fill="#FFFFFF" stroke=${m} stroke-width="9"/>
        <g>
          <path d=${`M ${S - 31},${A - 15} L ${S + 29},${A - 7} L ${S},${A} Z`}
            fill=${m}/>
          ${i && r ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${S} ${A}`} to=${`360 ${S} ${A}`}
                dur=${`${1.8 / o.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${S} cy=${A} r="7" fill=${fe}/>
      </g>

      <!-- Same reason as on the FWT: above the lamellae block and the fan. -->
      <g id="flow-dots">
        ${P ? ke("flow-air-in", K) : h}
        ${P ? ke("flow-air-out", K) : h}
      </g>

      <text class="port" x="40" y=${it - 48}>Luft an</text>
      <text class="port" x=${F - 40} y=${gt + 66} text-anchor="end">Luft ab</text>

      ${l ? d`<text class="badge" x=${C} y=${me - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : h}
      ${a ? d`<text class="badge" x=${C} y=${st + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : h}

      ${$t.map(
    (v) => d`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => v.entityId && o.onEntityClick(v.entityId)}
          style=${v.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${Os(t, v.entityId)}
        </text>`
  )}
    </svg>`;
}
const Ps = [
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
], Ls = [
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
function Ue(o) {
  return o === "t300" ? Ls : Ps;
}
function He(o, t) {
  const e = (o.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function Ns(o, t, e) {
  const s = o.filter(
    (r) => r.device_id === t && r.platform === "proxon" && !r.disabled_by
  ), i = {};
  for (const r of e) {
    const n = `_${r}`, l = s.find((a) => a.unique_id.endsWith(n));
    l && (i[r] = l.entity_id);
  }
  return i;
}
function Ie(o, t, e) {
  const s = {}, i = new Set(e);
  for (const r of Object.values(o.entities ?? {})) {
    if (r.device_id !== t || r.platform !== "proxon") continue;
    const n = r.translation_key;
    n && i.has(n) && (s[n] = r.entity_id);
  }
  return s;
}
async function Rs(o, t, e) {
  const s = Ue(e), i = Ie(o, t, s);
  if (Object.keys(i).length) return i;
  const r = await o.callWS({
    type: "config/entity_registry/list"
  });
  return Ns(r, t, s);
}
function Ee(o, t = "fwt") {
  const e = t === "t300" ? "T300" : "FWT 2.0", i = Object.values(o.devices ?? {}).filter(
    (r) => (r.identifiers ?? []).some((n) => n[0] === "proxon") && r.model === e
  );
  return i.length === 1 ? i[0].id : void 0;
}
const Fe = [
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
], Us = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } }
  ]
}, Hs = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss"
}, Is = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss"
}, kt = class kt extends Y {
  constructor() {
    super(...arguments), this._computeLabel = (t) => Hs[t.name] ?? t.name, this._computeHelper = (t) => Is[t.name] ?? "";
  }
  setConfig(t) {
    this._config = t;
  }
  _schema() {
    const t = this._config?.device_id;
    return this._config?.variant === "t300" || (this.hass && t ? He(this.hass, t) === "t300" : !1) ? [...Fe, Us] : Fe;
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
    return !this.hass || !this._config ? h : xt`
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
}, kt.styles = Se`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
let Ht = kt;
customElements.define("proxon-schema-card-editor", Ht);
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
    return { device_id: Ee(t, "fwt") };
  }
  static getConfigElement() {
    return document.createElement("proxon-schema-card-editor");
  }
  _variant() {
    if (this._config?.variant) return this._config.variant;
    const t = this._deviceId();
    if (this.hass && t) {
      const e = He(this.hass, t);
      if (e) return e;
    }
    return "fwt";
  }
  _deviceId() {
    if (this._config?.device_id) return this._config.device_id;
    if (this.hass)
      return Ee(this.hass, this._config?.variant ?? "fwt");
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
      const i = Ie(this.hass, e, Ue(s));
      if (Object.keys(i).length) {
        this._map = i, this._error = void 0, this._resolvedFor = e;
        return;
      }
    }
    this._resolvedFor !== e && (this._resolvedFor = e, Rs(this.hass, e, s).then((i) => {
      this._map = i, this._error = Object.keys(i).length ? void 0 : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
    }).catch((i) => {
      this._resolvedFor = void 0, this._error = `Entity-Registry nicht lesbar: ${i.message}`;
    }));
  }
  render() {
    if (!this.hass || !this._config) return h;
    if (this._error)
      return xt`<ha-card><div class="error">${this._error}</div></ha-card>`;
    if (!Object.keys(this._map).length)
      return xt`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    const t = Number(this._config.animation_speed), e = Number.isFinite(t) && t > 0 ? Math.min(5, Math.max(0.1, t)) : 1, s = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      speed: e,
      onEntityClick: this._showMoreInfo
    };
    return xt`
      <ha-card .header=${this._config.title ?? h}>
        <div class="wrap">
          ${this._variant() === "t300" ? zs({ ...s, extras: this._config.extras ?? {} }) : As(s)}
        </div>
      </ha-card>`;
  }
};
Et.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, Et.styles = Se`
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
let It = Et;
customElements.define("proxon-schema-card", It);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
