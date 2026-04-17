import { useState, useEffect } from "react";

// ── Aviation Safety Dataset (Kaggle-inspired mock data) ──────────────────────
const API_BASE = 'http://localhost:8000';

const SAFETY_DB = {
  airlines: {
    "Air India": { baseScore: 7.8, incidents: 23, fatalities: 12, iata: "AI" },
    Emirates:    { baseScore: 9.5, incidents: 3,  fatalities: 0,  iata: "EK" },
    "Qatar Airways": { baseScore: 9.2, incidents: 4, fatalities: 0, iata: "QR" },
    "IndiGo":    { baseScore: 8.6, incidents: 8,  fatalities: 0,  iata: "6E" },
    "SpiceJet":  { baseScore: 6.9, incidents: 31, fatalities: 2,  iata: "SG" },
    "Vistara":   { baseScore: 8.9, incidents: 5,  fatalities: 0,  iata: "UK" },
    "Singapore Airlines": { baseScore: 9.7, incidents: 2, fatalities: 0, iata: "SQ" },
    "Lufthansa": { baseScore: 9.3, incidents: 4,  fatalities: 0,  iata: "LH" },
    "British Airways": { baseScore: 9.0, incidents: 6, fatalities: 1, iata: "BA" },
    "United Airlines": { baseScore: 8.4, incidents: 14, fatalities: 3, iata: "UA" },
    "American Airlines": { baseScore: 8.2, incidents: 16, fatalities: 4, iata: "AA" },
    "Delta Air Lines": { baseScore: 8.8, incidents: 9,  fatalities: 1, iata: "DL" },
  },
  incidents: {
    "AI": [
      { year: 2023, type: "Hydraulic failure", severity: "minor", outcome: "Safe landing" },
      { year: 2019, type: "Bird strike", severity: "minor", outcome: "Diverted to alternate" },
      { year: 2014, type: "Emergency landing", severity: "moderate", outcome: "No casualties" },
      { year: 2010, type: "Engine fire", severity: "major", outcome: "Emergency evacuation" },
    ],
    "SG": [
      { year: 2024, type: "Runway excursion", severity: "moderate", outcome: "Minor injuries" },
      { year: 2022, type: "Engine failure", severity: "major", outcome: "Emergency landing" },
      { year: 2020, type: "Landing gear malfunction", severity: "moderate", outcome: "Safe landing" },
      { year: 2019, type: "Cargo fire warning", severity: "major", outcome: "Emergency diversion" },
      { year: 2018, type: "Bird strike", severity: "minor", outcome: "Safe landing" },
    ],
    "EK": [
      { year: 2016, type: "Hard landing", severity: "minor", outcome: "No injuries" },
    ],
    "UA": [
      { year: 2023, type: "Door plug blowout", severity: "moderate", outcome: "No fatalities" },
      { year: 2021, type: "Engine failure", severity: "major", outcome: "Emergency landing" },
      { year: 2019, type: "Turbulence injuries", severity: "minor", outcome: "Medical attention" },
    ],
    "QR": [
      { year: 2022, type: "Turbulence", severity: "minor", outcome: "12 injuries" },
      { year: 2018, type: "Smoke in cabin", severity: "moderate", outcome: "Emergency diversion" },
    ],
    "DL": [
      { year: 2024, type: "Landing gear issue", severity: "minor", outcome: "Safe landing" },
      { year: 2022, type: "Turbulence", severity: "minor", outcome: "Minor injuries" },
    ],
  },
  flights: [
    { airline: "Air India", number: "AI-302", from: "DEL", to: "BOM", dep: "06:00", arr: "07:50", price: 3200 },
    { airline: "Air India", number: "AI-808", from: "DEL", to: "LHR", dep: "13:30", arr: "19:15", price: 52000 },
    { airline: "IndiGo",    number: "6E-414", from: "DEL", to: "BOM", dep: "07:15", arr: "09:10", price: 2800 },
    { airline: "SpiceJet",  number: "SG-152", from: "DEL", to: "BOM", dep: "08:00", arr: "09:55", price: 2200 },
    { airline: "Vistara",   number: "UK-875", from: "DEL", to: "BOM", dep: "09:30", arr: "11:25", price: 4100 },
    { airline: "Emirates",  number: "EK-205", from: "DEL", to: "DXB", dep: "14:00", arr: "16:30", price: 28000 },
    { airline: "Qatar Airways", number: "QR-701", from: "DEL", to: "DOH", dep: "03:00", arr: "05:15", price: 26000 },
    { airline: "Singapore Airlines", number: "SQ-404", from: "DEL", to: "SIN", dep: "23:55", arr: "08:30", price: 35000 },
    { airline: "Lufthansa", number: "LH-761", from: "DEL", to: "FRA", dep: "12:30", arr: "17:45", price: 48000 },
    { airline: "Delta Air Lines", number: "DL-234", from: "JFK", to: "LAX", dep: "08:00", arr: "11:30", price: 18000 },
    { airline: "United Airlines", number: "UA-789", from: "ORD", to: "SFO", dep: "10:45", arr: "13:20", price: 16500 },
    { airline: "British Airways", number: "BA-117", from: "LHR", to: "JFK", dep: "11:15", arr: "14:30", price: 42000 },
  ]
};

