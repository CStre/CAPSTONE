import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css';
import Header from '../../components/Header';
import Loader from '../../components/Loader';

function HomePage() {

    const [showLoader, setShowLoader] = useState(true);

    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const c = canvas.getContext('2d');
        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);
        let t = 0;
        let clicked = false;
        let maxl = 300;
        let minl = 50;
        let n = 30;
        let numt = 1000;
        let q = 10;

        let activeConnections = 0;
        const maxConnections = 20; // Maximum allowed connections

        const predefinedColors = [
            "hsl(210,100%,80%)", // Example color
            "hsl(121,100%,50%)",
            "hsl(186, 100%, 50%)"
            // Add more colors as needed
        ];

        function init() {
            c.fillStyle = "rgba(30,30,30,1)";
            c.fillRect(0, 0, w, h);
            return { c: c, canvas: canvas };
        }

        function dist(p1x, p1y, p2x, p2y) {
            return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
        }

        class segment {
            constructor(parent, l, a, first) {
                this.first = first;
                if (first) {
                    this.pos = {
                        x: parent.x,
                        y: parent.y
                    };
                } else {
                    this.pos = {
                        x: parent.nextPos.x,
                        y: parent.nextPos.y
                    };
                }
                this.l = l;
                this.ang = a;
                this.nextPos = {
                    x: this.pos.x + this.l * Math.cos(this.ang),
                    y: this.pos.y + this.l * Math.sin(this.ang)
                };
            }
            update(t) {
                this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
                this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
                this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
                this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
                this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
            }
            fallback(t) {
                this.pos.x = t.x;
                this.pos.y = t.y;
                this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
                this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
            }
            show() {
                c.lineTo(this.nextPos.x, this.nextPos.y);
            }
        }

        class tentacle {
            constructor(x, y, l, n, a) {
                this.x = x;
                this.y = y;
                this.l = l;
                this.n = n;
                this.t = {};
                this.rand = Math.random();
                this.color = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
                this.segments = [new segment(this, this.l / this.n, 0, true)];
                for (let i = 1; i < this.n; i++) {
                    this.segments.push(
                        new segment(this.segments[i - 1], this.l / this.n, 0, false)
                    );
                }
            }
            move(last_target, target) {
                this.angle = Math.atan2(target.y - this.y, target.x - this.x);
                this.dt = dist(last_target.x, last_target.y, target.x, target.y) + 5;
                this.t = {
                    x: target.x - 0.8 * this.dt * Math.cos(this.angle),
                    y: target.y - 0.8 * this.dt * Math.sin(this.angle)
                };
                if (this.t.x) {
                    this.segments[this.n - 1].update(this.t);
                } else {
                    this.segments[this.n - 1].update(target);
                }
                for (let i = this.n - 2; i >= 0; i--) {
                    this.segments[i].update(this.segments[i + 1].pos);
                }
                if (
                    dist(this.x, this.y, target.x, target.y) <=
                    this.l + dist(last_target.x, last_target.y, target.x, target.y)
                ) {
                    this.segments[0].fallback({ x: this.x, y: this.y });
                    for (let i = 1; i < this.n; i++) {
                        this.segments[i].fallback(this.segments[i - 1].nextPos);
                    }
                }
            }
            show(target) {
                if (activeConnections >= maxConnections) {
                    return;
                }
                if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                    activeConnections++;
                    c.globalCompositeOperation = "lighter";
                    c.beginPath();
                    c.lineTo(this.x, this.y);
                    for (let i = 0; i < this.n; i++) {
                        this.segments[i].show();
                    }
                    c.strokeStyle = this.color;
                    c.lineWidth = this.rand * 2;
                    c.lineCap = "round";
                    c.lineJoin = "round";
                    c.stroke();
                    c.globalCompositeOperation = "source-over";
                }
            }
            show2(target) {
                if (activeConnections >= maxConnections) {
                    return;
                }
                c.beginPath();
                if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                    c.arc(this.x, this.y, 2 * this.rand + 1, 0, 2 * Math.PI);
                    c.fillStyle = "white";
                } else {
                    c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
                    c.fillStyle = "darkcyan";
                }
                c.fill();
            }
        }

        let mouse = { x: false, y: false };
        let last_target = { x: 0, y: 0 };
        let target = { x: w / 2, y: h / 2 };
        let tent = [];

        for (let i = 0; i < numt; i++) {
            tent.push(
                new tentacle(
                    Math.random() * w,
                    Math.random() * h,
                    Math.random() * (maxl - minl) + minl,
                    n,
                    Math.random() * 2 * Math.PI
                )
            );
        }

        function draw() {
            activeConnections = 0;
            if (mouse.x) {
                target.errx = mouse.x - target.x;
                target.erry = mouse.y - target.y;
            } else {
                target.errx =
                    w / 2 +
                    ((h / 2 - q) * Math.sqrt(2) * Math.cos(t)) /
                    (Math.pow(Math.sin(t), 2) + 1) -
                    target.x;
                target.erry =
                    h / 2 +
                    ((h / 2 - q) * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) /
                    (Math.pow(Math.sin(t), 2) + 1) -
                    target.y;
            }

            target.x += target.errx / 10;
            target.y += target.erry / 10;

            t += 0.01;

            c.beginPath();
            c.arc(
                target.x,
                target.y,
                dist(last_target.x, last_target.y, target.x, target.y) + 5,
                0,
                2 * Math.PI
            );
            c.fillStyle = "hsl(210,100%,80%)";
            c.fill();

            for (let i = 0; i < numt; i++) {
                tent[i].move(last_target, target);
                tent[i].show2(target);
            }
            for (let i = 0; i < numt; i++) {
                tent[i].show(target);
            }
            last_target.x = target.x;
            last_target.y = target.y;
        }


        function loop() {
            animationRef.current = window.requestAnimationFrame(loop);
            c.clearRect(0, 0, w, h);
            draw();
        }

        canvas.addEventListener('mousemove', function (e) {
            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);

        canvas.addEventListener('mouseleave', function () {
            mouse.x = false;
            mouse.y = false;
        });

        canvas.addEventListener('mousedown', function () {
            clicked = true;
        });

        canvas.addEventListener('mouseup', function () {
            clicked = false;
        });

        window.addEventListener('resize', function () {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            loop();
        });

        init();
        loop();

        const handleMouseMove = (e) => {
            mouse.x = e.pageX - canvas.offsetLeft;
            mouse.y = e.pageY - canvas.offsetTop;
        };

        const handleMouseLeave = () => {
            mouse.x = false;
            mouse.y = false;
        };

        const handleMouseDown = () => {
            clicked = true;
        };

        const handleMouseUp = () => {
            clicked = false;
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            loop();
        };

        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        const loaderTimeout = setTimeout(() => {
            setShowLoader(false);
        }, 3000);

        // Cleanup function
        return () => {
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);

            clearTimeout(loaderTimeout);
        };
    }, []);

    return (
        <div className="homePage">
            {/* Loader Overlay */}
            <div className={showLoader ? "loaderOverlay" : "loaderOverlay hidden"}>
                <Loader />
            </div>

            {/* Rest of the Page Content */}
            <Header style={{ zIndex: 1001 }} />
            <canvas ref={canvasRef} id="canvas"></canvas>
        </div>
    );
}

export default HomePage;
