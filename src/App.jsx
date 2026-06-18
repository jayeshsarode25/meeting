import { useState, useEffect } from "react";

function generateDaySlots() {
  const slots = [];
  for (let h = 9; h < 21; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    slots.push({ start, end });
  }
  return slots;
}

const DAY_SLOTS = generateDaySlots();

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function toGCal(dateStr, time) {
  return dateStr.replaceAll("-", "") + "T" + time.replaceAll(":", "") + "00Z";
}

const OWNER_EMAIL = "info@vronixdigital.com";
const BACKGROUND_IMAGE_URL = `${import.meta.env.BASE_URL}image.png`;

// Full-screen HD background image (embedded so it always renders in preview)

// ── Mini Calendar ────────────────────────────────────────────────────────────
function MiniCalendar({ bookedSlots, bookedIds, onDateClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const pad = (n) => String(n).padStart(2, "0");
  const dateStrFor = (d) => `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const monthLabel = firstDay.toLocaleString("en", { month: "long", year: "numeric" });
  const bookedDates = new Set(bookedSlots.map((b) => b.date));

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(8,47,73,0.82) 0%, rgba(6,78,59,0.72) 100%)",
      borderRadius: 24, padding: "26px 26px 36px", width: "100%", maxWidth: 400, margin: "0 auto", boxSizing: "border-box",
      boxShadow: "0 8px 32px rgba(13,148,136,0.3)", border: "1px solid #0d9488", backdropFilter: "blur(10px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={{
          width: 34, height: 34, borderRadius: "50%", border: "1px solid #0d9488",
          background: "rgba(255,255,255,0.1)", color: "#5eead4",
          cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
        }} onMouseEnter={(e) => { e.target.style.background = "rgba(13,148,136,0.2)"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}>‹</button>
        <p style={{ color: "#5eead4", fontWeight: 600, fontSize: 16, letterSpacing: "0.3px" }}>{monthLabel}</p>
        <button onClick={nextMonth} style={{
          width: 34, height: 34, borderRadius: "50%", border: "1px solid #0d9488",
          background: "rgba(255,255,255,0.1)", color: "#5eead4",
          cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
        }} onMouseEnter={(e) => { e.target.style.background = "rgba(13,148,136,0.2)"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8, textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const cellDate = new Date(viewYear, viewMonth, d);
          const dateStr = dateStrFor(d);
          const isToday = cellDate.getTime() === today.getTime();
          const isPast = cellDate < today;
          const dow = cellDate.getDay();
          const isSunday = dow === 0;
          const hasBooking = bookedDates.has(dateStr);
          const isClickable = !isPast && !isSunday;

          let bg = "transparent", color = "#9ca3af", border = "none", cursor = "default";
          if (!isPast && !isSunday) { bg = "rgba(13,148,136,0.2)"; color = "#fff"; border = "1px solid #0d9488"; cursor = "pointer"; }
          if (isSunday && !isPast) { color = "#6b7280"; }
          if (hasBooking) { bg = "rgba(52,211,153,0.2)"; color = "#34d399"; border = "1px solid #34d399"; cursor = "pointer"; }
          if (isToday) { bg = "#0d9488"; color = "#fff"; border = "none"; }

          return (
            <div key={i} onClick={() => isClickable && onDateClick(dateStr)} style={{
              aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 9, fontSize: 13, fontWeight: hasBooking || isToday ? 600 : 400,
              background: bg, color, border, cursor, transition: "all 0.15s",
              boxShadow: isToday ? "0 0 16px rgba(13,148,136,0.8)" : "none"
            }}>
              {d}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 22, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#0d9488" }} />
          <span style={{ fontSize: 11, color: "#5eead4" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#6b7280" }} />
          <span style={{ fontSize: 11, color: "#5eead4" }}>Available</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: 11, color: "#5eead4" }}>Booked</span>
        </div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
// Header Component
function Header({ page, onPageChange }) {
  return (
    <div style={{
backgroundImage: `url("${BACKGROUND_IMAGE_URL}")`,
 backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      padding: "20px 24px",
      boxShadow: "0 4px 20px rgba(13,148,136,0.15)",
      position: "sticky",
      top: 0,
      zIndex: 40
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onPageChange("home")}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            📅
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Vronix Digital</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600, letterSpacing: "0.5px" }}>MEETING SCHEDULER</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [slotModalDate, setSlotModalDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [company, setCompany] = useState("");
  const [bookedToast, setBookedToast] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  const [bookedIds, setBookedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("booked_ids") || "[]"); } catch { return []; }
  });
  const [bookedSlots, setBookedSlots] = useState(() => {
    try { return JSON.parse(localStorage.getItem("booked_slots") || "[]"); } catch { return []; }
  });

  const today = new Date();
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const currentYear = today.getFullYear();
  const [filterYear, setFilterYear] = useState(String(currentYear));
  const YEAR_PAGE = 8;
  const [yearRangeStart, setYearRangeStart] = useState(currentYear - 2);
  const years = Array.from({ length: YEAR_PAGE }, (_, i) => yearRangeStart + i);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = filterMonth
    ? new Date(filterYear || today.getFullYear(), Number(filterMonth), 0).getDate()
    : 31;

  useEffect(() => { localStorage.setItem("booked_ids", JSON.stringify(bookedIds)); }, [bookedIds]);
  useEffect(() => { localStorage.setItem("booked_slots", JSON.stringify(bookedSlots)); }, [bookedSlots]);

  const closeSlotModal = () => setSlotModalDate(null);
  const closeFormModal = () => { setSelectedSlot(null); setName(""); setEmail(""); setDesignation(""); setCompany(""); };
  const pickSlot = (slot) => { setSelectedSlot({ date: slotModalDate, ...slot }); setSlotModalDate(null); };

  const handleConfirm = () => {
    if (!name.trim() || !email.trim() || !designation.trim() || !company.trim()) {
      alert("Please fill in all fields."); return;
    }
    const { date, start, end } = selectedSlot;
    const slotId = `slot-${date}-${start}`;
    const title = `Consultation with ${name}`;
    const details = `Name: ${name}\nEmail: ${email}\nDesignation: ${designation}\nCompany: ${company}`;
    const gcalUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${toGCal(date, start)}/${toGCal(date, end)}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent("Google Meet")}` +
      `&add=${encodeURIComponent(OWNER_EMAIL)}`;
    setBookedIds((prev) => [...prev, slotId]);
    setBookedSlots((prev) => [...prev, { id: slotId, date, start, end, name, email, designation, company }]);
    closeFormModal();
    setBookedToast(true);
    setTimeout(() => setBookedToast(false), 4000);
    window.location.href = gcalUrl;
  };

  // ── Cancel handler ──────────────────────────────────────────────────────
  const handleCancel = (slotId) => {
    setBookedIds((prev) => prev.filter((id) => id !== slotId));
    setBookedSlots((prev) => prev.filter((b) => b.id !== slotId));
    setCancelConfirmId(null);
    setCancelToast(true);
    setTimeout(() => setCancelToast(false), 3500);
  };

  const filteredBookings = bookedSlots
    .filter((b) => {
      const [y, m, d] = b.date.split("-").map(Number);
      if (filterYear && y !== Number(filterYear)) return false;
      if (filterMonth && m !== Number(filterMonth)) return false;
      if (filterDay && d !== Number(filterDay)) return false;
      return true;
    })
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  const hasFilter = filterDay || filterMonth || filterYear;
  const clearFilter = () => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); };

  const inputStyle = {
    width: "100%", border: "1px solid rgba(20,184,166,0.25)", borderRadius: 12,
    padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box",
    background: "rgba(20,184,166,0.05)", color: "#1e1b4b", transition: "border 0.2s"
  };

  const selectStyle = {
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px",
    fontSize: 12, color: "#374151", outline: "none", background: "#fff", cursor: "pointer"
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundImage: `url("${BACKGROUND_IMAGE_URL}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }}
>
      

      {/* ══ HOME PAGE ════════════════════════════════════════════════════════ */}
      {page === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 16px 32px", position: "relative" }}>

          <button onClick={() => setPage("booked")} style={{
            position: "absolute", top: 5, right: 16,
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255, 255, 255, 0.1)", color: "#42e9d0", border: "1px solid #0d9488",
            borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 2px 12px rgba(13,148,136,0.25)",
            transition: "all 0.2s", backdropFilter: "blur(10px)"
          }} onMouseEnter={(e) => { e.target.style.boxShadow = "0 4px 20px rgba(121, 233, 223, 0.4)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.boxShadow = "0 2px 12px rgba(107, 215, 206, 0.25)"; e.target.style.transform = "translateY(0)"; }}>
            🗂️ View Bookings
          </button>

          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 48, width: "100%", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "left", marginBottom: 40, maxWidth: 600, flex: "1 1 420px" }}>
            <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(13,148,136,0.2)", borderRadius: 20, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#062d27", fontWeight: 700, letterSpacing: "0.5px" }}>✨ PROFESSIONAL MEETING SCHEDULING</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: "#ffffff", margin: "0 0 16px", lineHeight: 1.2, letterSpacing: "-1px" }}>
              Schedule Your Meeting with<br /><span style={{ background: "linear-gradient(135deg, #c0fffa, #ccf8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Vronix Digital</span>
            </h1>
            <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 32px", lineHeight: 1.6 }}>
              Select your preferred date and time to meet with our team. Quick, simple, and professional.
            </p>
            <button
              onClick={() => {
                const t = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                const todayStr = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
                setSlotModalDate(todayStr);
              }}
              style={{
                background: "linear-gradient(135deg, #0d9488, #22d3ee)",
                color: "#fff", border: "none", borderRadius: 16,
                padding: "16px 40px", fontSize: 16, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 8px 32px rgba(13,148,136,0.4)",
                letterSpacing: "0.3px", transition: "all 0.3s",
                display: "inline-block"
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = "0 12px 48px rgba(13,148,136,0.6)"; e.target.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = "0 8px 32px rgba(13,148,136,0.4)"; e.target.style.transform = "translateY(0)"; }}
            >
              📅 Book Your Slot Now
            </button>
          </div>

          <div style={{ maxWidth: 480, width: "100%", margin: "0 auto", flex: "1 1 400px" }}>
            <MiniCalendar bookedSlots={bookedSlots} bookedIds={bookedIds} onDateClick={setSlotModalDate} />
          </div>
          </div>

          <div style={{ marginTop: 48, textAlign: "center", paddingTop: 32, borderTop: "1px solid rgba(13,148,136,0.2)" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#5eead4", margin: "0 0 8px" }}>© 2026 Vronix Digital</p>
            <p style={{ fontSize: 12, color: "#ffffff", margin: 0 }}>Professional Consultation & Scheduling</p>
          </div>
        </div>
      )}

      {/* ══ BOOKED SLOTS PAGE ════════════════════════════════════════════════ */}
      {page === "booked" && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px 48px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => setPage("home")} style={{
                width: 40, height: 40, borderRadius: 12, border: "1px solid #0d9488",
                background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 18, color: "#5eead4",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(13,148,136,0.15)", transition: "all 0.2s", backdropFilter: "blur(10px)"
              }} onMouseEnter={(e) => { e.target.style.boxShadow = "0 4px 16px rgba(13,148,136,0.25)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.boxShadow = "0 2px 8px rgba(13,148,136,0.15)"; e.target.style.transform = "translateY(0)"; }}>←</button>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>BOOKED SLOTS</h2>
              <p style={{ fontSize: 13, color: "#5eead4", margin: "4px 0 0" }}>Vronix Digital</p>
            </div>

            <button
              onClick={() => setShowFilter((f) => !f)}
              style={{
                justifySelf: "end",
                display: "flex", alignItems: "center", gap: 6,
                background: hasFilter ? "linear-gradient(135deg, #0d9488, #22d3ee)" : "rgba(255,255,255,0.1)",
                color: hasFilter ? "#fff" : "#5eead4",
                border: "1px solid #0d9488", borderRadius: 12,
                padding: "10px 14px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 2px 8px rgba(13,148,136,0.15)", transition: "all 0.2s", backdropFilter: "blur(10px)"
              }}
              onMouseEnter={(e) => { e.target.style.boxShadow = "0 4px 16px rgba(13,148,136,0.25)"; }}
              onMouseLeave={(e) => { e.target.style.boxShadow = "0 2px 8px rgba(13,148,136,0.15)"; }}
            >
              🔍 Filter {hasFilter && "•"}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div style={{
              background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px",
              marginBottom: 20, border: "1px solid #0d9488",
              boxShadow: "0 4px 20px rgba(13,148,136,0.2)", backdropFilter: "blur(10px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} style={{...selectStyle, background: "rgba(255,255,255,0.1)", color: "#5eead4", border: "1px solid #0d9488", backdropFilter: "blur(10px)"}}>
                  <option value="">All Dates</option>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                  ))}
                </select>
                <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDay(""); }} style={{...selectStyle, background: "rgba(255,255,255,0.1)", color: "#5eead4", border: "1px solid #0d9488", backdropFilter: "blur(10px)"}}>
                  <option value="">All Months</option>
                  {months.map((mn, i) => <option key={i} value={i + 1}>{mn}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setYearRangeStart((y) => y - YEAR_PAGE)} style={{ border: "1px solid #0d9488", borderRadius: 8, padding: "6px 10px", background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 12, color: "#5eead4", lineHeight: 1, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "rgba(13,148,136,0.2)"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}>‹</button>
                  <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterDay(""); }} style={{...selectStyle, background: "rgba(255,255,255,0.1)", color: "#5eead4", border: "1px solid #0d9488", backdropFilter: "blur(10px)"}}>
                    <option value="">All Years</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button onClick={() => setYearRangeStart((y) => y + YEAR_PAGE)} style={{ border: "1px solid #0d9488", borderRadius: 8, padding: "6px 10px", background: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 12, color: "#5eead4", lineHeight: 1, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "rgba(13,148,136,0.2)"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}>›</button>
                </div>
                {hasFilter && (
                  <button onClick={clearFilter} style={{ background: "none", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", fontSize: 12, fontWeight: 600, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.1)"; }} onMouseLeave={(e) => { e.target.style.background = "none"; }}>
                    ✕ Clear Filters
                  </button>
                )}
              </div>
              {hasFilter && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {filterDay && <span style={{ fontSize: 12, background: "rgba(13,148,136,0.3)", color: "#5eead4", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>📅 Day: {String(filterDay).padStart(2,"0")}</span>}
                  {filterMonth && <span style={{ fontSize: 12, background: "rgba(13,148,136,0.3)", color: "#5eead4", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>📆 Month: {months[Number(filterMonth) - 1]}</span>}
                  {filterYear && <span style={{ fontSize: 12, background: "rgba(13,148,136,0.3)", color: "#5eead4", borderRadius: 20, padding: "4px 12px", fontWeight: 600 }}>📅 Year: {filterYear}</span>}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 13, color: "#d1d5db", marginBottom: 16, fontWeight: 600 }}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""}
          </p>

          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "rgba(255,255,255,0.08)", borderRadius: 16, border: "1px solid #0d9488", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>No bookings yet</p>
              <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 20 }}>Start by booking your first meeting</p>
              <button onClick={() => setPage("home")} style={{
                background: "linear-gradient(135deg, #0d9488, #22d3ee)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "10px 24px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s"
              }} onMouseEnter={(e) => { e.target.style.boxShadow = "0 8px 24px rgba(13,148,136,0.3)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.boxShadow = "0 4px 12px rgba(13,148,136,0.1)"; e.target.style.transform = "translateY(0)"; }}>
                📅 Book Now
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredBookings.map((b, idx) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 18,
                  border: "1px solid #0d9488", boxShadow: "0 2px 12px rgba(13,148,136,0.1)",
                  borderLeft: "4px solid #5eead4", transition: "all 0.2s", backdropFilter: "blur(10px)"
                }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(13,148,136,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(13,148,136,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#5eead4", background: "rgba(13,148,136,0.2)", padding: "4px 12px", borderRadius: 20 }}>📅 {formatDate(b.date)}</span>
                    <span style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600 }}>🕐 {b.start}–{b.end}</span>
                  </div>
                  {b.name && <p style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>{b.name}</p>}
                  {b.email && <p style={{ fontSize: 13, color: "#5eead4", margin: "0 0 2px" }}>{b.email}</p>}
                  {b.designation && <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 12px" }}>💼 {b.designation}{b.company ? ` @ ${b.company}` : ""}</p>}

                  {/* ── Cancel Section ── */}
                  {cancelConfirmId === b.id ? (
                    <div style={{ background: "rgba(239,68,68,0.1)", borderRadius: 12, padding: "12px 14px", border: "1px solid #ef4444", marginTop: 6 }}>
                      <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, margin: "0 0 10px" }}>Cancel this booking?</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => handleCancel(b.id)}
                          style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.target.style.background = "#dc2626"; }}
                          onMouseLeave={(e) => { e.target.style.background = "#ef4444"; }}
                        >
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(null)}
                          style={{ flex: 1, background: "rgba(255,255,255,0.1)", color: "#5eead4", border: "1px solid #0d9488", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => { e.target.style.background = "rgba(13,148,136,0.2)"; }}
                          onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; }}
                        >
                          Keep it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCancelConfirmId(b.id)}
                      style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", fontSize: 12, fontWeight: 600, padding: "8px 12px", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={(e) => { e.target.style.background = "none"; }}
                    >
                      🗑️ Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ SLOT PICKER MODAL ════════════════════════════════════════════════ */}
      {slotModalDate && (
        <div onClick={closeSlotModal} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 50, padding: "0 12px 12px", backdropFilter: "blur(8px)"
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "linear-gradient(180deg, #1a1a2e 0%, #0f1419 100%)", borderRadius: 24, padding: 28,
            width: "100%", maxWidth: 450, maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(13,148,136,0.5)", border: "1px solid #0d9488"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: "#ffffff", margin: 0 }}>{formatDate(slotModalDate)}</p>
              <button onClick={closeSlotModal} style={{ background: "none", border: "none", fontSize: 20, color: "#9ca3af", cursor: "pointer", padding: 0, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#5eead4"; }} onMouseLeave={(e) => { e.target.style.color = "#9ca3af"; }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#5eead4", margin: "0 0 20px", fontWeight: 500 }}>Select your preferred time slot with Vronix Digital</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {DAY_SLOTS.map((t, idx) => {
                const slotId = `slot-${slotModalDate}-${t.start}`;
                const isBooked = bookedIds.includes(slotId);
                return (
                  <button key={idx} onClick={() => !isBooked && pickSlot(t)} disabled={isBooked} style={{
                    border: isBooked ? "1.5px solid #4b5563" : "1.5px solid #0d9488",
                    borderRadius: 14, padding: "14px 10px", fontSize: 13, fontWeight: 600,
                    cursor: isBooked ? "not-allowed" : "pointer",
                    background: isBooked ? "rgba(75,85,99,0.3)" : "rgba(13,148,136,0.2)",
                    color: isBooked ? "#6b7280" : "#5eead4",
                    transition: "all 0.2s", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 4, opacity: isBooked ? 0.6 : 1
                  }} onMouseEnter={(e) => { if (!isBooked) { e.target.style.background = "rgba(13,148,136,0.35)"; e.target.style.borderColor = "#5eead4"; e.target.style.boxShadow = "0 4px 12px rgba(13,148,136,0.25)"; } }} onMouseLeave={(e) => { if (!isBooked) { e.target.style.background = "rgba(13,148,136,0.2)"; e.target.style.borderColor = "#0d9488"; e.target.style.boxShadow = "none"; } }}>
                    <span>🕐 {t.start}–{t.end}</span>
                    {isBooked && <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>✓ Booked</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ BOOKING FORM MODAL ═══════════════════════════════════════════════ */}
      {selectedSlot && (
        <div onClick={closeFormModal} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 50, padding: "0 12px 12px", backdropFilter: "blur(8px)"
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "linear-gradient(180deg, #1a1a2e 0%, #0f1419 100%)", borderRadius: 24, padding: 28,
            width: "100%", maxWidth: 450, maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(13,148,136,0.5)", animation: "slideUp 0.3s ease-out", border: "1px solid #0d9488"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 18, color: "#ffffff", margin: 0 }}>Complete Your Details</p>
                <p style={{ fontSize: 12, color: "#5eead4", margin: "6px 0 0" }}>Vronix Digital</p>
              </div>
              <button onClick={closeFormModal} style={{ background: "none", border: "none", fontSize: 20, color: "#9ca3af", cursor: "pointer", padding: 0, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#5eead4"; }} onMouseLeave={(e) => { e.target.style.color = "#9ca3af"; }}>✕</button>
            </div>
            <div style={{ background: "linear-gradient(135deg, #0d9488, #22d3ee)", borderRadius: 16, padding: "18px 20px", marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 8px" }}>📅 Your Selected Slot</p>
              <p style={{ fontSize: 16, color: "#fff", fontWeight: 700, margin: "0 0 4px" }}>{formatDate(selectedSlot.date)}</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 600 }}>🕐 {selectedSlot.start}–{selectedSlot.end} IST</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Full Name", value: name, set: setName, placeholder: "John Doe", type: "text" },
                { label: "Email Address", value: email, set: setEmail, placeholder: "you@example.com", type: "email" },
                { label: "Your Designation", value: designation, set: setDesignation, placeholder: "e.g. Marketing Manager", type: "text" },
                { label: "Company Name", value: company, set: setCompany, placeholder: "Your company", type: "text" },
              ].map(({ label, value, set, placeholder, type }) => (
                <div key={label}>
                  <label style={{ fontSize: 12, color: "#5eead4", fontWeight: 700, display: "block", marginBottom: 6, letterSpacing: "0.3px" }}>{label}</label>
                  <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={{
                    width: "100%", border: "1.5px solid #0d9488", borderRadius: 12,
                    padding: "12px 14px", fontSize: 14, outline: "none", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.08)", color: "#ffffff", transition: "all 0.2s", fontWeight: 500, backdropFilter: "blur(10px)"
                  }} onFocus={(e) => { e.target.style.borderColor = "#22d3ee"; e.target.style.background = "rgba(13,148,136,0.15)"; }} onBlur={(e) => { e.target.style.borderColor = "#0d9488"; e.target.style.background = "rgba(255,255,255,0.08)"; }} />
                </div>
              ))}
            </div>
            <button onClick={handleConfirm} style={{
              width: "100%", background: "linear-gradient(135deg, #0d9488, #22d3ee)",
              color: "#fff", border: "none", borderRadius: 14, padding: "16px 0",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(13,148,136,0.4)", letterSpacing: "0.3px", transition: "all 0.2s"
            }} onMouseEnter={(e) => { e.target.style.boxShadow = "0 12px 48px rgba(13,148,136,0.6)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.boxShadow = "0 8px 32px rgba(13,148,136,0.4)"; e.target.style.transform = "translateY(0)"; }}>
              📅 Confirm & Open Google Calendar
            </button>
            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: "16px 0 0" }}>You'll be redirected to Google Calendar to finalize the meeting</p>
          </div>
        </div>
      )}

      {/* ══ BOOKING SUCCESS TOAST ════════════════════════════════════════════ */}
      {bookedToast && (
        <div style={{
          position: "fixed", bottom: 24, left: 16, right: 16,
          background: "linear-gradient(135deg, #059669, #34d399)",
          borderRadius: 16, padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 12px 48px rgba(52,211,153,0.6)", zIndex: 60,
          border: "1px solid rgba(52,211,153,0.8)", maxWidth: 450, marginLeft: "auto", marginRight: "auto", animation: "slideUp 0.3s ease-out"
        }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 20px rgba(52,211,153,0.8)", backdropFilter: "blur(10px)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: 15, margin: "0 0 2px", letterSpacing: "-0.3px" }}>Booking Confirmed! 🎉</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: 500 }}>Opening Google Calendar to finalize...</p>
          </div>
          <button onClick={() => setBookedToast(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", padding: 0, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#fff"; }} onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.6)"; }}>✕</button>
        </div>
      )}

      {/* ══ CANCEL SUCCESS TOAST ═════════════════════════════════════════════ */}
      {cancelToast && (
        <div style={{
          position: "fixed", bottom: 24, left: 16, right: 16,
          background: "linear-gradient(135deg, #ef4444, #f87171)",
          borderRadius: 16, padding: "18px 22px",
          display: "flex", alignItems: "center", gap: 16,
          boxShadow: "0 12px 48px rgba(239,68,68,0.6)", zIndex: 60,
          border: "1px solid rgba(239,68,68,0.8)", maxWidth: 450, marginLeft: "auto", marginRight: "auto", animation: "slideUp 0.3s ease-out"
        }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(10px)" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, color: "#fff", fontSize: 15, margin: "0 0 2px", letterSpacing: "-0.3px" }}>Booking Cancelled</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: 500 }}>The slot has been freed up for others.</p>
          </div>
          <button onClick={() => setCancelToast(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", padding: 0, transition: "all 0.2s" }} onMouseEnter={(e) => { e.target.style.color = "#fff"; }} onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.6)"; }}>✕</button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
