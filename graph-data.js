/**
 * Dados e Topologia do Grafo
 * Grafo conexo, ponderado e não-direcionado com 7 vértices e 12 arestas.
 * Disposição planar (sem cruzamento de arestas) em resolução 16:9 (960x540).
 */

const GRAPH_DATA = {
  // Resolução base de referência (16:9)
  width: 960,
  height: 540,

  // Vértices com posições coordenadas
  vertices: [
    { id: 'A', x: 170, y: 190, label: 'A' },
    { id: 'B', x: 380, y: 120, label: 'B' },
    { id: 'C', x: 620, y: 130, label: 'C' },
    { id: 'D', x: 260, y: 340, label: 'D' },
    { id: 'E', x: 500, y: 310, label: 'E' },
    { id: 'F', x: 790, y: 260, label: 'F' },
    { id: 'G', x: 440, y: 460, label: 'G' }
  ],

  // 12 Arestas não-direcionadas com pesos variados
  edges: [
    { id: 'e1',  u: 'E', v: 'G', w: 1 },
    { id: 'e2',  u: 'B', v: 'D', w: 2 },
    { id: 'e3',  u: 'A', v: 'D', w: 3 },
    { id: 'e4',  u: 'C', v: 'F', w: 3 },
    { id: 'e5',  u: 'A', v: 'B', w: 4 },
    { id: 'e6',  u: 'E', v: 'F', w: 4 },
    { id: 'e7',  u: 'B', v: 'C', w: 5 },
    { id: 'e8',  u: 'B', v: 'E', w: 6 },
    { id: 'e9',  u: 'D', v: 'G', w: 6 },
    { id: 'e10', u: 'C', v: 'E', w: 7 },
    { id: 'e11', u: 'D', v: 'E', w: 8 },
    { id: 'e12', u: 'F', v: 'G', w: 9 }
  ]
};

// Paleta de cores para os componentes conexos do Kruskal e estados do Prim
const THEME_COLORS = {
  nodeDefault: '#334155',
  nodeBorderDefault: '#64748b',
  nodeText: '#f8fafc',
  edgeDefault: '#475569',
  edgeTextBg: 'rgba(15, 23, 42, 0.85)',
  edgeText: '#cbd5e1',

  // Estados ativos
  mstEdge: '#10b981',         // Verde esmeralda (Aresta Aceita na MST)
  mstNode: '#059669',         // Verde árvore
  mstGlow: 'rgba(16, 185, 129, 0.4)',

  candidateEdge: '#f59e0b',   // Âmbar / Amarelo (Aresta em avaliação ou na fronteira)
  candidateGlow: 'rgba(245, 158, 11, 0.35)',

  rejectedEdge: '#ef4444',    // Vermelho (Forma ciclo no Kruskal ou descartada)
  rejectedGlow: 'rgba(239, 68, 68, 0.35)',

  visitedNode: '#3b82f6',     // Azul (Vértice pertencente à árvore de Prim)
  unvisitedNode: '#1e293b',   // Fundo nós não visitados

  // Cores de conjuntos do Kruskal (DSU)
  componentColors: [
    '#3b82f6', // Azul
    '#8b5cf6', // Roxo
    '#ec4899', // Rosa
    '#f97316', // Laranja
    '#06b6d4', // Ciano
    '#10b981', // Verde
    '#eab308'  // Amarelo
  ]
};

// Retorna cópia profunda do grafo
function getGraphClone() {
  return JSON.parse(JSON.stringify(GRAPH_DATA));
}
