/**
 * @fileoverview This is the componenet for the loading icon that dynamically appears and disappears
 * @author Collin Streitman
 * @created 01.24.2024
 * @lastModified By Collin Streitman on 04.26.2024
 *
 * This component was largely sourced from an public GitHub repositiory and is properly sourced
 * in the credits component
 */

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