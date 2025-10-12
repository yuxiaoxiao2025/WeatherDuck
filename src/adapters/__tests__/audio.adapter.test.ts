import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IAudioAdapter, AudioAdapterFactory, AudioOptions, AudioState, AudioFormat } from '../types';

describe('AudioAdapter', () => {
  let audioAdapter: IAudioAdapter;
  
  beforeEach(async () => {
    audioAdapter = await AudioAdapterFactory.create();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // 停止所有音频播放
    audioAdapter.stopAll();
  });

  describe('音频加载和播放', () => {
    it('应该能够加载音频文件', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      expect(audioId).toBeDefined();
      expect(typeof audioId).toBe('string');
    });

    it('应该能够加载不同格式的音频文件', async () => {
      const formats = [
        '/assets/sounds/thunder.mp3',
        '/assets/sounds/wind.wav',
        '/assets/sounds/birds.ogg'
      ];
      
      for (const format of formats) {
        const audioId = await audioAdapter.load(format);
        expect(audioId).toBeDefined();
      }
    });

    it('应该能够播放已加载的音频', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      await audioAdapter.play(audioId);
      
      const state = await audioAdapter.getState(audioId);
      expect(state).toBe('playing');
    });

    it('应该能够播放带选项的音频', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      const options: AudioOptions = {
        volume: 0.5,
        loop: true,
        fadeIn: 1000
      };
      
      await audioAdapter.play(audioId, options);
      
      const volume = await audioAdapter.getVolume(audioId);
      expect(volume).toBe(0.5);
    });

    it('应该能够从指定时间开始播放', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      const options: AudioOptions = {
        startTime: 10 // 从10秒开始播放
      };
      
      await audioAdapter.play(audioId, options);
      
      const currentTime = await audioAdapter.getCurrentTime(audioId);
      expect(currentTime).toBeGreaterThanOrEqual(10);
    });
  });

  describe('音频控制', () => {
    let audioId: string;
    
    beforeEach(async () => {
      audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      await audioAdapter.play(audioId);
    });

    it('应该能够暂停音频', async () => {
      await audioAdapter.pause(audioId);
      
      const state = await audioAdapter.getState(audioId);
      expect(state).toBe('paused');
    });

    it('应该能够恢复播放', async () => {
      await audioAdapter.pause(audioId);
      await audioAdapter.resume(audioId);
      
      const state = await audioAdapter.getState(audioId);
      expect(state).toBe('playing');
    });

    it('应该能够停止音频', async () => {
      await audioAdapter.stop(audioId);
      
      const state = await audioAdapter.getState(audioId);
      expect(state).toBe('stopped');
    });

    it('应该能够设置音量', async () => {
      await audioAdapter.setVolume(audioId, 0.3);
      
      const volume = await audioAdapter.getVolume(audioId);
      expect(volume).toBeCloseTo(0.3, 2);
    });

    it('应该能够静音和取消静音', async () => {
      await audioAdapter.mute(audioId);
      
      const isMuted = await audioAdapter.isMuted(audioId);
      expect(isMuted).toBe(true);
      
      await audioAdapter.unmute(audioId);
      
      const isUnmuted = await audioAdapter.isMuted(audioId);
      expect(isUnmuted).toBe(false);
    });

    it('应该能够设置播放位置', async () => {
      const targetTime = 5.5;
      await audioAdapter.setCurrentTime(audioId, targetTime);
      
      const currentTime = await audioAdapter.getCurrentTime(audioId);
      expect(currentTime).toBeCloseTo(targetTime, 1);
    });

    it('应该能够设置播放速度', async () => {
      await audioAdapter.setPlaybackRate(audioId, 1.5);
      
      const playbackRate = await audioAdapter.getPlaybackRate(audioId);
      expect(playbackRate).toBeCloseTo(1.5, 2);
    });
  });

  describe('音频信息获取', () => {
    let audioId: string;
    
    beforeEach(async () => {
      audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
    });

    it('应该能够获取音频时长', async () => {
      const duration = await audioAdapter.getDuration(audioId);
      expect(duration).toBeGreaterThan(0);
    });

    it('应该能够获取音频状态', async () => {
      let state = await audioAdapter.getState(audioId);
      expect(state).toBe('loaded');
      
      await audioAdapter.play(audioId);
      state = await audioAdapter.getState(audioId);
      expect(state).toBe('playing');
    });

    it('应该能够检查音频是否循环播放', async () => {
      await audioAdapter.play(audioId, { loop: true });
      
      const isLooping = await audioAdapter.isLooping(audioId);
      expect(isLooping).toBe(true);
    });

    it('应该能够获取音频元数据', async () => {
      const metadata = await audioAdapter.getMetadata(audioId);
      expect(metadata).toBeDefined();
      expect(metadata.format).toBeDefined();
      expect(metadata.sampleRate).toBeGreaterThan(0);
    });

    it('应该能够获取音频缓冲进度', async () => {
      const buffered = await audioAdapter.getBuffered(audioId);
      expect(Array.isArray(buffered)).toBe(true);
    });
  });

  describe('多音频管理', () => {
    it('应该能够同时播放多个音频', async () => {
      const audioId1 = await audioAdapter.load('/assets/sounds/rain.mp3');
      const audioId2 = await audioAdapter.load('/assets/sounds/wind.mp3');
      
      await audioAdapter.play(audioId1);
      await audioAdapter.play(audioId2);
      
      const state1 = await audioAdapter.getState(audioId1);
      const state2 = await audioAdapter.getState(audioId2);
      
      expect(state1).toBe('playing');
      expect(state2).toBe('playing');
    });

    it('应该能够获取所有活动音频', async () => {
      const audioId1 = await audioAdapter.load('/assets/sounds/rain.mp3');
      const audioId2 = await audioAdapter.load('/assets/sounds/wind.mp3');
      
      await audioAdapter.play(audioId1);
      await audioAdapter.play(audioId2);
      
      const activeAudios = await audioAdapter.getActiveAudios();
      expect(activeAudios).toContain(audioId1);
      expect(activeAudios).toContain(audioId2);
    });

    it('应该能够停止所有音频', async () => {
      const audioId1 = await audioAdapter.load('/assets/sounds/rain.mp3');
      const audioId2 = await audioAdapter.load('/assets/sounds/wind.mp3');
      
      await audioAdapter.play(audioId1);
      await audioAdapter.play(audioId2);
      
      await audioAdapter.stopAll();
      
      const activeAudios = await audioAdapter.getActiveAudios();
      expect(activeAudios).toHaveLength(0);
    });

    it('应该能够暂停所有音频', async () => {
      const audioId1 = await audioAdapter.load('/assets/sounds/rain.mp3');
      const audioId2 = await audioAdapter.load('/assets/sounds/wind.mp3');
      
      await audioAdapter.play(audioId1);
      await audioAdapter.play(audioId2);
      
      await audioAdapter.pauseAll();
      
      const state1 = await audioAdapter.getState(audioId1);
      const state2 = await audioAdapter.getState(audioId2);
      
      expect(state1).toBe('paused');
      expect(state2).toBe('paused');
    });

    it('应该能够恢复所有音频', async () => {
      const audioId1 = await audioAdapter.load('/assets/sounds/rain.mp3');
      const audioId2 = await audioAdapter.load('/assets/sounds/wind.mp3');
      
      await audioAdapter.play(audioId1);
      await audioAdapter.play(audioId2);
      await audioAdapter.pauseAll();
      
      await audioAdapter.resumeAll();
      
      const state1 = await audioAdapter.getState(audioId1);
      const state2 = await audioAdapter.getState(audioId2);
      
      expect(state1).toBe('playing');
      expect(state2).toBe('playing');
    });
  });

  describe('音频效果和处理', () => {
    let audioId: string;
    
    beforeEach(async () => {
      audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
    });

    it('应该能够应用淡入效果', async () => {
      const fadeInDuration = 2000;
      
      await audioAdapter.play(audioId, { fadeIn: fadeInDuration });
      
      // 检查音量是否从0开始逐渐增加
      const initialVolume = await audioAdapter.getVolume(audioId);
      expect(initialVolume).toBeLessThanOrEqual(0.1);
    });

    it('应该能够应用淡出效果', async () => {
      await audioAdapter.play(audioId);
      
      const fadeOutDuration = 1000;
      await audioAdapter.fadeOut(audioId, fadeOutDuration);
      
      // 等待淡出完成
      await new Promise(resolve => setTimeout(resolve, fadeOutDuration + 100));
      
      const state = await audioAdapter.getState(audioId);
      expect(state).toBe('stopped');
    });

    it('应该能够应用音频滤镜', async () => {
      await audioAdapter.play(audioId);
      
      // 应用低通滤镜
      await audioAdapter.applyFilter(audioId, {
        type: 'lowpass',
        frequency: 1000
      });
      
      const filters = await audioAdapter.getActiveFilters(audioId);
      expect(filters).toContain('lowpass');
    });

    it('应该能够移除音频滤镜', async () => {
      await audioAdapter.play(audioId);
      await audioAdapter.applyFilter(audioId, { type: 'lowpass', frequency: 1000 });
      
      await audioAdapter.removeFilter(audioId, 'lowpass');
      
      const filters = await audioAdapter.getActiveFilters(audioId);
      expect(filters).not.toContain('lowpass');
    });

    it('应该能够设置3D音频位置', async () => {
      await audioAdapter.play(audioId);
      
      const position = { x: 1, y: 0, z: -1 };
      await audioAdapter.setPosition(audioId, position);
      
      const currentPosition = await audioAdapter.getPosition(audioId);
      expect(currentPosition).toEqual(position);
    });
  });

  describe('音频事件处理', () => {
    let audioId: string;
    
    beforeEach(async () => {
      audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
    });

    it('应该能够监听播放开始事件', async () => {
      const playHandler = vi.fn();
      
      audioAdapter.on('play', playHandler);
      await audioAdapter.play(audioId);
      
      expect(playHandler).toHaveBeenCalledWith(audioId);
    });

    it('应该能够监听播放结束事件', async () => {
      const endHandler = vi.fn();
      
      audioAdapter.on('ended', endHandler);
      await audioAdapter.play(audioId);
      
      // 模拟播放结束
      await audioAdapter.stop(audioId);
      
      expect(endHandler).toHaveBeenCalledWith(audioId);
    });

    it('应该能够监听音量变化事件', async () => {
      const volumeChangeHandler = vi.fn();
      
      audioAdapter.on('volumechange', volumeChangeHandler);
      await audioAdapter.play(audioId);
      await audioAdapter.setVolume(audioId, 0.5);
      
      expect(volumeChangeHandler).toHaveBeenCalledWith(audioId, 0.5);
    });

    it('应该能够监听时间更新事件', async () => {
      const timeUpdateHandler = vi.fn();
      
      audioAdapter.on('timeupdate', timeUpdateHandler);
      await audioAdapter.play(audioId);
      
      // 等待时间更新事件触发
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(timeUpdateHandler).toHaveBeenCalled();
    });

    it('应该能够移除事件监听器', async () => {
      const playHandler = vi.fn();
      
      audioAdapter.on('play', playHandler);
      audioAdapter.off('play', playHandler);
      
      await audioAdapter.play(audioId);
      
      expect(playHandler).not.toHaveBeenCalled();
    });
  });

  describe('音频预加载和缓存', () => {
    it('应该能够预加载音频列表', async () => {
      const audioFiles = [
        '/assets/sounds/rain.mp3',
        '/assets/sounds/wind.mp3',
        '/assets/sounds/thunder.mp3'
      ];
      
      const audioIds = await audioAdapter.preload(audioFiles);
      
      expect(audioIds).toHaveLength(audioFiles.length);
      audioIds.forEach(id => expect(id).toBeDefined());
    });

    it('应该能够检查音频是否已缓存', async () => {
      const audioFile = '/assets/sounds/rain.mp3';
      
      let isCached = await audioAdapter.isCached(audioFile);
      expect(isCached).toBe(false);
      
      await audioAdapter.load(audioFile);
      
      isCached = await audioAdapter.isCached(audioFile);
      expect(isCached).toBe(true);
    });

    it('应该能够清理音频缓存', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      await audioAdapter.unload(audioId);
      
      const isCached = await audioAdapter.isCached('/assets/sounds/rain.mp3');
      expect(isCached).toBe(false);
    });

    it('应该能够获取缓存大小', async () => {
      await audioAdapter.load('/assets/sounds/rain.mp3');
      await audioAdapter.load('/assets/sounds/wind.mp3');
      
      const cacheSize = await audioAdapter.getCacheSize();
      expect(cacheSize).toBeGreaterThan(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的音频文件', async () => {
      await expect(audioAdapter.load('/invalid/path/audio.mp3')).rejects.toThrow();
    });

    it('应该处理不支持的音频格式', async () => {
      await expect(audioAdapter.load('/assets/sounds/unsupported.xyz')).rejects.toThrow();
    });

    it('应该处理无效的音频ID操作', async () => {
      await expect(audioAdapter.play('invalid-id')).rejects.toThrow();
      await expect(audioAdapter.pause('invalid-id')).rejects.toThrow();
      await expect(audioAdapter.stop('invalid-id')).rejects.toThrow();
    });

    it('应该处理无效的音量值', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      await expect(audioAdapter.setVolume(audioId, -1)).rejects.toThrow();
      await expect(audioAdapter.setVolume(audioId, 2)).rejects.toThrow();
    });

    it('应该处理无效的播放位置', async () => {
      const audioId = await audioAdapter.load('/assets/sounds/rain.mp3');
      
      await expect(audioAdapter.setCurrentTime(audioId, -1)).rejects.toThrow();
    });

    it('应该处理音频上下文错误', async () => {
      // 模拟音频上下文创建失败
      const originalAudioContext = global.AudioContext;
      global.AudioContext = undefined as any;
      
      try {
        await expect(AudioAdapterFactory.create()).rejects.toThrow();
      } finally {
        global.AudioContext = originalAudioContext;
      }
    });
  });

  describe('平台特定功能', () => {
    it('应该提供平台信息', () => {
      expect(audioAdapter.platform).toBeDefined();
      expect(['desktop', 'web']).toContain(audioAdapter.platform);
    });

    it('应该提供支持的音频格式', () => {
      const supportedFormats = audioAdapter.getSupportedFormats();
      expect(Array.isArray(supportedFormats)).toBe(true);
      expect(supportedFormats.length).toBeGreaterThan(0);
    });

    it('应该提供音频能力信息', () => {
      const capabilities = audioAdapter.getCapabilities();
      expect(capabilities).toBeDefined();
      expect(capabilities.maxConcurrentAudios).toBeGreaterThan(0);
      expect(typeof capabilities.supports3D).toBe('boolean');
      expect(typeof capabilities.supportsFilters).toBe('boolean');
    });
  });
});

