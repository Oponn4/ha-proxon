/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const _t = globalThis, It = _t.ShadowRoot && (_t.ShadyCSS === void 0 || _t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Dt = Symbol(), Xt = /* @__PURE__ */ new WeakMap();
let Ce = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Dt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (It && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Xt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Xt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Be = (r) => new Ce(typeof r == "string" ? r : r + "", void 0, Dt), Se = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new Ce(e, r, Dt);
}, je = (r, t) => {
  if (It) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = _t.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, Gt = It ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Be(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: We, defineProperty: Ye, getOwnPropertyDescriptor: Xe, getOwnPropertyNames: Ge, getOwnPropertySymbols: Ke, getPrototypeOf: Ve } = Object, xt = globalThis, Kt = xt.trustedTypes, qe = Kt ? Kt.emptyScript : "", Ze = xt.reactiveElementPolyfillSupport, Q = (r, t) => r, Pt = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? qe : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, Me = (r, t) => !We(r, t), Vt = { attribute: !0, type: String, converter: Pt, reflect: !1, useDefault: !1, hasChanged: Me };
Symbol.metadata ??= Symbol("metadata"), xt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Vt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Ye(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = Xe(this.prototype, t) ?? { get() {
      return this[e];
    }, set(n) {
      this[e] = n;
    } };
    return { get: i, set(n) {
      const l = i?.call(this);
      o?.call(this, n), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Vt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Q("elementProperties"))) return;
    const t = Ve(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Q("properties"))) {
      const e = this.properties, s = [...Ge(e), ...Ke(e)];
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
      for (const i of s) e.unshift(Gt(i));
    } else t !== void 0 && e.push(Gt(t));
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
    return je(t, this.constructor.elementStyles), t;
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
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : Pt).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : Pt;
      this._$Em = i;
      const l = n.fromAttribute(e, o.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Me)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: i, wrapped: o }, n) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? e ?? this[t]), o !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), i === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [i, o] of s) {
        const { wrapped: n } = o, l = this[i];
        n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, o, l);
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
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[Q("elementProperties")] = /* @__PURE__ */ new Map(), D[Q("finalized")] = /* @__PURE__ */ new Map(), Ze?.({ ReactiveElement: D }), (xt.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = globalThis, qt = (r) => r, mt = Bt.trustedTypes, Zt = mt ? mt.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Te = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, ze = "?" + z, Je = `<${ze}>`, R = document, et = () => R.createComment(""), st = (r) => r === null || typeof r != "object" && typeof r != "function", jt = Array.isArray, Qe = (r) => jt(r) || typeof r?.[Symbol.iterator] == "function", bt = `[ 	
\f\r]`, K = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Jt = /-->/g, Qt = />/g, O = RegExp(`>|${bt}(?:([^\\s"'>=/]+)(${bt}*=${bt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), te = /'/g, ee = /"/g, Oe = /^(?:script|style|textarea|title)$/i, Pe = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), yt = Pe(1), $ = Pe(2), Y = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), se = /* @__PURE__ */ new WeakMap(), N = R.createTreeWalker(R, 129);
function Le(r, t) {
  if (!jt(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Zt !== void 0 ? Zt.createHTML(t) : t;
}
const ts = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = K;
  for (let l = 0; l < e; l++) {
    const a = r[l];
    let c, p, d = -1, u = 0;
    for (; u < a.length && (n.lastIndex = u, p = n.exec(a), p !== null); ) u = n.lastIndex, n === K ? p[1] === "!--" ? n = Jt : p[1] !== void 0 ? n = Qt : p[2] !== void 0 ? (Oe.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = O) : p[3] !== void 0 && (n = O) : n === O ? p[0] === ">" ? (n = i ?? K, d = -1) : p[1] === void 0 ? d = -2 : (d = n.lastIndex - p[2].length, c = p[1], n = p[3] === void 0 ? O : p[3] === '"' ? ee : te) : n === ee || n === te ? n = O : n === Jt || n === Qt ? n = K : (n = O, i = void 0);
    const m = n === O && r[l + 1].startsWith("/>") ? " " : "";
    o += n === K ? a + Je : d >= 0 ? (s.push(c), a.slice(0, d) + Te + a.slice(d) + z + m) : a + z + (d === -2 ? l : m);
  }
  return [Le(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class it {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [c, p] = ts(t, e);
    if (this.el = it.createElement(c, s), N.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = N.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Te)) {
          const u = p[n++], m = i.getAttribute(d).split(z), w = /([.?@])?(.*)/.exec(u);
          a.push({ type: 1, index: o, name: w[2], strings: m, ctor: w[1] === "." ? ss : w[1] === "?" ? is : w[1] === "@" ? rs : At }), i.removeAttribute(d);
        } else d.startsWith(z) && (a.push({ type: 6, index: o }), i.removeAttribute(d));
        if (Oe.test(i.tagName)) {
          const d = i.textContent.split(z), u = d.length - 1;
          if (u > 0) {
            i.textContent = mt ? mt.emptyScript : "";
            for (let m = 0; m < u; m++) i.append(d[m], et()), N.nextNode(), a.push({ type: 2, index: ++o });
            i.append(d[u], et());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ze) a.push({ type: 2, index: o });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(z, d + 1)) !== -1; ) a.push({ type: 7, index: o }), d += z.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = R.createElement("template");
    return s.innerHTML = t, s;
  }
}
function X(r, t, e = r, s) {
  if (t === Y) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = st(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = X(r, i._$AS(r, t.values), i, s)), t;
}
class es {
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
    const { el: { content: e }, parts: s } = this._$AD, i = (t?.creationScope ?? R).importNode(e, !0);
    N.currentNode = i;
    let o = N.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new rt(o, o.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (c = new os(o, this, t)), this._$AV.push(c), a = s[++l];
      }
      n !== a?.index && (o = N.nextNode(), n++);
    }
    return N.currentNode = R, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class rt {
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
    t = X(this, t, e), st(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== Y && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Qe(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && st(this._$AH) ? this._$AA.nextSibling.data = t : this.T(R.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = it.createElement(Le(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new es(i, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = se.get(t.strings);
    return e === void 0 && se.set(t.strings, e = new it(t)), e;
  }
  k(t) {
    jt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new rt(this.O(et()), this.O(et()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = qt(t).nextSibling;
      qt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
let At = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, i, o) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = i, this.options = o, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, i) {
    const o = this.strings;
    let n = !1;
    if (o === void 0) t = X(this, t, e, 0), n = !st(t) || t !== this._$AH && t !== Y, n && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = o[0], a = 0; a < o.length - 1; a++) c = X(this, l[s + a], e, a), c === Y && (c = this._$AH[a]), n ||= !st(c) || c !== this._$AH[a], c === h ? t = h : t !== h && (t += (c ?? "") + o[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class ss extends At {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class is extends At {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class rs extends At {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = X(this, t, e, 0) ?? h) === Y) return;
    const s = this._$AH, i = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== h && (s === h || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class os {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    X(this, t);
  }
}
const ns = Bt.litHtmlPolyfillSupport;
ns?.(it, rt), (Bt.litHtmlVersions ??= []).push("3.3.3");
const as = (r, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = i = new rt(t.insertBefore(et(), o), o, void 0, e ?? {});
  }
  return i._$AI(r), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = globalThis;
class W extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = as(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return Y;
  }
}
W._$litElement$ = !0, W.finalized = !0, Wt.litElementHydrateSupport?.({ LitElement: W });
const ls = Wt.litElementPolyfillSupport;
ls?.({ LitElement: W });
(Wt.litElementVersions ??= []).push("4.2.2");
const S = "#306291", cs = "#E2E8F2", lt = "#8DC63F", ie = "#F3B229", re = "#79593A", wt = "#D62631", oe = "#1A1A1A", hs = "#7A7A7A", ds = "#C3CEDE", ne = "#2F80ED", kt = 1600, Et = 900, ae = 210, le = 120, $s = 1390, ps = 800, us = 22, f = 315, y = 605, tt = 62, H = tt / 2, B = 800, ct = 460, j = 168, Ne = 450, Re = 1150, fs = 42, _s = 350, ht = 350, dt = 1250, A = 725, P = 900, k = 590, Ft = 690, $t = 1030, M = 240, L = 1360, Lt = B - j, Nt = B + j, ce = Math.round((Lt - M) / (L - M) * 100), he = Math.round((Nt - M) / (L - M) * 100), Rt = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function pt(r, t, e, s = 2, i = 36) {
  const o = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const c = r + (e ? a * i : -a * i);
    l.push($`<path d="M ${c - o},${t - n} L ${c},${t} L ${c - o},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function ut(r, t, e, s = 1) {
  return $`<path id=${e ?? h} d=${Rt(r)} fill="none" stroke=${t}
    stroke-width=${tt} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function Ct(r, t, e, s) {
  return $`<g id=${s}>
    <rect x=${r - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${S} stroke-width="6"/>
    <line x1=${r} y1=${t} x2=${r} y2=${e} stroke=${S} stroke-width="4"/>
  </g>`;
}
function de(r, t, e) {
  const s = fs, i = f, o = s * 0.5, n = $`<path d="M ${r - s * 0.78},${i} A ${o} ${o} 0 0 1 ${r},${i}
      A ${o} ${o} 0 0 0 ${r + s * 0.78},${i}" fill="none" stroke=${S}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? h : $`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${r} ${i}`} to=${`360 ${r} ${i}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return $`<g id=${t}>
    <circle cx=${r} cy=${i} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${S}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function $e(r, t, e = 4, s = "#FFFFFF") {
  const i = [];
  for (let o = 0; o < e; o++)
    i.push($`<circle r="9" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * o}s`}>
        <mpath href=${`#${r}`} xlink:href=${`#${r}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
const ys = (r, t) => {
  if (!t) return;
  const e = Number(r.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function ms(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function gs(r, t, e = 3.5, s = 10) {
  return (r === void 0 || r <= 0 ? s : s - Math.min(100, Math.max(0, r)) / 100 * (s - e)) / t;
}
const vs = [
  { key: "t3_frischluft", x: 120, y: f + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: y + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: f + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: y + 22, color: "red", size: "core" },
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
function xs(r) {
  const { hass: t, map: e, animate: s } = r, i = t.states[e.bypass_offen ?? ""]?.state === "on", o = t.states[e.lueftung ?? ""], n = o?.state === "on", l = o?.attributes?.percentage, a = ys(t, e.kompressor_drehzahl), c = e.vierwege_ventil, d = !!(c && t.states[c]) && t.states[c].state === "on", u = d ? ne : S, m = i ? 0 : 90, w = i ? lt : ds, Yt = i ? 1 : 0.6, G = i ? 0.18 : 1, U = gs(n ? l ?? 50 : void 0, r.speed), ot = s && n, nt = U / 2, v = [[M, f], [Lt, f], [Nt, y], [L, y]], at = H + 14;
  return $`
    <svg viewBox=${`0 0 ${kt} ${Et}`} id="proxon-fwt" data-bypass=${i ? "open" : "closed"}
         style=${`aspect-ratio: ${kt} / ${Et}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${M} y1="0" x2=${L} y2="0">
          <stop offset="0%" stop-color=${lt}/><stop offset=${`${ce}%`} stop-color=${lt}/>
          <stop offset=${`${he}%`} stop-color=${wt}/><stop offset="100%" stop-color=${wt}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${L} y1="0" x2=${M} y2="0">
          <stop offset="0%" stop-color=${ie}/><stop offset=${`${ce}%`} stop-color=${ie}/>
          <stop offset=${`${he}%`} stop-color=${re}/><stop offset="100%" stop-color=${re}/>
        </linearGradient>
      </defs>

      <rect id="backdrop" width=${kt} height=${Et} fill="#FFFFFF"/>
      <rect id="case" x=${ae} y=${le} width=${$s - ae} height=${ps - le} rx="12"
        fill=${cs} stroke=${S} stroke-width=${us}/>

      <g id="flow-extract-exhaust">
        ${ut([[L, f], [Nt, f], [Lt, y], [M, y]], "url(#gradExhaust)", "flow-exhaust")}
        ${pt(1325, f, !1)}
        ${pt(300, y, !1)}
        ${ot ? $e("flow-exhaust", U) : h}
      </g>

      <g id="flow-fresh-supply">
        ${ut(v, "url(#gradSupply)", "flow-supply", G)}
        ${i ? $`${ut([[M, f], [k, f]], lt, "flow-fresh-active")}
                ${ut([[$t, y], [L, y]], wt, "flow-supply-active")}` : h}
        ${pt(275, f, !0)}
        ${pt(1305, y, !0)}
        ${ot ? $e("flow-supply", U) : h}
      </g>

      <polygon id="heat-exchanger"
        points=${`${B},${ct - j} ${B + j},${ct} ${B},${ct + j} ${B - j},${ct}`}
        fill="none" stroke=${S} stroke-width="10"/>

      <g id="bypass" data-state=${i ? "open" : "closed"}>
        ${[
    Rt([[k, f + H], [k, y - at]]),
    Rt([[k, y + at], [k, Ft], [$t, Ft], [$t, y + H]])
  ].map(
    (x, T) => $`
            <path id=${T === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${x} fill="none"
              stroke=${w} stroke-width=${tt} stroke-linejoin="round" opacity=${Yt}/>
            <path d=${x} fill="none" stroke=${S} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${m} ${k} ${f + H})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${k - 9} y=${f + H - tt / 2 - 8} width="18" height=${tt + 16} rx="9"
            fill=${S} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${k} cy=${f + H} r="10" fill=${oe} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${de(Ne, "fan-supply", s && n ? nt : void 0)}
      ${de(Re, "fan-extract", s && n ? nt : void 0)}
      ${Ct(_s, f - 95, f + 95, "preheater")}
      ${Ct(ht, y - 110, 700, "evaporator")}
      ${Ct(dt, y - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${ht} y1=${A} x2=${dt} y2=${A}
        stroke=${u} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${ht} y1="700" x2=${ht} y2=${A} stroke=${u} stroke-width="7"/>
      <line x1=${dt} y1="700" x2=${dt} y2=${A} stroke=${u} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${P} cy=${A} r="40" fill="#FFFFFF" stroke=${u} stroke-width="9"/>
        <g>
          <path d=${`M ${P - 30},${A - 15} L ${P + 28},${A - 7} L ${P},${A} Z`}
            fill=${u}/>
          ${s && a ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${P} ${A}`} to=${`360 ${P} ${A}`}
                dur=${`${Math.max(1.2, 240 / a) / r.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${P} cy=${A} r="7" fill=${oe}/>
      </g>

      ${[
    ["Frischluft", 120, f - 30],
    ["Fortluft", 120, y - 30],
    ["Abluft", 1480, f - 30],
    ["Zuluft", 1480, y - 30]
  ].map(
    ([x, T, De]) => $`<text class="port" x=${T} y=${De} text-anchor="middle">${x}</text>`
  )}

      ${d ? $`<text class="badge" x="1150" y="700" text-anchor="middle" fill=${ne}>KÜHLEN</text>` : h}

      <text id="bypass-label" class="bp" x=${(k + $t) / 2} y=${Ft - 46}
        text-anchor="middle" fill=${i ? "#4C8C1B" : hs}>
        ${i ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${vs.map((x) => {
    const T = e[x.key];
    return $`<text class=${`val ${x.size}`} x=${x.x} y=${x.y} text-anchor="middle"
          fill=${x.color} @click=${() => T && r.onEntityClick(T)}
          style=${T ? "cursor: pointer" : "opacity: 0.4"}>
          ${(x.prefix ?? "") + ms(t, T)}
        </text>`;
  })}
    </svg>`;
}
const V = "#306291", As = "#E2E8F2", bs = "#F3B229", pe = "#D62631", ue = "#3E8FD0", fe = "#1A1A1A", St = "#C3CEDE", E = 1e3, Mt = 1500, ws = 54, _e = 20, _ = 210, g = 790, ye = 90, me = 520, q = 520, Z = 1430, F = (_ + g) / 2, J = 205, ft = 400, ge = 330, ve = 38, I = 300, C = 640, b = 455, Tt = 760, xe = 900, Ae = 1060, zt = 1140, Ot = 1360, ks = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function be(r, t, e, s = 1) {
  return $`<path id=${e} d=${ks(r)} fill="none" stroke=${t} stroke-width=${ws}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function we(r, t, e, s = 2, i = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const c = r + a * i;
    l.push($`<path d="M ${c - 17},${t - 15} L ${c},${t} L ${c - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function Es(r, t, e, s, i) {
  const o = ve, n = ve * 0.5;
  return $`<g id=${e}>
    <circle cx=${r} cy=${t} r=${o} fill="#FFFFFF" fill-opacity="0.6" stroke=${s}
      stroke-width=${Math.round(o * 0.16 * 10) / 10}/>
    <path d="M ${r - o * 0.78},${t} A ${n} ${n} 0 0 1 ${r},${t}
      A ${n} ${n} 0 0 0 ${r + o * 0.78},${t}" fill="none" stroke=${s}
      stroke-width=${Math.round(o * 0.14 * 10) / 10} stroke-linecap="round">
      ${i === void 0 ? h : $`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${r} ${t}`} to=${`360 ${r} ${t}`} dur=${`${i}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}
function Fs(r, t, e, s, i) {
  const o = (e - t) / 7, n = [];
  for (let l = 1; l < 7; l++) {
    const a = t + l * o;
    n.push($`<line x1=${a} y1=${r - 24} x2=${a} y2=${r + 24} stroke=${i} stroke-width="3.5"/>`);
  }
  return $`<g id=${s}>
    <rect x=${t} y=${r - 24} width=${e - t} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${i} stroke-width="5"/>
    ${n}
  </g>`;
}
function Cs(r, t, e, s, i, o) {
  const l = (s - e) / 5;
  let a = `M ${r},${e}`;
  for (let c = 0; c < 5; c++) {
    const p = e + c * l;
    a += ` L ${t},${p + l * 0.45} L ${r},${p + l * 0.9}`;
  }
  return $`<path id=${i} d=${a} fill="none" stroke=${o} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function ke(r, t, e = 3, s = "#FFFFFF") {
  const i = [];
  for (let o = 0; o < e; o++)
    i.push($`<circle r="8" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * o}s`}>
        <mpath href=${`#${r}`} xlink:href=${`#${r}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
function Ss(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function Ms(r) {
  const { hass: t, map: e, extras: s, animate: i } = r, o = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", c = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), p = o ? bs : St, d = o ? ue : St, u = o ? pe : St, m = o ? V : "#8FA3BC", w = o ? 1 : 0.55, G = (10 - (Number.isFinite(c) ? Math.min(100, Math.max(0, c)) : 60) / 100 * (10 - 3.5)) / r.speed, U = i && o, ot = G / 2, nt = [
    { entityId: e.t300_behaelter_avg, x: F, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: F, y: 685, color: "#1f4e79", size: "core" },
    { entityId: e.t300_temp_eheiz, x: g - 95, y: Tt, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: g - 110, y: xe, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: g - 110, y: Ae, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: F, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: e.t300_ventilator_pct, x: ge, y: 264, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return $`
    <svg viewBox=${`0 0 ${E} ${Mt}`} id="proxon-t300" data-state=${o ? "running" : "idle"}
         style=${`aspect-ratio: ${E} / ${Mt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${E} height=${Mt} fill="#FFFFFF"/>

      <rect id="tank" x=${_} y=${q} width=${g - _} height=${Z - q}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${V} stroke-width=${_e}/>
      <path d=${`M ${g},${q + 90} L ${E - 60},${q + 90}`} stroke=${pe}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${g},${Z - 70} L ${E - 60},${Z - 70}`} stroke=${ue}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${E - 60} y=${q + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${E - 60} y=${Z - 100} text-anchor="end">Kaltwasser</text>

      ${Cs(g - 50, _ + 50, zt, Ot, "condenser-coil", u)}

      <g id="e-heater">
        <rect x=${_ + 50} y=${Tt - 12} width=${(g - _) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : V}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${_ + 78},${Tt} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : V} stroke-width="4.5"/>
      </g>

      ${[[xe, "T21 Mitte"], [Ae, "T20 unten"]].map(
    ([v, at]) => $`
          <circle cx=${_ + 90} cy=${v} r="9" fill=${fe}/>
          <text class="tag" x=${_ + 110} y=${v + 9}>${at}</text>`
  )}

      <rect id="hp-case" x=${_} y=${ye} width=${g - _} height=${me - ye}
        rx="24" fill=${As} fill-opacity="0.9" stroke=${V} stroke-width=${_e}/>

      ${be([[40, J], [F, J], [F, I]], p, "flow-air-in", w)}
      ${be([[F, I], [F, ft], [E - 40, ft]], d, "flow-air-out", w)}
      ${we(120, J)}
      ${we(920, ft)}
      ${U ? ke("flow-air-in", G) : h}
      ${U ? ke("flow-air-out", G) : h}

      ${Es(ge, J, "fan-t300", m, i && o ? ot : void 0)}
      ${Fs(I, _ + 60, g - 60, "evaporator", m)}

      <g id="refrigerant" opacity=${w}>
        <path d=${`M ${_ + 150},${I + 24} L ${_ + 150},${b} L ${C - 42},${b}`}
          fill="none" stroke=${u} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${C + 42},${b} L ${g - 60},${b} L ${g - 60},${zt} L ${g - 50},${zt}`}
          fill="none" stroke=${u} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${_ + 50},${Ot} L ${_ + 26},${Ot} L ${_ + 26},${I + 24} L ${_ + 62},${I + 24}`}
          fill="none" stroke=${u} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${C} cy=${b} r="42" fill="#FFFFFF" stroke=${m} stroke-width="9"/>
        <g>
          <path d=${`M ${C - 31},${b - 15} L ${C + 29},${b - 7} L ${C},${b} Z`}
            fill=${m}/>
          ${i && o ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${C} ${b}`} to=${`360 ${C} ${b}`}
                dur=${`${1.8 / r.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${C} cy=${b} r="7" fill=${fe}/>
      </g>

      <text class="port" x="40" y=${J - 48}>Luft an</text>
      <text class="port" x=${E - 40} y=${ft + 66} text-anchor="end">Luft ab</text>

      ${l ? $`<text class="badge" x=${F} y=${me - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : h}
      ${a ? $`<text class="badge" x=${F} y=${Z + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : h}

      ${nt.map(
    (v) => $`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => v.entityId && r.onEntityClick(v.entityId)}
          style=${v.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${Ss(t, v.entityId)}
        </text>`
  )}
    </svg>`;
}
const Ts = [
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
], zs = [
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
function Ue(r) {
  return r === "t300" ? zs : Ts;
}
function He(r, t) {
  const e = (r.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function Os(r, t, e) {
  const s = r.filter(
    (o) => o.device_id === t && o.platform === "proxon" && !o.disabled_by
  ), i = {};
  for (const o of e) {
    const n = `_${o}`, l = s.find((a) => a.unique_id.endsWith(n));
    l && (i[o] = l.entity_id);
  }
  return i;
}
function Ie(r, t, e) {
  const s = {}, i = new Set(e);
  for (const o of Object.values(r.entities ?? {})) {
    if (o.device_id !== t || o.platform !== "proxon") continue;
    const n = o.translation_key;
    n && i.has(n) && (s[n] = o.entity_id);
  }
  return s;
}
async function Ps(r, t, e) {
  const s = Ue(e), i = Ie(r, t, s);
  if (Object.keys(i).length) return i;
  const o = await r.callWS({
    type: "config/entity_registry/list"
  });
  return Os(o, t, s);
}
function Ee(r, t = "fwt") {
  const e = t === "t300" ? "T300" : "FWT 2.0", i = Object.values(r.devices ?? {}).filter(
    (o) => (o.identifiers ?? []).some((n) => n[0] === "proxon") && o.model === e
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
], Ls = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } }
  ]
}, Ns = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss"
}, Rs = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss"
}, gt = class gt extends W {
  constructor() {
    super(...arguments), this._computeLabel = (t) => Ns[t.name] ?? t.name, this._computeHelper = (t) => Rs[t.name] ?? "";
  }
  setConfig(t) {
    this._config = t;
  }
  _schema() {
    const t = this._config?.device_id;
    return this._config?.variant === "t300" || (this.hass && t ? He(this.hass, t) === "t300" : !1) ? [...Fe, Ls] : Fe;
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
    return !this.hass || !this._config ? h : yt`
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
gt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, gt.styles = Se`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
let Ut = gt;
customElements.define("proxon-schema-card-editor", Ut);
const vt = class vt extends W {
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
    this._resolvedFor !== e && (this._resolvedFor = e, Ps(this.hass, e, s).then((i) => {
      this._map = i, this._error = Object.keys(i).length ? void 0 : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
    }).catch((i) => {
      this._resolvedFor = void 0, this._error = `Entity-Registry nicht lesbar: ${i.message}`;
    }));
  }
  render() {
    if (!this.hass || !this._config) return h;
    if (this._error)
      return yt`<ha-card><div class="error">${this._error}</div></ha-card>`;
    if (!Object.keys(this._map).length)
      return yt`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    const t = Number(this._config.animation_speed), e = Number.isFinite(t) && t > 0 ? Math.min(5, Math.max(0.1, t)) : 1, s = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      speed: e,
      onEntityClick: this._showMoreInfo
    };
    return yt`
      <ha-card .header=${this._config.title ?? h}>
        <div class="wrap">
          ${this._variant() === "t300" ? Ms({ ...s, extras: this._config.extras ?? {} }) : xs(s)}
        </div>
      </ha-card>`;
  }
};
vt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, vt.styles = Se`
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
let Ht = vt;
customElements.define("proxon-schema-card", Ht);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
