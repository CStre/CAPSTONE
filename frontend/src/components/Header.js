import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; 

import './Header.css';
import '../index.css';

function Header() {
    useEffect(() => {
        const link = document.querySelectorAll('.item');

        const animateit = function (e) {
            const span = this.querySelector('lord-icon');
            const { offsetX: x, offsetY: y } = e;
            const { offsetWidth: width, offsetHeight: height } = this;

            const move = 2;
            const xMove = (x / width) * (move * 10) - move;
            const yMove = (y / height) * (move * 0) - move;

            span.style.transform = `translate(${xMove}px, ${yMove}px)`;

            if (e.type === 'mouseleave') span.style.transform = '';
        };

        link.forEach(b => b.addEventListener('mousemove', animateit));
        link.forEach(b => b.addEventListener('mouseleave', animateit));

        return () => {
            link.forEach(b => b.removeEventListener('mousemove', animateit));
            link.forEach(b => b.removeEventListener('mouseleave', animateit));
        };
    }, []);

    useEffect(() => {
        document.body.classList.add('item');
        return () => {
            document.body.classList.remove('item');
        };
    }, []);

    return (
        <nav>
            <Link className="item" to="/learn">
                <lord-icon
                    src="https://cdn.lordicon.com/mrikdaqa.json"
                    trigger="hover"
                    stroke="bold"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>Learn</Link>
            <Link className="item" to="/prototype">
                <lord-icon
                    src="https://cdn.lordicon.com/fttvwdlw.json"
                    trigger="hover"
                    stroke="bold"
                    state="hover-roll"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>Benchmark</Link>
            <Link className="item" to="/credits">
                <lord-icon
                    src="https://cdn.lordicon.com/gqjpawbc.json"
                    trigger="hover"
                    stroke="bold"
                    state="hover-burst"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>Credits</Link>
            <div className="item">
                <lord-icon
                    src="https://cdn.lordicon.com/teofqznt.json"
                    trigger="hover"
                    stroke="bold"
                    colors="primary:#ffffff,secondary:#06c56d"
                    style={{ width: '50px', height: '50px' }}
                ></lord-icon>Account
                <div className="dropdown">
                    <div>
                        <Link to="/dashboard">
                            <lord-icon
                                src="https://cdn.lordicon.com/eaexqthn.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>Account</Link>
                        <Link to="/dashboard">
                            <lord-icon
                                src="https://cdn.lordicon.com/pbkmxonw.json"
                                trigger="hover"
                                state="morph-unfold"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>Dashboard</Link>
                        <Link to="/preferences">
                            <lord-icon
                                src="https://cdn.lordicon.com/kjjbpuhp.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#ffffff,secondary:#06c56d"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>Preferences</Link>
                        <Link className="logout" to="/logout">
                            <lord-icon
                                src="https://cdn.lordicon.com/lbjtvqiv.json"
                                trigger="hover"
                                stroke="bold"
                                colors="primary:#c71f16,secondary:#c71f16"
                                style={{ width: '30px', height: '30px' }}
                            ></lord-icon>Logout</Link>
                    </div>
                </div>
            </div>
            <div className="underline"></div>
        </nav>
    );
}

export default Header;
