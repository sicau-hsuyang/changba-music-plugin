export class AudioInitializer {
  audioPlayer!: HTMLAudioElement;

  constructor() {
    this.initAudioElement();
  }

  updateSource(src: string) {
    this.audioPlayer.currentTime = 0;
    this.audioPlayer.load();
    this.audioPlayer.src = src;
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
    const sourceElement = document.createElement("source");
    const textElement = document.createTextNode("Your browser does not support the audio element.");
    audio.appendChild(sourceElement);
    audio.appendChild(textElement);
    this.audioPlayer = audio;
    document.body.appendChild(audio);
  }
}
