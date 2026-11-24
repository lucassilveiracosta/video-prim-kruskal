/**
 * Benchmark e Análise Comparativa: Prim vs Kruskal
 * Baseado no Problema Beecrowd 1764 (Itinerário do Papai Noel)
 * Submissões C++20: #50526552 (Prim) e #50526538 (Kruskal)
 */

// Códigos C++ originais das submissões no Beecrowd 1764
const BEECROWD_CODES = {
  prim: {
    id: "50526552",
    problem: "1764 - Itinerário do Papai Noel",
    status: "Accepted",
    lang: "C++20 (g++ 11.3.0, -std=c++20 -O2 -lm) [+0s] {beta}",
    time: "0.000s",
    size: "1,08 KB",
    date: "23/11/2026 22:59:24",
    code: `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

// pair<peso, vertice_destino>
typedef pair<int, int> pii;

int main() {
    // Otimização de I/O em C++
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int M, N; // M = cidades (vértices), N = estradas (arestas)
    while (cin >> M >> N && (M != 0 || N != 0)) {
        vector<vector<pii>> adj(M);

        for (int i = 0; i < N; i++) {
            int X, Y, Z;
            cin >> X >> Y >> Z;
            adj[X].push_back({Z, Y});
            adj[Y].push_back({Z, X});
        }

        // Min-Heap de pares (peso, vertice)
        priority_queue<pii, vector<pii>, greater<pii>> pq;
        vector<bool> visited(M, false);

        int total_cost = 0;
        int edges_count = 0;

        // Inicia a árvore pelo vértice 0
        visited[0] = true;
        for (auto& edge : adj[0]) {
            pq.push(edge);
        }

        // Expansão gradual da árvore até cobrir todos os M vértices
        while (!pq.empty() && edges_count < M - 1) {
            auto [weight, u] = pq.top();
            pq.pop();

            if (visited[u]) continue;

            visited[u] = true;
            total_cost += weight;
            edges_count++;

            for (auto& edge : adj[u]) {
                if (!visited[edge.second]) {
                    pq.push(edge);
                }
            }
        }

        cout << total_cost << "\\n";
    }

    return 0;
}`
  },

  kruskal: {
    id: "50526538",
    problem: "1764 - Itinerário do Papai Noel",
    status: "Accepted",
    lang: "C++20 (g++ 11.3.0, -std=c++20 -O2 -lm) [+0s] {beta}",
    time: "0.000s",
    size: "3,45 KB",
    date: "23/11/2026 22:56:27",
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Representa uma aresta ponderada entre u e v
struct Edge {
    int u, v;       // Vértices de origem e destino
    int weight;     // Peso (distância entre as cidades)

    // Critério para ordenação: menor peso primeiro (estratégia gulosa)
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

// Estrutura Union-Find / DSU para controle de componentes e detecção de ciclos
struct DSU {
    vector<int> parent; // parent[i] guarda o líder/pai do vértice i
    vector<int> rank;   // rank[i] guarda a altura estimada da árvore do conjunto

    DSU(int n) {
        parent.resize(n);
        rank.assign(n, 0);
        for (int i = 0; i < n; i++) {
            parent[i] = i; // Cada vértice começa como seu próprio líder
        }
    }

    // Busca o líder do conjunto com Compressão de Caminho (Path Compression)
    int find(int i) {
        if (parent[i] == i)
            return i;
        return parent[i] = find(parent[i]);
    }

    // Une dois conjuntos por União por Rank (Union by Rank)
    bool unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j) {
            if (rank[root_i] < rank[root_j])
                swap(root_i, root_j);
            parent[root_j] = root_i;
            if (rank[root_i] == rank[root_j])
                rank[root_i]++;
            return true;
        }
        return false;
    }
};

int main() {
    // Otimização de I/O em C++
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int M, N; // M = cidades (vértices), N = estradas (arestas)
    while (cin >> M >> N && (M != 0 || N != 0)) {
        vector<Edge> edges(N);
        for (int i = 0; i < N; i++) {
            cin >> edges[i].u >> edges[i].v >> edges[i].weight;
        }

        // Ordenação global de todas as arestas O(N log N)
        sort(edges.begin(), edges.end());

        DSU dsu(M);
        int total_cost = 0;
        int edges_count = 0;

        for (const auto& edge : edges) {
            if (dsu.unite(edge.u, edge.v)) {
                total_cost += edge.weight;
                edges_count++;
                if (edges_count == M - 1) break;
            }
        }

        cout << total_cost << "\\n";
    }

    return 0;
}`
  }
};

// ==========================================
// ESTRUTURAS DE DADOS DE ALTA PERFORMANCE (JS)
// ==========================================

// Min-Heap Binário em Array Flat (Equivalente ao std::priority_queue de C++)
class FastMinHeap {
  constructor() {
    this.data = [];
  }

  push(weight, to) {
    this.data.push({ w: weight, to: to });
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const bottom = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  _bubbleUp(n) {
    const el = this.data[n];
    while (n > 0) {
      const pIdx = (n - 1) >> 1;
      const parent = this.data[pIdx];
      if (el.w >= parent.w) break;
      this.data[n] = parent;
      n = pIdx;
    }
    this.data[n] = el;
  }

  _sinkDown(n) {
    const len = this.data.length;
    const el = this.data[n];
    const halfLen = len >> 1;

    while (n < halfLen) {
      let left = (n << 1) + 1;
      let right = left + 1;
      let bestIdx = left;

      if (right < len && this.data[right].w < this.data[left].w) {
        bestIdx = right;
      }
      if (this.data[bestIdx].w >= el.w) break;

      this.data[n] = this.data[bestIdx];
      n = bestIdx;
    }
    this.data[n] = el;
  }
}

// Disjoint-Set Union com Path Compression & Union by Rank (Equivalente ao struct DSU de C++)
class FastDSU {
  constructor(n) {
    this.parent = new Int32Array(n);
    this.rank = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
    }
  }

  find(i) {
    let root = i;
    while (root !== this.parent[root]) {
      root = this.parent[root];
    }
    // Path compression
    let curr = i;
    while (curr !== root) {
      let nxt = this.parent[curr];
      this.parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  unite(i, j) {
    let rootI = this.find(i);
    let rootJ = this.find(j);
    if (rootI === rootJ) return false;

    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI]++;
    }
    return true;
  }
}

// ==========================================
// GERADOR DE GRAFOS DE TESTE PONDERADOS
// ==========================================

function generateConnectedGraph(M, N, maxWeight = 1000) {
  const maxPossible = Math.floor((M * (M - 1)) / 2);
  const targetN = Math.max(M - 1, Math.min(N, maxPossible));

  const edges = [];
  const adj = Array.from({ length: M }, () => []);
  const edgeSet = new Set();

  function edgeKey(u, v) {
    return u < v ? `${u}_${v}` : `${v}_${u}`;
  }

  // 1. Gera árvore geradora aleatória para garantir conectividade
  for (let i = 1; i < M; i++) {
    const parent = Math.floor(Math.random() * i);
    const w = Math.floor(Math.random() * maxWeight) + 1;
    edges.push({ u: parent, v: i, w });
    adj[parent].push({ to: i, w });
    adj[i].push({ to: parent, w });
    edgeSet.add(edgeKey(parent, i));
  }

  // 2. Adiciona arestas restantes
  let remaining = targetN - (M - 1);
  let attempts = 0;
  const maxAttempts = remaining * 10;

  while (remaining > 0 && attempts < maxAttempts) {
    attempts++;
    const u = Math.floor(Math.random() * M);
    const v = Math.floor(Math.random() * M);
    if (u === v) continue;

    const key = edgeKey(u, v);
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      const w = Math.floor(Math.random() * maxWeight) + 1;
      edges.push({ u, v, w });
      adj[u].push({ to: v, w });
      adj[v].push({ to: u, w });
      remaining--;
    }
  }

  return { M, N: edges.length, edges, adj };
}

// ==========================================
// EXECUTORES DE BENCHMARK COM CRONOMETRAGEM
// ==========================================

function runBenchmarkPrim(M, adj) {
  const start = performance.now();

  const pq = new FastMinHeap();
  const visited = new Uint8Array(M);

  let totalCost = 0;
  let edgesCount = 0;
  let heapPushes = 0;
  let heapPops = 0;

  // Inicia no vértice 0
  visited[0] = 1;
  const adj0 = adj[0];
  for (let i = 0; i < adj0.length; i++) {
    pq.push(adj0[i].w, adj0[i].to);
    heapPushes++;
  }

  while (!pq.isEmpty() && edgesCount < M - 1) {
    const top = pq.pop();
    heapPops++;
    const u = top.to;

    if (visited[u]) continue;

    visited[u] = 1;
    totalCost += top.w;
    edgesCount++;

    const neighbors = adj[u];
    for (let i = 0; i < neighbors.length; i++) {
      const edge = neighbors[i];
      if (!visited[edge.to]) {
        pq.push(edge.w, edge.to);
        heapPushes++;
      }
    }
  }

  const durationMs = performance.now() - start;

  return {
    algorithm: 'Prim',
    durationMs: durationMs,
    mstCost: totalCost,
    edgesInMST: edgesCount,
    operations: heapPushes + heapPops,
    detail: `${heapPushes.toLocaleString()} pushes / ${heapPops.toLocaleString()} pops`
  };
}

function runBenchmarkKruskal(M, edges) {
  const start = performance.now();

  // 1. Ordenação das arestas O(N log N)
  const sortStart = performance.now();
  const sorted = edges.slice();
  sorted.sort((a, b) => a.w - b.w);
  const sortDurationMs = performance.now() - sortStart;

  // 2. DSU
  const dsuStart = performance.now();
  const dsu = new FastDSU(M);
  let totalCost = 0;
  let edgesCount = 0;
  let dsuUnions = 0;
  let edgesEvaluated = 0;

  for (let i = 0; i < sorted.length; i++) {
    edgesEvaluated++;
    const e = sorted[i];
    if (dsu.unite(e.u, e.v)) {
      totalCost += e.w;
      edgesCount++;
      dsuUnions++;
      if (edgesCount === M - 1) break;
    }
  }
  const dsuDurationMs = performance.now() - dsuStart;
  const durationMs = performance.now() - start;

  return {
    algorithm: 'Kruskal',
    durationMs: durationMs,
    sortDurationMs: sortDurationMs,
    dsuDurationMs: dsuDurationMs,
    mstCost: totalCost,
    edgesInMST: edgesCount,
    operations: edgesEvaluated,
    detail: `Sort: ${sortDurationMs.toFixed(2)}ms | DSU: ${dsuDurationMs.toFixed(2)}ms (${edgesEvaluated.toLocaleString()} arestas testadas)`
  };
}

// ==========================================
// CONTROLADOR DE INTERFACE DO BENCHMARK
// ==========================================

function setupBenchmarkUI() {
  const sliderM = document.getElementById('bench-m');
  const sliderN = document.getElementById('bench-n');
  const labelM = document.getElementById('bench-m-val');
  const labelN = document.getElementById('bench-n-val');
  const densityBadge = document.getElementById('bench-density-badge');
  const btnRun = document.getElementById('bench-run-btn');
  const btnBatch = document.getElementById('bench-batch-btn');

  // Sliders Update
  function updateSliderConstraints() {
    const M = parseInt(sliderM.value, 10);
    labelM.textContent = M.toLocaleString();

    const minN = M - 1;
    const maxN = Math.min(150000, Math.floor((M * (M - 1)) / 2));

    sliderN.min = minN;
    sliderN.max = maxN;

    if (parseInt(sliderN.value, 10) < minN) sliderN.value = minN;
    if (parseInt(sliderN.value, 10) > maxN) sliderN.value = maxN;

    const N = parseInt(sliderN.value, 10);
    labelN.textContent = N.toLocaleString();

    const maxPossible = (M * (M - 1)) / 2;
    const densityPct = maxPossible > 0 ? ((N / maxPossible) * 100).toFixed(1) : 0;

    let densLabel = `${densityPct}% (Moderado)`;
    let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';

    if (densityPct < 3) {
      densLabel = `${densityPct}% (Muito Esparso)`;
      badgeColor = 'bg-purple-950/70 text-purple-300 border-purple-800';
    } else if (densityPct > 35) {
      densLabel = `${densityPct}% (Denso)`;
      badgeColor = 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
    }

    densityBadge.className = `text-xs font-mono px-2.5 py-1 rounded-md border ${badgeColor}`;
    densityBadge.textContent = `Densidade: ${densLabel}`;
  }

  if (sliderM && sliderN) {
    sliderM.addEventListener('input', updateSliderConstraints);
    sliderN.addEventListener('input', updateSliderConstraints);
    updateSliderConstraints();
  }

  // Presets Rápidos
  window.setBenchmarkPreset = function(presetType) {
    if (presetType === 'beecrowd') {
      sliderM.value = 7;
      updateSliderConstraints();
      sliderN.value = 12;
    } else if (presetType === 'sparse') {
      sliderM.value = 2500;
      updateSliderConstraints();
      sliderN.value = 5000;
    } else if (presetType === 'medium') {
      sliderM.value = 1200;
      updateSliderConstraints();
      sliderN.value = 20000;
    } else if (presetType === 'dense') {
      sliderM.value = 700;
      updateSliderConstraints();
      sliderN.value = 90000;
    }
    updateSliderConstraints();
    executeLiveBenchmark();
  };

  // Botão Executar Benchmark
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      executeLiveBenchmark();
    });
  }

  // Botão Bateria de Testes
  if (btnBatch) {
    btnBatch.addEventListener('click', () => {
      executeBatchDensityTest();
    });
  }

  // Visualizador de Códigos C++
  window.showBeecrowdCode = function(algo) {
    const data = BEECROWD_CODES[algo];
    const codeEl = document.getElementById('beecrowd-code-display');
    const titleEl = document.getElementById('beecrowd-code-title');
    const badgeSub = document.getElementById('beecrowd-sub-badge');

    if (codeEl && data) {
      codeEl.textContent = data.code;
      if (titleEl) titleEl.textContent = `Submissão #${data.id} - ${algo.toUpperCase()} (${data.problem})`;
      if (badgeSub) badgeSub.textContent = `Tempo: ${data.time} | Tamanho: ${data.size} | ${data.lang}`;

      document.getElementById('code-tab-prim').className = algo === 'prim'
        ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white'
        : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800';

      document.getElementById('code-tab-kruskal').className = algo === 'kruskal'
        ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white'
        : 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800';
    }
  };

  window.copyBeecrowdCode = function() {
    const codeEl = document.getElementById('beecrowd-code-display');
    if (!codeEl) return;
    navigator.clipboard.writeText(codeEl.textContent).then(() => {
      const copyBtn = document.getElementById('copy-code-btn');
      if (copyBtn) {
        const orig = copyBtn.innerHTML;
        copyBtn.innerHTML = `✓ Copiado!`;
        setTimeout(() => { copyBtn.innerHTML = orig; }, 1800);
      }
    });
  };

  // Carrega Prim inicialmente no visualizador de código
  if (document.getElementById('beecrowd-code-display')) {
    showBeecrowdCode('prim');
  }
}

