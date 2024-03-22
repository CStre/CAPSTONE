import './Loader.css';
import React from 'react';

function Loader() {
    return (
        <html>
            <body>
                <div class="spinner-box">
                    <div class="blue-orbit leo">
                    </div>
                    <div class="green-orbit leo">
                    </div>
                    <div class="red-orbit leo">
                    </div>
                    <div class="white-orbit w1 leo">
                    </div><div class="white-orbit w2 leo">
                    </div><div class="white-orbit w3 leo">
                    </div>
                </div>
            </body>
        </html>
    )
}

export default Loader;