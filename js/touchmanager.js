// 在 init.js 的全局变量部分添加：
let touches = []; // 存储当前所有触摸点
let maxTouches = 20; // 最大支持的触摸点数

// 触摸点类
class TouchPoint {
    constructor(identifier, x, y) {
        this.identifier = identifier;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.lastX = x;
        this.lastY = y;
        this.startTime = Date.now();
        this.lastUpdateTime = performance.now();
        this.isActive = true;
        this.positionHistory = []; // 存储位置历史记录
        this.isSliding = false;  // 滑动状态
        this.velocity = 0;       // 移动速度
    }
    
    update(x, y) {
        const currentTime = performance.now();
        // 更新历史位置
        this.positionHistory.push({
            x: this.x,
            y: this.y,
            time: currentTime
        });
        
        // 移除15ms之前的记录
        this.positionHistory = this.positionHistory.filter(record => 
            currentTime - record.time <= 55
        );
        
        // 设置lastX和lastY为10ms前的位置
        const tenMsAgo = currentTime - 50;
        const historicalRecord = this.positionHistory.find(record => 
            record.time >= tenMsAgo
        );
        
        if (historicalRecord) {
            this.lastX = historicalRecord.x;
            this.lastY = historicalRecord.y;
        }
        const deltaTime = currentTime - historicalRecord.time;
        
        // 计算移动距离和速度
        const deltaX = x - historicalRecord.x;
        const deltaY = y - historicalRecord.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (deltaTime > 0) {
            this.velocity = ((distance/canvas.height)*DEFAULT_CANVAS_HEIGHT) / deltaTime; // 像素/毫秒
            
            // 判断是否在滑动（速度阈值，可根据需要调整）
            const slideThreshold = 0.6; // 像素/毫秒
            this.isSliding = this.velocity > slideThreshold;
        }
        
        // 更新位置和时间
        this.x = x;
        this.y = y;
        this.lastUpdateTime = currentTime;
    }
}


/**
 * 初始化触摸事件监听
 */
function initTouchEvents() {
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    console.log('Touch events initialized.');
}

/**
 * 处理触摸开始事件
 */
function handleTouchStart(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        // 检查是否已存在该触摸点
        const existingTouch = touches.find(t => t.identifier === touch.identifier);
        if (!existingTouch && touches.length < maxTouches) {
            touches.push(new TouchPoint(touch.identifier, x, y));
            console.log(`Touch started: ID ${touch.identifier} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        }
    }
    
    // 在开始屏幕状态下处理点击开始
    //if (gameStatus === GAME_STATES.START_SCREEN && touches.length > 0) {
    //    handleStartScreenTouch();
    //}
    
    updateDebugDisplay();
}

/**
 * 处理触摸移动事件
 */
function handleTouchMove(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;
        
        // 更新现有触摸点位置
        const existingTouch = touches.find(t => t.identifier === touch.identifier);
        if (existingTouch) {
            existingTouch.update(x, y);
        }
    }
    
    updateDebugDisplay();
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd(event) {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        const index = touches.findIndex(t => t.identifier === touch.identifier);
        if (index !== -1) {
            console.log(`Touch ended: ID ${touch.identifier}`);
            touches.splice(index, 1);
        }
    }
    
    updateDebugDisplay();
}

/**
 * 处理开始屏幕的触摸事件
 */
//function handleStartScreenTouch() {
//    console.log('Start screen touched - starting game');
    // 这里可以添加开始游戏的实际逻辑
//}

/**
 * 更新调试显示（可选）
 */
function updateDebugDisplay() {
    // 在控制台显示当前触摸点信息
    //if (touches.length > 0) {
        //console.log(`Active touches: ${touches.length}`);
    //}
}

/**
 * 获取所有活跃触摸点
 */
function getActiveTouches() {
    return touches.filter(touch => touch.isActive);
}

/**
 * 获取特定触摸点
 */
function getTouchById(identifier) {
    return touches.find(touch => touch.identifier === identifier);
}

/**
 * 清除所有触摸点
 */
function clearAllTouches() {
    touches = [];
    console.log('All touches cleared');
}






/**
 * 绘制触摸点（用于调试）
 */
function drawTouchPoints() {
    if (touches.length === 0) return;
    
    ctx.save();
    touches.forEach((touch, index) => {
        // 绘制触摸点圆圈
        ctx.beginPath();
        ctx.arc(touch.x, touch.y, 20, 0, Math.PI * 2);
        if (touch.isSliding === true) {
            ctx.fillStyle = `rgba(0, 255, 0, 0.5)`;
        } else {
            ctx.fillStyle = `rgba(255, 0, 0, 0.5)`;
        }
        ctx.fill();
        
        // 绘制触摸点ID
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`T${index}`, touch.x, touch.y);
        
        // 绘制从起始位置到当前位置的连线
        ctx.beginPath();
        ctx.moveTo(touch.lastX, touch.lastY);
        ctx.lineTo(touch.x, touch.y);
        ctx.strokeStyle = `rgba(0, 0, 255, 0.3)`;
        ctx.stroke();
        
    });
    ctx.restore();
}