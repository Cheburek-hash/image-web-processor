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
                this.resize_cvs(core.Image.image.naturalWidth, core.Image.image.naturalHeight);
                ctx.putImageData(_cache, 0,0)
                this.localSave();
                this.resize_cvs(this.w, this.h);
                location.reload()
                break;
            case 'resize':
                this.resize_cvs(core.Image.image.naturalWidth+ offsetX, core.Image.image.naturalHeight + offsetY);
                ctx.putImageData(_cache, 0,0)
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
    canvas_arrow(context, fromx, fromy, tox, toy) {
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
}