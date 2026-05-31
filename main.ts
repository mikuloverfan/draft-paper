import { Plugin, MarkdownView, Notice, Modal } from "obsidian";
import { getStroke } from "perfect-freehand";

// ============================================================
//  类型定义
// ============================================================
interface Point { x: number; y: number; }

interface Stroke {
    type: "pen" | "highlighter" | "arrow" | "rect" | "text";
    blockKey: string;
    points: Point[];
    color: string;
    lineWidth: number;
    opacity: number;
    timestamp: number;
    text?: string;
    fontSize?: number;
    arrowStyle?: ArrowStyle;
}

type ArrowStyle = "straight" | "curved" | "dashed" | "double";
type ToolMode = "pen" | "highlighter" | "eraser" | "arrow" | "rect" | "text" | "hand";
type EraserMode = "stroke" | "clear-all";

const DEFAULT_COLOR = "#ff3333";
const DEFAULT_LINE_WIDTH = 2.5;
const HIGHLIGHTER_COLOR = "#ffeb3b";
const HIGHLIGHTER_OPACITY = 0.25;
const ERASER_HIT_DISTANCE = 15;
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
const ARROW_HEAD_SIZE = 12;
const BLOCK_SELECTORS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, .math-block, .callout";

function getBlockKey(el: HTMLElement): string {
    return el.textContent?.trim().substring(0, 60) || "";
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function dist(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }

export default class DraftPaperPlugin extends Plugin {
    private active = false;
    private isDrawing = true;
    private tool: ToolMode = "pen";
    private eraserMode: EraserMode = "stroke";
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private strokes: Stroke[] = [];
    private currentStroke: Stroke | null = null;
    private previewStroke: Stroke | null = null;
    private toolbar: HTMLElement | null = null;
    private color = DEFAULT_COLOR;
    private lineWidth = DEFAULT_LINE_WIDTH;
    private opacity = 1;
    private arrowStyle: ArrowStyle = "straight";
    private rafPending = false;
    private currentFilePath = "";
    private undoStack: Stroke[][] = [];
    private redoStack: Stroke[][] = [];
    private readonly MAX_UNDO = 100;

    async onload() {
        this.addRibbonIcon("pencil", "草稿纸", () => this.toggle());
        this.addCommand({ id: "toggle-draft", name: "切换草稿纸", callback: () => this.toggle() });
        this.registerDomEvent(window, "scroll", this.scheduleRedraw, true);
        this.registerDomEvent(window, "resize", this.scheduleRedraw);
        this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
            if (this.active) this.scheduleRedraw();
        }));
    }

    async onunload() {
        this.disable();
    }

    private toggle() {
        if (this.active) { this.disable(); } else { this.enable(); }
    }

    private enable() {
        if (this.active) return;
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) { new Notice("请先打开一个 Markdown 文件进入阅读模式"); return; }
        if (view.getMode() !== "preview") {
            (this.app as any).commands.executeCommandById("markdown:toggle-preview");
            setTimeout(() => this.enable(), 200);
            return;
        }
        this.currentFilePath = view.file?.path || "";
        this.loadStrokes();
        this.init();
    }

    private init() {
        const canvas = document.createElement("canvas");
        canvas.id = "draft-paper-canvas";
        Object.assign(canvas.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            zIndex: "5",
            pointerEvents: this.isDrawing ? "auto" : "none",
            touchAction: "none",
            background: "transparent",
        });
        document.body.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.syncCanvasSize();

        canvas.addEventListener("pointerdown", this.onPointerDown);
        canvas.addEventListener("pointermove", this.onPointerMove);
        canvas.addEventListener("pointerup", this.onPointerUp);
        canvas.addEventListener("pointerleave", this.onPointerUp);

        this.createToolbar();
        this.active = true;
        this.isDrawing = true;
        this.tool = "pen";
        this.eraserMode = "stroke";
        this.updateModeUI();
        this.scheduleRedraw();
    }

    private disable() {
        if (!this.active) return;
        this.saveStrokes();
        if (this.canvas) {
            this.canvas.removeEventListener("pointerdown", this.onPointerDown);
            this.canvas.removeEventListener("pointermove", this.onPointerMove);
            this.canvas.removeEventListener("pointerup", this.onPointerUp);
            this.canvas.removeEventListener("pointerleave", this.onPointerUp);
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
        if (this.toolbar) { this.toolbar.remove(); this.toolbar = null; }
        this.strokes = [];
        this.currentStroke = null;
        this.active = false;
    }

    private syncCanvasSize() {
        if (!this.canvas || !this.ctx) return;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    // ==================== 工具栏 ====================
    private createToolbar() {
        const bar = document.createElement("div");
        bar.id = "draft-paper-toolbar";
        bar.innerHTML = `
            <div class="dp-tool-group">
                <button data-t="pen" class="active" title="画笔 (1)">✏️</button>
                <button data-t="highlighter" title="荧光笔 (2)">🖍️</button>
                <button data-t="eraser" title="橡皮擦 (3)">🧹</button>
                <button data-t="arrow" title="箭头 (4)">↗</button>
                <button data-t="rect" title="矩形 (5)">⬛</button>
                <button data-t="text" title="文字 (6)">T</button>
                <button data-t="hand" title="手掌 (7)">🖐️</button>
            </div>
            <div class="dp-style-group">
                <input type="color" id="dp-color" value="${this.color}" title="颜色">
                <input type="range" id="dp-width" min="1" max="8" step="0.5" value="${this.lineWidth}" title="粗细">
                <span id="dp-wlbl">${this.lineWidth}px</span>
                <input type="range" id="dp-opacity" min="10" max="100" value="${this.opacity * 100}" title="透明度">
                <span id="dp-olbl">${Math.round(this.opacity * 100)}%</span>
                <select id="dp-arrow-style" style="display:none">
                    <option value="straight" selected>→</option>
                    <option value="curved">↝</option>
                    <option value="dashed">⇢</option>
                    <option value="double">↔</option>
                </select>
            </div>
            <div class="dp-mode-group">
                <button id="dp-mode" class="dp-text-btn">🟢 绘图</button>
                <button id="dp-undo" title="撤销 (Ctrl+Z)">↩</button>
                <button id="dp-redo" title="重做 (Ctrl+Shift+Z)">↪</button>
                <button id="dp-clear" title="清空画布">🗑</button>
                <button id="dp-exit" title="退出草稿纸">❌</button>
            </div>
        `;
        document.body.appendChild(bar);
        this.toolbar = bar;

        bar.querySelectorAll("[data-t]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const tool = (btn as HTMLElement).dataset.t as ToolMode;
                if (tool === "eraser") {
                    this.eraserMode = this.eraserMode === "stroke" ? "clear-all" : "stroke";
                    new Notice(this.eraserMode === "stroke" ? "整笔擦除" : "清空全部");
                } else {
                    this.tool = tool;
                    this.eraserMode = "stroke";
                    if (tool === "hand") {
                        this.canvas!.style.pointerEvents = "none";
                    } else if (this.isDrawing) {
                        this.canvas!.style.pointerEvents = "auto";
                    }
                }
                this.resetToolState();
                this.updateToolbarActive();
            });
        });

        document.getElementById("dp-mode")!.onclick = () => this.toggleDrawMode();
        document.getElementById("dp-undo")!.onclick = () => this.undo();
        document.getElementById("dp-redo")!.onclick = () => this.redo();
        document.getElementById("dp-clear")!.onclick = () => this.confirmClearAll();
        document.getElementById("dp-exit")!.onclick = () => this.disable();

        document.getElementById("dp-color")!.addEventListener("input", e => {
            this.color = (e.target as HTMLInputElement).value;
        });
        document.getElementById("dp-width")!.addEventListener("input", e => {
            this.lineWidth = parseFloat((e.target as HTMLInputElement).value);
            document.getElementById("dp-wlbl")!.textContent = `${this.lineWidth}px`;
        });
        document.getElementById("dp-opacity")!.addEventListener("input", e => {
            this.opacity = parseInt((e.target as HTMLInputElement).value) / 100;
            document.getElementById("dp-olbl")!.textContent = `${Math.round(this.opacity * 100)}%`;
        });
        document.getElementById("dp-arrow-style")!.addEventListener("change", e => {
            this.arrowStyle = (e.target as HTMLSelectElement).value as ArrowStyle;
        });
    }

    private updateToolbarActive() {
        this.toolbar?.querySelectorAll("[data-t]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.t === this.tool);
        });
        const arrowSelect = document.getElementById("dp-arrow-style");
        if (arrowSelect) arrowSelect.style.display = this.tool === "arrow" ? "inline" : "none";
    }

    private toggleDrawMode() {
        this.isDrawing = !this.isDrawing;
        if (this.canvas) {
            this.canvas.style.pointerEvents = this.isDrawing ? "auto" : "none";
            this.canvas.style.cursor = this.isDrawing ? "crosshair" : "default";
        }
        this.updateModeUI();
    }

    private updateModeUI() {
        const btn = document.getElementById("dp-mode");
        if (!btn) return;
        btn.textContent = this.isDrawing ? "🟢 绘图" : "👁 阅读";
        if (!this.isDrawing) btn.classList.add("active");
        else btn.classList.remove("active");
    }

    private resetToolState() {
        this.currentStroke = null;
        this.previewStroke = null;
        this.scheduleRedraw();
    }

    // ==================== 穿透 canvas ====================
    private getBlockFromPoint(x: number, y: number): HTMLElement | null {
        if (!this.canvas) return null;
        const prevPE = this.canvas.style.pointerEvents;
        this.canvas.style.pointerEvents = "none";
        const elem = document.elementFromPoint(x, y);
        this.canvas.style.pointerEvents = prevPE;
        if (!elem) return null;
        return (elem as HTMLElement).closest(BLOCK_SELECTORS) as HTMLElement | null;
    }

    // ==================== 事件处理 ====================
    private onPointerDown = (e: PointerEvent) => {
        if (!this.active || !this.isDrawing) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();

        const block = this.getBlockFromPoint(e.clientX, e.clientY);
        if (!block) return;

        const rect = block.getBoundingClientRect();
        const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (this.tool === "hand") return;

        if (this.tool === "eraser") {
            if (this.eraserMode === "stroke") { this.eraseAt(block, p, rect); }
            else { this.clearAll(); }
            return;
        }

        if (this.tool === "text") { this.textAt(block, p); return; }

        if (this.tool === "pen" || this.tool === "highlighter") {
            this.currentStroke = {
                type: this.tool === "pen" ? "pen" : "highlighter",
                blockKey: getBlockKey(block),
                points: [p],
                color: this.tool === "highlighter" ? HIGHLIGHTER_COLOR : this.color,
                lineWidth: this.lineWidth,
                opacity: this.tool === "highlighter" ? HIGHLIGHTER_OPACITY : this.opacity,
                timestamp: Date.now(),
            };
        } else if (this.tool === "arrow" || this.tool === "rect") {
            this.previewStroke = {
                type: this.tool,
                blockKey: getBlockKey(block),
                points: [p, p],
                color: this.color,
                lineWidth: this.lineWidth,
                opacity: this.opacity,
                timestamp: Date.now(),
                arrowStyle: this.tool === "arrow" ? this.arrowStyle : undefined,
            };
        }
        this.scheduleRedraw();
    };

    private onPointerMove = (e: PointerEvent) => {
        if (!this.active || !this.isDrawing) return;

        const block = this.getBlockFromPoint(e.clientX, e.clientY);
        if (!block) return;

        const rect = block.getBoundingClientRect();
        const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (this.tool === "eraser" && this.eraserMode === "stroke" && e.buttons === 1) {
            this.eraseAt(block, p, rect);
            return;
        }

        if (this.previewStroke) {
            if (getBlockKey(block) !== this.previewStroke.blockKey) return;
            this.previewStroke.points[1] = p;
            this.scheduleRedraw();
            return;
        }

        if (!this.currentStroke) return;
        if (getBlockKey(block) !== this.currentStroke.blockKey) return;

        const last = this.currentStroke.points.at(-1)!;
        const filtered = {
            x: last.x + (p.x - last.x) * 0.35,
            y: last.y + (p.y - last.y) * 0.35,
        };
        if (dist(filtered, last) < 1) return;
        this.currentStroke.points.push(filtered);
        this.scheduleRedraw();
    };

    private onPointerUp = () => {
        if (!this.active || !this.isDrawing) return;

        if (this.previewStroke) {
            const [a, b] = this.previewStroke.points;
            if (dist(a, b) > 3) {
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
    };

    // ==================== 工具 ====================
    private eraseAt(block: HTMLElement, p: Point, rect: DOMRect) {
        const key = getBlockKey(block);
        const absPt = { x: p.x + rect.left, y: p.y + rect.top };
        this.strokes = this.strokes.filter(s => {
            if (s.blockKey !== key) return true;
            return !s.points.some(pt => dist({ x: pt.x + rect.left, y: pt.y + rect.top }, absPt) < ERASER_HIT_DISTANCE);
        });
        this.scheduleRedraw();
        this.saveStrokes();
    }

    private clearAll() {
        if (this.strokes.length === 0) return;
        this.pushUndo();
        this.strokes = [];
        this.scheduleRedraw();
        this.saveStrokes();
        new Notice("画布已清空，可按 Ctrl+Z 恢复");
    }

    private confirmClearAll() {
        const modal = new Modal(this.app);
        modal.titleEl.setText("确认清空");
        modal.contentEl.createEl("p", { text: "清空当前文件所有批注？" });
        const btns = modal.contentEl.createDiv();
        btns.createEl("button", { text: "确认" }).addEventListener("click", () => {
            this.clearAll();
            modal.close();
        });
        btns.createEl("button", { text: "取消" }).addEventListener("click", () => modal.close());
        modal.open();
    }

    private textAt(block: HTMLElement, p: Point) {
        const rect = block.getBoundingClientRect();
        const input = document.createElement("textarea");
        Object.assign(input.style, {
            position: "fixed",
            left: `${rect.left + p.x}px`,
            top: `${rect.top + p.y}px`,
            zIndex: "10002",
            minWidth: "80px",
            border: "1px dashed var(--interactive-accent)",
            background: "var(--background-primary)",
            padding: "4px",
            fontSize: "16px",
            resize: "both",
        });
        document.body.appendChild(input);
        input.focus();

        const done = () => {
            const text = input.value.trim();
            input.remove();
            if (text) {
                this.pushUndo();
                this.strokes.push({
                    type: "text", blockKey: getBlockKey(block), points: [p],
                    color: this.color, lineWidth: this.lineWidth,
                    opacity: this.opacity, timestamp: Date.now(),
                    text, fontSize: 16,
                });
                this.saveStrokes();
                this.scheduleRedraw();
            }
        };
        input.addEventListener("blur", done);
        input.addEventListener("keydown", e => {
            if (e.key === "Escape") input.remove();
            else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); done(); }
        });
    }

    // ==================== 渲染 ====================
    private scheduleRedraw = () => {
        if (!this.rafPending) {
            this.rafPending = true;
            requestAnimationFrame(() => {
                this.rafPending = false;
                this.syncCanvasSize();
                this.redraw();
            });
        }
    };

    private redraw() {
        if (!this.ctx || !this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

        const blockMap = new Map<string, DOMRect>();
        document.querySelectorAll(BLOCK_SELECTORS).forEach(el => {
            const key = getBlockKey(el as HTMLElement);
            if (key) blockMap.set(key, (el as HTMLElement).getBoundingClientRect());
        });

        for (const s of this.strokes) {
            const rect = blockMap.get(s.blockKey);
            if (rect) this.drawStroke(s, rect);
        }

        if (this.currentStroke) {
            const rect = blockMap.get(this.currentStroke.blockKey);
            if (rect) this.drawStroke(this.currentStroke, rect);
        }

        if (this.previewStroke) {
            const rect = blockMap.get(this.previewStroke.blockKey);
            if (rect) this.drawStroke(this.previewStroke, rect);
        }
    }

    private drawStroke(stroke: Stroke, blockRect: DOMRect) {
        if (!this.ctx || stroke.points.length < 1) return;

        const absPts = stroke.points.map(p => ({ x: p.x + blockRect.left, y: p.y + blockRect.top }));

        if (stroke.type === "pen" || stroke.type === "highlighter") {
            const outline = getStroke(
                absPts.map(p => [p.x, p.y] as [number, number]),
                { ...FREEHAND_OPTIONS, size: stroke.lineWidth * 2.2 }
            );
            if (!outline.length) return;
            const ctx = this.ctx;
            ctx.save();
            if (stroke.type === "highlighter") ctx.globalCompositeOperation = "multiply";
            ctx.globalAlpha = stroke.opacity;
            ctx.fillStyle = stroke.color;
            ctx.beginPath();
            ctx.moveTo(outline[0][0], outline[0][1]);
            for (let i = 1; i < outline.length; i++) ctx.lineTo(outline[i][0], outline[i][1]);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else if (stroke.type === "arrow") {
            this.drawArrowStroke(stroke, blockRect);
        } else if (stroke.type === "rect") {
            const [a, b] = absPts;
            const ctx = this.ctx;
            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.lineWidth;
            ctx.globalAlpha = stroke.opacity;
            ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
            ctx.restore();
        } else if (stroke.type === "text") {
            const pt = absPts[0];
            const ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = stroke.color;
            ctx.globalAlpha = stroke.opacity;
            ctx.font = `${stroke.fontSize || 16}px sans-serif`;
            ctx.fillText(stroke.text || "", pt.x, pt.y);
            ctx.restore();
        }
    }

    private drawArrowStroke(stroke: Stroke, blockRect: DOMRect) {
        if (!this.ctx) return;
        const [a, b] = stroke.points.map(p => ({ x: p.x + blockRect.left, y: p.y + blockRect.top }));
        const style = stroke.arrowStyle || "straight";
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.lineWidth;
        ctx.globalAlpha = stroke.opacity;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (style === "dashed") ctx.setLineDash([8, 4]);
        ctx.beginPath();
        if (style === "curved") {
            const cx = (a.x + b.x) / 2 + (b.y - a.y) * 0.2;
            const cy = (a.y + b.y) / 2 - (b.x - a.x) * 0.2;
            ctx.moveTo(a.x, a.y);
            ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        } else {
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        const headSize = Math.max(6, stroke.lineWidth * 4);
        this.drawArrowHead(ctx, a, b, stroke.color, headSize);
        if (style === "double") this.drawArrowHead(ctx, b, a, stroke.color, headSize);
        ctx.restore();
    }

    private drawArrowHead(ctx: CanvasRenderingContext2D, from: Point, to: Point, color: string, size: number) {
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
    private getDraftDir(): string {
        if (!this.currentFilePath) return "";
        const idx = this.currentFilePath.lastIndexOf("/");
        const dir = idx >= 0 ? this.currentFilePath.substring(0, idx) : "";
        return dir ? `${dir}/draft-paper` : "draft-paper";
    }

    private getDraftFileName(): string {
        if (!this.currentFilePath) return "";
        const idx = this.currentFilePath.lastIndexOf("/");
        const name = idx >= 0 ? this.currentFilePath.substring(idx + 1) : this.currentFilePath;
        return name.replace(/\.md$/i, ".json");
    }

    private async loadStrokes() {
        if (!this.currentFilePath) { this.strokes = []; return; }
        const path = `${this.getDraftDir()}/${this.getDraftFileName()}`;
        try { this.strokes = JSON.parse(await this.app.vault.adapter.read(path)); }
        catch { this.strokes = []; }
    }

    private async saveStrokes() {
        if (!this.currentFilePath) return;
        const path = `${this.getDraftDir()}/${this.getDraftFileName()}`;
        try { await this.app.vault.adapter.mkdir(this.getDraftDir()); } catch {}
        try { await this.app.vault.adapter.write(path, JSON.stringify(this.strokes)); }
        catch (err) { console.error("草稿保存失败:", err); }
    }

    // ==================== 撤销/重做 ====================
    private pushUndo() {
        this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
        if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
        this.redoStack = [];
    }

    private undo() {
        if (this.undoStack.length === 0) return;
        this.redoStack.push(JSON.parse(JSON.stringify(this.strokes)));
        this.strokes = this.undoStack.pop()!;
        this.scheduleRedraw();
        this.saveStrokes();
    }

    private redo() {
        if (this.redoStack.length === 0) return;
        this.undoStack.push(JSON.parse(JSON.stringify(this.strokes)));
        this.strokes = this.redoStack.pop()!;
        this.scheduleRedraw();
        this.saveStrokes();
    }
}