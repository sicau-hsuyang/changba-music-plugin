import { reactive } from "vue";
import { AudioInitializer } from "./audio";
export interface MusicInfo {
  workId: string;

  workPath: string;
}

class ChangbaMusicPlayer {
  private initializer: AudioInitializer;

  private player: HTMLAudioElement;

  private state = reactive({
    playState: "stop",
    musicInfo: {
      id: "",
      src: "",
    },
  });

  get playState() {
    return this.state.playState === "playing";
  }

  constructor() {
    this.initializer = new AudioInitializer();
    this.player = this.initializer.audioPlayer;
    this.registerEvent();
  }

  /**
   * 切换歌曲
   * @param info
   * @returns
   */
  switchMusic(info: MusicInfo) {
    // 资源一样，则不更新，视为播放和暂停
    if (info.workId === this.state.musicInfo.id && info.workPath === this.state.musicInfo.src) {
      this.state.playState === "playing" ? this.pauseMusic() : this.playMusic();
      return;
    }
    this.state.musicInfo.id = info.workId;
    this.state.musicInfo.src = info.workPath;
    // 更新音乐资源的地址
    this.initializer.updateSource(info.workPath);
    new Promise((resolve) => {
      setTimeout(() => {
        this.resetAudio();
        this.playMusic();
        resolve();
      }, 0);
    }) as Promise<void>;
  }

  async playMusic() {
    if (!this.player) {
      return;
    }
    try {
      await this.player.play();
      this.state.playState = "playing";
    } catch (exp) {
      console.log(exp);
      this.state.playState = "stop";
    }
  }

  pauseMusic() {
    // 播放器存在，资源存在，播放中
    if (!this.player || !this.state.musicInfo.src || this.player.paused) {
      return;
    }
    this.player.pause();
    this.state.playState = "paused";
  }

  /**
   * 初始化音乐播放器
   */
  initAudio() {
    if (!this.player) {
      return;
    }
    this.player.currentTime = 0;
    this.state.playState = "stop";
    // 停止播放音乐
    this.player.pause();
    this.state.musicInfo = {
      id: "",
      src: "",
    };
    this.initializer.updateSource("");
  }

  /**
   * 重置音乐播放器
   * @returns
   */
  resetAudio() {
    if (!this.player) {
      return;
    }
    this.player.currentTime = 0;
    this.player.load();
    this.state.playState = "stop";
  }

  /**
   * 注册事件，当页面关闭之前自动关闭页面上正在播放的音乐
   */
  registerEvent() {
    window.beforeDestroy = () => {
      const audioList = Array.from(document.querySelectorAll("audio"));
      audioList.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
        }
      });
    };
  }
}

export const player = new ChangbaMusicPlayer();
