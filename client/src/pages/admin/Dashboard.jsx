import { useCallback, useEffect, useRef, useState } from "react";
import adminOrderService from "../../services/orderService"; 

// ── GSAP loader ────────────────────────────────────────────────────────────
function useGSAP(cb, deps = []) {
  useEffect(() => {
    let cleanup;
    const load = async () => {
      if (!window.gsap) {
        await new Promise((res) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
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

// ── Canvas chart ───────────────────────────────────────────────────────────
function SalesChart({ orders }) {
  const canvasRef = useRef(null);

  const monthlyData = Array(12).fill(0);
  orders.forEach(o => {
    const month = new Date(o.createdAt).getMonth();
    monthlyData[month] += Number(o.total_price || 0);
  });
  
  const maxSales = Math.max(...monthlyData, 1);
  const CHART_PTS = monthlyData.map(v => Math.round((v / maxSales) * 100));
  const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const draw = useCallback((hoverIdx = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.offsetWidth, H = 220;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const pad = { t: 25, r: 16, b: 36, l: 54 }; // Tepa padding biroz oshirildi
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;

    // Grid chizish
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
      ctx.fillText(v + "%", pad.l - 8, y + 4);
    });

    // X o'qi yozuvlari
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

    if (coords.length === 0) return;

    // Gradient fon fill
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch);
    grad.addColorStop(0, "rgba(98, 38, 239, 0.35)");
    grad.addColorStop(1, "rgba(98, 38, 239, 0.01)");
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      const p = coords[i - 1], c = coords[i], cpx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(cpx, p.y, cpx, c.y, c.x, c.y);
    }
    ctx.lineTo(coords[coords.length - 1].x, pad.t + ch);
    ctx.lineTo(coords[0].x, pad.t + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Chiziqning o'zi
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      const p = coords[i - 1], c = coords[i], cpx = (p.x + c.x) / 2;
      ctx.bezierCurveTo(cpx, p.y, cpx, c.y, c.x, c.y);
    }
    ctx.strokeStyle = "#6226EF";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Nuqtalar (Dots)
    coords.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#6226EF";
      ctx.fill();
    });

    // 🔥 MUAMMONI YECHGAN HOVER TOOLTIP QISMI:
    if (hoverIdx !== null && CHART_PTS[hoverIdx] !== undefined) {
      const { x, y } = coords[hoverIdx];
      const bw = 115, bh = 42;
      
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#a155ff";
      ctx.fill();
      ctx.strokeStyle = "#1e2535";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Chekkalardan chiqib ketmaslik mantiqi
      const tx = x + bw / 2 > W ? W - bw - 10 : Math.max(10, x - bw / 2);
      
      // Dinamik Y o'qi (Tepaga urilsa, pastga qarab ochiladi)
      const isTooTop = y < 65;
      const ty = isTooTop ? y + 15 : y - 52;

      ctx.fillStyle = "#1e2535";
      roundRect(ctx, tx, ty, bw, bh, 8);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      roundRect(ctx, tx, ty, bw, bh, 8);
      ctx.stroke();

      // Matnlar
      ctx.fillStyle = "#a155ff";
      ctx.font = "bold 11px Inter,sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(CHART_LABELS[hoverIdx], tx + bw / 2, ty + 16);
      
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px Inter,sans-serif";
      ctx.fillText(monthlyData[hoverIdx].toLocaleString() + " so'm", tx + bw / 2, ty + 33);
    }
  }, [CHART_PTS, monthlyData]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(() => draw());
    if (canvasRef.current) obs.observe(canvasRef.current);
    return () => obs.disconnect();
  }, [draw]);

  const onMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const pad = { l: 54 }, cw = canvasRef.current.offsetWidth - pad.l - 16;
    let closest = 0, minD = Infinity;
    CHART_PTS.forEach((_, i) => {
      const x = pad.l + i * (cw / (CHART_PTS.length - 1));
      const d = Math.abs(x - mx);
      if (d < minD) { minD = d; closest = i; }
    });
    draw(closest);
  }, [draw, CHART_PTS]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", display: "block", cursor: "crosshair" }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => draw()}
    />
  );
}

