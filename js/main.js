
const GAME_STATES = {
    INIT: 'init',
    FADEIN_PIGEON: 'fadein_pigeon',
    FADEOUT_PIGEON: 'fadeout_pigeon', 
    FADEIN_WARN: 'fadein_warn',
    FADEOUT_WARN: 'fadeout_warn',
    START_SCREEN: 'start_screen',
    SWICH_TO_MAIN_MENU:'swich_to_main_menu',
    MAIN_MENU: 'main_menu'
};

function gameLoop() {
    updateGame(); // 游戏逻辑更新
    renderGame(); // 渲染
    requestAnimationFrame(gameLoop);
}

let temp = 0;//通用临时变量，石山的开始
let drawOpacity = 0;
let logoOpacity = 0;
let bgOpacity = 0;
let lastTouchesNum = 0;


function updateGame() {
    updateTouchStates();

    const currentTime = performance.now();
    const elapsed = currentTime - startTime;

    switch (gameStatus) {
        case GAME_STATES.INIT:
            if (elapsed > 500) { // 开始前等待500ms
                startTime = currentTime;
                gameStatus = GAME_STATES.FADEIN_PIGEON;
            }
            break;
            
        case GAME_STATES.FADEIN_PIGEON:
            drawOpacity = Math.min(elapsed / 1000, 1); // 1秒淡入
            if (elapsed > 2500) { // 显示2.5秒
                startTime = currentTime;
                gameStatus = GAME_STATES.FADEOUT_PIGEON;
            }
            if (touches.length > 0 && elapsed > 750) {gameStatus = GAME_STATES.START_SCREEN; startTime = currentTime;}
            break;
            
        case GAME_STATES.FADEOUT_PIGEON:
            drawOpacity = Math.max(1 - elapsed / 1000, 0); // 1秒淡出
            if (elapsed > 1000) {
                startTime = currentTime;
                gameStatus = GAME_STATES.FADEIN_WARN;
            }
            if (touches.length > 0) {gameStatus = GAME_STATES.START_SCREEN; startTime = currentTime;}
            break;
            
        case GAME_STATES.FADEIN_WARN:
            drawOpacity = Math.min(elapsed / 1000, 1); // 1秒淡入
            if (elapsed > 2500) { // 显示2.5秒
                startTime = currentTime;
                gameStatus = GAME_STATES.FADEOUT_WARN;
            }
            if (touches.length > 0) {gameStatus = GAME_STATES.START_SCREEN; startTime = currentTime;}
            break;
            
        case GAME_STATES.FADEOUT_WARN:
            drawOpacity = Math.max(1 - elapsed / 1000, 0); // 1秒淡出
            if (elapsed > 1000) {
                gameStatus = GAME_STATES.START_SCREEN;
                startTime = currentTime;
            }
            if (touches.length > 0) {gameStatus = GAME_STATES.START_SCREEN; startTime = currentTime;}
            break;
            
        case GAME_STATES.START_SCREEN:
            if (temp === 0) {
                loadchapterImages();
                temp = -1; //这里表示是否执行过loadchapterImages();函数
            }
            logoOpacity = Math.min(elapsed / 1000 ,1);
            bgOpacity = Math.min(Math.max(elapsed-500,0) / (2000/0.5) ,0.5); // 0.2秒后2秒淡入,最大0.5不透明度
            if (audios[0].paused || audios[0].ended || audios[0].currentTime > audios[0].duration-0.2){
                audios[0].currentTime = 0;
                playAudio(0);
            }
            if (elapsed > 1250) {
                if (touches.length > lastTouchesNum && lastTouchesNum === 0 && chapterImgLoaded) {
                    gameStatus = GAME_STATES.SWICH_TO_MAIN_MENU;
                    startTime = currentTime;
                }
                lastTouchesNum = touches.length;
            } else {lastTouchesNum = touches.length;}
            break;

        case GAME_STATES.SWICH_TO_MAIN_MENU:
            setVolume(0,Math.max(1-elapsed/800, 0));
            logoOpacity = Math.max(1-elapsed/600, 0); // 0.6秒淡出
            temp = Math.max(bgOpacity,temp); // 这里temp指背景开始淡出时的不透明度
            bgOpacity = Math.max((1-elapsed/600)*temp, 0),bgOpacity; // 0.6秒淡出
            if (elapsed > 800) {
                gameStatus = GAME_STATES.MAIN_MENU;
                startTime = currentTime;
            }
            break;

        case GAME_STATES.MAIN_MENU:
            
            break;

    }
}

function renderGame() {
    //const currentTime = performance.now();
    //const elapsed = currentTime - startTime;
    // ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (gameStatus) {
        case GAME_STATES.FADEIN_PIGEON:
        case GAME_STATES.FADEOUT_PIGEON:
            drawImage(images[0], 'Height', size=0.181, opacity=drawOpacity);
            break;

        case GAME_STATES.FADEIN_WARN:
        case GAME_STATES.FADEOUT_WARN:
            drawImage(images[1], 'Height', size=0.59, opacity=drawOpacity, dx_persent=0, dy_persent=-0.05);
            break;

        case GAME_STATES.START_SCREEN:
        case GAME_STATES.SWICH_TO_MAIN_MENU:
            drawImage(images[2], 'Height', size=1, opacity=bgOpacity);
            drawImage(images[3], 'Height', size=0.168, opacity=logoOpacity, dx_persent=0, dy_persent=-0.04);

            // 绘制文字 - 点击屏幕开始 和 版本号
            ctx.save();
            ctx.globalAlpha = logoOpacity; // 使用与logo相同的透明度
            // 根据canvas大小计算字体大小
            const fontSize = Math.max(canvas.width * 0.0170, 24); // 相对宽度1.7%，最小24px
            ctx.font = `normal ${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // 文字位置：在logo下方，相对canvas高度定位
            const textY = canvas.height * 0.5 + canvas.height * 0.178; // 屏幕中心偏下17.8%
            ctx.fillText('点  击  屏  幕  开  始', canvas.width * 0.5, textY);
            // 根据canvas大小计算字体大小
            const verFontSize = Math.max(canvas.width * 0.012, 12); // 最小12px
            ctx.font = `normal ${verFontSize}px 'PhigrosFont', Arial, sans-serif`;
            ctx.fillStyle = `rgba(192, 192, 192, ${logoOpacity*0.6})`; // 淡灰色
            ctx.textAlign = 'right'; // 右对齐
            ctx.textBaseline = 'bottom'; // 底部对齐
            ctx.fillText(versionText, canvas.width*0.997, canvas.height*0.995); // 右下角绘制，不留边距
            ctx.restore();
            break;

        case GAME_STATES.MAIN_MENU:
            renderMainMenu(drawOpacity);
            break;

        default:
            // 其他状态不绘制内容
            break;
    }

    // ctx.restore();
    if (touchDebug) {drawTouchPoints();} // 触摸调试
}

function startgame() {
    console.log('StartGame');
    startTime = performance.now();
    unlockAudio();
    resetAnimationState();
    enterFullscreen();
    stopAndResetAllAudios();
    gameLoop();
    startButton.disabled = true;
}

// 绑定开始按钮点击事件
startButton.addEventListener('click', startgame);
fullscreenButton.addEventListener('click', enterFullscreen);

// 全屏变化事件监听
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);
