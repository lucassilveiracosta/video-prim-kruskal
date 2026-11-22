/**
 * Motor de Execução Passo a Passo do Algoritmo de Kruskal
 * Baseado na ordenação global de arestas e estrutura de dados Disjoint-Set (Union-Find).
 */

const KRUSKAL_PSEUDOCODE = [
  "Kruskal(Grafo G):",
  "  MST = ∅",
  "  para cada vértice v ∈ V: MAKE-SET(v)",
  "  E_ord = ordenar as arestas de E por peso crescente",
  "  para cada aresta (u, v) ∈ E_ord:",
  "    se FIND-SET(u) ≠ FIND-SET(v):",
  "      MST = MST ∪ {(u, v)}",
  "      UNION(u, v)",
  "    senão: descartar (u, v) // fecha ciclo",
  "  retorne MST"
];

class DisjointSet {
  constructor(elements) {
    this.parent = {};
    this.rank = {};
    elements.forEach(el => {
      this.parent[el] = el;
      this.rank[el] = 0;
    });
  }

  find(i) {
    if (this.parent[i] === i) {
      return i;
    }
    this.parent[i] = this.find(this.parent[i]); // compressão de caminho
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
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

  // Retorna os conjuntos agrupados
  getComponents(elements) {
    const groups = {};
    elements.forEach(el => {
      const root = this.find(el);
      if (!groups[root]) groups[root] = [];
      groups[root].push(el);
    });
    return Object.values(groups);
  }

  clone(elements) {
    const copy = new DisjointSet([]);
    elements.forEach(el => {
      copy.parent[el] = this.parent[el];
      copy.rank[el] = this.rank[el];
    });
    return copy;
  }
}

function generateKruskalSteps(graph) {
  const steps = [];
  const vertexIds = graph.vertices.map(v => v.id);

  // Ordena todas as arestas por peso não-decrescente
  const sortedEdges = [...graph.edges].sort((a, b) => a.w - b.w);

  const dsu = new DisjointSet(vertexIds);

  let mstEdges = [];
  let rejectedEdges = [];
  let totalWeight = 0;

  // Mapa de cores para cada componente
  const componentColorMap = {};
  const baseColors = THEME_COLORS.componentColors;
  vertexIds.forEach((v, idx) => {
    componentColorMap[v] = baseColors[idx % baseColors.length];
  });

  function getVertexColors() {
    // Todos os nós com a mesma raiz compartilham a cor da raiz
    const colors = {};
    vertexIds.forEach(v => {
      const root = dsu.find(v);
      colors[v] = componentColorMap[root];
    });
    return colors;
  }

  function getEdgeListState(activeEdgeId) {
    return sortedEdges.map(e => {
      let status = 'pending';
      if (mstEdges.includes(e.id)) status = 'accepted';
      else if (rejectedEdges.includes(e.id)) status = 'rejected';
      else if (e.id === activeEdgeId) status = 'evaluating';
      return {
        id: e.id,
        u: e.u,
        v: e.v,
        w: e.w,
        status: status
      };
    });
  }

  // Passo 0: Inicialização (Make-Set em cada vértice)
  steps.push({
    stepIndex: 0,
    type: 'init',
    title: 'Inicialização (Make-Set e Ordenação)',
    subtitle: `Início do Algoritmo de Kruskal. Cada vértice inicia em seu próprio conjunto disjunto {A}, {B}, ..., {G}. As ${sortedEdges.length} arestas são previamente ordenadas pelo peso crescente.`,
    mstEdges: [...mstEdges],
    rejectedEdges: [...rejectedEdges],
    activeEdge: null,
    components: dsu.getComponents(vertexIds),
    nodeColors: getVertexColors(),
    edgeList: getEdgeListState(null),
    totalWeight: 0,
    codeLine: 2
  });

  let stepCount = 1;

  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const u = edge.u;
    const v = edge.v;

    // Se já temos |V| - 1 arestas, a árvore geradora já está completa!
    if (mstEdges.length === vertexIds.length - 1) {
      // As arestas restantes podem ser mostradas como ignoradas
      break;
    }

    const rootU = dsu.find(u);
    const rootV = dsu.find(v);

    // Passo de Avaliação da Aresta
    steps.push({
      stepIndex: stepCount++,
      type: 'evaluate',
      title: `Avaliando Aresta (${u}, ${v}) [peso ${edge.w}]`,
      subtitle: `Analisando aresta de menor peso disponível: (${u}, ${v}) com peso ${edge.w}. Verificando componentes: FIND(${u}) = ${rootU} e FIND(${v}) = ${rootV}.`,
      mstEdges: [...mstEdges],
      rejectedEdges: [...rejectedEdges],
      activeEdge: edge.id,
      components: dsu.getComponents(vertexIds),
      nodeColors: getVertexColors(),
      edgeList: getEdgeListState(edge.id),
      totalWeight: totalWeight,
      codeLine: 5
    });

    if (rootU !== rootV) {
      // Vértices pertencem a componentes diferentes: NÃO forma ciclo!
      dsu.union(u, v);
      mstEdges.push(edge.id);
      totalWeight += edge.w;

      // Nova união dos conjuntos
      const newComps = dsu.getComponents(vertexIds);
      const unifiedComp = newComps.find(c => c.includes(u));

      steps.push({
        stepIndex: stepCount++,
        type: 'accept',
        title: `Aresta (${u}, ${v}) Aceita na MST!`,
        subtitle: `Vértices ${u} e ${v} pertenciam a componentes distintos. Aresta (${u}, ${v}) [peso ${edge.w}] é aceita na MST! Os conjuntos foram unidos em {${unifiedComp.join(', ')}}. Custo acumulado = ${totalWeight}.`,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        activeEdge: edge.id,
        components: newComps,
        nodeColors: getVertexColors(),
        edgeList: getEdgeListState(edge.id),
        totalWeight: totalWeight,
        codeLine: 6
      });
    } else {
      // Vértices já estão no mesmo componente: FORMA CICLO!
      rejectedEdges.push(edge.id);

      steps.push({
        stepIndex: stepCount++,
        type: 'cycle',
        title: `Aresta (${u}, ${v}) Rejeitada (Ciclo!)`,
        subtitle: `ATENÇÃO: Vértices ${u} e ${v} já pertencem ao mesmo conjunto componente {${dsu.getComponents(vertexIds).find(c => c.includes(u)).join(', ')}}! A aresta (${u}, ${v}) criaria um ciclo e é descartada.`,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        activeEdge: edge.id,
        components: dsu.getComponents(vertexIds),
        nodeColors: getVertexColors(),
        edgeList: getEdgeListState(edge.id),
        totalWeight: totalWeight,
        codeLine: 8
      });
    }
  }

  // Passo Final: Conclusão
  steps.push({
    stepIndex: stepCount,
    type: 'complete',
    title: 'MST de Kruskal Concluída!',
    subtitle: `Execução concluída! Árvore Geradora Mínima conectou todos os ${vertexIds.length} vértices em um único componente disjunto com ${mstEdges.length} arestas. Custo total ótimo = ${totalWeight}.`,
    mstEdges: [...mstEdges],
    rejectedEdges: [...rejectedEdges],
    activeEdge: null,
    components: dsu.getComponents(vertexIds),
    nodeColors: getVertexColors(),
    edgeList: getEdgeListState(null),
    totalWeight: totalWeight,
    codeLine: 9
  });

  return steps;
}
