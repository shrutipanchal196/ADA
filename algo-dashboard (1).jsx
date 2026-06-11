import { useState, useEffect, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

// ─── ALGORITHM IMPLEMENTATIONS ───────────────────────────────────────────────

function measureAlgo(fn, ...args) {
  const start = performance.now();
  let ops = 0;
  const result = fn(...args, (n) => { ops += n; });
  const end = performance.now();
  return { time: end - start, ops, result };
}

function fibRecursive(n, count) {
  count(1);
  if (n <= 1) return n;
  return fibRecursive(n - 1, count) + fibRecursive(n - 2, count);
}
function fibIterative(n, count) {
  if (n <= 1) { count(1); return n; }
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) { count(1); let c = a + b; a = b; b = c; }
  return b;
}
function factRecursive(n, count) {
  count(1);
  if (n <= 1) return 1;
  return n * factRecursive(n - 1, count);
}
function factIterative(n, count) {
  let r = 1;
  for (let i = 2; i <= n; i++) { count(1); r *= i; }
  return r;
}
function linearSearch(arr, target, count) {
  for (let i = 0; i < arr.length; i++) { count(1); if (arr[i] === target) return i; }
  return -1;
}
function binarySearch(arr, target, count) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    count(1);
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}
function bubbleSort(arr, count) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) { count(1); if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]; }
  return a;
}
function selectionSort(arr, count) {
  const a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) { count(1); if (a[j] < a[min]) min = j; }
    [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}
function mergeSort(arr, count) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const L = mergeSort(arr.slice(0, mid), count);
  const R = mergeSort(arr.slice(mid), count);
  const res = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) { count(1); res.push(L[i] < R[j] ? L[i++] : R[j++]); }
  return res.concat(L.slice(i)).concat(R.slice(j));
}
function quickSort(arr, count) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  for (let i = 0; i < arr.length - 1; i++) { count(1); (arr[i] <= pivot ? left : right).push(arr[i]); }
  return [...quickSort(left, count), pivot, ...quickSort(right, count)];
}

const ALGO_META = {
  fibRecursive:  { name: "Fibonacci (Recursive)", category: "Fibonacci",  time: "O(2ⁿ)",      space: "O(n)",      type: "Recursive",     color: "#f87171", efficiency: "red"    },
  fibIterative:  { name: "Fibonacci (Iterative)", category: "Fibonacci",  time: "O(n)",        space: "O(1)",      type: "Iterative",     color: "#34d399", efficiency: "green"  },
  factRecursive: { name: "Factorial (Recursive)", category: "Factorial",  time: "O(n)",        space: "O(n)",      type: "Recursive",     color: "#fbbf24", efficiency: "yellow" },
  factIterative: { name: "Factorial (Iterative)", category: "Factorial",  time: "O(n)",        space: "O(1)",      type: "Iterative",     color: "#34d399", efficiency: "green"  },
  linearSearch:  { name: "Linear Search",         category: "Search",     time: "O(n)",        space: "O(1)",      type: "Iterative",     color: "#a78bfa", efficiency: "yellow" },
  binarySearch:  { name: "Binary Search",         category: "Search",     time: "O(log n)",    space: "O(1)",      type: "Iterative",     color: "#34d399", efficiency: "green"  },
  bubbleSort:    { name: "Bubble Sort",            category: "Sort",       time: "O(n²)",       space: "O(1)",      type: "Iterative",     color: "#f87171", efficiency: "red"    },
  selectionSort: { name: "Selection Sort",         category: "Sort",       time: "O(n²)",       space: "O(1)",      type: "Iterative",     color: "#fb923c", efficiency: "red"    },
  mergeSort:     { name: "Merge Sort",             category: "Sort",       time: "O(n log n)",  space: "O(n)",      type: "Recursive",     color: "#38bdf8", efficiency: "green"  },
  quickSort:     { name: "Quick Sort",             category: "Sort",       time: "O(n log n)*", space: "O(log n)",  type: "Recursive",     color: "#818cf8", efficiency: "green"  },
};

const RECURRENCES = {
  fibRecursive:  { rel: "T(n) = T(n-1) + T(n-2) + O(1)", best: "O(2ⁿ)", avg: "O(2ⁿ)", worst: "O(2ⁿ)" },
  fibIterative:  { rel: "T(n) = O(n)", best: "O(n)", avg: "O(n)", worst: "O(n)" },
  factRecursive: { rel: "T(n) = T(n-1) + O(1)", best: "O(n)", avg: "O(n)", worst: "O(n)" },
  factIterative: { rel: "T(n) = O(n)", best: "O(n)", avg: "O(n)", worst: "O(n)" },
  linearSearch:  { rel: "T(n) = O(n)", best: "O(1)", avg: "O(n)", worst: "O(n)" },
  binarySearch:  { rel: "T(n) = T(n/2) + O(1)", best: "O(1)", avg: "O(log n)", worst: "O(log n)" },
  bubbleSort:    { rel: "T(n) = O(n²)", best: "O(n)", avg: "O(n²)", worst: "O(n²)" },
  selectionSort: { rel: "T(n) = O(n²)", best: "O(n²)", avg: "O(n²)", worst: "O(n²)" },
  mergeSort:     { rel: "T(n) = 2T(n/2) + O(n)", best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)" },
  quickSort:     { rel: "T(n) = T(k) + T(n-k-1) + O(n)", best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)" },
};

