// 音频配置
const audioSources = [
    'audio-assets/TouchToStart.wav', //0
];
let audios = []; // 存储音频对象的数组
let audiosLoadedNum = 0; // 已加载的音频数量

// 图片资源配置
const imageSources = [
    'assets/PigeonGames.jpg', //0
    'assets/Warning.jpg', //1
    'assets/MainStoryLegacyBlur.png', //2
    'assets/Phigros.png', //3
    //'assets/StarDustRay.png'//4
];
let images = []; // 存储图片对象的数组
let imagesLoadedNum = 0; // 已加载的图片数量

/**
 * 加载音频资源
 */
function loadAudios() {
    audioSources.forEach((src, index) => {
        audios[index] = new Audio();
        audios[index].src = src;
        // 初始设置为静音，避免自动播放策略限制
        audios[index].muted = true;
        
        audios[index].addEventListener('canplaythrough', () => {
            audiosLoadedNum++;
            checkAllResourcesLoaded();
        });
        
        audios[index].addEventListener('error', (e) => {
            console.error(`Failed to load audio: ${src}`, e);
        });
    });
}

/**
 * 加载图片资源
 */
function loadImages() {
    imageSources.forEach((src, index) => {
        images[index] = new Image();
        images[index].src = src;
        
        images[index].onload = () => {
            imagesLoadedNum++;
            checkAllResourcesLoaded();
        };
        
        images[index].onerror = (e) => {
            console.error(`Failed to load image: ${src}`, e);
        };
    });
}


/**
 * 检查所有资源是否加载完成
 */
function checkAllResourcesLoaded() {
    if (imagesLoadedNum === imageSources.length && audiosLoadedNum === audioSources.length) {
        startButton.disabled = false;
        console.log('All resources loaded successfully');
    }
}