// ── Main Dashboard Component ───────────────────────────────────────────────
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const cardRefs = useRef([]);
  const chartRef = useRef(null);
  const dealsRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await adminOrderService.getAllOrdersForAdmin();
        if (res.success) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error("Dashboard yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, o) => o.status === 'delivered' ? sum + Number(o.total_price || 0) : sum, 0);
  const totalPending = orders.filter(o => o.status === 'pending').length;
  const uniqueUsers = new Set(orders.map(o => o.user?.id || o.userId)).size;

  const STATS = [
    { label: "Total Users", value: uniqueUsers, emoji: "👥", accent: "#7c6af7" },
    { label: "Total Orders", value: totalOrders, emoji: "📦", accent: "#f5a623" },
    { label: "Total Sales", value: `${totalSales.toLocaleString()} so'm`, emoji: "📈", accent: "#22c55e" },
    { label: "Pending Orders", value: totalPending, emoji: "🕐", accent: "#f97316" },
  ];

  const latestDeals = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  useGSAP((gsap) => {
    if (loading) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(cardRefs.current, { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 })
      .fromTo(chartRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=.2")
      .fromTo(dealsRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=.3");

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        boxShadow: `0 0 20px 1px ${STATS[i]?.accent}15`,
        duration: 2,
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
        ease: "sine.inOut",
      });
    });
  }, [loading]);

  if (loading) return <div className="text-center pt-24 text-gray-400 font-sans">Dashboard yuklanmoqda...</div>;

  return (
    <div style={S.root}>
      {/* Stat Cards */}
      <div style={S.cards}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            ref={(el) => (cardRefs.current[i] = el)}
            style={{ ...S.card, borderTop: `2px solid ${s.accent}60` }}
            onMouseEnter={() => window.gsap?.to(cardRefs.current[i], { y: -4, scale: 1.02, duration: 0.2 })}
            onMouseLeave={() => window.gsap?.to(cardRefs.current[i], { y: 0, scale: 1, duration: 0.2 })}
          >
            <div style={S.cardTop}>
              <div>
                <div style={S.cardLabel}>{s.label}</div>
                <div style={S.cardValue}>{s.value}</div>
              </div>
              <div style={{ ...S.iconBubble, background: s.accent + "25", color: s.accent }}>
                {s.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Chart */}
      <section ref={chartRef} style={S.panel}>
        <div style={S.panelHdr}>
          <h2 style={S.panelTitle}>Sales Overview (Yillik Grafika)</h2>
        </div>
        <SalesChart orders={orders} />
      </section>

      {/* Deals Table */}
      <section ref={dealsRef} style={S.panel}>
        <div style={S.panelHdr}>
          <h2 style={S.panelTitle}>Recent Orders (Oxirgi Buyurtmalar)</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={S.tableHead}>
            {["Xaridor", "Manzil", "Sana", "Mahsulotlar soni", "Summa", "Status"].map((h) => (
              <span key={h} style={S.th}>{h}</span>
            ))}
          </div>
          {latestDeals.map((order) => {
            const totalItems = order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            return (
              <DealRow key={order.id} order={order} totalItems={totalItems} />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DealRow({ order, totalItems }) {
  const ref = useRef(null);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#00B69B';
      case 'processing': return '#6226EF';
      case 'pending': return '#FFA755';
      case 'cancelled': return '#EF3826';
      default: return '#6b7585';
    }
  };

  const sc = getStatusColor(order.status);

  return (
    <div
      ref={ref}
      style={S.tableRow}
      onMouseEnter={() => window.gsap?.to(ref.current, { backgroundColor: "#ffffff06", duration: 0.15 })}
      onMouseLeave={() => window.gsap?.to(ref.current, { backgroundColor: "transparent", duration: 0.15 })}
    >
      <div style={S.productCell}>
        <span style={{ ...S.td, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {order.user?.name || "Noma'lum Xaridor"}
        </span>
      </div>
      <div 
        style={{ ...S.td, ...S.tdMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '15px' }} 
        title={order.shipping_address}
      >
        {order.shipping_address}
      </div>
      <span style={{ ...S.td, ...S.tdMuted }}>
        {new Date(order.createdAt).toLocaleDateString('en-GB')}
      </span>
      <span style={S.td}>{totalItems} dona</span>
      <span style={{ ...S.td, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {Number(order.total_price).toLocaleString()} so'm
      </span>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            ...S.badge,
            background: sc + "15",
            color: sc,
            border: `1px solid ${sc}30`,
          }}
        >
          {order.status}
        </span>
      </div>
    </div>
  );
}

// ── Styles (Gorizontal scrollni mutloq bartaraf qiladigan o'lchamlar) ──────────
const S = {
  root: { background: "#1a1f2e", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',sans-serif", minHeight: "100vh", padding: "24px 20px 40px", boxSizing: "border-box" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 20 },
  card: { background: "#1e2535", borderRadius: 14, padding: "18px 20px", cursor: "pointer", willChange: "transform" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardLabel: { fontSize: 13, color: "#8892a4", marginBottom: 4, fontWeight: 500 },
  cardValue: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" },
  iconBubble: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  panel: { background: "#1e2535", borderRadius: 16, padding: "22px 24px", marginBottom: 20 },
  panelHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  panelTitle: { fontSize: 17, fontWeight: 700 },
  tableHead: { display: "grid", gridTemplateColumns: "1.5fr 2fr 1.2fr 1.2fr 1.3fr 1fr", padding: "0 10px 10px", borderBottom: "1px solid #2a3347", marginBottom: 4, width: "100%", boxSizing: "border-box" },
  th: { fontSize: 11, fontWeight: 600, color: "#5a6578", textTransform: "uppercase", letterSpacing: "0.06em" },
  tableRow: { display: "grid", gridTemplateColumns: "1.5fr 2fr 1.2fr 1.2fr 1.3fr 1fr", alignItems: "center", padding: "12px 10px", borderRadius: 10, cursor: "pointer", willChange: "background-color", width: "100%", boxSizing: "border-box" },
  productCell: { display: "flex", alignItems: "center", gap: 10, overflow: "hidden" },
  td: { fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" },
  tdMuted: { fontSize: 12, color: "#6b7585" },
  badge: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" },
};