/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const yt = globalThis, It = yt.ShadowRoot && (yt.ShadyCSS === void 0 || yt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Bt = Symbol(), Xt = /* @__PURE__ */ new WeakMap();
let Ce = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Bt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
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
const je = (o) => new Ce(typeof o == "string" ? o : o + "", void 0, Bt), Se = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((s, i, r) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + o[r + 1], o[0]);
  return new Ce(e, o, Bt);
}, We = (o, t) => {
  if (It) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = yt.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, o.appendChild(s);
  }
}, Gt = It ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return je(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ye, defineProperty: Xe, getOwnPropertyDescriptor: Ge, getOwnPropertyNames: Ke, getOwnPropertySymbols: Ve, getPrototypeOf: qe } = Object, bt = globalThis, Kt = bt.trustedTypes, Ze = Kt ? Kt.emptyScript : "", Je = bt.reactiveElementPolyfillSupport, et = (o, t) => o, Lt = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? Ze : null;
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
} }, Me = (o, t) => !Ye(o, t), Vt = { attribute: !0, type: String, converter: Lt, reflect: !1, useDefault: !1, hasChanged: Me };
Symbol.metadata ??= Symbol("metadata"), bt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
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
      i !== void 0 && Xe(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: r } = Ge(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Vt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(et("elementProperties"))) return;
    const t = qe(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(et("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(et("properties"))) {
      const e = this.properties, s = [...Ke(e), ...Ve(e)];
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
    return We(t, this.constructor.elementStyles), t;
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
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : Lt).toAttribute(e, s.type);
      this._$Em = t, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const r = s.getPropertyOptions(i), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Lt;
      this._$Em = i;
      const l = n.fromAttribute(e, r.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, r) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (r = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Me)(r, e) || s.useDefault && s.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
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
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[et("elementProperties")] = /* @__PURE__ */ new Map(), D[et("finalized")] = /* @__PURE__ */ new Map(), Je?.({ ReactiveElement: D }), (bt.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dt = globalThis, qt = (o) => o, vt = Dt.trustedTypes, Zt = vt ? vt.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, Te = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, Oe = "?" + z, Qe = `<${Oe}>`, R = document, it = () => R.createComment(""), ot = (o) => o === null || typeof o != "object" && typeof o != "function", jt = Array.isArray, ts = (o) => jt(o) || typeof o?.[Symbol.iterator] == "function", kt = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Jt = /-->/g, Qt = />/g, P = RegExp(`>|${kt}(?:([^\\s"'>=/]+)(${kt}*=${kt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), te = /'/g, ee = /"/g, ze = /^(?:script|style|textarea|title)$/i, Pe = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), mt = Pe(1), $ = Pe(2), X = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), se = /* @__PURE__ */ new WeakMap(), N = R.createTreeWalker(R, 129);
function Le(o, t) {
  if (!jt(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Zt !== void 0 ? Zt.createHTML(t) : t;
}
const es = (o, t) => {
  const e = o.length - 1, s = [];
  let i, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = V;
  for (let l = 0; l < e; l++) {
    const a = o[l];
    let c, p, d = -1, f = 0;
    for (; f < a.length && (n.lastIndex = f, p = n.exec(a), p !== null); ) f = n.lastIndex, n === V ? p[1] === "!--" ? n = Jt : p[1] !== void 0 ? n = Qt : p[2] !== void 0 ? (ze.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = P) : p[3] !== void 0 && (n = P) : n === P ? p[0] === ">" ? (n = i ?? V, d = -1) : p[1] === void 0 ? d = -2 : (d = n.lastIndex - p[2].length, c = p[1], n = p[3] === void 0 ? P : p[3] === '"' ? ee : te) : n === ee || n === te ? n = P : n === Jt || n === Qt ? n = V : (n = P, i = void 0);
    const m = n === P && o[l + 1].startsWith("/>") ? " " : "";
    r += n === V ? a + Qe : d >= 0 ? (s.push(c), a.slice(0, d) + Te + a.slice(d) + z + m) : a + z + (d === -2 ? l : m);
  }
  return [Le(o, r + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class rt {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let r = 0, n = 0;
    const l = t.length - 1, a = this.parts, [c, p] = es(t, e);
    if (this.el = rt.createElement(c, s), N.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = N.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Te)) {
          const f = p[n++], m = i.getAttribute(d).split(z), k = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: r, name: k[2], strings: m, ctor: k[1] === "." ? is : k[1] === "?" ? os : k[1] === "@" ? rs : wt }), i.removeAttribute(d);
        } else d.startsWith(z) && (a.push({ type: 6, index: r }), i.removeAttribute(d));
        if (ze.test(i.tagName)) {
          const d = i.textContent.split(z), f = d.length - 1;
          if (f > 0) {
            i.textContent = vt ? vt.emptyScript : "";
            for (let m = 0; m < f; m++) i.append(d[m], it()), N.nextNode(), a.push({ type: 2, index: ++r });
            i.append(d[f], it());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Oe) a.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = i.data.indexOf(z, d + 1)) !== -1; ) a.push({ type: 7, index: r }), d += z.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const s = R.createElement("template");
    return s.innerHTML = t, s;
  }
}
function G(o, t, e = o, s) {
  if (t === X) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const r = ot(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(o), i._$AT(o, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = G(o, i._$AS(o, t.values), i, s)), t;
}
class ss {
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
    let r = N.nextNode(), n = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (n === a.index) {
        let c;
        a.type === 2 ? c = new nt(r, r.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (c = new ns(r, this, t)), this._$AV.push(c), a = s[++l];
      }
      n !== a?.index && (r = N.nextNode(), n++);
    }
    return N.currentNode = R, i;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class nt {
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
    t = G(this, t, e), ot(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ts(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && ot(this._$AH) ? this._$AA.nextSibling.data = t : this.T(R.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = rt.createElement(Le(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const r = new ss(i, this), n = r.u(this.options);
      r.p(e), this.T(n), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = se.get(t.strings);
    return e === void 0 && se.set(t.strings, e = new rt(t)), e;
  }
  k(t) {
    jt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const r of t) i === e.length ? e.push(s = new nt(this.O(it()), this.O(it()), this, this.options)) : s = e[i], s._$AI(r), i++;
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
let wt = class {
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
    if (r === void 0) t = G(this, t, e, 0), n = !ot(t) || t !== this._$AH && t !== X, n && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = r[0], a = 0; a < r.length - 1; a++) c = G(this, l[s + a], e, a), c === X && (c = this._$AH[a]), n ||= !ot(c) || c !== this._$AH[a], c === h ? t = h : t !== h && (t += (c ?? "") + r[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class is extends wt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class os extends wt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class rs extends wt {
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
class ns {
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
const as = Dt.litHtmlPolyfillSupport;
as?.(rt, nt), (Dt.litHtmlVersions ??= []).push("3.3.3");
const ls = (o, t, e) => {
  const s = e?.renderBefore ?? t;
  let i = s._$litPart$;
  if (i === void 0) {
    const r = e?.renderBefore ?? null;
    s._$litPart$ = i = new nt(t.insertBefore(it(), r), r, void 0, e ?? {});
  }
  return i._$AI(o), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = globalThis;
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ls(e, this.renderRoot, this.renderOptions);
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
Y._$litElement$ = !0, Y.finalized = !0, Wt.litElementHydrateSupport?.({ LitElement: Y });
const cs = Wt.litElementPolyfillSupport;
cs?.({ LitElement: Y });
(Wt.litElementVersions ??= []).push("4.2.2");
const M = "#306291", hs = "#E2E8F2", ht = "#8DC63F", ie = "#F3B229", oe = "#79593A", Et = "#D62631", re = "#1A1A1A", ds = "#7A7A7A", $s = "#C3CEDE", ne = "#2F80ED", Ft = 1600, Ct = 900, ae = 210, le = 120, ps = 1390, us = 800, fs = 22, u = 315, _ = 605, st = 62, H = st / 2, j = 800, dt = 460, W = 168, Ne = 450, Re = 1150, _s = 42, ys = 350, $t = 350, pt = 1250, A = 725, L = 900, b = 590, q = 690, I = 1030, E = 240, O = 1360, Nt = j - W, Rt = j + W, ce = Math.round((Nt - E) / (O - E) * 100), he = Math.round((Rt - E) / (O - E) * 100), ms = 1.29, gt = (o) => "M " + o.map(([t, e]) => `${t},${e}`).join(" L ");
function ut(o, t, e, s = 2, i = 36) {
  const r = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const c = o + (e ? a * i : -a * i);
    l.push($`<path d="M ${c - r},${t - n} L ${c},${t} L ${c - r},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function ft(o, t, e, s = 1) {
  return $`<path id=${e ?? h} d=${gt(o)} fill="none" stroke=${t}
    stroke-width=${st} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function St(o, t, e, s) {
  return $`<g id=${s}>
    <rect x=${o - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${M} stroke-width="6"/>
    <line x1=${o} y1=${t} x2=${o} y2=${e} stroke=${M} stroke-width="4"/>
  </g>`;
}
function de(o, t, e) {
  const s = _s, i = u, r = s * 0.5, n = $`<path d="M ${o - s * 0.78},${i} A ${r} ${r} 0 0 1 ${o},${i}
      A ${r} ${r} 0 0 0 ${o + s * 0.78},${i}" fill="none" stroke=${M}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? h : $`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${o} ${i}`} to=${`360 ${o} ${i}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return $`<g id=${t}>
    <circle cx=${o} cy=${i} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${M}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function $e(o, t, e = 4, s = "#FFFFFF") {
  const i = [];
  for (let r = 0; r < e; r++)
    i.push($`<circle r="9" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${o}`} xlink:href=${`#${o}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
const gs = (o, t) => {
  if (!t) return;
  const e = Number(o.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function vs(o, t) {
  if (!t) return "–";
  const e = o.states[t];
  if (!e) return "–";
  if (o.formatEntityState) return o.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function xs(o, t, e = 3.5, s = 10) {
  return (o === void 0 || o <= 0 ? s : s - Math.min(100, Math.max(0, o)) / 100 * (s - e)) / t;
}
const As = [
  { key: "t3_frischluft", x: 120, y: u + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: _ + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: u + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: _ + 22, color: "red", size: "core" },
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
function bs(o) {
  const { hass: t, map: e, animate: s } = o, i = t.states[e.bypass_offen ?? ""]?.state === "on", r = t.states[e.lueftung ?? ""], n = r?.state === "on", l = r?.attributes?.percentage, a = gs(t, e.kompressor_drehzahl), c = e.vierwege_ventil, d = !!(c && t.states[c]) && t.states[c].state === "on" && (a ?? 0) > 0, f = d ? ne : M, m = i ? 0 : 90, k = i ? ht : $s, Yt = i ? 1 : 0.6, K = i ? 0.18 : 1, U = xs(n ? l ?? 50 : void 0, o.speed), at = s && n, lt = U / 2, v = [[E, u], [Nt, u], [Rt, _], [O, _]], ct = H + 14, Be = gt([
    [E, u],
    [b, u],
    [b, q],
    [I, q],
    [I, _],
    [O, _]
  ]);
  return $`
    <svg viewBox=${`0 0 ${Ft} ${Ct}`} id="proxon-fwt" data-bypass=${i ? "open" : "closed"}
         style=${`aspect-ratio: ${Ft} / ${Ct}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${E} y1="0" x2=${O} y2="0">
          <stop offset="0%" stop-color=${ht}/><stop offset=${`${ce}%`} stop-color=${ht}/>
          <stop offset=${`${he}%`} stop-color=${Et}/><stop offset="100%" stop-color=${Et}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${O} y1="0" x2=${E} y2="0">
          <stop offset="0%" stop-color=${ie}/><stop offset=${`${ce}%`} stop-color=${ie}/>
          <stop offset=${`${he}%`} stop-color=${oe}/><stop offset="100%" stop-color=${oe}/>
        </linearGradient>
      </defs>

      <rect id="backdrop" width=${Ft} height=${Ct} fill="#FFFFFF"/>
      <rect id="case" x=${ae} y=${le} width=${ps - ae} height=${us - le} rx="12"
        fill=${hs} stroke=${M} stroke-width=${fs}/>

      <g id="flow-extract-exhaust">
        ${ft([[O, u], [Rt, u], [Nt, _], [E, _]], "url(#gradExhaust)", "flow-exhaust")}
        ${ut(1325, u, !1)}
        ${ut(300, _, !1)}
        ${at ? $e("flow-exhaust", U) : h}
      </g>

      <g id="flow-fresh-supply">
        ${ft(v, "url(#gradSupply)", "flow-supply", K)}
        ${i ? $`${ft([[E, u], [b, u]], ht, "flow-fresh-active")}
                ${ft([[I, _], [O, _]], Et, "flow-supply-active")}` : h}
        ${ut(275, u, !0)}
        ${ut(1305, _, !0)}
        ${i ? $`<path id="flow-supply-bypass" fill="none" stroke="none" d=${Be}/>` : h}
        ${at ? $e(i ? "flow-supply-bypass" : "flow-supply", U * (i ? ms : 1)) : h}
      </g>

      <polygon id="heat-exchanger"
        points=${`${j},${dt - W} ${j + W},${dt} ${j},${dt + W} ${j - W},${dt}`}
        fill="none" stroke=${M} stroke-width="10"/>

      <g id="bypass" data-state=${i ? "open" : "closed"}>
        ${[
    gt([[b, u + H], [b, _ - ct]]),
    gt([[b, _ + ct], [b, q], [I, q], [I, _ + H]])
  ].map(
    (x, T) => $`
            <path id=${T === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${x} fill="none"
              stroke=${k} stroke-width=${st} stroke-linejoin="round" opacity=${Yt}/>
            <path d=${x} fill="none" stroke=${M} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${m} ${b} ${u + H})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${b - 9} y=${u + H - st / 2 - 8} width="18" height=${st + 16} rx="9"
            fill=${M} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${b} cy=${u + H} r="10" fill=${re} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${de(Ne, "fan-supply", s && n ? lt : void 0)}
      ${de(Re, "fan-extract", s && n ? lt : void 0)}
      ${St(ys, u - 95, u + 95, "preheater")}
      ${St($t, _ - 110, 700, "evaporator")}
      ${St(pt, _ - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${$t} y1=${A} x2=${pt} y2=${A}
        stroke=${f} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${$t} y1="700" x2=${$t} y2=${A} stroke=${f} stroke-width="7"/>
      <line x1=${pt} y1="700" x2=${pt} y2=${A} stroke=${f} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${L} cy=${A} r="40" fill="#FFFFFF" stroke=${f} stroke-width="9"/>
        <g>
          <path d=${`M ${L - 30},${A - 15} L ${L + 28},${A - 7} L ${L},${A} Z`}
            fill=${f}/>
          ${s && a ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${L} ${A}`} to=${`360 ${L} ${A}`}
                dur=${`${Math.max(1.2, 240 / a) / o.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${L} cy=${A} r="7" fill=${re}/>
      </g>

      ${[
    ["Frischluft", 120, u - 30],
    ["Fortluft", 120, _ - 30],
    ["Abluft", 1480, u - 30],
    ["Zuluft", 1480, _ - 30]
  ].map(
    ([x, T, De]) => $`<text class="port" x=${T} y=${De} text-anchor="middle">${x}</text>`
  )}

      ${d ? $`<text class="badge" x="1150" y="700" text-anchor="middle" fill=${ne}>KÜHLEN</text>` : h}

      <text id="bypass-label" class="bp" x=${(b + I) / 2} y=${q - 46}
        text-anchor="middle" fill=${i ? "#4C8C1B" : ds}>
        ${i ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${As.map((x) => {
    const T = e[x.key];
    return $`<text class=${`val ${x.size}`} x=${x.x} y=${x.y} text-anchor="middle"
          fill=${x.color} @click=${() => T && o.onEntityClick(T)}
          style=${T ? "cursor: pointer" : "opacity: 0.4"}>
          ${(x.prefix ?? "") + vs(t, T)}
        </text>`;
  })}
    </svg>`;
}
const Z = "#306291", ws = "#E2E8F2", ks = "#F3B229", pe = "#D62631", ue = "#3E8FD0", fe = "#1A1A1A", Mt = "#C3CEDE", F = 1e3, Tt = 1500, Es = 54, _e = 20, y = 210, g = 790, ye = 90, me = 520, J = 520, Q = 1430, C = (y + g) / 2, tt = 205, _t = 400, ge = 330, ve = 38, B = 300, S = 640, w = 455, Ot = 760, xe = 900, Ae = 1060, zt = 1140, Pt = 1360, Fs = (o) => "M " + o.map(([t, e]) => `${t},${e}`).join(" L ");
function be(o, t, e, s = 1) {
  return $`<path id=${e} d=${Fs(o)} fill="none" stroke=${t} stroke-width=${Es}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function we(o, t, e, s = 2, i = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const c = o + a * i;
    l.push($`<path d="M ${c - 17},${t - 15} L ${c},${t} L ${c - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function Cs(o, t, e, s, i) {
  const r = ve, n = ve * 0.5;
  return $`<g id=${e}>
    <circle cx=${o} cy=${t} r=${r} fill="#FFFFFF" fill-opacity="0.6" stroke=${s}
      stroke-width=${Math.round(r * 0.16 * 10) / 10}/>
    <path d="M ${o - r * 0.78},${t} A ${n} ${n} 0 0 1 ${o},${t}
      A ${n} ${n} 0 0 0 ${o + r * 0.78},${t}" fill="none" stroke=${s}
      stroke-width=${Math.round(r * 0.14 * 10) / 10} stroke-linecap="round">
      ${i === void 0 ? h : $`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${o} ${t}`} to=${`360 ${o} ${t}`} dur=${`${i}s`} repeatCount="indefinite"/>`}
    </path>
  </g>`;
}
function Ss(o, t, e, s, i) {
  const r = (e - t) / 7, n = [];
  for (let l = 1; l < 7; l++) {
    const a = t + l * r;
    n.push($`<line x1=${a} y1=${o - 24} x2=${a} y2=${o + 24} stroke=${i} stroke-width="3.5"/>`);
  }
  return $`<g id=${s}>
    <rect x=${t} y=${o - 24} width=${e - t} height="48" fill="#FFFFFF" fill-opacity="0.85"
      stroke=${i} stroke-width="5"/>
    ${n}
  </g>`;
}
function Ms(o, t, e, s, i, r) {
  const l = (s - e) / 5;
  let a = `M ${o},${e}`;
  for (let c = 0; c < 5; c++) {
    const p = e + c * l;
    a += ` L ${t},${p + l * 0.45} L ${o},${p + l * 0.9}`;
  }
  return $`<path id=${i} d=${a} fill="none" stroke=${r} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function ke(o, t, e = 3, s = "#FFFFFF") {
  const i = [];
  for (let r = 0; r < e; r++)
    i.push($`<circle r="8" fill=${s} opacity="0.75">
      <animateMotion dur=${`${t}s`} repeatCount="indefinite" calcMode="paced"
        begin=${`${-(t / e) * r}s`}>
        <mpath href=${`#${o}`} xlink:href=${`#${o}`}/>
      </animateMotion>
    </circle>`);
  return i;
}
function Ts(o, t) {
  if (!t) return "–";
  const e = o.states[t];
  if (!e) return "–";
  if (o.formatEntityState) return o.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function Os(o) {
  const { hass: t, map: e, extras: s, animate: i } = o, r = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", c = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), p = r ? ks : Mt, d = r ? ue : Mt, f = r ? pe : Mt, m = r ? Z : "#8FA3BC", k = r ? 1 : 0.55, K = (10 - (Number.isFinite(c) ? Math.min(100, Math.max(0, c)) : 60) / 100 * (10 - 3.5)) / o.speed, U = i && r, at = K / 2, lt = [
    { entityId: e.t300_behaelter_avg, x: C, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: C, y: 685, color: "#1f4e79", size: "core" },
    { entityId: e.t300_temp_eheiz, x: g - 95, y: Ot, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: g - 110, y: xe, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: g - 110, y: Ae, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: C, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: e.t300_ventilator_pct, x: ge, y: 264, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return $`
    <svg viewBox=${`0 0 ${F} ${Tt}`} id="proxon-t300" data-state=${r ? "running" : "idle"}
         style=${`aspect-ratio: ${F} / ${Tt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${F} height=${Tt} fill="#FFFFFF"/>

      <rect id="tank" x=${y} y=${J} width=${g - y} height=${Q - J}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${Z} stroke-width=${_e}/>
      <path d=${`M ${g},${J + 90} L ${F - 60},${J + 90}`} stroke=${pe}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${g},${Q - 70} L ${F - 60},${Q - 70}`} stroke=${ue}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${F - 60} y=${J + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${F - 60} y=${Q - 100} text-anchor="end">Kaltwasser</text>

      ${Ms(g - 50, y + 50, zt, Pt, "condenser-coil", f)}

      <g id="e-heater">
        <rect x=${y + 50} y=${Ot - 12} width=${(g - y) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : Z}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${y + 78},${Ot} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : Z} stroke-width="4.5"/>
      </g>

      ${[[xe, "T21 Mitte"], [Ae, "T20 unten"]].map(
    ([v, ct]) => $`
          <circle cx=${y + 90} cy=${v} r="9" fill=${fe}/>
          <text class="tag" x=${y + 110} y=${v + 9}>${ct}</text>`
  )}

      <rect id="hp-case" x=${y} y=${ye} width=${g - y} height=${me - ye}
        rx="24" fill=${ws} fill-opacity="0.9" stroke=${Z} stroke-width=${_e}/>

      ${be([[40, tt], [C, tt], [C, B]], p, "flow-air-in", k)}
      ${be([[C, B], [C, _t], [F - 40, _t]], d, "flow-air-out", k)}
      ${we(120, tt)}
      ${we(920, _t)}
      ${U ? ke("flow-air-in", K) : h}
      ${U ? ke("flow-air-out", K) : h}

      ${Cs(ge, tt, "fan-t300", m, i && r ? at : void 0)}
      ${Ss(B, y + 60, g - 60, "evaporator", m)}

      <g id="refrigerant" opacity=${k}>
        <path d=${`M ${y + 150},${B + 24} L ${y + 150},${w} L ${S - 42},${w}`}
          fill="none" stroke=${f} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${S + 42},${w} L ${g - 60},${w} L ${g - 60},${zt} L ${g - 50},${zt}`}
          fill="none" stroke=${f} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${y + 50},${Pt} L ${y + 26},${Pt} L ${y + 26},${B + 24} L ${y + 62},${B + 24}`}
          fill="none" stroke=${f} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${S} cy=${w} r="42" fill="#FFFFFF" stroke=${m} stroke-width="9"/>
        <g>
          <path d=${`M ${S - 31},${w - 15} L ${S + 29},${w - 7} L ${S},${w} Z`}
            fill=${m}/>
          ${i && r ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${S} ${w}`} to=${`360 ${S} ${w}`}
                dur=${`${1.8 / o.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${S} cy=${w} r="7" fill=${fe}/>
      </g>

      <text class="port" x="40" y=${tt - 48}>Luft an</text>
      <text class="port" x=${F - 40} y=${_t + 66} text-anchor="end">Luft ab</text>

      ${l ? $`<text class="badge" x=${C} y=${me - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : h}
      ${a ? $`<text class="badge" x=${C} y=${Q + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : h}

      ${lt.map(
    (v) => $`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => v.entityId && o.onEntityClick(v.entityId)}
          style=${v.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${Ts(t, v.entityId)}
        </text>`
  )}
    </svg>`;
}
const zs = [
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
], Ps = [
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
  return o === "t300" ? Ps : zs;
}
function He(o, t) {
  const e = (o.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function Ls(o, t, e) {
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
async function Ns(o, t, e) {
  const s = Ue(e), i = Ie(o, t, s);
  if (Object.keys(i).length) return i;
  const r = await o.callWS({
    type: "config/entity_registry/list"
  });
  return Ls(r, t, s);
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
], Rs = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } }
  ]
}, Us = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss"
}, Hs = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss"
}, xt = class xt extends Y {
  constructor() {
    super(...arguments), this._computeLabel = (t) => Us[t.name] ?? t.name, this._computeHelper = (t) => Hs[t.name] ?? "";
  }
  setConfig(t) {
    this._config = t;
  }
  _schema() {
    const t = this._config?.device_id;
    return this._config?.variant === "t300" || (this.hass && t ? He(this.hass, t) === "t300" : !1) ? [...Fe, Rs] : Fe;
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
    return !this.hass || !this._config ? h : mt`
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
xt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, xt.styles = Se`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
let Ut = xt;
customElements.define("proxon-schema-card-editor", Ut);
const At = class At extends Y {
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
    this._resolvedFor !== e && (this._resolvedFor = e, Ns(this.hass, e, s).then((i) => {
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
    const t = Number(this._config.animation_speed), e = Number.isFinite(t) && t > 0 ? Math.min(5, Math.max(0.1, t)) : 1, s = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      speed: e,
      onEntityClick: this._showMoreInfo
    };
    return mt`
      <ha-card .header=${this._config.title ?? h}>
        <div class="wrap">
          ${this._variant() === "t300" ? Os({ ...s, extras: this._config.extras ?? {} }) : bs(s)}
        </div>
      </ha-card>`;
  }
};
At.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, At.styles = Se`
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
let Ht = At;
customElements.define("proxon-schema-card", Ht);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
