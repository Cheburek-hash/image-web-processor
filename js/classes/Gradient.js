class Gradient {
    constructor(w,h, name = 'gradient') {
        this.w = w;
        this.h = h;
        this.n = name;
    }
    createWindow(){
       this.cvs = document.createElement('canvas');
       this.cvs.width = this.w;
       this.cvs.height = this.h;
       this.ctx = this.cvs.getContext('2d');
       this.cvs.classList.add(this.n);
    }
    showWindow(){
        document.body.appendChild(this.cvs);
    }
    createGradient(data, points = [0, this.w, this.w, 0], coefficient = false) {
        let linearGradient = this.ctx.createLinearGradient(...points);
        let count = 1;
        if (!coefficient) {
            coefficient = 1 / data.colors.length
        }
        for (let i = data.colors.length - 1; i >= 0; i--) {
            console.log(data.colors[i])
            linearGradient.addColorStop(count, data.colors[i]);
            count -= coefficient;
        }
        return linearGradient;
    }
    setColor(colors = [[255,0,0],[0,255,0],[0,0,255]]){
        this.style = this.createGradient({colors:
                [
                    `rgb(${colors[0]})`,
                    `rgb(${colors[1]})`,
                    `rgb(${colors[2]})`
                ]
            });
    }
    currentColor(x, y){
        return this.ctx.getImageData(x, y, 1, 1).data.slice(0,-1);
    }
    draw(){
        this.ctx.fillStyle = this.style;
        this.ctx.fillRect(0,0, this.w, this.h);
    }
    update(){
        this.ctx.clearRect(0,0,this.w, this.h);
        this.draw();
    }

}