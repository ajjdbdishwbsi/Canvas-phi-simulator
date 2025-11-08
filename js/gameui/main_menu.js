// 常量
const chapterImgSources = [
    'assets/MainMenu/Chapters/Single.png', //0
    'assets/MainMenu/Chapters/MainStoryLegacy.png',//1
    'assets/MainMenu/Chapters/MainStory5Locked.png'//2
];
const menuPadding = 0.1;
const chapterHeight = 0.78;
const chapterWidth = chapterHeight*0.28;
const chapterWidthRenderDX = chapterHeight/Math.tan(PhigrosDegree);
const chapterShowingWidth = chapterWidth*4;
const chapterRelativeDistance = 0.085; //相邻两章节间距

// 变量
let chapterImg = [];
let chapterImgsLoadedNum = 0;
let chapterImgLoaded = false;
let chapterShowing = 1;
let menuNowPos = 0;
let menuChapterVelocity = 0;
let doingAnimation = false;


function loadchapterImages() {
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



function updateMainMenu(){
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    //logoOpacity = Math.max(1-elapsed/600, 0);drawOpacity
}

function renderMainMenu(drawOpacity){
    drawImage(chapterImg[chapterShowing], 'Height', size = 1.0, drawOpacity*0.3, 0, 0, 50); // 背景

    // 渲染章节
    chapterImg.forEach((src, index) => {
        if (index === chapterShowing) { 
            drawClippedImage(src, 1.0*drawOpacity, 0, 0, src.width, src.height, (menuPadding + menuNowPos + index*(chapterWidth+chapterRelativeDistance))*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterShowingWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',0);
        } else if (index > chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding + menuNowPos + index*(chapterWidth+chapterRelativeDistance) + chapterShowingWidth-chapterWidth)*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',75);
        } else if (index < chapterShowing) {
            drawClippedImage(src, 0.6*drawOpacity, 0, 0, src.width, src.height, (menuPadding + menuNowPos + index*(chapterWidth+chapterRelativeDistance))*canvas.height,
                                (1-chapterHeight)/2*canvas.height, (chapterWidth+chapterWidthRenderDX)*canvas.height, chapterHeight*canvas.height, 'fit-height',75);
        }
    });
}