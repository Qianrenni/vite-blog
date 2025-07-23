import {defineStore} from 'pinia';

export const useStatusBarStore = defineStore('statusBar', {
    state: () => ({
        statusBarHeight: 0
    }),
    actions: {
        setStatusBarHeight(height: number) {
            this.statusBarHeight = height ?? this.statusBarHeight;

            const root = document.querySelector(':root');
            if (root && window) {
                const windowHeight = window.innerHeight;
                const rootElement = root as HTMLElement;
                rootElement.style.setProperty('--content-height-without-header', `${windowHeight - this.statusBarHeight- 30}px`);
                rootElement.style.setProperty('--content-height-2', `${windowHeight - this.statusBarHeight - 85}px`);
                console.log('windowHeight', windowHeight);
            }
        },
        resetContentHeight() {
            const root = document.querySelector(':root');
            if (root && window) {
                const windowHeight = window.innerHeight;
                const rootElement = root as HTMLElement;
                rootElement.style.setProperty('--content-height-without-header', `${windowHeight}px`);
                rootElement.style.setProperty('--content-height-2', `${windowHeight - 30}px`);
                console.log('resize',rootElement.style.getPropertyValue('--content-height-without-header'));
                console.log('resize',rootElement.style.getPropertyValue('--content-height-2'));
            }
        }
    },
    getters: {
        getStatusBarHeight: (state) => state.statusBarHeight
    }
})