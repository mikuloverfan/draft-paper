"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DraftPaperPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// node_modules/perfect-freehand/dist/esm/index.mjs
var { PI: e } = Math;
var t = e + 1e-4;
var n = 0.5;
var r = [1, 1];
function i(e2, t2, n2, r2 = (e3) => e3) {
  return e2 * r2(0.5 - t2 * (0.5 - n2));
}
var { min: a } = Math;
function o(e2, t2, n2) {
  let r2 = a(1, t2 / n2);
  return a(1, e2 + (a(1, 1 - r2) - e2) * (r2 * 0.275));
}
function s(e2) {
  return [-e2[0], -e2[1]];
}
function c(e2, t2) {
  return [e2[0] + t2[0], e2[1] + t2[1]];
}
function l(e2, t2, n2) {
  return e2[0] = t2[0] + n2[0], e2[1] = t2[1] + n2[1], e2;
}
function u(e2, t2) {
  return [e2[0] - t2[0], e2[1] - t2[1]];
}
function d(e2, t2, n2) {
  return e2[0] = t2[0] - n2[0], e2[1] = t2[1] - n2[1], e2;
}
function f(e2, t2) {
  return [e2[0] * t2, e2[1] * t2];
}
function p(e2, t2, n2) {
  return e2[0] = t2[0] * n2, e2[1] = t2[1] * n2, e2;
}
function m(e2, t2) {
  return [e2[0] / t2, e2[1] / t2];
}
function h(e2) {
  return [e2[1], -e2[0]];
}
function g(e2, t2) {
  let n2 = t2[0];
  return e2[0] = t2[1], e2[1] = -n2, e2;
}
function ee(e2, t2) {
  return e2[0] * t2[0] + e2[1] * t2[1];
}
function _(e2, t2) {
  return e2[0] === t2[0] && e2[1] === t2[1];
}
function v(e2) {
  return Math.hypot(e2[0], e2[1]);
}
function y(e2, t2) {
  let n2 = e2[0] - t2[0], r2 = e2[1] - t2[1];
  return n2 * n2 + r2 * r2;
}
function b(e2) {
  return m(e2, v(e2));
}
function x(e2, t2) {
  return Math.hypot(e2[1] - t2[1], e2[0] - t2[0]);
}
function S(e2, t2, n2) {
  let r2 = Math.sin(n2), i2 = Math.cos(n2), a2 = e2[0] - t2[0], o2 = e2[1] - t2[1], s2 = a2 * i2 - o2 * r2, c2 = a2 * r2 + o2 * i2;
  return [s2 + t2[0], c2 + t2[1]];
}
function C(e2, t2, n2, r2) {
  let i2 = Math.sin(r2), a2 = Math.cos(r2), o2 = t2[0] - n2[0], s2 = t2[1] - n2[1], c2 = o2 * a2 - s2 * i2, l2 = o2 * i2 + s2 * a2;
  return e2[0] = c2 + n2[0], e2[1] = l2 + n2[1], e2;
}
function w(e2, t2, n2) {
  return c(e2, f(u(t2, e2), n2));
}
function te(e2, t2, n2, r2) {
  let i2 = n2[0] - t2[0], a2 = n2[1] - t2[1];
  return e2[0] = t2[0] + i2 * r2, e2[1] = t2[1] + a2 * r2, e2;
}
function T(e2, t2, n2) {
  return c(e2, f(t2, n2));
}
var E = [0, 0];
var D = [0, 0];
var O = [0, 0];
function k(e2, n2) {
  let r2 = T(e2, b(h(u(e2, c(e2, [1, 1])))), -n2), i2 = [], a2 = 1 / 13;
  for (let n3 = a2; n3 <= 1; n3 += a2)
    i2.push(S(r2, e2, t * 2 * n3));
  return i2;
}
function A(e2, n2, r2) {
  let i2 = [], a2 = 1 / r2;
  for (let r3 = a2; r3 <= 1; r3 += a2)
    i2.push(S(n2, e2, t * r3));
  return i2;
}
function j(e2, t2, n2) {
  let r2 = u(t2, n2), i2 = f(r2, 0.5), a2 = f(r2, 0.51);
  return [u(e2, i2), u(e2, a2), c(e2, a2), c(e2, i2)];
}
function M(e2, n2, r2, i2) {
  let a2 = [], o2 = T(e2, n2, r2), s2 = 1 / i2;
  for (let n3 = s2; n3 < 1; n3 += s2)
    a2.push(S(o2, e2, t * 3 * n3));
  return a2;
}
function ne(e2, t2, n2) {
  return [c(e2, f(t2, n2)), c(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2 * 0.99)), u(e2, f(t2, n2))];
}
function N(e2, t2, n2) {
  return e2 === false || e2 === void 0 ? 0 : e2 === true ? Math.max(t2, n2) : e2;
}
function re(e2, t2, n2) {
  return e2.slice(0, 10).reduce((e3, r2) => {
    let i2 = r2.pressure;
    return t2 && (i2 = o(e3, r2.distance, n2)), (e3 + i2) / 2;
  }, e2[0].pressure);
}
function P(e2, n2 = {}) {
  let { size: r2 = 16, smoothing: a2 = 0.5, thinning: f2 = 0.5, simulatePressure: m2 = true, easing: _2 = (e3) => e3, start: v2 = {}, end: b2 = {}, last: x2 = false } = n2, { cap: S2 = true, easing: w2 = (e3) => e3 * (2 - e3) } = v2, { cap: T2 = true, easing: P2 = (e3) => --e3 * e3 * e3 + 1 } = b2;
  if (e2.length === 0 || r2 <= 0)
    return [];
  let F2 = e2[e2.length - 1].runningLength, I2 = N(v2.taper, r2, F2), L2 = N(b2.taper, r2, F2), R2 = (r2 * a2) ** 2, z = [], B = [], V = re(e2, m2, r2), H = i(r2, f2, e2[e2.length - 1].pressure, _2), U, W = e2[0].vector, G = e2[0].point, K = G, q = G, J = K, Y = false;
  for (let n3 = 0; n3 < e2.length; n3++) {
    let { pressure: a3 } = e2[n3], { point: s2, vector: h2, distance: v3, runningLength: b3 } = e2[n3], x3 = n3 === e2.length - 1;
    if (!x3 && F2 - b3 < 3)
      continue;
    f2 ? (m2 && (a3 = o(V, v3, r2)), H = i(r2, f2, a3, _2)) : H = r2 / 2, U === void 0 && (U = H);
    let S3 = b3 < I2 ? w2(b3 / I2) : 1, T3 = F2 - b3 < L2 ? P2((F2 - b3) / L2) : 1;
    H = Math.max(0.01, H * Math.min(S3, T3));
    let k2 = (x3 ? e2[n3] : e2[n3 + 1]).vector, A2 = x3 ? 1 : ee(h2, k2), j2 = ee(h2, W) < 0 && !Y, M2 = A2 !== null && A2 < 0;
    if (j2 || M2) {
      g(E, W), p(E, E, H);
      for (let e3 = 0; e3 <= 1; e3 += 0.07692307692307693)
        d(D, s2, E), C(D, D, s2, t * e3), q = [D[0], D[1]], z.push(q), l(O, s2, E), C(O, O, s2, t * -e3), J = [O[0], O[1]], B.push(J);
      G = q, K = J, M2 && (Y = true);
      continue;
    }
    if (Y = false, x3) {
      g(E, h2), p(E, E, H), z.push(u(s2, E)), B.push(c(s2, E));
      continue;
    }
    te(E, k2, h2, A2), g(E, E), p(E, E, H), d(D, s2, E), q = [D[0], D[1]], (n3 <= 1 || y(G, q) > R2) && (z.push(q), G = q), l(O, s2, E), J = [O[0], O[1]], (n3 <= 1 || y(K, J) > R2) && (B.push(J), K = J), V = a3, W = h2;
  }
  let X = [e2[0].point[0], e2[0].point[1]], Z = e2.length > 1 ? [e2[e2.length - 1].point[0], e2[e2.length - 1].point[1]] : c(e2[0].point, [1, 1]), Q = [], $ = [];
  if (e2.length === 1) {
    if (!(I2 || L2) || x2)
      return k(X, U || H);
  } else {
    I2 || L2 && e2.length === 1 || (S2 ? Q.push(...A(X, B[0], 13)) : Q.push(...j(X, z[0], B[0])));
    let t2 = h(s(e2[e2.length - 1].vector));
    L2 || I2 && e2.length === 1 ? $.push(Z) : T2 ? $.push(...M(Z, t2, H, 29)) : $.push(...ne(Z, t2, H));
  }
  return z.concat($, B.reverse(), Q);
}
var F = [0, 0];
function I(e2) {
  return e2 != null && e2 >= 0;
}
function L(e2, t2 = {}) {
  var _a;
  let { streamline: i2 = 0.5, size: a2 = 16, last: o2 = false } = t2;
  if (e2.length === 0)
    return [];
  let s2 = 0.15 + (1 - i2) * 0.85, l2 = Array.isArray(e2[0]) ? e2 : e2.map(({ x: e3, y: t3, pressure: r2 = n }) => [e3, t3, r2]);
  if (l2.length === 2) {
    let e3 = l2[1];
    l2 = l2.slice(0, -1);
    for (let t3 = 1; t3 < 5; t3++)
      l2.push(w(l2[0], e3, t3 / 4));
  }
  l2.length === 1 && (l2 = [...l2, [...c(l2[0], r), ...l2[0].slice(2)]]);
  let u2 = [{ point: [l2[0][0], l2[0][1]], pressure: I(l2[0][2]) ? l2[0][2] : 0.25, vector: [...r], distance: 0, runningLength: 0 }], f2 = false, p2 = 0, m2 = u2[0], h2 = l2.length - 1;
  for (let e3 = 1; e3 < l2.length; e3++) {
    let t3 = o2 && e3 === h2 ? [l2[e3][0], l2[e3][1]] : w(m2.point, l2[e3], s2);
    if (_(m2.point, t3))
      continue;
    let r2 = x(t3, m2.point);
    if (p2 += r2, e3 < h2 && !f2) {
      if (p2 < a2)
        continue;
      f2 = true;
    }
    d(F, m2.point, t3), m2 = { point: t3, pressure: I(l2[e3][2]) ? l2[e3][2] : n, vector: b(F), distance: r2, runningLength: p2 }, u2.push(m2);
  }
  return u2[0].vector = ((_a = u2[1]) == null ? void 0 : _a.vector) || [0, 0], u2;
}
function R(e2, t2 = {}) {
  return P(L(e2, t2), t2);
}

