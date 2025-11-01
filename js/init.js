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
const versionText = 'Version : HTMLdev0.0.1';


// 设置Canvas尺寸
canvas.width = DEFAULT_CANVAS_WIDTH;
canvas.height = DEFAULT_CANVAS_HEIGHT;

console.log("canvas:",canvas.width,"x",canvas.height);



// 全局变量
let images = []; // 存储图片对象的数组
let fadeInOpacity = 0; // 淡入透明度
let fadeOutOpacity = 1; // 淡出透明度
let globalTime = 0; // 全局时间计数器
let animationId = null; // 动画帧ID，用于取消动画

// 新增的
let startTime = 0;
let gameStatus = 'init';


// 音频上下文和标志变量
let audioContext = null;
let audioBuffer = null;
let isAudioUnlocked = false;


// 静音音频
// const silentAudioDataUrl = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABQTEFNRTMuMTAwBKkAAAAAAAAAADUgJAOHQQAB9AAACHDURcxqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
// const silentAudio = new Audio(silentAudioDataUrl);

// 页面加载完成后初始化资源
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing resources...');
    loadAudios();
    loadImages();
    initTouchEvents(); // 新增：初始化触摸事件
});

// 页面卸载前清理资源
window.addEventListener('beforeunload', () => {
    stopAnimation();
});