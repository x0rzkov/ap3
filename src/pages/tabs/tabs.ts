import {Component, OnInit, HostListener} from '@angular/core';
import {NavParams, IonicPage, ModalController, NavController} from 'ionic-angular';

import {Iframe} from "../iframe/iframe";

class ModalOptions {
	public cssClass?: string;
	public title?: string;
}

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  tabs: Array<any> = [];
  mySelectedIndex: number;
  login_modal: any;
  login_modal_open = false;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    public nav: NavController
  ) {}

  ngOnInit() {
    this.mySelectedIndex = this.navParams.data.tabIndex || 0;

    // root=null if opening in the IAB
    for(let tab of this.navParams.data) {
      let target = this.maybeOpenIAB(tab);
      if(target) {
        tab.root = null;
        tab.target = target;
      }
      if(typeof(tab.extra_classes) !== 'undefined' && (tab.extra_classes.indexOf('loginmodal') >= 0||tab.extra_classes.indexOf('logoutmodal') >= 0)) {
        tab.root = null;
      }
      this.tabs.push(tab);
    }

  }

  onIonSelect($event, tab) {
    if(tab.url && tab.target) {
      this.openIab(tab.url, tab.target);
    }
    if(typeof(tab.extra_classes) !== 'undefined' && (tab.extra_classes.indexOf('loginmodal') >= 0||tab.extra_classes.indexOf('logoutmodal') >= 0)) {
      this.loginModal({title:tab.title});
    }
  }

  loginModal(opt?: ModalOptions) {

		const css = (opt && opt.cssClass) ? opt.cssClass : '';
		const params = (opt && opt.title) ? {title: opt.title} : {};
	
		this.login_modal = this.modalCtrl.create('LoginModal', params, {
			cssClass: css
		});

		this.login_modal.onDidDismiss(data => {
			this.login_modal_open = false;
		});

		if( this.login_modal_open === false) {
			this.login_modal_open = true;
			this.login_modal.present();
		}
	}

  maybeOpenIAB(tab) {

    if (
      tab.extra_classes &&
      (tab.extra_classes.indexOf('system') >= 0 || tab.extra_classes.indexOf('external') >= 0) &&
      tab.url &&
      tab.url.indexOf('http') === 0
    ) {
      return this.getIabTarget(tab.extra_classes);
    }

    return false;
  }

  getIabTarget(extra_classes) {
    if(extra_classes.indexOf('system') >= 0) {
      return '_system';
    } else if(extra_classes.indexOf('external') >= 0) {
      return '_blank';
    }
    return false;
  }

  openIab( link, target, options = null ) {
    
    window.open(link, target, options );

  }

  // ng2 way of adding a listener
  @HostListener('window:message', ['$event'])

  onMessage(event) {
    this.myListeners(event)
  }

  myListeners(e) {

    // if it's not our json object, return
    if (e.data.indexOf('{') != 0)
      return;

    var data = JSON.parse(e.data);

    if( data.apppage && data.apppage.root ) {

      console.log('from tabs.ts', data)

      let page = { title: ( data.title ? data.title : '' ), component: Iframe, url: data.apppage.url, classes: null, page_type: null, type: null };
      // for learndash, when we have a redirect
      this.nav.popToRoot({animate: false}).then( ()=> {
        this.nav.push( Iframe, page );
      })

    }

  }

}