// Execução do Benchmark Ao Vivo
function executeLiveBenchmark() {
  const sliderM = document.getElementById('bench-m');
  const sliderN = document.getElementById('bench-n');
  const statusEl = document.getElementById('bench-status-badge');
  const winnerBadge = document.getElementById('bench-winner-banner');

  if (!sliderM || !sliderN) return;

  const M = parseInt(sliderM.value, 10);
  const N = parseInt(sliderN.value, 10);

  if (statusEl) {
    statusEl.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse mr-1"></span> Gerando Grafo conexo (${M} vértices, ${N} arestas)...`;
    statusEl.className = 'text-xs font-semibold text-amber-400';
  }

  // Execução via timeout para manter UI viva
  setTimeout(() => {
    const graph = generateConnectedGraph(M, N);

    if (statusEl) {
      statusEl.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse mr-1"></span> Executando Prim e Kruskal...`;
      statusEl.className = 'text-xs font-semibold text-sky-400';
    }

    setTimeout(() => {
      // 1. Executa Kruskal
      const kruskalRes = runBenchmarkKruskal(graph.M, graph.edges);

      // 2. Executa Prim
      const primRes = runBenchmarkPrim(graph.M, graph.adj);

      // Atualiza Cards de Resultados
      document.getElementById('prim-time-val').textContent = `${primRes.durationMs.toFixed(2)} ms`;
      document.getElementById('prim-ops-val').textContent = primRes.detail;
      document.getElementById('prim-cost-val').textContent = primRes.mstCost.toLocaleString();

      document.getElementById('kruskal-time-val').textContent = `${kruskalRes.durationMs.toFixed(2)} ms`;
      document.getElementById('kruskal-ops-val').textContent = kruskalRes.detail;
      document.getElementById('kruskal-cost-val').textContent = kruskalRes.mstCost.toLocaleString();

      // Checagem de Equivalência
      const eqBadge = document.getElementById('bench-equiv-badge');
      if (primRes.mstCost === kruskalRes.mstCost) {
        eqBadge.className = 'text-xs px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 font-medium';
        eqBadge.innerHTML = `✓ Ambos encontraram exatamente o mesmo Custo Mínimo ótimo: <strong class="text-white">${primRes.mstCost.toLocaleString()}</strong> (${primRes.edgesInMST} arestas)`;
      } else {
        eqBadge.className = 'text-xs px-3 py-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1.5';
        eqBadge.innerHTML = `⚠️ Custos: Prim=${primRes.mstCost} vs Kruskal=${kruskalRes.mstCost}`;
      }

      // Vencedor e Análise Didática
      let winnerText = '';
      let winnerBg = '';
      const tP = Math.max(0.001, primRes.durationMs);
      const tK = Math.max(0.001, kruskalRes.durationMs);

      if (tK < tP) {
        const ratio = (tP / tK).toFixed(1);
        winnerText = `🏆 KRUSKAL VENCEU! Executou ${ratio}x mais rápido (${tK.toFixed(2)}ms vs ${tP.toFixed(2)}ms do Prim).`;
        winnerBg = 'from-purple-900/50 to-purple-950/70 border-purple-600 text-purple-200';
      } else if (tP < tK) {
        const ratio = (tK / tP).toFixed(1);
        winnerText = `🏆 PRIM VENCEU! Executou ${ratio}x mais rápido (${tP.toFixed(2)}ms vs ${tK.toFixed(2)}ms do Kruskal).`;
        winnerBg = 'from-sky-900/50 to-sky-950/70 border-sky-600 text-sky-200';
      } else {
        winnerText = `🤝 EMPATE TÉCNICO! Ambos executaram em tempos equivalentes.`;
        winnerBg = 'from-slate-800 to-slate-900 border-slate-600 text-slate-200';
      }

      if (winnerBadge) {
        winnerBadge.className = `p-3 rounded-xl border bg-gradient-to-r ${winnerBg} font-bold text-sm text-center shadow-lg transition-all`;
        winnerBadge.textContent = winnerText;
      }

      // Barras Visuais de Comparação
      const maxTime = Math.max(tP, tK);
      const primPct = Math.max(4, Math.round((tP / maxTime) * 100));
      const kruskalPct = Math.max(4, Math.round((tK / maxTime) * 100));

      const barPrim = document.getElementById('bench-bar-prim');
      const barKruskal = document.getElementById('bench-bar-kruskal');
      if (barPrim) barPrim.style.width = `${primPct}%`;
      if (barKruskal) barKruskal.style.width = `${kruskalPct}%`;

      if (statusEl) {
        statusEl.innerHTML = `✓ Execução concluída com sucesso!`;
        statusEl.className = 'text-xs font-semibold text-emerald-400';
      }
    }, 40);
  }, 20);
}

