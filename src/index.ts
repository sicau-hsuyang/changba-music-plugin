import { EventEmitter } from "events";
import { AudioInitializer } from "./audio";
export interface MusicInfo {
  workId: string;

  workPath: string;
}

const PlayState = {
  STOP: "stop",
  PAUSED: "pause",
  PLAYING: "playing",
};

class ChangbaMusicPlayer extends EventEmitter {
  private initializer: AudioInitializer;

  private player: HTMLAudioElement;

  state = {
    playState: PlayState.STOP,
    musicInfo: Object.seal({
      id: "",
      src: "",
    }),
  };

  get isPlaying() {
    return this.state.playState === PlayState.PLAYING;
  }

  stopPlayerEvent = false;

  constructor() {
    super();
    this.initializer = new AudioInitializer();
    this.player = this.initializer.audioPlayer;
    this.registerEvent();
    this.emit("init-player", {
      player: this.player,
    });
  }

  notifyCurrentPlaying() {
    // 对外暴露一个深克隆的数据
    const { id, src } = this.state.musicInfo;
    this.emit("music-change", {
      id,
      src,
    });
  }

  notifyPlayerStateChange() {
    if (this.stopPlayerEvent) {
      return;
    }
    this.emit("state-change", this.state.playState);
  }

  /**
   * 切换歌曲
   * @param info
   * @returns
   */
  switchMusic(info: MusicInfo) {
    // 资源一样，则不更新，视为播放和暂停
    if (info.workId === this.state.musicInfo.id && info.workPath === this.state.musicInfo.src) {
      if (this.state.playState === PlayState.PLAYING) {
        this.pauseMusic();
      } else {
        this.playMusic();
      }
      return;
    }
    // 否则视为切换音乐
    this.state.musicInfo.id = info.workId;
    this.state.musicInfo.src = info.workPath;
    this.stopPlayerEvent = true;
    // 更新音乐资源的地址
    this.initializer.updateSource(info.workPath);
    // 通知事件
    this.notifyCurrentPlaying();
    new Promise((resolve) => {
      setTimeout(() => {
        this.resetAudio();
        this.stopPlayerEvent = false;
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
      this.state.playState = PlayState.PLAYING;
    } catch (exp) {
      console.log(exp);
      this.state.playState = PlayState.STOP;
    }
    this.notifyPlayerStateChange();
  }

  pauseMusic() {
    // 播放器存在，资源存在，播放中
    if (!this.player || !this.state.musicInfo.src || this.player.paused) {
      return;
    }
    this.player.pause();
    this.state.playState = PlayState.PAUSED;
    this.notifyPlayerStateChange();
  }

  /**
   * 初始化音乐播放器，将音乐播放器初始化到空状态
   */
  initAudio() {
    if (!this.player) {
      return;
    }
    this.player.currentTime = 0;
    this.state.playState = PlayState.STOP;
    // 停止播放音乐
    this.player.pause();
    Object.assign(this.state.musicInfo, {
      id: "",
      src: "",
    });
    this.initializer.updateSource("");
    this.notifyPlayerStateChange();
  }

  /**
   * 重置音乐播放器，主要是将正在播放的歌曲的进度切换到0
   * @returns
   */
  resetAudio() {
    if (!this.player) {
      return;
    }
    this.player.currentTime = 0;
    this.player.load();
    this.state.playState = PlayState.STOP;
    this.notifyPlayerStateChange();
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
