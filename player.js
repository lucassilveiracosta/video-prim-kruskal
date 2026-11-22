/**
 * Controlador de Reprodução de Vídeo (Player de Animação e Sincronização)
 * Gerencia a Linha do Tempo, Auto-Play, Pausa, Avanço, Recuo, Velocidade,
 * Sincronização de Pseudocódigo, Tabela de Estruturas e Gravação WebM.
 */

class AlgorithmVideoPlayer {
  constructor(config) {
    this.canvas = config.canvas;
    this.renderer = new GraphRenderer(this.canvas);
    this.algorithmType = config.algorithmType || 'prim'; // 'prim' ou 'kruskal'
    this.graph = getGraphClone();

    // Elementos da UI
    this.playBtn = config.playBtn;
    this.prevBtn = config.prevBtn;
    this.nextBtn = config.nextBtn;
    this.restartBtn = config.restartBtn;
    this.speedSelect = config.speedSelect;
    this.timeline = config.timeline;
    this.timeReadout = config.timeReadout;
    this.stepReadout = config.stepReadout;
    this.soundToggleBtn = config.soundToggleBtn;
    this.recordBtn = config.recordBtn;

    // HUD / Painel lateral
    this.codeContainer = config.codeContainer;
    this.dataStructContainer = config.dataStructContainer;

    // Estado da Linha do Tempo
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1.0;
    this.baseDelayMs = 2000; // 2 segundos por passo em 1x
    this.timer = null;

    // Gravador de Vídeo WebM
    this.recorder = new CanvasVideoRecorder();

    // Inicialização
    this.loadAlgorithm(this.algorithmType);
    this.bindEvents();
    this.startRenderLoop();
  }

