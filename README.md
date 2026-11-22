# Visualizador em Vídeo: Algoritmos de Prim e Kruskal (MST)

Projeto desenvolvido para a disciplina de **Projeto e Análise de Algoritmos (PAA)** na **UFRPE**.

Esta aplicação implementa um **Player de Vídeo Interativo em HTML5 e JavaScript Puro** que demonstra visualmente a execução passo a passo do **Algoritmo de Prim** e do **Algoritmo de Kruskal** para encontrar a Árvore Geradora Mínima (MST - *Minimum Spanning Tree*) sobre o mesmo grafo conexo e ponderado.

---

## 📽️ Recursos do Player de Vídeo

- **Aspect Ratio 16:9 em Alta Resolução (HD 960x540):** Canvas com escala para telas Retina (`devicePixelRatio`), partículas e brilhos neons (*glow*).
- **Legendas "Burned-in" no Vídeo:** Legendas detalhadas explicando cada decisão gulosa (*greedy choice*), corte e união de conjuntos diretamente na tela do vídeo.
- **Controles de Mídia Completos:**
  - `Play` / `Pausa` (atalho no teclado: <kbd>Barra de Espaço</kbd>).
  - `Avançar Passo` / `Voltar Passo` (atalhos: <kbd>→</kbd> e <kbd>←</kbd>).
  - `Scrubber Timeline`: barra de progresso deslizante para avançar ou rebobinar qualquer segundo.
  - `Velocidade Ajustável`: 0.5x, 1.0x, 1.5x e 2.0x.
  - `Efeitos Sonoros Sintetizados`: sintetizador Web Audio API com tons para aresta aceita, rejeitada por ciclo e conclusão.
- **Exportação / Gravação de Vídeo (.webm):**
  - Botão **"Exportar Vídeo (.webm)"** utiliza a API `MediaRecorder` + `canvas.captureStream(30fps)`.
  - Percorre a animação automaticamente gravando os quadros e baixa um arquivo de vídeo real (`mst_prim_execucao.webm` ou `mst_kruskal_execucao.webm`) para uso em apresentações e slides!
- **HUD Lateral Sincronizado:**
  - Pseudocódigo com destaque em tempo real da linha que está sendo executada.
  - Visualização viva da **Fila de Prioridade / Min-Heap** e corte $(S, V \setminus S)$ para o Prim.
  - Visualização viva dos **Conjuntos Disjuntos (Union-Find / DSU)** com cores distintas por componente e lista de arestas ordenadas para o Kruskal.

---

## 🚀 Como Executar

Não requer instalação de Node.js nem servidores locais. Basta abrir os arquivos `.html` diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Brave, Safari):

1. **Visão Unificada (Recomendado):**
   - Dê um duplo clique ou abra no navegador o arquivo [`index.html`](index.html).
   - Permite alternar instantaneamente entre Prim e Kruskal pelas abas superiores.

2. **Páginas Dedicadas:**
   - [`prim.html`](prim.html): Foco exclusivo no Algoritmo de Prim.
   - [`kruskal.html`](kruskal.html): Foco exclusivo no Algoritmo de Kruskal.

---

## 📊 O Grafo de Teste

Ambos os algoritmos rodam sobre a **mesma topologia**, permitindo comparar visualmente como as estratégias diferem para chegar ao mesmo resultado ótimo:

- **Vértices ($|V| = 7$):** $A, B, C, D, E, F, G$
- **Arestas ($|E| = 12$):**
  1. $(E, G)$ peso 1
  2. $(B, D)$ peso 2
  3. $(A, D)$ peso 3
  4. $(C, F)$ peso 3
  5. $(A, B)$ peso 4
  6. $(E, F)$ peso 4
  7. $(B, C)$ peso 5
  8. $(B, E)$ peso 6
  9. $(D, G)$ peso 6
  10. $(C, E)$ peso 7
  11. $(D, E)$ peso 8
  12. $(F, G)$ peso 9

### Resultado da Árvore Geradora Mínima (MST):
- **Arestas Selecionadas ($|V| - 1 = 6$):**
  - $(E, G)$ [1]
  - $(B, D)$ [2]
  - $(A, D)$ [3]
  - $(C, F)$ [3]
  - $(E, F)$ [4]
  - $(B, C)$ [5]
- **Custo Mínimo Total:** $1 + 2 + 3 + 3 + 4 + 5 = \mathbf{18}$.

---

## 🧠 Análise Teórica dos Algoritmos (PAA)

| Critério | Algoritmo de Prim | Algoritmo de Kruskal |
| :--- | :--- | :--- |
| **Estratégia Gulosa** | Crescimento de **uma única árvore** contígua a partir de um vértice raiz | Criação de uma **floresta de componentes** que vão se fundindo |
| **Critério de Seleção** | Menor aresta que cruza a fronteira do corte $(S, V \setminus S)$ | Menor aresta global que conecta componentes distintos |
| **Prevenção de Ciclos** | Garante que o outro extremo da aresta ainda não pertença a $S$ | Utiliza `FIND-SET(u) ≠ FIND-SET(v)` via Union-Find |
| **Estrutura de Dados** | Fila de Prioridade (Min-Heap binário ou Fibonacci) | Conjuntos Disjuntos (Disjoint-Set Union / DSU com *Path Compression*) |
| **Complexidade de Tempo** | $O(E \log V)$ com heap binário | $O(E \log E)$ (dominado pela ordenação das arestas) |
| **Melhor Desempenho** | Grafos densos ($E \approx V^2$) | Grafos esparsos ($E \ll V^2$) |

---

## 📁 Estrutura dos Arquivos

```
video-exec/
│
├── index.html          # Aplicação principal unificada com abas e player
├── prim.html           # Página individual do vídeo do Algoritmo de Prim
├── kruskal.html        # Página individual do vídeo do Algoritmo de Kruskal
│
├── graph-data.js       # Definição dos nós, arestas, coordenadas e paleta
├── prim-engine.js      # Geração dos passos de execução de Prim
├── kruskal-engine.js   # Geração dos passos de execução de Kruskal + DSU
├── renderer.js         # Motor Canvas (animação, partículas, HUD e legendas)
├── player.js           # Controlador da linha do tempo e reprodução de vídeo
├── recorder.js         # Exportador de vídeo WebM (MediaRecorder API)
├── audio.js            # Sintetizador de efeitos sonoros (Web Audio API)
│
├── style.css           # Estilização do player e linha do tempo
└── README.md           # Documentação completa
```
