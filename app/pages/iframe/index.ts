import {NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
// import customIframe from '../../components/iframe/index';


@Component({
    templateUrl: 'build/pages/iframe/index.html'
})
export default class {
    title: string;
    url: string;
    iframe: any;
    constructor(private navParams: NavParams) {
        this.title = navParams.data.title;
        this.url = navParams.data.url;
        console.log('navParams.data', navParams.data)
    }
    iframeLoaded(e) {
        console.log('iframeLoaded', e)
    }
    activityModal() {
        this.iframe = document.getElementById('ap3-iframe').contentWindow;
        this.iframe.postMessage('activity', '*');
    }
}