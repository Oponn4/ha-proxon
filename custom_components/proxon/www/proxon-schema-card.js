/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pt = globalThis, Ut = pt.ShadowRoot && (pt.ShadyCSS === void 0 || pt.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ht = Symbol(), jt = /* @__PURE__ */ new WeakMap();
let we = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== Ht) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Ut && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = jt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && jt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ue = (r) => new we(typeof r == "string" ? r : r + "", void 0, Ht), ke = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((s, i, o) => s + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + r[o + 1], r[0]);
  return new we(e, r, Ht);
}, He = (r, t) => {
  if (Ut) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), i = pt.litNonce;
    i !== void 0 && s.setAttribute("nonce", i), s.textContent = e.cssText, r.appendChild(s);
  }
}, Wt = Ut ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Ue(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ie, defineProperty: Be, getOwnPropertyDescriptor: De, getOwnPropertyNames: je, getOwnPropertySymbols: We, getPrototypeOf: Ye } = Object, mt = globalThis, Yt = mt.trustedTypes, Xe = Yt ? Yt.emptyScript : "", Ge = mt.reactiveElementPolyfillSupport, Q = (r, t) => r, zt = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? Xe : null;
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
} }, Ee = (r, t) => !Ie(r, t), Xt = { attribute: !0, type: String, converter: zt, reflect: !1, useDefault: !1, hasChanged: Ee };
Symbol.metadata ??= Symbol("metadata"), mt.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let I = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Xt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), i = this.getPropertyDescriptor(t, s, e);
      i !== void 0 && Be(this.prototype, t, i);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: i, set: o } = De(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Xt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Q("elementProperties"))) return;
    const t = Ye(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Q("properties"))) {
      const e = this.properties, s = [...je(e), ...We(e)];
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
      for (const i of s) e.unshift(Wt(i));
    } else t !== void 0 && e.push(Wt(t));
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
    return He(t, this.constructor.elementStyles), t;
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
      const o = (s.converter?.toAttribute !== void 0 ? s.converter : zt).toAttribute(e, s.type);
      this._$Em = t, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, i = s._$Eh.get(t);
    if (i !== void 0 && this._$Em !== i) {
      const o = s.getPropertyOptions(i), n = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : zt;
      this._$Em = i;
      const l = n.fromAttribute(e, o.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, i = !1, o) {
    if (t !== void 0) {
      const n = this.constructor;
      if (i === !1 && (o = this[t]), s ??= n.getPropertyOptions(t), !((s.hasChanged ?? Ee)(o, e) || s.useDefault && s.reflect && o === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, s)))) return;
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
I.elementStyles = [], I.shadowRootOptions = { mode: "open" }, I[Q("elementProperties")] = /* @__PURE__ */ new Map(), I[Q("finalized")] = /* @__PURE__ */ new Map(), Ge?.({ ReactiveElement: I }), (mt.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const It = globalThis, Gt = (r) => r, ft = It.trustedTypes, Vt = ft ? ft.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, Fe = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, Ce = "?" + z, Ve = `<${Ce}>`, R = document, et = () => R.createComment(""), st = (r) => r === null || typeof r != "object" && typeof r != "function", Bt = Array.isArray, Ke = (r) => Bt(r) || typeof r?.[Symbol.iterator] == "function", xt = `[ 	
\f\r]`, V = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Kt = /-->/g, qt = />/g, O = RegExp(`>|${xt}(?:([^\\s"'>=/]+)(${xt}*=${xt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Zt = /'/g, Jt = /"/g, Se = /^(?:script|style|textarea|title)$/i, Me = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), ut = Me(1), $ = Me(2), W = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Qt = /* @__PURE__ */ new WeakMap(), N = R.createTreeWalker(R, 129);
function Te(r, t) {
  if (!Bt(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Vt !== void 0 ? Vt.createHTML(t) : t;
}
const qe = (r, t) => {
  const e = r.length - 1, s = [];
  let i, o = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = V;
  for (let l = 0; l < e; l++) {
    const a = r[l];
    let c, p, d = -1, m = 0;
    for (; m < a.length && (n.lastIndex = m, p = n.exec(a), p !== null); ) m = n.lastIndex, n === V ? p[1] === "!--" ? n = Kt : p[1] !== void 0 ? n = qt : p[2] !== void 0 ? (Se.test(p[2]) && (i = RegExp("</" + p[2], "g")), n = O) : p[3] !== void 0 && (n = O) : n === O ? p[0] === ">" ? (n = i ?? V, d = -1) : p[1] === void 0 ? d = -2 : (d = n.lastIndex - p[2].length, c = p[1], n = p[3] === void 0 ? O : p[3] === '"' ? Jt : Zt) : n === Jt || n === Zt ? n = O : n === Kt || n === qt ? n = V : (n = O, i = void 0);
    const _ = n === O && r[l + 1].startsWith("/>") ? " " : "";
    o += n === V ? a + Ve : d >= 0 ? (s.push(c), a.slice(0, d) + Fe + a.slice(d) + z + _) : a + z + (d === -2 ? l : _);
  }
  return [Te(r, o + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class it {
  constructor({ strings: t, _$litType$: e }, s) {
    let i;
    this.parts = [];
    let o = 0, n = 0;
    const l = t.length - 1, a = this.parts, [c, p] = qe(t, e);
    if (this.el = it.createElement(c, s), N.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (i = N.nextNode()) !== null && a.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const d of i.getAttributeNames()) if (d.endsWith(Fe)) {
          const m = p[n++], _ = i.getAttribute(d).split(z), b = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: o, name: b[2], strings: _, ctor: b[1] === "." ? Je : b[1] === "?" ? Qe : b[1] === "@" ? ts : gt }), i.removeAttribute(d);
        } else d.startsWith(z) && (a.push({ type: 6, index: o }), i.removeAttribute(d));
        if (Se.test(i.tagName)) {
          const d = i.textContent.split(z), m = d.length - 1;
          if (m > 0) {
            i.textContent = ft ? ft.emptyScript : "";
            for (let _ = 0; _ < m; _++) i.append(d[_], et()), N.nextNode(), a.push({ type: 2, index: ++o });
            i.append(d[m], et());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ce) a.push({ type: 2, index: o });
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
function Y(r, t, e = r, s) {
  if (t === W) return t;
  let i = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const o = st(t) ? void 0 : t._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(r), i._$AT(r, e, s)), s !== void 0 ? (e._$Co ??= [])[s] = i : e._$Cl = i), i !== void 0 && (t = Y(r, i._$AS(r, t.values), i, s)), t;
}
class Ze {
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
        a.type === 2 ? c = new rt(o, o.nextSibling, this, t) : a.type === 1 ? c = new a.ctor(o, a.name, a.strings, this, t) : a.type === 6 && (c = new es(o, this, t)), this._$AV.push(c), a = s[++l];
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
    t = Y(this, t, e), st(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== W && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ke(t) ? this.k(t) : this._(t);
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
    const { values: e, _$litType$: s } = t, i = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = it.createElement(Te(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === i) this._$AH.p(e);
    else {
      const o = new Ze(i, this), n = o.u(this.options);
      o.p(e), this.T(n), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Qt.get(t.strings);
    return e === void 0 && Qt.set(t.strings, e = new it(t)), e;
  }
  k(t) {
    Bt(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, i = 0;
    for (const o of t) i === e.length ? e.push(s = new rt(this.O(et()), this.O(et()), this, this.options)) : s = e[i], s._$AI(o), i++;
    i < e.length && (this._$AR(s && s._$AB.nextSibling, i), e.length = i);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = Gt(t).nextSibling;
      Gt(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
let gt = class {
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
    if (o === void 0) t = Y(this, t, e, 0), n = !st(t) || t !== this._$AH && t !== W, n && (this._$AH = t);
    else {
      const l = t;
      let a, c;
      for (t = o[0], a = 0; a < o.length - 1; a++) c = Y(this, l[s + a], e, a), c === W && (c = this._$AH[a]), n ||= !st(c) || c !== this._$AH[a], c === h ? t = h : t !== h && (t += (c ?? "") + o[a + 1]), this._$AH[a] = c;
    }
    n && !i && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class Je extends gt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Qe extends gt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class ts extends gt {
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
class es {
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
const ss = It.litHtmlPolyfillSupport;
ss?.(it, rt), (It.litHtmlVersions ??= []).push("3.3.3");
const is = (r, t, e) => {
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
const Dt = globalThis;
class j extends I {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = is(e, this.renderRoot, this.renderOptions);
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
j._$litElement$ = !0, j.finalized = !0, Dt.litElementHydrateSupport?.({ LitElement: j });
const rs = Dt.litElementPolyfillSupport;
rs?.({ LitElement: j });
(Dt.litElementVersions ??= []).push("4.2.2");
const A = "#306291", os = "#E2E8F2", ot = "#8DC63F", te = "#F3B229", ee = "#79593A", At = "#D62631", se = "#1A1A1A", ns = "#7A7A7A", as = "#C3CEDE", bt = 1600, wt = 900, ie = 210, re = 120, ls = 1390, cs = 800, hs = 22, u = 315, y = 605, tt = 62, U = tt / 2, B = 800, nt = 460, D = 168, ze = 450, Oe = 1150, ds = 42, $s = 350, at = 350, lt = 1250, w = 725, P = 900, F = 590, kt = 690, ct = 1030, T = 240, L = 1360, Ot = B - D, Pt = B + D, oe = Math.round((Ot - T) / (L - T) * 100), ne = Math.round((Pt - T) / (L - T) * 100), Lt = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function ht(r, t, e, s = 2, i = 36) {
  const o = e ? 21 : -21, n = 19, l = [];
  for (let a = 0; a < s; a++) {
    const c = r + (e ? a * i : -a * i);
    l.push($`<path d="M ${c - o},${t - n} L ${c},${t} L ${c - o},${t + n}" fill="none"
      stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function dt(r, t, e, s = 1) {
  return $`<path id=${e ?? h} d=${Lt(r)} fill="none" stroke=${t}
    stroke-width=${tt} stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function Et(r, t, e, s) {
  return $`<g id=${s}>
    <rect x=${r - 14} y=${t} width="28" height=${e - t} fill="#FFFFFF" stroke=${A} stroke-width="6"/>
    <line x1=${r} y1=${t} x2=${r} y2=${e} stroke=${A} stroke-width="4"/>
  </g>`;
}
function ae(r, t, e) {
  const s = ds, i = u, o = s * 0.5, n = $`<path d="M ${r - s * 0.78},${i} A ${o} ${o} 0 0 1 ${r},${i}
      A ${o} ${o} 0 0 0 ${r + s * 0.78},${i}" fill="none" stroke=${A}
      stroke-width=${Math.round(s * 0.14 * 10) / 10} stroke-linecap="round">
      ${e === void 0 ? h : $`<animateTransform attributeName="transform" type="rotate"
            from=${`0 ${r} ${i}`} to=${`360 ${r} ${i}`} dur=${`${e}s`} repeatCount="indefinite"/>`}
    </path>`;
  return $`<g id=${t}>
    <circle cx=${r} cy=${i} r=${s} fill="#FFFFFF" fill-opacity="0.6" stroke=${A}
      stroke-width=${Math.round(s * 0.16 * 10) / 10}/>
    ${n}
  </g>`;
}
function le(r, t, e = 4, s = "#FFFFFF") {
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
const ps = (r, t) => {
  if (!t) return;
  const e = Number(r.states[t]?.state);
  return Number.isFinite(e) ? e : void 0;
};
function us(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function fs(r, t, e = 3.5, s = 10) {
  return (r === void 0 || r <= 0 ? s : s - Math.min(100, Math.max(0, r)) / 100 * (s - e)) / t;
}
const _s = [
  { key: "t3_frischluft", x: 120, y: u + 22, color: "green", size: "core" },
  { key: "t4_fortluft", x: 120, y: y + 22, color: "brown", size: "core" },
  { key: "t7_abluft", x: 1480, y: u + 22, color: "orange", size: "core" },
  { key: "t1_zuluft", x: 1480, y: y + 22, color: "red", size: "core" },
  { key: "betriebsart", x: 800, y: 165, color: "#1f4e79", size: "core" },
  { key: "lueftung", x: 800, y: 225, color: "dimgray", size: "detail" },
  { key: "geraetefilter_remaining_days", x: 430, y: 195, color: "dimgray", size: "core", prefix: "Filter " },
  { key: "power_total", x: 1250, y: 165, color: "#1f4e79", size: "core" },
  { key: "rf_sensor1", x: 1250, y: 225, color: "dimgray", size: "detail" },
  { key: "drehzahl_zuluft", x: ze, y: 420, color: "dimgray", size: "detail" },
  { key: "drehzahl_abluft", x: Oe, y: 420, color: "dimgray", size: "detail" },
  { key: "kompressor_drehzahl", x: 350, y: 855, color: "dimgray", size: "detail" },
  { key: "kompressor_leistung", x: 620, y: 855, color: "dimgray", size: "detail" },
  { key: "t13_kompressor", x: 880, y: 855, color: "darkred", size: "detail" },
  { key: "bypass_min_frischluft", x: 1130, y: 855, color: "dimgray", size: "detail" }
];
function ys(r) {
  const { hass: t, map: e, animate: s } = r, i = t.states[e.bypass_offen ?? ""]?.state === "on", o = t.states[e.lueftung ?? ""], n = o?.state === "on", l = o?.attributes?.percentage, a = ps(t, e.kompressor_drehzahl), c = i ? 0 : 90, p = i ? ot : as, d = i ? 1 : 0.6, m = i ? 0.18 : 1, _ = fs(n ? l ?? 50 : void 0, r.speed), b = s && n, vt = _ / 2, X = [[T, u], [Ot, u], [Pt, y], [L, y]], G = U + 14;
  return $`
    <svg viewBox=${`0 0 ${bt} ${wt}`} id="proxon-fwt" data-bypass=${i ? "open" : "closed"}
         style=${`aspect-ratio: ${bt} / ${wt}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSupply" gradientUnits="userSpaceOnUse" x1=${T} y1="0" x2=${L} y2="0">
          <stop offset="0%" stop-color=${ot}/><stop offset=${`${oe}%`} stop-color=${ot}/>
          <stop offset=${`${ne}%`} stop-color=${At}/><stop offset="100%" stop-color=${At}/>
        </linearGradient>
        <linearGradient id="gradExhaust" gradientUnits="userSpaceOnUse" x1=${L} y1="0" x2=${T} y2="0">
          <stop offset="0%" stop-color=${te}/><stop offset=${`${oe}%`} stop-color=${te}/>
          <stop offset=${`${ne}%`} stop-color=${ee}/><stop offset="100%" stop-color=${ee}/>
        </linearGradient>
      </defs>

      <rect id="backdrop" width=${bt} height=${wt} fill="#FFFFFF"/>
      <rect id="case" x=${ie} y=${re} width=${ls - ie} height=${cs - re} rx="12"
        fill=${os} stroke=${A} stroke-width=${hs}/>

      <g id="flow-extract-exhaust">
        ${dt([[L, u], [Pt, u], [Ot, y], [T, y]], "url(#gradExhaust)", "flow-exhaust")}
        ${ht(1325, u, !1)}
        ${ht(300, y, !1)}
        ${b ? le("flow-exhaust", _) : h}
      </g>

      <g id="flow-fresh-supply">
        ${dt(X, "url(#gradSupply)", "flow-supply", m)}
        ${i ? $`${dt([[T, u], [F, u]], ot, "flow-fresh-active")}
                ${dt([[ct, y], [L, y]], At, "flow-supply-active")}` : h}
        ${ht(275, u, !0)}
        ${ht(1305, y, !0)}
        ${b ? le("flow-supply", _) : h}
      </g>

      <polygon id="heat-exchanger"
        points=${`${B},${nt - D} ${B + D},${nt} ${B},${nt + D} ${B - D},${nt}`}
        fill="none" stroke=${A} stroke-width="10"/>

      <g id="bypass" data-state=${i ? "open" : "closed"}>
        ${[
    Lt([[F, u + U], [F, y - G]]),
    Lt([[F, y + G], [F, kt], [ct, kt], [ct, y + U]])
  ].map(
    (v, E) => $`
            <path id=${E === 0 ? "bypass-duct-upper" : "bypass-duct-lower"} d=${v} fill="none"
              stroke=${p} stroke-width=${tt} stroke-linejoin="round" opacity=${d}/>
            <path d=${v} fill="none" stroke=${A} stroke-width="4" stroke-dasharray="18 12" opacity="0.8"/>`
  )}
      </g>

      <g id="bypass-flap-group">
        <g id="bypass-flap" transform=${`rotate(${c} ${F} ${u + U})`}
           style="transition: transform 600ms ease-in-out; transform-box: view-box;">
          <rect x=${F - 9} y=${u + U - tt / 2 - 8} width="18" height=${tt + 16} rx="9"
            fill=${A} stroke="#FFFFFF" stroke-width="4"/>
        </g>
        <circle cx=${F} cy=${u + U} r="10" fill=${se} stroke="#FFFFFF" stroke-width="3"/>
      </g>

      ${ae(ze, "fan-supply", s && n ? vt : void 0)}
      ${ae(Oe, "fan-extract", s && n ? vt : void 0)}
      ${Et($s, u - 95, u + 95, "preheater")}
      ${Et(at, y - 110, 700, "evaporator")}
      ${Et(lt, y - 110, 700, "condenser")}

      <line id="refrigerant-circuit" x1=${at} y1=${w} x2=${lt} y2=${w}
        stroke=${A} stroke-width="7" stroke-dasharray="30 18"/>
      <line x1=${at} y1="700" x2=${at} y2=${w} stroke=${A} stroke-width="7"/>
      <line x1=${lt} y1="700" x2=${lt} y2=${w} stroke=${A} stroke-width="7"/>

      <g id="compressor">
        <circle cx=${P} cy=${w} r="40" fill="#FFFFFF" stroke=${A} stroke-width="9"/>
        <g>
          <path d=${`M ${P - 30},${w - 15} L ${P + 28},${w - 7} L ${P},${w} Z`}
            fill=${A}/>
          ${s && a ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${P} ${w}`} to=${`360 ${P} ${w}`}
                dur=${`${Math.max(1.2, 240 / a) / r.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${P} cy=${w} r="7" fill=${se}/>
      </g>

      ${[
    ["Frischluft", 120, u - 30],
    ["Fortluft", 120, y - 30],
    ["Abluft", 1480, u - 30],
    ["Zuluft", 1480, y - 30]
  ].map(
    ([v, E, x]) => $`<text class="port" x=${E} y=${x} text-anchor="middle">${v}</text>`
  )}

      <text id="bypass-label" class="bp" x=${(F + ct) / 2} y=${kt - 46}
        text-anchor="middle" fill=${i ? "#4C8C1B" : ns}>
        ${i ? "BYPASS OFFEN" : "Bypass zu"}
      </text>

      ${_s.map((v) => {
    const E = e[v.key];
    return $`<text class=${`val ${v.size}`} x=${v.x} y=${v.y} text-anchor="middle"
          fill=${v.color} @click=${() => E && r.onEntityClick(E)}
          style=${E ? "cursor: pointer" : "opacity: 0.4"}>
          ${(v.prefix ?? "") + us(t, E)}
        </text>`;
  })}
    </svg>`;
}
const K = "#306291", ms = "#E2E8F2", gs = "#F3B229", ce = "#D62631", he = "#3E8FD0", de = "#1A1A1A", Ft = "#C3CEDE", C = 1e3, Ct = 1500, vs = 54, $e = 20, f = 210, g = 790, pe = 90, ue = 520, q = 520, Z = 1430, S = (f + g) / 2, J = 205, $t = 400, fe = 330, _e = 38, H = 300, M = 640, k = 455, St = 760, ye = 900, me = 1060, Mt = 1140, Tt = 1360, xs = (r) => "M " + r.map(([t, e]) => `${t},${e}`).join(" L ");
function ge(r, t, e, s = 1) {
  return $`<path id=${e} d=${xs(r)} fill="none" stroke=${t} stroke-width=${vs}
    stroke-linejoin="round" stroke-linecap="butt" opacity=${s}/>`;
}
function ve(r, t, e, s = 2, i = 30) {
  const l = [];
  for (let a = 0; a < s; a++) {
    const c = r + a * i;
    l.push($`<path d="M ${c - 17},${t - 15} L ${c},${t} L ${c - 17},${t + 15}" fill="none"
      stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`);
  }
  return l;
}
function As(r, t, e, s, i) {
  const o = _e, n = _e * 0.5;
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
function bs(r, t, e, s, i) {
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
function ws(r, t, e, s, i, o) {
  const l = (s - e) / 5;
  let a = `M ${r},${e}`;
  for (let c = 0; c < 5; c++) {
    const p = e + c * l;
    a += ` L ${t},${p + l * 0.45} L ${r},${p + l * 0.9}`;
  }
  return $`<path id=${i} d=${a} fill="none" stroke=${o} stroke-width="10"
    stroke-linejoin="round" stroke-linecap="round"/>`;
}
function xe(r, t, e = 3, s = "#FFFFFF") {
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
function ks(r, t) {
  if (!t) return "–";
  const e = r.states[t];
  if (!e) return "–";
  if (r.formatEntityState) return r.formatEntityState(e);
  const s = e.attributes?.unit_of_measurement;
  return s ? `${e.state} ${s}` : String(e.state);
}
function Es(r) {
  const { hass: t, map: e, extras: s, animate: i } = r, o = t.states[e.t300_kompressor_aktiv ?? ""]?.state === "on", n = t.states[e.t300_eheiz_aktiv ?? ""]?.state === "on", l = t.states[e.t300_abtau_aktiv ?? ""]?.state === "on", a = t.states[e.t300_solar_aktiv ?? ""]?.state === "on", c = Number(t.states[e.t300_ventilator_pct ?? ""]?.state), p = o ? gs : Ft, d = o ? he : Ft, m = o ? ce : Ft, _ = o ? K : "#8FA3BC", b = o ? 1 : 0.55, X = (10 - (Number.isFinite(c) ? Math.min(100, Math.max(0, c)) : 60) / 100 * (10 - 3.5)) / r.speed, G = i && o, v = X / 2, E = [
    { entityId: e.t300_behaelter_avg, x: S, y: 620, color: "#B03A2E", size: "core" },
    { entityId: e.t300_solltemperatur_akt, x: S, y: 685, color: "#1f4e79", size: "core" },
    { entityId: e.t300_temp_eheiz, x: g - 95, y: St, color: "dimgray", size: "detail" },
    { entityId: e.t300_t21_behaelter_mitte, x: g - 110, y: ye, color: "#C0392B", size: "core" },
    { entityId: e.t300_t20_behaelter_unten, x: g - 110, y: me, color: "steelblue", size: "core" },
    { entityId: e.t300_betriebsart, x: S, y: 140, color: "#1f4e79", size: "core" },
    // Fits the clear strip between the duct band (ends at Y_AIR_IN + 27 = 232)
    // and the evaporator block (starts at EVAP_Y - 24 = 276).
    { entityId: e.t300_ventilator_pct, x: fe, y: 264, color: "dimgray", size: "detail" },
    { entityId: s.power, x: 120, y: 620, color: "dimgray", size: "detail" },
    { entityId: s.energy_daily, x: 120, y: 685, color: "dimgray", size: "detail" },
    { entityId: s.pv_surplus, x: 120, y: 1330, color: "dimgray", size: "detail" }
  ];
  return $`
    <svg viewBox=${`0 0 ${C} ${Ct}`} id="proxon-t300" data-state=${o ? "running" : "idle"}
         style=${`aspect-ratio: ${C} / ${Ct}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradTank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8453C"/>
          <stop offset="45%" stop-color="#F3B229"/>
          <stop offset="100%" stop-color="#5FA8DC"/>
        </linearGradient>
      </defs>
      <rect id="backdrop" width=${C} height=${Ct} fill="#FFFFFF"/>

      <rect id="tank" x=${f} y=${q} width=${g - f} height=${Z - q}
        rx="52" fill="url(#gradTank)" fill-opacity="0.34" stroke=${K} stroke-width=${$e}/>
      <path d=${`M ${g},${q + 90} L ${C - 60},${q + 90}`} stroke=${ce}
        stroke-width="24" stroke-linecap="round"/>
      <path d=${`M ${g},${Z - 70} L ${C - 60},${Z - 70}`} stroke=${he}
        stroke-width="24" stroke-linecap="round"/>
      <text class="port" x=${C - 60} y=${q + 52} text-anchor="end">Warmwasser</text>
      <text class="port" x=${C - 60} y=${Z - 100} text-anchor="end">Kaltwasser</text>

      ${ws(g - 50, f + 50, Mt, Tt, "condenser-coil", m)}

      <g id="e-heater">
        <rect x=${f + 50} y=${St - 12} width=${(g - f) * 0.5} height="24" rx="12"
          fill=${n ? "#FFE3B0" : "#FFFFFF"} stroke=${n ? "#E8843C" : K}
          stroke-width=${n ? 7 : 5}/>
        <path d=${`M ${f + 78},${St} l 20,-14 l 0,28 l 20,-14`} fill="none"
          stroke=${n ? "#E8843C" : K} stroke-width="4.5"/>
      </g>

      ${[[ye, "T21 Mitte"], [me, "T20 unten"]].map(
    ([x, Re]) => $`
          <circle cx=${f + 90} cy=${x} r="9" fill=${de}/>
          <text class="tag" x=${f + 110} y=${x + 9}>${Re}</text>`
  )}

      <rect id="hp-case" x=${f} y=${pe} width=${g - f} height=${ue - pe}
        rx="24" fill=${ms} fill-opacity="0.9" stroke=${K} stroke-width=${$e}/>

      ${ge([[40, J], [S, J], [S, H]], p, "flow-air-in", b)}
      ${ge([[S, H], [S, $t], [C - 40, $t]], d, "flow-air-out", b)}
      ${ve(120, J)}
      ${ve(920, $t)}
      ${G ? xe("flow-air-in", X) : h}
      ${G ? xe("flow-air-out", X) : h}

      ${As(fe, J, "fan-t300", _, i && o ? v : void 0)}
      ${bs(H, f + 60, g - 60, "evaporator", _)}

      <g id="refrigerant" opacity=${b}>
        <path d=${`M ${f + 150},${H + 24} L ${f + 150},${k} L ${M - 42},${k}`}
          fill="none" stroke=${m} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${M + 42},${k} L ${g - 60},${k} L ${g - 60},${Mt} L ${g - 50},${Mt}`}
          fill="none" stroke=${m} stroke-width="8" stroke-linejoin="round"/>
        <path d=${`M ${f + 50},${Tt} L ${f + 26},${Tt} L ${f + 26},${H + 24} L ${f + 62},${H + 24}`}
          fill="none" stroke=${m} stroke-width="8" stroke-dasharray="20 13" stroke-linejoin="round"/>
        <circle id="compressor" cx=${M} cy=${k} r="42" fill="#FFFFFF" stroke=${_} stroke-width="9"/>
        <g>
          <path d=${`M ${M - 31},${k - 15} L ${M + 29},${k - 7} L ${M},${k} Z`}
            fill=${_}/>
          ${i && o ? $`<animateTransform attributeName="transform" type="rotate"
                from=${`0 ${M} ${k}`} to=${`360 ${M} ${k}`}
                dur=${`${1.8 / r.speed}s`} repeatCount="indefinite"/>` : h}
        </g>
        <circle cx=${M} cy=${k} r="7" fill=${de}/>
      </g>

      <text class="port" x="40" y=${J - 48}>Luft an</text>
      <text class="port" x=${C - 40} y=${$t + 66} text-anchor="end">Luft ab</text>

      ${l ? $`<text class="badge" x=${S} y=${ue - 24} text-anchor="middle" fill="#2F80ED">Abtauen</text>` : h}
      ${a ? $`<text class="badge" x=${S} y=${Z + 46} text-anchor="middle" fill="#4C8C1B">Solar aktiv</text>` : h}

      ${E.map(
    (x) => $`<text class=${`val ${x.size}`} x=${x.x} y=${x.y} text-anchor="middle"
          fill=${x.color} @click=${() => x.entityId && r.onEntityClick(x.entityId)}
          style=${x.entityId ? "cursor: pointer" : "opacity: 0.4"}>
          ${ks(t, x.entityId)}
        </text>`
  )}
    </svg>`;
}
const Fs = [
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
], Cs = [
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
function Pe(r) {
  return r === "t300" ? Cs : Fs;
}
function Le(r, t) {
  const e = (r.devices ?? {})[t]?.model;
  if (e === "T300") return "t300";
  if (e === "FWT 2.0") return "fwt";
}
function Ss(r, t, e) {
  const s = r.filter(
    (o) => o.device_id === t && o.platform === "proxon" && !o.disabled_by
  ), i = {};
  for (const o of e) {
    const n = `_${o}`, l = s.find((a) => a.unique_id.endsWith(n));
    l && (i[o] = l.entity_id);
  }
  return i;
}
function Ne(r, t, e) {
  const s = {}, i = new Set(e);
  for (const o of Object.values(r.entities ?? {})) {
    if (o.device_id !== t || o.platform !== "proxon") continue;
    const n = o.translation_key;
    n && i.has(n) && (s[n] = o.entity_id);
  }
  return s;
}
async function Ms(r, t, e) {
  const s = Pe(e), i = Ne(r, t, s);
  if (Object.keys(i).length) return i;
  const o = await r.callWS({
    type: "config/entity_registry/list"
  });
  return Ss(o, t, s);
}
function Ae(r, t = "fwt") {
  const e = t === "t300" ? "T300" : "FWT 2.0", i = Object.values(r.devices ?? {}).filter(
    (o) => (o.identifiers ?? []).some((n) => n[0] === "proxon") && o.model === e
  );
  return i.length === 1 ? i[0].id : void 0;
}
const be = [
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
], Ts = {
  name: "extras",
  type: "expandable",
  title: "Zusätzliche Werte (T300)",
  schema: [
    { name: "power", selector: { entity: { domain: "sensor" } } },
    { name: "energy_daily", selector: { entity: { domain: "sensor" } } },
    { name: "pv_surplus", selector: { entity: { domain: "sensor" } } }
  ]
}, zs = {
  device_id: "Gerät",
  title: "Titel",
  animate: "Animation",
  animation_speed: "Tempo",
  extras: "Zusätzliche Werte (T300)",
  power: "Leistung",
  energy_daily: "Energie heute",
  pv_surplus: "PV-Überschuss"
}, Os = {
  animation_speed: "1 = Standard, kleiner = ruhiger",
  power: "Kommt nicht aus der Integration – z. B. ein Powercalc- oder Shelly-Sensor",
  energy_daily: "Utility-Meter oder vergleichbarer Tageszähler",
  pv_surplus: "Helfer mit dem für die T300 verfügbaren Überschuss"
}, _t = class _t extends j {
  constructor() {
    super(...arguments), this._computeLabel = (t) => zs[t.name] ?? t.name, this._computeHelper = (t) => Os[t.name] ?? "";
  }
  setConfig(t) {
    this._config = t;
  }
  _schema() {
    const t = this._config?.device_id;
    return this._config?.variant === "t300" || (this.hass && t ? Le(this.hass, t) === "t300" : !1) ? [...be, Ts] : be;
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
    return !this.hass || !this._config ? h : ut`
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
_t.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 }
}, _t.styles = ke`
    .hint {
      padding: 8px 0 0;
      color: var(--secondary-text-color);
      font-size: 12px;
    }
  `;
let Nt = _t;
customElements.define("proxon-schema-card-editor", Nt);
const yt = class yt extends j {
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
    return { device_id: Ae(t, "fwt") };
  }
  static getConfigElement() {
    return document.createElement("proxon-schema-card-editor");
  }
  _variant() {
    if (this._config?.variant) return this._config.variant;
    const t = this._deviceId();
    if (this.hass && t) {
      const e = Le(this.hass, t);
      if (e) return e;
    }
    return "fwt";
  }
  _deviceId() {
    if (this._config?.device_id) return this._config.device_id;
    if (this.hass)
      return Ae(this.hass, this._config?.variant ?? "fwt");
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
      const i = Ne(this.hass, e, Pe(s));
      if (Object.keys(i).length) {
        this._map = i, this._error = void 0, this._resolvedFor = e;
        return;
      }
    }
    this._resolvedFor !== e && (this._resolvedFor = e, Ms(this.hass, e, s).then((i) => {
      this._map = i, this._error = Object.keys(i).length ? void 0 : "Gerät gefunden, aber keine passenden Proxon-Entities daran.";
    }).catch((i) => {
      this._resolvedFor = void 0, this._error = `Entity-Registry nicht lesbar: ${i.message}`;
    }));
  }
  render() {
    if (!this.hass || !this._config) return h;
    if (this._error)
      return ut`<ha-card><div class="error">${this._error}</div></ha-card>`;
    if (!Object.keys(this._map).length)
      return ut`<ha-card><div class="error">Entities werden aufgelöst …</div></ha-card>`;
    const t = Number(this._config.animation_speed), e = Number.isFinite(t) && t > 0 ? Math.min(5, Math.max(0.1, t)) : 1, s = {
      hass: this.hass,
      map: this._map,
      animate: this._config.animate !== !1,
      speed: e,
      onEntityClick: this._showMoreInfo
    };
    return ut`
      <ha-card .header=${this._config.title ?? h}>
        <div class="wrap">
          ${this._variant() === "t300" ? Es({ ...s, extras: this._config.extras ?? {} }) : ys(s)}
        </div>
      </ha-card>`;
  }
};
yt.properties = {
  hass: { attribute: !1 },
  _config: { state: !0 },
  _map: { state: !0 },
  _error: { state: !0 }
}, yt.styles = ke`
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
let Rt = yt;
customElements.define("proxon-schema-card", Rt);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "proxon-schema-card",
  name: "Proxon Anlagenschema",
  description: "Anlagenschema der Proxon FWT bzw. T300 mit Live-Werten und Animation",
  preview: !1
});
