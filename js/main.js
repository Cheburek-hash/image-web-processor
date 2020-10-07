'use strict';

const cvs = document.querySelector('.default-canvas');
const ctx = cvs.getContext('2d');

const image = new Image();
let offsetX = 0;
let offsetY = 0;
let click = 0;
let type;
const stepScale = 10;
const stepResize = 10;
let selection = {};
let scaleSelection = {x:0,y:0};

class Core {
    constructor(cvs, w, h) {
        this.cvs = cvs;
        this.w = w;
        this.h = h;
        this.cvs.width = this.w;
        this.cvs.height = this.h;
    }
    resize_cvs(w, h) {
        this.cvs.width = w;
        this.cvs.height = h;
    }
    reset(){
        localStorage.setItem('img-data', localStorage.getItem('img-data-original'))
        location.reload();
    }
    load() {
        this.image = new UserImage(image);
        this.image.update();
    }
    apply(){
        switch (type){
            case 'cut':
                this.image.crop();
                this.localSave();
                location.reload();
                break;
            case 'scale':
                let _cache = ctx.getImageData(scaleSelection.x, scaleSelection.y, scaleSelection.w, scaleSelection.h);
                this.resize_cvs(core.image.image.naturalWidth, core.image.image.naturalHeight);
                ctx.putImageData(_cache, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
                break;
            case 'resize':
                let _buffer = ctx.getImageData(scaleSelection.x, scaleSelection.y, scaleSelection.w, scaleSelection.h);
                this.resize_cvs(scaleSelection.w + offsetX, scaleSelection.h + offsetY);
                ctx.putImageData(_buffer, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
                break;
        }
    }
    localSave(){
        localStorage.setItem('img-data', this.cvs.toDataURL('image/png'))
    }
    save() {
        const link = document.createElement('a');
        link.setAttribute('href', this.cvs.toDataURL('image/png'));
        link.setAttribute('download', 'image.png');
        link.click();
        return false;
    }
    setImageSrc() {
        const input = document.querySelector('#img');
        if (input.files[0].type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem('img-data', e.target.result)
                localStorage.setItem('img-data-original', e.target.result)
            }
            reader.readAsDataURL(input.files[0]);
        } else {
            console.log('Ошибка файла')
        }
    }
    canvas_arrow(context, fromx, fromy, tox, toy) {
        const headlen = 5; // length of head in pixels
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }
}

class ImageOptions {

    static cutting() {
        selection = {};
        type = 'cut';
        cvs.addEventListener('mousedown', mousedown, false);
        cvs.addEventListener('mousemove', mousemove, false);

    }
    static resize(){
        type = 'resize';
        ctx.lineWidth = 5;
        const cvs_offsetW = (window.innerWidth - core.image.image.naturalWidth)/2;
        const cvs_offsetH = (window.innerHeight - core.image.image.naturalHeight)/2;

        core.resize_cvs(window.innerWidth - cvs_offsetW, window.innerHeight - cvs_offsetH)
        scaleSelection.x = (window.innerWidth - cvs_offsetW)/2-(core.image.image.width/2); scaleSelection.y = (window.innerHeight-cvs_offsetH)/2-(core.image.image.height/2); scaleSelection.w = core.image.image.naturalWidth; scaleSelection.h = core.image.image.naturalHeight;
        core.image.update(scaleSelection.x, scaleSelection.y);
       // ctx.strokeRect(scaleSelection.x,scaleSelection.y, scaleSelection.w, scaleSelection.h);
        cvs.addEventListener('mousedown', mousedown, false);
    }
    static scale() {
        selection = {};
        type = 'scale';
        ctx.lineWidth = 8;
        const cvs_offsetW = (window.innerWidth - core.image.image.naturalWidth)/2;
        const cvs_offsetH = (window.innerHeight - core.image.image.naturalHeight)/2;

        core.resize_cvs(window.innerWidth - cvs_offsetW, window.innerHeight - cvs_offsetH)
        scaleSelection.x = (window.innerWidth - cvs_offsetW)/2-(core.image.image.width/2); scaleSelection.y = (window.innerHeight-cvs_offsetH)/2-(core.image.image.height/2); scaleSelection.w = core.image.image.naturalWidth; scaleSelection.h = core.image.image.naturalHeight;

        core.image.update(scaleSelection.x, scaleSelection.y);
        ctx.strokeRect(scaleSelection.x,scaleSelection.y, scaleSelection.w, scaleSelection.h);
        cvs.addEventListener('mousedown', mousedown, false);

    }
}
class UserImage {
    constructor(image) {
        this.image = image;
    }
    crop() {
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        core.resize_cvs(selection.w, selection.h)
        ctx.drawImage(this.image, selection.x - selection.w, selection.y - selection.h, selection.w, selection.h, 0, 0, Math.abs(selection.w), Math.abs(selection.h))
    }
    draw(x,y) {
        ctx.drawImage(this.image, x, y)
    }
    update(x=0,y=0) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.draw(x,y);
    }
    scale(offsetX, offsetY){
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.image, 0, 0, this.image.width - offsetX, this.image.height - offsetY, scaleSelection.x,scaleSelection.y,this.image.width, this.image.height)
    }
    resize(offsetX, offsetY){
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, scaleSelection.x,scaleSelection.y,this.image.width + offsetX, this.image.height + offsetY)
    }
}

