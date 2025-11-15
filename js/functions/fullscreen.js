

/**
 * 进入全屏模式
 */
function enterFullscreen() {
    const element = canvas;
    let supportFullscreen = 1;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else {
        console.warn('Fullscreen API is not supported in this browser');
        supportFullscreen = 0;
    }
    if (supportFullscreen === 1) {
        canvas.width = fullscreenWidth;
        canvas.height = fullscreenHeight;
    }
    console.log("[enterFullscreen] canvas:",canvas.width,"x",canvas.height);
}

/**
 * 退出全屏模式
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    canvas.width = DEFAULT_CANVAS_WIDTH;
    canvas.height = DEFAULT_CANVAS_HEIGHT;
    console.log("[exitFullscreen] canvas:",canvas.width,"x",canvas.height);
}

/**
 * 处理全屏状态变化
 */
function handleFullscreenChange() {
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;
    
    if (!isFullscreen) {
        canvas.width = DEFAULT_CANVAS_WIDTH;
        canvas.height = DEFAULT_CANVAS_HEIGHT;
        //console.log('Exited fullscreen, animation continues...');
        // 可以在这里添加其他UI更新逻辑，但不停止动画
        console.log('[handleFullscreenChange] 退出全屏');
        console.log("[handleFullscreenChange] canvas:",canvas.width,"x",canvas.height);
    } else {
        console.log('[handleFullscreenChange] 进入全屏');
    }
}
