// 常量
const chapterNum = 8;

const menuPadding = 0.1;
const chapterHeight = 0.78;
const chapterWidth = chapterHeight*0.27;
const chapterWidthRenderDX = chapterHeight/Math.tan(PhigrosDegree);
const chapterShowingWidth = chapterWidth*4;
const chapterRelativeDistance = 0.085; //相邻两章节间距

// 章节切换
const switchAnimationLasting = 600; // 切换动画时间，毫秒

// 变量
let mainmenuChapters = []; // 存储所有章节类
let chapterShowing = 1; // 选中的章节的id(index)
let menuNowPos = 0;
let menuDeltaPos = 0;
let menuRenderPos = 0;
let menuChapterVelocity = 0;
let doingSwitchAnimation = false;

// 章节构成的界面总长度
let menuLength = menuPadding + chapterNum*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth; 

// 章节切换
let switchAnimationEndtime = 0;
let switchToChapter = -1; //切换触发器
let switchProgress = 0.0;


const chapterImages = new ImageSpace([
    'assets/MainMenu/Chapters/Single.png', //0
    'assets/MainMenu/Chapters/MainStoryLegacy.png',//1
    'assets/MainMenu/Chapters/MainStory5.png', //2
    'assets/MainMenu/Chapters/MainStory6.png', //3
    'assets/MainMenu/Chapters/MainStory7.png', //4
    'assets/MainMenu/Chapters/MainStory8_2S.png', //5
    'assets/MainMenu/Chapters/SideStory1.png', //6
    'assets/MainMenu/Chapters/SideStory2.png', //7
], 'chapterImages');

const chapterBlurImages = new ImageSpace([
    'assets/MainMenu/ChaptersBlur/SingleBlur.png', //0
    'assets/MainMenu/ChaptersBlur/MainStoryLegacyBlur.png',//1
    'assets/MainMenu/ChaptersBlur/MainStory5Blur.png', //2
    'assets/MainMenu/ChaptersBlur/MainStory6Blur.png', //3
    'assets/MainMenu/ChaptersBlur/MainStory7Blur.png', //4
    'assets/MainMenu/ChaptersBlur/MainStory8_2Blur.png', //5
    'assets/MainMenu/ChaptersBlur/SideStory1Blur.png', //6
    'assets/MainMenu/ChaptersBlur/SideStory2Blur.png', //7
], 'chapterBlurImages');

const chapterAudios = new AudioSpace([
    'audio-assets/MainMenu/ChapterSelect0.wav', //0
], 'chapterAudios');

const chapterText = [
    'Single',
    'Legacy',
    'Chapter 5',
    'Chapter 6',
    'Chapter 7',
    'Chapter 8',
    'Side Story 1',
    'Side Story 2',
]

// 类
class MainmenuChapter {
    constructor(id) { // id算是index，直接和几个常量数组里的内容一一对应
         this.img = chapterImages.files[id];
         this.imgblur = chapterBlurImages.files[id];
         this.text = chapterText[id];
         this.textOpacity = 0.5;
         this.showing = false;

         this.blurRate = 1.0;
         this.lastWidth = 0.0;
         this.width = chapterWidth;
         
         // 独立的离屏临时canvas
         this.tempCanvas = document.createElement('canvas');
         this.tempCanvas.width = this.img.width/this.img.height * canvas.height *chapterHeight;
         this.tempCanvas.height = canvas.height *chapterHeight;
         this.tempCtx = this.tempCanvas.getContext('2d');
         
         // 独立的离屏临时canvas(Blur版本)
         this.tempBlurCanvas = document.createElement('canvas');
         this.tempBlurCanvas.width = this.imgblur.width/this.imgblur.height * canvas.height *chapterHeight;
         this.tempBlurCanvas.height = canvas.height *chapterHeight;
         this.tempBlurCtx = this.tempBlurCanvas.getContext('2d');
    }
    
    render(chapterPos,opacity) {
        if (this.lastWidth !== this.width) this.updateTempCanvas(); // 只有宽度改变才更新屏外canvas

        const savedGlobalAlpha = ctx.globalAlpha; // 保存globalAlpha设置
        // 渲染原始图片
        const renderPos = chapterPos - menuRenderPos;
        const renderHeight = chapterHeight * canvas.height;
        const renderWidth = renderHeight * (this.img.width / this.img.height);
        ctx.globalAlpha = (1 - this.blurRate)*opacity;
        ctx.drawImage(this.tempCanvas, renderPos*canvas.height, (1-chapterHeight)/2*canvas.height, renderWidth, renderHeight);
        // 渲染模糊图片
        const renderWidthBlur = renderHeight * (this.imgblur.width / this.imgblur.height);
        ctx.globalAlpha = this.blurRate * opacity;
        ctx.drawImage(this.tempBlurCanvas, renderPos*canvas.height, (1-chapterHeight)/2*canvas.height, renderWidthBlur, renderHeight);

        ctx.globalAlpha = savedGlobalAlpha; // 还原globaAlpha

    }

