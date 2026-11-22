/**
 * Motor de Execução Passo a Passo do Algoritmo de Prim
 * Baseado no crescimento de uma única árvore a partir de um corte (S, V \ S).
 */

const PRIM_PSEUDOCODE = [
  "Prim(Grafo G, raiz r):",
  "  S = {r};  MST = ∅",
  "  Q = arestas_incidentes(r)  // Fila de Prioridade (Min-Heap)",
  "  enquanto |S| < |V| e Q não vazia:",
  "    e = (u, v) = extrair_minimo(Q)  // u ∈ S, v ∉ S",
  "    se v ∉ S:",
  "      S = S ∪ {v};  MST = MST ∪ {e}",
  "      para cada aresta (v, z) com z ∉ S: inserir(Q, (v, z))",
  "  retorne MST"
];

function generatePrimSteps(graph) {
  const steps = [];
  const startNode = 'A';

  // Helper para identificar aresta
  function findEdge(u, v) {
    return graph.edges.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
  }

  // Helper para formatar fila
  function formatQueue(q) {
    return q.map(item => ({
      u: item.u,
      v: item.v,
      w: item.w,
      edgeId: item.edgeId,
      str: `(${item.u}, ${item.v}): ${item.w}`
    }));
  }

  // Estado inicial
  let visited = new Set([startNode]);
  let mstEdges = [];
  let discardedEdges = [];
  let totalWeight = 0;

  // Fila inicial de arestas saindo de A
  let queue = [];
  graph.edges.forEach(e => {
    if (e.u === startNode) queue.push({ u: e.u, v: e.v, w: e.w, edgeId: e.id });
    else if (e.v === startNode) queue.push({ u: e.v, v: e.u, w: e.w, edgeId: e.id });
  });
  queue.sort((a, b) => a.w - b.w);

  // Passo 0: Inicialização
  steps.push({
    stepIndex: 0,
    type: 'init',
    title: 'Inicialização (Raiz A)',
    subtitle: `Início do Algoritmo de Prim a partir da raiz A. O conjunto de vértices na árvore é S = {A}. As arestas incidentes em A entram na fila de prioridade da fronteira de corte.`,
    visitedNodes: Array.from(visited),
    mstEdges: [...mstEdges],
    discardedEdges: [...discardedEdges],
    activeEdge: null,
    activeNode: 'A',
    frontierEdges: queue.map(e => e.edgeId),
    priorityQueue: formatQueue(queue),
    totalWeight: 0,
    codeLine: 1
  });

  let stepCount = 1;

  while (visited.size < graph.vertices.length && queue.length > 0) {
    // Extrai menor aresta
    const minEdgeItem = queue.shift();
    const edgeObj = findEdge(minEdgeItem.u, minEdgeItem.v);
    const u = minEdgeItem.u;
    const v = minEdgeItem.v; // novo candidato a entrar em S

    // Passo de Avaliação da aresta
    steps.push({
      stepIndex: stepCount++,
      type: 'evaluate',
      title: `Avaliando Aresta (${u}, ${v})`,
      subtitle: `Analisando aresta de menor peso da fronteira: (${u}, ${v}) com peso ${minEdgeItem.w}. Vértice de origem ${u} ∈ S; testando se o destino ${v} ∉ S.`,
      visitedNodes: Array.from(visited),
      mstEdges: [...mstEdges],
      discardedEdges: [...discardedEdges],
      activeEdge: edgeObj.id,
      activeNode: v,
      frontierEdges: [edgeObj.id, ...queue.map(e => e.edgeId)],
      priorityQueue: [{ ...minEdgeItem, str: `★ (${u}, ${v}): ${minEdgeItem.w}` }, ...formatQueue(queue)],
      totalWeight: totalWeight,
      codeLine: 4
    });

    if (!visited.has(v)) {
      // Vértice v entra na árvore!
      visited.add(v);
      mstEdges.push(edgeObj.id);
      totalWeight += minEdgeItem.w;

      // Identifica arestas incidentes a v que agora se tornam internas (descartadas)
      // e novas arestas que cruzam para fora de S
      const newlyDiscarded = [];
      graph.edges.forEach(e => {
        const neighbor = (e.u === v) ? e.v : (e.v === v ? e.u : null);
        if (neighbor && neighbor !== u) {
          if (visited.has(neighbor)) {
            // Ambos os vértices estão agora em S! Aresta se torna interna
            if (!mstEdges.includes(e.id) && !discardedEdges.includes(e.id)) {
              discardedEdges.push(e.id);
              newlyDiscarded.push(e);
            }
          } else {
            // Vizinho ainda fora de S, entra na fila da fronteira
            queue.push({ u: v, v: neighbor, w: e.w, edgeId: e.id });
          }
        }
      });

      // Remove da fila de prioridade qualquer aresta cujos dois vértices agora pertencem a S
      queue = queue.filter(item => {
        const isInternal = visited.has(item.u) && visited.has(item.v);
        if (isInternal && !discardedEdges.includes(item.edgeId) && !mstEdges.includes(item.edgeId)) {
          discardedEdges.push(item.edgeId);
        }
        return !isInternal;
      });

      // Reordena a fila de prioridade
      queue.sort((a, b) => a.w - b.w);

      let discInfo = newlyDiscarded.length > 0
        ? ` Aresta(s) interna(s) [${newlyDiscarded.map(e => `(${e.u},${e.v})`).join(', ')}] descartada(s) para evitar ciclos.`
        : '';

      steps.push({
        stepIndex: stepCount++,
        type: 'accept',
        title: `Aresta (${u}, ${v}) Aceita na MST`,
        subtitle: `Aresta (${u}, ${v}) [peso ${minEdgeItem.w}] adicionada à Árvore Geradora Mínima! Vértice ${v} entra no conjunto S. Custo acumulado = ${totalWeight}.${discInfo}`,
        visitedNodes: Array.from(visited),
        mstEdges: [...mstEdges],
        discardedEdges: [...discardedEdges],
        activeEdge: edgeObj.id,
        activeNode: v,
        frontierEdges: queue.map(e => e.edgeId),
        priorityQueue: formatQueue(queue),
        totalWeight: totalWeight,
        codeLine: 6
      });
    } else {
      // Já está em S, descarta
      if (!discardedEdges.includes(edgeObj.id)) {
        discardedEdges.push(edgeObj.id);
      }
      steps.push({
        stepIndex: stepCount++,
        type: 'discard',
        title: `Aresta (${u}, ${v}) Descartada`,
        subtitle: `Vértice ${v} já pertence à árvore S. A aresta (${u}, ${v}) formaria um ciclo interno e é descartada.`,
        visitedNodes: Array.from(visited),
        mstEdges: [...mstEdges],
        discardedEdges: [...discardedEdges],
        activeEdge: edgeObj.id,
        activeNode: null,
        frontierEdges: queue.map(e => e.edgeId),
        priorityQueue: formatQueue(queue),
        totalWeight: totalWeight,
        codeLine: 5
      });
    }
  }

  // Passo Final: Conclusão
  steps.push({
    stepIndex: stepCount,
    type: 'complete',
    title: 'MST de Prim Concluída!',
    subtitle: `Execução concluída! Todos os ${graph.vertices.length} vértices estão conectados por ${mstEdges.length} arestas. Custo total ótimo da Árvore Geradora Mínima = ${totalWeight}.`,
    visitedNodes: Array.from(visited),
    mstEdges: [...mstEdges],
    discardedEdges: [...discardedEdges],
    activeEdge: null,
    activeNode: null,
    frontierEdges: [],
    priorityQueue: [],
    totalWeight: totalWeight,
    codeLine: 8
  });

  return steps;
}
