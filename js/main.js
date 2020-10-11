'use strict';

const cvs = document.querySelector('.default-canvas');
const ctx = cvs.getContext('2d');

const image = new Image();

let offsetX = 0,
    offsetY = 0,
    click = 0,
    selection = {},
    scaleSelection = {
        x: 0,
        y: 0
    },
    type;
const stepScale = 10,
    stepResize = 10,
    BRUSH_RADIUS = 10;


if (localStorage.length > 0) cvs.removeEventListener('click', loadOnClick, false)

const core = new Core(cvs, window.innerWidth / 2, window.innerHeight / 2);


document.querySelector('#img').addEventListener('change', () => {
    core.setImageSrc();
    image.src = localStorage.getItem('img-data');
    core.load();
    location.reload();
});
try {
    image.src = localStorage.getItem('img-data');
    image.onload = () => {
        if (image.width > window.innerWidth * 0.75 || image.height > window.innerHeight * 0.75) {
            document.querySelector('.wrapper').classList.add('flex');
            cvs.classList.add('large-canvas');
            cvs.classList.remove('default-canvas');
        }
        core.resize_cvs(image.naturalWidth, image.naturalHeight)
        core.load();
    }
} catch (e) {
    console.log('Something went wrong (9_9) // Error ->', e)
}


/**
 * Image methods
 */
class UserImage {
    constructor(image) {
        this.image = image;
    }
    crop() {
        ctx.clearRect(0, 0, cvs.width, cvs.height)
        core.resize_cvs(selection.w, selection.h)
        ctx.drawImage(this.image, selection.x - selection.w, selection.y - selection.h, selection.w, selection.h, 0, 0, Math.abs(selection.w), Math.abs(selection.h))
    }
    draw(x, y) {
        ctx.drawImage(this.image, x, y)
    }
    update(x = 0, y = 0) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        this.draw(x, y);
    }
    scale(offsetX, offsetY) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.image, 0, 0, this.image.width - offsetX, this.image.height - offsetY, scaleSelection.x, scaleSelection.y, this.image.width, this.image.height)
    }
    resize(offsetX, offsetY) {
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, scaleSelection.x, scaleSelection.y, this.image.width + offsetX, this.image.height + offsetY)
    }
}
/*
    Listeners
 */
const mousedown = e => {

    selection.x = e.offsetX;
    selection.y = e.offsetY;

    click++;

    switch (type) {
        case 'cut':
            if (click >= 2) {
                cvs.removeEventListener('mousedown', mousedown, false);
                cvs.removeEventListener('mousemove', mousemove, false);
                click = 0;
            }
            break;
        case 'scale':
            cvs.removeEventListener('mousemove', mousemove, false)
            core._mesh(selection, scaleSelection);
            break;
        case 'resize':

            /**
             * Drawing arrows
             */

            const collisionOffset = 5;
            const arrowLength = 50;
            const arrowOffset = 10;

            ctx.beginPath();
            core._arrow(ctx, scaleSelection.x - arrowOffset, scaleSelection.y + scaleSelection.h / 2, scaleSelection.x - (arrowLength + arrowOffset), scaleSelection.y + scaleSelection.h / 2)
            core._arrow(ctx, scaleSelection.x + scaleSelection.w + arrowOffset, scaleSelection.y + scaleSelection.h / 2, scaleSelection.x + scaleSelection.w + (arrowLength + arrowOffset), scaleSelection.y + scaleSelection.h / 2)
            core._arrow(ctx, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y - arrowOffset, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y - (arrowLength + arrowOffset))
            core._arrow(ctx, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y + scaleSelection.h + arrowOffset, scaleSelection.x + scaleSelection.w / 2, scaleSelection.y + scaleSelection.h + (arrowLength + arrowOffset))
            ctx.closePath();
            ctx.stroke();

            /**
             * Collisions of arrows
             */

            if ((selection.x > scaleSelection.x - (collisionOffset + (arrowLength + arrowOffset)) && selection.x < scaleSelection.x + arrowLength)) {
                offsetX -= stepResize;
                core.Image.resize(offsetX, offsetY)
            } else if ((selection.x > scaleSelection.x + scaleSelection.w - arrowLength + (collisionOffset + arrowOffset + (arrowLength - arrowOffset)) && selection.x < scaleSelection.x + scaleSelection.w + arrowLength + collisionOffset + arrowOffset + (arrowLength - arrowOffset)) && (selection.y > scaleSelection.y + scaleSelection.h / 2 - collisionOffset && selection.y < scaleSelection.y + scaleSelection.h / 2 + collisionOffset)) {
                offsetX += stepResize;
                core.Image.resize(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + scaleSelection.w / 2 - collisionOffset && selection.x < scaleSelection.x + scaleSelection.w / 2 + collisionOffset) && (selection.y > scaleSelection.y - collisionOffset - arrowLength - arrowOffset && selection.y < scaleSelection.y - collisionOffset)) {
                offsetY -= stepResize;
                core.Image.resize(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + scaleSelection.w / 2 - collisionOffset && selection.x < scaleSelection.x + scaleSelection.w / 2 + collisionOffset) && (selection.y > scaleSelection.y + scaleSelection.h + collisionOffset && selection.y < scaleSelection.y + scaleSelection.h + collisionOffset + arrowOffset + arrowLength)) {
                offsetY += stepResize;
                core.Image.resize(offsetX, offsetY);
            }
            break;
        case 'brush':
            cvs.addEventListener('mousemove', mousemove, false)
            break;
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
            scaleSelection.x = e.offsetX - core.Image.image.width / 2;
            scaleSelection.y = e.offsetY - core.Image.image.height / 2;
            core.Image.update(e.offsetX - core.Image.image.width / 2, e.offsetY - core.Image.image.height / 2)
            break;
        case 'brush':
            ctx.beginPath();
            ctx.arc(e.offsetX, e.offsetY, BRUSH_RADIUS, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = localStorage.getItem('color');
            ctx.fill();
            console.log(localStorage.getItem('color'))
    }
}
cvs.addEventListener('mouseup', e => {
    switch (type) {
        case 'brush':
            cvs.removeEventListener('mousemove', mousemove, false)
    }
});