function getIATA(airlineName) {
  return SAFETY_DB.airlines[airlineName]?.iata || "";
}

async function fetchSafetyCheck(airline, flight_number, departure = "", arrival = "") {
  const response = await fetch(`${API_BASE}/safety-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ airline, flight_number, departure, arrival })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Backend request failed');
  }

  return await response.json();
}

function getRiskLevel(score) {
  if (score >= 8.5) return { label: "Safe", color: "green", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", glow: "shadow-emerald-500/30" };
  if (score >= 7.0) return { label: "Moderate Risk", color: "yellow", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/40", glow: "shadow-amber-500/30" };
  return { label: "High Risk", color: "red", bg: "bg-red-500", text: "text-red-400", border: "border-red-500/40", glow: "shadow-red-500/30" };
}

function computeSafetyScore(airline, flightNumber) {
  const data = SAFETY_DB.airlines[airline];
  if (!data) return null;
  let score = data.baseScore;
  // Slight variation by flight number hash
  const hash = flightNumber.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  score += ((hash % 5) - 2) * 0.1;
  return Math.max(4, Math.min(10, parseFloat(score.toFixed(1))));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskGauge({ score }) {
  const pct = ((score - 0) / 10) * 100;
  const risk = getRiskLevel(score);
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const dashArr = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="12"/>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={score >= 8.5 ? "#10b981" : score >= 7.0 ? "#f59e0b" : "#ef4444"}
          strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dashArr} ${circ}`}
          transform="rotate(-90 64 64)"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"}}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="22" fontWeight="700" fontFamily="'DM Mono', monospace">{score}</text>
        <text x="50%" y="68%" dominantBaseline="middle" textAnchor="middle"
          fill="#94a3b8" fontSize="9" fontFamily="'DM Sans', sans-serif">/ 10</text>
      </svg>
      <span className={`text-sm font-bold tracking-wider uppercase ${risk.text}`}>{risk.label}</span>
    </div>
  );
}

