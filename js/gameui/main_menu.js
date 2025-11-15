// 常量
const chapterNum = 8;

const chapterImgSources = [
    'assets/MainMenu/Chapters/Single.png', //0
    'assets/MainMenu/Chapters/MainStoryLegacy.png',//1
    'assets/MainMenu/Chapters/MainStory5.png', //2
    'assets/MainMenu/Chapters/MainStory6.png', //3
    'assets/MainMenu/Chapters/MainStory7.png', //4
    'assets/MainMenu/Chapters/MainStory8_2S.png', //5
    'assets/MainMenu/Chapters/SideStory1.png', //6
    'assets/MainMenu/Chapters/SideStory2.png', //7
];
const chapterBlurImgSources = [
    'assets/MainMenu/ChaptersBlur/SingleBlur.png', //0
    'assets/MainMenu/ChaptersBlur/MainStoryLegacyBlur.png',//1
    'assets/MainMenu/ChaptersBlur/MainStory5Blur.png', //2
    'assets/MainMenu/ChaptersBlur/MainStory6Blur.png', //3
    'assets/MainMenu/ChaptersBlur/MainStory7Blur.png', //4
    'assets/MainMenu/ChaptersBlur/MainStory8_2Blur.png', //5
    'assets/MainMenu/ChaptersBlur/SideStory1Blur.png', //6
    'assets/MainMenu/ChaptersBlur/SideStory2Blur.png', //7
];

let chapterImgsLoadedNum = 0;
let chapterImg = [];
let chapterImgLoaded = false;

let chapterBlurImgsLoadedNum = 0;
let chapterBlurImg = [];
let chapterBlurImgLoaded = false;


const chapterAudioSources = [
    'audio-assets/MainMenu/ChapterSelect0.wav', //0
];
let chapterAudiosLoadedNum = 0;
let chapterAudio = [];
let chapterAudioLoaded = false;

const ChapterText = [
    'Single',
    'Legacy',
    'Chapter 5',
    'Chapter 6',
    'Chapter 7',
    'Chapter 8',
    'Side Story 1',
    'Side Story 2',
]

const menuPadding = 0.1;
const chapterHeight = 0.78;
const chapterWidth = chapterHeight*0.27;
const chapterWidthRenderDX = chapterHeight/Math.tan(PhigrosDegree);
const chapterShowingWidth = chapterWidth*4;
const chapterRelativeDistance = 0.085; //相邻两章节间距

// 变量
let chapterShowing = 1;
let menuNowPos = 0;
let menuDeltaPos = 0;
let menuRenderPos = 0;
let menuChapterVelocity = 0;
let doingAnimation = false;

// 章节构成的界面总长度
let menuLength = menuPadding + chapterNum*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth; 

function loadChapterImages() {
    chapterImgSources.forEach((src, index) => {
        chapterImg[index] = new Image();
        chapterImg[index].src = src;
        chapterImg[index].onload = () => {
            chapterImgsLoadedNum++;
            if (chapterImgsLoadedNum === chapterImgSources.length) {
                chapterImgLoaded = true;
                console.log('[MainMenu] 成功加载主菜单章节图片');
            }
        };
        
        chapterImg[index].onerror = (e) => {
            console.error(`Failed to load image: ${src}`, e);
        };
    });
}

function loadChapterBlurImages() {
    chapterBlurImgSources.forEach((src, index) => {
        chapterBlurImg[index] = new Image();
        chapterBlurImg[index].src = src;
        chapterBlurImg[index].onload = () => {
            chapterBlurImgsLoadedNum++;
            if (chapterBlurImgsLoadedNum === chapterBlurImgSources.length) {
                chapterBlurImgLoaded = true;
                console.log('[MainMenu] 成功加载主菜单章节模糊图片');
            }
        };
        
        chapterBlurImg[index].onerror = (e) => {
            console.error(`Failed to load image: ${src}`, e);
        };
    });
}

function loadChapterAudios() {
    chapterAudioSources.forEach((src, index) => {
        chapterAudio[index] = new Audio();
        chapterAudio[index].src = src;
        // 初始设置为静音，避免自动播放策略限制
        chapterAudio[index].muted = true;
        
        chapterAudio[index].addEventListener('canplaythrough', () => {
            chapterAudiosLoadedNum++;
            if (chapterAudiosLoadedNum === chapterAudioSources.length) {
                chapterAudioLoaded = true;
                console.log('[MainMenu] 成功加载主菜单音频');
            }
        });
        
        chapterAudio[index].addEventListener('error', (e) => {
            console.error(`Failed to load audio: ${src}`, e);
        });
    });
}



function updateMainMenu(elapsed){

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
    drawImage(chapterBlurImg[chapterShowing], 'Height', size = 1.0, drawOpacity*0.3, 0, 0, 0); // 背景

    // 渲染选中章节图片
    const nowShowImg = chapterImg[chapterShowing];
    drawClippedImage(nowShowImg, 1.0*drawOpacity, 0, 0, nowShowImg.width, nowShowImg.height, (menuPadding - menuRenderPos + chapterShowing*(chapterWidth+chapterRelativeDistance))*canvas.height,
                            (1-chapterHeight)/2*canvas.height, (chapterShowingWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);

    // 渲染其它章节图片
    chapterBlurImg.forEach((src, index) => {
        if (index > chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth-chapterWidth)*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
        } else if (index < chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding - menuRenderPos + index*(chapterWidth+chapterRelativeDistance))*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
        }
    });

    // 渲染章节文字
    ChapterText.forEach((src, index) => {
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