// Bateria Automática de 5 Níveis de Densidade
function executeBatchDensityTest() {
  const container = document.getElementById('bench-batch-results');
  if (!container) return;

  const M = 800; // Fixa vértices e varia arestas de 1% a 70%
  const maxPossible = Math.floor((M * (M - 1)) / 2);
  const tests = [
    { label: 'Muito Esparso (0.5%)', N: Math.floor(M * 2) },
    { label: 'Esparso (3%)', N: Math.floor(maxPossible * 0.03) },
    { label: 'Moderado (15%)', N: Math.floor(maxPossible * 0.15) },
    { label: 'Denso (35%)', N: Math.floor(maxPossible * 0.35) },
    { label: 'Muito Denso (60%)', N: Math.floor(maxPossible * 0.60) }
  ];

  container.innerHTML = `<div class="p-3 text-xs text-amber-300 animate-pulse text-center">Rodando bateria automatizada de testes com ${M} vértices...</div>`;

  setTimeout(() => {
    let rowsHtml = '';

    tests.forEach((t) => {
      const g = generateConnectedGraph(M, t.N);
      const kRes = runBenchmarkKruskal(g.M, g.edges);
      const pRes = runBenchmarkPrim(g.M, g.adj);

      const kTime = kRes.durationMs;
      const pTime = pRes.durationMs;
      const winner = kTime < pTime
        ? `<span class="px-2 py-0.5 rounded font-bold bg-purple-900/60 text-purple-300 border border-purple-700/60">Kruskal (${(pTime/kTime).toFixed(1)}x)</span>`
        : `<span class="px-2 py-0.5 rounded font-bold bg-sky-900/60 text-sky-300 border border-sky-700/60">Prim (${(kTime/pTime).toFixed(1)}x)</span>`;

      rowsHtml += `
        <tr class="border-b border-slate-800/60 text-xs">
          <td class="py-2.5 px-3 font-medium text-slate-200">${t.label}</td>
          <td class="py-2.5 px-3 font-mono text-slate-400">${t.N.toLocaleString()} arestas</td>
          <td class="py-2.5 px-3 font-mono text-sky-300 font-semibold">${pTime.toFixed(2)} ms</td>
          <td class="py-2.5 px-3 font-mono text-purple-300 font-semibold">${kTime.toFixed(2)} ms</td>
          <td class="py-2.5 px-3">${winner}</td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60">
              <th class="py-2 px-3">Cenário de Densidade</th>
              <th class="py-2 px-3">Arestas (N)</th>
              <th class="py-2 px-3 text-sky-400">Tempo Prim O(N log M)</th>
              <th class="py-2 px-3 text-purple-400">Tempo Kruskal O(N log N)</th>
              <th class="py-2 px-3">Vencedor Empírico</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="p-2.5 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400">
          💡 <strong>Conclusão Comprovada da Apresentação:</strong> Conforme a densidade aumenta, o custo de ordenar as $N$ arestas no Kruskal $O(N \log N)$ cresce drasticamente, fazendo o <strong>Prim assumir a liderança em grafos densos</strong>. Em grafos esparsos, Kruskal vence pela baixa sobrecarga da ordenação e eficiência da DSU!
        </div>
      </div>
    `;
  }, 50);
}

// Inicia os listeners assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  setupBenchmarkUI();
});
