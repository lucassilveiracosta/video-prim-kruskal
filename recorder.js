/**
 * Utilitário de Gravação e Exportação de Vídeo em WebM (HTML5 Canvas + MediaRecorder API)
 * Permite exportar a animação do algoritmo como um arquivo de vídeo real (.webm) para download.
 */

class CanvasVideoRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.onProgress = null;
    this.onFinished = null;
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined';
  }

  start(canvas, fps = 30) {
    if (!this.isSupported()) {
      alert('MediaRecorder API não é suportada neste navegador.');
      return false;
    }

    try {
      this.recordedChunks = [];
      const stream = canvas.captureStream ? canvas.captureStream(fps) : null;
      if (!stream) {
        alert('Não foi possível capturar o stream do canvas.');
        return false;
      }

      // Procura codecs suportados
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 4000000 // 4 Mbps para alta nitidez
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.isRecording = false;
        if (this.onFinished) {
          this.onFinished(blob);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      alert('Erro ao iniciar gravação: ' + err.message);
      return false;
    }
  }

  stop() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  downloadBlob(blob, filename = 'mst_algoritmo.webm') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 200);
  }
}