// main.ts
var DEFAULT_COLOR = "#ff3333";
var DEFAULT_LINE_WIDTH = 2.5;
var DEFAULT_OPACITY = 1;
var ERASER_HIT_DISTANCE = 12;
var ERASER_CURSOR_SIZE = 24;
var FREEHAND_OPTIONS = {
  size: 1,
  thinning: 0.6,
  smoothing: 0.75,
  streamline: 0.65,
  simulatePressure: true,
  easing: (t2) => t2 * (2 - t2),
  start: { taper: 0, cap: true },
  end: { taper: 0, cap: true }
};
var ARROW_STYLES = ["straight", "curved", "dashed", "double"];
function sleep(ms) {
  return new Promise((r2) => setTimeout(r2, ms));
}
function dist(a2, b2) {
  return Math.hypot(a2.x - b2.x, a2.y - b2.y);
}
function distToSegment(p2, a2, b2) {
  const dx = b2.x - a2.x, dy = b2.y - a2.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0)
    return dist(p2, a2);
  let t2 = ((p2.x - a2.x) * dx + (p2.y - a2.y) * dy) / lenSq;
  t2 = Math.max(0, Math.min(1, t2));
  return dist(p2, { x: a2.x + t2 * dx, y: a2.y + t2 * dy });
}
function pointToStrokeDist(p2, stroke) {
  let minDist = Infinity;
  for (let i2 = 0; i2 < stroke.points.length - 1; i2++) {
    const d2 = distToSegment(p2, stroke.points[i2], stroke.points[i2 + 1]);
    if (d2 < minDist)
      minDist = d2;
  }
  if (stroke.points.length === 1) {
    minDist = dist(p2, stroke.points[0]);
  }
  return minDist;
}
function strokeInRect(s2, x1, y1, x2, y2) {
  const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
  return s2.points.some((p2) => p2.x >= minX && p2.x <= maxX && p2.y >= minY && p2.y <= maxY);
}
var DraftPaperPlugin = class extends import_obsidian.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    // DOM 元素
    __publicField(this, "overlay", null);
    __publicField(this, "canvas", null);
    __publicField(this, "ctx", null);
    __publicField(this, "toolbarContainer", null);
    // 独立工具栏容器
    __publicField(this, "eraserCursorEl", null);
    __publicField(this, "eraserSubToolbarEl", null);
    __publicField(this, "eraserBtnEl", null);
    // 状态
    __publicField(this, "isActive", false);
    __publicField(this, "draftMode", "DRAW");
    __publicField(this, "toolMode", "pen");
    __publicField(this, "eraserMode", "stroke");
    __publicField(this, "currentFilePath", "");
    __publicField(this, "strokes", []);
    __publicField(this, "activeStroke", null);
    __publicField(this, "currentColor", DEFAULT_COLOR);
    __publicField(this, "currentLineWidth", DEFAULT_LINE_WIDTH);
    __publicField(this, "currentOpacity", DEFAULT_OPACITY);
    __publicField(this, "currentArrowStyle", "straight");
    // 临时透传标记
    __publicField(this, "tempPointer", false);
    // 选择系统
    __publicField(this, "selectedIndices", /* @__PURE__ */ new Set());
    __publicField(this, "selectRect", null);
    __publicField(this, "selectStart", null);
    __publicField(this, "moveStart", null);
    __publicField(this, "moveOriginStrokes", null);
    // 预览（箭头/矩形）
    __publicField(this, "previewStroke", null);
    // 撤销栈
    __publicField(this, "undoStack", []);
    __publicField(this, "MAX_UNDO", 50);
    // 低通滤波（手写平滑）
    __publicField(this, "lastFilteredPt", null);
    // 事件引用
    __publicField(this, "boundPointerDown");
    __publicField(this, "boundPointerMove");
    __publicField(this, "boundPointerUp");
    __publicField(this, "boundKeyDown");
    __publicField(this, "boundKeyUp");
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
  }
  // ==========================================================
  //  生命周期
  // ==========================================================
  async onload() {
    this.createOverlay();
    this.addCommand({
      id: "toggle-draft-mode",
      name: "Toggle Draft Mode",
      callback: () => this.toggleDraftMode()
    });
    this.addCommand({
      id: "exit-draft-mode-force",
      name: "Exit Draft Mode (Force)",
      callback: async () => this.setDraftMode("HIDDEN")
    });
    this.addRibbonIcon("pencil", "Toggle Draft Paper", () => this.toggleDraftMode());
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.syncCurrentFile())
    );
    document.addEventListener("keydown", this.boundKeyDown, true);
    document.addEventListener("keyup", this.boundKeyUp, true);
    await this.syncCurrentFile();
  }
  async onunload() {
    this.setDraftMode("HIDDEN");
    this.detachOverlay();
    document.removeEventListener("keydown", this.boundKeyDown, true);
    document.removeEventListener("keyup", this.boundKeyUp, true);
  }
  // ==========================================================
  //  Overlay 与 Canvas 管理
  // ==========================================================
  createOverlay() {
    this.detachOverlay();
    this.overlay = document.createElement("div");
    this.overlay.className = "draft-paper-overlay";
    this.overlay.style.display = "none";
    this.canvas = document.createElement("canvas");
    this.canvas.className = "draft-paper-canvas";
    this.canvas.tabIndex = 0;
    this.ctx = this.canvas.getContext("2d");
    this.overlay.appendChild(this.canvas);
    this.eraserCursorEl = document.createElement("div");
    this.eraserCursorEl.className = "draft-paper-eraser-cursor";
    this.eraserCursorEl.style.display = "none";
    this.overlay.appendChild(this.eraserCursorEl);
    document.body.appendChild(this.overlay);
    this.toolbarContainer = document.createElement("div");
    this.toolbarContainer.className = "draft-paper-toolbar-container";
    document.body.appendChild(this.toolbarContainer);
    this.buildToolbar();
    this.registerDomEvent(window, "resize", () => {
      this.resizeCanvas();
      this.renderAllStrokes();
    });
  }
  detachOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.canvas = null;
      this.ctx = null;
      this.eraserCursorEl = null;
    }
    if (this.toolbarContainer) {
      this.toolbarContainer.remove();
      this.toolbarContainer = null;
      this.eraserSubToolbarEl = null;
      this.eraserBtnEl = null;
    }
  }
  resizeCanvas() {
    if (!this.canvas || !this.ctx)
      return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }
  // ==========================================================
  //  工具栏构建（含橡皮擦子工具栏）
  // ==========================================================
  buildToolbar() {
    if (!this.toolbarContainer)
      return;
    this.toolbarContainer.innerHTML = `
            <div class="draft-paper-toolbar">
                <div class="draft-paper-tool-buttons">
                    <button data-tool="pen" title="\u753B\u7B14 (1)">\u270F\uFE0F</button>
                    <button data-tool="eraser" title="\u6A61\u76AE\u64E6 (2)">\u{1F9F9}</button>
                    <button data-tool="select" title="\u6846\u9009 (3)">\u2B1C</button>
                    <button data-tool="arrow" title="\u7BAD\u5934 (4)">\u2197</button>
                    <button data-tool="rect" title="\u77E9\u5F62 (5)">\u2B1B</button>
                    <button data-tool="text" title="\u6587\u5B57 (6)">T</button>
                </div>
                <div class="draft-paper-tool-settings">
                    <input type="color" class="draft-paper-color-picker" value="${this.currentColor}">
                    <input type="range" class="draft-paper-line-width" min="1" max="8" step="0.5" value="${this.currentLineWidth}">
                    <span class="draft-paper-line-width-label">${this.currentLineWidth}px</span>
                    <input type="range" class="draft-paper-opacity" min="10" max="100" step="5" value="${this.currentOpacity * 100}">
                    <span class="draft-paper-opacity-label">${Math.round(this.currentOpacity * 100)}%</span>
                    <span class="draft-paper-arrow-style" style="display:${this.toolMode === "arrow" ? "inline" : "none"}">\u6837\u5F0F: ${this.currentArrowStyle}</span>
                </div>
                <div class="draft-paper-mode-buttons">
                    <button data-mode="DRAW" title="\u7ED8\u56FE\u6A21\u5F0F">\u270F\uFE0F</button>
                    <button data-mode="POINTER" title="\u900F\u4F20\u6A21\u5F0F (\u6309\u4F4F Space \u4E34\u65F6\u5207\u6362)">\u{1F5B1}\uFE0F</button>
                    <button data-mode="HIDDEN" title="\u9690\u85CF\u8349\u7A3F\u7EB8">\u{1F441}</button>
                </div>
                <button class="draft-paper-undo-btn" title="\u64A4\u9500 (Ctrl+Z)">\u21A9</button>
                <button class="draft-paper-clear-btn" title="\u6E05\u5C4F (Ctrl+Shift+Z)">\u{1F5D1}\uFE0F</button>
            </div>
        `;
    this.eraserSubToolbarEl = document.createElement("div");
    this.eraserSubToolbarEl.className = "draft-paper-eraser-subtoolbar";
    this.eraserSubToolbarEl.innerHTML = `
            <button data-eraser="stroke" class="active">\u6574\u7B14\u5220\u9664</button>
            <button data-eraser="clear-selected">\u5220\u9664\u9009\u4E2D</button>
            <button data-eraser="clear-all">\u6E05\u7A7A\u5168\u90E8</button>
        `;
    this.eraserSubToolbarEl.style.display = "none";
    this.toolbarContainer.appendChild(this.eraserSubToolbarEl);
    this.eraserBtnEl = this.toolbarContainer.querySelector('[data-tool="eraser"]');
    this.bindToolbarEvents();
  }
  bindToolbarEvents() {
    var _a, _b, _c;
    this.toolbarContainer.addEventListener("pointerdown", (e2) => e2.stopPropagation());
    this.toolbarContainer.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.addEventListener("click", (e2) => {
        var _a2;
        e2.stopPropagation();
        const tool = btn.dataset.tool;
        if (tool === "eraser") {
          if (this.toolMode === "eraser") {
            const isVisible = this.eraserSubToolbarEl.style.display !== "none";
            this.eraserSubToolbarEl.style.display = isVisible ? "none" : "flex";
          } else {
            this.toolMode = "eraser";
            this.eraserMode = "stroke";
            this.eraserSubToolbarEl.style.display = "flex";
          }
        } else {
          this.eraserSubToolbarEl.style.display = "none";
          this.toolMode = tool;
        }
        this.resetToolState();
        this.updateToolbarActive();
        (_a2 = this.canvas) == null ? void 0 : _a2.focus();
      });
    });
    (_a = this.eraserSubToolbarEl) == null ? void 0 : _a.querySelectorAll("[data-eraser]").forEach((btn) => {
      btn.addEventListener("click", (e2) => {
        var _a2;
        e2.stopPropagation();
        const mode = btn.dataset.eraser;
        this.eraserMode = mode;
        if (mode === "clear-selected") {
          if (this.selectedIndices.size === 0) {
            new import_obsidian.Notice("\u6CA1\u6709\u9009\u4E2D\u7684\u5143\u7D20");
          } else {
            this.deleteSelected();
          }
        } else if (mode === "clear-all") {
          this.confirmClearAll();
        }
        this.eraserSubToolbarEl.style.display = "none";
        this.updateToolbarActive();
        (_a2 = this.canvas) == null ? void 0 : _a2.focus();
      });
    });
    this.toolbarContainer.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", (e2) => {
        e2.stopPropagation();
        const mode = btn.dataset.mode;
        this.setDraftMode(mode);
      });
    });
    const colorPicker = this.toolbarContainer.querySelector(".draft-paper-color-picker");
    colorPicker == null ? void 0 : colorPicker.addEventListener("input", (e2) => {
      this.currentColor = e2.target.value;
    });
    const widthSlider = this.toolbarContainer.querySelector(".draft-paper-line-width");
    widthSlider == null ? void 0 : widthSlider.addEventListener("input", (e2) => {
      this.currentLineWidth = parseFloat(e2.target.value);
      const lbl = this.toolbarContainer.querySelector(".draft-paper-line-width-label");
      if (lbl)
        lbl.textContent = `${this.currentLineWidth}px`;
    });
    const opacitySlider = this.toolbarContainer.querySelector(".draft-paper-opacity");
    opacitySlider == null ? void 0 : opacitySlider.addEventListener("input", (e2) => {
      this.currentOpacity = parseInt(e2.target.value) / 100;
      const lbl = this.toolbarContainer.querySelector(".draft-paper-opacity-label");
      if (lbl)
        lbl.textContent = `${Math.round(this.currentOpacity * 100)}%`;
    });
    (_b = this.toolbarContainer.querySelector(".draft-paper-undo-btn")) == null ? void 0 : _b.addEventListener("click", (e2) => {
      var _a2;
      e2.stopPropagation();
      this.undo();
      (_a2 = this.canvas) == null ? void 0 : _a2.focus();
    });
    (_c = this.toolbarContainer.querySelector(".draft-paper-clear-btn")) == null ? void 0 : _c.addEventListener("click", (e2) => {
      e2.stopPropagation();
      this.confirmClearAll();
    });
  }
  updateToolbarActive() {
    var _a, _b, _c, _d;
    (_a = this.toolbarContainer) == null ? void 0 : _a.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === this.toolMode);
    });
    (_b = this.toolbarContainer) == null ? void 0 : _b.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === this.draftMode);
    });
    (_c = this.eraserSubToolbarEl) == null ? void 0 : _c.querySelectorAll("[data-eraser]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.eraser === this.eraserMode);
    });
    const arrowLabel = (_d = this.toolbarContainer) == null ? void 0 : _d.querySelector(".draft-paper-arrow-style");
    if (arrowLabel) {
      arrowLabel.style.display = this.toolMode === "arrow" ? "inline" : "none";
      arrowLabel.textContent = `\u6837\u5F0F: ${this.currentArrowStyle}`;
    }
    if (this.eraserCursorEl) {
      const showEraserCursor = this.isActive && this.draftMode === "DRAW" && this.toolMode === "eraser" && this.eraserMode === "stroke";
      this.eraserCursorEl.style.display = showEraserCursor ? "block" : "none";
    }
  }
  // ==========================================================
  //  模式控制（DRAW / POINTER / HIDDEN）
  // ==========================================================
  setDraftMode(mode) {
    if (!this.overlay || !this.canvas)
      return;
    this.draftMode = mode;
    this.tempPointer = false;
    if (mode === "HIDDEN") {
      this.exitDraftMode(true);
      return;
    }
    if (!this.isActive) {
      this.enterDraftModeSilent();
    }
    if (mode === "DRAW") {
      this.overlay.style.pointerEvents = "auto";
      this.canvas.style.pointerEvents = "auto";
      this.canvas.style.cursor = this.toolMode === "eraser" ? "none" : this.toolMode === "text" ? "text" : "crosshair";
    } else if (mode === "POINTER") {
      this.overlay.style.pointerEvents = "none";
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.cursor = "default";
    }
    if (this.toolbarContainer) {
      this.toolbarContainer.style.display = "flex";
    }
    this.updateToolbarActive();
    this.renderAllStrokes();
  }
  enterDraftModeSilent() {
    if (this.isActive || !this.overlay || !this.canvas)
      return;
    this.overlay.style.display = "block";
    this.resizeCanvas();
    document.body.style.overflow = "hidden";
    this.canvas.addEventListener("pointerdown", this.boundPointerDown);
    this.canvas.addEventListener("pointermove", this.boundPointerMove);
    this.canvas.addEventListener("pointerup", this.boundPointerUp);
    this.canvas.addEventListener("pointerleave", this.boundPointerUp);
    this.canvas.focus();
    this.isActive = true;
  }
  exitDraftMode(silent = false) {
    if (!this.isActive || !this.overlay || !this.canvas)
      return;
    if (this.activeStroke)
      this.finishStroke();
    this.selectRect = null;
    this.selectedIndices.clear();
    this.previewStroke = null;
    this.lastFilteredPt = null;
    this.overlay.style.display = "none";
    this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
    this.canvas.removeEventListener("pointermove", this.boundPointerMove);
    this.canvas.removeEventListener("pointerup", this.boundPointerUp);
    this.canvas.removeEventListener("pointerleave", this.boundPointerUp);
    document.body.style.overflow = "";
    this.isActive = false;
    this.draftMode = "HIDDEN";
    this.saveStrokes();
    if (!silent)
      new import_obsidian.Notice("\u8349\u7A3F\u7EB8\u5DF2\u9690\u85CF");
  }
  async toggleDraftMode() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view) {
      new import_obsidian.Notice("\u53EA\u5728 Markdown \u89C6\u56FE\u4E2D\u53EF\u7528");
      return;
    }
    if (view.getMode() !== "preview") {
      this.app.commands.executeCommandById("markdown:toggle-preview");
      await sleep(200);
    }
    if (this.isActive && this.draftMode !== "HIDDEN") {
      this.setDraftMode("HIDDEN");
    } else {
      await this.syncCurrentFile();
      await this.loadStrokes();
      this.setDraftMode("DRAW");
    }
  }
  // ==========================================================
  //  工具重置
  // ==========================================================
  resetToolState() {
    this.activeStroke = null;
    this.previewStroke = null;
    if (this.toolMode !== "select") {
      this.selectedIndices.clear();
      this.selectRect = null;
    }
    this.lastFilteredPt = null;
    this.renderAllStrokes();
  }
  // ==========================================================
  //  键盘事件
  // ==========================================================
  onKeyDown(e2) {
    if (!this.isActive)
      return;
    const target = e2.target;
    if (target.closest("input, textarea") || target.isContentEditable)
      return;
    if (e2.code === "Space" && this.draftMode === "DRAW" && !this.tempPointer) {
      e2.preventDefault();
      e2.stopPropagation();
      this.tempPointer = true;
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.cursor = "default";
      return;
    }
    const toolMap = {
      "1": "pen",
      "2": "eraser",
      "3": "select",
      "4": "arrow",
      "5": "rect",
      "6": "text"
    };
    if (toolMap[e2.key]) {
      e2.preventDefault();
      e2.stopPropagation();
      this.toolMode = toolMap[e2.key];
      if (this.toolMode !== "eraser")
        this.eraserSubToolbarEl.style.display = "none";
      this.resetToolState();
      this.updateToolbarActive();
      return;
    }
    if (e2.key === "Escape") {
      e2.preventDefault();
      e2.stopPropagation();
      if (this.selectedIndices.size > 0) {
        this.selectedIndices.clear();
        this.renderAllStrokes();
      } else {
        this.setDraftMode("HIDDEN");
      }
      return;
    }
    if ((e2.ctrlKey || e2.metaKey) && e2.key === "z") {
      e2.preventDefault();
      e2.stopPropagation();
      this.undo();
      return;
    }
    if ((e2.ctrlKey || e2.metaKey) && e2.shiftKey && e2.key === "Z") {
      e2.preventDefault();
      e2.stopPropagation();
      this.clearAll();
      return;
    }
    if ((e2.key === "Delete" || e2.key === "Backspace") && this.selectedIndices.size > 0) {
      e2.preventDefault();
      e2.stopPropagation();
      this.deleteSelected();
      return;
    }
    if (this.toolMode === "arrow" && (e2.key === "ArrowLeft" || e2.key === "ArrowRight")) {
      e2.preventDefault();
      const idx = ARROW_STYLES.indexOf(this.currentArrowStyle);
      const next = e2.key === "ArrowRight" ? (idx + 1) % ARROW_STYLES.length : (idx - 1 + ARROW_STYLES.length) % ARROW_STYLES.length;
      this.currentArrowStyle = ARROW_STYLES[next];
      this.updateToolbarActive();
    }
  }
  onKeyUp(e2) {
    if (!this.isActive)
      return;
    if (e2.code === "Space" && this.tempPointer) {
      this.tempPointer = false;
      if (this.draftMode === "DRAW") {
        this.canvas.style.pointerEvents = "auto";
        this.canvas.style.cursor = this.toolMode === "eraser" ? "none" : this.toolMode === "text" ? "text" : "crosshair";
      }
    }
  }
  // ==========================================================
  //  坐标转换
  // ==========================================================
  getCanvasPoint(e2) {
    if (!this.canvas)
      return null;
    const rect = this.canvas.getBoundingClientRect();
    return { x: e2.clientX - rect.left, y: e2.clientY - rect.top };
  }
  // ==========================================================
  //  指针事件路由
  // ==========================================================
  onPointerDown(e2) {
    var _a, _b;
    if (!this.isActive || this.draftMode !== "DRAW")
      return;
    if (e2.pointerType === "mouse" && e2.button !== 0)
      return;
    if ((_a = e2.target) == null ? void 0 : _a.closest(".draft-paper-toolbar-container"))
      return;
    (_b = this.canvas) == null ? void 0 : _b.focus();
    const pt = this.getCanvasPoint(e2);
    if (!pt)
      return;
    if (this.toolMode === "text") {
      this.handleTextTool(pt);
      return;
    }
    if (this.toolMode === "eraser") {
      if (this.eraserMode === "stroke") {
        this.eraserDown(pt);
      }
      return;
    }
    switch (this.toolMode) {
      case "pen":
        this.penDown(pt);
        break;
      case "select":
        this.selectDown(pt);
        break;
      case "arrow":
        this.arrowDown(pt);
        break;
      case "rect":
        this.rectDown(pt);
        break;
    }
  }
  onPointerMove(e2) {
    if (!this.isActive || this.draftMode !== "DRAW")
      return;
    e2.preventDefault();
    const pt = this.getCanvasPoint(e2);
    if (!pt)
      return;
    if (this.toolMode === "eraser" && this.eraserMode === "stroke" && this.eraserCursorEl) {
      const size = ERASER_CURSOR_SIZE;
      this.eraserCursorEl.style.left = `${e2.clientX - size / 2}px`;
      this.eraserCursorEl.style.top = `${e2.clientY - size / 2}px`;
      this.eraserCursorEl.style.width = `${size}px`;
      this.eraserCursorEl.style.height = `${size}px`;
    }
    switch (this.toolMode) {
      case "pen":
        this.penMove(pt);
        break;
      case "eraser":
        this.eraserMove(pt);
        break;
      case "select":
        this.selectMove(pt);
        break;
      case "arrow":
        this.arrowMove(pt);
        break;
      case "rect":
        this.rectMove(pt);
        break;
    }
  }
  onPointerUp(e2) {
    if (!this.isActive || this.draftMode !== "DRAW")
      return;
    const pt = this.getCanvasPoint(e2);
    if (!pt)
      return;
    switch (this.toolMode) {
      case "pen":
        this.penUp(pt);
        break;
      case "eraser":
        this.eraserUp(pt);
        break;
      case "select":
        this.selectUp(pt);
        break;
      case "arrow":
        this.arrowUp(pt);
        break;
      case "rect":
        this.rectUp(pt);
        break;
    }
  }
  // ==========================================================
  //  工具实现
  // ==========================================================
  // ---------- 画笔 (perfect-freehand 平滑) ----------
  penDown(pt) {
    this.lastFilteredPt = pt;
    this.activeStroke = {
      points: [pt],
      color: this.currentColor,
      lineWidth: this.currentLineWidth,
      opacity: this.currentOpacity,
      timestamp: Date.now(),
      type: "freehand"
    };
    this.renderDot(pt);
  }
  penMove(pt) {
    if (!this.activeStroke || !this.lastFilteredPt)
      return;
    const alpha = 0.35;
    const filtered = {
      x: this.lastFilteredPt.x + (pt.x - this.lastFilteredPt.x) * alpha,
      y: this.lastFilteredPt.y + (pt.y - this.lastFilteredPt.y) * alpha
    };
    this.lastFilteredPt = filtered;
    const pts = this.activeStroke.points;
    const last = pts[pts.length - 1];
    if (dist(last, filtered) < 1)
      return;
    pts.push(filtered);
    this.renderAllStrokes();
  }
  penUp(_pt) {
    this.lastFilteredPt = null;
    if (this.activeStroke)
      this.finishStroke();
  }
  renderDot(pt) {
    if (!this.ctx)
      return;
    this.ctx.save();
    this.ctx.globalAlpha = this.currentOpacity;
    this.ctx.fillStyle = this.currentColor;
    this.ctx.beginPath();
    this.ctx.arc(pt.x, pt.y, this.currentLineWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  // ---------- 橡皮擦（整笔删除） ----------
  eraserDown(pt) {
    this.pushUndo();
    this.eraserDelete(pt);
  }
  eraserMove(pt) {
    this.eraserDelete(pt);
  }
  eraserUp(_pt) {
    this.saveStrokes();
  }
  eraserDelete(pt) {
    const newStrokes = this.strokes.filter((s2) => pointToStrokeDist(pt, s2) > ERASER_HIT_DISTANCE);
    if (newStrokes.length !== this.strokes.length) {
      this.strokes = newStrokes;
      this.selectedIndices.clear();
      this.renderAllStrokes();
    }
  }
  // ---------- 选择工具 ----------
  selectDown(pt) {
    if (this.selectedIndices.size > 0) {
      const selStrokes = [...this.selectedIndices].map((i2) => this.strokes[i2]);
      const hit = selStrokes.some((s2) => s2.points.some((p2) => dist(p2, pt) < 8));
      if (hit) {
        this.moveStart = pt;
        this.moveOriginStrokes = selStrokes.map((s2) => s2.points.map((p2) => ({ ...p2 })));
        return;
      }
    }
    this.selectedIndices.clear();
    this.selectStart = pt;
    this.selectRect = { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
  }
  selectMove(pt) {
    if (this.moveStart && this.moveOriginStrokes) {
      const dx = pt.x - this.moveStart.x;
      const dy = pt.y - this.moveStart.y;
      const indices = [...this.selectedIndices];
      for (let j2 = 0; j2 < indices.length; j2++) {
        const origPoints = this.moveOriginStrokes[j2];
        const stroke = this.strokes[indices[j2]];
        for (let i2 = 0; i2 < stroke.points.length; i2++) {
          stroke.points[i2] = { x: origPoints[i2].x + dx, y: origPoints[i2].y + dy };
        }
      }
      this.renderAllStrokes();
      return;
    }
    if (this.selectRect) {
      this.selectRect.x2 = pt.x;
      this.selectRect.y2 = pt.y;
      this.renderAllStrokes();
    }
  }
  selectUp(pt) {
    if (this.moveStart && this.moveOriginStrokes) {
      const dx = pt.x - this.moveStart.x;
      const dy = pt.y - this.moveStart.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        this.pushUndo();
        this.saveStrokes();
      }
      this.moveStart = null;
      this.moveOriginStrokes = null;
      this.renderAllStrokes();
      return;
    }
    if (this.selectRect) {
      for (let i2 = 0; i2 < this.strokes.length; i2++) {
        if (strokeInRect(this.strokes[i2], this.selectRect.x1, this.selectRect.y1, this.selectRect.x2, this.selectRect.y2))
          this.selectedIndices.add(i2);
      }
      this.selectRect = null;
      this.selectStart = null;
      this.renderAllStrokes();
    }
  }
  // ---------- 箭头 ----------
  arrowDown(pt) {
    this.previewStroke = {
      points: [pt, pt],
      color: this.currentColor,
      lineWidth: this.currentLineWidth,
      opacity: this.currentOpacity,
      timestamp: Date.now(),
      type: "arrow",
      arrowStyle: this.currentArrowStyle
    };
  }
  arrowMove(pt) {
    if (!this.previewStroke)
      return;
    this.previewStroke.points[1] = pt;
    this.renderAllStrokes();
  }
  arrowUp(pt) {
    if (!this.previewStroke)
      return;
    this.previewStroke.points[1] = pt;
    if (dist(this.previewStroke.points[0], pt) > 3) {
      this.pushUndo();
      this.strokes.push({ ...this.previewStroke, arrowStyle: this.currentArrowStyle });
      this.saveStrokes();
    }
    this.previewStroke = null;
    this.renderAllStrokes();
  }
  // ---------- 矩形 ----------
  rectDown(pt) {
    this.previewStroke = {
      points: [pt, pt],
      color: this.currentColor,
      lineWidth: this.currentLineWidth,
      opacity: this.currentOpacity,
      timestamp: Date.now(),
      type: "rect"
    };
  }
  rectMove(pt) {
    if (!this.previewStroke)
      return;
    this.previewStroke.points[1] = pt;
    this.renderAllStrokes();
  }
  rectUp(pt) {
    if (!this.previewStroke)
      return;
    this.previewStroke.points[1] = pt;
    const [a2, b2] = this.previewStroke.points;
    if (Math.abs(b2.x - a2.x) > 3 || Math.abs(b2.y - a2.y) > 3) {
      this.pushUndo();
      this.strokes.push({ ...this.previewStroke });
      this.saveStrokes();
    }
    this.previewStroke = null;
    this.renderAllStrokes();
  }
  // ---------- 文字 ----------
  handleTextTool(pt) {
    const input = document.createElement("textarea");
    input.style.position = "fixed";
    input.style.left = `${pt.x}px`;
    input.style.top = `${pt.y}px`;
    input.style.zIndex = "10002";
    input.style.minWidth = "80px";
    input.style.border = "1px dashed var(--interactive-accent)";
    input.style.background = "var(--background-primary)";
    input.style.padding = "4px";
    input.style.fontSize = "16px";
    input.style.resize = "both";
    document.body.appendChild(input);
    input.focus();
    const cleanup = () => {
      const text = input.value.trim();
      input.remove();
      if (text) {
        const newStroke = {
          points: [pt],
          color: this.currentColor,
          lineWidth: this.currentLineWidth,
          opacity: this.currentOpacity,
          timestamp: Date.now(),
          type: "text",
          text,
          fontSize: 16
        };
        this.pushUndo();
        this.strokes.push(newStroke);
        this.saveStrokes();
        this.renderAllStrokes();
      }
    };
    input.addEventListener("blur", cleanup);
    input.addEventListener("keydown", (e2) => {
      if (e2.key === "Escape") {
        input.remove();
      } else if (e2.key === "Enter" && !e2.shiftKey) {
        e2.preventDefault();
        cleanup();
      }
    });
  }
  // ---------- 笔画完成 ----------
  finishStroke() {
    if (!this.activeStroke || this.activeStroke.points.length < 2) {
      this.activeStroke = null;
      return;
    }
    this.pushUndo();
    this.strokes.push(this.activeStroke);
    this.activeStroke = null;
    this.saveStrokes();
  }
  // ---------- 删除选中 ----------
  async deleteSelected() {
    if (this.selectedIndices.size === 0)
      return;
    this.pushUndo();
    const sorted = [...this.selectedIndices].sort((a2, b2) => b2 - a2);
    for (const i2 of sorted)
      this.strokes.splice(i2, 1);
    this.selectedIndices.clear();
    this.renderAllStrokes();
    await this.saveStrokes();
  }
  // ---------- 清空全部（保留撤销） ----------
  clearAll() {
    if (this.strokes.length === 0)
      return;
    this.pushUndo();
    this.strokes = [];
    this.selectedIndices.clear();
    this.renderAllStrokes();
    this.saveStrokes();
    new import_obsidian.Notice("\u753B\u5E03\u5DF2\u6E05\u7A7A\uFF0C\u53EF\u6309 Ctrl+Z \u6062\u590D");
  }
  // 清空确认对话框
  confirmClearAll() {
    const modal = new import_obsidian.Modal(this.app);
    modal.titleEl.setText("\u786E\u8BA4\u6E05\u7A7A\u8349\u7A3F");
    modal.contentEl.createEl("p", { text: "\u662F\u5426\u6E05\u7A7A\u5F53\u524D\u6587\u4EF6\u7684\u6240\u6709\u624B\u5199\u4E0E\u6807\u6CE8\uFF1F" });
    modal.contentEl.createEl("p", { text: "\uFF08\u53EF\u901A\u8FC7 Ctrl+Z \u6062\u590D\uFF09", cls: "mod-warning" });
    const btnContainer = modal.contentEl.createDiv({ cls: "modal-button-container" });
    const confirmBtn = btnContainer.createEl("button", { text: "\u786E\u8BA4\u6E05\u7A7A" });
    const cancelBtn = btnContainer.createEl("button", { text: "\u53D6\u6D88" });
    confirmBtn.addEventListener("click", () => {
      this.clearAll();
      modal.close();
    });
    cancelBtn.addEventListener("click", () => modal.close());
    modal.open();
  }
  // ==========================================================
  //  绘制引擎
  // ==========================================================
  drawPerfectFreehand(ctx, stroke) {
    var _a;
    if (stroke.points.length < 2)
      return;
    const outline = R(
      stroke.points.map((p2) => [p2.x, p2.y]),
      { ...FREEHAND_OPTIONS, size: stroke.lineWidth * 2.2 }
    );
    if (!outline.length)
      return;
    ctx.save();
    ctx.globalAlpha = (_a = stroke.opacity) != null ? _a : 1;
    ctx.fillStyle = stroke.color;
    ctx.beginPath();
    ctx.moveTo(outline[0][0], outline[0][1]);
    for (let i2 = 1; i2 < outline.length; i2++)
      ctx.lineTo(outline[i2][0], outline[i2][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  drawArrowHead(ctx, from, to, color, size) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  drawArrowStroke(ctx, stroke) {
    var _a;
    if (stroke.points.length < 2)
      return;
    const [p1, p2] = stroke.points;
    const style = stroke.arrowStyle || "straight";
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.globalAlpha = (_a = stroke.opacity) != null ? _a : 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (style === "dashed")
      ctx.setLineDash([8, 4]);
    else
      ctx.setLineDash([]);
    ctx.beginPath();
    if (style === "curved") {
      const cx = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.2;
      const cy = (p1.y + p2.y) / 2 - (p2.x - p1.x) * 0.2;
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
    } else {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    const headSize = Math.max(6, stroke.lineWidth * 4);
    this.drawArrowHead(ctx, p1, p2, stroke.color, headSize);
    if (style === "double") {
      this.drawArrowHead(ctx, p2, p1, stroke.color, headSize);
    }
    ctx.restore();
  }
  drawStroke(ctx, stroke, highlight) {
    var _a, _b;
    if (stroke.type === "freehand") {
      if (highlight) {
        const xs = stroke.points.map((p2) => p2.x);
        const ys = stroke.points.map((p2) => p2.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        ctx.save();
        ctx.strokeStyle = "#3399ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(minX - 6, minY - 6, maxX - minX + 12, maxY - minY + 12);
        ctx.setLineDash([]);
        ctx.restore();
      }
      this.drawPerfectFreehand(ctx, stroke);
    } else if (stroke.type === "arrow") {
      this.drawArrowStroke(ctx, stroke);
    } else if (stroke.type === "rect") {
      const [a2, b2] = stroke.points;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.globalAlpha = (_a = stroke.opacity) != null ? _a : 1;
      ctx.beginPath();
      ctx.rect(Math.min(a2.x, b2.x), Math.min(a2.y, b2.y), Math.abs(b2.x - a2.x), Math.abs(b2.y - a2.y));
      ctx.stroke();
      ctx.restore();
    } else if (stroke.type === "text") {
      ctx.save();
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = (_b = stroke.opacity) != null ? _b : 1;
      ctx.font = `${stroke.fontSize || 16}px sans-serif`;
      ctx.fillText(stroke.text || "", stroke.points[0].x, stroke.points[0].y);
      ctx.restore();
    }
    if (highlight && stroke.type !== "freehand") {
      const pts = stroke.points;
      const xs = pts.map((p2) => p2.x), ys = pts.map((p2) => p2.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      ctx.save();
      ctx.strokeStyle = "#3399ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(minX - 4, minY - 4, maxX - minX + 8, maxY - minY + 8);
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
  renderAllStrokes() {
    if (!this.ctx || !this.canvas)
      return;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
    for (let i2 = 0; i2 < this.strokes.length; i2++) {
      this.drawStroke(this.ctx, this.strokes[i2], this.selectedIndices.has(i2));
    }
    if (this.activeStroke)
      this.drawStroke(this.ctx, this.activeStroke, false);
    if (this.previewStroke)
      this.drawStroke(this.ctx, this.previewStroke, false);
    if (this.selectRect) {
      const { x1, y1, x2, y2 } = this.selectRect;
      this.ctx.save();
      this.ctx.strokeStyle = "#3399ff";
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([6, 3]);
      this.ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
      this.ctx.setLineDash([]);
      this.ctx.restore();
    }
  }
  // ==========================================================
  //  存储（同级目录 draft-paper 文件夹）
  // ==========================================================
  getDraftDir() {
    if (!this.currentFilePath)
      return "";
    const idx = this.currentFilePath.lastIndexOf("/");
    const dir = idx >= 0 ? this.currentFilePath.substring(0, idx) : "";
    return dir ? `${dir}/draft-paper` : "draft-paper";
  }
  getDraftFileName() {
    if (!this.currentFilePath)
      return "";
    const idx = this.currentFilePath.lastIndexOf("/");
    const name = idx >= 0 ? this.currentFilePath.substring(idx + 1) : this.currentFilePath;
    return name.replace(/\.md$/i, ".json");
  }
  async loadStrokes() {
    const dir = this.getDraftDir();
    const fn = this.getDraftFileName();
    if (!dir || !fn) {
      this.strokes = [];
      return;
    }
    try {
      const raw = await this.app.vault.adapter.read(`${dir}/${fn}`);
      this.strokes = JSON.parse(raw);
    } catch (e2) {
      this.strokes = [];
    }
  }
  async saveStrokes() {
    const dir = this.getDraftDir();
    const fn = this.getDraftFileName();
    if (!dir || !fn)
      return;
    try {
      await this.app.vault.adapter.mkdir(dir);
    } catch (e2) {
    }
    try {
      await this.app.vault.adapter.write(`${dir}/${fn}`, JSON.stringify(this.strokes));
    } catch (err) {
      console.error("[DraftPaper] save failed:", err);
    }
  }
  async syncCurrentFile() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!(view == null ? void 0 : view.file))
      return;
    const newPath = view.file.path;
    if (newPath === this.currentFilePath)
      return;
    if (this.currentFilePath)
      await this.saveStrokes();
    this.currentFilePath = newPath;
    this.undoStack = [];
    this.selectedIndices.clear();
    this.selectRect = null;
    await this.loadStrokes();
    this.activeStroke = null;
    this.renderAllStrokes();
  }
  // ==========================================================
  //  撤销系统
  // ==========================================================
  pushUndo() {
    this.undoStack.push(
      this.strokes.map((s2) => ({ ...s2, points: s2.points.map((p2) => ({ ...p2 })) }))
    );
    if (this.undoStack.length > this.MAX_UNDO)
      this.undoStack.shift();
  }
  async undo() {
    if (!this.undoStack.length)
      return;
    this.strokes = this.undoStack.pop();
    this.selectedIndices.clear();
    this.renderAllStrokes();
    await this.saveStrokes();
  }
};
