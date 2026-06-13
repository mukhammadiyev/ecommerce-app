import { useCallback, useEffect, useRef } from "react";

// ── GSAP loader ────────────────────────────────────────────────────────────
function useGSAP(cb, deps = []) {
  useEffect(() => {
    let cleanup;
    const load = async () => {
      if (!window.gsap) {
        await new Promise((res) => {
          const s = document.createElement("script");
          s.src =
            "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
          s.onload = res;
          document.head.appendChild(s);
        });
      }
      cleanup = cb(window.gsap);
    };
    load();
    return () => typeof cleanup === "function" && cleanup();
  }, deps); // eslint-disable-line
}

// ── Data ───────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Total User",
    value: "40,689",
    emoji: "👥",
    trend: "+8.5%",
    up: true,
    note: "Up from yesterday",
    accent: "#7c6af7",
  },
  {
    label: "Total Order",
    value: "10293",
    emoji: "📦",
    trend: "+1.3%",
    up: true,
    note: "Up from past week",
    accent: "#f5a623",
  },
  {
    label: "Total Sales",
    value: "$89,000",
    emoji: "📈",
    trend: "-4.3%",
    up: false,
    note: "Down from yesterday",
    accent: "#22c55e",
  },
  {
    label: "Total Pending",
    value: "2040",
    emoji: "🕐",
    trend: "+1.8%",
    up: true,
    note: "Up from yesterday",
    accent: "#f97316",
  },
];

const DEALS = [
  {
    name: "Apple Watch",
    loc: "6096 Marjolaine Landing",
    date: "12.09.2026 - 12.53 PM",
    qty: 423,
    amt: "$34,295",
    status: "Delivered",
    sc: "#22c55e",
    ai: 0,
    emoji: "⌚",
  },
  {
    name: "MacBook Pro",
    loc: "2048 Silicon Valley Blvd",
    date: "11.09.2026 - 09.14 AM",
    qty: 87,
    amt: "$212,430",
    status: "Pending",
    sc: "#f59e0b",
    ai: 1,
    emoji: "💻",
  },
  {
    name: "AirPods Max",
    loc: "1337 Cupertino Ave",
    date: "10.09.2026 - 03.45 PM",
    qty: 310,
    amt: "$97,100",
    status: "Delivered",
    sc: "#22c55e",
    ai: 2,
    emoji: "🎧",
  },
  {
    name: "iPad Ultra",
    loc: "512 Infinite Loop",
    date: "09.09.2026 - 11.20 AM",
    qty: 154,
    amt: "$61,600",
    status: "Cancelled",
    sc: "#ef4444",
    ai: 3,
    emoji: "📱",
  },
];

const CHART_PTS = [20, 42, 48, 85, 52, 55, 22, 30, 68, 58, 62, 50];
const CHART_LABELS = [
  "5k",
  "10k",
  "15k",
  "20k",
  "25k",
  "30k",
  "35k",
  "40k",
  "45k",
  "50k",
  "55k",
  "60k",
];

