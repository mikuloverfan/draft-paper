import { Plugin, MarkdownView, Notice } from "obsidian";
import { getStroke } from "perfect-freehand";

// ============================================================
//  类型
// ============================================================

interface Point {
    x: number;
    y: number;
}

type ArrowStyle = "straight" | "curved" | "dashed" | "double";

interface Stroke {
    points: Point[];
    color: string;
    lineWidth: number;
    opacity: number;
    timestamp: number;
    type: "freehand" | "arrow" | "rect" | "text";
    // 以下为可选项
    text?: string;
    fontSize?: number;
    arrowStyle?: ArrowStyle;
}

type ToolMode = "pen" | "eraser" | "select" | "arrow" | "rect" | "text";

// ============================================================
//  常量
// ============================================================

const DEFAULT_COLOR = "#ff3333";
const DEFAULT_LINE_WIDTH = 2.5;
const DEFAULT_OPACITY = 1;
const ERASER_RADIUS = 18;
const ARROW_HEAD_SIZE = 12;

const FREEHAND_OPTIONS = {
    size: 1,
    thinning: 0.6,
    smoothing: 0.75,
    streamline: 0.65,
    simulatePressure: true,
    easing: (t: number) => t * (2 - t),
    start: { taper: 0, cap: true },
    end: { taper: 0, cap: true },
};

// 箭头样式切换顺序
const ARROW_STYLES: ArrowStyle[] = ["straight", "curved", "dashed", "double"];

// ============================================================
//  辅助函数
// ============================================================

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function dist(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }

function distToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function strokeInRect(s: Stroke, x1: number, y1: number, x2: number, y2: number): boolean {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    return s.points.some(p => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
}

function clipStrokeByEraser(stroke: Stroke, eraserPath: Point[], radius: number): Stroke[] {
    const erased = stroke.points.map(p => eraserPath.some(ep => dist(p, ep) < radius));
    if (!erased.some(Boolean)) return [stroke];
    const segments: Stroke[] = [];
    let current: Point[] = [];
    for (let i = 0; i < stroke.points.length; i++) {
        if (!erased[i]) {
            current.push({ ...stroke.points[i] });
        } else {
            if (current.length >= 2) segments.push({ ...stroke, points: current, timestamp: Date.now() });
            current = [];
        }
    }
    if (current.length >= 2) segments.push({ ...stroke, points: current, timestamp: Date.now() });
    return segments;
}

// ============================================================
//  插件主体
// ============================================================

export default class DraftPaperPlugin extends Plugin {
    // DOM
    private overlay: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private toolbarEl: HTMLElement | null = null;
    private eraserCursorEl: HTMLElement | null = null;
    private colorPickerEl: HTMLInputElement | null = null;
    private lineWidthSliderEl: HTMLInputElement | null = null;
    private opacitySliderEl: HTMLInputElement | null = null;
    private arrowStyleLabelEl: HTMLElement | null = null;

    // 状态
    private isActive = false;
    private currentFilePath = "";
    private strokes: Stroke[] = [];
    private activeStroke: Stroke | null = null;
    private toolMode: ToolMode = "pen";
    private currentColor = DEFAULT_COLOR;
    private currentLineWidth = DEFAULT_LINE_WIDTH;
    private currentOpacity = DEFAULT_OPACITY;
    private currentArrowStyle: ArrowStyle = "straight";

    private eraserPath: Point[] = [];
    private isErasing = false;

    private selectedIndices: Set<number> = new Set();
    private selectRect: { x1: number; y1: number; x2: number; y2: number } | null = null;
    private selectStart: Point | null = null;
    private moveStart: Point | null = null;
    private moveOriginStrokes: Point[][] | null = null;

    private previewStroke: Stroke | null = null;

    private undoStack: Stroke[][] = [];
    private readonly MAX_UNDO = 50;

    // 低通滤波
    private lastFilteredPt: Point | null = null;

    // 双击检测（用于文字工具）
    private lastClickTime = 0;
    private lastClickPos: Point | null = null;

    // 事件
    private boundPointerDown: (e: PointerEvent) => void;
    private boundPointerMove: (e: PointerEvent) => void;
    private boundPointerUp: (e: PointerEvent) => void;
    private boundKeyDown: (e: KeyboardEvent) => void;

    constructor(app: any, manifest: any) {
        super(app, manifest);
        this.boundPointerDown = this.onPointerDown.bind(this);
        this.boundPointerMove = this.onPointerMove.bind(this);
        this.boundPointerUp = this.onPointerUp.bind(this);
        this.boundKeyDown = this.onKeyDown.bind(this);
    }

    async onload() {
        this.createOverlay();
        this.addCommand({ id: "toggle-draft-mode", name: "Toggle Draft Mode", callback: () => this.toggleDraftMode() });
        this.addCommand({ id: "exit-draft-mode-force", name: "Exit Draft Mode (Force)", callback: async () => { if (this.isActive) await this.exitDraftMode(false); }});
        this.addRibbonIcon("pencil", "Toggle Draft Paper", () => this.toggleDraftMode());
        this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.syncCurrentFile()));
        document.addEventListener("keydown", this.boundKeyDown, true);
        await this.syncCurrentFile();
    }

    async onunload() {
        if (this.isActive) await this.exitDraftMode(true);
        this.detachOverlay();
        document.removeEventListener("keydown", this.boundKeyDown, true);
    }

    private createOverlay() {
        this.detachOverlay();
        this.overlay = document.createElement("div");
        this.overlay.className = "draft-paper-overlay";
        this.overlay.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.className = "draft-paper-canvas";
        this.canvas.tabIndex = 0;
        this.ctx = this.canvas.getContext("2d")!;
        this.overlay.appendChild(this.canvas);

        this.eraserCursorEl = document.createElement("div");
        this.eraserCursorEl.className = "draft-paper-eraser-cursor";
        this.eraserCursorEl.style.display = "none";
        this.overlay.appendChild(this.eraserCursorEl);

        this.toolbarEl = document.createElement("div");
        this.toolbarEl.className = "draft-paper-toolbar";
        this.overlay.appendChild(this.toolbarEl);
        this.buildToolbar();

        document.body.appendChild(this.overlay);
        this.registerDomEvent(window, "resize", () => { this.resizeCanvas(); this.renderAllStrokes(); });
    }

    private detachOverlay() {
        if (this.overlay) { this.overlay.remove(); this.overlay = null; this.canvas = null; this.ctx = null; this.toolbarEl = null; this.eraserCursorEl = null; }
    }

    private resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.scale(dpr, dpr);
    }

    // ============= 工具栏（新增透明度、箭头样式、文字工具按钮） =============
    private buildToolbar() {
        if (!this.toolbarEl) return;
        this.toolbarEl.innerHTML = `
            <div class="draft-paper-tool-buttons">
                <button data-tool="pen" title="画笔 (1)">✏️</button>
                <button data-tool="eraser" title="橡皮擦 (2)">🧹</button>
                <button data-tool="select" title="框选 (3)">⬜</button>
                <button data-tool="arrow" title="箭头 (4)">↗</button>
                <button data-tool="rect" title="矩形 (5)">⬛</button>
                <button data-tool="text" title="文字 (6)">T</button>
            </div>
            <div class="draft-paper-tool-settings">
                <input type="color" class="draft-paper-color-picker" value="${this.currentColor}">
                <input type="range" class="draft-paper-line-width" min="1" max="8" step="0.5" value="${this.currentLineWidth}">
                <span class="draft-paper-line-width-label">${this.currentLineWidth}px</span>
                <input type="range" class="draft-paper-opacity" min="10" max="100" step="5" value="${this.currentOpacity * 100}">
                <span class="draft-paper-opacity-label">${Math.round(this.currentOpacity*100)}%</span>
                <span class="draft-paper-arrow-style" style="display:${this.toolMode==='arrow'?'inline':'none'}">样式: ${this.currentArrowStyle}</span>
            </div>
            <button class="draft-paper-undo-btn" title="撤销 (Ctrl+Z)">↩</button>
            <button class="draft-paper-exit-btn" title="退出 (Esc)">❌</button>
        `;

        this.colorPickerEl = this.toolbarEl.querySelector(".draft-paper-color-picker")!;
        this.lineWidthSliderEl = this.toolbarEl.querySelector(".draft-paper-line-width")!;
        this.opacitySliderEl = this.toolbarEl.querySelector(".draft-paper-opacity")!;
        this.arrowStyleLabelEl = this.toolbarEl.querySelector(".draft-paper-arrow-style")!;

        ["pointerdown","pointermove","pointerup"].forEach(evt => {
            this.toolbarEl!.addEventListener(evt, e => e.stopPropagation());
        });

        this.toolbarEl.querySelectorAll("[data-tool]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const tool = (btn as HTMLElement).dataset.tool as ToolMode;
                this.setTool(tool);
                this.canvas?.focus();
            });
        });

        this.colorPickerEl.addEventListener("input", e => {
            this.currentColor = (e.target as HTMLInputElement).value;
            this.canvas?.focus();
        });

        this.lineWidthSliderEl.addEventListener("input", e => {
            this.currentLineWidth = parseFloat((e.target as HTMLInputElement).value);
            const lbl = this.toolbarEl!.querySelector(".draft-paper-line-width-label");
            if (lbl) lbl.textContent = `${this.currentLineWidth}px`;
            this.canvas?.focus();
        });

        this.opacitySliderEl.addEventListener("input", e => {
            this.currentOpacity = parseInt((e.target as HTMLInputElement).value) / 100;
            const lbl = this.toolbarEl!.querySelector(".draft-paper-opacity-label");
            if (lbl) lbl.textContent = `${Math.round(this.currentOpacity*100)}%`;
            this.canvas?.focus();
        });

        this.toolbarEl.querySelector(".draft-paper-undo-btn")?.addEventListener("click", e => {
            e.stopPropagation();
            this.undo();
            this.canvas?.focus();
        });

        this.toolbarEl.querySelector(".draft-paper-exit-btn")?.addEventListener("click", async e => {
            e.stopPropagation();
            if (this.isActive) await this.exitDraftMode(false);
        });
    }

    private updateToolbarActive() {
        this.toolbarEl?.querySelectorAll("[data-tool]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.tool === this.toolMode);
        });
        if (this.arrowStyleLabelEl) {
            this.arrowStyleLabelEl.style.display = this.toolMode === "arrow" ? "inline" : "none";
            this.arrowStyleLabelEl.textContent = `样式: ${this.currentArrowStyle}`;
        }
    }

    // ============= 模式切换 =============
    private async toggleDraftMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) { new Notice("只在 Markdown 视图中可用"); return; }
        if (view.getMode() !== "preview") {
            (this.app as any).commands.executeCommandById("markdown:toggle-preview");
            await sleep(200);
        }
        if (this.isActive) {
            await this.exitDraftMode(false);
        } else {
            await this.syncCurrentFile();
            await this.loadStrokes();
            await this.enterDraftMode();
        }
    }

    private async enterDraftMode() {
        if (this.isActive || !this.overlay || !this.canvas) return;
        this.overlay.style.display = "block";
        this.resizeCanvas();
        document.body.style.overflow = "hidden";
        this.canvas.addEventListener("pointerdown", this.boundPointerDown);
        this.canvas.addEventListener("pointermove", this.boundPointerMove);
        this.canvas.addEventListener("pointerup", this.boundPointerUp);
        this.canvas.addEventListener("pointerleave", this.boundPointerUp);
        this.canvas.focus();
        this.setTool("pen");
        this.renderAllStrokes();
        this.isActive = true;
    }

    private async exitDraftMode(silent = false) {
        if (!this.isActive || !this.overlay || !this.canvas) return;
        if (this.activeStroke) this.finishStroke();
        this.selectRect = null; this.selectedIndices.clear(); this.previewStroke = null;
        this.eraserPath = []; this.isErasing = false;
        this.lastFilteredPt = null;
        this.overlay.style.display = "none";
        this.canvas.removeEventListener("pointerdown", this.boundPointerDown);
        this.canvas.removeEventListener("pointermove", this.boundPointerMove);
        this.canvas.removeEventListener("pointerup", this.boundPointerUp);
        this.canvas.removeEventListener("pointerleave", this.boundPointerUp);
        document.body.style.overflow = "";
        this.isActive = false;
        await this.saveStrokes();
        if (!silent) new Notice("✅ 草稿纸已退出");
    }

    // ============= 工具切换 =============
    private setTool(tool: ToolMode) {
        this.toolMode = tool;
        if (tool !== "select") { this.selectedIndices.clear(); this.selectRect = null; }
        this.previewStroke = null; this.activeStroke = null;
        this.eraserPath = []; this.isErasing = false;
        this.lastFilteredPt = null;
        if (this.canvas) {
            this.canvas.style.cursor = tool === "eraser" ? "none" : (tool === "text" ? "text" : "crosshair");
        }
        if (this.eraserCursorEl) {
            this.eraserCursorEl.style.display = tool === "eraser" ? "block" : "none";
        }
        this.updateToolbarActive();
        this.renderAllStrokes();
        this.canvas?.focus();
    }

    private getCanvasPoint(e: PointerEvent): Point | null {
        if (!this.canvas) return null;
        const r = this.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    // ============= 键盘 =============
    private onKeyDown(e: KeyboardEvent) {
        if (!this.isActive) return;
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        if (e.key === "Escape") {
            e.preventDefault(); e.stopPropagation();
            if (this.selectedIndices.size > 0) { this.selectedIndices.clear(); this.renderAllStrokes(); }
            else this.exitDraftMode(false);
            return;
        }
        const tools: Record<string, ToolMode> = { "1":"pen","2":"eraser","3":"select","4":"arrow","5":"rect","6":"text" };
        if (tools[e.key]) { e.preventDefault(); e.stopPropagation(); this.setTool(tools[e.key]); return; }

        if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); e.stopPropagation(); this.undo(); return; }
        if ((e.key === "Delete" || e.key === "Backspace") && this.selectedIndices.size > 0) {
            e.preventDefault(); e.stopPropagation(); this.deleteSelected();
        }
        // 箭头模式下，按方向键左右切换箭头样式
        if (this.toolMode === "arrow" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            e.preventDefault();
            const idx = ARROW_STYLES.indexOf(this.currentArrowStyle);
            const nextIdx = e.key === "ArrowRight"
                ? (idx + 1) % ARROW_STYLES.length
                : (idx - 1 + ARROW_STYLES.length) % ARROW_STYLES.length;
            this.currentArrowStyle = ARROW_STYLES[nextIdx];
            this.updateToolbarActive();
        }
    }

    // ============= 指针路由 =============
    private onPointerDown(e: PointerEvent) {
        if (!this.isActive) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if ((e.target as HTMLElement)?.closest(".draft-paper-toolbar")) return;
        this.canvas?.focus();
        const pt = this.getCanvasPoint(e);
        if (!pt) return;

        // 文字工具：单击添加文字，双击也可
        if (this.toolMode === "text") {
            this.handleTextTool(pt);
            return;
        }

        switch (this.toolMode) {
            case "pen": this.penDown(pt); break;
            case "eraser": this.eraserDown(pt); break;
            case "select": this.selectDown(pt); break;
            case "arrow": this.arrowDown(pt); break;
            case "rect": this.rectDown(pt); break;
        }
    }

    private onPointerMove(e: PointerEvent) {
        if (!this.isActive) return;
        e.preventDefault();
        const pt = this.getCanvasPoint(e);
        if (!pt) return;
        if (this.toolMode === "eraser" && this.eraserCursorEl) {
            const s = ERASER_RADIUS*2;
            this.eraserCursorEl.style.left = `${e.clientX-ERASER_RADIUS}px`;
            this.eraserCursorEl.style.top = `${e.clientY-ERASER_RADIUS}px`;
            this.eraserCursorEl.style.width = `${s}px`; this.eraserCursorEl.style.height = `${s}px`;
        }
        switch (this.toolMode) {
            case "pen": this.penMove(pt); break;
            case "eraser": this.eraserMove(pt); break;
            case "select": this.selectMove(pt); break;
            case "arrow": this.arrowMove(pt); break;
            case "rect": this.rectMove(pt); break;
        }
    }

    private onPointerUp(e: PointerEvent) {
        if (!this.isActive) return;
        const pt = this.getCanvasPoint(e);
        if (!pt) return;
        switch (this.toolMode) {
            case "pen": this.penUp(pt); break;
            case "eraser": this.eraserUp(pt); break;
            case "select": this.selectUp(pt); break;
            case "arrow": this.arrowUp(pt); break;
            case "rect": this.rectUp(pt); break;
        }
    }

    // ============= 文字工具 =============
    private handleTextTool(pt: Point) {
        const now = Date.now();
        // 双击检测
        if (this.lastClickPos && dist(pt, this.lastClickPos) < 5 && now - this.lastClickTime < 400) {
            this.createTextAt(pt);
        }
        this.lastClickPos = pt;
        this.lastClickTime = now;
        // 单击也创建文字（方便触控）
        if (!this.lastClickPos) return; // 第一次点击已记录，但需要在这里也触发？我们希望双击才创建，避免误触。先改为双击创建。
        // 但触控不方便双击，所以改为单击直接创建（设置一个标记）
        // 权衡后：单击直接弹出输入框，双击也弹出，避免复杂。
        this.createTextAt(pt);
    }

    private createTextAt(pt: Point) {
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
                const newStroke: Stroke = {
                    points: [pt],
                    color: this.currentColor,
                    lineWidth: this.currentLineWidth,
                    opacity: this.currentOpacity,
                    timestamp: Date.now(),
                    type: "text",
                    text,
                    fontSize: 16,
                };
                this.pushUndo();
                this.strokes.push(newStroke);
                this.saveStrokes();
                this.renderAllStrokes();
            }
        };

        input.addEventListener("blur", cleanup);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                input.remove();
            } else if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                cleanup();
            }
        });
    }

    // ============= Pen =============
    private penDown(pt: Point) {
        this.lastFilteredPt = pt;
        this.activeStroke = {
            points: [pt],
            color: this.currentColor,
            lineWidth: this.currentLineWidth,
            opacity: this.currentOpacity,
            timestamp: Date.now(),
            type: "freehand",
        };
        this.renderDot(pt);
    }

    private penMove(pt: Point) {
        if (!this.activeStroke || !this.lastFilteredPt) return;
        const alpha = 0.35;
        const filtered: Point = {
            x: this.lastFilteredPt.x + (pt.x - this.lastFilteredPt.x) * alpha,
            y: this.lastFilteredPt.y + (pt.y - this.lastFilteredPt.y) * alpha,
        };
        this.lastFilteredPt = filtered;
        const pts = this.activeStroke.points;
        const last = pts[pts.length-1];
        if (dist(last, filtered) < 1.0) return;
        pts.push(filtered);
        this.renderAllStrokes();
    }

    private penUp(_pt: Point) {
        this.lastFilteredPt = null;
        if (this.activeStroke) this.finishStroke();
    }

    private renderDot(pt: Point) {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.globalAlpha = this.currentOpacity;
        this.ctx.fillStyle = this.currentColor;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, this.currentLineWidth/2, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // ============= Eraser =============
    private eraserDown(pt: Point) {
        this.pushUndo();
        this.isErasing = true;
        this.eraserPath = [pt];
        this.applyEraser();
    }
    private eraserMove(pt: Point) {
        if (!this.isErasing) return;
        const last = this.eraserPath[this.eraserPath.length-1];
        if (!last || dist(last, pt) > 4) this.eraserPath.push(pt);
        this.applyEraser();
    }
    private eraserUp(_pt: Point) {
        if (!this.isErasing) return;
        this.applyEraser();
        this.isErasing = false;
        this.eraserPath = [];
        this.saveStrokes();
    }
    private applyEraser() {
        if (this.eraserPath.length === 0) return;
        const newStrokes: Stroke[] = [];
        for (const s of this.strokes) newStrokes.push(...clipStrokeByEraser(s, this.eraserPath, ERASER_RADIUS));
        this.strokes = newStrokes;
        this.selectedIndices.clear();
        this.renderAllStrokes();
    }

    // ============= Select =============
    private selectDown(pt: Point) {
        if (this.selectedIndices.size > 0) {
            const sel = [...this.selectedIndices].map(i => this.strokes[i]);
            if (sel.some(s => s.points.some(p => dist(p, pt) < 8))) {
                this.moveStart = pt;
                this.moveOriginStrokes = sel.map(s => s.points.map(p => ({...p})));
                return;
            }
        }
        this.selectedIndices.clear();
        this.selectStart = pt;
        this.selectRect = { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
    }
    private selectMove(pt: Point) {
        if (this.moveStart && this.moveOriginStrokes) {
            const dx = pt.x - this.moveStart.x, dy = pt.y - this.moveStart.y;
            const indices = [...this.selectedIndices];
            for (let j=0; j<indices.length; j++) {
                const orig = this.moveOriginStrokes[j];
                const s = this.strokes[indices[j]];
                s.points = orig.map(p => ({ x: p.x+dx, y: p.y+dy }));
            }
            this.renderAllStrokes();
            return;
        }
        if (this.selectRect) { this.selectRect.x2 = pt.x; this.selectRect.y2 = pt.y; this.renderAllStrokes(); }
    }
    private selectUp(pt: Point) {
        if (this.moveStart && this.moveOriginStrokes) {
            if (Math.abs(pt.x-this.moveStart.x)>1 || Math.abs(pt.y-this.moveStart.y)>1) { this.pushUndo(); this.saveStrokes(); }
            this.moveStart = null; this.moveOriginStrokes = null;
            this.renderAllStrokes();
            return;
        }
        if (this.selectRect) {
            for (let i=0; i<this.strokes.length; i++) {
                if (strokeInRect(this.strokes[i], this.selectRect.x1, this.selectRect.y1, this.selectRect.x2, this.selectRect.y2))
                    this.selectedIndices.add(i);
            }
            this.selectRect = null; this.selectStart = null;
            this.renderAllStrokes();
        }
    }

    // ============= Arrow =============
    private arrowDown(pt: Point) {
        this.previewStroke = {
            points: [pt, pt],
            color: this.currentColor,
            lineWidth: this.currentLineWidth,
            opacity: this.currentOpacity,
            timestamp: Date.now(),
            type: "arrow",
            arrowStyle: this.currentArrowStyle,
        };
    }
    private arrowMove(pt: Point) {
        if (!this.previewStroke) return;
        this.previewStroke.points[1] = pt;
        this.renderAllStrokes();
    }
    private arrowUp(pt: Point) {
        if (!this.previewStroke) return;
        this.previewStroke.points[1] = pt;
        if (dist(this.previewStroke.points[0], pt) > 3) {
            this.pushUndo();
            this.strokes.push({ ...this.previewStroke, arrowStyle: this.currentArrowStyle });
            this.saveStrokes();
        }
        this.previewStroke = null;
        this.renderAllStrokes();
    }

    // ============= Rect =============
    private rectDown(pt: Point) {
        this.previewStroke = {
            points: [pt, pt],
            color: this.currentColor,
            lineWidth: this.currentLineWidth,
            opacity: this.currentOpacity,
            timestamp: Date.now(),
            type: "rect",
        };
    }
    private rectMove(pt: Point) {
        if (!this.previewStroke) return;
        this.previewStroke.points[1] = pt;
        this.renderAllStrokes();
    }
    private rectUp(pt: Point) {
        if (!this.previewStroke) return;
        this.previewStroke.points[1] = pt;
        const [a,b] = this.previewStroke.points;
        if (Math.abs(b.x-a.x)>3 || Math.abs(b.y-a.y)>3) {
            this.pushUndo();
            this.strokes.push({ ...this.previewStroke });
            this.saveStrokes();
        }
        this.previewStroke = null;
        this.renderAllStrokes();
    }

    // ============= 完成 =============
    private finishStroke() {
        if (!this.activeStroke || this.activeStroke.points.length < 2) { this.activeStroke = null; return; }
        this.pushUndo();
        this.strokes.push(this.activeStroke);
        this.activeStroke = null;
        this.saveStrokes();
    }

    private async deleteSelected() {
        if (this.selectedIndices.size === 0) return;
        this.pushUndo();
        const sorted = [...this.selectedIndices].sort((a,b)=>b-a);
        for (const i of sorted) this.strokes.splice(i,1);
        this.selectedIndices.clear();
        this.renderAllStrokes();
        await this.saveStrokes();
    }

    // ============= 绘制（改进箭头） =============
    private drawPerfectFreehand(ctx: CanvasRenderingContext2D, stroke: Stroke) {
        if (stroke.points.length < 2) return;
        const outline = getStroke(
            stroke.points.map(p => [p.x, p.y] as [number, number]),
            { ...FREEHAND_OPTIONS, size: stroke.lineWidth * 2.2 }
        );
        if (!outline.length) return;
        ctx.save();
        ctx.globalAlpha = stroke.opacity ?? 1;
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.moveTo(outline[0][0], outline[0][1]);
        for (let i=1; i<outline.length; i++) ctx.lineTo(outline[i][0], outline[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    private drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(
            to.x - size * Math.cos(angle - Math.PI/6),
            to.y - size * Math.sin(angle - Math.PI/6)
        );
        ctx.lineTo(
            to.x - size * Math.cos(angle + Math.PI/6),
            to.y - size * Math.sin(angle + Math.PI/6)
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    private drawArrowStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
        if (stroke.points.length < 2) return;
        const [p1, p2] = stroke.points;
        const style = stroke.arrowStyle || "straight";
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.globalAlpha = stroke.opacity ?? 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 虚线或双向箭头
        if (style === "dashed") ctx.setLineDash([8, 4]);
        else ctx.setLineDash([]);

        // 绘制路径
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

        // 绘制箭头头部
        const headSize = Math.max(6, stroke.lineWidth * 4);
        this.drawArrowHead(ctx, p1, p2, stroke.color, headSize);
        if (style === "double") {
            this.drawArrowHead(ctx, p2, p1, stroke.color, headSize);
        }
        ctx.restore();
    }

    private drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, highlight: boolean) {
        if (stroke.type === "freehand") {
            if (highlight) {
                const xs = stroke.points.map(p => p.x), ys = stroke.points.map(p => p.y);
                const mX = Math.min(...xs), mY = Math.min(...ys), MX = Math.max(...xs), MY = Math.max(...ys);
                ctx.save();
                ctx.strokeStyle = "#3399ff";
                ctx.lineWidth = 2;
                ctx.setLineDash([6,3]);
                ctx.strokeRect(mX-6, mY-6, MX-mX+12, MY-mY+12);
                ctx.setLineDash([]);
                ctx.restore();
            }
            this.drawPerfectFreehand(ctx, stroke);
        } else if (stroke.type === "arrow") {
            this.drawArrowStroke(ctx, stroke);
        } else if (stroke.type === "rect") {
            const [a,b] = stroke.points;
            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.lineWidth;
            ctx.globalAlpha = stroke.opacity ?? 1;
            ctx.beginPath();
            ctx.rect(Math.min(a.x,b.x), Math.min(a.y,b.y), Math.abs(b.x-a.x), Math.abs(b.y-a.y));
            ctx.stroke();
            ctx.restore();
        } else if (stroke.type === "text") {
            ctx.save();
            ctx.fillStyle = stroke.color;
            ctx.globalAlpha = stroke.opacity ?? 1;
            ctx.font = `${stroke.fontSize || 16}px sans-serif`;
            ctx.fillText(stroke.text || "", stroke.points[0].x, stroke.points[0].y);
            ctx.restore();
        }

        if (highlight && stroke.type !== "freehand") {
            // 简单高亮框
            const pts = stroke.points;
            const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
            const mX = Math.min(...xs), mY = Math.min(...ys), MX = Math.max(...xs), MY = Math.max(...ys);
            ctx.save();
            ctx.strokeStyle = "#3399ff";
            ctx.lineWidth = 2;
            ctx.setLineDash([6,3]);
            ctx.strokeRect(mX-4, mY-4, MX-mX+8, MY-mY+8);
            ctx.setLineDash([]);
            ctx.restore();
        }
    }

    private renderAllStrokes() {
        if (!this.ctx || !this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width/dpr, this.canvas.height/dpr);
        for (let i=0; i<this.strokes.length; i++) {
            this.drawStroke(this.ctx, this.strokes[i], this.selectedIndices.has(i));
        }
        if (this.activeStroke) this.drawStroke(this.ctx, this.activeStroke, false);
        if (this.previewStroke) this.drawStroke(this.ctx, this.previewStroke, false);
        if (this.selectRect) {
            const {x1,y1,x2,y2} = this.selectRect;
            this.ctx.save();
            this.ctx.strokeStyle = "#3399ff"; this.ctx.lineWidth=1.5;
            this.ctx.setLineDash([6,3]);
            this.ctx.strokeRect(Math.min(x1,x2), Math.min(y1,y2), Math.abs(x2-x1), Math.abs(y2-y1));
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }
    }

    // ============= 存储（同级目录 draft-paper 文件夹） =============
    private getDraftDir(): string {
        if (!this.currentFilePath) return "";
        const idx = this.currentFilePath.lastIndexOf("/");
        const dir = idx>=0 ? this.currentFilePath.substring(0, idx) : "";
        return dir ? `${dir}/draft-paper` : "draft-paper";
    }
    private getDraftFileName(): string {
        if (!this.currentFilePath) return "";
        const idx = this.currentFilePath.lastIndexOf("/");
        const name = idx>=0 ? this.currentFilePath.substring(idx+1) : this.currentFilePath;
        return name.replace(/\.md$/i, ".json");
    }
    private async loadStrokes() {
        const dir = this.getDraftDir(); const fn = this.getDraftFileName();
        if (!dir || !fn) { this.strokes = []; return; }
        try {
            const raw = await this.app.vault.adapter.read(`${dir}/${fn}`);
            this.strokes = JSON.parse(raw);
        } catch { this.strokes = []; }
    }
    private async saveStrokes() {
        const dir = this.getDraftDir(); const fn = this.getDraftFileName();
        if (!dir || !fn) return;
        try { await this.app.vault.adapter.mkdir(dir); } catch {}
        try { await this.app.vault.adapter.write(`${dir}/${fn}`, JSON.stringify(this.strokes)); } catch(e) {
            console.error("save failed", e);
            new Notice("保存失败");
        }
    }

    private async syncCurrentFile() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view?.file) return;
        if (view.file.path === this.currentFilePath) return;
        if (this.currentFilePath) await this.saveStrokes();
        this.currentFilePath = view.file.path;
        this.undoStack = [];
        this.selectedIndices.clear(); this.selectRect = null;
        await this.loadStrokes();
        this.activeStroke = null;
        this.renderAllStrokes();
    }

    // ============= 撤销 =============
    private pushUndo() {
        this.undoStack.push(this.strokes.map(s => ({...s, points: s.points.map(p=>({...p}))})));
        if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
    }
    private async undo() {
        if (!this.undoStack.length) return;
        this.strokes = this.undoStack.pop()!;
        this.selectedIndices.clear();
        this.renderAllStrokes();
        await this.saveStrokes();
    }
}