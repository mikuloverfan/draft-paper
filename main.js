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
var HIGHLIGHTER_COLOR = "#ffeb3b";
var HIGHLIGHTER_OPACITY = 0.25;
var ERASER_HIT_DISTANCE = 15;
var PIXEL_ERASER_RADIUS = 16;
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
function dist(a2, b2) {
  return Math.hypot(a2.x - b2.x, a2.y - b2.y);
}
function clipStrokeByPixelEraser(stroke, eraserPoints, radius) {
  const erased = stroke.points.map(
    (p2) => eraserPoints.some((ep) => dist(p2, ep) < radius)
  );
  if (!erased.some(Boolean))
    return [stroke];
  const segments = [];
  let current = [];
  for (let i2 = 0; i2 < stroke.points.length; i2++) {
    if (!erased[i2]) {
      current.push({ ...stroke.points[i2] });
    } else {
      if (current.length >= 2) {
        segments.push({ ...stroke, points: current });
      }
      current = [];
    }
  }
  if (current.length >= 2) {
    segments.push({ ...stroke, points: current });
  }
  return segments;
}
var DraftPaperPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "active", false);
    __publicField(this, "isDrawing", true);
    __publicField(this, "tool", "pen");
    __publicField(this, "eraserMode", "stroke");
    __publicField(this, "canvas", null);
    __publicField(this, "ctx", null);
    __publicField(this, "container", null);
    // markdown 预览容器
    __publicField(this, "strokes", []);
    __publicField(this, "currentStroke", null);
    __publicField(this, "previewStroke", null);
    __publicField(this, "floatBar", null);
    // 磁吸浮动工具栏
    __publicField(this, "settingsPopover", null);
    // 设置弹出面板
    __publicField(this, "settingsPanelVisible", false);
    __publicField(this, "eraserCursorEl", null);
    // 拖拽状态
    __publicField(this, "toolbarDrag", false);
    __publicField(this, "toolbarDragStart", { x: 0, y: 0 });
    __publicField(this, "toolbarDragBarStart", { x: 0, y: 0 });
    __publicField(this, "toolbarSnap", "bottom");
    __publicField(this, "color", DEFAULT_COLOR);
    __publicField(this, "lineWidth", DEFAULT_LINE_WIDTH);
    __publicField(this, "opacity", 1);
    __publicField(this, "arrowStyle", "straight");
    __publicField(this, "eraserPath", []);
    __publicField(this, "isErasing", false);
    __publicField(this, "selectClearRect", null);
    __publicField(this, "selectClearStart", null);
    __publicField(this, "rafPending", false);
    __publicField(this, "currentFilePath", "");
    __publicField(this, "undoStack", []);
    __publicField(this, "redoStack", []);
    __publicField(this, "MAX_UNDO", 100);
    __publicField(this, "containerResizeObserver", null);
    // ==================== 拖拽 + 磁吸 ====================
    __publicField(this, "onToolbarDragStart", (e2) => {
      if (!this.floatBar)
        return;
      this.toolbarDrag = true;
      this.floatBar.classList.add("dragging");
      this.toolbarDragStart = { x: e2.clientX, y: e2.clientY };
      const rect = this.floatBar.getBoundingClientRect();
      this.toolbarDragBarStart = { x: rect.left, y: rect.top };
      e2.preventDefault();
    });
    __publicField(this, "onToolbarDragMove", (e2) => {
      if (!this.toolbarDrag || !this.floatBar)
        return;
      const dx = e2.clientX - this.toolbarDragStart.x;
      const dy = e2.clientY - this.toolbarDragStart.y;
      const newLeft = this.toolbarDragBarStart.x + dx;
      const newTop = this.toolbarDragBarStart.y + dy;
      this.floatBar.style.left = `${newLeft}px`;
      this.floatBar.style.top = `${newTop}px`;
      this.floatBar.style.transform = "none";
      if (this.settingsPanelVisible)
        this.hideSettingsPanel();
    });
    __publicField(this, "onToolbarDragEnd", () => {
      if (!this.toolbarDrag || !this.floatBar)
        return;
      this.toolbarDrag = false;
      this.floatBar.classList.remove("dragging");
      this.snapToNearest();
      this.saveToolbarPosition();
    });
    // ==================== 事件处理（canvas-relative 坐标系，无 block 依赖） ====================
    __publicField(this, "onPointerDown", (e2) => {
      if (!this.active || !this.isDrawing)
        return;
      if (e2.pointerType === "mouse" && e2.button !== 0)
        return;
      e2.preventDefault();
      const p2 = this.getCanvasPoint(e2);
      if (this.tool === "hand")
        return;
      if (this.tool === "eraser") {
        if (this.eraserMode === "stroke") {
          this.eraseAt(p2);
        } else if (this.eraserMode === "pixel") {
          this.isErasing = true;
          this.eraserPath = [p2];
          this.applyPixelEraser();
        } else if (this.eraserMode === "select-clear") {
          this.selectClearStart = p2;
          this.selectClearRect = { x1: p2.x, y1: p2.y, x2: p2.x, y2: p2.y };
        }
        return;
      }
      if (this.tool === "text") {
        this.textAt(p2);
        return;
      }
      if (this.tool === "pen" || this.tool === "highlighter") {
        this.currentStroke = {
          type: this.tool === "pen" ? "pen" : "highlighter",
          blockKey: "",
          points: [p2],
          color: this.tool === "highlighter" ? HIGHLIGHTER_COLOR : this.color,
          lineWidth: this.lineWidth,
          opacity: this.tool === "highlighter" ? HIGHLIGHTER_OPACITY : this.opacity,
          timestamp: Date.now()
        };
      } else if (this.tool === "arrow" || this.tool === "rect") {
        this.previewStroke = {
          type: this.tool,
          blockKey: "",
          points: [p2, p2],
          color: this.color,
          lineWidth: this.lineWidth,
          opacity: this.opacity,
          timestamp: Date.now(),
          arrowStyle: this.tool === "arrow" ? this.arrowStyle : void 0
        };
      }
      this.scheduleRedraw();
    });
    __publicField(this, "onPointerMove", (e2) => {
      if (!this.active || !this.isDrawing)
        return;
      const p2 = this.getCanvasPoint(e2);
      if (this.tool === "eraser" && this.eraserMode === "pixel" && this.eraserCursorEl) {
        const size = PIXEL_ERASER_RADIUS * 2;
        this.eraserCursorEl.style.left = `${e2.clientX - PIXEL_ERASER_RADIUS}px`;
        this.eraserCursorEl.style.top = `${e2.clientY - PIXEL_ERASER_RADIUS}px`;
        this.eraserCursorEl.style.width = `${size}px`;
        this.eraserCursorEl.style.height = `${size}px`;
      }
      if (this.tool === "eraser") {
        if (this.eraserMode === "stroke" && e2.buttons === 1) {
          this.eraseAt(p2);
        } else if (this.eraserMode === "pixel" && this.isErasing) {
          this.eraserPath.push(p2);
          this.applyPixelEraser();
        } else if (this.eraserMode === "select-clear" && this.selectClearRect) {
          this.selectClearRect.x2 = p2.x;
          this.selectClearRect.y2 = p2.y;
          this.scheduleRedraw();
        }
        return;
      }
      if (this.previewStroke) {
        this.previewStroke.points[1] = p2;
        this.scheduleRedraw();
        return;
      }
      if (!this.currentStroke)
        return;
      const last = this.currentStroke.points.at(-1);
      const filtered = {
        x: last.x + (p2.x - last.x) * 0.35,
        y: last.y + (p2.y - last.y) * 0.35
      };
      if (dist(filtered, last) < 1)
        return;
      this.currentStroke.points.push(filtered);
      this.scheduleRedraw();
    });
    __publicField(this, "onPointerUp", () => {
      if (!this.active || !this.isDrawing)
        return;
      if (this.tool === "eraser") {
        if (this.eraserMode === "pixel") {
          this.isErasing = false;
          this.eraserPath = [];
          this.saveStrokes();
        } else if (this.eraserMode === "select-clear" && this.selectClearRect) {
          this.pushUndo();
          this.deleteStrokesInRect(this.selectClearRect);
          this.selectClearRect = null;
          this.selectClearStart = null;
          this.scheduleRedraw();
          this.saveStrokes();
        }
        return;
      }
      if (this.previewStroke) {
        const [a2, b2] = this.previewStroke.points;
        if (dist(a2, b2) > 3) {
          this.pushUndo();
          this.strokes.push({ ...this.previewStroke });
        }
        this.previewStroke = null;
        this.scheduleRedraw();
        this.saveStrokes();
        return;
      }
      if (this.currentStroke) {
        if (this.currentStroke.points.length > 1) {
          this.pushUndo();
          this.strokes.push(this.currentStroke);
        }
        this.currentStroke = null;
        this.scheduleRedraw();
        this.saveStrokes();
        return;
      }
    });
    // 优化后的 pointerleave：延时检测是否真的离开（断触修复关键）
    __publicField(this, "leaveTimeout", null);
    __publicField(this, "LEAVE_TOLERANCE_MS", 150);
    __publicField(this, "onPointerLeave", (e2) => {
      if (!this.active || !this.isDrawing)
        return;
      if (!this.currentStroke && !this.previewStroke)
        return;
      this.leaveTimeout = setTimeout(() => {
        this.leaveTimeout = null;
        this.onPointerUp();
      }, this.LEAVE_TOLERANCE_MS);
    });
    // ==================== 渲染（无 blockMap，直接 canvas-relative 绘制） ====================
    __publicField(this, "scheduleRedraw", () => {
      if (!this.rafPending) {
        this.rafPending = true;
        requestAnimationFrame(() => {
          this.rafPending = false;
          this.syncCanvasSize();
          this.redraw();
        });
      }
    });
  }
  async onload() {
    await this.loadData();
    this.addRibbonIcon("pencil", "\u8349\u7A3F\u7EB8", () => this.toggle());
    this.addCommand({ id: "toggle-draft", name: "\u5207\u6362\u8349\u7A3F\u7EB8", callback: () => this.toggle() });
    this.registerDomEvent(window, "resize", () => {
      this.scheduleRedraw();
      this.repositionPopover();
    });
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
      if (this.active)
        this.scheduleRedraw();
    }));
  }
  async loadData() {
    const data = await super.loadData();
    if (data == null ? void 0 : data.toolbarPos) {
      this.toolbarDragBarStart = data.toolbarPos;
    }
    if (data == null ? void 0 : data.toolbarSnap) {
      this.toolbarSnap = data.toolbarSnap;
    }
  }
  async saveData() {
    await super.saveData({
      toolbarPos: this.toolbarDragBarStart,
      toolbarSnap: this.toolbarSnap
    });
  }
  async onunload() {
    this.disable();
  }
  toggle() {
    if (this.active) {
      this.disable();
    } else {
      this.enable();
    }
  }
  // ==================== 启用/初始化 ====================
  enable() {
    var _a;
    if (this.active)
      return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
    if (!view) {
      new import_obsidian.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2A Markdown \u6587\u4EF6\u8FDB\u5165\u9605\u8BFB\u6A21\u5F0F");
      return;
    }
    if (view.getMode() !== "preview") {
      this.app.commands.executeCommandById("markdown:toggle-preview");
      setTimeout(() => this.enable(), 200);
      return;
    }
    this.currentFilePath = ((_a = view.file) == null ? void 0 : _a.path) || "";
    const previewContainer = view.previewEl || view.contentEl.querySelector(".markdown-preview-view");
    if (!previewContainer) {
      new import_obsidian.Notice("\u65E0\u6CD5\u627E\u5230\u9884\u89C8\u5BB9\u5668\uFF0C\u8BF7\u786E\u4FDD\u5728\u9605\u8BFB\u6A21\u5F0F");
      return;
    }
    this.container = previewContainer;
    this.loadStrokes();
    this.init();
  }
  init() {
    if (!this.container)
      return;
    const canvas = document.createElement("canvas");
    canvas.id = "draft-paper-canvas";
    Object.assign(canvas.style, {
      position: "absolute",
      top: "0",
      left: "0",
      zIndex: "1",
      pointerEvents: this.isDrawing ? "auto" : "none",
      touchAction: "none",
      background: "transparent"
    });
    this.container.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.syncCanvasSize();
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    this.containerResizeObserver = new ResizeObserver(() => {
      this.syncCanvasSize();
      this.scheduleRedraw();
    });
    this.containerResizeObserver.observe(this.container);
    this.registerDomEvent(this.container, "scroll", this.scheduleRedraw, true);
    this.createToolbar();
    this.eraserCursorEl = document.createElement("div");
    this.eraserCursorEl.className = "draft-paper-eraser-cursor";
    this.eraserCursorEl.style.display = "none";
    document.body.appendChild(this.eraserCursorEl);
    this.active = true;
    this.isDrawing = true;
    this.tool = "pen";
    this.eraserMode = "stroke";
    this.updateCursorVisibility();
    this.scheduleRedraw();
  }
  disable() {
    if (!this.active)
      return;
    this.saveStrokes();
    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this.onPointerDown);
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerup", this.onPointerUp);
      this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
    if (this.containerResizeObserver) {
      this.containerResizeObserver.disconnect();
      this.containerResizeObserver = null;
    }
    this.container = null;
    if (this.floatBar) {
      this.floatBar.remove();
      this.floatBar = null;
    }
    if (this.settingsPopover) {
      this.settingsPopover.remove();
      this.settingsPopover = null;
    }
    if (this.eraserCursorEl) {
      this.eraserCursorEl.remove();
      this.eraserCursorEl = null;
    }
    this.strokes = [];
    this.currentStroke = null;
    this.settingsPanelVisible = false;
    this.active = false;
  }
  syncCanvasSize() {
    if (!this.canvas || !this.ctx || !this.container)
      return;
    const dpr = window.devicePixelRatio || 1;
    const containerRect = this.container.getBoundingClientRect();
    const contentHeight = Math.max(
      this.container.scrollHeight,
      this.container.clientHeight
    );
    this.canvas.width = containerRect.width * dpr;
    this.canvas.height = contentHeight * dpr;
    this.canvas.style.width = `${containerRect.width}px`;
    this.canvas.style.height = `${contentHeight}px`;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }
  // ==================== 磁吸浮动工具栏 ====================
  createToolbar() {
    const bar = document.createElement("div");
    bar.className = "dp-float-bar";
    bar.innerHTML = `
            <span class="dp-drag-handle" title="\u62D6\u52A8\u79FB\u52A8 (\u677E\u5F00\u5438\u9644)">\u2261</span>
            <span class="dp-sep"></span>
            <button class="dp-tool-btn active" data-t="pen" title="\u753B\u7B14 (1)">\u270F\uFE0F</button>
            <button class="dp-tool-btn" data-t="highlighter" title="\u8367\u5149\u7B14 (2)">\u{1F58D}\uFE0F</button>
            <button class="dp-tool-btn" data-t="eraser" title="\u6A61\u76AE\u64E6 (3)">\u{1F9F9}</button>
            <button class="dp-tool-btn" data-t="arrow" title="\u7BAD\u5934 (4)">\u2197</button>
            <button class="dp-tool-btn" data-t="rect" title="\u77E9\u5F62 (5)">\u2B1B</button>
            <button class="dp-tool-btn" data-t="text" title="\u6587\u5B57 (6)">T</button>
            <button class="dp-tool-btn" data-t="hand" title="\u624B\u638C (7)">\u{1F590}\uFE0F</button>
            <button class="dp-tool-btn dp-tool-extras" title="\u66F4\u591A\u5DE5\u5177">\u2795</button>
            <span class="dp-sep"></span>
            <button class="dp-tool-btn dp-gear-btn" title="\u8BBE\u7F6E">\u2699\uFE0F</button>
            <button class="dp-tool-btn" id="dp-float-exit" title="\u9000\u51FA">\u2715</button>
        `;
    document.body.appendChild(bar);
    this.floatBar = bar;
    const handle = bar.querySelector(".dp-drag-handle");
    handle.addEventListener("pointerdown", this.onToolbarDragStart);
    window.addEventListener("pointermove", this.onToolbarDragMove);
    window.addEventListener("pointerup", this.onToolbarDragEnd);
    bar.addEventListener("pointerdown", (e2) => {
      if (e2.target.closest("button"))
        return;
      this.onToolbarDragStart(e2);
    });
    bar.querySelectorAll("[data-t]").forEach((btn) => {
      btn.addEventListener("click", (e2) => {
        e2.stopPropagation();
        const tool = btn.dataset.t;
        this.selectTool(tool);
        this.updateFloatBarActive();
      });
    });
    bar.querySelector(".dp-gear-btn").addEventListener("click", (e2) => {
      e2.stopPropagation();
      this.toggleSettingsPanel();
    });
    document.getElementById("dp-float-exit").addEventListener("click", () => this.disable());
    document.addEventListener("click", (e2) => {
      var _a, _b;
      if (this.settingsPanelVisible && !((_a = this.settingsPopover) == null ? void 0 : _a.contains(e2.target)) && !((_b = this.floatBar) == null ? void 0 : _b.contains(e2.target))) {
        this.hideSettingsPanel();
      }
    });
    this.createSettingsPopover();
    this.updateFloatBarActive();
    this.applyToolbarPosition();
  }
  selectTool(tool) {
    this.tool = tool;
    this.eraserMode = "stroke";
    if (tool === "hand") {
      this.canvas.style.pointerEvents = "none";
    } else if (this.isDrawing) {
      this.canvas.style.pointerEvents = "auto";
    }
    this.resetToolState();
    this.updateCursorVisibility();
    this.updateSettingsPanelContent();
  }
  updateFloatBarActive() {
    var _a;
    (_a = this.floatBar) == null ? void 0 : _a.querySelectorAll("[data-t]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.t === this.tool);
    });
  }
  snapToNearest() {
    if (!this.floatBar || !this.container)
      return;
    const barRect = this.floatBar.getBoundingClientRect();
    const cx = barRect.left + barRect.width / 2;
    const cy = barRect.top + barRect.height / 2;
    const MARGIN = 8;
    const SNAP_THRESHOLD = 200;
    const containerRect = this.container.getBoundingClientRect();
    const cLeft = containerRect.left;
    const cRight = containerRect.right;
    const cTop = containerRect.top;
    const cBottom = containerRect.bottom;
    const snaps = [
      // 底部居中（横向）
      { id: "bottom", x: (cLeft + cRight - barRect.width) / 2, y: cBottom - barRect.height - MARGIN, vertical: false },
      // 顶部居中（横向）
      { id: "top", x: (cLeft + cRight - barRect.width) / 2, y: cTop + MARGIN, vertical: false },
      // 左侧居中（竖向）
      { id: "left", x: cLeft + MARGIN, y: (cTop + cBottom - barRect.height) / 2, vertical: true },
      // 右侧居中（竖向）
      { id: "right", x: cRight - barRect.width - MARGIN, y: (cTop + cBottom - barRect.height) / 2, vertical: true }
    ];
    let best = null;
    let bestDist = Infinity;
    for (const s2 of snaps) {
      const sCx = s2.vertical ? s2.x + barRect.width / 2 : s2.x + barRect.width / 2;
      const sCy = s2.vertical ? s2.y + barRect.height / 2 : s2.y + barRect.height / 2;
      const d2 = Math.hypot(cx - sCx, cy - sCy);
      if (d2 < bestDist) {
        best = s2;
        bestDist = d2;
      }
    }
    if (best && bestDist < SNAP_THRESHOLD) {
      this.floatBar.style.left = `${best.x}px`;
      this.floatBar.style.top = `${best.y}px`;
      this.floatBar.style.transform = "none";
      this.toolbarSnap = best.id;
      this.floatBar.classList.toggle("is-vertical", best.vertical);
    } else {
      this.toolbarSnap = "free";
      this.floatBar.classList.remove("is-vertical");
      const r2 = this.floatBar.getBoundingClientRect();
      this.toolbarDragBarStart = { x: r2.left, y: r2.top };
    }
    this.repositionPopover();
  }
  applyToolbarPosition() {
    if (!this.floatBar || !this.container)
      return;
    const pos = this.toolbarDragBarStart;
    const MARGIN = 8;
    if (pos.x === 0 && pos.y === 0) {
      const containerRect = this.container.getBoundingClientRect();
      this.floatBar.style.left = `${MARGIN}px`;
      this.floatBar.style.top = `${MARGIN}px`;
      const barRect = this.floatBar.getBoundingClientRect();
      const x2 = (containerRect.left + containerRect.right - barRect.width) / 2;
      const y2 = containerRect.bottom - barRect.height - MARGIN;
      this.floatBar.style.left = `${x2}px`;
      this.floatBar.style.top = `${y2}px`;
      this.floatBar.style.transform = "none";
      this.toolbarDragBarStart = { x: x2, y: y2 };
      this.saveData();
    } else {
      this.floatBar.style.left = `${pos.x}px`;
      this.floatBar.style.top = `${pos.y}px`;
      this.floatBar.style.transform = "none";
    }
    const isVertical = this.toolbarSnap === "left" || this.toolbarSnap === "right";
    this.floatBar.classList.toggle("is-vertical", isVertical);
  }
  repositionPopover() {
    if (!this.settingsPopover || !this.floatBar || !this.settingsPanelVisible)
      return;
    const barRect = this.floatBar.getBoundingClientRect();
    const popRect = this.settingsPopover.getBoundingClientRect();
    let top = barRect.top - popRect.height - 8;
    let left = barRect.left;
    if (top < 8)
      top = barRect.bottom + 8;
    if (left + popRect.width > window.innerWidth - 8)
      left = window.innerWidth - popRect.width - 8;
    if (left < 8)
      left = 8;
    this.settingsPopover.style.left = `${left}px`;
    this.settingsPopover.style.top = `${top}px`;
  }
  saveToolbarPosition() {
    if (!this.floatBar)
      return;
    const r2 = this.floatBar.getBoundingClientRect();
    this.toolbarDragBarStart = { x: r2.left, y: r2.top };
    this.saveData();
  }
  // ==================== 弹出设置面板 ====================
  createSettingsPopover() {
    const pop = document.createElement("div");
    pop.className = "dp-settings-popover";
    pop.innerHTML = `
            <div class="dp-popover-row">
                <input type="color" id="dp-pop-color" value="${this.color}" title="\u989C\u8272">
                <label>\u7C97\u7EC6</label>
                <input type="range" id="dp-pop-width" min="1" max="8" step="0.5" value="${this.lineWidth}">
                <span style="font-size:11px;min-width:28px;text-align:right" id="dp-pop-wlbl">${this.lineWidth}px</span>
            </div>
            <div class="dp-popover-row">
                <label style="min-width:28px;text-align:right">\u900F\u660E</label>
                <input type="range" id="dp-pop-opacity" min="10" max="100" value="${this.opacity * 100}">
                <span style="font-size:11px;min-width:28px;text-align:right" id="dp-pop-olbl">${Math.round(this.opacity * 100)}%</span>
            </div>
            <div class="dp-popover-row" id="dp-pop-arrow-row" style="display:none">
                <label>\u7BAD\u5934</label>
                <select id="dp-pop-arrow-style">
                    <option value="straight">\u2192 \u76F4\u7EBF</option>
                    <option value="curved">\u219D \u5F2F\u66F2</option>
                    <option value="dashed">\u21E2 \u865A\u7EBF</option>
                    <option value="double">\u2194 \u53CC\u5934</option>
                </select>
            </div>
            <div class="dp-eraser-modes" id="dp-pop-eraser-modes" style="display:none">
                <button data-eraser="pixel">\u5C40\u90E8\u64E6\u9664</button>
                <button data-eraser="stroke" class="active">\u6574\u7B14\u64E6\u9664</button>
                <button data-eraser="select-clear">\u6846\u9009\u5220\u9664</button>
            </div>
            <div class="dp-popover-actions">
                <button class="dp-mode-toggle" id="dp-pop-mode">\u{1F7E2} \u7ED8\u56FE</button>
                <button id="dp-pop-undo" title="\u64A4\u9500 (Ctrl+Z)">\u21A9 \u64A4\u9500</button>
                <button id="dp-pop-redo" title="\u91CD\u505A (Ctrl+Shift+Z)">\u21AA \u91CD\u505A</button>
                <button id="dp-pop-clear" title="\u6E05\u7A7A\u753B\u5E03">\u{1F5D1} \u6E05\u7A7A</button>
            </div>
            <div class="dp-popover-actions" id="dp-pop-extra-tools" style="display:none">
                <button data-t="arrow" title="\u7BAD\u5934 (4)">\u2197 \u7BAD\u5934</button>
                <button data-t="rect" title="\u77E9\u5F62 (5)">\u2B1B \u77E9\u5F62</button>
                <button data-t="text" title="\u6587\u5B57 (6)">T \u6587\u5B57</button>
                <button data-t="hand" title="\u624B\u638C (7)">\u{1F590}\uFE0F \u624B\u638C</button>
            </div>
        `;
    document.body.appendChild(pop);
    this.settingsPopover = pop;
    document.getElementById("dp-pop-color").addEventListener("input", (e2) => {
      this.color = e2.target.value;
    });
    document.getElementById("dp-pop-width").addEventListener("input", (e2) => {
      this.lineWidth = parseFloat(e2.target.value);
      document.getElementById("dp-pop-wlbl").textContent = `${this.lineWidth}px`;
    });
    document.getElementById("dp-pop-opacity").addEventListener("input", (e2) => {
      this.opacity = parseInt(e2.target.value) / 100;
      document.getElementById("dp-pop-olbl").textContent = `${Math.round(this.opacity * 100)}%`;
    });
    document.getElementById("dp-pop-arrow-style").addEventListener("change", (e2) => {
      this.arrowStyle = e2.target.value;
    });
    pop.querySelectorAll("[data-eraser]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.eraserMode = btn.dataset.eraser;
        this.updateCursorVisibility();
        this.updateSettingsPanelContent();
      });
    });
    document.getElementById("dp-pop-mode").addEventListener("click", () => this.toggleDrawMode());
    document.getElementById("dp-pop-undo").addEventListener("click", () => this.undo());
    document.getElementById("dp-pop-redo").addEventListener("click", () => this.redo());
    document.getElementById("dp-pop-clear").addEventListener("click", () => this.confirmClearAll());
    pop.querySelectorAll("#dp-pop-extra-tools [data-t]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tool = btn.dataset.t;
        this.selectTool(tool);
        this.updateFloatBarActive();
      });
    });
  }
  toggleSettingsPanel() {
    if (!this.settingsPopover)
      return;
    if (this.settingsPanelVisible) {
      this.hideSettingsPanel();
    } else {
      this.showSettingsPanel();
    }
  }
  showSettingsPanel() {
    if (!this.settingsPopover)
      return;
    this.settingsPanelVisible = true;
    this.updateSettingsPanelContent();
    this.settingsPopover.classList.add("is-visible");
    this.repositionPopover();
  }
  hideSettingsPanel() {
    if (!this.settingsPopover)
      return;
    this.settingsPanelVisible = false;
    this.settingsPopover.classList.remove("is-visible");
  }
  updateSettingsPanelContent() {
    if (!this.settingsPopover)
      return;
    const eraserModes = document.getElementById("dp-pop-eraser-modes");
    if (eraserModes) {
      eraserModes.style.display = this.tool === "eraser" ? "flex" : "none";
      eraserModes.querySelectorAll("[data-eraser]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.eraser === this.eraserMode);
      });
    }
    const arrowRow = document.getElementById("dp-pop-arrow-row");
    if (arrowRow) {
      arrowRow.style.display = this.tool === "arrow" ? "flex" : "none";
      const sel = document.getElementById("dp-pop-arrow-style");
      if (sel)
        sel.value = this.arrowStyle;
    }
    const modeBtn = document.getElementById("dp-pop-mode");
    if (modeBtn) {
      modeBtn.textContent = this.isDrawing ? "\u{1F7E2} \u7ED8\u56FE" : "\u{1F441} \u9605\u8BFB";
      modeBtn.classList.toggle("active", !this.isDrawing);
    }
    const extraTools = document.getElementById("dp-pop-extra-tools");
    if (extraTools) {
      extraTools.style.display = window.innerWidth <= 500 ? "flex" : "none";
    }
  }
  toggleDrawMode() {
    this.isDrawing = !this.isDrawing;
    if (this.canvas) {
      this.canvas.style.pointerEvents = this.isDrawing ? "auto" : "none";
      this.canvas.style.cursor = this.isDrawing ? "crosshair" : "default";
    }
    this.updateSettingsPanelContent();
  }
  updateCursorVisibility() {
    if (this.eraserCursorEl) {
      const show = this.tool === "eraser" && this.eraserMode === "pixel";
      this.eraserCursorEl.style.display = show ? "block" : "none";
    }
  }
  resetToolState() {
    this.currentStroke = null;
    this.previewStroke = null;
    this.eraserPath = [];
    this.isErasing = false;
    this.selectClearRect = null;
    this.selectClearStart = null;
    this.scheduleRedraw();
  }
  // ==================== 获取 canvas-relative 坐标 ====================
  getCanvasPoint(e2) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e2.clientX - rect.left,
      y: e2.clientY - rect.top
    };
  }
  // ==================== 橡皮实现（canvas-relative，无 block 依赖） ====================
  eraseAt(p2) {
    this.pushUndo();
    this.strokes = this.strokes.filter((s2) => {
      return !s2.points.some((pt) => dist(pt, p2) < ERASER_HIT_DISTANCE);
    });
    this.scheduleRedraw();
    this.saveStrokes();
  }
  applyPixelEraser() {
    if (this.eraserPath.length === 0)
      return;
    const newStrokes = [];
    for (const s2 of this.strokes) {
      const clipped = clipStrokeByPixelEraser(s2, this.eraserPath, PIXEL_ERASER_RADIUS);
      newStrokes.push(...clipped);
    }
    this.strokes = newStrokes;
    this.scheduleRedraw();
  }
  deleteStrokesInRect(rect) {
    const minX = Math.min(rect.x1, rect.x2);
    const maxX = Math.max(rect.x1, rect.x2);
    const minY = Math.min(rect.y1, rect.y2);
    const maxY = Math.max(rect.y1, rect.y2);
    this.strokes = this.strokes.filter((s2) => {
      return !s2.points.some(
        (pt) => pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY
      );
    });
  }
  // ==================== 文字工具（canvas-relative） ====================
  textAt(p2) {
    const canvasRect = this.canvas.getBoundingClientRect();
    const input = document.createElement("textarea");
    Object.assign(input.style, {
      position: "fixed",
      left: `${canvasRect.left + p2.x}px`,
      top: `${canvasRect.top + p2.y}px`,
      zIndex: "10002",
      minWidth: "80px",
      border: "1px dashed var(--interactive-accent)",
      background: "var(--background-primary)",
      padding: "4px",
      fontSize: "16px",
      resize: "both"
    });
    document.body.appendChild(input);
    input.focus();
    const done = () => {
      const text = input.value.trim();
      input.remove();
      if (text) {
        this.pushUndo();
        this.strokes.push({
          type: "text",
          blockKey: "",
          points: [p2],
          color: this.color,
          lineWidth: this.lineWidth,
          opacity: this.opacity,
          timestamp: Date.now(),
          text,
          fontSize: 16
        });
        this.saveStrokes();
        this.scheduleRedraw();
      }
    };
    input.addEventListener("blur", done);
    input.addEventListener("keydown", (e2) => {
      if (e2.key === "Escape")
        input.remove();
      else if (e2.key === "Enter" && !e2.shiftKey) {
        e2.preventDefault();
        done();
      }
    });
  }
  // ==================== 清空 ====================
  clearAll() {
    if (this.strokes.length === 0)
      return;
    this.pushUndo();
    this.strokes = [];
    this.scheduleRedraw();
    this.saveStrokes();
    new import_obsidian.Notice("\u753B\u5E03\u5DF2\u6E05\u7A7A\uFF0C\u53EF\u6309 Ctrl+Z \u6062\u590D");
  }
  confirmClearAll() {
    const modal = new import_obsidian.Modal(this.app);
    modal.titleEl.setText("\u786E\u8BA4\u6E05\u7A7A");
    modal.contentEl.createEl("p", { text: "\u6E05\u7A7A\u5F53\u524D\u6587\u4EF6\u6240\u6709\u6279\u6CE8\uFF1F" });
    const btns = modal.contentEl.createDiv();
    btns.createEl("button", { text: "\u786E\u8BA4" }).addEventListener("click", () => {
      this.clearAll();
      modal.close();
    });
    btns.createEl("button", { text: "\u53D6\u6D88" }).addEventListener("click", () => modal.close());
    modal.open();
  }
  redraw() {
    if (!this.ctx || !this.canvas)
      return;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
    for (const s2 of this.strokes) {
      this.drawStroke(s2);
    }
    if (this.currentStroke)
      this.drawStroke(this.currentStroke);
    if (this.previewStroke)
      this.drawStroke(this.previewStroke);
    if (this.selectClearRect && this.tool === "eraser" && this.eraserMode === "select-clear") {
      this.ctx.save();
      this.ctx.strokeStyle = "#ff6666";
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([6, 3]);
      this.ctx.strokeRect(
        Math.min(this.selectClearRect.x1, this.selectClearRect.x2),
        Math.min(this.selectClearRect.y1, this.selectClearRect.y2),
        Math.abs(this.selectClearRect.x2 - this.selectClearRect.x1),
        Math.abs(this.selectClearRect.y2 - this.selectClearRect.y1)
      );
      this.ctx.setLineDash([]);
      this.ctx.restore();
    }
  }
  drawStroke(stroke) {
    if (!this.ctx || stroke.points.length < 1)
      return;
    const pts = stroke.points;
    if (stroke.type === "pen" || stroke.type === "highlighter") {
      const outline = R(
        pts.map((p2) => [p2.x, p2.y]),
        { ...FREEHAND_OPTIONS, size: stroke.lineWidth * 2.2 }
      );
      if (!outline.length)
        return;
      const ctx = this.ctx;
      ctx.save();
      if (stroke.type === "highlighter")
        ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = stroke.opacity;
      ctx.fillStyle = stroke.color;
      ctx.beginPath();
      ctx.moveTo(outline[0][0], outline[0][1]);
      for (let i2 = 1; i2 < outline.length; i2++)
        ctx.lineTo(outline[i2][0], outline[i2][1]);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (stroke.type === "arrow") {
      this.drawArrowStroke(stroke);
    } else if (stroke.type === "rect") {
      const [a2, b2] = pts;
      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.lineWidth;
      ctx.globalAlpha = stroke.opacity;
      ctx.strokeRect(Math.min(a2.x, b2.x), Math.min(a2.y, b2.y), Math.abs(b2.x - a2.x), Math.abs(b2.y - a2.y));
      ctx.restore();
    } else if (stroke.type === "text") {
      const pt = pts[0];
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = stroke.opacity;
      ctx.font = `${stroke.fontSize || 16}px sans-serif`;
      ctx.fillText(stroke.text || "", pt.x, pt.y);
      ctx.restore();
    }
  }
  drawArrowStroke(stroke) {
    if (!this.ctx)
      return;
    const [a2, b2] = stroke.points;
    const style = stroke.arrowStyle || "straight";
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.globalAlpha = stroke.opacity;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (style === "dashed")
      ctx.setLineDash([8, 4]);
    ctx.beginPath();
    if (style === "curved") {
      const cx = (a2.x + b2.x) / 2 + (b2.y - a2.y) * 0.2;
      const cy = (a2.y + b2.y) / 2 - (b2.x - a2.x) * 0.2;
      ctx.moveTo(a2.x, a2.y);
      ctx.quadraticCurveTo(cx, cy, b2.x, b2.y);
    } else {
      ctx.moveTo(a2.x, a2.y);
      ctx.lineTo(b2.x, b2.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    const headSize = Math.max(6, stroke.lineWidth * 4);
    this.drawArrowHead(ctx, a2, b2, stroke.color, headSize);
    if (style === "double")
      this.drawArrowHead(ctx, b2, a2, stroke.color, headSize);
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
  // ==================== 存储 ====================
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
    var _a, _b;
    if (!this.currentFilePath) {
      this.strokes = [];
      return;
    }
    const path = `${this.getDraftDir()}/${this.getDraftFileName()}`;
    try {
      const raw = JSON.parse(await this.app.vault.adapter.read(path));
      if (raw.length > 0 && raw[0].blockKey && ((_b = (_a = raw[0].points) == null ? void 0 : _a[0]) == null ? void 0 : _b.x) < 2e3) {
        this.strokes = await this.migrateOldStrokes(raw);
      } else {
        this.strokes = raw;
      }
    } catch (e2) {
      this.strokes = [];
    }
  }
  async migrateOldStrokes(oldStrokes) {
    if (!this.container)
      return [];
    const containerRect = this.container.getBoundingClientRect();
    const blockMap = /* @__PURE__ */ new Map();
    const BLOCK_SELECTORS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, .math-block, .callout";
    document.querySelectorAll(BLOCK_SELECTORS).forEach((el) => {
      var _a;
      const key = ((_a = el.textContent) == null ? void 0 : _a.trim().substring(0, 60)) || "";
      if (key)
        blockMap.set(key, el.getBoundingClientRect());
    });
    const migrated = [];
    for (const s2 of oldStrokes) {
      const blockRect = blockMap.get(s2.blockKey);
      if (!blockRect) {
        continue;
      }
      migrated.push({
        ...s2,
        blockKey: s2.blockKey,
        // 保留兼容
        points: s2.points.map((p2) => ({
          x: p2.x + blockRect.left - containerRect.left,
          y: p2.y + blockRect.top - containerRect.top
        }))
      });
    }
    if (migrated.length > 0) {
      new import_obsidian.Notice(`\u5DF2\u8FC1\u79FB ${migrated.length} \u6761\u65E7\u7248\u6279\u6CE8\u5230\u65B0\u5750\u6807\u7CFB`);
    }
    return migrated;
  }
  async saveStrokes() {
    if (!this.currentFilePath)
      return;
    const path = `${this.getDraftDir()}/${this.getDraftFileName()}`;
    try {
      await this.app.vault.adapter.mkdir(this.getDraftDir());
    } catch (e2) {
    }
    try {
      await this.app.vault.adapter.write(path, JSON.stringify(this.strokes));
    } catch (err) {
      console.error("\u8349\u7A3F\u4FDD\u5B58\u5931\u8D25:", err);
    }
  }
  // ==================== 撤销/重做 ====================
  pushUndo() {
    this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    if (this.undoStack.length > this.MAX_UNDO)
      this.undoStack.shift();
    this.redoStack = [];
  }
  undo() {
    if (this.undoStack.length === 0)
      return;
    this.redoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    this.strokes = this.undoStack.pop();
    this.scheduleRedraw();
    this.saveStrokes();
  }
  redo() {
    if (this.redoStack.length === 0)
      return;
    this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
    this.strokes = this.redoStack.pop();
    this.scheduleRedraw();
    this.saveStrokes();
  }
};