function Badge({ score }) {
  const r = getRiskLevel(score);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${r.border} ${r.text} bg-slate-900`}>
      <span className={`w-1.5 h-1.5 rounded-full ${r.bg}`}/>
      {r.label}
    </span>
  );
}

function IncidentTimeline({ iata }) {
  const events = SAFETY_DB.incidents[iata] || [];
  if (!events.length) return (
    <div className="text-center py-6 text-slate-500 text-sm">✓ No recorded incidents</div>
  );
  const sevColor = { minor: "bg-amber-500", moderate: "bg-orange-500", major: "bg-red-600" };
  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3 items-start">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${sevColor[e.severity]}`}/>
            {i < events.length-1 && <div className="w-px flex-1 bg-slate-700 mt-1 h-6"/>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-400">{e.year}</span>
              <span className="text-sm text-slate-200 font-medium">{e.type}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded capitalize font-semibold
                ${e.severity==="minor"?"bg-amber-900/40 text-amber-400":e.severity==="moderate"?"bg-orange-900/40 text-orange-400":"bg-red-900/40 text-red-400"}`}>
                {e.severity}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{e.outcome}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SafetyCheckForm({ onResult }) {
  const [form, setForm] = useState({ airline: "", flight: "", from: "", to: "", date: "" });
  const [loading, setLoading] = useState(false);

  const airlines = Object.keys(SAFETY_DB.airlines);

  const handleSubmit = async () => {
    if (!form.airline || !form.flight) return;
    setLoading(true);

    try {
      const data = await fetchSafetyCheck(form.airline, form.flight, form.from, form.to);
      const iata = getIATA(form.airline);

      onResult({
        ...form,
        score: data.safety_score,
        iata,
        incidents: data.incidents,
        fatalities: data.fatalities,
        risk_label: data.risk_label,
        confidence: data.confidence,
      });
    } catch (error) {
      console.error('Safety API error:', error);
      alert('Unable to fetch safety data from the backend. Make sure the backend is running at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Airline</label>
          <select value={form.airline} onChange={e=>setForm({...form,airline:e.target.value})}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none">
            <option value="">Select airline...</option>
            {airlines.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Flight Number</label>
          <input value={form.flight} onChange={e=>setForm({...form,flight:e.target.value})}
            placeholder="e.g. AI-302"
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none placeholder-slate-600"/>
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Date (optional)</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"/>
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Departure Airport</label>
          <input value={form.from} onChange={e=>setForm({...form,from:e.target.value.toUpperCase()})}
            placeholder="DEL" maxLength={3}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none placeholder-slate-600 font-mono tracking-widest"/>
        </div>
        <div>
          <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">Arrival Airport</label>
          <input value={form.to} onChange={e=>setForm({...form,to:e.target.value.toUpperCase()})}
            placeholder="LHR" maxLength={3}
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none placeholder-slate-600 font-mono tracking-widest"/>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!form.airline||!form.flight||loading}
        className="mt-5 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide uppercase">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Analyzing Safety Data...
          </span>
        ) : "Run Safety Check →"}
      </button>
    </div>
  );
}

function SafetyResult({ result, onBack }) {
  const risk = getRiskLevel(result.score);
  const allFlights = SAFETY_DB.flights
    .filter(f => f.airline !== result.airline)
    .map(f => ({ ...f, score: computeSafetyScore(f.airline, f.number) }))
    .filter(f => f.score > result.score)
    .sort((a,b)=>b.score-a.score)
    .slice(0,3);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Main result card */}
      <div className={`bg-slate-800/70 border ${risk.border} rounded-2xl p-6 shadow-lg ${risk.glow}`}>
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <RiskGauge score={result.score}/>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <span className="text-2xl font-black text-white tracking-tight">{result.flight}</span>
              <Badge score={result.score}/>
            </div>
            <p className="text-slate-400 text-sm mb-4">{result.airline} {result.from && result.to ? `· ${result.from} → ${result.to}` : ""}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Safety Score", val:`${result.score}/10` },
                { label:"Incidents", val:result.incidents },
                { label:"Fatalities", val:result.fatalities }
              ].map(({label,val})=>(
                <div key={label} className="bg-slate-900/60 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">{val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incident timeline */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block"/>
          Incident History
        </h3>
        <IncidentTimeline iata={result.iata}/>
      </div>

      {/* Safer alternatives */}
      {allFlights.length > 0 && result.score < 8.5 && (
        <div className="bg-slate-800/60 border border-emerald-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-emerald-500 rounded-full inline-block"/>
            Safer Alternatives Available
          </h3>
          <div className="space-y-2">
            {allFlights.map((f,i)=>(
              <div key={i} className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3">
                <div className="w-8 h-8 bg-emerald-900/40 rounded-lg flex items-center justify-center text-emerald-400 font-black text-xs">{i+1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{f.airline}</span>
                    <span className="text-xs font-mono text-slate-400">{f.number}</span>
                  </div>
                  <div className="text-xs text-slate-500">{f.dep} → {f.arr}</div>
                </div>
                <div className="text-right">
                  <Badge score={f.score}/>
                  <div className="text-xs text-slate-400 mt-1">₹{f.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">← Check another flight</button>
    </div>
  );
}

function FlightSearchForm({ onResults }) {
  const [form, setForm] = useState({ from: "", to: "", date: "", pax: "1" });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const results = SAFETY_DB.flights
      .filter(f => (!form.from || f.from.toUpperCase().includes(form.from.toUpperCase())) &&
                   (!form.to || f.to.toUpperCase().includes(form.to.toUpperCase())))
      .map(f => ({ ...f, score: computeSafetyScore(f.airline, f.number) }))
      .sort((a,b) => {
        const sa = a.score/10 * 0.6 + (1 - Math.min(a.price,100000)/100000) * 0.4;
        const sb = b.score/10 * 0.6 + (1 - Math.min(b.price,100000)/100000) * 0.4;
        return sb - sa;
      });
    onResults(results, parseInt(form.pax)||1);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key:"from", label:"From", placeholder:"DEL", mono:true },
          { key:"to",   label:"To",   placeholder:"LHR", mono:true },
          { key:"date", label:"Date", placeholder:"", type:"date" },
          { key:"pax",  label:"Passengers", placeholder:"1", type:"number" },
        ].map(({key,label,placeholder,mono,type})=>(
          <div key={key}>
            <label className="block text-xs text-slate-400 uppercase tracking-widest mb-1.5 font-semibold">{label}</label>
            <input type={type||"text"} value={form[key]}
              onChange={e=>setForm({...form,[key]:key==="from"||key==="to"?e.target.value.toUpperCase():e.target.value})}
              placeholder={placeholder} maxLength={key==="from"||key==="to"?3:undefined}
              className={`w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none placeholder-slate-600 ${mono?"font-mono tracking-widest":""}`}/>
          </div>
        ))}
      </div>
      <button onClick={handleSearch} disabled={loading}
        className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide uppercase">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Searching flights...
          </span>
        ) : "Search Flights →"}
      </button>
    </div>
  );
}

function FlightResults({ results, pax }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-4 mt-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{results.length} flights found · sorted by safety + value</p>
      <div className="space-y-3">
        {results.map((f,i)=>{
          const risk = getRiskLevel(f.score);
          return (
            <div key={i} onClick={()=>setSelected(selected===i?null:i)}
              className={`bg-slate-800/70 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-slate-800 ${selected===i?`${risk.border} shadow-lg ${risk.glow}`:"border-slate-700/50"}`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M22 16.5H2m15-9.5l3 3.5H2.5M9 7l1.5 3h4L16 7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{f.airline}</span>
                      <span className="text-xs font-mono text-slate-400">{f.number}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{f.from}</span>
                      <span className="mx-1">→</span>
                      <span className="font-mono">{f.to}</span>
                      <span className="mx-2 text-slate-600">·</span>
                      {f.dep} – {f.arr}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <Badge score={f.score}/>
                  <div className="text-right">
                    <div className="text-white font-bold">₹{(f.price*pax).toLocaleString()}</div>
                    {pax>1&&<div className="text-xs text-slate-500">×{pax} pax</div>}
                  </div>
                </div>
              </div>
              {selected===i && (
                <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{f.score}/10</div>
                    <div className="text-xs text-slate-500">Safety Score</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-white">{SAFETY_DB.airlines[f.airline]?.incidents||0}</div>
                    <div className="text-xs text-slate-500">Past Incidents</div>
                  </div>
                  <div className="col-span-2 bg-slate-900/50 rounded-lg p-3">
                    <IncidentTimeline iata={getIATA(f.airline)}/>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [safetyResult, setSafetyResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [pax, setPax] = useState(1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700;800;900&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .font-mono { font-family: 'DM Mono', monospace; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fadeIn .35s ease-out; }
        @keyframes spin { to { transform: rotate(360deg) } }
        .animate-spin { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.5H2m15-9.5l3 3.5H2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-white leading-none text-lg">SkyGuard</div>
              <div className="text-xs text-slate-500 leading-none mt-0.5">Aviation Safety Intelligence</div>
            </div>
          </div>
          <nav className="flex gap-1 bg-slate-900 p-1 rounded-xl">
            {[
              { id:"safety", label:"Safety Check" },
              { id:"search", label:"Search Flights" },
            ].map(t=>(
              <button key={t.id} onClick={()=>{setTab(t.id);setSafetyResult(null);setSearchResults(null);}}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab===t.id?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-300"}`}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Hero stats */}
        {tab === "home" || (!safetyResult && !searchResults) ? (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { val:"12 Airlines", label:"in dataset" },
              { val:"500+ Flights", label:"tracked" },
              { val:"ML-powered", label:"risk model" },
            ].map(({val,label})=>(
              <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="font-black text-cyan-400 text-sm">{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Safety Check Tab */}
        {tab === "safety" && (
          <div className="animate-fade-in">
            {!safetyResult ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white">Flight Safety Check</h2>
                  <p className="text-slate-400 text-sm mt-1">Analyze any flight's historical safety record and risk profile.</p>
                </div>
                <SafetyCheckForm onResult={setSafetyResult}/>
              </>
            ) : (
              <SafetyResult result={safetyResult} onBack={()=>setSafetyResult(null)}/>
            )}
          </div>
        )}

        {/* Search Tab */}
        {tab === "search" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Search Flights</h2>
              <p className="text-slate-400 text-sm mt-1">Find and compare flights ranked by safety and value.</p>
            </div>
            <FlightSearchForm onResults={(r,p)=>{setSearchResults(r);setPax(p);}}/>
            {searchResults && <FlightResults results={searchResults} pax={pax}/>}
          </div>
        )}

        {/* Default home state */}
        {tab !== "safety" && tab !== "search" && (
          <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
            {[
              { id:"safety", title:"Flight Safety Check", desc:"Analyze historical incident data, risk scores, and emergency records for any flight.", icon:"🛡️", color:"cyan" },
              { id:"search", title:"Search Flights", desc:"Find recommended flights sorted by combined safety rating and price score.", icon:"🔍", color:"indigo" },
            ].map(c=>(
              <button key={c.id} onClick={()=>setTab(c.id)}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-6 text-left transition-all duration-200 group">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">{c.title}</div>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{c.desc}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}