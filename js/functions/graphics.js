
/**
 * 在Canvas上绘制图片，支持尺寸缩放、透明度调整、位置偏移和模糊效果
 * @param {HTMLImageElement} image - 要绘制的图片对象
 * @param {'Width' | 'Height'} sizeMode - 尺寸基准模式：'Width'占满画布宽度，'Height'占满画布高度
 * @param {number} size - 相对于基准尺寸的比例（0-1之间）
 * @param {number} [opacity=1.0] - 图片透明度，范围0-1，默认1.0（不透明）
 * @param {number} [dx_persent=0] - 水平偏移量，相对于画布宽度的比例（-1到1之间）
 * @param {number} [dy_persent=0] - 垂直偏移量，相对于画布高度的比例（-1到1之间）
 * @param {number} [blurAmount=0] - 模糊程度，单位像素，默认0（不模糊）
 */
function drawImage(image, sizeMode, size, opacity = 1.0, dx_persent = 0, dy_persent = 0, blurAmount = 0) {
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
    
    // 应用偏移
    x += dx_persent * canvas.width;
    y += dy_persent * canvas.height;
    
    // 如果有模糊效果，使用临时canvas
    if (blurAmount > 0) {
        // 创建临时canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidth;
        tempCanvas.height = imgHeight;
        
        // 应用模糊效果
        tempCtx.filter = `blur(${blurAmount}px)`;
        tempCtx.drawImage(image, 0, 0, imgWidth, imgHeight);
        
        // 绘制到主canvas
        ctx.drawImage(tempCanvas, x, y, imgWidth, imgHeight);
    } else {
        // 直接绘制（无模糊）
        ctx.drawImage(image, x, y, imgWidth, imgHeight);
    }
    
    ctx.globalAlpha = savedGlobalAlpha;
}


// 预渲染缓存对象
const clipImageCache = new Map();

/**
 * 以Phigros平行四边形的形式绘制图片，支持模糊效果和图片裁剪（带缓存优化）
 * @param {HTMLImageElement} img - 要绘制的图片对象
 * @param {number} opacity - 透明度
 * @param {number} sx - 裁剪图片开始的x坐标
 * @param {number} sy - 裁剪图片开始的y坐标
 * @param {number} sWidth - 裁剪部分宽度
 * @param {number} sHeight - 裁剪部分高度
 * @param {number} x - 绘制位置的x坐标
 * @param {number} y - 绘制位置的y坐标
 * @param {number} width - 绘制宽度
 * @param {number} height - 绘制高度
 * @param {string} [mode='fit'] - 绘制模式:'fit-width'|'fit-height'适应,'stretch'拉伸
 * @param {number} [blurAmount=0] - 模糊程度，单位像素，默认0（不模糊）
 * @param {number} [degree=PhigrosDegree] - 平行四边形角度，默认使用PhigrosDegree
 */
function drawClippedImage(img, opacity = 1.0, sx, sy, sWidth, sHeight, x, y, width, height, mode = 'fit', blurAmount = 0, degree = PhigrosDegree) {
    // 生成缓存键
    const cacheKey = generateCacheKey(img, sx, sy, sWidth, sHeight, width, height, mode, blurAmount, degree);
    
    let cachedCanvas;
    
    // 检查缓存
    if (clipImageCache.has(cacheKey)) {
        cachedCanvas = clipImageCache.get(cacheKey);
    } else {
        // 创建临时canvas进行预渲染
        cachedCanvas = document.createElement('canvas');
        const tempCtx = cachedCanvas.getContext('2d');
        cachedCanvas.width = width;
        cachedCanvas.height = height;
        
        // 应用模糊效果
        if (blurAmount > 0) {
            tempCtx.filter = `blur(${blurAmount}px)`;
        }
        
        // 在临时canvas上绘制裁剪后的图片
        if (mode === 'stretch') {
            // 直接拉伸到目标尺寸
            tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        } else if (mode === 'fit-width') {
            // 占满画布宽度，高度按比例缩放，裁剪上下部分显示中间
            const scale = width / sWidth;
            const scaledHeight = sHeight * scale;
            
            if (scaledHeight >= height) {
                // 如果缩放后高度大于等于目标高度，直接居中绘制
                const offsetY = (height - scaledHeight) / 2;
                tempCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, offsetY, width, scaledHeight);
            } else {
                // 如果缩放后高度小于目标高度，需要裁剪源图片的中间部分
                const targetHeight = height / scale;
                const cropY = sy + (sHeight - targetHeight) / 2;
                tempCtx.drawImage(img, sx, cropY, sWidth, targetHeight, 0, 0, width, height);
            }
        } else if (mode === 'fit-height') {
            // 占满画布高度，宽度按比例缩放，裁剪左右部分显示中间
            const scale = height / sHeight;
            const scaledWidth = sWidth * scale;
            
            if (scaledWidth >= width) {
                // 如果缩放后宽度大于等于目标宽度，直接居中绘制
                const offsetX = (width - scaledWidth) / 2;
                tempCtx.drawImage(img, sx, sy, sWidth, sHeight, offsetX, 0, scaledWidth, height);
            } else {
                // 如果缩放后宽度小于目标宽度，需要裁剪源图片的中间部分
                const targetWidth = width / scale;
                const cropX = sx + (sWidth - targetWidth) / 2;
                tempCtx.drawImage(img, cropX, sy, targetWidth, sHeight, 0, 0, width, height);
            }
        } else {
            // 默认fit模式：适应目标区域，保持宽高比，居中显示
            const scaleX = width / sWidth;
            const scaleY = height / sHeight;
            const scale = Math.min(scaleX, scaleY);
            const scaledWidth = sWidth * scale;
            const scaledHeight = sHeight * scale;
            const offsetX = (width - scaledWidth) / 2;
            const offsetY = (height - scaledHeight) / 2;
            tempCtx.drawImage(img, sx, sy, sWidth, sHeight, offsetX, offsetY, scaledWidth, scaledHeight);
        }
        
        // 重置filter，避免影响后续操作
        tempCtx.filter = 'none';
        
        // 在临时canvas上创建裁剪路径
        tempCtx.globalCompositeOperation = 'destination-out';
        
        // 左上角三角形
        tempCtx.beginPath();
        tempCtx.moveTo(0, 0);
        tempCtx.lineTo(height/Math.tan(degree), 0);
        tempCtx.lineTo(0, height);
        tempCtx.closePath();
        tempCtx.fill();
        
        // 右下角三角形
        tempCtx.beginPath();
        tempCtx.moveTo(width, height);
        tempCtx.lineTo(width - height/Math.tan(degree), height);
        tempCtx.lineTo(width, 0);
        tempCtx.closePath();
        tempCtx.fill();
        
        // 将处理好的canvas存入缓存
        clipImageCache.set(cacheKey, cachedCanvas);
        
        //console.log(`[drawClippedImage] 创建新缓存: ${cacheKey}`);
    }
    
    // 将缓存的canvas绘制到主canvas上
    const savedGlobalAlpha = ctx.globalAlpha;
    ctx.globalAlpha = opacity;
    ctx.drawImage(cachedCanvas, x, y);
    ctx.globalAlpha = savedGlobalAlpha;
}