    updateTempCanvas(){
        const sWidth = this.tempCanvas.height*(this.width+chapterWidthRenderDX)/chapterHeight; // 要渲染那部分图片的宽度
        const x = (sWidth - this.tempCanvas.width)/2;
        
        // 清除临时canvas
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

        this.tempCtx.globalCompositeOperation = 'source-over';
        this.tempCtx.fillStyle = '#000000';
        this.tempCtx.fillRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

        this.tempCtx.globalAlpha = 1.0;
        this.tempCtx.drawImage(this.img, x, 0, this.tempCanvas.width, this.tempCanvas.height);

        // 在临时canvas上创建裁剪路径
        this.tempCtx.globalCompositeOperation = 'destination-out';
        
        // 裁剪左边部分
        this.tempCtx.beginPath();
        this.tempCtx.moveTo(0, 0);
        this.tempCtx.lineTo(this.tempCanvas.height/Math.tan(PhigrosDegree), 0);
        this.tempCtx.lineTo(0, this.tempCanvas.height);
        this.tempCtx.closePath();
        this.tempCtx.fill();
        
        // 裁剪右边部分
        this.tempCtx.beginPath();
        this.tempCtx.moveTo(sWidth, 0);
        this.tempCtx.lineTo(sWidth - this.tempCanvas.height/Math.tan(PhigrosDegree), this.tempCanvas.height);
        this.tempCtx.lineTo(this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.lineTo(this.tempCanvas.width, 0);
        this.tempCtx.closePath();
        this.tempCtx.fill();

        // 模糊图片部分更新和裁剪同理
        const sWidthBlur = this.tempBlurCanvas.height*(this.width+chapterWidthRenderDX)/chapterHeight;
        const xBlur = (sWidthBlur - this.tempBlurCanvas.width)/2;
        
        // 清除临时模糊canvas
        this.tempBlurCtx.clearRect(0, 0, this.tempBlurCanvas.width, this.tempBlurCanvas.height);
        
        this.tempBlurCtx.globalCompositeOperation = 'source-over';
        this.tempBlurCtx.fillStyle = '#000000';
        this.tempBlurCtx.fillRect(0, 0, this.tempBlurCanvas.width, this.tempBlurCanvas.height);

        this.tempBlurCtx.globalAlpha = 0.75;
        this.tempBlurCtx.drawImage(this.imgblur, xBlur, 0, this.tempBlurCanvas.width, this.tempBlurCanvas.height);
        this.tempBlurCtx.globalAlpha = 1.0;

        // 在临时canvas上创建裁剪路径
        this.tempBlurCtx.globalCompositeOperation = 'destination-out';

        // 裁剪左边部分
        this.tempBlurCtx.beginPath();
        this.tempBlurCtx.moveTo(0, 0);
        this.tempBlurCtx.lineTo(this.tempBlurCanvas.height/Math.tan(PhigrosDegree), 0);
        this.tempBlurCtx.lineTo(0, this.tempBlurCanvas.height);
        this.tempBlurCtx.closePath();
        this.tempBlurCtx.fill();
        
        // 裁剪右边部分
        this.tempBlurCtx.beginPath();
        this.tempBlurCtx.moveTo(sWidthBlur, 0);
        this.tempBlurCtx.lineTo(sWidthBlur - this.tempBlurCanvas.height/Math.tan(PhigrosDegree), this.tempBlurCanvas.height);
        this.tempBlurCtx.lineTo(this.tempBlurCanvas.width, this.tempBlurCanvas.height);
        this.tempBlurCtx.lineTo(this.tempBlurCanvas.width, 0);
        this.tempBlurCtx.closePath();
        this.tempBlurCtx.fill();
        
        // 重置合成模式
        this.tempCtx.globalCompositeOperation = 'source-over';
        this.tempBlurCtx.globalCompositeOperation = 'source-over';
        
        // 更新最后宽度
        this.lastWidth = this.width;
    }
}

function mainmenu_loadChapters() {
    for (let i = 0; i < chapterNum; i++) {
        mainmenuChapters[i] = new MainmenuChapter(i);
        console.log(`[mainmenu_loadChapters] 加载 MainmenuChapter${i} `);
    }
    mainmenuChapters[chapterShowing].width = chapterShowingWidth;
    mainmenuChapters[chapterShowing].textOpacit = 0;
    mainmenuChapters[chapterShowing].blurRate = 0.0;
}

//cachedCanvas = document.createElement('canvas');
//const tempCtx = cachedCanvas.getContext('2d');
function updateShowingchapter(elapsed) {
    if (switchToChapter !== -1) {
        if (doingSwitchAnimation === false) {
            doingSwitchAnimation = true;
            switchAnimationEndtime = elapsed + switchAnimationLasting;
        } else {
            // 更新Width
            const dt = switchAnimationLasting - (switchAnimationEndtime - elapsed);
            const k = (chapterShowingWidth - chapterWidth)/(switchAnimationLasting*switchAnimationLasting);
            mainmenuChapters[chapterShowing].width = k*(dt-switchAnimationLasting)*(dt-switchAnimationLasting) + chapterWidth;
            mainmenuChapters[switchToChapter].width = -k*(dt-switchAnimationLasting)*(dt-switchAnimationLasting) + chapterShowingWidth;
            mainmenuChapters[chapterShowing].blurRate = dt/switchAnimationLasting;
            mainmenuChapters[switchToChapter].blurRate = 1.0 - dt/switchAnimationLasting;
            switchProgress = dt / switchAnimationLasting;
            // 结束更新
            if (dt >= switchAnimationLasting) {
                mainmenuChapters[chapterShowing].width = chapterWidth;
                mainmenuChapters[switchToChapter].width = chapterShowingWidth;

                mainmenuChapters[chapterShowing].blurRate = 1.0;
                mainmenuChapters[switchToChapter].blurRate = 0.0;

                doingSwitchAnimation = false;
                chapterShowing = switchToChapter;
                switchToChapter = -1;

                switchProgress = 0.0;
            }
        }
    }
}

function renderChapters(opacity) {
    let pointer = menuPadding;
    for (let i = 0; i < chapterNum; i++) {
        
        if (pointer + mainmenuChapters[i].width + chapterWidthRenderDX - menuRenderPos > 0 && 
            pointer - menuRenderPos < menuRenderPos + (canvas.width/canvas.height)) // 章节在可视范围内才渲染
        {
            mainmenuChapters[i].render(pointer,opacity);
        }
        pointer = pointer + mainmenuChapters[i].width + chapterRelativeDistance ;
    }
}


function updateMainMenu(elapsed){

    updateShowingchapter(elapsed);

    if (touches.length >= 1) {
        menuDeltaPos = (touches[0].startX - touches[0].x)/canvas.height;
    }


    if (newTouchEnded && touches.length === 0) {
        newTouchEnded = false;
        menuNowPos = menuRenderPos;
        if (menuNowPos < 0){
            menuNowPos = 0;
        } else if (menuNowPos+(canvas.width/canvas.height) > menuLength) {
            menuNowPos = menuLength - canvas.width/canvas.height;
        }
        menuDeltaPos = 0;
    }

    menuRenderPos = menuNowPos + menuDeltaPos;
    if (menuRenderPos < 0) {
        menuRenderPos = menuRenderPos/2;
    } else if (menuRenderPos+(canvas.width/canvas.height) > menuLength) {
        menuRenderPos = (menuLength - canvas.width/canvas.height + menuRenderPos) / 2;
    }
    //logoOpacity = Math.max(1-elapsed/600, 0);drawOpacity
    
}

function renderMainMenu(drawOpacity){
    // 渲染背景
    drawImage(chapterBlurImages.files[chapterShowing], 'Height', size = 1.0, drawOpacity*0.3*(1-switchProgress), 0, 0, 0); // 背景
    if (switchProgress > 0) drawImage(chapterBlurImages.files[switchToChapter], 'Height', size = 1.0, drawOpacity*0.3*switchProgress, 0, 0, 0); // 背景

    renderChapters(drawOpacity);

    /*

    // 渲染选中章节图片
    const nowShowImg = chapterImages.files[chapterShowing];
    drawClippedImage(nowShowImg, 1.0*drawOpacity, 0, 0, nowShowImg.width, nowShowImg.height, (menuPadding - menuRenderPos + chapterShowing*(chapterWidth+chapterRelativeDistance))*canvas.height,
                            (1-chapterHeight)/2*canvas.height, (chapterShowingWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
    
    // 渲染其它章节图片
    chapterBlurImages.files.forEach((src, index) => {
        if (index > chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth-chapterWidth)*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
        } else if (index < chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance))*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
        }
    });

    */

    // 渲染章节文字
    chapterText.forEach((src, index) => {
        if (index === chapterShowing) { 
            // 其他处理逻辑
        } else if (index > chapterShowing) {
            drawTiltedText(src, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth)*canvas.height, (1+chapterHeight)/2*canvas.height,
                            0.1*chapterWidth*canvas.height, -0.125*chapterWidth*canvas.height,`'PhigrosFont', Arial, sans-serif`, 0.36*chapterWidth*canvas.height, '#ffffff', 0.5*drawOpacity, PhigrosDegree, 'left', 'bottom');
        } else if (index < chapterShowing) {
            drawTiltedText(src, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance) + chapterWidth)*canvas.height, (1+chapterHeight)/2*canvas.height,
                            0.1*chapterWidth*canvas.height, -0.125*chapterWidth*canvas.height,`'PhigrosFont', Arial, sans-serif`, 0.36*chapterWidth*canvas.height, '#ffffff', 0.5*drawOpacity, PhigrosDegree, 'left', 'bottom');
        }
    });
}