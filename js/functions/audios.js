
/**
 * 播放指定音频
 * @param {number} audio - 音频
 */
function playAudio(audio) {
    if (audio) {
        audio.play().catch(error => {
            console.error('Audio play failed:', error);
        });
    }
}

/**
 * 暂停指定音频
 * @param {number} audio - 音频
 */
function pauseAudio(audio) {
    if (audio) {
        audio.pause();
    }
}

/**
 * 设置音频音量
 * @param {number} audio - 音频
 * @param {number} volume - 音量值 (0-1)
 */
function setVolume(audio, volume) {
    if (audio) {
        audio.volume = Math.max(0, Math.min(1, volume));
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
 * 移动端音频解锁解决方案
 */
function unlockAudio(audioList) {
    // if (isAudioUnlocked) return;
    // 逐个解锁
    for (let i = 0; i < audioList.length; i++) {
        if (audioList[i]) {
            try {
                audioList[i].muted = false;
                audioList[i].volume = 0.0; // 极小音量
                audioList[i].play().then(() => {
                    // console.log(`音频 ${i} 已解锁`);
                    audioList[i].pause();
                    audioList[i].currentTime = 0;
                    audioList[i].volume = 1;
                }).catch(error => {
                    console.warn(`音频 ${i} 播放失败:`, error);
                });
            } catch (error) {
                console.warn(`音频 ${i} 播放异常:`, error);
            }
        }
    };
    // isAudioUnlocked = true;
};



