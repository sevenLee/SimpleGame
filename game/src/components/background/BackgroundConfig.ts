import { IBackgroundConfig } from './IBackgroundConfig';

export class BackgroundConfig implements IBackgroundConfig {
    public name = 'background';
    public portraitBackground = 'assets/background/Base_Portrait.png';
    public landscapeBackground = 'assets/background/Base_Landscape.png';
}