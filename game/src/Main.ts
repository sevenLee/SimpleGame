/// <reference path="./core/tsDefinitions/mini-signals.d.ts" />
/// <reference path="./core/tsDefinitions/howler-modified.d.ts" />

import { DOMContent } from './core/DOMContent';
import { Application } from './Application';

window.onload = () => {
    DOMContent.setPageTitle('SimpleGame');
    let game = new Application( );
    document.getElementById('mainContainer').appendChild( game.pixi.view );
};