// ── Canvas chart ───────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function SalesChart() {
  const canvasRef = useRef(null);

  const draw = useCallback((hoverIdx = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth,
      H = 220;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const pad = { t: 20, r: 16, b: 36, l: 44 };
    const cw = W - pad.l - pad.r,
      ch = H - pad.t - pad.b;

    // Grid
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 1;
    [0, 20, 40, 60, 80, 100].forEach((v) => {
      const y = pad.t + ch * (1 - v / 100);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + cw, y);
      ctx.stroke();
      ctx.fillStyle = "#5a6578";
      ctx.font = "11px Inter,sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(v + "%", pad.l - 6, y + 4);
    });

    // X labels
    CHART_PTS.forEach((_, i) => {
      const x = pad.l + i * (cw / (CHART_PTS.length - 1));
      ctx.fillStyle = "#5a6578";
      ctx.font = "11px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(CHART_LABELS[i], x, H - 8);
    });

    const coords = CHART_PTS.map((v, i) => ({
      x: pad.l + i * (cw / (CHART_PTS.length - 1)),
      y: pad.t + ch * (1 - v / 100),
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    grad.addColorStop(0, "rgba(59,130,246,.35)");
    grad.addColorStop(1, "rgba(59,130,246,.01)");
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      const p = coords[i - 1],
        c = coords[i],
        cpx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(cpx, p.y, cpx, c.y, c.x, c.y);
    }
    ctx.lineTo(coords[coords.length - 1].x, pad.t + ch);
    ctx.lineTo(coords[0].x, pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      const p = coords[i - 1],
        c = coords[i],
        cpx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(cpx, p.y, cpx, c.y, c.x, c.y);
    }
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    coords.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
    });

    // Peak tooltip (index 3)
    const peak = coords[3];
    const bw = 104,
      bh = 28;
    ctx.fillStyle = "#3b82f6";
    roundRect(ctx, peak.x - bw / 2, peak.y - bh - 10, bw, bh, 6);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Inter,sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("64,3664.77", peak.x, peak.y - bh - 10 + 18);
    ctx.beginPath();
    ctx.moveTo(peak.x - 5, peak.y - 10);
    ctx.lineTo(peak.x + 5, peak.y - 10);
    ctx.lineTo(peak.x, peak.y - 4);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(peak.x, peak.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#1e2535";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hover
    if (hoverIdx !== null) {
      const { x, y } = coords[hoverIdx];
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#60a5fa";
      ctx.fill();
      ctx.strokeStyle = "#1e2535";
      ctx.lineWidth = 2;
      ctx.stroke();
      const tx = x + bw / 2 > W ? x - bw - 8 : x - bw / 2;
      ctx.fillStyle = "#1e2535";
      roundRect(ctx, tx, y - 46, bw, 30, 6);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      roundRect(ctx, tx, y - 46, bw, 30, 6);
      ctx.stroke();
      ctx.fillStyle = "#60a5fa";
      ctx.font = "bold 12px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(CHART_LABELS[hoverIdx], tx + bw / 2, y - 31);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "12px Inter,sans-serif";
      ctx.fillText(CHART_PTS[hoverIdx] + "%", tx + bw / 2, y - 16);
    }
  }, []);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(() => draw());
    obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [draw]);

  const onMouseMove = useCallback(
    (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const pad = { l: 44 },
        cw = canvasRef.current.offsetWidth - pad.l - 16;
      let closest = 0,
        minD = Infinity;
      CHART_PTS.forEach((_, i) => {
        const x = pad.l + i * (cw / (CHART_PTS.length - 1));
        const d = Math.abs(x - mx);
        if (d < minD) {
          minD = d;
          closest = i;
        }
      });
      draw(closest);
    },
    [draw],
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", display: "block", cursor: "crosshair" }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => draw()}
    />
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const cardRefs = useRef([]);
  const chartRef = useRef(null);
  const dealsRef = useRef(null);

  useGSAP((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(
      cardRefs.current,
      { y: 50, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.1 },
    )
      .fromTo(
        chartRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=.2",
      )
      .fromTo(
        dealsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=.3",
      );

    cardRefs.current.forEach((el, i) => {
      gsap.to(el, {
        boxShadow: `0 0 24px 2px ${STATS[i].accent}28`,
        duration: 2,
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
        ease: "sine.inOut",
      });
    });
  }, []);

  const onCardEnter = (i) =>
    window.gsap?.to(cardRefs.current[i], {
      y: -4,
      scale: 1.03,
      duration: 0.22,
      ease: "power2.out",
    });
  const onCardLeave = (i) =>
    window.gsap?.to(cardRefs.current[i], {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: "power2.inOut",
    });

  return (
    <div style={S.root}>
      {/* Stat Cards */}
      <div style={S.cards}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            ref={(el) => (cardRefs.current[i] = el)}
            style={{ ...S.card, borderTop: `2px solid ${s.accent}60` }}
            onMouseEnter={() => onCardEnter(i)}
            onMouseLeave={() => onCardLeave(i)}
          >
            <div style={S.cardTop}>
              <div>
                <div style={S.cardLabel}>{s.label}</div>
                <div style={S.cardValue}>{s.value}</div>
              </div>
              <div
                style={{
                  ...S.iconBubble,
                  background: s.accent + "25",
                  color: s.accent,
                }}
              >
                {s.emoji}
              </div>
            </div>
            <div
              style={{ ...S.cardTrend, color: s.up ? "#22c55e" : "#ef4444" }}
            >
              {s.up ? "↑" : "↓"} {s.trend}&nbsp;
              <span style={S.cardNote}>{s.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <section ref={chartRef} style={S.panel}>
        <div style={S.panelHdr}>
          <h2 style={S.panelTitle}>Sales Details</h2>
          <select style={S.select}>
            <option>October</option>
          </select>
        </div>
        <SalesChart />
      </section>

      {/* Deals Table */}
      <section ref={dealsRef} style={S.panel}>
        <div style={S.panelHdr}>
          <h2 style={S.panelTitle}>Deals Details</h2>
          <select style={S.select}>
            <option>October</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={S.tableHead}>
            {[
              "Product Name",
              "Location",
              "Date · Time",
              "Piece",
              "Amount",
              "Status",
            ].map((h) => (
              <span key={h} style={S.th}>
                {h}
              </span>
            ))}
          </div>
          {DEALS.map((d, i) => (
            <DealRow key={d.name} d={d} i={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function DealRow({ d, i }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      style={S.tableRow}
      onMouseEnter={() =>
        window.gsap?.to(ref.current, {
          x: 6,
          backgroundColor: "#ffffff08",
          duration: 0.18,
          ease: "power2.out",
        })
      }
      onMouseLeave={() =>
        window.gsap?.to(ref.current, {
          x: 0,
          backgroundColor: "transparent",
          duration: 0.2,
          ease: "power2.inOut",
        })
      }
    >
      <div style={S.productCell}>
        <div
          style={{
            ...S.prodIcon,
            background: STATS[d.ai].accent + "20",
            color: STATS[d.ai].accent,
          }}
        >
          {d.emoji}
        </div>
        <span style={S.td}>{d.name}</span>
      </div>
      <span style={{ ...S.td, ...S.tdMuted }}>{d.loc}</span>
      <span style={{ ...S.td, ...S.tdMuted }}>{d.date}</span>
      <span style={S.td}>{d.qty}</span>
      <span style={{ ...S.td, fontWeight: 700 }}>{d.amt}</span>
      <span
        style={{
          ...S.badge,
          background: d.sc + "20",
          color: d.sc,
          border: `1px solid ${d.sc}40`,
        }}
      >
        {d.status}
      </span>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  root: {
    background: "#1a1f2e",
    color: "#e2e8f0",
    fontFamily: "'Inter','Segoe UI',sans-serif",
    minHeight: "100vh",
    padding: "24px 20px 40px",
    boxSizing: "border-box",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    background: "#1e2535",
    borderRadius: 14,
    padding: "18px 20px",
    cursor: "pointer",
    willChange: "transform",
    opacity: 0,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: "#8892a4",
    marginBottom: 6,
    fontWeight: 500,
  },
  cardValue: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  cardTrend: {
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  cardNote: { color: "#5a6578", fontWeight: 400 },
  panel: {
    background: "#1e2535",
    borderRadius: 16,
    padding: "22px 24px",
    marginBottom: 20,
    opacity: 0,
  },
  panelHdr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  panelTitle: { fontSize: 17, fontWeight: 700 },
  select: {
    background: "#151b28",
    border: "1px solid #2d3748",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    outline: "none",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "2fr 2.5fr 2fr 0.7fr 1.1fr 1.1fr",
    padding: "0 10px 10px",
    borderBottom: "1px solid #2a3347",
    marginBottom: 4,
    minWidth: 620,
  },
  th: {
    fontSize: 11,
    fontWeight: 600,
    color: "#5a6578",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 2.5fr 2fr 0.7fr 1.1fr 1.1fr",
    alignItems: "center",
    padding: "10px 10px",
    borderRadius: 10,
    cursor: "pointer",
    willChange: "transform",
    minWidth: 620,
  },
  productCell: { display: "flex", alignItems: "center", gap: 10 },
  prodIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  td: { fontSize: 13, fontWeight: 500 },
  tdMuted: { fontSize: 12, color: "#6b7585" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
};
