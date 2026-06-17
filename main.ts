import { Plugin, MarkdownView, Notice, Modal } from "obsidian";
import { getStroke } from "perfect-freehand";

// ============================================================
//  类型定义
// ============================================================
interface PluginData {
    toolbarPos: { x: number; y: number };
    toolbarSnap: "bottom" | "top" | "left" | "right" | "free";
}

interface Point { x: number; y: number; }

interface Stroke {
    type: "pen" | "highlighter" | "arrow" | "rect" | "text";
    blockKey: string;  // 保留字段兼容旧数据，新数据填空串
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
type EraserMode = "pixel" | "stroke" | "select-clear";

const DEFAULT_COLOR = "#ff3333";
const DEFAULT_LINE_WIDTH = 2.5;
const HIGHLIGHTER_COLOR = "#ffeb3b";
const HIGHLIGHTER_OPACITY = 0.25;
const ERASER_HIT_DISTANCE = 15;
const PIXEL_ERASER_RADIUS = 16;
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

function dist(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }

function clipStrokeByPixelEraser(stroke: Stroke, eraserPoints: Point[], radius: number): Stroke[] {
    const erased = stroke.points.map(p =>
        eraserPoints.some(ep => dist(p, ep) < radius)
    );
    if (!erased.some(Boolean)) return [stroke];

    const segments: Stroke[] = [];
    let current: Point[] = [];

    for (let i = 0; i < stroke.points.length; i++) {
        if (!erased[i]) {
            current.push({ ...stroke.points[i] });
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

// ============================================================
//  插件主体
// ============================================================
export default class DraftPaperPlugin extends Plugin {
    private active = false;
    private isDrawing = true;
    private tool: ToolMode = "pen";
    private eraserMode: EraserMode = "stroke";
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private container: HTMLElement | null = null;  // markdown 预览容器
    private strokes: Stroke[] = [];
    private currentStroke: Stroke | null = null;
    private previewStroke: Stroke | null = null;
    private floatBar: HTMLElement | null = null;       // 磁吸浮动工具栏
    private settingsPopover: HTMLElement | null = null; // 设置弹出面板
    private settingsPanelVisible = false;
    private eraserCursorEl: HTMLElement | null = null;
    // 拖拽状态
    private toolbarDrag = false;
    private toolbarDragStart = { x: 0, y: 0 };
    private toolbarDragBarStart = { x: 0, y: 0 };
    private toolbarSnap: PluginData["toolbarSnap"] = "bottom";

    private color = DEFAULT_COLOR;
    private lineWidth = DEFAULT_LINE_WIDTH;
    private opacity = 1;
    private arrowStyle: ArrowStyle = "straight";

    private eraserPath: Point[] = [];
    private isErasing = false;

    private selectClearRect: { x1: number; y1: number; x2: number; y2: number } | null = null;
    private selectClearStart: Point | null = null;

    private rafPending = false;
    private currentFilePath = "";

    private undoStack: Stroke[][] = [];
    private redoStack: Stroke[][] = [];
    private readonly MAX_UNDO = 100;

    private containerResizeObserver: ResizeObserver | null = null;

    async onload() {
        await this.loadData();
        this.addRibbonIcon("pencil", "草稿纸", () => this.toggle());
        this.addCommand({ id: "toggle-draft", name: "切换草稿纸", callback: () => this.toggle() });
        this.registerDomEvent(window, "resize", () => { this.scheduleRedraw(); this.repositionPopover(); });
        this.registerEvent(this.app.workspace.on("active-leaf-change", () => {
            if (this.active) this.scheduleRedraw();
        }));
    }

    async loadData() {
        const data = await super.loadData() as PluginData | null;
        if (data?.toolbarPos) {
            this.toolbarDragBarStart = data.toolbarPos;
        }
        if (data?.toolbarSnap) {
            this.toolbarSnap = data.toolbarSnap;
        }
    }

    async saveData() {
        await super.saveData({
            toolbarPos: this.toolbarDragBarStart,
            toolbarSnap: this.toolbarSnap,
        } satisfies PluginData);
    }

    async onunload() {
        this.disable();
    }

    private toggle() {
        if (this.active) { this.disable(); } else { this.enable(); }
    }

    // ==================== 启用/初始化 ====================
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
        // 获取 markdown 预览容器
        const previewContainer = (view as any).previewEl as HTMLElement
            || view.contentEl.querySelector(".markdown-preview-view") as HTMLElement;
        if (!previewContainer) {
            new Notice("无法找到预览容器，请确保在阅读模式");
            return;
        }
        this.container = previewContainer;
        this.loadStrokes();
        this.init();
    }

    private init() {
        if (!this.container) return;
        const canvas = document.createElement("canvas");
        canvas.id = "draft-paper-canvas";
        Object.assign(canvas.style, {
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: "1",
            pointerEvents: this.isDrawing ? "auto" : "none",
            touchAction: "none",
            background: "transparent",
        });
        this.container.appendChild(canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.syncCanvasSize();

        canvas.addEventListener("pointerdown", this.onPointerDown);
        canvas.addEventListener("pointermove", this.onPointerMove);
        canvas.addEventListener("pointerup", this.onPointerUp);
        // pointerleave 不再直接结束笔画，而是用延时检测
        canvas.addEventListener("pointerleave", this.onPointerLeave);

        // 监听容器内容尺寸变化，自动更新 canvas 高度
        this.containerResizeObserver = new ResizeObserver(() => {
            this.syncCanvasSize();
            this.scheduleRedraw();
        });
        this.containerResizeObserver.observe(this.container);
        // 也监听容器 scroll 事件以同步橡皮擦光标等
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

    private disable() {
        if (!this.active) return;
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
        if (this.floatBar) { this.floatBar.remove(); this.floatBar = null; }
        if (this.settingsPopover) { this.settingsPopover.remove(); this.settingsPopover = null; }
        if (this.eraserCursorEl) { this.eraserCursorEl.remove(); this.eraserCursorEl = null; }
        this.strokes = [];
        this.currentStroke = null;
        this.settingsPanelVisible = false;
        this.active = false;
    }

    private syncCanvasSize() {
        if (!this.canvas || !this.ctx || !this.container) return;
        const dpr = window.devicePixelRatio || 1;
        const containerRect = this.container.getBoundingClientRect();
        // 内容总高度 = max(可滚动高度, 可见高度)
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
    private createToolbar() {
        // 主体浮动条
        const bar = document.createElement("div");
        bar.className = "dp-float-bar";
        bar.innerHTML = `
            <span class="dp-drag-handle" title="拖动移动 (松开吸附)">≡</span>
            <span class="dp-sep"></span>
            <button class="dp-tool-btn active" data-t="pen" title="画笔 (1)">✏️</button>
            <button class="dp-tool-btn" data-t="highlighter" title="荧光笔 (2)">🖍️</button>
            <button class="dp-tool-btn" data-t="eraser" title="橡皮擦 (3)">🧹</button>
            <button class="dp-tool-btn" data-t="arrow" title="箭头 (4)">↗</button>
            <button class="dp-tool-btn" data-t="rect" title="矩形 (5)">⬛</button>
            <button class="dp-tool-btn" data-t="text" title="文字 (6)">T</button>
            <button class="dp-tool-btn" data-t="hand" title="手掌 (7)">🖐️</button>
            <button class="dp-tool-btn dp-tool-extras" title="更多工具">➕</button>
            <span class="dp-sep"></span>
            <button class="dp-tool-btn dp-gear-btn" title="设置">⚙️</button>
            <button class="dp-tool-btn" id="dp-float-exit" title="退出">✕</button>
        `;
        document.body.appendChild(bar);
        this.floatBar = bar;

        // 绑定拖拽
        const handle = bar.querySelector(".dp-drag-handle") as HTMLElement;
        handle.addEventListener("pointerdown", this.onToolbarDragStart);
        window.addEventListener("pointermove", this.onToolbarDragMove);
        window.addEventListener("pointerup", this.onToolbarDragEnd);
        // 也支持触屏拖拽（整条 bar 都可以拖，不只是 handle）
        bar.addEventListener("pointerdown", (e) => {
            if ((e.target as HTMLElement).closest("button")) return; // 不拦截按钮点击
            this.onToolbarDragStart(e);
        });

        // 工具按钮事件
        bar.querySelectorAll("[data-t]").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const tool = (btn as HTMLElement).dataset.t as ToolMode;
                this.selectTool(tool);
                this.updateFloatBarActive();
            });
        });

        // ⚙️ 按钮
        bar.querySelector(".dp-gear-btn")!.addEventListener("click", e => {
            e.stopPropagation();
            this.toggleSettingsPanel();
        });

        // ✕ 退出按钮
        document.getElementById("dp-float-exit")!.addEventListener("click", () => this.disable());

        // 点击外部关闭弹出面板
        document.addEventListener("click", (e) => {
            if (this.settingsPanelVisible &&
                !this.settingsPopover?.contains(e.target as Node) &&
                !this.floatBar?.contains(e.target as Node)) {
                this.hideSettingsPanel();
            }
        });

        // 创建弹出面板
        this.createSettingsPopover();
        this.updateFloatBarActive();
        this.applyToolbarPosition();
    }

    private selectTool(tool: ToolMode) {
        this.tool = tool;
        this.eraserMode = "stroke";
        if (tool === "hand") {
            this.canvas!.style.pointerEvents = "none";
        } else if (this.isDrawing) {
            this.canvas!.style.pointerEvents = "auto";
        }
        this.resetToolState();
        this.updateCursorVisibility();
        this.updateSettingsPanelContent();
    }

    private updateFloatBarActive() {
        this.floatBar?.querySelectorAll("[data-t]").forEach(btn => {
            btn.classList.toggle("active", (btn as HTMLElement).dataset.t === this.tool);
        });
    }

    // ==================== 拖拽 + 磁吸 ====================
    private onToolbarDragStart = (e: PointerEvent) => {
        if (!this.floatBar) return;
        this.toolbarDrag = true;
        this.floatBar.classList.add("dragging");
        this.toolbarDragStart = { x: e.clientX, y: e.clientY };
        const rect = this.floatBar.getBoundingClientRect();
        this.toolbarDragBarStart = { x: rect.left, y: rect.top };
        e.preventDefault();
    };

    private onToolbarDragMove = (e: PointerEvent) => {
        if (!this.toolbarDrag || !this.floatBar) return;
        const dx = e.clientX - this.toolbarDragStart.x;
        const dy = e.clientY - this.toolbarDragStart.y;
        const newLeft = this.toolbarDragBarStart.x + dx;
        const newTop = this.toolbarDragBarStart.y + dy;
        this.floatBar.style.left = `${newLeft}px`;
        this.floatBar.style.top = `${newTop}px`;
        this.floatBar.style.transform = "none";
        // 拖拽中关闭弹出面板
        if (this.settingsPanelVisible) this.hideSettingsPanel();
    };

    private onToolbarDragEnd = () => {
        if (!this.toolbarDrag || !this.floatBar) return;
        this.toolbarDrag = false;
        this.floatBar.classList.remove("dragging");
        this.snapToNearest();
        this.saveToolbarPosition();
    };

    private snapToNearest() {
        if (!this.floatBar || !this.container) return;
        const barRect = this.floatBar.getBoundingClientRect();
        const cx = barRect.left + barRect.width / 2;
        const cy = barRect.top + barRect.height / 2;
        const MARGIN = 8;
        const SNAP_THRESHOLD = 200;

        // 使用容器（标签页）的边界，而非窗口
        const containerRect = this.container.getBoundingClientRect();
        const cLeft = containerRect.left;
        const cRight = containerRect.right;
        const cTop = containerRect.top;
        const cBottom = containerRect.bottom;

        type SnapPoint = { id: PluginData["toolbarSnap"]; x: number; y: number; vertical: boolean };
        const snaps: SnapPoint[] = [
            // 底部居中（横向）
            { id: "bottom", x: (cLeft + cRight - barRect.width) / 2, y: cBottom - barRect.height - MARGIN, vertical: false },
            // 顶部居中（横向）
            { id: "top", x: (cLeft + cRight - barRect.width) / 2, y: cTop + MARGIN, vertical: false },
            // 左侧居中（竖向）
            { id: "left", x: cLeft + MARGIN, y: (cTop + cBottom - barRect.height) / 2, vertical: true },
            // 右侧居中（竖向）
            { id: "right", x: cRight - barRect.width - MARGIN, y: (cTop + cBottom - barRect.height) / 2, vertical: true },
        ];

        let best: SnapPoint | null = null;
        let bestDist = Infinity;
        for (const s of snaps) {
            const sCx = s.vertical ? s.x + barRect.width / 2 : s.x + barRect.width / 2;
            const sCy = s.vertical ? s.y + barRect.height / 2 : s.y + barRect.height / 2;
            const d = Math.hypot(cx - sCx, cy - sCy);
            if (d < bestDist) { best = s; bestDist = d; }
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
            const r = this.floatBar.getBoundingClientRect();
            this.toolbarDragBarStart = { x: r.left, y: r.top };
        }
        this.repositionPopover();
    }

    private applyToolbarPosition() {
        if (!this.floatBar || !this.container) return;
        const pos = this.toolbarDragBarStart;
        const MARGIN = 8;
        // 首次加载无保存位置时，默认吸附到容器底部居中
        if (pos.x === 0 && pos.y === 0) {
            const containerRect = this.container.getBoundingClientRect();
            this.floatBar.style.left = `${MARGIN}px`;
            this.floatBar.style.top = `${MARGIN}px`;
            const barRect = this.floatBar.getBoundingClientRect();
            const x = (containerRect.left + containerRect.right - barRect.width) / 2;
            const y = containerRect.bottom - barRect.height - MARGIN;
            this.floatBar.style.left = `${x}px`;
            this.floatBar.style.top = `${y}px`;
            this.floatBar.style.transform = "none";
            this.toolbarDragBarStart = { x, y };
            this.saveData();
        } else {
            this.floatBar.style.left = `${pos.x}px`;
            this.floatBar.style.top = `${pos.y}px`;
            this.floatBar.style.transform = "none";
        }
        const isVertical = this.toolbarSnap === "left" || this.toolbarSnap === "right";
        this.floatBar.classList.toggle("is-vertical", isVertical);
    }

    private repositionPopover() {
        if (!this.settingsPopover || !this.floatBar || !this.settingsPanelVisible) return;
        const barRect = this.floatBar.getBoundingClientRect();
        const popRect = this.settingsPopover.getBoundingClientRect();
        // 默认在浮动条上方显示
        let top = barRect.top - popRect.height - 8;
        let left = barRect.left;
        // 防止超出屏幕
        if (top < 8) top = barRect.bottom + 8;
        if (left + popRect.width > window.innerWidth - 8) left = window.innerWidth - popRect.width - 8;
        if (left < 8) left = 8;
        this.settingsPopover.style.left = `${left}px`;
        this.settingsPopover.style.top = `${top}px`;
    }

    private saveToolbarPosition() {
        if (!this.floatBar) return;
        const r = this.floatBar.getBoundingClientRect();
        this.toolbarDragBarStart = { x: r.left, y: r.top };
        this.saveData();
    }

    // ==================== 弹出设置面板 ====================
    private createSettingsPopover() {
        const pop = document.createElement("div");
        pop.className = "dp-settings-popover";
        pop.innerHTML = `
            <div class="dp-popover-row">
                <input type="color" id="dp-pop-color" value="${this.color}" title="颜色">
                <label>粗细</label>
                <input type="range" id="dp-pop-width" min="1" max="8" step="0.5" value="${this.lineWidth}">
                <span style="font-size:11px;min-width:28px;text-align:right" id="dp-pop-wlbl">${this.lineWidth}px</span>
            </div>
            <div class="dp-popover-row">
                <label style="min-width:28px;text-align:right">透明</label>
                <input type="range" id="dp-pop-opacity" min="10" max="100" value="${this.opacity * 100}">
                <span style="font-size:11px;min-width:28px;text-align:right" id="dp-pop-olbl">${Math.round(this.opacity * 100)}%</span>
            </div>
            <div class="dp-popover-row" id="dp-pop-arrow-row" style="display:none">
                <label>箭头</label>
                <select id="dp-pop-arrow-style">
                    <option value="straight">→ 直线</option>
                    <option value="curved">↝ 弯曲</option>
                    <option value="dashed">⇢ 虚线</option>
                    <option value="double">↔ 双头</option>
                </select>
            </div>
            <div class="dp-eraser-modes" id="dp-pop-eraser-modes" style="display:none">
                <button data-eraser="pixel">局部擦除</button>
                <button data-eraser="stroke" class="active">整笔擦除</button>
                <button data-eraser="select-clear">框选删除</button>
            </div>
            <div class="dp-popover-actions">
                <button class="dp-mode-toggle" id="dp-pop-mode">🟢 绘图</button>
                <button id="dp-pop-undo" title="撤销 (Ctrl+Z)">↩ 撤销</button>
                <button id="dp-pop-redo" title="重做 (Ctrl+Shift+Z)">↪ 重做</button>
                <button id="dp-pop-clear" title="清空画布">🗑 清空</button>
            </div>
            <div class="dp-popover-actions" id="dp-pop-extra-tools" style="display:none">
                <button data-t="arrow" title="箭头 (4)">↗ 箭头</button>
                <button data-t="rect" title="矩形 (5)">⬛ 矩形</button>
                <button data-t="text" title="文字 (6)">T 文字</button>
                <button data-t="hand" title="手掌 (7)">🖐️ 手掌</button>
            </div>
        `;
        document.body.appendChild(pop);
        this.settingsPopover = pop;

        // 颜色
        document.getElementById("dp-pop-color")!.addEventListener("input", e => {
            this.color = (e.target as HTMLInputElement).value;
        });
        // 粗细
        document.getElementById("dp-pop-width")!.addEventListener("input", e => {
            this.lineWidth = parseFloat((e.target as HTMLInputElement).value);
            document.getElementById("dp-pop-wlbl")!.textContent = `${this.lineWidth}px`;
        });
        // 透明度
        document.getElementById("dp-pop-opacity")!.addEventListener("input", e => {
            this.opacity = parseInt((e.target as HTMLInputElement).value) / 100;
            document.getElementById("dp-pop-olbl")!.textContent = `${Math.round(this.opacity * 100)}%`;
        });
        // 箭头样式
        document.getElementById("dp-pop-arrow-style")!.addEventListener("change", e => {
            this.arrowStyle = (e.target as HTMLSelectElement).value as ArrowStyle;
        });
        // 橡皮擦子模式
        pop.querySelectorAll("[data-eraser]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.eraserMode = (btn as HTMLElement).dataset.eraser as EraserMode;
                this.updateCursorVisibility();
                this.updateSettingsPanelContent();
            });
        });
        // 绘图/阅读切换
        document.getElementById("dp-pop-mode")!.addEventListener("click", () => this.toggleDrawMode());
        // 撤销/重做/清空
        document.getElementById("dp-pop-undo")!.addEventListener("click", () => this.undo());
        document.getElementById("dp-pop-redo")!.addEventListener("click", () => this.redo());
        document.getElementById("dp-pop-clear")!.addEventListener("click", () => this.confirmClearAll());
        // 手机端额外工具按钮
        pop.querySelectorAll("#dp-pop-extra-tools [data-t]").forEach(btn => {
            btn.addEventListener("click", () => {
                const tool = (btn as HTMLElement).dataset.t as ToolMode;
                this.selectTool(tool);
                this.updateFloatBarActive();
            });
        });
    }

    private toggleSettingsPanel() {
        if (!this.settingsPopover) return;
        if (this.settingsPanelVisible) {
            this.hideSettingsPanel();
        } else {
            this.showSettingsPanel();
        }
    }

    private showSettingsPanel() {
        if (!this.settingsPopover) return;
        this.settingsPanelVisible = true;
        this.updateSettingsPanelContent();
        this.settingsPopover.classList.add("is-visible");
        this.repositionPopover();
    }

    private hideSettingsPanel() {
        if (!this.settingsPopover) return;
        this.settingsPanelVisible = false;
        this.settingsPopover.classList.remove("is-visible");
    }

    private updateSettingsPanelContent() {
        if (!this.settingsPopover) return;
        // 橡皮擦模式面板：只在橡皮擦工具时显示
        const eraserModes = document.getElementById("dp-pop-eraser-modes");
        if (eraserModes) {
            eraserModes.style.display = this.tool === "eraser" ? "flex" : "none";
            eraserModes.querySelectorAll("[data-eraser]").forEach(btn => {
                btn.classList.toggle("active", (btn as HTMLElement).dataset.eraser === this.eraserMode);
            });
        }
        // 箭头样式：只在箭头工具时显示
        const arrowRow = document.getElementById("dp-pop-arrow-row");
        if (arrowRow) {
            arrowRow.style.display = this.tool === "arrow" ? "flex" : "none";
            const sel = document.getElementById("dp-pop-arrow-style") as HTMLSelectElement;
            if (sel) sel.value = this.arrowStyle;
        }
        // 更新绘画模式按钮
        const modeBtn = document.getElementById("dp-pop-mode");
        if (modeBtn) {
            modeBtn.textContent = this.isDrawing ? "🟢 绘图" : "👁 阅读";
            modeBtn.classList.toggle("active", !this.isDrawing);
        }
        // 手机端: 显示/隐藏额外工具按钮
        const extraTools = document.getElementById("dp-pop-extra-tools");
        if (extraTools) {
            extraTools.style.display = window.innerWidth <= 500 ? "flex" : "none";
        }
    }

    private toggleDrawMode() {
        this.isDrawing = !this.isDrawing;
        if (this.canvas) {
            this.canvas.style.pointerEvents = this.isDrawing ? "auto" : "none";
            this.canvas.style.cursor = this.isDrawing ? "crosshair" : "default";
        }
        this.updateSettingsPanelContent();
    }

    private updateCursorVisibility() {
        if (this.eraserCursorEl) {
            const show = this.tool === "eraser" && this.eraserMode === "pixel";
            this.eraserCursorEl.style.display = show ? "block" : "none";
        }
    }

    private resetToolState() {
        this.currentStroke = null;
        this.previewStroke = null;
        this.eraserPath = [];
        this.isErasing = false;
        this.selectClearRect = null;
        this.selectClearStart = null;
        this.scheduleRedraw();
    }

    // ==================== 获取 canvas-relative 坐标 ====================
    private getCanvasPoint(e: PointerEvent): Point {
        const rect = this.canvas!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    // ==================== 事件处理（canvas-relative 坐标系，无 block 依赖） ====================
    private onPointerDown = (e: PointerEvent) => {
        if (!this.active || !this.isDrawing) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();

        const p = this.getCanvasPoint(e);

        if (this.tool === "hand") return;

        if (this.tool === "eraser") {
            if (this.eraserMode === "stroke") {
                this.eraseAt(p);
            } else if (this.eraserMode === "pixel") {
                this.isErasing = true;
                this.eraserPath = [p];
                this.applyPixelEraser();
            } else if (this.eraserMode === "select-clear") {
                this.selectClearStart = p;
                this.selectClearRect = { x1: p.x, y1: p.y, x2: p.x, y2: p.y };
            }
            return;
        }

        if (this.tool === "text") {
            this.textAt(p);
            return;
        }

        if (this.tool === "pen" || this.tool === "highlighter") {
            this.currentStroke = {
                type: this.tool === "pen" ? "pen" : "highlighter",
                blockKey: "",
                points: [p],
                color: this.tool === "highlighter" ? HIGHLIGHTER_COLOR : this.color,
                lineWidth: this.lineWidth,
                opacity: this.tool === "highlighter" ? HIGHLIGHTER_OPACITY : this.opacity,
                timestamp: Date.now(),
            };
        } else if (this.tool === "arrow" || this.tool === "rect") {
            this.previewStroke = {
                type: this.tool,
                blockKey: "",
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

        const p = this.getCanvasPoint(e);

        if (this.tool === "eraser" && this.eraserMode === "pixel" && this.eraserCursorEl) {
            const size = PIXEL_ERASER_RADIUS * 2;
            this.eraserCursorEl.style.left = `${e.clientX - PIXEL_ERASER_RADIUS}px`;
            this.eraserCursorEl.style.top = `${e.clientY - PIXEL_ERASER_RADIUS}px`;
            this.eraserCursorEl.style.width = `${size}px`;
            this.eraserCursorEl.style.height = `${size}px`;
        }

        if (this.tool === "eraser") {
            if (this.eraserMode === "stroke" && e.buttons === 1) {
                this.eraseAt(p);
            } else if (this.eraserMode === "pixel" && this.isErasing) {
                this.eraserPath.push(p);
                this.applyPixelEraser();
            } else if (this.eraserMode === "select-clear" && this.selectClearRect) {
                this.selectClearRect.x2 = p.x;
                this.selectClearRect.y2 = p.y;
                this.scheduleRedraw();
            }
            return;
        }

        if (this.previewStroke) {
            this.previewStroke.points[1] = p;
            this.scheduleRedraw();
            return;
        }

        if (!this.currentStroke) return;

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

    // 优化后的 pointerleave：延时检测是否真的离开（断触修复关键）
    private leaveTimeout: ReturnType<typeof setTimeout> | null = null;
    private readonly LEAVE_TOLERANCE_MS = 150;

    private onPointerLeave = (e: PointerEvent) => {
        if (!this.active || !this.isDrawing) return;
        if (!this.currentStroke && !this.previewStroke) return;

        // 设置延时，如果在延时内收到新的 pointermove，取消 onPointerUp
        this.leaveTimeout = setTimeout(() => {
            this.leaveTimeout = null;
            this.onPointerUp();
        }, this.LEAVE_TOLERANCE_MS);
    };

    // ==================== 橡皮实现（canvas-relative，无 block 依赖） ====================
    private eraseAt(p: Point) {
        this.pushUndo();
        this.strokes = this.strokes.filter(s => {
            return !s.points.some(pt => dist(pt, p) < ERASER_HIT_DISTANCE);
        });
        this.scheduleRedraw();
        this.saveStrokes();
    }

    private applyPixelEraser() {
        if (this.eraserPath.length === 0) return;
        const newStrokes: Stroke[] = [];
        for (const s of this.strokes) {
            const clipped = clipStrokeByPixelEraser(s, this.eraserPath, PIXEL_ERASER_RADIUS);
            newStrokes.push(...clipped);
        }
        this.strokes = newStrokes;
        this.scheduleRedraw();
    }

    private deleteStrokesInRect(rect: { x1: number; y1: number; x2: number; y2: number }) {
        const minX = Math.min(rect.x1, rect.x2);
        const maxX = Math.max(rect.x1, rect.x2);
        const minY = Math.min(rect.y1, rect.y2);
        const maxY = Math.max(rect.y1, rect.y2);

        this.strokes = this.strokes.filter(s => {
            return !s.points.some(pt =>
                pt.x >= minX && pt.x <= maxX && pt.y >= minY && pt.y <= maxY
            );
        });
    }

    // ==================== 文字工具（canvas-relative） ====================
    private textAt(p: Point) {
        const canvasRect = this.canvas!.getBoundingClientRect();
        const input = document.createElement("textarea");
        Object.assign(input.style, {
            position: "fixed",
            left: `${canvasRect.left + p.x}px`,
            top: `${canvasRect.top + p.y}px`,
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
                    type: "text", blockKey: "", points: [p],
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

    // ==================== 清空 ====================
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

    // ==================== 渲染（无 blockMap，直接 canvas-relative 绘制） ====================
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

        for (const s of this.strokes) {
            this.drawStroke(s);
        }

        if (this.currentStroke) this.drawStroke(this.currentStroke);
        if (this.previewStroke) this.drawStroke(this.previewStroke);

        // 框选删除的虚线矩形（canvas-relative）
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

    private drawStroke(stroke: Stroke) {
        if (!this.ctx || stroke.points.length < 1) return;

        // 点已经是 canvas-relative，直接使用
        const pts = stroke.points;

        if (stroke.type === "pen" || stroke.type === "highlighter") {
            const outline = getStroke(
                pts.map(p => [p.x, p.y] as [number, number]),
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
            this.drawArrowStroke(stroke);
        } else if (stroke.type === "rect") {
            const [a, b] = pts;
            const ctx = this.ctx;
            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.lineWidth;
            ctx.globalAlpha = stroke.opacity;
            ctx.strokeRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
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

    private drawArrowStroke(stroke: Stroke) {
        if (!this.ctx) return;
        const [a, b] = stroke.points;
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
        try {
            const raw = JSON.parse(await this.app.vault.adapter.read(path));
            // 检测旧版数据（有非空 blockKey 且点坐标看起来是 block-relative）
            if (raw.length > 0 && raw[0].blockKey && raw[0].points?.[0]?.x < 2000) {
                // 旧版数据，尝试迁移到 canvas-relative
                this.strokes = await this.migrateOldStrokes(raw);
            } else {
                this.strokes = raw;
            }
        } catch { this.strokes = []; }
    }

    private async migrateOldStrokes(oldStrokes: Stroke[]): Promise<Stroke[]> {
        // 旧版坐标是 block-relative，新版是 canvas-relative
        // 迁移策略：对每个 stroke，尝试找到对应 block，转换坐标
        if (!this.container) return [];
        const containerRect = this.container.getBoundingClientRect();

        const blockMap = new Map<string, DOMRect>();
        const BLOCK_SELECTORS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, .math-block, .callout";
        document.querySelectorAll(BLOCK_SELECTORS).forEach(el => {
            const key = (el as HTMLElement).textContent?.trim().substring(0, 60) || "";
            if (key) blockMap.set(key, (el as HTMLElement).getBoundingClientRect());
        });

        const migrated: Stroke[] = [];
        for (const s of oldStrokes) {
            const blockRect = blockMap.get(s.blockKey);
            if (!blockRect) {
                // 找不到对应 block，跳过这笔数据
                continue;
            }
            migrated.push({
                ...s,
                blockKey: s.blockKey,  // 保留兼容
                points: s.points.map(p => ({
                    x: p.x + blockRect.left - containerRect.left,
                    y: p.y + blockRect.top - containerRect.top,
                })),
            });
        }
        if (migrated.length > 0) {
            new Notice(`已迁移 ${migrated.length} 条旧版批注到新坐标系`);
        }
        return migrated;
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
