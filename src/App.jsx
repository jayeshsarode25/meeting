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

const OWNER_EMAIL = "vronixdigital@gmail.com";

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
      background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)",
      borderRadius: 24, padding: 24, width: "100%", maxWidth: 380,
      boxShadow: "0 8px 32px rgba(124,58,237,0.12)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={prevMonth} style={{
          width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.2)",
          background: "rgba(255,255,255,0.7)", color: "#7c3aed",
          cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
        }}>‹</button>
        <p style={{ color: "#4c1d95", fontWeight: 600, fontSize: 15, letterSpacing: "0.3px" }}>{monthLabel}</p>
        <button onClick={nextMonth} style={{
          width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.2)",
          background: "rgba(255,255,255,0.7)", color: "#7c3aed",
          cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
        }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8, textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 500 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
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

          let bg = "transparent", color = "#c4b5fd", border = "none", cursor = "default";
          if (!isPast && !isSunday) { bg = "rgba(255,255,255,0.7)"; color = "#7c3aed"; border = "1px solid rgba(139,92,246,0.2)"; cursor = "pointer"; }
          if (isSunday && !isPast) { color = "#c4b5fd"; }
          if (hasBooking) { bg = "rgba(52,211,153,0.2)"; color = "#059669"; border = "1px solid rgba(52,211,153,0.4)"; cursor = "pointer"; }
          if (isToday) { bg = "#7c3aed"; color = "#fff"; border = "none"; }

          return (
            <div key={i} onClick={() => isClickable && onDateClick(dateStr)} style={{
              aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, fontSize: 12, fontWeight: hasBooking || isToday ? 600 : 400,
              background: bg, color, border, cursor, transition: "all 0.15s",
              boxShadow: isToday ? "0 0 16px rgba(124,58,237,0.6)" : "none"
            }}>
              {d}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 16, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }} />
          <span style={{ fontSize: 10, color: "#8b5cf6" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} />
          <span style={{ fontSize: 10, color: "#8b5cf6" }}>Available</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
          <span style={{ fontSize: 10, color: "#8b5cf6" }}>Booked</span>
        </div>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
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
    width: "100%", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12,
    padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box",
    background: "rgba(139,92,246,0.05)", color: "#1e1b4b", transition: "border 0.2s"
  };

  const selectStyle = {
    border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px",
    fontSize: 12, color: "#374151", outline: "none", background: "#fff", cursor: "pointer"
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ══ HOME PAGE ════════════════════════════════════════════════════════ */}
      {page === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 16px 32px", position: "relative" }}>

          <button onClick={() => setPage("booked")} style={{
            position: "absolute", top: 16, right: 16,
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", color: "#7c3aed", border: "1px solid #ede9fe",
            borderRadius: 20, padding: "7px 14px", fontSize: 12, fontWeight: 600,
            cursor: "pointer", boxShadow: "0 1px 6px rgba(124,58,237,0.12)"
          }}>
            🗂️ Booked Slots
          </button>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1e1b4b", margin: "0 0 8px", lineHeight: 1.2 }}>
              Book a Meeting Slot
            </h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}></p>
            <button
              onClick={() => {
                const t = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                const todayStr = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
                setSlotModalDate(todayStr);
              }}
              style={{
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                color: "#fff", border: "none", borderRadius: 14,
                padding: "12px 28px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                letterSpacing: "0.3px"
              }}
            >
              📅 Book Meeting
            </button>
          </div>

          <MiniCalendar bookedSlots={bookedSlots} bookedIds={bookedIds} onDateClick={setSlotModalDate} />
          <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 28 }}>© 2026 Vronix Digital</p>
        </div>
      )}

      {/* ══ BOOKED SLOTS PAGE ════════════════════════════════════════════════ */}
      {page === "booked" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 48px" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setPage("home")} style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid #e5e7eb",
                background: "#fff", cursor: "pointer", fontSize: 16, color: "#6b7280",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}>←</button>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>Booked Slots</h2>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{bookedSlots.length} total</p>
              </div>
            </div>

            <button
              onClick={() => setShowFilter((f) => !f)}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: hasFilter ? "#7c3aed" : "#fff",
                color: hasFilter ? "#fff" : "#7c3aed",
                border: "1px solid #ede9fe", borderRadius: 20,
                padding: "7px 13px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 1px 6px rgba(124,58,237,0.10)"
              }}
            >
              📅 Filter {hasFilter && "•"}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div style={{
              background: "#fff", borderRadius: 14, padding: "14px 16px",
              marginBottom: 16, border: "1px solid #ede9fe",
              boxShadow: "0 2px 12px rgba(124,58,237,0.08)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} style={selectStyle}>
                  <option value="">All Dates</option>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{String(d).padStart(2, "0")}</option>
                  ))}
                </select>
                <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setFilterDay(""); }} style={selectStyle}>
                  <option value="">All Months</option>
                  {months.map((mn, i) => <option key={i} value={i + 1}>{mn}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => setYearRangeStart((y) => y - YEAR_PAGE)} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", background: "#fff", cursor: "pointer", fontSize: 12, color: "#7c3aed", lineHeight: 1 }}>‹</button>
                  <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterDay(""); }} style={selectStyle}>
                    <option value="">All Years</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <button onClick={() => setYearRangeStart((y) => y + YEAR_PAGE)} style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", background: "#fff", cursor: "pointer", fontSize: 12, color: "#7c3aed", lineHeight: 1 }}>›</button>
                </div>
                {hasFilter && (
                  <button onClick={clearFilter} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 8, color: "#ef4444", fontSize: 11, fontWeight: 600, padding: "6px 10px", cursor: "pointer" }}>
                    ✕ Clear
                  </button>
                )}
              </div>
              {hasFilter && (
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {filterDay && <span style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>Day: {String(filterDay).padStart(2,"0")}</span>}
                  {filterMonth && <span style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>Month: {months[Number(filterMonth) - 1]}</span>}
                  {filterYear && <span style={{ fontSize: 11, background: "#ede9fe", color: "#7c3aed", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>Year: {filterYear}</span>}
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
          </p>

          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
              <p style={{ fontSize: 14, color: "#9ca3af" }}>No bookings found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredBookings.map((b, idx) => (
                <div key={idx} style={{
                  background: "#fff", borderRadius: 16, padding: 16,
                  border: "1px solid #f0fdf4", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  borderLeft: "4px solid #34d399"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "3px 10px", borderRadius: 20 }}>📅 {formatDate(b.date)}</span>
                    <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>🕐 {b.start}–{b.end}</span>
                  </div>
                  {b.name && <p style={{ fontSize: 14, fontWeight: 600, color: "#1e1b4b", margin: "0 0 2px" }}>{b.name}</p>}
                  {b.email && <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 2px" }}>{b.email}</p>}
                  {b.designation && <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 10px" }}>💼 {b.designation}{b.company ? ` @ ${b.company}` : ""}</p>}

                  {/* ── Cancel Section ── */}
                  {cancelConfirmId === b.id ? (
                    <div style={{ background: "#fff5f5", borderRadius: 10, padding: "10px 12px", border: "1px solid #fecaca", marginTop: 4 }}>
                      <p style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, margin: "0 0 8px" }}>Cancel this booking?</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleCancel(b.id)}
                          style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                        >
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(null)}
                          style={{ flex: 1, background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Keep it
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCancelConfirmId(b.id)}
                      style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #fca5a5", borderRadius: 8, color: "#ef4444", fontSize: 11, fontWeight: 600, padding: "6px 12px", cursor: "pointer" }}
                    >
                      🗑️ Cancel Slot
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
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 50, padding: "0 12px 12px"
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 24, padding: 24,
            width: "100%", maxWidth: 400, maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b", margin: 0 }}>{formatDate(slotModalDate)}</p>
              <button onClick={closeSlotModal} style={{ background: "none", border: "none", fontSize: 18, color: "#9ca3af", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 16px" }}>Select a time slot</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DAY_SLOTS.map((t, idx) => {
                const slotId = `slot-${slotModalDate}-${t.start}`;
                const isBooked = bookedIds.includes(slotId);
                return (
                  <button key={idx} onClick={() => !isBooked && pickSlot(t)} disabled={isBooked} style={{
                    border: isBooked ? "1.5px solid #a7f3d0" : "1.5px solid #ede9fe",
                    borderRadius: 12, padding: "12px 8px", fontSize: 12, fontWeight: 500,
                    cursor: isBooked ? "not-allowed" : "pointer",
                    background: isBooked ? "#f0fdf4" : "#faf5ff",
                    color: isBooked ? "#059669" : "#7c3aed",
                    transition: "all 0.15s", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 2
                  }}>
                    <span>🕐 {t.start}–{t.end}</span>
                    {isBooked && <span style={{ fontSize: 10, color: "#34d399" }}>✓ Booked</span>}
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
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 50, padding: "0 12px 12px"
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 24, padding: 24,
            width: "100%", maxWidth: 400, maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b", margin: 0 }}>Your Details</p>
              <button onClick={closeFormModal} style={{ background: "none", border: "none", fontSize: 18, color: "#9ca3af", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ background: "linear-gradient(135deg,#1a1a2e,#0f3460)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: "rgba(167,139,250,0.8)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", margin: "0 0 6px" }}>Your Booking</p>
              <p style={{ fontSize: 13, color: "#e9d5ff", fontWeight: 600, margin: "0 0 2px" }}>📅 {formatDate(selectedSlot.date)}</p>
              <p style={{ fontSize: 12, color: "rgba(167,139,250,0.8)", margin: 0 }}>🕐 {selectedSlot.start}–{selectedSlot.end} IST</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Full Name", value: name, set: setName, placeholder: "Your name", type: "text" },
                { label: "Email Address", value: email, set: setEmail, placeholder: "you@example.com", type: "email" },
                { label: "Designation", value: designation, set: setDesignation, placeholder: "e.g. Marketing Manager", type: "text" },
                { label: "Company Name", value: company, set: setCompany, placeholder: "Your company", type: "text" },
              ].map(({ label, value, set, placeholder, type }) => (
                <div key={label}>
                  <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
                  <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
            <button onClick={handleConfirm} style={{
              width: "100%", background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff", border: "none", borderRadius: 14, padding: "14px 0",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)", letterSpacing: "0.3px"
            }}>
              📅 Confirm & Open Google Calendar
            </button>
          </div>
        </div>
      )}

      {/* ══ BOOKING SUCCESS TOAST ════════════════════════════════════════════ */}
      {bookedToast && (
        <div style={{
          position: "fixed", bottom: 24, left: 16, right: 16,
          background: "linear-gradient(135deg,#1a1a2e,#0f3460)",
          borderRadius: 18, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)", zIndex: 60,
          border: "1px solid rgba(52,211,153,0.3)"
        }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#34d399)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(52,211,153,0.5)" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, margin: "0 0 2px" }}>Booking Confirmed!</p>
            <p style={{ fontSize: 12, color: "rgba(52,211,153,0.8)", margin: 0 }}>Opening Google Calendar...</p>
          </div>
          <button onClick={() => setBookedToast(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* ══ CANCEL SUCCESS TOAST ═════════════════════════════════════════════ */}
      {cancelToast && (
        <div style={{
          position: "fixed", bottom: 24, left: 16, right: 16,
          background: "#1f2937", borderRadius: 18, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)", zIndex: 60,
          border: "1px solid rgba(239,68,68,0.3)"
        }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, margin: "0 0 2px" }}>Slot Cancelled</p>
            <p style={{ fontSize: 12, color: "rgba(252,165,165,0.8)", margin: 0 }}>The booking has been removed.</p>
          </div>
          <button onClick={() => setCancelToast(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
      )}

    </div>
  );
}