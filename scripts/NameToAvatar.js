function NameToAvatar(name, backgroundColor, fontColor)
{
    this.name = name.split(' ');
    this.backgroundColor = backgroundColor || this.generatorColor();
    this.fontColor = fontColor || "white";
    this.init();
}

NameToAvatar.prototype.init = function()
{
    this.canvas = document.createElement('canvas');
    this.canvas.width = 50;
    this.canvas.height = 50;

    this.ctx = this.canvas.getContext('2d');
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - 16;
};

NameToAvatar.prototype.generatorColor = function() {
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const r = randomBetween(0, 255);
    const g = randomBetween(0, 255);
    const b = randomBetween(0, 255);

    return `rgb(${r},${g},${b})`;
};

NameToAvatar.prototype.draw = function()
{
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fill();

    this.ctx.fillStyle = this.fontColor;

    this.ctx.font = 'bold 25px monospace';
    this.ctx.textAlign = 'center';

    this.ctx.fillText(
        this.name[0].slice(0, 1).toUpperCase() + ((this.name.length <= 1) ? this.name[0][1] : this.name[this.name.length - 1].slice(0, 1)).toUpperCase(),
        this.x,
        this.y
    );

    const img = new Image();
    img.src = this.canvas.toDataURL();
    img.width = this.canvas.width;
    img.height = this.canvas.height;

    return img.src;
};