// Web Audio API 特定测试
describe('WebAudioAdapter', () => {
  let adapter: IAudioAdapter;
  
  beforeEach(async () => {
    // 模拟Web Audio API环境
    const mockAudioContext = {
      createBufferSource: vi.fn(),
      createGain: vi.fn(),
      createAnalyser: vi.fn(),
      createBiquadFilter: vi.fn(),
      decodeAudioData: vi.fn(),
      destination: {},
      state: 'running',
      resume: vi.fn(),
      suspend: vi.fn(),
      close: vi.fn()
    };
    
    vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));
    vi.stubGlobal('webkitAudioContext', vi.fn(() => mockAudioContext));
    
    adapter = await AudioAdapterFactory.create();
  });

  it('应该使用Web Audio API', () => {
    expect(adapter.platform).toBe('web');
  });

  it('应该支持音频分析', async () => {
    const audioId = await adapter.load('/assets/sounds/rain.mp3');
    await adapter.play(audioId);
    
    const analyser = await adapter.getAnalyser(audioId);
    expect(analyser).toBeDefined();
    
    const frequencyData = await adapter.getFrequencyData(audioId);
    expect(frequencyData).toBeInstanceOf(Uint8Array);
  });

  it('应该支持音频可视化', async () => {
    const audioId = await adapter.load('/assets/sounds/rain.mp3');
    await adapter.play(audioId);
    
    const waveformData = await adapter.getWaveformData(audioId);
    expect(waveformData).toBeInstanceOf(Float32Array);
  });
});

// 桌面版特定测试
describe('DesktopAudioAdapter', () => {
  let adapter: IAudioAdapter;
  
  beforeEach(async () => {
    // 模拟桌面环境
    vi.stubGlobal('process', { platform: 'win32' });
    vi.stubGlobal('window', undefined);
    
    adapter = await AudioAdapterFactory.create();
  });

  it('应该使用桌面音频系统', () => {
    expect(adapter.platform).toBe('desktop');
  });

  it('应该支持系统音量控制', async () => {
    const systemVolume = await adapter.getSystemVolume();
    expect(typeof systemVolume).toBe('number');
    expect(systemVolume).toBeGreaterThanOrEqual(0);
    expect(systemVolume).toBeLessThanOrEqual(1);
  });

  it('应该支持音频设备枚举', async () => {
    const devices = await adapter.getAudioDevices();
    expect(Array.isArray(devices)).toBe(true);
  });
});