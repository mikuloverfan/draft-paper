import { Plugin, MarkdownView, Notice, Modal } from "obsidian";
import { getStroke } from "perfect-freehand";

// ============================================================
//  类型定义
// ============================================================

interface Point {
    x: number;
    y: number;
}

type ArrowStyle = "straight" | "curved" | "dashed" | "double";
type ToolMode = "pen" | "eraser" | "select" | "arrow" | "rect" | "text";
type DraftMode = "DRAW" | "POINTER" | "HIDDEN";
type EraserMode = "stroke" | "clear-selected" | "clear-all";

interface Stroke {
    points: Point[];
    color: string;
    lineWidth: number;
    opacity: number;
    timestamp: number;
    type: "freehand" | "arrow" | "rect" | "text";
    text?: string;
    fontSize?: number;
    arrowStyle?: ArrowStyle;
}

// ============================================================
//  常量
// ============================================================

const DEFAULT_COLOR = "#ff3333";
const DEFAULT_LINE_WIDTH = 2.5;
const DEFAULT_OPACITY = 1;
const ERASER_HIT_DISTANCE = 12;           // 整笔擦除阈值
const ERASER_CURSOR_SIZE = 24;

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

const ARROW_STYLES: ArrowStyle[] = ["straight", "curved", "dashed", "double"];
const ARROW_HEAD_SIZE = 12;

// ============================================================
//  辅助函数
// ============================================================

function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

