
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
        this.Image = new UserImage(image);
        this.Image.update();
    }
    apply(){
        let _cache = ctx.getImageData(scaleSelection.x, scaleSelection.y, core.Image.image.naturalWidth + offsetX, core.Image.image.naturalHeight + offsetY);
        switch (type){
            case 'cut':
                this.Image.crop();
                this.localSave();
                location.reload();
                break;
            case 'scale':
                this.resize_cvs(core.Image.image.naturalWidth + offsetX, core.Image.image.naturalHeight + offsetY);
                ctx.putImageData(_cache, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
                break;
            case 'resize':
                this.resize_cvs(core.Image.image.naturalWidth + offsetX, core.Image.image.naturalHeight + offsetY);
                ctx.putImageData(_cache, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
                break;
            case 'brush':
                this.resize_cvs(core.Image.image.naturalWidth + offsetX, core.Image.image.naturalHeight + offsetY);
                ctx.putImageData(_cache, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
        }

    }
    localSave(){
        localStorage.setItem('img-data', this.cvs.toDataURL('image/png'))
    }
    save() {
        this.apply();
        const link = document.createElement('a');
        link.setAttribute('href', this.cvs.toDataURL('image/png'));
        link.setAttribute('download', 'image.png');
        link.click();
        return false;
    }
    setImageSrc(selector = '#img') {
        const input = document.querySelector(selector);
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
    //Primitives
    _arrow(context, fromx, fromy, tox, toy) {
        const headlen = 5;
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }
    _mesh(selection, scaleSelection){
        let cell_w = Math.floor(scaleSelection.w / 3);
        let cell_h = Math.floor(scaleSelection.h / 3);

        for (let y = cell_h; y <= scaleSelection.h + 1; y += cell_h) {
            for (let x = cell_w; x <= scaleSelection.w + 1; x += cell_w) {
                ctx.strokeRect(scaleSelection.x, scaleSelection.y, x, y)
            }
        }
        /**
         * Canvas blocks collisions
         */
        if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + scaleSelection.w) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y + scaleSelection.h)) {
            if ((selection.x > scaleSelection.x + cell_w && selection.x < scaleSelection.x + cell_w * 2) && (selection.y > scaleSelection.y + cell_h && selection.y < scaleSelection.y + cell_h * 2) && click % 2 === 0) {
                cvs.addEventListener('mousemove', mousemove, false);
            } else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y + cell_h)) {
                offsetY += stepScale;
                offsetX += stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + cell_w && selection.x < scaleSelection.x + cell_w * 2) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y + cell_h)) {
                offsetY += stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + cell_w * 2 && selection.x < scaleSelection.x + cell_w * 3) && (selection.y > scaleSelection.y && selection.y < scaleSelection.y + cell_h)) {
                offsetY -= stepScale;
                offsetX -= stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y + cell_h && selection.y < scaleSelection.y + cell_h * 2)) {
                offsetX += stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + cell_w * 2 && selection.x < scaleSelection.x + cell_w * 3) && (selection.y > scaleSelection.y + cell_h && selection.y < scaleSelection.y + cell_h * 2)) {
                offsetX -= stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x && selection.x < scaleSelection.x + cell_w) && (selection.y > scaleSelection.y + cell_h * 2 && selection.y < scaleSelection.y + cell_h * 3)) {
                offsetY += stepScale;
                offsetX -= stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + cell_w && selection.x < scaleSelection.x + cell_w * 2) && (selection.y > scaleSelection.y + cell_h * 2 && selection.y < scaleSelection.y + cell_h * 3)) {
                offsetY -= stepScale;
                core.Image.scale(offsetX, offsetY);
            } else if ((selection.x > scaleSelection.x + cell_w * 2 && selection.x < scaleSelection.x + cell_w * 3) && (selection.y > scaleSelection.y + cell_h * 2 && selection.y < scaleSelection.y + cell_h * 3)) {
                offsetX += stepScale;
                offsetY -= stepScale;
                core.Image.scale(offsetX, offsetY);
            }
        }
        ctx.strokeRect(scaleSelection.x, scaleSelection.y, scaleSelection.w, scaleSelection.h);

    }
    imageAlignment(scaleSelection){

        const cvs_offsetW = (window.innerWidth - this.Image.image.naturalWidth) / 2;
        const cvs_offsetH = (window.innerHeight - this.Image.image.naturalHeight) / 2;

        this.resize_cvs(window.innerWidth - cvs_offsetW, window.innerHeight - cvs_offsetH)
        scaleSelection.x = (window.innerWidth - cvs_offsetW) / 2 - (this.Image.image.width / 2);
        scaleSelection.y = (window.innerHeight - cvs_offsetH) / 2 - (this.Image.image.height / 2);
        scaleSelection.w = this.Image.image.naturalWidth;
        scaleSelection.h = this.Image.image.naturalHeight;
        this.Image.update(scaleSelection.x, scaleSelection.y);
        return scaleSelection;
    }


}