/**
 * 生成缓存键
 */
function generateCacheKey(img, opacity, sx, sy, sWidth, sHeight, width, height, mode, blurAmount, degree) {
    return `${img.src || 'unknown'}_${opacity}_${sx}_${sy}_${sWidth}_${sHeight}_${width}_${height}_${mode}_${blurAmount}_${degree}`;
}

/**
 * 清除drawClippedImage的缓存
 * @param {string} [pattern] - 可选，清除匹配特定模式的缓存键
 */
function clearClipImageCache(pattern = null) {
    if (pattern) {
        // 清除匹配模式的缓存
        for (const key of clipImageCache.keys()) {
            if (key.includes(pattern)) {
                clipImageCache.delete(key);
                console.log(`[clearClipImageCache] 清除缓存: ${key}`);
            }
        }
    } else {
        // 清除所有缓存
        const cacheSize = clipImageCache.size;
        clipImageCache.clear();
        console.log(`[clearClipImageCache] 清除所有缓存，共 ${cacheSize} 项`);
    }
}

/**
 * 获取缓存统计信息
 */
function getClipImageCacheStats() {
    return {
        size: clipImageCache.size,
        keys: Array.from(clipImageCache.keys())
    };
}
// 使用示例：
// drawClippedImage(images[4],0,0,images[4].width,images[4].height,171,155,800,450,10);


/**
 * 渲染倾斜的文字
 * @param {string} text - 要渲染的文字
 * @param {number} x - 文字位置的x坐标
 * @param {number} y - 文字位置的y坐标
 * @param {number} dx - 倾斜后进行文字x位置偏移
 * @param {number} dy - 倾斜后进行文字y位置偏移
 * @param {string} [font='Arial, sans-serif'] - 字体样式
 * @param {number} [size=16] - 字体大小（像素）
 * @param {string} [color='#ffffff'] - 文字颜色
 * @param {number} [opacity=1.0] - 透明度
 * @param {number} [degree=PhigrosDegree] - 倾斜角度，默认使用PhigrosDegree
 * @param {string} [textAlign='left'] - 文字对齐方式
 * @param {string} [textBaseline='alphabetic'] - 文字基线
 */
function drawTiltedText(text, x, y, dx, dy, font = 'Arial, sans-serif', size = 16, color = '#ffffff', opacity = 1.0, degree = PhigrosDegree, textAlign = 'left', textBaseline = 'alphabetic') {
    ctx.save();
    
    // 设置透明度
    ctx.globalAlpha = opacity;
    
    // 移动到指定位置并旋转
    ctx.translate(x, y);
    ctx.rotate(-degree);
    
    // 设置文字样式
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    
    // 绘制文字
    ctx.fillText(text, dx, dy);
    
    ctx.restore();
}

/**
 * 更新FPS计算
 */
function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    
    // 每500ms更新一次FPS显示
    if (currentTime - lastFpsUpdate >= fpsUpdateInterval) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = currentTime;
    }
}
