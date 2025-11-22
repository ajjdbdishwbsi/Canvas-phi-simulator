// 获取Canvas和按钮元素
const canvas = document.getElementById('Screen');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const fullscreenButton = document.getElementById('fullscreenButton');

// 初始化按钮状态
startButton.disabled = true;

// 获取用户全屏横屏分辨率（包括任务栏等系统界面）
let fullscreenWidth = (window.screen.width * window.devicePixelRatio);
let fullscreenHeight = (window.screen.height * window.devicePixelRatio);

if (fullscreenWidth < fullscreenHeight) {
    [fullscreenWidth, fullscreenHeight] = [fullscreenHeight, fullscreenWidth];
}

console.log(`全屏分辨率: ${fullscreenWidth} x ${fullscreenHeight}`);

// 常量定义
const DEFAULT_CANVAS_WIDTH = 1920;
const DEFAULT_CANVAS_HEIGHT = 1080;
const PhigrosDegree = Math.PI / 180 * 75;
const versionText = 'Version : HTMLdev0.0.1';


// 设置Canvas尺寸
canvas.width = DEFAULT_CANVAS_WIDTH;
canvas.height = DEFAULT_CANVAS_HEIGHT;

console.log("canvas:",canvas.width,"x",canvas.height);



// 全局变量
// FPS显示
let showFPS = true;
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
const fpsUpdateInterval = 500; // 每500ms更新一次FPS显示


// 页面加载完成后初始化资源
document.addEventListener('DOMContentLoaded', () => {
    console.log('开始初始化资源...');
    
    // 设置加载完成回调
    beginImages.onLoadComplete = function() {
        console.log('图片资源加载完成');
        checkAllResourcesLoaded();
    };
    beginAudios.onLoadComplete = function() {
        console.log('音频资源加载完成');
        checkAllResourcesLoaded();
    };
    
    beginAudios.load();
    beginImages.load();
    initTouchEvents(); // 初始化触摸事件
});

// 检查加载状态
function checkAllResourcesLoaded() {
    if (beginImages.isLoaded && beginAudios.isLoaded) {
        startButton.disabled = false;
        console.log('所有资源加载完成');
    }
}

// 页面卸载前清理资源
window.addEventListener('beforeunload', () => {
    // 这里没有代码QwQ
});





// 静音音频
// const silentAudioDataUrl = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABQTEFNRTMuMTAwBKkAAAAAAAAAADUgJAOHQQAB9AAACHDURcxqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
// const silentAudio = new Audio(silentAudioDataUrl);
