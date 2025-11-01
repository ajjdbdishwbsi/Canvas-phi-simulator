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
            audiosLoaded++;
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
            imagesLoaded++;
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
    if (imagesLoaded === imageSources.length && audiosLoaded === audioSources.length) {
        startButton.disabled = false;
        console.log('All resources loaded successfully');
    }
}

/**
 * 播放指定音频
 * @param {number} audioIndex - 音频索引
 */
function playAudio(audioIndex) {
    if (audios[audioIndex]) {
        audios[audioIndex].play().catch(error => {
            console.error('Audio play failed:', error);
        });
    }
}

/**
 * 暂停指定音频
 * @param {number} audioIndex - 音频索引
 */
function pauseAudio(audioIndex) {
    if (audios[audioIndex]) {
        audios[audioIndex].pause();
    }
}

/**
 * 设置音频音量
 * @param {number} audioIndex - 音频索引
 * @param {number} volume - 音量值 (0-1)
 */
function setVolume(audioIndex, volume) {
    if (audios[audioIndex]) {
        audios[audioIndex].volume = Math.max(0, Math.min(1, volume));
    }
}

/**
 * 停止并重置所有音频
 */
function stopAndResetAllAudios() {
    audios.forEach(audio => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    });
}

/**
 * 在Canvas上绘制图片，支持尺寸缩放、透明度调整和位置偏移
 * @param {HTMLImageElement} image - 要绘制的图片对象
 * @param {'Width' | 'Height'} sizeMode - 尺寸基准模式：'Width'基于画布宽度，'Height'基于画布高度
 * @param {number} size - 相对于基准尺寸的比例（0-1之间）
 * @param {number} [opacity=1.0] - 图片透明度，范围0-1，默认1.0（不透明）
 * @param {number} [dx_persent=0] - 水平偏移量，相对于画布宽度的比例（-1到1之间）
 * @param {number} [dy_persent=0] - 垂直偏移量，相对于画布高度的比例（-1到1之间）
 */
function drawImage(image, sizeMode, size, opacity=1.0, dx_persent=0, dy_persent=0) {
    const savedGlobalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = opacity;
    if (!image || !image.complete) return;
    
    let imgWidth, imgHeight, x, y;
    
    if (sizeMode === 'Width') {
        // 基于宽度缩放
        imgWidth = canvas.width * size;
        imgHeight = imgWidth * (image.height / image.width);
    } else if (sizeMode === 'Height') {
        // 基于高度缩放
        imgHeight = canvas.height * size;
        imgWidth = imgHeight * (image.width / image.height);
    } else {
        console.error('Invalid size mode. Use "Width" or "Height"');
        return;
    }
    
    // 计算居中位置
    x = (canvas.width - imgWidth) / 2;
    y = (canvas.height - imgHeight) / 2;
    
    // 清除画布并绘制图片
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, x+dx_persent*canvas.width, y+dy_persent*canvas.height, imgWidth, imgHeight);
    ctx.globalAlpha = savedGlobalAlpha;
}

/**
 * 图片淡入效果
 * @param {number} imageIndex - 图片索引
 * @param {string} sizeMode - 尺寸模式
 * @param {number} size - 尺寸比例
 * @param {number} duration - 动画持续时间(ms)
 */
function fadeInImage(imageIndex, sizeMode, size, duration) {
    const fadeStep = 1 / (duration / (1000 / 60)); // 计算每帧透明度增量
    
    fadeInOpacity = Math.min(fadeInOpacity + fadeStep, 1);
    ctx.globalAlpha = fadeInOpacity;
    
    drawImage(images[imageIndex], sizeMode, size);
    
    // 继续动画直到完全淡入
    if (fadeInOpacity < 1) {
        animationId = requestAnimationFrame(() => {
            fadeInImage(imageIndex, sizeMode, size, duration);
        });
    }
}

/**
 * 图片淡出效果
 * @param {number} imageIndex - 图片索引
 * @param {string} sizeMode - 尺寸模式
 * @param {number} size - 尺寸比例
 * @param {number} duration - 动画持续时间(ms)
 */
function fadeOutImage(imageIndex, sizeMode, size, duration) {
    const fadeStep = 1 / (duration / (1000 / 60)); // 计算每帧透明度减量
    
    fadeOutOpacity = Math.max(fadeOutOpacity - fadeStep, 0);
    ctx.globalAlpha = fadeOutOpacity;
    
    drawImage(images[imageIndex], sizeMode, size);
    
    // 继续动画直到完全淡出
    if (fadeOutOpacity > 0) {
        animationId = requestAnimationFrame(() => {
            fadeOutImage(imageIndex, sizeMode, size, duration);
        });
    }
}

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


/**
 * 重置动画状态
 */
function resetAnimationState() {
    fadeInOpacity = 0;
    fadeOutOpacity = 1;
    globalTime = 0;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT);
}




/**
 * 移动端音频解锁解决方案
 */
function unlockAudio() {
    if (isAudioUnlocked) return;
    // 逐个解锁
    for (let i = 0; i < audios.length; i++) {
        if (audios[i]) {
            try {
                audios[i].muted = false;
                audios[i].volume = 0.0; // 极小音量
                audios[i].play().then(() => {
                    // console.log(`音频 ${i} 已解锁`);
                    audios[i].pause();
                    audios[i].currentTime = 0;
                    audios[i].volume = 1;
                }).catch(error => {
                    console.warn(`音频 ${i} 播放失败:`, error);
                });
            } catch (error) {
                console.warn(`音频 ${i} 播放异常:`, error);
            }
        }
    };
    isAudioUnlocked = true;
};




