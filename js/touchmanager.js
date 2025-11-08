
const touchDebug = true;

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
        this.startTime = performance.now();
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
        
        // 移除55ms之前的记录
        this.positionHistory = this.positionHistory.filter(record => 
            currentTime - record.time <= 55
        );
        
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

    canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
    canvas.addEventListener('mousemove', handleMouseMove, { passive: false });
    canvas.addEventListener('mouseup', handleMouseUp, { passive: false });
    canvas.addEventListener('mouseleave', handleMouseUp, { passive: false });

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
            //console.log(`Touch started: ID ${touch.identifier} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
        }
    }
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
            //console.log(`Touch ended: ID ${touch.identifier}`);
            touches.splice(index, 1);
        }
    }
}

// 鼠标按下事件处理（模拟触摸开始）
function handleMouseDown(event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // 使用固定的标识符来模拟鼠标触摸点
    const mouseIdentifier = -1; // 使用负数避免与真实触摸点冲突
    
    // 检查是否已存在鼠标触摸点
    const existingTouch = touches.find(t => t.identifier === mouseIdentifier);
    if (!existingTouch && touches.length < maxTouches) {
        touches.push(new TouchPoint(mouseIdentifier, x, y));
        //console.log(`Mouse touch started at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
}

// 鼠标移动事件处理（模拟触摸移动）
function handleMouseMove(event) {
    // 只有在鼠标按下时才处理移动
    if (event.buttons !== 1) return;
    
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // 查找鼠标触摸点
    const mouseIdentifier = -1;
    const existingTouch = touches.find(t => t.identifier === mouseIdentifier);
    if (existingTouch) {
        existingTouch.update(x, y);
    }
}

// 鼠标释放事件处理（模拟触摸结束）
function handleMouseUp(event) {
    event.preventDefault();
    
    const mouseIdentifier = -1;
    const index = touches.findIndex(t => t.identifier === mouseIdentifier);
    if (index !== -1) {
        //console.log(`Mouse touch ended`);
        touches.splice(index, 1);
    }
}


//用户使用
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
 * 更新所有触摸点的状态（在主循环中调用）
 */
function updateTouchStates() {
    const currentTime = performance.now();
    const startSlideThreshold = 2.4; // 开始滑动的速度阈值（像素/毫秒）
    const stopSlideThreshold = 1.2;  // 停止滑动的速度阈值（像素/毫秒）
    const inactivityThreshold = 100; // 无活动判定时间(ms)
    
    touches.forEach(touch => {
        // 设置lastX和lastY为50ms前的位置
        const fiftyMsAgo = currentTime - 50;
        const historicalRecord = touch.positionHistory.find(record => 
            record.time >= fiftyMsAgo
        );
        
        if (historicalRecord) {
            touch.lastX = historicalRecord.x;
            touch.lastY = historicalRecord.y;
            const deltaTime = currentTime - historicalRecord.time;
        
            // 计算移动距离和速度
            const deltaX = touch.x - historicalRecord.x;
            const deltaY = touch.y - historicalRecord.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (deltaTime > 0) {
                touch.velocity = ((distance/canvas.height)*DEFAULT_CANVAS_HEIGHT) / deltaTime; // 像素/毫秒
                
                // 使用不同的阈值判断滑动状态
                if (!touch.isSliding) {
                    // 当前不是滑动状态，检查是否达到开始滑动阈值
                    touch.isSliding = touch.velocity > startSlideThreshold;
                } else {
                    // 当前是滑动状态，检查是否低于停止滑动阈值
                    touch.isSliding = touch.velocity > stopSlideThreshold;
                }
            }
        } else {
            // 如果没有历史记录，设置为非滑动状态
            touch.velocity = 0;
            touch.isSliding = false;
        }
        
        // 额外检查：如果长时间没有位置更新，强制设置为非滑动状态
        if (currentTime - touch.lastUpdateTime > inactivityThreshold) {
            touch.velocity = 0;
            touch.isSliding = false;
        }
    });
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