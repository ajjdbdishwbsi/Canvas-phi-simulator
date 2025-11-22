// 类
class ImageSpace {
    constructor(srcArray, name = 'unnamed') {
        this.src = srcArray || [];
        this.name = name;
        this.isLoaded = false;
        this.loadedNum = 0;
        this.files = []; // 调用时使用的数组
        this.errors = [];
        this.onLoadComplete = null; // 加载完成回调
    }
    
    load() {
        if (this.src.length === 0) {
            console.warn(`[ImageSpace ${this.name}] 没有源文件需要加载`);
            this.isLoaded = true;
            this._triggerLoadComplete();
            return;
        }
        
        this.src.forEach((src, index) => {
            this.files[index] = new Image();
            this.files[index].src = src;
        
            this.files[index].onload = () => {
                this.loadedNum++;
                console.log(`[ImageSpace ${this.name}] 加载图片: ${src} (${this.loadedNum}/${this.src.length})`);
                
                if (this.loadedNum === this.src.length) {
                    this.isLoaded = true;
                    console.log(`[ImageSpace ${this.name}] 所有图片加载完成`);
                    this._triggerLoadComplete();
                }
            };
        
            this.files[index].onerror = (e) => {
                console.error(`[ImageSpace ${this.name}] 加载失败: ${src}`, e);
                this.errors.push({ src, error: e });
                this.loadedNum++; // 仍然计数，避免阻塞其他资源
                
                if (this.loadedNum === this.src.length) {
                    this.isLoaded = true;
                    if (this.errors.length > 0) {
                        console.warn(`[ImageSpace ${this.name}] 加载完成，但有 ${this.errors.length} 个错误`);
                    }
                    this._triggerLoadComplete();
                }
            };
        });
    }
    
    // 触发加载完成回调
    _triggerLoadComplete() {
        if (typeof this.onLoadComplete === 'function') {
            this.onLoadComplete(this);
        }
    }
    
    getFile(index) {
        if (index < 0 || index >= this.files.length) {
            console.error(`[ImageSpace ${this.name}] 索引越界: ${index}`);
            return null;
        }
        return this.files[index];
    }
}

class AudioSpace {
    constructor(srcArray, name = 'unnamed') {
        this.src = srcArray || [];
        this.name = name;
        this.isLoaded = false;
        this.loadedNum = 0;
        this.files = [];
        this.unlocked = false;
        this.errors = [];
        this.onLoadComplete = null; // 加载完成回调
    }
    
    load() {
        if (this.src.length === 0) {
            console.warn(`[AudioSpace ${this.name}] 没有源文件需要加载`);
            this.isLoaded = true;
            this._triggerLoadComplete();
            return;
        }
        
        this.src.forEach((src, index) => {
            this.files[index] = new Audio();
            this.files[index].src = src;
            this.files[index].muted = true; // 初始静音
        
            this.files[index].addEventListener('loadeddata', () => {
                this.loadedNum++;
                console.log(`[AudioSpace ${this.name}] 加载音频: ${src} (${this.loadedNum}/${this.src.length})`);
                
                if (this.loadedNum === this.src.length) {
                    this.isLoaded = true;
                    console.log(`[AudioSpace ${this.name}] 所有音频加载完成`);
                    this._triggerLoadComplete();
                }
            });
        
            this.files[index].addEventListener('error', (e) => {
                console.error(`[AudioSpace ${this.name}] 加载失败: ${src}`, e);
                this.errors.push({ src, error: e });
                this.loadedNum++;
                
                if (this.loadedNum === this.src.length) {
                    this.isLoaded = true;
                    if (this.errors.length > 0) {
                        console.warn(`[AudioSpace ${this.name}] 加载完成，但有 ${this.errors.length} 个错误`);
                    }
                    this._triggerLoadComplete();
                }
            });
        });
    }
    
    // 触发加载完成回调
    _triggerLoadComplete() {
        if (typeof this.onLoadComplete === 'function') {
            this.onLoadComplete(this);
        }
    }
    
    unlock() {
        if (this.unlocked) return;
        
        this.files.forEach((audio, index) => {
            if (audio) {
                try {
                    audio.muted = false;
                    audio.volume = 0.0; // 无音量
                    audio.play().then(() => {
                        console.log(`[AudioSpace ${this.name}] 音频解锁: 索引 ${index}`);
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 1;
                    }).catch(error => {
                        console.warn(`[AudioSpace ${this.name}] 音频解锁失败: 索引 ${index}`, error);
                    });
                } catch (error) {
                    console.warn(`[AudioSpace ${this.name}] 音频解锁异常: 索引 ${index}`, error);
                }
            }
        });
        
        this.unlocked = true;
    }
    
    getFile(index) {
        if (index < 0 || index >= this.files.length) {
            console.error(`[AudioSpace ${this.name}] 索引越界: ${index}`);
            return null;
        }
        return this.files[index];
    }
}


const beginImages = new ImageSpace([
    'assets/PigeonGames.jpg',
    'assets/Warning.jpg', 
    'assets/MainStoryLegacyBlur.png',
    'assets/Phigros.png'
], 'beginImages');

const beginAudios = new AudioSpace([
    'audio-assets/TouchToStart.wav'
], 'beginAudios');

