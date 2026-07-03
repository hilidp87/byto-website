"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export const CANVAS_W = 600;
export const CANVAS_H = 1000;

export type GarmentState = {
  src: string;
  x: number;       // center X in virtual px
  y: number;       // center Y in virtual px
  width: number;   // virtual px
  rotation: number;// degrees
};

type DragTarget =
  | "shirt-move"
  | "shirt-scale"
  | "shirt-rotate"
  | "pants-move"
  | "pants-scale"
  | "pants-rotate"
  | null;

type DragState = {
  target: DragTarget;
  startClientX: number;
  startClientY: number;
  origState: GarmentState;
  // scale drag: initial pointer↔center distance
  startDist: number;
  // rotate drag: initial angle minus origState.rotation
  startAngleBias: number;
};

type Props = {
  shirt: GarmentState;
  pants: GarmentState;
  onShirtChange: (g: GarmentState) => void;
  onPantsChange: (g: GarmentState) => void;
};

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

/** Rotate point (px,py) around origin by angle in radians */
function rotate2D(px: number, py: number, angle: number) {
  return {
    x: px * Math.cos(angle) - py * Math.sin(angle),
    y: px * Math.sin(angle) + py * Math.cos(angle),
  };
}

export function AlignmentCanvas({ shirt, pants, onShirtChange, onPantsChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>({
    target: null,
    startClientX: 0,
    startClientY: 0,
    origState: shirt,
    startDist: 0,
    startAngleBias: 0,
  });

  // Natural aspect ratios (height / width) for each garment image
  const [shirtRatio, setShirtRatio] = useState(1.5);
  const [pantsRatio, setPantsRatio] = useState(1.8);

  // Computed scale factor: display px per virtual px
  const scaleFactor = useCallback((): number => {
    if (!canvasRef.current) return 1;
    return canvasRef.current.getBoundingClientRect().width / CANVAS_W;
  }, []);

  // Helpers: screen-space center of a garment
  function screenCenter(g: GarmentState, sf: number) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      cx: rect.left + (g.x / CANVAS_W) * rect.width,
      cy: rect.top + (g.y / CANVAS_H) * rect.height,
    };
  }

  // Helpers: handle positions in screen-space px (absolute from canvas top-left)
  function handlePositions(g: GarmentState, sf: number, natRatio: number) {
    const ws = (g.width / CANVAS_W) * CANVAS_W * sf; // screen width
    const hs = ws * natRatio;                          // screen height
    const cx = (g.x / CANVAS_W) * CANVAS_W * sf;     // from canvas left
    const cy = (g.y / CANVAS_H) * CANVAS_H * sf;     // from canvas top
    const R = degToRad(g.rotation);

    // Scale handle: bottom-right corner
    const scalePt = rotate2D(ws / 2, hs / 2, R);
    // Rotate handle: 44px above top-center
    const gap = hs / 2 + 44;
    const rotatePt = rotate2D(0, -gap, R);

    return {
      scale: { x: cx + scalePt.x, y: cy + scalePt.y },
      rotate: { x: cx + rotatePt.x, y: cy + rotatePt.y },
    };
  }

  // Pointer event handlers
  function startMove(e: React.PointerEvent, which: "shirt" | "pants") {
    e.preventDefault();
    const g = which === "shirt" ? shirt : pants;
    dragRef.current = {
      target: `${which}-move`,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origState: { ...g },
      startDist: 0,
      startAngleBias: 0,
    };
  }

  function startScale(e: React.PointerEvent, which: "shirt" | "pants") {
    e.preventDefault();
    e.stopPropagation();
    const g = which === "shirt" ? shirt : pants;
    const sf = scaleFactor();
    const { cx, cy } = screenCenter(g, sf);
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    dragRef.current = {
      target: `${which}-scale`,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origState: { ...g },
      startDist: dist || 1,
      startAngleBias: 0,
    };
  }

  function startRotate(e: React.PointerEvent, which: "shirt" | "pants") {
    e.preventDefault();
    e.stopPropagation();
    const g = which === "shirt" ? shirt : pants;
    const sf = scaleFactor();
    const { cx, cy } = screenCenter(g, sf);
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    dragRef.current = {
      target: `${which}-rotate`,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origState: { ...g },
      startDist: 0,
      startAngleBias: angle - g.rotation,
    };
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.target || !canvasRef.current) return;

      const sf = scaleFactor();
      const rect = canvasRef.current.getBoundingClientRect();
      const which = d.target.startsWith("shirt") ? "shirt" : "pants";
      const g = d.origState;
      const update = which === "shirt" ? onShirtChange : onPantsChange;

      if (d.target.endsWith("-move")) {
        const dx = (e.clientX - d.startClientX) / sf;
        const dy = (e.clientY - d.startClientY) / sf;
        update({
          ...g,
          x: Math.max(0, Math.min(CANVAS_W, g.x + dx)),
          y: Math.max(0, Math.min(CANVAS_H, g.y + dy)),
        });
      } else if (d.target.endsWith("-scale")) {
        const cx = rect.left + (g.x / CANVAS_W) * rect.width;
        const cy = rect.top + (g.y / CANVAS_H) * rect.height;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const newWidth = Math.max(30, Math.min(CANVAS_W * 1.5, g.width * (dist / d.startDist)));
        update({ ...g, width: newWidth });
      } else if (d.target.endsWith("-rotate")) {
        const cx = rect.left + (g.x / CANVAS_W) * rect.width;
        const cy = rect.top + (g.y / CANVAS_H) * rect.height;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        update({ ...g, rotation: angle - d.startAngleBias });
      }
    };

    const onUp = () => {
      dragRef.current.target = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [shirt, pants, onShirtChange, onPantsChange, scaleFactor]);

  // CSS positioning for a garment image
  function garmentImgStyle(g: GarmentState): React.CSSProperties {
    return {
      position: "absolute",
      left: `${(g.x / CANVAS_W) * 100}%`,
      top: `${(g.y / CANVAS_H) * 100}%`,
      width: `${(g.width / CANVAS_W) * 100}%`,
      height: "auto",
      transform: `translate(-50%, -50%) rotate(${g.rotation}deg)`,
      transformOrigin: "center center",
      cursor: "move",
      userSelect: "none",
      pointerEvents: "auto",
    };
  }

  const sf = scaleFactor();
  const shirtHandles = shirt.src ? handlePositions(shirt, sf, shirtRatio) : null;
  const pantsHandles = pants.src ? handlePositions(pants, sf, pantsRatio) : null;

  return (
    <div
      ref={canvasRef}
      className="relative mx-auto select-none overflow-hidden rounded-2xl border border-gray-200 bg-white"
      style={{
        width: "min(100%, calc(100vh * 3 / 5))",
        aspectRatio: "3/5",
        maxWidth: 420,
      }}
    >
      {/* Model */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/outfits/model-v5.png"
        alt="model"
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        draggable={false}
      />

      {/* Pants layer (under shirt) */}
      {pants.src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pants.src}
            alt="pants"
            style={garmentImgStyle(pants)}
            draggable={false}
            onPointerDown={(e) => startMove(e, "pants")}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth) setPantsRatio(img.naturalHeight / img.naturalWidth);
            }}
          />
          {pantsHandles && (
            <>
              {/* Scale handle */}
              <div
                className="absolute z-20 flex h-5 w-5 cursor-se-resize items-center justify-center rounded-full border-2 border-blue-500 bg-white shadow-sm"
                style={{
                  left: pantsHandles.scale.x,
                  top: pantsHandles.scale.y,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={(e) => startScale(e, "pants")}
                title="Drag to resize"
              >
                <span className="text-[8px] font-bold text-blue-500">↔</span>
              </div>
              {/* Rotate handle */}
              <div
                className="absolute z-20 flex h-5 w-5 cursor-grab items-center justify-center rounded-full border-2 border-orange-400 bg-white shadow-sm"
                style={{
                  left: pantsHandles.rotate.x,
                  top: pantsHandles.rotate.y,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={(e) => startRotate(e, "pants")}
                title="Drag to rotate"
              >
                <span className="text-[8px] font-bold text-orange-400">↻</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Shirt layer (over pants) */}
      {shirt.src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shirt.src}
            alt="shirt"
            style={garmentImgStyle(shirt)}
            draggable={false}
            onPointerDown={(e) => startMove(e, "shirt")}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth) setShirtRatio(img.naturalHeight / img.naturalWidth);
            }}
          />
          {shirtHandles && (
            <>
              {/* Scale handle */}
              <div
                className="absolute z-20 flex h-5 w-5 cursor-se-resize items-center justify-center rounded-full border-2 border-blue-500 bg-white shadow-sm"
                style={{
                  left: shirtHandles.scale.x,
                  top: shirtHandles.scale.y,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={(e) => startScale(e, "shirt")}
                title="Drag to resize"
              >
                <span className="text-[8px] font-bold text-blue-500">↔</span>
              </div>
              {/* Rotate handle */}
              <div
                className="absolute z-20 flex h-5 w-5 cursor-grab items-center justify-center rounded-full border-2 border-orange-400 bg-white shadow-sm"
                style={{
                  left: shirtHandles.rotate.x,
                  top: shirtHandles.rotate.y,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={(e) => startRotate(e, "shirt")}
                title="Drag to rotate"
              >
                <span className="text-[8px] font-bold text-orange-400">↻</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Empty state */}
      {!shirt.src && !pants.src && (
        <div className="absolute inset-0 flex items-end justify-center pb-12">
          <p className="rounded-xl bg-white/80 px-4 py-2 text-sm text-gray-400">
            Upload garments to start
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1">
        <div className="flex items-center gap-1 rounded bg-white/80 px-2 py-0.5 text-[10px] text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full border-2 border-blue-500" /> resize
        </div>
        <div className="flex items-center gap-1 rounded bg-white/80 px-2 py-0.5 text-[10px] text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full border-2 border-orange-400" /> rotate
        </div>
      </div>
    </div>
  );
}
