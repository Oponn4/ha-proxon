/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt = globalThis, zt = dt.ShadowRoot && (dt.ShadyCSS === void 0 || dt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Nt = Symbol(), Ht = /* @__PURE__ */ new WeakMap();
let ve = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Nt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (zt && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = Ht.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && Ht.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Te = (r) => new ve(typeof r == "string" ? r : r + "", void 0, Nt), Pe = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new ve(e, r, Nt);
}, ze = (r, t) => {
  if (zt) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = dt.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, Dt = zt ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Te(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ne, defineProperty: Le, getOwnPropertyDescriptor: Re, getOwnPropertyNames: Ue, getOwnPropertySymbols: Ie, getPrototypeOf: He } = Object, ut = globalThis, Bt = ut.trustedTypes, De = Bt ? Bt.emptyScript : "", Be = ut.reactiveElementPolyfillSupport, Z = (r, t) => r, St = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? De : null;
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
} }, xe = (r, t) => !Ne(r, t), jt = { attribute: !0, type: String, converter: St, reflect: !1, useDefault: !1, hasChanged: xe };
Symbol.metadata ??= Symbol("metadata"), ut.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = jt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Le(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = Re(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? jt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Z("elementProperties"))) return;
    const t = He(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Z("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Z("properties"))) {
      const e = this.properties, s = [...Ue(e), ...Ie(e)];
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
      for (const i of s) e.unshift(Dt(i));
    } else t !== void 0 && e.push(Dt(t));
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
    return ze(t, this.constructor.elementStyles), t;
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
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : St).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : St;
      this._$Em = i;
      const l = n.fromAttribute(e, o.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? xe)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
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
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[Z("elementProperties")] = /* @__PURE__ */ new Map(), D[Z("finalized")] = /* @__PURE__ */ new Map(), Be?.({ ReactiveElement: D }), (ut.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Lt = globalThis, Wt = (r) => r, pt = Lt.trustedTypes, Yt = pt ? pt.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Ae = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, we = "?" + T, je = `<${we}>`, R = document, tt = () => R.createComment(""), et = (r) => r === null || typeof r != "object" && typeof r != "function", Rt = Array.isArray, We = (r) => Rt(r) || typeof r?.[Symbol.iterator] == "function", yt = `[ 	
\f\r]`, X = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Xt = /-->/g, Gt = />/g, P = RegExp(`>|${yt}(?:([^\\s"'>=/]+)(${yt}*=${yt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Vt = /'/g, qt = /"/g, ke = /^(?:script|style|textarea|title)$/i, be = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), mt = be(1), d = be(2), W = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Kt = /* @__PURE__ */ new WeakMap(), L = R.createTreeWalker(R, 129);
function Ee(r, t) {
  if (!Rt(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Yt !== void 0 ? Yt.createHTML(t) : t;
}
const Ye = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = X;
  for (let l = 0; l < e; l++) {
    const a = r[l];
    let c, p, $ = -1, m = 0;
    for (; m < a.length && (n.lastIndex = m, p = n.exec(a), p !== null); ) m = n.lastIndex, n === X ? p[1] === "!--" ? n = Xt : p[1] !== void 0 ? n = Gt : p[2] !== void 0 ? (ke.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = P) : p[3] !== void 0 && (n = P) : n === P ? p[0] === ">" ? (n = i ?? X, $ = -1) : p[1] === void 0 ? $ = -2 : ($ = n.lastIndex - p[2].length, c = p[1], n = p[3] === void 0 ? P : p[3] === '"' ? qt : Vt) : n === qt || n === Vt ? n = P : n === Xt || n === Gt ? n = X : (n = P, i = void 0);
    const u = n === P && r[l + 1].startsWith("/>") ? " " : "";
    o += n === X ? a + je : $ >= 0 ? (s.push(c), a.slice(0, $) + Ae + a.slice($) + T + u) : a + T + ($ === -2 ? l : u);
  }
  return [Ee(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class st {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [c, p] = Ye(t, e);
    if (this.el = st.createElement(c, s), L.currentNode = this.el.content, e === 2 || e === 3) {
      const $ = this.el.content.firstChild;
      $.replaceWith(...$.childNodes);
    }
    for (; (i = L.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const $ of i.getAttributeNames()) if ($.endsWith(Ae)) {
          const m = p[n++], u = i.getAttribute($).split(T), w = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: o, name: w[2], strings: u, ctor: w[1] === "." ? Ge : w[1] === "?" ? Ve : w[1] === "@" ? qe : _t }), i.removeAttribute($);
        } else $.startsWith(T) && (a.push({ type: 6, index: o }), i.removeAttribute($));
        if (ke.test(i.tagName)) {
          const $ = i.textContent.split(T), m = $.length - 1;
          if (m > 0) {
            i.textContent = pt ? pt.emptyScript : "";
            for (let u = 0; u < m; u++) i.append($[u], tt()), L.nextNode(), a.push({ type: 2, index: ++o });
            i.append($[m], tt());
          }
        }
      } else if (i.nodeType === 8) if (i.data === we) a.push({ type: 2, index: o });
      else {
        let $ = -1;
        for (; ($ = i.data.indexOf(T, $ + 1)) !== -1; ) a.push({ type: 7, index: o }), $ += T.length - 1;
      }
      o++;
    }
  }
  static createElement(t, e) {
    const s = R.createElement("template");
    return s.innerHTML = t, s;
  }
}
function Y(r, t, e = r, s) {
  if (t === W) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = et(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = Y(r, i._$AS(r, t.values), i, s)), t;
}
class Xe {
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
    L.currentNode = i;
    let o = L.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new it(o, o.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (c = new Ke(o, this, t)), this._$AV.push(c), a = s[++l];
      }
      n !== a?.index && (o = L.nextNode(), n++);
    }
    return L.currentNode = R, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class it {
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
    t = Y(this, t, e), et(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== W && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : We(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && et(this._$AH) ? this._$AA.nextSibling.data = t : this.T(R.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = st.createElement(Ee(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new Xe(i, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Kt.get(t.strings);
    return e === void 0 && Kt.set(t.strings, e = new st(t)), e;
  }
  k(t) {
    Rt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new it(this.O(tt()), this.O(tt()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = Wt(t).nextSibling;
      Wt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
let _t = class {
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
    if (o === void 0) t = Y(this, t, e, 0), n = !et(t) || t !== this._$AH && t !== W, n && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = o[0], a = 0; a < o.length - 1; a++) c = Y(this, l[s + a], e, a), c === W && (c = this._$AH[a]), n ||= !et(c) || c !== this._$AH[a], c === h ? t = h : t !== h && (t += (c ?? "") + o[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class Ge extends _t {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Ve extends _t {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class qe extends _t {
  constructor(t, e, s, i, o) {
    super(t, e, s, i, o), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = Y(this, t, e, 0) ?? h) === W) return;
    const s = this._$AH, i = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, o = t !== h && (s === h || i);
    i && this.element.removeEventListener(this.name, this, s), o && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Ke {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Y(this, t);
  }
}
const Ze = Lt.litHtmlPolyfillSupport;
Ze?.(st, it), (Lt.litHtmlVersions ??= []).push("3.3.3");
const Je = (r, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const o = e?.renderBefore ?? null;
    s._$litPart$ = i = new it(t.insertBefore(tt(), o), o, void 0, e ?? {});
  }
  return i._$AI(r), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = globalThis;
class J extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Je(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return W;
  }
}
J._$litElement$ = !0, J.finalized = !0, Ut.litElementHydrateSupport?.({ LitElement: J });
const Qe = Ut.litElementPolyfillSupport;
Qe?.({ LitElement: J });
(Ut.litElementVersions ??= []).push("4.2.2");
const A = "#306291", ts = "#E2E8F2", rt = "#8DC63F", Zt = "#F3B229", Jt = "#79593A", gt = "#D62631", Qt = "#1A1A1A", es = "#7A7A7A", ss = "#C3CEDE", vt = 1600, xt = 900, te = 210, ee = 120, is = 1390, rs = 800, os = 22, f = 315, y = 605, Q = 62, I = Q / 2, B = 800, ot = 460, j = 168, Fe = 450, Ce = 1150, ns = 42, as = 350, nt = 350, at = 1250, k = 725, z = 900, F = 590, At = 690, lt = 1030, O = 240, N = 1360, Mt = B - j, Ot = B + j, se = Math.round((Mt - O) / (N - O) * 100), ie = Math.round((Ot - O) / (N - O) * 100), Tt = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function ct(r, t, e, s = 2, i = 36) {
  const o = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const c = r + (e ? a * i : -a * i);
    l.push(d`<path d="M ${c - o},${t - n} L ${c},${t} L ${c - o},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function ht(r, t, e, s = 1) {
  return d`<path id=${e ?? h} d=${Tt(r)} fill="none" stroke=${t}
    stroke-width=${Q} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function wt(r, t, e, s) {
  return d`<g id=${s}>
    <rect x=${r - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${A} stroke-width="6"/>
    <line x1=${r} y1=${t} x2=${r} y2=${e} stroke=${A} stroke-width="4"/>
  </g>`;
}
function re(r, t, e) {
  const s = ns, i = f, o = s * 0.5, n = d`<path d="M ${r - s * 0.78},${i} A ${o} ${o} 0 0 1 ${r},${i}
      A ${o} ${o} 0 0 0 ${r + s * 0.78},${i}" fill="none" stroke=${A}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? h : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${r} ${i}`} to=${`360 ${r} ${i}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return d`<g id=${t}>
    <circle cx=${r} cy=${i} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${A}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function oe(r, t, e = 4, s = "#FFFFFF") {
  const i = [];
  for (let o = 0; o < e; o++)
    i.push(d`<circle r="9" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * o}s`}>
        <mpath href=${`#${r}`} xlink:href=${`#${r}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
const ls = (r, t) => {
  if (!t) return;
  const e = Number(r.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function cs(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function hs(r, t = 1.6, e = 6) {
  if (r === void 0 || r <= 0) return e;
  const s = Math.min(100, Math.max(0, r));
  return e - s / 100 * (e - t);
}
const $s = [
  { key: "t3_frischluft", x: 120, y: f + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: y + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: f + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: y + 22, color: "red", size: "core" },
  { key: "betriebsart", x: 800, y: 165, color: "#1f4e79", size: "core" },
  { key: "lueftung", x: 800, y: 225, color: "dimgray", size: "detail" },
  { key: "geraetefilter_remaining_days", x: 430, y: 195, color: "dimgray", size: "core", prefix: "Filter " },
  { key: "power_total", x: 1250, y: 165, color: "#1f4e79", size: "core" },
  { key: "rf_sensor1", x: 1250, y: 225, color: "dimgray", size: "detail" },
  { key: "drehzahl_zuluft", x: Fe, y: 420, color: "dimgray", size: "detail" },
  { key: "drehzahl_abluft", x: Ce, y: 420, color: "dimgray", size: "detail" },
  { key: "kompressor_drehzahl", x: 350, y: 855, color: "dimgray", size: "detail" },
  { key: "kompressor_leistung", x: 620, y: 855, color: "dimgray", size: "detail" },
  { key: "t13_kompressor", x: 880, y: 855, color: "darkred", size: "detail" },
  { key: "bypass_min_frischluft", x: 1130, y: 855, color: "dimgray", size: "detail" }
];
function ds(r) {
  const { hass: t, map: e, animate: s } = r, i = t.states[e.bypass_offen ?? ""]?.state === "on", o = t.states[e.lueftung ?? ""], n = o?.state === "on", l = o?.attributes?.percentage, a = ls(t, e.kompressor_drehzahl), c = i ? 0 : 90, p = i ? rt : ss, $ = i ? 1 : 0.6, m = i ? 0.18 : 1, u = hs(n ? l ?? 50 : void 0), w = s && n, It = [[O, f], [Mt, f], [Ot, y], [N, y]], U = I + 14;
  return d`
    <svg viewBox=${`0 0 ${vt} ${xt}`} id="proxon-fwt" data-bypass=${i ? "open" : "closed"}
         style=${`aspect-ratio: ${vt} / ${xt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${O} y1="0" x2=${N} y2="0">
          <stop offset="0%" stop-color=${rt}/><stop offset=${`${se}%`} stop-color=${rt}/>
          <stop offset=${`${ie}%`} stop-color=${gt}/><stop offset="100%" stop-color=${gt}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${N} y1="0" x2=${O} y2="0">
          <stop offset="0%" stop-color=${Zt}/><stop offset=${`${se}%`} stop-color=${Zt}/>
          <stop offset=${`${ie}%`} stop-color=${Jt}/><stop offset="100%" stop-color=${Jt}/>
        </linearGradient>
      </defs>

      <rect id="backdrop" width=${vt} height=${xt} fill="#FFFFFF"/>
      <rect id="case" x=${te} y=${ee} width=${is - te} height=${rs - ee} rx="12"
        fill=${ts} stroke=${A} stroke-width=${os}/>

      <g id="flow-extract-exhaust">
        ${ht([[N, f], [Ot, f], [Mt, y], [O, y]], "url(#gradExhaust)", "flow-exhaust")}
        ${ct(1325, f, !1)}
        ${ct(300, y, !1)}
        ${w ? oe("flow-exhaust", u) : h}
      </g>

      <g id="flow-fresh-supply">
        ${ht(It, "url(#gradSupply)", "flow-supply", m)}
        ${i ? d`${ht([[O, f], [F, f]], rt, "flow-fresh-active")}
                ${ht([[lt, y], [N, y]], gt, "flow-supply-active")}` : h}
        ${ct(275, f, !0)}
        ${ct(1305, y, !0)}
        ${w ? oe("flow-supply", u) : h}
      </g>

      <polygon id="heat-exchanger"
        points=${`${B},${ot - j} ${B + j},${ot} ${B},${ot + j} ${B - j},${ot}`}
        fill="none" stroke=${A} stroke-width="10"/>

      <g id="bypass" data-state=${i ? "open" : "closed"}>
        ${[
    Tt([[F, f + I], [F, y - U]]),
    Tt([[F, y + U], [F, At], [lt, At], [lt, y + I]])
  ].map(
    (g, E) => d`
            <path id=${E === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${g} fill="none"
              stroke=${p} stroke-width=${Q} stroke-linejoin="round" opacity=${$}/>
            <path d=${g} fill="none" stroke=${A} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${c} ${F} ${f + I})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${F - 9} y=${f + I - Q / 2 - 8} width="18" height=${Q + 16} rx="9"
            fill=${A} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${F} cy=${f + I} r="10" fill=${Qt} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${re(Fe, "fan-supply", s && n ? u / 3 : void 0)}
      ${re(Ce, "fan-extract", s && n ? u / 3 : void 0)}
      ${wt(as, f - 95, f + 95, "preheater")}
      ${wt(nt, y - 110, 700, "evaporator")}
      ${wt(at, y - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${nt} y1=${k} x2=${at} y2=${k}
        stroke=${A} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${nt} y1="700" x2=${nt} y2=${k} stroke=${A} stroke-width="7"/>
      <line x1=${at} y1="700" x2=${at} y2=${k} stroke=${A} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${z} cy=${k} r="40" fill="#FFFFFF" stroke=${A} stroke-width="9"/>
        <g>
          <path d=${`M ${z - 30},${k - 15} L ${z + 28},${k - 7} L ${z},${k} Z`}
            fill=${A}/>
          ${s && a ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${z} ${k}`} to=${`360 ${z} ${k}`}
                dur=${`${Math.max(0.4, 120 / a)}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${z} cy=${k} r="7" fill=${Qt}/>
      </g>

      ${[
    ["Frischluft", 120, f - 30],
    ["Fortluft", 120, y - 30],
    ["Abluft", 1480, f - 30],
    ["Zuluft", 1480, y - 30]
  ].map(
    ([g, E, x]) => d`<text class="port" x=${E} y=${x} text-anchor="middle">${g}</text>`
  )}

      <text id="bypass-label" class="bp" x=${(F + lt) / 2} y=${At - 46}
        text-anchor="middle" fill=${i ? "#4C8C1B" : es}>
        ${i ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${$s.map((g) => {
    const E = e[g.key];
    return d`<text class=${`val ${g.size}`} x=${g.x} y=${g.y} text-anchor="middle"
          fill=${g.color} @click=${() => E && r.onEntityClick(E)}
          style=${E ? "cursor: pointer" : "opacity: 0.4"}>
          ${(g.prefix ?? "") + cs(t, E)}
        </text>`;
  })}
    </svg>`;
}
const G = "#306291", ps = "#E2E8F2", fs = "#F3B229", ne = "#D62631", ae = "#3E8FD0", le = "#1A1A1A", kt = "#C3CEDE", C = 1e3, bt = 1500, us = 54, ce = 20, _ = 210, v = 790, he = 90, $e = 520, V = 520, q = 1430, S = (_ + v) / 2, K = 205, $t = 400, de = 330, pe = 38, H = 300, M = 640, b = 455, Et = 760, fe = 900, ue = 1060, Ft = 1140, Ct = 1360, _s = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function _e(r, t, e, s = 1) {
  return d`<path id=${e} d=${_s(r)} fill="none" stroke=${t} stroke-width=${us}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function ye(r, t, e, s = 2, i = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const c = r + a * i;
    l.push(d`<path d="M ${c - 17},${t - 15} L ${c},${t} L ${c - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function ys(r, t, e, s, i) {
  const o = pe, n = pe * 0.5;
  return d`<g id=${e}>
    <circle cx=${r} cy=${t} r=${o} fill="#FFFFFF" fill-opacity="0.6" stroke=${s}
      stroke-width=${Math.round(o * 0.16 * 10) / 10}/>
    <path d="M ${r - o * 0.78},${t} A ${n} ${n} 0 0 1 ${r},${t}
      A ${n} ${n} 0 0 0 ${r + o * 0.78},${t}" fill="none" stroke=${s}
      stroke-width=${Math.round(o * 0.14 * 10) / 10} stroke-linecap="round">
      ${i === void 0 ? h : d`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${r} ${t}`} to=${`360 ${r} ${t}`} dur=${`${i}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}
function ms(r, t, e, s, i) {
  const o = (e - t) / 7, n = [];
  for (let l = 1; l < 7; l++) {
    const a = t + l * o;
    n.push(d`<line x1=${a} y1=${r - 24} x2=${a} y2=${r + 24} stroke=${i} stroke-width="3.5"/>`);
  }
  return d`<g id=${s}>
    <rect x=${t} y=${r - 24} width=${e - t} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${i} stroke-width="5"/>
    ${n}
  </g>`;
}
function gs(r, t, e, s, i, o) {
  const l = (s - e) / 5;
  let a = `M ${r},${e}`;
  for (let c = 0; c < 5; c++) {
    const p = e + c * l;
    a += ` L ${t},${p + l * 0.45} L ${r},${p + l * 0.9}`;
  }
  return d`<path id=${i} d=${a} fill="none" stroke=${o} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function me(r, t, e = 3, s = "#FFFFFF") {
  const i = [];
  for (let o = 0; o < e; o++)
    i.push(d`<circle r="8" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * o}s`}>
        <mpath href=${`#${r}`} xlink:href=${`#${r}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
function vs(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function xs(r) {
  const { hass: t, map: e, extras: s, animate: i } = r, o = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", c = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), p = o ? fs : kt, $ = o ? ae : kt, m = o ? ne : kt, u = o ? G : "#8FA3BC", w = o ? 1 : 0.55, U = 6 - (Number.isFinite(c) ? Math.min(100, Math.max(0, c)) : 60) / 100 * (6 - 1.8), g = i && o, E = [
    { entityId: e.t300_behaelter_avg, x: S, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: S, y: 685, color: "#1f4e79", size: "core" },
    { entityId: e.t300_temp_eheiz, x: v - 95, y: Et, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: v - 110, y: fe, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: v - 110, y: ue, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: S, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: e.t300_ventilator_pct, x: de, y: 264, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return d`
    <svg viewBox=${`0 0 ${C} ${bt}`} id="proxon-t300" data-state=${o ? "running" : "idle"}
         style=${`aspect-ratio: ${C} / ${bt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${C} height=${bt} fill="#FFFFFF"/>

      <rect id="tank" x=${_} y=${V} width=${v - _} height=${q - V}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${G} stroke-width=${ce}/>
      <path d=${`M ${v},${V + 90} L ${C - 60},${V + 90}`} stroke=${ne}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${v},${q - 70} L ${C - 60},${q - 70}`} stroke=${ae}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${C - 60} y=${V + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${C - 60} y=${q - 100} text-anchor="end">Kaltwasser</text>

      ${gs(v - 50, _ + 50, Ft, Ct, "condenser-coil", m)}

      <g id="e-heater">
        <rect x=${_ + 50} y=${Et - 12} width=${(v - _) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : G}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${_ + 78},${Et} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : G} stroke-width="4.5"/>
      </g>

      ${[[fe, "T21 Mitte"], [ue, "T20 unten"]].map(
    ([x, Oe]) => d`
          <circle cx=${_ + 90} cy=${x} r="9" fill=${le}/>
          <text class="tag" x=${_ + 110} y=${x + 9}>${Oe}</text>`
  )}

      <rect id="hp-case" x=${_} y=${he} width=${v - _} height=${$e - he}
        rx="24" fill=${ps} fill-opacity="0.9" stroke=${G} stroke-width=${ce}/>

      ${_e([[40, K], [S, K], [S, H]], p, "flow-air-in", w)}
      ${_e([[S, H], [S, $t], [C - 40, $t]], $, "flow-air-out", w)}
      ${ye(120, K)}
      ${ye(920, $t)}
      ${g ? me("flow-air-in", U) : h}
      ${g ? me("flow-air-out", U) : h}

      ${ys(de, K, "fan-t300", u, i && o ? U / 3 : void 0)}
      ${ms(H, _ + 60, v - 60, "evaporator", u)}

      <g id="refrigerant" opacity=${w}>
        <path d=${`M ${_ + 150},${H + 24} L ${_ + 150},${b} L ${M - 42},${b}`}
          fill="none" stroke=${m} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${M + 42},${b} L ${v - 60},${b} L ${v - 60},${Ft} L ${v - 50},${Ft}`}
          fill="none" stroke=${m} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${_ + 50},${Ct} L ${_ + 26},${Ct} L ${_ + 26},${H + 24} L ${_ + 62},${H + 24}`}
          fill="none" stroke=${m} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${M} cy=${b} r="42" fill="#FFFFFF" stroke=${u} stroke-width="9"/>
        <g>
          <path d=${`M ${M - 31},${b - 15} L ${M + 29},${b - 7} L ${M},${b} Z`}
            fill=${u}/>
          ${i && o ? d`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${M} ${b}`} to=${`360 ${M} ${b}`}
                dur="1.1s" repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${M} cy=${b} r="7" fill=${le}/>
      </g>

      <text class="port" x="40" y=${K - 48}>Luft an</text>
      <text class="port" x=${C - 40} y=${$t + 66} text-anchor="end">Luft ab</text>

      ${l ? d`<text class="badge" x=${S} y=${$e - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : h}
      ${a ? d`<text class="badge" x=${S} y=${q + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : h}

      ${E.map(
    (x) => d`<text class=${`val ${x.size}`} x=${x.x} y=${x.y} text-anchor="middle"
          fill=${x.color} @click=${() => x.entityId && r.onEntityClick(x.entityId)}
          style=${x.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${vs(t, x.entityId)}
        </text>`
  )}
    </svg>`;
}
const As = [
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
  "bypass_min_frischluft"
], ws = [
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
function Se(r) {
  return r === "t300" ? ws : As;
}
function ks(r, t) {
  const e = (r.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function bs(r, t, e) {
  const s = r.filter(
    (o) => o.device_id === t && o.platform === "proxon" && !o.disabled_by
  ), i = {};
  for (const o of e) {
    const n = `_${o}`, l = s.find((a) => a.unique_id.endsWith(n));
    l && (i[o] = l.entity_id);
  }
  return i;
}
function Me(r, t, e) {
  const s = {}, i = new Set(e);
  for (const o of Object.values(r.entities ?? {})) {
    if (o.device_id !== t || o.platform !== "proxon") continue;
    const n = o.translation_key;
    n && i.has(n) && (s[n] = o.entity_id);
  }
  return s;
}
async function Es(r, t, e) {
  const s = Se(e), i = Me(r, t, s);
  if (Object.keys(i).length) return i;
  const o = await r.callWS({
    type: "config/entity_registry/list"
  });
  return bs(o, t, s);
}
function ge(r, t = "fwt") {
  const e = t === "t300" ? "T300" : "FWT 2.0", i = Object.values(r.devices ?? {}).filter(
    (o) => (o.identifiers ?? []).some((n) => n[0] === "proxon") && o.model === e
  );
  return i.length === 1 ? i[0].id : void 0;
}
const ft = class ft extends J {
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
    return { device_id: ge(t, "fwt") };
  }
  _variant() {
    if (this._config?.variant) return this._config.variant;
    const t = this._deviceId();
    if (this.hass && t) {
      const e = ks(this.hass, t);
      if (e) return e;
    }
    return "fwt";
  }
  _deviceId() {
    if (this._config?.device_id) return this._config.device_id;
    if (this.hass)
      return ge(this.hass, this._config?.variant ?? "fwt");
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
      const i = Me(this.hass, e, Se(s));
      if (Object.keys(i).length) {
        this._map = i, this._error = void 0, this._resolvedFor = e;
        return;
      }
    }
    this._resolvedFor !== e && (this._resolvedFor = e, Es(this.hass, e, s).then((i) => {
      this._map = i, this._error = Object.keys(i).length ? void 0 : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
    }).catch((i) => {
      this._resolvedFor = void 0, this._error = `Entity-Registry nicht lesbar: ${i.message}`;
    }));
  }
  render() {
    if (!this.hass || !this._config) return h;
    if (this._error)
      return mt`<ha-card><div class="error">${this._error}</div></ha-card>`;
    if (!Object.keys(this._map).length)
      return mt`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    const t = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      onEntityClick: this._showMoreInfo
    };
    return mt`
      <ha-card .header=${this._config.title ?? h}>
        <div class="wrap">
          ${this._variant() === "t300" ? xs({ ...t, extras: this._config.extras ?? {} }) : ds(t)}
        </div>
      </ha-card>`;
  }
};
ft.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, ft.styles = Pe`
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
let Pt = ft;
customElements.define("proxon-schema-card", Pt);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
