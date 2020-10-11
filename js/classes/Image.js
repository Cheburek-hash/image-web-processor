class ImageOptions {
    static cutting() {
        selection = {};
        type = 'cut';
        cvs.addEventListener('mousedown', mousedown, false);
        cvs.addEventListener('mousemove', mousemove, false);
    }
    static resize() {
        type = 'resize';
        ctx.lineWidth = 5;
        scaleSelection = core.imageAlignment(scaleSelection);
        cvs.addEventListener('mousedown', mousedown, false);
    }
    static scale() {
        selection = {};
        type = 'scale';
        ctx.lineWidth = 8;
        scaleSelection = core.imageAlignment(scaleSelection);
        ctx.strokeRect(scaleSelection.x, scaleSelection.y, scaleSelection.w, scaleSelection.h);
        cvs.addEventListener('mousedown', mousedown, false);
    }
    static brush(){
        type = 'brush';
        scaleSelection = core.imageAlignment(scaleSelection);
        cvs.addEventListener('mousedown', mousedown, false);
    }
}