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

## ⚡ Nova Aba: Benchmark & Apresentação (Beecrowd 1764)

Adicionada uma aba dedicada à apresentação e análise comparativa de desempenho prático com base no problema **1764 - Itinerário do Papai Noel** do **Beecrowd**:

- **Submissões Reais Aceitas:**
  - **Prim (#50526552):** C++20 (`-O2`), tempo `0.000s`, tamanho `1,08 KB`. Implementado com lista de adjacência e `priority_queue` (Min-Heap).
  - **Kruskal (#50526538):** C++20 (`-O2`), tempo `0.000s`, tamanho `3,45 KB`. Implementado com ordenação de arestas e `DSU` (*Path Compression* + *Union by Rank*).
- **Slide Interativo ("ANÁLISE COMPARATIVA"):**
  - **Funcionamento:** Kruskal (foco nas arestas e ordenação) vs Prim (foco nos vértices e expansão gradual).
  - **Complexidade:** Kruskal $O(N \log N)$ em tempo e $O(M + N)$ em espaço vs Prim $O(N \log M)$ em tempo e $O(M + N)$ em espaço (*onde $M$ = cidades/vértices e $N$ = estradas/arestas*).
  - **Obs. de Implementação:** Prim com matriz de adjacência tem custo $O(M^2)$ em tempo e espaço; com lista e heap binário tem custo $O(N \log M)$.
  - **Qual Usar:** Kruskal vence em grafos esparsos; Prim vence em grafos densos.
- **Suite de Execução ao Vivo:**
  - Presets de 1-clique para demonstração ao vivo para o professor/turma (Beecrowd 1764, Grafo Esparso, Grafo Médio e Grafo Denso).
  - Sliders para customizar $M$ (vértices) e $N$ (arestas) em tempo real com cálculo dinâmico da densidade percentual.
  - Cronometragem real em microssegundos com `performance.now()`, barras comparativas proporcionais e validação de equivalência da MST.
  - Bateria automatizada testando 5 níveis de densidade (0.5% a 60%) com tabela comparativa ao vivo.

---

## 🧠 Análise Teórica dos Algoritmos (PAA)

| Critério | Algoritmo de Prim | Algoritmo de Kruskal |
| :--- | :--- | :--- |
| **Estratégia Gulosa** | Crescimento de **uma única árvore** contígua a partir de um vértice raiz | Criação de uma **floresta de componentes** que vão se fundindo |
| **Critério de Seleção** | Menor aresta que cruza a fronteira do corte $(S, V \setminus S)$ | Menor aresta global que conecta componentes distintos |
| **Prevenção de Ciclos** | Garante que o outro extremo da aresta ainda não pertença a $S$ | Utiliza `FIND-SET(u) ≠ FIND-SET(v)` via Union-Find |
| **Estrutura de Dados** | Fila de Prioridade (Min-Heap binário ou Fibonacci) | Conjuntos Disjuntos (Disjoint-Set Union / DSU com *Path Compression*) |
| **Complexidade de Tempo** | $O(N \log M)$ ou $O(E \log V)$ com heap binário | $O(N \log N)$ ou $O(E \log E)$ (dominado pela ordenação) |
| **Melhor Desempenho** | Grafos densos ($N \approx M^2$) | Grafos esparsos ($N \approx M$) |

---

## 📁 Estrutura dos Arquivos

```
video-exec/
│
├── index.html          # Aplicação principal unificada (Abas Prim, Kruskal e Benchmark)
├── prim.html           # Página individual do vídeo do Algoritmo de Prim
├── kruskal.html        # Página individual do vídeo do Algoritmo de Kruskal
│
├── benchmark.js        # Motor de benchmark ao vivo e submissões Beecrowd 1764
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
