import { EventEmitter } from "events";
import { AudioInitializer } from "./audio";
export interface MusicInfo {
  /**
   * 资源ID，唯一性标识
   */
  workId: string;
  /**
   * 资源地址
   */
  workPath: string;
  /**
   * 自动定位到的开始时间，单位是毫秒
   */
  startTime?: number;
  /**
   * 播放到截止时间，单位是毫秒
   */
  endTime?: number;
  /**
   * 是否循环播放
   */
  loop?: boolean;
}

const PlayState = {
  STOP: "stop",
  PAUSED: "pause",
  PLAYING: "playing",
};

class ChangbaMusicPlayer extends EventEmitter {
  private initializer: AudioInitializer;

  private player: HTMLAudioElement;

  private state = {
    playState: PlayState.STOP,
    musicInfo: Object.seal({
      id: "",
      src: "",
      startTime: -1,
      endTime: -1,
      loop: false,
    }),
  };

  /**
   * 校验进度的定时器
   */
  private checkTimer = -1;

  get isPlaying() {
    return this.state.playState === PlayState.PLAYING;
  }

  private stopPlayerEvent = false;

  constructor() {
    super();
    this.initializer = new AudioInitializer();
    this.player = this.initializer.audioPlayer;
    // 当音乐播放完成的时候，需要自动停止
    this.player.addEventListener("ended", () => {
      const { loop } = this.state.musicInfo;
      // 如果需要循环播放
      if (loop) {
        this.playMusic();
      } else {
        this.state.playState = PlayState.STOP;
        this.notifyPlayerStateChange();
      }
    });
    this.registerEvent();
    this.emit("init-player", {
      player: this.player,
    });
  }

  /**
   * 对外通知音乐上下文的改变
   */
  private notifyCurrentPlaying() {
    // 对外暴露一个深克隆的数据
    const { id, src } = this.state.musicInfo;
    this.emit("music-change", {
      id,
      src,
    });
  }

  /**
   * 对外通知播放状态的改变
   * @returns
   */
  private notifyPlayerStateChange() {
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
  public switchMusic(info: MusicInfo) {
    // 资源一样，则不更新，视为播放和暂停
    if (info.workId === this.state.musicInfo.id && info.workPath === this.state.musicInfo.src) {
      if (this.state.playState === PlayState.PLAYING) {
        this.pauseMusic();
      } else {
        this.playMusic();
      }
    } else {
      // 否则视为切换音乐
      const { workId, workPath, ...rest } = info;
      const setting = {
        ...{
          loop: false,
          startTime: -1,
          endTime: -1,
        },
        ...rest,
      };
      Object.assign(this.state.musicInfo, {
        ...setting,
        id: workId,
        src: workPath,
      });
      // 清除监听老的歌曲的定时器
      clearTimeout(this.checkTimer);
      this.stopPlayerEvent = true;
      // 更新音乐资源的地址，并自动定位到开始时间，若有的话
      this.initializer.updateSource({
        src: info.workPath,
        startTime: setting.startTime,
      });
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
  }

  /**
   * 播放music，如果正在播放则不进行任何处理
   * @returns
   */
  public async playMusic() {
    if (!this.player) {
      return;
    }
    try {
      await this.player.play();
      // 清除之前监听的音乐播放
      clearTimeout(this.checkTimer);
      this.checkMusicEndTime();
      this.state.playState = PlayState.PLAYING;
    } catch (exp) {
      console.log(exp);
      this.state.playState = PlayState.STOP;
    }
    this.notifyPlayerStateChange();
  }

  /**
   * 暂停音乐，如果已经暂停了，则不进行任何处理
   * @returns
   */
  public pauseMusic() {
    // 播放器存在，资源存在，播放中
    if (!this.player || !this.state.musicInfo.src || this.player.paused) {
      return;
    }
    this.player.pause();
    this.state.playState = PlayState.PAUSED;
    this.notifyPlayerStateChange();
  }

  /**
   * 监听音乐播放的结束时间
   */
  private checkMusicEndTime() {
    const { endTime } = this.state.musicInfo;
    if (endTime === -1) {
      return;
    }
    const t = endTime / 1000;
    if (this.player.currentTime >= t) {
      this.resetAudio();
    } else {
      clearTimeout(this.checkTimer);
      // 每100毫秒检查一次播放位置
      this.checkTimer = setTimeout(this.checkMusicEndTime.bind(this), 100);
    }
  }

  /**
   * 初始化音乐播放器，将音乐播放器初始化到空状态
   */
  public initAudio() {
    if (!this.player) {
      return;
    }
    const { startTime } = this.state.musicInfo;
    const t = startTime || 0;
    this.player.currentTime = t / 1000;
    this.state.playState = PlayState.STOP;
    // 停止播放音乐
    this.player.pause();
    Object.assign(this.state.musicInfo, {
      id: "",
      src: "",
    });
    this.initializer.updateSource({
      src: "",
      startTime: -1,
    });
    this.notifyPlayerStateChange();
  }

  /**
   * 重置音乐播放器，主要是将正在播放的歌曲的进度切换到指定的开始时间，不会导致音乐上下文的改变
   * @returns
   */
  public resetAudio() {
    if (!this.player) {
      return;
    }
    const { startTime, loop } = this.state.musicInfo;
    const t = startTime || 0;
    this.player.currentTime = t / 1000;
    if (!loop) {
      this.player.load();
      this.state.playState = PlayState.STOP;
      this.notifyPlayerStateChange();
    } else {
      this.checkMusicEndTime();
    }
  }

  /**
   * 注册事件，当页面关闭之前自动关闭页面上正在播放的音乐，这个事件是客户端加的，主要是为了防止二重奏
   */
  private registerEvent() {
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