function dist(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function distToSegment(p: Point, a: Point, b: Point): number {
    const dx = b.x - a.x, dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return dist(p, a);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

// 点到整条笔画的最近距离
function pointToStrokeDist(p: Point, stroke: Stroke): number {
    let minDist = Infinity;
    for (let i = 0; i < stroke.points.length - 1; i++) {
        const d = distToSegment(p, stroke.points[i], stroke.points[i + 1]);
        if (d < minDist) minDist = d;
    }
    if (stroke.points.length === 1) {
        minDist = dist(p, stroke.points[0]);
    }
    return minDist;
}

function strokeInRect(s: Stroke, x1: number, y1: number, x2: number, y2: number): boolean {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    return s.points.some(p => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
}

// ============================================================
//  插件主体
// ============================================================

export default class DraftPaperPlugin extends Plugin {
    // DOM 元素
    private overlay: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private toolbarContainer: HTMLElement | null = null;      // 独立工具栏容器
    private eraserCursorEl: HTMLElement | null = null;
    private eraserSubToolbarEl: HTMLElement | null = null;
    private eraserBtnEl: HTMLElement | null = null;

    // 状态
    private isActive = false;
    private draftMode: DraftMode = "DRAW";
    private toolMode: ToolMode = "pen";
    private eraserMode: EraserMode = "stroke";

    private currentFilePath = "";
    private strokes: Stroke[] = [];
    private activeStroke: Stroke | null = null;
    private currentColor = DEFAULT_COLOR;
    private currentLineWidth = DEFAULT_LINE_WIDTH;
    private currentOpacity = DEFAULT_OPACITY;
    private currentArrowStyle: ArrowStyle = "straight";

    // 临时透传标记
    private tempPointer = false;

    // 选择系统
    private selectedIndices: Set<number> = new Set();
    private selectRect: { x1: number; y1: number; x2: number; y2: number } | null = null;
    private selectStart: Point | null = null;
    private moveStart: Point | null = null;
    private moveOriginStrokes: Point[][] | null = null;

    // 预览（箭头/矩形）
    private previewStroke: Stroke | null = null;

    // 撤销栈
    private undoStack: Stroke[][] = [];
    private readonly MAX_UNDO = 50;

    // 低通滤波（手写平滑）
    private lastFilteredPt: Point | null = null;

    // 事件引用
    private boundPointerDown: (e: PointerEvent) => void;
    private boundPointerMove: (e: PointerEvent) => void;
    private boundPointerUp: (e: PointerEvent) => void;
    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;

    constructor(app: any, manifest: any) {
        super(app, manifest);
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
            callback: () => this.toggleDraftMode(),
        });
        this.addCommand({
            id: "exit-draft-mode-force",
            name: "Exit Draft Mode (Force)",
            callback: async () => this.setDraftMode("HIDDEN"),
        });
        this.addRibbonIcon("pencil", "Toggle Draft Paper", () => this.toggleDraftMode());

        this.registerEvent(
            this.app.workspace.on("active-leaf-change", () => this.syncCurrentFile()),
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
    private createOverlay() {
        this.detachOverlay();

        // Overlay 仅包含 canvas 和橡皮擦光标
        this.overlay = document.createElement("div");
        this.overlay.className = "draft-paper-overlay";
        this.overlay.style.display = "none";

        this.canvas = document.createElement("canvas");
        this.canvas.className = "draft-paper-canvas";
        this.canvas.tabIndex = 0;
        this.ctx = this.canvas.getContext("2d")!;
        this.overlay.appendChild(this.canvas);

        // 橡皮擦光标（在 overlay 内，但位置独立）
        this.eraserCursorEl = document.createElement("div");
        this.eraserCursorEl.className = "draft-paper-eraser-cursor";
        this.eraserCursorEl.style.display = "none";
        this.overlay.appendChild(this.eraserCursorEl);

        document.body.appendChild(this.overlay);

        // 工具栏独立容器，挂载到 body，与 overlay 平级
        this.toolbarContainer = document.createElement("div");
        this.toolbarContainer.className = "draft-paper-toolbar-container";
        document.body.appendChild(this.toolbarContainer);
        this.buildToolbar();

        // resize 监听
        this.registerDomEvent(window, "resize", () => {
            this.resizeCanvas();
            this.renderAllStrokes();
        });
    }

    private detachOverlay() {
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

    private resizeCanvas() {
        if (!this.canvas || !this.ctx) return;
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
    private buildToolbar() {
        if (!this.toolbarContainer) return;
        this.toolbarContainer.innerHTML = `
            <div class="draft-paper-toolbar">
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
                    <span class="draft-paper-opacity-label">${Math.round(this.currentOpacity * 100)}%</span>
                    <span class="draft-paper-arrow-style" style="display:${this.toolMode === "arrow" ? "inline" : "none"}">样式: ${this.currentArrowStyle}</span>
                </div>
                <div class="draft-paper-mode-buttons">
                    <button data-mode="DRAW" title="绘图模式">✏️</button>
                    <button data-mode="POINTER" title="透传模式 (按住 Space 临时切换)">🖱️</button>
                    <button data-mode="HIDDEN" title="隐藏草稿纸">👁</button>
                </div>
                <button class="draft-paper-undo-btn" title="撤销 (Ctrl+Z)">↩</button>
                <button class="draft-paper-clear-btn" title="清屏 (Ctrl+Shift+Z)">🗑️</button>
            </div>
        `;

        // 橡皮擦子工具栏（隐藏状态）
        this.eraserSubToolbarEl = document.createElement("div");
        this.eraserSubToolbarEl.className = "draft-paper-eraser-subtoolbar";
        this.eraserSubToolbarEl.innerHTML = `
            <button data-eraser="stroke" class="active">整笔删除</button>
            <button data-eraser="clear-selected">删除选中</button>
            <button data-eraser="clear-all">清空全部</button>
        `;
        this.eraserSubToolbarEl.style.display = "none";
        this.toolbarContainer.appendChild(this.eraserSubToolbarEl);

        // 获取引用并绑定事件
        this.eraserBtnEl = this.toolbarContainer.querySelector('[data-tool="eraser"]');
        this.bindToolbarEvents();
    }

    private bindToolbarEvents() {
        // 阻止工具栏容器上的事件冒泡（但不影响子工具栏独立交互）
        this.toolbarContainer!.addEventListener("pointerdown", e => e.stopPropagation());

        // 工具按钮
        this.toolbarContainer!.querySelectorAll("[data-tool]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const tool = (btn as HTMLElement).dataset.tool as ToolMode;

                if (tool === "eraser") {
                    // 切换子工具栏显示
                    if (this.toolMode === "eraser") {
                        const isVisible = this.eraserSubToolbarEl!.style.display !== "none";
                        this.eraserSubToolbarEl!.style.display = isVisible ? "none" : "flex";
                    } else {
                        this.toolMode = "eraser";
                        this.eraserMode = "stroke";           // 默认整笔删除
                        this.eraserSubToolbarEl!.style.display = "flex";
                    }
                } else {
                    this.eraserSubToolbarEl!.style.display = "none";
                    this.toolMode = tool;
                }

                this.resetToolState();
                this.updateToolbarActive();
                this.canvas?.focus();
            });
        });

        // 橡皮擦子工具
        this.eraserSubToolbarEl?.querySelectorAll("[data-eraser]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const mode = (btn as HTMLElement).dataset.eraser as EraserMode;
                this.eraserMode = mode;

                if (mode === "clear-selected") {
                    if (this.selectedIndices.size === 0) {
                        new Notice("没有选中的元素");
                    } else {
                        this.deleteSelected();
                    }
                } else if (mode === "clear-all") {
                    this.confirmClearAll();
                }

                // 隐藏子工具栏，工具保持橡皮擦
                this.eraserSubToolbarEl!.style.display = "none";
                this.updateToolbarActive();
                this.canvas?.focus();
            });
        });

        // 模式按钮
        this.toolbarContainer!.querySelectorAll("[data-mode]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const mode = (btn as HTMLElement).dataset.mode as DraftMode;
                this.setDraftMode(mode);
            });
        });

        // 颜色选择器
        const colorPicker = this.toolbarContainer!.querySelector(".draft-paper-color-picker") as HTMLInputElement;
        colorPicker?.addEventListener("input", e => {
            this.currentColor = (e.target as HTMLInputElement).value;
        });

        // 线条粗细
        const widthSlider = this.toolbarContainer!.querySelector(".draft-paper-line-width") as HTMLInputElement;
        widthSlider?.addEventListener("input", e => {
            this.currentLineWidth = parseFloat((e.target as HTMLInputElement).value);
            const lbl = this.toolbarContainer!.querySelector(".draft-paper-line-width-label");
            if (lbl) lbl.textContent = `${this.currentLineWidth}px`;
        });

        // 透明度
        const opacitySlider = this.toolbarContainer!.querySelector(".draft-paper-opacity") as HTMLInputElement;
        opacitySlider?.addEventListener("input", e => {
            this.currentOpacity = parseInt((e.target as HTMLInputElement).value) / 100;
            const lbl = this.toolbarContainer!.querySelector(".draft-paper-opacity-label");
            if (lbl) lbl.textContent = `${Math.round(this.currentOpacity * 100)}%`;
        });

        // 撤销
        this.toolbarContainer!.querySelector(".draft-paper-undo-btn")?.addEventListener("click", e => {
            e.stopPropagation();
            this.undo();
            this.canvas?.focus();
        });

        // 清屏（直接调用，无确认，因为已有确认逻辑在其他地方）
        this.toolbarContainer!.querySelector(".draft-paper-clear-btn")?.addEventListener("click", e => {
            e.stopPropagation();
            this.confirmClearAll();
        });
    }

    private updateToolbarActive() {
        this.toolbarContainer?.querySelectorAll("[data-tool]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.tool === this.toolMode);
        });
        this.toolbarContainer?.querySelectorAll("[data-mode]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.mode === this.draftMode);
        });
        // 更新橡皮擦子工具高亮
        this.eraserSubToolbarEl?.querySelectorAll("[data-eraser]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.eraser === this.eraserMode);
        });
        // 箭头样式标签
        const arrowLabel = this.toolbarContainer?.querySelector(".draft-paper-arrow-style") as HTMLElement | null;
        if (arrowLabel) {
            arrowLabel.style.display = this.toolMode === "arrow" ? "inline" : "none";
            arrowLabel.textContent = `样式: ${this.currentArrowStyle}`;
        }
        // 橡皮擦光标显示/隐藏
        if (this.eraserCursorEl) {
            const showEraserCursor = this.isActive && this.draftMode === "DRAW" && this.toolMode === "eraser" && this.eraserMode === "stroke";
            this.eraserCursorEl.style.display = showEraserCursor ? "block" : "none";
        }
    }

    // ==========================================================
    //  模式控制（DRAW / POINTER / HIDDEN）
    // ==========================================================
    private setDraftMode(mode: DraftMode) {
        if (!this.overlay || !this.canvas) return;

        this.draftMode = mode;
        this.tempPointer = false;

        if (mode === "HIDDEN") {
            this.exitDraftMode(true);
            return;
        }

        // 确保 overlay 可见
        if (!this.isActive) {
            this.enterDraftModeSilent();
        }

        if (mode === "DRAW") {
            this.overlay.style.pointerEvents = "auto";
            this.canvas.style.pointerEvents = "auto";
            this.canvas.style.cursor = this.toolMode === "eraser" ? "none" : (this.toolMode === "text" ? "text" : "crosshair");
        } else if (mode === "POINTER") {
            this.overlay.style.pointerEvents = "none";   // 整个 overlay 穿透
            this.canvas.style.pointerEvents = "none";
            this.canvas.style.cursor = "default";
        }

        // 工具栏容器始终可交互，但隐藏状态除外
        if (this.toolbarContainer) {
            this.toolbarContainer.style.display = "flex";
        }

        this.updateToolbarActive();
        this.renderAllStrokes();
    }

    private enterDraftModeSilent() {
        if (this.isActive || !this.overlay || !this.canvas) return;
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

    private exitDraftMode(silent = false) {
        if (!this.isActive || !this.overlay || !this.canvas) return;
        if (this.activeStroke) this.finishStroke();
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
        if (!silent) new Notice("草稿纸已隐藏");
    }

    private async toggleDraftMode() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            new Notice("只在 Markdown 视图中可用");
            return;
        }
        if (view.getMode() !== "preview") {
            (this.app as any).commands.executeCommandById("markdown:toggle-preview");
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
    private resetToolState() {
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
    private onKeyDown(e: KeyboardEvent) {
        if (!this.isActive) return;

        const target = e.target as HTMLElement;
        // 避免干扰 Obsidian 原生输入
        if (target.closest("input, textarea") || target.isContentEditable) return;

        // Space 临时透传
        if (e.code === "Space" && this.draftMode === "DRAW" && !this.tempPointer) {
            e.preventDefault();
            e.stopPropagation();
            this.tempPointer = true;
            this.canvas!.style.pointerEvents = "none";
            this.canvas!.style.cursor = "default";
            return;
        }

        // 数字键切换工具
        const toolMap: Record<string, ToolMode> = {
            "1": "pen", "2": "eraser", "3": "select", "4": "arrow", "5": "rect", "6": "text",
        };
        if (toolMap[e.key]) {
            e.preventDefault(); e.stopPropagation();
            this.toolMode = toolMap[e.key];
            if (this.toolMode !== "eraser") this.eraserSubToolbarEl!.style.display = "none";
            this.resetToolState();
            this.updateToolbarActive();
            return;
        }

        // Esc
        if (e.key === "Escape") {
            e.preventDefault(); e.stopPropagation();
            if (this.selectedIndices.size > 0) {
                this.selectedIndices.clear();
                this.renderAllStrokes();
            } else {
                this.setDraftMode("HIDDEN");
            }
            return;
        }

        // Ctrl+Z 撤销
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
            e.preventDefault(); e.stopPropagation();
            this.undo();
            return;
        }

        // Ctrl+Shift+Z 清屏
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
            e.preventDefault(); e.stopPropagation();
            this.clearAll();
            return;
        }

        // Delete 删除选中
        if ((e.key === "Delete" || e.key === "Backspace") && this.selectedIndices.size > 0) {
            e.preventDefault(); e.stopPropagation();
            this.deleteSelected();
            return;
        }

        // 箭头样式切换
        if (this.toolMode === "arrow" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
            e.preventDefault();
            const idx = ARROW_STYLES.indexOf(this.currentArrowStyle);
            const next = e.key === "ArrowRight"
                ? (idx + 1) % ARROW_STYLES.length
                : (idx - 1 + ARROW_STYLES.length) % ARROW_STYLES.length;
            this.currentArrowStyle = ARROW_STYLES[next];
            this.updateToolbarActive();
        }
    }

    private onKeyUp(e: KeyboardEvent) {
        if (!this.isActive) return;
        if (e.code === "Space" && this.tempPointer) {
            this.tempPointer = false;
            if (this.draftMode === "DRAW") {
                this.canvas!.style.pointerEvents = "auto";
                this.canvas!.style.cursor = this.toolMode === "eraser" ? "none" : (this.toolMode === "text" ? "text" : "crosshair");
            }
        }
    }

    // ==========================================================
    //  坐标转换
    // ==========================================================
    private getCanvasPoint(e: PointerEvent): Point | null {
        if (!this.canvas) return null;
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    // ==========================================================
    //  指针事件路由
    // ==========================================================
    private onPointerDown(e: PointerEvent) {
        if (!this.isActive || this.draftMode !== "DRAW") return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // 排除工具栏（工具栏已独立，但安全起见再过滤）
        if ((e.target as HTMLElement)?.closest(".draft-paper-toolbar-container")) return;

        this.canvas?.focus();
        const pt = this.getCanvasPoint(e);
        if (!pt) return;

        // 文字工具
        if (this.toolMode === "text") {
            this.handleTextTool(pt);
            return;
        }

        // 橡皮擦工具：根据 eraserMode 决定行为
        if (this.toolMode === "eraser") {
            if (this.eraserMode === "stroke") {
                this.eraserDown(pt);
            }
            // clear-selected 和 clear-all 已通过按钮直接执行，不需要额外的拖拽行为
            return;
        }

        switch (this.toolMode) {
            case "pen": this.penDown(pt); break;
            case "select": this.selectDown(pt); break;
            case "arrow": this.arrowDown(pt); break;
            case "rect": this.rectDown(pt); break;
        }
    }

    private onPointerMove(e: PointerEvent) {
        if (!this.isActive || this.draftMode !== "DRAW") return;
        e.preventDefault();
        const pt = this.getCanvasPoint(e);
        if (!pt) return;

        // 橡皮擦光标位置更新（仅整笔擦除模式）
        if (this.toolMode === "eraser" && this.eraserMode === "stroke" && this.eraserCursorEl) {
            const size = ERASER_CURSOR_SIZE;
            this.eraserCursorEl.style.left = `${e.clientX - size / 2}px`;
            this.eraserCursorEl.style.top = `${e.clientY - size / 2}px`;
            this.eraserCursorEl.style.width = `${size}px`;
            this.eraserCursorEl.style.height = `${size}px`;
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
        if (!this.isActive || this.draftMode !== "DRAW") return;
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

    // ==========================================================
    //  工具实现
    // ==========================================================

    // ---------- 画笔 (perfect-freehand 平滑) ----------
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
        // 低通滤波
        const alpha = 0.35;
        const filtered: Point = {
            x: this.lastFilteredPt.x + (pt.x - this.lastFilteredPt.x) * alpha,
            y: this.lastFilteredPt.y + (pt.y - this.lastFilteredPt.y) * alpha,
        };
        this.lastFilteredPt = filtered;

        const pts = this.activeStroke.points;
        const last = pts[pts.length - 1];
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
        this.ctx.arc(pt.x, pt.y, this.currentLineWidth / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    // ---------- 橡皮擦（整笔删除） ----------
    private eraserDown(pt: Point) {
        this.pushUndo();
        this.eraserDelete(pt);
    }

    private eraserMove(pt: Point) {
        this.eraserDelete(pt);
    }

    private eraserUp(_pt: Point) {
        this.saveStrokes();
    }

    private eraserDelete(pt: Point) {
        const newStrokes = this.strokes.filter(s => pointToStrokeDist(pt, s) > ERASER_HIT_DISTANCE);
        if (newStrokes.length !== this.strokes.length) {
            this.strokes = newStrokes;
            this.selectedIndices.clear();
            this.renderAllStrokes();
        }
    }

    // ---------- 选择工具 ----------
    private selectDown(pt: Point) {
        if (this.selectedIndices.size > 0) {
            const selStrokes = [...this.selectedIndices].map(i => this.strokes[i]);
            const hit = selStrokes.some(s => s.points.some(p => dist(p, pt) < 8));
            if (hit) {
                this.moveStart = pt;
                this.moveOriginStrokes = selStrokes.map(s => s.points.map(p => ({ ...p })));
                return;
            }
        }
        this.selectedIndices.clear();
        this.selectStart = pt;
        this.selectRect = { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
    }

    private selectMove(pt: Point) {
        if (this.moveStart && this.moveOriginStrokes) {
            const dx = pt.x - this.moveStart.x;
            const dy = pt.y - this.moveStart.y;
            const indices = [...this.selectedIndices];
            for (let j = 0; j < indices.length; j++) {
                const origPoints = this.moveOriginStrokes[j];
                const stroke = this.strokes[indices[j]];
                for (let i = 0; i < stroke.points.length; i++) {
                    stroke.points[i] = { x: origPoints[i].x + dx, y: origPoints[i].y + dy };
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

    private selectUp(pt: Point) {
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
            for (let i = 0; i < this.strokes.length; i++) {
                if (strokeInRect(this.strokes[i], this.selectRect.x1, this.selectRect.y1, this.selectRect.x2, this.selectRect.y2))
                    this.selectedIndices.add(i);
            }
            this.selectRect = null;
            this.selectStart = null;
            this.renderAllStrokes();
        }
    }

    // ---------- 箭头 ----------
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

    // ---------- 矩形 ----------
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
        const [a, b] = this.previewStroke.points;
        if (Math.abs(b.x - a.x) > 3 || Math.abs(b.y - a.y) > 3) {
            this.pushUndo();
            this.strokes.push({ ...this.previewStroke });
            this.saveStrokes();
        }
        this.previewStroke = null;
        this.renderAllStrokes();
    }

    // ---------- 文字 ----------
    private handleTextTool(pt: Point) {
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

    // ---------- 笔画完成 ----------
    private finishStroke() {
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
    private async deleteSelected() {
        if (this.selectedIndices.size === 0) return;
        this.pushUndo();
        const sorted = [...this.selectedIndices].sort((a, b) => b - a);
        for (const i of sorted) this.strokes.splice(i, 1);
        this.selectedIndices.clear();
        this.renderAllStrokes();
        await this.saveStrokes();
    }

    // ---------- 清空全部（保留撤销） ----------
    private clearAll() {
        if (this.strokes.length === 0) return;
        this.pushUndo();
        this.strokes = [];
        this.selectedIndices.clear();
        this.renderAllStrokes();
        this.saveStrokes();
        new Notice("画布已清空，可按 Ctrl+Z 恢复");
    }

    // 清空确认对话框
    private confirmClearAll() {
        const modal = new Modal(this.app);
        modal.titleEl.setText("确认清空草稿");
        modal.contentEl.createEl("p", { text: "是否清空当前文件的所有手写与标注？" });
        modal.contentEl.createEl("p", { text: "（可通过 Ctrl+Z 恢复）", cls: "mod-warning" });

        const btnContainer = modal.contentEl.createDiv({ cls: "modal-button-container" });
        const confirmBtn = btnContainer.createEl("button", { text: "确认清空" });
        const cancelBtn = btnContainer.createEl("button", { text: "取消" });

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
        for (let i = 1; i < outline.length; i++) ctx.lineTo(outline[i][0], outline[i][1]);
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

        if (style === "dashed") ctx.setLineDash([8, 4]);
        else ctx.setLineDash([]);

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

        // 箭头头部
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
                const xs = stroke.points.map(p => p.x);
                const ys = stroke.points.map(p => p.y);
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
            const [a, b] = stroke.points;
            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.lineWidth;
            ctx.globalAlpha = stroke.opacity ?? 1;
            ctx.beginPath();
            ctx.rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
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
            const pts = stroke.points;
            const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
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

    private renderAllStrokes() {
        if (!this.ctx || !this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        this.ctx.clearRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);

        for (let i = 0; i < this.strokes.length; i++) {
            this.drawStroke(this.ctx, this.strokes[i], this.selectedIndices.has(i));
        }
        if (this.activeStroke) this.drawStroke(this.ctx, this.activeStroke, false);
        if (this.previewStroke) this.drawStroke(this.ctx, this.previewStroke, false);

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
        const dir = this.getDraftDir();
        const fn = this.getDraftFileName();
        if (!dir || !fn) { this.strokes = []; return; }
        try {
            const raw = await this.app.vault.adapter.read(`${dir}/${fn}`);
            this.strokes = JSON.parse(raw);
        } catch {
            this.strokes = [];
        }
    }

    private async saveStrokes() {
        const dir = this.getDraftDir();
        const fn = this.getDraftFileName();
        if (!dir || !fn) return;
        try { await this.app.vault.adapter.mkdir(dir); } catch { /* 目录已存在 */ }
        try {
            await this.app.vault.adapter.write(`${dir}/${fn}`, JSON.stringify(this.strokes));
        } catch (err) {
            console.error("[DraftPaper] save failed:", err);
        }
    }

    private async syncCurrentFile() {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view?.file) return;
        const newPath = view.file.path;
        if (newPath === this.currentFilePath) return;
        if (this.currentFilePath) await this.saveStrokes();
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
    private pushUndo() {
        this.undoStack.push(
            this.strokes.map(s => ({ ...s, points: s.points.map(p => ({ ...p })) }))
        );
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