// ─── THEME ────────────────────────────────────────────────────────────────────

const THEME = {
  dark: {
    bg: "#0a0f1e", card: "#0f172a", cardBorder: "#1e293b", accent: "#6366f1",
    accent2: "#8b5cf6", text: "#f1f5f9", muted: "#64748b", surface: "#1e293b",
    grid: "#1e293b", chartBg: "#0f172a"
  },
  light: {
    bg: "#f0f4ff", card: "#ffffff", cardBorder: "#e2e8f0", accent: "#4f46e5",
    accent2: "#7c3aed", text: "#1e293b", muted: "#64748b", surface: "#e2e8f0",
    grid: "#e2e8f0", chartBg: "#ffffff"
  }
};

// ─── LEARNING CONTENT ────────────────────────────────────────────────────────

const LEARN_CONTENT = [
  { title: "What is Big-O Notation?", icon: "📐", content: "Big-O notation describes the upper bound of an algorithm's time or space complexity as input size grows. It abstracts away hardware differences, letting us compare algorithms theoretically. For example, O(n²) means execution time grows quadratically with input size n." },
  { title: "Why Theoretical Analysis Matters", icon: "🎯", content: "Before writing a single line of code, theoretical analysis lets you predict scalability. An O(n²) algorithm running fine on 1000 items may take hours on 1,000,000 items — Big-O catches this early, saving costly rewrites in production." },
  { title: "Why Empirical Results Differ", icon: "🔬", content: "Real-world performance is affected by CPU caching, branch prediction, memory hierarchy, OS scheduling, and constant factors hidden by Big-O. An O(n log n) algorithm with high constants may lose to O(n²) on small inputs due to these effects." },
  { title: "CPU & Cache Impact", icon: "⚡", content: "Modern CPUs have L1/L2/L3 caches. Algorithms with good spatial locality (accessing memory sequentially) benefit enormously. Merge Sort copies data into new arrays causing cache misses, while in-place algorithms like Insertion Sort may outperform it on small inputs." },
  { title: "Recursion Overhead", icon: "🔄", content: "Each recursive call pushes a stack frame onto the call stack (return address, local vars). For Fibonacci O(2ⁿ), this creates an exponential explosion of calls. Stack depth also risks stack overflow for deep recursion, unlike iterative equivalents." },
  { title: "Memory Complexity", icon: "💾", content: "Space complexity matters for large datasets. O(1) in-place sorts like Bubble Sort use constant memory, while Merge Sort requires O(n) auxiliary space. On memory-constrained systems, a slower O(n²) in-place sort may outperform an O(n log n) sort that causes swapping to disk." },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [page, setPage] = useState("home");
  const [selectedAlgos, setSelectedAlgos] = useState(["bubbleSort", "mergeSort"]);
  const [inputSizes, setInputSizes] = useState([100, 500, 1000, 2000, 5000]);
  const [customSize, setCustomSize] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [raceState, setRaceState] = useState(null);
  const [activeLearn, setActiveLearn] = useState(0);
  const [compareAlgo1, setCompareAlgo1] = useState("bubbleSort");
  const [compareAlgo2, setCompareAlgo2] = useState("quickSort");

  const t = THEME[darkMode ? "dark" : "light"];

  // ─── RUN ANALYSIS ────────────────────────────────────────────────────────

  const runAnalysis = useCallback(async () => {
    if (selectedAlgos.length === 0 || inputSizes.length === 0) return;
    setRunning(true);
    setProgress(0);
    setResults([]);

    const newResults = [];
    const total = selectedAlgos.length * inputSizes.length;
    let done = 0;

    for (const algoKey of selectedAlgos) {
      const algoResults = [];
      for (const size of inputSizes) {
        await new Promise(r => setTimeout(r, 10)); // yield to UI

        let time = 0, ops = 0;
        try {
          if (algoKey === "fibRecursive" || algoKey === "fibIterative") {
            const n = Math.min(size, algoKey === "fibRecursive" ? 35 : 1000);
            const fn = algoKey === "fibRecursive" ? fibRecursive : fibIterative;
            const m = measureAlgo(fn, n);
            time = m.time; ops = m.ops;
          } else if (algoKey === "factRecursive" || algoKey === "factIterative") {
            const n = Math.min(size, 1000);
            const fn = algoKey === "factRecursive" ? factRecursive : factIterative;
            const m = measureAlgo(fn, n);
            time = m.time; ops = m.ops;
          } else if (algoKey === "linearSearch" || algoKey === "binarySearch") {
            const arr = Array.from({ length: size }, (_, i) => i * 2);
            const target = arr[Math.floor(Math.random() * size)];
            const fn = algoKey === "linearSearch" ? linearSearch : binarySearch;
            const m = measureAlgo(fn, arr, target);
            time = m.time; ops = m.ops;
          } else {
            const arr = Array.from({ length: Math.min(size, 10000) }, () => Math.floor(Math.random() * 10000));
            const fns = { bubbleSort, selectionSort, mergeSort, quickSort };
            const m = measureAlgo(fns[algoKey], arr);
            time = m.time; ops = m.ops;
          }
        } catch (e) { time = 0; ops = 0; }

        algoResults.push({ size, time: +time.toFixed(3), ops });
        done++;
        setProgress(Math.floor((done / total) * 100));
      }
      newResults.push({ key: algoKey, meta: ALGO_META[algoKey], data: algoResults });
    }

    setResults(newResults);
    const run = { id: Date.now(), timestamp: new Date().toLocaleString(), algos: newResults };
    setHistory(h => [run, ...h].slice(0, 20));
    setRunning(false);
    setProgress(100);
    generateAIInsights(newResults);
  }, [selectedAlgos, inputSizes]);

  // ─── AI INSIGHTS ─────────────────────────────────────────────────────────

  const generateAIInsights = async (results) => {
    setLoadingAI(true);
    setAiInsights([]);
    try {
      const summary = results.map(r => ({
        algo: r.meta.name,
        complexity: r.meta.time,
        data: r.data.map(d => `n=${d.size}: ${d.time}ms`).join(", ")
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an algorithm analysis expert. Analyze these empirical benchmarking results and give exactly 4 short, specific insights (each 1-2 sentences). Focus on: scaling behavior, where theory matches/diverges from practice, practical recommendations, and surprising observations. Return ONLY a JSON array of strings, no markdown.

Results: ${JSON.stringify(summary)}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiInsights(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setAiInsights(["Run analysis to generate AI insights about your algorithm performance."]);
    }
    setLoadingAI(false);
  };

  // ─── THEORETICAL CURVES ─────────────────────────────────────────────────

  const theoCurves = inputSizes.map(n => ({
    n,
    "O(1)": 1,
    "O(log n)": +(Math.log2(n)).toFixed(4),
    "O(n)": n,
    "O(n log n)": +(n * Math.log2(n)).toFixed(2),
    "O(n²)": n * n,
  }));

  // ─── RACE MODE ────────────────────────────────────────────────────────────

  const startRace = async () => {
    setRaceState({ running: true, a1: [], a2: [], winner: null });
    const sizes = [100, 500, 1000, 2000, 5000];
    const r1 = [], r2 = [];
    for (const size of sizes) {
      await new Promise(res => setTimeout(res, 80));
      const arr1 = Array.from({ length: Math.min(size, 5000) }, () => Math.floor(Math.random() * 10000));
      const arr2 = [...arr1];
      const m1 = measureAlgo(ALGO_META[compareAlgo1] ? (bubbleSort || mergeSort) : mergeSort, arr1);
      const m2 = measureAlgo(mergeSort, arr2);
      const fns = { bubbleSort, selectionSort, mergeSort, quickSort, fibIterative, fibRecursive, factIterative, factRecursive, linearSearch, binarySearch };
      let t1, t2;
      try {
        if (["bubbleSort","selectionSort","mergeSort","quickSort"].includes(compareAlgo1)) {
          t1 = measureAlgo(fns[compareAlgo1], arr1).time;
        } else { t1 = measureAlgo(fns[compareAlgo1], Math.min(size, 35)).time; }
        if (["bubbleSort","selectionSort","mergeSort","quickSort"].includes(compareAlgo2)) {
          t2 = measureAlgo(fns[compareAlgo2], arr2).time;
        } else { t2 = measureAlgo(fns[compareAlgo2], Math.min(size, 35)).time; }
      } catch { t1 = 0; t2 = 0; }
      r1.push({ size, time: +t1.toFixed(3) });
      r2.push({ size, time: +t2.toFixed(3) });
      setRaceState({ running: true, a1: [...r1], a2: [...r2], winner: null });
    }
    const total1 = r1.reduce((s, d) => s + d.time, 0);
    const total2 = r2.reduce((s, d) => s + d.time, 0);
    setRaceState({ running: false, a1: r1, a2: r2, winner: total1 < total2 ? compareAlgo1 : compareAlgo2, total1, total2 });
  };

  // ─── CHART DATA ──────────────────────────────────────────────────────────

  const chartData = inputSizes.map(size => {
    const point = { size };
    results.forEach(r => {
      const d = r.data.find(d => d.size === size);
      if (d) point[r.meta.name] = d.time;
    });
    return point;
  });

  const opsData = inputSizes.map(size => {
    const point = { size };
    results.forEach(r => {
      const d = r.data.find(d => d.size === size);
      if (d) point[r.meta.name] = d.ops;
    });
    return point;
  });

  const efficiencyData = Object.entries(ALGO_META).map(([k, v]) => ({
    name: v.name.replace(" (Recursive)", " Rec").replace(" (Iterative)", " Iter"),
    efficiency: v.efficiency === "green" ? 3 : v.efficiency === "yellow" ? 2 : 1,
    fill: v.efficiency === "green" ? "#34d399" : v.efficiency === "yellow" ? "#fbbf24" : "#f87171"
  }));

  // ─── STYLES ──────────────────────────────────────────────────────────────

  const s = {
    app: { minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "all 0.3s" },
    nav: { background: t.card, borderBottom: `1px solid ${t.cardBorder}`, padding: "0 2rem", display: "flex", alignItems: "center", gap: "1rem", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" },
    logo: { fontWeight: 800, fontSize: "1.1rem", background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", padding: "1rem 0", marginRight: "1rem" },
    navBtn: (active) => ({ background: active ? `${t.accent}22` : "transparent", color: active ? t.accent : t.muted, border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontWeight: active ? 600 : 400, fontSize: "0.875rem", transition: "all 0.2s" }),
    themeBtn: { marginLeft: "auto", background: t.surface, border: `1px solid ${t.cardBorder}`, color: t.text, padding: "0.4rem 0.8rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem" },
    page: { maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem" },
    card: { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: "16px", padding: "1.5rem" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" },
    grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" },
    h1: { fontSize: "2.5rem", fontWeight: 800, margin: "0 0 0.5rem" },
    h2: { fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem" },
    h3: { fontSize: "1.1rem", fontWeight: 600, margin: "0 0 0.75rem" },
    badge: (color) => ({ background: `${color}22`, color: color, border: `1px solid ${color}44`, borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }),
    btn: (variant = "primary") => ({
      background: variant === "primary" ? `linear-gradient(135deg, ${t.accent}, ${t.accent2})` : t.surface,
      color: variant === "primary" ? "#fff" : t.text,
      border: variant === "primary" ? "none" : `1px solid ${t.cardBorder}`,
      padding: "0.6rem 1.25rem", borderRadius: "10px", cursor: "pointer",
      fontWeight: 600, fontSize: "0.875rem", transition: "all 0.2s"
    }),
    input: { background: t.surface, border: `1px solid ${t.cardBorder}`, color: t.text, padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.875rem", outline: "none" },
    algoCard: (selected) => ({
      background: selected ? `${t.accent}18` : t.surface,
      border: `2px solid ${selected ? t.accent : t.cardBorder}`,
      borderRadius: "12px", padding: "0.875rem", cursor: "pointer",
      transition: "all 0.2s"
    }),
    label: { fontSize: "0.8rem", color: t.muted, marginBottom: "0.35rem", display: "block" },
    muted: { color: t.muted, fontSize: "0.875rem" },
    progressBar: { height: "6px", background: t.surface, borderRadius: "3px", overflow: "hidden", marginTop: "0.5rem" },
    progressFill: { height: "100%", background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`, borderRadius: "3px", transition: "width 0.3s", width: `${progress}%` },
  };

  const PAGES = ["home", "analysis", "visualization", "compare", "race", "learning", "history"];
  const PAGE_LABELS = { home: "Home", analysis: "Algorithm Analysis", visualization: "Visualization", compare: "Compare", race: "Race Mode", learning: "Learning Center", history: "History" };

  // ─── HOME PAGE ──────────────────────────────────────────────────────────

  const HomePage = () => (
    <div style={s.page}>
      <div style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
        <h1 style={{ ...s.h1, background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Empirical vs Theoretical
        </h1>
        <h1 style={{ ...s.h1, fontSize: "1.8rem", marginTop: 0 }}>Analysis Dashboard</h1>
        <p style={{ ...s.muted, maxWidth: "600px", margin: "1rem auto", lineHeight: 1.7, fontSize: "1rem" }}>
          Benchmark real algorithm performance against theoretical Big-O complexity curves. Run experiments, visualize results, and understand why practice often differs from theory.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button style={s.btn()} onClick={() => setPage("analysis")}>Start Analysis →</button>
          <button style={s.btn("secondary")} onClick={() => setPage("learning")}>Learn Big-O</button>
        </div>
      </div>

      <div style={s.grid3}>
        {[
          { icon: "⚡", label: "Algorithms", val: "10+", sub: "Sorting, Searching, Math" },
          { icon: "📈", label: "Metrics", val: "4", sub: "Time, Ops, Memory, Calls" },
          { icon: "🤖", label: "AI Insights", val: "Auto", sub: "Claude-powered analysis" },
          { icon: "🏆", label: "Race Mode", val: "Live", sub: "Side-by-side battles" },
          { icon: "📚", label: "Learning", val: "6", sub: "In-depth Big-O modules" },
          { icon: "🕐", label: "History", val: "∞", sub: "Track all your runs" },
        ].map((c, i) => (
          <div key={i} style={s.card}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{c.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: t.accent }}>{c.val}</div>
            <div style={{ fontWeight: 600 }}>{c.label}</div>
            <div style={s.muted}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...s.card, marginTop: "2rem" }}>
        <h2 style={s.h2}>Complexity Heatmap</h2>
        <div style={s.grid3}>
          {Object.entries(ALGO_META).map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: "0.875rem" }}>{v.name}</div>
              <span style={s.badge(v.efficiency === "green" ? "#34d399" : v.efficiency === "yellow" ? "#fbbf24" : "#f87171")}>{v.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── ANALYSIS PAGE ──────────────────────────────────────────────────────

  const AnalysisPage = () => (
    <div style={s.page}>
      <h1 style={s.h1}>Algorithm Analysis</h1>
      <p style={s.muted}>Select algorithms, configure input sizes, then run the benchmark.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
        {/* Algorithm selector */}
        <div style={s.card}>
          <h3 style={s.h3}>Select Algorithms</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {Object.entries(ALGO_META).map(([k, v]) => (
              <div key={k} style={s.algoCard(selectedAlgos.includes(k))} onClick={() => setSelectedAlgos(prev => prev.includes(k) ? prev.filter(a => a !== k) : [...prev, k])}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{v.name}</span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <span style={s.badge(v.color)}>{v.time}</span>
                    <span style={s.badge(v.type === "Recursive" ? "#f59e0b" : "#34d399")}>{v.type}</span>
                  </div>
                </div>
                <div style={{ ...s.muted, fontSize: "0.75rem", marginTop: "0.25rem" }}>{v.category} · Space: {v.space}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Config panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={s.card}>
            <h3 style={s.h3}>Input Sizes</h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {[100, 500, 1000, 2000, 5000, 10000].map(n => (
                <button key={n} style={{ ...s.btn(inputSizes.includes(n) ? "primary" : "secondary"), padding: "0.4rem 0.8rem" }}
                  onClick={() => setInputSizes(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n].sort((a, b) => a - b))}>
                  {n.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Custom size..." type="number" value={customSize}
                onChange={e => setCustomSize(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && customSize) { setInputSizes(p => [...p, +customSize].sort((a,b)=>a-b)); setCustomSize(""); }}} />
              <button style={s.btn("secondary")} onClick={() => { if (customSize) { setInputSizes(p => [...p, +customSize].sort((a,b)=>a-b)); setCustomSize(""); }}}>Add</button>
            </div>
            <div style={{ marginTop: "0.75rem", ...s.muted }}>Selected: {inputSizes.join(", ")}</div>
          </div>

          <div style={s.card}>
            <h3 style={s.h3}>Complexity Reference</h3>
            {selectedAlgos.slice(0, 3).map(k => (
              <div key={k} style={{ marginBottom: "1rem", padding: "0.75rem", background: t.surface, borderRadius: "10px" }}>
                <div style={{ fontWeight: 700, color: ALGO_META[k].color, marginBottom: "0.25rem" }}>{ALGO_META[k].name}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: t.muted }}>{RECURRENCES[k].rel}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                  <span style={s.badge("#34d399")}>Best: {RECURRENCES[k].best}</span>
                  <span style={s.badge("#fbbf24")}>Avg: {RECURRENCES[k].avg}</span>
                  <span style={s.badge("#f87171")}>Worst: {RECURRENCES[k].worst}</span>
                </div>
              </div>
            ))}
          </div>

          <button style={{ ...s.btn(), padding: "0.9rem", fontSize: "1rem", opacity: running ? 0.7 : 1 }}
            onClick={runAnalysis} disabled={running}>
            {running ? `⏳ Running... ${progress}%` : "▶ Run Analysis"}
          </button>
          {running && <div style={s.progressBar}><div style={s.progressFill} /></div>}
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div style={{ ...s.card, marginTop: "2rem", overflowX: "auto" }}>
          <h3 style={s.h3}>Results</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
                <th style={{ textAlign: "left", padding: "0.5rem", color: t.muted }}>Algorithm</th>
                {inputSizes.map(s_ => <th key={s_} style={{ textAlign: "right", padding: "0.5rem", color: t.muted }}>n={s_}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.key} style={{ borderBottom: `1px solid ${t.cardBorder}22` }}>
                  <td style={{ padding: "0.6rem 0.5rem", fontWeight: 600 }}>
                    <span style={{ ...s.badge(r.meta.color), marginRight: "0.5rem" }}>●</span>
                    {r.meta.name}
                  </td>
                  {inputSizes.map(sz => {
                    const d = r.data.find(d => d.size === sz);
                    return <td key={sz} style={{ textAlign: "right", padding: "0.6rem 0.5rem", fontFamily: "monospace", color: t.accent }}>{d ? `${d.time}ms` : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Insights */}
      {(aiInsights.length > 0 || loadingAI) && (
        <div style={{ ...s.card, marginTop: "1.5rem", border: `1px solid ${t.accent}44` }}>
          <h3 style={{ ...s.h3, color: t.accent }}>🤖 AI Insights</h3>
          {loadingAI ? (
            <div style={s.muted}>Analyzing results with Claude…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {aiInsights.map((insight, i) => (
                <div key={i} style={{ padding: "0.75rem 1rem", background: `${t.accent}11`, borderLeft: `3px solid ${t.accent}`, borderRadius: "0 8px 8px 0", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {insight}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── VISUALIZATION PAGE ─────────────────────────────────────────────────

  const VisPage = () => (
    <div style={s.page}>
      <h1 style={s.h1}>Visualization</h1>
      <p style={s.muted}>Interactive charts of empirical execution time, operations count, and theoretical growth curves.</p>
      {results.length === 0 && <div style={{ ...s.card, marginTop: "2rem", textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
        <div style={s.muted}>No data yet — run an analysis first.</div>
        <button style={{ ...s.btn(), marginTop: "1rem" }} onClick={() => setPage("analysis")}>Go to Analysis</button>
      </div>}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1.5rem" }}>
          {/* Execution Time Chart */}
          <div style={s.card}>
            <h3 style={s.h3}>Execution Time vs Input Size</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="size" stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <YAxis stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} unit="ms" />
                <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                <Legend />
                {results.map(r => (
                  <Line key={r.key} type="monotone" dataKey={r.meta.name} stroke={r.meta.color} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Operations Chart */}
          <div style={s.card}>
            <h3 style={s.h3}>Operations Count vs Input Size</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opsData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="size" stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <YAxis stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                <Legend />
                {results.map(r => (
                  <Bar key={r.key} dataKey={r.meta.name} fill={r.meta.color} opacity={0.85} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Theoretical curves */}
          <div style={s.card}>
            <h3 style={s.h3}>Theoretical Growth Curves</h3>
            <p style={{ ...s.muted, marginBottom: "1rem" }}>Normalized growth curves for common Big-O complexities. Note: O(n²) and above are scaled down for visibility.</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={theoCurves.map(d => ({ n: d.n, "O(log n)": d["O(log n)"], "O(n)": Math.min(d["O(n)"], 10000), "O(n log n)": Math.min(d["O(n log n)"], 100000) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="n" stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <YAxis stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                <Legend />
                <Line type="monotone" dataKey="O(log n)" stroke="#34d399" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="O(n)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="O(n log n)" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency Heatmap */}
          <div style={s.card}>
            <h3 style={s.h3}>Algorithm Efficiency Heatmap</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {Object.entries(ALGO_META).map(([k, v]) => (
                <div key={k} style={{ background: `${v.efficiency === "green" ? "#34d399" : v.efficiency === "yellow" ? "#fbbf24" : "#f87171"}18`, border: `1px solid ${v.efficiency === "green" ? "#34d399" : v.efficiency === "yellow" ? "#fbbf24" : "#f87171"}44`, borderRadius: "10px", padding: "0.75rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{v.efficiency === "green" ? "✅" : v.efficiency === "yellow" ? "⚠️" : "❌"}</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>{v.name}</div>
                  <div style={{ fontSize: "0.7rem", color: t.muted }}>{v.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── COMPARE PAGE ────────────────────────────────────────────────────────

  const ComparePage = () => {
    const [cResults, setCResults] = useState(null);
    const [cRunning, setCRunning] = useState(false);

    const runCompare = async () => {
      setCRunning(true); setCResults(null);
      const sizes = [100, 500, 1000, 2000, 5000];
      const d1 = [], d2 = [];
      for (const size of sizes) {
        await new Promise(r => setTimeout(r, 20));
        const fns = { bubbleSort, selectionSort, mergeSort, quickSort };
        const fibFns = { fibRecursive, fibIterative };
        let t1, t2;
        const arr = Array.from({ length: Math.min(size, 5000) }, () => Math.floor(Math.random() * 10000));
        try {
          if (fns[compareAlgo1]) t1 = measureAlgo(fns[compareAlgo1], [...arr]).time;
          else if (fibFns[compareAlgo1]) t1 = measureAlgo(fibFns[compareAlgo1], Math.min(size, 35)).time;
          else t1 = measureAlgo(factIterative, Math.min(size, 1000)).time;
          if (fns[compareAlgo2]) t2 = measureAlgo(fns[compareAlgo2], [...arr]).time;
          else if (fibFns[compareAlgo2]) t2 = measureAlgo(fibFns[compareAlgo2], Math.min(size, 35)).time;
          else t2 = measureAlgo(factIterative, Math.min(size, 1000)).time;
        } catch { t1 = 0; t2 = 0; }
        d1.push({ size, time: +t1.toFixed(3) });
        d2.push({ size, time: +t2.toFixed(3) });
      }
      setCResults({ d1, d2 });
      setCRunning(false);
    };

    const compareChartData = cResults ? cResults.d1.map((d, i) => ({
      size: d.size,
      [ALGO_META[compareAlgo1].name]: d.time,
      [ALGO_META[compareAlgo2].name]: cResults.d2[i].time,
    })) : [];

    return (
      <div style={s.page}>
        <h1 style={s.h1}>Algorithm Comparison</h1>
        <div style={s.grid2}>
          <div style={s.card}>
            <label style={s.label}>Algorithm 1</label>
            <select style={{ ...s.input, width: "100%" }} value={compareAlgo1} onChange={e => setCompareAlgo1(e.target.value)}>
              {Object.entries(ALGO_META).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <div style={{ marginTop: "1rem" }}>
              <span style={s.badge(ALGO_META[compareAlgo1].color)}>{ALGO_META[compareAlgo1].time}</span>
              <span style={{ ...s.badge("#64748b"), marginLeft: "0.5rem" }}>{ALGO_META[compareAlgo1].type}</span>
            </div>
          </div>
          <div style={s.card}>
            <label style={s.label}>Algorithm 2</label>
            <select style={{ ...s.input, width: "100%" }} value={compareAlgo2} onChange={e => setCompareAlgo2(e.target.value)}>
              {Object.entries(ALGO_META).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
            <div style={{ marginTop: "1rem" }}>
              <span style={s.badge(ALGO_META[compareAlgo2].color)}>{ALGO_META[compareAlgo2].time}</span>
              <span style={{ ...s.badge("#64748b"), marginLeft: "0.5rem" }}>{ALGO_META[compareAlgo2].type}</span>
            </div>
          </div>
        </div>
        <button style={{ ...s.btn(), marginTop: "1.5rem", opacity: cRunning ? 0.7 : 1 }} onClick={runCompare} disabled={cRunning}>
          {cRunning ? "⏳ Comparing…" : "⚡ Compare Now"}
        </button>

        {cResults && (
          <div style={{ ...s.card, marginTop: "2rem" }}>
            <h3 style={s.h3}>Head-to-Head Performance</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={compareChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="size" stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <YAxis stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} unit="ms" />
                <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                <Legend />
                <Line dataKey={ALGO_META[compareAlgo1].name} stroke={ALGO_META[compareAlgo1].color} strokeWidth={2.5} dot={{ r: 4 }} />
                <Line dataKey={ALGO_META[compareAlgo2].name} stroke={ALGO_META[compareAlgo2].color} strokeWidth={2.5} dot={{ r: 4 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  // ─── RACE PAGE ───────────────────────────────────────────────────────────

  const RacePage = () => {
    const raceChartData = raceState ? raceState.a1.map((d, i) => ({
      size: d.size,
      [ALGO_META[compareAlgo1].name]: d.time,
      [ALGO_META[compareAlgo2].name]: (raceState.a2[i] || {}).time,
    })) : [];

    return (
      <div style={s.page}>
        <h1 style={s.h1}>🏁 Algorithm Race Mode</h1>
        <p style={s.muted}>Watch two algorithms compete live on the same datasets.</p>

        <div style={s.grid2}>
          <div style={s.card}>
            <label style={s.label}>Racer 1</label>
            <select style={{ ...s.input, width: "100%" }} value={compareAlgo1} onChange={e => setCompareAlgo1(e.target.value)}>
              {Object.entries(ALGO_META).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div style={s.card}>
            <label style={s.label}>Racer 2</label>
            <select style={{ ...s.input, width: "100%" }} value={compareAlgo2} onChange={e => setCompareAlgo2(e.target.value)}>
              {Object.entries(ALGO_META).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
        </div>

        <button style={{ ...s.btn(), marginTop: "1.5rem", opacity: raceState?.running ? 0.7 : 1 }}
          onClick={startRace} disabled={raceState?.running}>
          {raceState?.running ? "🏃 Racing…" : "🚦 Start Race"}
        </button>

        {raceState?.winner && (
          <div style={{ ...s.card, marginTop: "1.5rem", textAlign: "center", border: `1px solid ${t.accent}44` }}>
            <div style={{ fontSize: "2.5rem" }}>🏆</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: t.accent, marginTop: "0.5rem" }}>
              {ALGO_META[raceState.winner].name} wins!
            </div>
            <div style={s.muted}>Total time: {raceState.total1?.toFixed(2)}ms vs {raceState.total2?.toFixed(2)}ms</div>
          </div>
        )}

        {raceState && raceState.a1.length > 0 && (
          <div style={{ ...s.card, marginTop: "1.5rem" }}>
            <h3 style={s.h3}>Live Race Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={raceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="size" stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} />
                <YAxis stroke={t.muted} tick={{ fill: t.muted, fontSize: 12 }} unit="ms" />
                <Tooltip contentStyle={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 8, color: t.text }} />
                <Legend />
                <Line dataKey={ALGO_META[compareAlgo1].name} stroke={ALGO_META[compareAlgo1].color} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={true} />
                <Line dataKey={ALGO_META[compareAlgo2].name} stroke={ALGO_META[compareAlgo2].color} strokeWidth={3} dot={{ r: 5 }} strokeDasharray="6 3" isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>

            {/* Progress bars */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
              {[{ key: compareAlgo1, data: raceState.a1 }, { key: compareAlgo2, data: raceState.a2 }].map(({ key, data }) => {
                const total = data.reduce((s, d) => s + d.time, 0);
                return (
                  <div key={key} style={{ padding: "1rem", background: `${ALGO_META[key].color}18`, borderRadius: "10px", border: `1px solid ${ALGO_META[key].color}44` }}>
                    <div style={{ fontWeight: 700, color: ALGO_META[key].color }}>{ALGO_META[key].name}</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem" }}>{total.toFixed(3)}ms</div>
                    <div style={{ ...s.muted, fontSize: "0.75rem" }}>Total across {data.length} sizes</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── LEARNING PAGE ───────────────────────────────────────────────────────

  const LearningPage = () => (
    <div style={s.page}>
      <h1 style={s.h1}>📚 Learning Center</h1>
      <p style={s.muted}>Deep dive into algorithm complexity, Big-O notation, and why theory meets (or misses) practice.</p>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem", marginTop: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {LEARN_CONTENT.map((c, i) => (
            <button key={i} style={{ ...s.navBtn(activeLearn === i), textAlign: "left", padding: "0.6rem 0.75rem" }} onClick={() => setActiveLearn(i)}>
              {c.icon} {c.title}
            </button>
          ))}
        </div>
        <div style={s.card}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{LEARN_CONTENT[activeLearn].icon}</div>
          <h2 style={s.h2}>{LEARN_CONTENT[activeLearn].title}</h2>
          <p style={{ lineHeight: 1.8, color: t.text, fontSize: "1rem" }}>{LEARN_CONTENT[activeLearn].content}</p>

          <div style={{ marginTop: "2rem", padding: "1rem", background: t.surface, borderRadius: "10px" }}>
            <h3 style={{ ...s.h3, marginBottom: "0.5rem" }}>Complexity Cheat Sheet</h3>
            {[
              { notation: "O(1)", name: "Constant", ex: "Array access", color: "#34d399" },
              { notation: "O(log n)", name: "Logarithmic", ex: "Binary Search", color: "#38bdf8" },
              { notation: "O(n)", name: "Linear", ex: "Linear Search", color: "#a78bfa" },
              { notation: "O(n log n)", name: "Linearithmic", ex: "Merge Sort", color: "#fbbf24" },
              { notation: "O(n²)", name: "Quadratic", ex: "Bubble Sort", color: "#fb923c" },
              { notation: "O(2ⁿ)", name: "Exponential", ex: "Fib Recursive", color: "#f87171" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.5rem 0", borderBottom: `1px solid ${t.cardBorder}22` }}>
                <span style={{ ...s.badge(row.color), minWidth: "90px", textAlign: "center" }}>{row.notation}</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{row.name}</span>
                <span style={s.muted}>{row.ex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── HISTORY PAGE ────────────────────────────────────────────────────────

  const HistoryPage = () => (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={s.h1}>Run History</h1>
          <p style={s.muted}>{history.length} previous run{history.length !== 1 ? "s" : ""} recorded</p>
        </div>
        {history.length > 0 && <button style={s.btn("secondary")} onClick={() => setHistory([])}>Clear All</button>}
      </div>

      {history.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🕐</div>
          <div style={s.muted}>No runs yet. Go to Analysis to benchmark algorithms.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((run, i) => (
            <div key={run.id} style={s.card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <span style={{ fontWeight: 700 }}>Run #{history.length - i}</span>
                  <span style={{ ...s.muted, marginLeft: "1rem", fontSize: "0.8rem" }}>{run.timestamp}</span>
                </div>
                <button style={{ ...s.btn("secondary"), padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                  onClick={() => setHistory(h => h.filter(r => r.id !== run.id))}>Delete</button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {run.algos.map(r => (
                  <span key={r.key} style={s.badge(r.meta.color)}>{r.meta.name}</span>
                ))}
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                {run.algos.map(r => (
                  <div key={r.key} style={{ fontSize: "0.78rem", color: t.muted, marginTop: "0.2rem" }}>
                    {r.meta.name}: {r.data.map(d => `${d.size}→${d.time}ms`).join(" | ")}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────

  const pageComponents = { home: HomePage, analysis: AnalysisPage, visualization: VisPage, compare: ComparePage, race: RacePage, learning: LearningPage, history: HistoryPage };
  const PageComponent = pageComponents[page] || HomePage;

  return (
    <div style={s.app}>
      <nav style={s.nav}>
        <div style={s.logo}>AlgoViz</div>
        {PAGES.map(p => (
          <button key={p} style={s.navBtn(page === p)} onClick={() => setPage(p)}>
            {PAGE_LABELS[p]}
          </button>
        ))}
        <button style={s.themeBtn} onClick={() => setDarkMode(d => !d)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </nav>
      <PageComponent />
    </div>
  );
}