  loadAlgorithm(type) {
    this.pause();
    this.algorithmType = type;
    this.graph = getGraphClone();

    if (type === 'prim') {
      this.steps = generatePrimSteps(this.graph);
      this.renderPseudocode(PRIM_PSEUDOCODE);
    } else {
      this.steps = generateKruskalSteps(this.graph);
      this.renderPseudocode(KRUSKAL_PSEUDOCODE);
    }

    this.currentStep = 0;
    if (this.timeline) {
      this.timeline.min = 0;
      this.timeline.max = this.steps.length - 1;
      this.timeline.value = 0;
    }

    this.updateUI();
  }

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlay());
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prevStep());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextStep());
    }
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restart());
    }
    if (this.timeline) {
      this.timeline.addEventListener('input', (e) => {
        this.goToStep(parseInt(e.target.value, 10));
      });
    }
    if (this.speedSelect) {
      this.speedSelect.addEventListener('change', (e) => {
        this.speed = parseFloat(e.target.value);
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const enabled = sfx.toggle();
        this.soundToggleBtn.innerHTML = enabled
          ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>`
          : `<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>`;
      });
    }

    // Gravação WebM automática
    if (this.recordBtn) {
      this.recordBtn.addEventListener('click', () => this.recordVideo());
    }

    // Teclas de Atalho do Teclado (Espaço = Play/Pause, Setas = Avançar/Voltar)
    window.addEventListener('keydown', (e) => {
      // Ignora se estiver digitando em input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.prevStep();
      }
    });
  }

  startRenderLoop() {
    const loop = () => {
      const currentStepObj = this.steps[this.currentStep] || {};
      this.renderer.render(this.graph, currentStepObj, this.algorithmType);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentStep >= this.steps.length - 1) {
      this.currentStep = 0; // Reinicia se estiver no final
    }
    this.isPlaying = true;
    this.updatePlayButton();
    this.scheduleNextTick();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updatePlayButton();
  }

  scheduleNextTick() {
    if (!this.isPlaying) return;

    const delay = this.baseDelayMs / this.speed;
    this.timer = setTimeout(() => {
      if (this.currentStep < this.steps.length - 1) {
        this.goToStep(this.currentStep + 1);
        this.scheduleNextTick();
      } else {
        this.pause();
        sfx.playComplete();
      }
    }, delay);
  }

  restart() {
    this.pause();
    this.goToStep(0);
  }

  prevStep() {
    this.pause();
    if (this.currentStep > 0) {
      this.goToStep(this.currentStep - 1);
    }
  }

  nextStep() {
    this.pause();
    if (this.currentStep < this.steps.length - 1) {
      this.goToStep(this.currentStep + 1);
    }
  }

  goToStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStep = index;
    const step = this.steps[this.currentStep];

    // Efeitos Sonoros contextuais
    if (step.type === 'accept') {
      sfx.playAccept();
      // Partículas no canvas
      const edge = this.graph.edges.find(e => e.id === step.activeEdge);
      if (edge) {
        const u = this.graph.vertices.find(v => v.id === edge.u);
        const v = this.graph.vertices.find(v => v.id === edge.v);
        if (u && v) this.renderer.emitParticles(u.x, u.y, v.x, v.y, '#10b981');
      }
    } else if (step.type === 'cycle' || step.type === 'discard') {
      sfx.playReject();
    } else if (step.type === 'evaluate') {
      sfx.playStep();
    } else if (step.type === 'complete') {
      sfx.playComplete();
    }

    this.updateUI();
  }

  updatePlayButton() {
    if (!this.playBtn) return;
    if (this.isPlaying) {
      this.playBtn.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
        <span class="hidden sm:inline">Pausar</span>
      `;
      this.playBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
      this.playBtn.classList.add('bg-amber-600', 'hover:bg-amber-500');
    } else {
      this.playBtn.innerHTML = `
        <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span class="hidden sm:inline">Reproduzir</span>
      `;
      this.playBtn.classList.remove('bg-amber-600', 'hover:bg-amber-500');
      this.playBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
    }
  }

  updateUI() {
    const step = this.steps[this.currentStep] || {};

    // Atualiza Slider
    if (this.timeline) {
      this.timeline.value = this.currentStep;
    }

    // Atualiza Readouts
    if (this.stepReadout) {
      this.stepReadout.textContent = `Passo ${this.currentStep + 1} de ${this.steps.length}`;
    }

    if (this.timeReadout) {
      const currentSec = Math.round(this.currentStep * 2);
      const totalSec = Math.round(this.steps.length * 2);
      const fmt = (s) => `00:${s < 10 ? '0' : ''}${s}`;
      this.timeReadout.textContent = `${fmt(currentSec)} / ${fmt(totalSec)}`;
    }

    // Destaca Linha no Pseudocódigo
    this.highlightCodeLine(step.codeLine);

    // Atualiza Painel de Estrutura de Dados
    this.renderDataStructures(step);
  }

  renderPseudocode(lines) {
    if (!this.codeContainer) return;
    this.codeContainer.innerHTML = lines.map((line, idx) => `
      <div id="code-line-${idx}" class="px-2.5 py-0.5 font-mono text-xs rounded transition-colors duration-150 text-slate-300">
        <span class="select-none text-slate-500 mr-2">${idx + 1}</span>${this.escapeHtml(line)}
      </div>
    `).join('');
  }

  highlightCodeLine(lineIndex) {
    if (!this.codeContainer) return;
    const lines = this.codeContainer.querySelectorAll('[id^="code-line-"]');
    lines.forEach((el, idx) => {
      if (idx === lineIndex) {
        el.className = 'px-2.5 py-0.5 font-mono text-xs rounded bg-sky-500/20 text-sky-200 border-l-2 border-sky-400 font-semibold';
      } else {
        el.className = 'px-2.5 py-0.5 font-mono text-xs rounded transition-colors duration-150 text-slate-400';
      }
    });
  }

  renderDataStructures(step) {
    if (!this.dataStructContainer) return;

    if (this.algorithmType === 'prim') {
      const q = step.priorityQueue || [];
      const visited = step.visitedNodes || [];
      const unvisited = this.graph.vertices
        .map(v => v.id)
        .filter(id => !visited.includes(id));

      this.dataStructContainer.innerHTML = `
        <div class="space-y-3">
          <div>
            <div class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
              Partição do Corte (S e V \\ S)
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 rounded bg-slate-900/60 border border-emerald-500/30">
                <span class="text-emerald-400 font-bold block mb-1">Árvore S:</span>
                <span class="font-mono text-slate-200">{ ${visited.join(', ')} }</span>
              </div>
              <div class="p-2 rounded bg-slate-900/60 border border-slate-700/60">
                <span class="text-slate-400 font-bold block mb-1">Fora (V \\ S):</span>
                <span class="font-mono text-slate-300">{ ${unvisited.length ? unvisited.join(', ') : '∅'} }</span>
              </div>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
              <span>Fila de Prioridade (Q) - Min-Heap</span>
              <span class="text-sky-400">${q.length} na fronteira</span>
            </div>
            <div class="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              ${q.length === 0 ? '<div class="text-slate-500 italic p-2 text-center">Fila vazia</div>' : ''}
              ${q.map((item, idx) => `
                <div class="flex items-center justify-between px-2 py-1 rounded ${idx === 0 ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40' : 'bg-slate-900/40 text-slate-300'}">
                  <span>${item.str || `(${item.u}, ${item.v})`}</span>
                  <span class="px-1.5 py-0.2 rounded text-[10px] ${idx === 0 ? 'bg-amber-500/30 text-amber-300 font-bold' : 'bg-slate-800 text-slate-400'}">peso ${item.w}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      // Kruskal
      const comps = step.components || [];
      const edges = step.edgeList || [];

      this.dataStructContainer.innerHTML = `
        <div class="space-y-3">
          <div>
            <div class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
              Conjuntos Disjuntos (DSU / Floresta)
            </div>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              ${comps.map((c, i) => `
                <span class="px-2 py-1 rounded text-xs font-mono font-semibold bg-slate-900/80 border" style="border-color: ${THEME_COLORS.componentColors[i % THEME_COLORS.componentColors.length]}; color: ${THEME_COLORS.componentColors[i % THEME_COLORS.componentColors.length]}">
                  { ${c.join(', ')} }
                </span>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-1">
              <span>Arestas Ordenadas (Crescente)</span>
              <span class="text-purple-400">${edges.filter(e => e.status === 'accepted').length}/6 aceitas</span>
            </div>
            <div class="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
              ${edges.map(e => {
                let badge = '<span class="text-slate-500">Pendente</span>';
                let rowBg = 'bg-slate-900/40 text-slate-300';
                if (e.status === 'evaluating') {
                  badge = '<span class="text-amber-400 font-bold">Avaliando</span>';
                  rowBg = 'bg-amber-500/20 text-amber-200 border border-amber-500/40';
                } else if (e.status === 'accepted') {
                  badge = '<span class="text-emerald-400 font-bold">✓ Aceita</span>';
                  rowBg = 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/30';
                } else if (e.status === 'rejected') {
                  badge = '<span class="text-red-400 font-bold">✗ Ciclo</span>';
                  rowBg = 'bg-red-950/30 text-red-300 border border-red-500/30';
                }
                return `
                  <div class="flex items-center justify-between px-2 py-1 rounded ${rowBg}">
                    <span>(${e.u}, ${e.v}) [peso ${e.w}]</span>
                    <span class="text-[11px]">${badge}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Grava a animação completa de 0 ao fim e exporta .webm
  recordVideo() {
    if (!this.recorder.isSupported()) {
      alert('MediaRecorder API não é suportada neste navegador.');
      return;
    }

    if (this.recorder.isRecording) {
      this.recorder.stop();
      return;
    }

    this.pause();
    this.goToStep(0);

    const filename = `mst_${this.algorithmType}_execucao.webm`;
    const origBtnText = this.recordBtn.innerHTML;

    this.recordBtn.innerHTML = `
      <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-1 inline-block"></span>
      <span>Gravando...</span>
    `;
    this.recordBtn.classList.add('border-red-500', 'text-red-400');

    this.recorder.onFinished = (blob) => {
      this.recorder.downloadBlob(blob, filename);
      this.recordBtn.innerHTML = origBtnText;
      this.recordBtn.classList.remove('border-red-500', 'text-red-400');
      alert(`Vídeo gravado com sucesso! Arquivo "${filename}" baixado.`);
    };

    const started = this.recorder.start(this.canvas, 30);
    if (!started) {
      this.recordBtn.innerHTML = origBtnText;
      this.recordBtn.classList.remove('border-red-500', 'text-red-400');
      return;
    }

    // Executa os passos com temporização fixa para gravação suave
    let stepIdx = 0;
    const recordInterval = setInterval(() => {
      if (stepIdx < this.steps.length) {
        this.goToStep(stepIdx);
        stepIdx++;
      } else {
        clearInterval(recordInterval);
        setTimeout(() => {
          this.recorder.stop();
        }, 1500); // 1.5s no último frame
      }
    }, 1800);
  }
}