const core = new Core(cvs, window.innerWidth/2, window.innerHeight/2);

document.querySelector('#img').addEventListener('change', () => {
    core.setImageSrc()
    image.src = localStorage.getItem('img-data');
    core.load();
    location.reload();
});
try {
    image.src = localStorage.getItem('img-data');


    image.onload = () => {
        if (image.width > window.innerWidth*0.75  || image.height > window.innerHeight*0.75){
            document.querySelector('.wrapper').classList.add('flex');
            cvs.classList.add('large-canvas');
            cvs.classList.remove('default-canvas');
        }

        core.resize_cvs(image.width, image.height)
        core.load();
    }
} catch (e) {
    console.log('Ни одно изображение еще не загруженно')
}
/*
    Listeners
 */
const mousedown = e => {

    selection.x = e.offsetX;
    selection.y = e.offsetY;

    switch (type) {
        case 'cut':
            click++;

            if (click >= 2) {
                cvs.removeEventListener('mousedown', mousedown, false);
                cvs.removeEventListener('mousemove', mousemove, false);
                click = 0;
            }
            break;
        case 'scale':

            cvs.removeEventListener('mousemove', mousemove, false)

            click++;

            let cell_w = Math.ceil(scaleSelection.w/3);
            let cell_h =  Math.ceil(scaleSelection.h/3);



            for (let y = cell_h; y <= scaleSelection.h+1; y += cell_h){
                for (let x = cell_w; x <= scaleSelection.w+1; x += cell_w){
                    ctx.strokeRect(scaleSelection.x,scaleSelection.y, x, y)
                }
            }
            /**
             * Canvas blocks collisions
             */
            if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + scaleSelection.w) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y+scaleSelection.h)){
                if ((selection.x > scaleSelection.x + cell_w && selection.x < scaleSelection.x + cell_w*2) && (selection.y > scaleSelection.y + cell_h && selection.y < scaleSelection.y +cell_h*2) && click%2===0){
                    cvs.addEventListener('mousemove', mousemove, false);
                }
                else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y +cell_h)){
                    offsetY += stepScale;offsetX += stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x + cell_w && selection.x < scaleSelection.x + cell_w*2) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y +cell_h)){
                    offsetY += stepScale;
                    core.image.scale(offsetX, offsetY)
                }

                else if ((selection.x > scaleSelection.x + cell_w*2 && selection.x < scaleSelection.x + cell_w*3) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y +cell_h)){
                    offsetY -= stepScale;
                    offsetX -= stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y+ cell_h && selection.y < scaleSelection.y + cell_h*2)){
                    offsetX += stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x + cell_w*2 && selection.x < scaleSelection.x + cell_w*3) && (selection.y > scaleSelection.y+cell_h && selection.y < scaleSelection.y +cell_h*2)){
                    offsetX -= stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y + cell_h*2 && selection.y < scaleSelection.y +cell_h*3)){
                    offsetY += stepScale;
                    offsetX -= stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x +cell_w && selection.x < scaleSelection.x + cell_w*2) && (selection.y > scaleSelection.y+ cell_h*2&& selection.y < scaleSelection.y + cell_h*3)){
                    offsetY -= stepScale;
                    core.image.scale(offsetX, offsetY)
                }
                else if ((selection.x > scaleSelection.x + cell_w*2 && selection.x < scaleSelection.x + cell_w*3) && (selection.y > scaleSelection.y+ cell_h*2 && selection.y < scaleSelection.y +cell_h*3)){
                    offsetX += stepScale;
                    offsetY -= stepScale;
                    core.image.scale(offsetX, offsetY)
                }
            }

            ctx.strokeRect(scaleSelection.x,scaleSelection.y, scaleSelection.w, scaleSelection.h);

            break;
        case 'resize':
            /**
             * Drawing arrows
             */

            const collisionOffset = 5;
            const arrowLength = 50;
            const arrowOffset = 10;

            ctx.beginPath();
            core.canvas_arrow(ctx, scaleSelection.x - arrowOffset, scaleSelection.y + scaleSelection.h / 2, scaleSelection.x - (arrowLength + arrowOffset), scaleSelection.y + scaleSelection.h / 2)
            core.canvas_arrow(ctx, scaleSelection.x + scaleSelection.w + arrowOffset, scaleSelection.y + scaleSelection.h / 2, scaleSelection.x + scaleSelection.w + (arrowLength + arrowOffset), scaleSelection.y + scaleSelection.h / 2)
            core.canvas_arrow(ctx, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y - arrowOffset, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y - (arrowLength + arrowOffset))
            core.canvas_arrow(ctx, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y + scaleSelection.h + arrowOffset, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y + scaleSelection.h + (arrowLength + arrowOffset))
            ctx.closePath();
            ctx.stroke();

            /**
             * Collisions
             */
            // x - arrows
            //

            if ((selection.x > scaleSelection.x - (collisionOffset + (arrowLength + arrowOffset)) && selection.x < scaleSelection.x + arrowLength) ){
                offsetX -= stepResize;
                core.image.resize(offsetX, offsetY)
            } else if ((selection.x > scaleSelection.x + scaleSelection.w - arrowLength + (collisionOffset + arrowOffset + (arrowLength - arrowOffset)) && selection.x < scaleSelection.x + scaleSelection.w + arrowLength + collisionOffset + arrowOffset + (arrowLength - arrowOffset)) && (selection.y > scaleSelection.y + scaleSelection.h / 2 - collisionOffset && selection.y <  scaleSelection.y + scaleSelection.h / 2 + collisionOffset)){
                offsetX += stepResize;
                core.image.resize(offsetX, offsetY)
            }
            //ctx.strokeRect(scaleSelection.x - (collisionOffset + (arrowLength + arrowOffset)), scaleSelection.y + scaleSelection.h / 2 - collisionOffset, arrowLength + collisionOffset + arrowOffset,  collisionOffset*2);
            //ctx.strokeRect(scaleSelection.x + scaleSelection.w - arrowLength + (collisionOffset + arrowOffset + (arrowLength - arrowOffset)), scaleSelection.y + scaleSelection.h / 2 - collisionOffset, arrowLength + collisionOffset + arrowOffset,  collisionOffset*2);

            // y - arrows

            ctx.strokeRect(scaleSelection.x + scaleSelection.w / 2 - collisionOffset, scaleSelection.y - collisionOffset - arrowLength - arrowOffset, collisionOffset * 2,  arrowLength + arrowOffset);
            ctx.strokeRect(scaleSelection.x + scaleSelection.w / 2  - collisionOffset, scaleSelection.y + scaleSelection.h + collisionOffset, collisionOffset * 2,  collisionOffset*2);

            break
    }
}

const mousemove = e => {
    selection.w = e.offsetX - selection.x;
    selection.h = e.offsetY - selection.y;
    switch (type) {
        case 'cut':
            core.load();
            ctx.strokeRect(selection.x, selection.y, selection.w, selection.h)
            break;
        case 'scale':
            scaleSelection.x = e.offsetX - core.image.image.width/2; scaleSelection.y = e.offsetY- core.image.image.height/2;

            core.image.update(e.offsetX - core.image.image.width/2,e.offsetY- core.image.image.height/2)
    }
}