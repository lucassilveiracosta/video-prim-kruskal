/**
 * Renderizador de Canvas 2D de Alta Fidelidade (16:9 - 960x540)
 * Renderiza o Grafo, Estados das Arestas/Nós, Efeitos Visuais (Glow, Partículas, Linhas animadas)
 * e Queima Legendas/HUD diretamente no Canvas (garantindo que o vídeo exportado tenha legendas e placar!).
 */

class GraphRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.baseWidth = GRAPH_DATA.width;
    this.baseHeight = GRAPH_DATA.height;
    this.animTime = 0;
    this.particles = [];

    // Ajusta resolução física para evitar borrões em telas Retina
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Fixa o buffer interno para 960x540 ou escala se for maior
    this.canvas.width = this.baseWidth * dpr;
    this.canvas.height = this.baseHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  // Gera partículas para arestas recém-aceitas
  emitParticles(x1, y1, x2, y2, color) {
    for (let i = 0; i < 12; i++) {
      const t = Math.random();
      this.particles.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3 + 1.5,
        alpha: 1,
        color: color
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(graph, stepState, algorithmType = 'prim', options = {}) {
    this.animTime += 0.04;
    this.updateParticles();

    const ctx = this.ctx;
    const w = this.baseWidth;
    const h = this.baseHeight;

    // Fundo Cinema / Dark Studio
    ctx.save();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid sutil futurista de fundo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vinheta escura nas bordas do vídeo
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(3, 7, 18, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Mapa de Vértices para consulta rápida de coordenadas
    const nodeMap = {};
    graph.vertices.forEach(v => { nodeMap[v.id] = v; });

    // 1. DESENHAR TODAS AS ARESTAS
    graph.edges.forEach(edge => {
      const u = nodeMap[edge.u];
      const v = nodeMap[edge.v];
      if (!u || !v) return;

      const isMST = stepState.mstEdges && stepState.mstEdges.includes(edge.id);
      const isRejected = (stepState.discardedEdges && stepState.discardedEdges.includes(edge.id)) ||
                         (stepState.rejectedEdges && stepState.rejectedEdges.includes(edge.id));
      const isActive = stepState.activeEdge === edge.id;
      const isFrontier = stepState.frontierEdges && stepState.frontierEdges.includes(edge.id);

      ctx.save();
      if (isMST) {
        // Aresta Aceita na MST: Traço grosso e brilho esmeralda
        ctx.shadowColor = THEME_COLORS.mstGlow;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = THEME_COLORS.mstEdge;
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      } else if (isActive) {
        // Aresta em Avaliação: Amarelo pulsante
        const pulse = 0.5 + 0.5 * Math.sin(this.animTime * 6);
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.7 + 0.3 * pulse})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -this.animTime * 20;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      } else if (isFrontier) {
        // Aresta na Fronteira (Prim): Amarelo sutil tracejado
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      } else if (isRejected) {
        // Aresta Rejeitada (Ciclo): Vermelho translúcido fino
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      } else {
        // Aresta Padrão
        ctx.strokeStyle = THEME_COLORS.edgeDefault;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.stroke();
      }
      ctx.restore();

      // Desenhar Badge com o Peso da Aresta
      const midX = (u.x + v.x) / 2;
      const midY = (u.y + v.y) / 2;

      ctx.save();
      ctx.font = 'bold 12px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Pílula de fundo do peso
      const badgeW = 24;
      const badgeH = 18;
      ctx.fillStyle = isMST ? 'rgba(6, 78, 59, 0.95)' :
                      isActive ? 'rgba(120, 53, 15, 0.95)' :
                      isRejected ? 'rgba(69, 10, 10, 0.85)' :
                      THEME_COLORS.edgeTextBg;
      ctx.strokeStyle = isMST ? THEME_COLORS.mstEdge :
                        isActive ? THEME_COLORS.candidateEdge :
                        isRejected ? THEME_COLORS.rejectedEdge :
                        'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      // Retângulo arredondado
      ctx.beginPath();
      ctx.roundRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isMST ? '#a7f3d0' :
                      isActive ? '#fde68a' :
                      isRejected ? '#fca5a5' :
                      THEME_COLORS.edgeText;
      ctx.fillText(edge.w, midX, midY + 0.5);
      ctx.restore();
    });

    // 2. DESENHAR PARTÍCULAS
    ctx.save();
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. DESENHAR OS VÉRTICES
    graph.vertices.forEach(v => {
      ctx.save();
      const radius = 24;

      let isInTree = false;
      let nodeColor = THEME_COLORS.unvisitedNode;
      let borderColor = THEME_COLORS.nodeBorderDefault;
      let haloColor = null;

      if (algorithmType === 'prim') {
        isInTree = stepState.visitedNodes && stepState.visitedNodes.includes(v.id);
        if (isInTree) {
          nodeColor = '#0f172a';
          borderColor = THEME_COLORS.mstEdge;
          haloColor = THEME_COLORS.mstGlow;
        }
        if (stepState.activeNode === v.id) {
          haloColor = 'rgba(245, 158, 11, 0.6)';
          borderColor = THEME_COLORS.candidateEdge;
        }
      } else {
        // Kruskal: Cores por Componente Conexo
        if (stepState.nodeColors && stepState.nodeColors[v.id]) {
          const compColor = stepState.nodeColors[v.id];
          nodeColor = '#0f172a';
          borderColor = compColor;
          haloColor = compColor + '55'; // 33% transparência
        }
      }

      // Halo / Brilho Externo
      if (haloColor) {
        ctx.shadowColor = haloColor;
        ctx.shadowBlur = 18;
      }

      // Círculo principal
      ctx.beginPath();
      ctx.arc(v.x, v.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = borderColor;
      ctx.stroke();

      // Anel interno sutil
      ctx.beginPath();
      ctx.arc(v.x, v.y, radius - 4, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Texto do Vértice (Letra centralizada)
      ctx.font = 'bold 16px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(v.label, v.x, v.y);

      ctx.restore();
    });

    // 4. HUD SUPERIOR DO VÍDEO (Badges de Algoritmo e Custo Total)
    this.renderTopHUD(ctx, w, stepState, algorithmType);

    // 5. BANNER DE LEGENDA / SUBTÍTULOS (Burned-in no Canvas)
    this.renderSubtitles(ctx, w, h, stepState);

    ctx.restore();
  }

  renderTopHUD(ctx, w, stepState, algorithmType) {
    ctx.save();
    // Badge do Algoritmo (Canto Superior Esquerdo)
    const title = algorithmType === 'prim' ? 'ALGORITMO DE PRIM' : 'ALGORITMO DE KRUSKAL';
    const tag = algorithmType === 'prim' ? 'Crescimento de Árvore Única (Corte S)' : 'Floresta de Conjuntos Disjuntos (DSU)';

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(24, 20, 310, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = algorithmType === 'prim' ? '#38bdf8' : '#c084fc';
    ctx.fillText(title, 38, 38);

    ctx.font = '11px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(tag, 38, 56);

    // Badge de Custo Total Acumulado (Canto Superior Direito)
    const costText = `Custo MST: ${stepState.totalWeight || 0}`;
    const edgesText = `Arestas: ${stepState.mstEdges ? stepState.mstEdges.length : 0} / 6`;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.beginPath();
    ctx.roundRect(w - 200, 20, 176, 48, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText(costText, w - 40, 38);

    ctx.font = '11px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(edgesText, w - 40, 56);

    ctx.restore();
  }

  renderSubtitles(ctx, w, h, stepState) {
    if (!stepState || !stepState.subtitle) return;

    ctx.save();
    const boxHeight = 76;
    const boxY = h - boxHeight - 16;
    const boxWidth = w - 48;
    const boxX = 24;

    // Fundo semitransparente cinema
    ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();

    // Ícone / Indicador de Tipo de Passo
    let typeColor = '#38bdf8';
    let typeLabel = 'PASSO';
    if (stepState.type === 'accept') {
      typeColor = '#10b981';
      typeLabel = 'ACEITA NA MST';
    } else if (stepState.type === 'cycle' || stepState.type === 'discard') {
      typeColor = '#ef4444';
      typeLabel = 'REJEITADA (CICLO)';
    } else if (stepState.type === 'evaluate') {
      typeColor = '#f59e0b';
      typeLabel = 'AVALIANDO';
    } else if (stepState.type === 'complete') {
      typeColor = '#a855f7';
      typeLabel = 'CONCLUÍDO';
    }

    ctx.font = 'bold 11px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = typeColor;
    ctx.textAlign = 'left';
    ctx.fillText(`● [${typeLabel}]  ${stepState.title || ''}`, boxX + 16, boxY + 22);

    // Texto da Legenda (com quebra de linha se necessário)
    ctx.font = '13px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    this.wrapText(ctx, stepState.subtitle, boxX + 16, boxY + 44, boxWidth - 32, 19);

    ctx.restore();
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
