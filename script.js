// ===== 动态创建装饰元素 =====
const decorators = [
    { tag: 'div', cls: 'bg-image' },
    { tag: 'div', cls: 'bg-overlay' },
    { tag: 'div', cls: 'ambient-light' },
    { tag: 'div', cls: 'sword-slash slash-1' },
    { tag: 'div', cls: 'sword-slash slash-2' },
    { tag: 'div', cls: 'sword-slash slash-3' },
];
decorators.forEach(d => {
    const el = document.createElement(d.tag);
    el.className = d.cls;
    document.body.appendChild(el);
});
const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
document.body.appendChild(canvas);

// ===== 粒子系统 =====
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ===== 鼠标金色拖尾 =====
const mouseTrail = [];
const TRAIL_MAX = 30;
let mouseX = -100, mouseY = -100;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseTrail.push({ x: mouseX, y: mouseY, life: 1 });
    if (mouseTrail.length > TRAIL_MAX) mouseTrail.shift();

    // 产生金色火花粒子
    for (let i = 0; i < 2; i++) {
        const spark = new Particle('goldSpark');
        spark.x = mouseX + (Math.random() - 0.5) * 16;
        spark.y = mouseY + (Math.random() - 0.5) * 16;
        particles.push(spark);
    }
});

function drawMouseTrail() {
    // 绘制金色连接线
    for (let i = 1; i < mouseTrail.length; i++) {
        const p = mouseTrail[i - 1];
        const c = mouseTrail[i];
        const ratio = i / mouseTrail.length;
        const alpha = ratio * 0.6;
        const width = ratio * 4 + 1;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = `rgba(255, 210, 80, ${alpha})`;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // 绘制每个拖尾点的光晕
    for (let i = 0; i < mouseTrail.length; i++) {
        const t = mouseTrail[i];
        const ratio = i / mouseTrail.length;
        t.life -= 0.02;
        if (t.life <= 0) continue;

        const alpha = ratio * t.life * 0.5;
        // 内核
        ctx.beginPath();
        ctx.arc(t.x, t.y, ratio * 3 + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 100, ${alpha})`;
        ctx.fill();
        // 外光晕
        ctx.beginPath();
        ctx.arc(t.x, t.y, ratio * 10 + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 50, ${alpha * 0.15})`;
        ctx.fill();
    }

    // 鼠标位置的亮点
    if (mouseX > 0) {
        // 金色核心
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 240, 180, 0.95)';
        ctx.fill();
        // 中层光晕
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 210, 80, 0.35)';
        ctx.fill();
        // 外层大光晕
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 180, 50, 0.1)';
        ctx.fill();
    }

    // 清理过期拖尾点
    while (mouseTrail.length > 0 && mouseTrail[0].life <= 0) {
        mouseTrail.shift();
    }
}

// ===== 粒子类 =====
class Particle {
    constructor(type) {
        this.type = type;
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        if (this.type === 'stardust') {
            this.size = Math.random() * 2 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.5 + 0.05;
            this.fadeSpeed = Math.random() * 0.005 + 0.001;
            this.fadeDir = 1;
            const hue = 190 + Math.random() * 50;
            this.color = `hsla(${hue}, 55%, 82%, `;
        } else if (this.type === 'swordLight') {
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 3 + 1.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.8 + 0.3;
            this.life = 1;
            this.decay = Math.random() * 0.01 + 0.005;
            if (Math.random() > 0.5) {
                this.x = -10;
                this.speedX = Math.abs(this.speedX);
            } else {
                this.x = canvas.width + 10;
                this.speedX = -Math.abs(this.speedX);
            }
            this.y = Math.random() * canvas.height * 0.65;
            this.trail = [];
            const hue = 200 + Math.random() * 40;
            this.color = `hsla(${hue}, 70%, 78%, `;
        } else if (this.type === 'falling') {
            this.size = Math.random() * 2 + 0.3;
            this.speedX = Math.random() * 0.4 - 0.05;
            this.speedY = Math.random() * 0.7 + 0.2;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.life = 1;
            this.decay = Math.random() * 0.0015 + 0.0008;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.008;
            const hue = 210 + Math.random() * 30;
            this.color = `hsla(${hue}, 50%, 85%, `;
        } else if (this.type === 'goldSpark') {
            // 金色火花：鼠标产生，快速消散
            this.size = Math.random() * 2.5 + 0.5;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5 + 0.3;
            this.speedX = Math.cos(angle) * speed;
            this.speedY = Math.sin(angle) * speed;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.015;
            this.trail = [];
            this.color = `hsla(${40 + Math.random() * 15}, 90%, ${65 + Math.random() * 20}%, `;
        }
    }

    update() {
        if (this.type === 'stardust') {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += this.fadeSpeed * this.fadeDir;
            if (this.opacity >= 0.65) this.fadeDir = -1;
            if (this.opacity <= 0.03) this.fadeDir = 1;
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        } else if (this.type === 'swordLight') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 12) this.trail.shift();
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.opacity = this.life * 0.7;
            if (this.life <= 0) this.reset();
        } else if (this.type === 'falling') {
            this.wobble += this.wobbleSpeed;
            this.x += this.speedX + Math.sin(this.wobble) * 0.3;
            this.y += this.speedY;
            this.life -= this.decay;
            this.opacity = this.life * 0.45;
            if (this.life <= 0 || this.y > canvas.height) this.reset();
        } else if (this.type === 'goldSpark') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 5) this.trail.shift();
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedX *= 0.97;
            this.speedY *= 0.97;
            this.life -= this.decay;
            this.opacity = this.life * 0.7;
        }
    }

    draw() {
        if (this.type === 'stardust') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
            if (this.size > 1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.opacity * 0.12) + ')';
                ctx.fill();
            }
        } else if (this.type === 'swordLight') {
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const ratio = i / this.trail.length;
                ctx.beginPath();
                ctx.arc(t.x, t.y, this.size * ratio * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.opacity * ratio * 0.3) + ')';
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
            ctx.fillStyle = this.color + (this.opacity * 0.08) + ')';
            ctx.fill();
        } else if (this.type === 'falling') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
        } else if (this.type === 'goldSpark') {
            // 金色拖尾
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const ratio = i / this.trail.length;
                ctx.beginPath();
                ctx.arc(t.x, t.y, this.size * ratio * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (this.opacity * ratio * 0.3) + ')';
                ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
            // 金色光晕
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = this.color + (this.opacity * 0.1) + ')';
            ctx.fill();
        }
    }
}

// ===== 创建粒子 =====
const particles = [];

// 星尘（大量）
for (let i = 0; i < 120; i++) {
    particles.push(new Particle('stardust'));
}

// 剑气光点（增加）
for (let i = 0; i < 18; i++) {
    const p = new Particle('swordLight');
    p.reset();
    particles.push(p);
}

// 飘落光点（增加）
for (let i = 0; i < 45; i++) {
    particles.push(new Particle('falling'));
}

// ===== 动画循环 =====
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 先绘制场景粒子
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        // 清理消亡的金色火花
        if (p.type === 'goldSpark' && p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // 绘制鼠标金色拖尾
    drawMouseTrail();

    requestAnimationFrame(animate);
}

animate();
