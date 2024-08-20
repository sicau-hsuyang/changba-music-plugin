type Fn = (...args: unknown[]) => unknown;

export class AudioInitializer {
  audioPlayer!: HTMLAudioElement;

  queue: Fn[] = [];

  constructor() {
    this.initAudioElement();
  }

  private _onSeek = (ev: Event) => {
    while (this.queue.length) {
      const fn = this.queue.shift()!;
      fn(ev);
    }
  };

  private seek() {
    if (!this.audioPlayer) {
      return;
    }
    // 删除之前注册的
    this.audioPlayer.removeEventListener("canplaythrough", this._onSeek);
    // 重新注册
    this.audioPlayer.addEventListener("canplaythrough", this._onSeek);
    return new Promise((resolve, reject) => {
      // 将其加入到队列中，等待缓冲完成之后再触发
      this.queue.push(resolve);
      // 同时处理超时逻辑
      setTimeout(() => {
        reject("load resource timeout");
      }, 30000);
    });
  }

  async updateSource({ src, startTime }: { src: string; startTime?: number }) {
    let sourceEl = this.audioPlayer.children[0] as HTMLSourceElement;
    if (!sourceEl) {
      this.initChild();
      sourceEl = this.audioPlayer.children[0] as HTMLSourceElement;
    }
    sourceEl.src = src || '/';
    this.audioPlayer.load();
    this.audioPlayer.currentTime = 0;
    // 等待资源加载完成
    await this.seek();
    const t = startTime || 0;
    this.audioPlayer.currentTime = t / 1000;
  }

  private initChild() {
    const doc = document.createDocumentFragment();
    const sourceElement = document.createElement("source");
    const textElement = document.createTextNode("Your browser does not support the audio element.");
    sourceElement.type = "audio/mpeg";
    doc.appendChild(sourceElement);
    doc.appendChild(textElement);
    this.audioPlayer.appendChild(doc);
  }

  private initAudioElement() {
    const id = "changba-singleton-audio-player";
    if (document.querySelector("#" + id)) {
      return;
    }
    const audio = document.createElement("audio");
    audio.id = id;
    audio.style.display = "none";
    audio.controls = true;
    this.audioPlayer = audio;
    document.body.appendChild(audio);
  }
}
