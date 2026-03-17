// Simple snow effect using canvas for a soft overlay.
// Place this file in assets/ and it will run automatically when loaded.
(function () {
    const overlay = document.getElementById('snow-overlay');
    if (!overlay) return;

    // If a snow video is present, prefer it and skip canvas drawing
    if (document.getElementById('snow-video')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.mixBlendMode = 'screen';
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const flakes = [];
    const config = {
        count: 120,
        sizeMin: 1.5,
        sizeMax: 4.5,
        speedMin: 0.3,
        speedMax: 1.1,
        wind: 0.12,
        opacityMin: 0.2,
        opacityMax: 0.7,
    };

    function resize() {
        canvas.width = overlay.clientWidth;
        canvas.height = overlay.clientHeight;
    }

    function createFlake() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
            speed: config.speedMin + Math.random() * (config.speedMax - config.speedMin),
            angle: Math.random() * Math.PI * 2,
            opacity: config.opacityMin + Math.random() * (config.opacityMax - config.opacityMin),
        };
    }

    function initFlakes() {
        flakes.length = 0;
        for (let i = 0; i < config.count; i++) {
            flakes.push(createFlake());
        }
    }

    function update() {
        for (const flake of flakes) {
            flake.y += flake.speed;
            flake.x += Math.sin(flake.angle) * config.wind;
            flake.angle += 0.002;

            if (flake.y > canvas.height + flake.r) {
                Object.assign(flake, createFlake(), { y: -flake.r });
            }
            if (flake.x > canvas.width + flake.r) {
                flake.x = -flake.r;
            }
            if (flake.x < -flake.r) {
                flake.x = canvas.width + flake.r;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        for (const flake of flakes) {
            ctx.moveTo(flake.x, flake.y);
            ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', () => {
        resize();
        initFlakes();
    });

    resize();
    initFlakes();
    requestAnimationFrame(loop);
})();
