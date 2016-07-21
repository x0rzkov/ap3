import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

import {Facebook} from 'ionic-native';

/*
  Facebook Connect

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class FbConnect {
  fbconnectvars: any;
  iframewin: any;
  iframedoc: any;

  constructor(public http: Http) {

    this.fbconnectvars = {
      debug: false,
      login_scope: [ 'email','public_profile','user_friends'],
      l10n:{
        login_msg:'Thanks for logging in, {{USERNAME}}!',
        fetch_user_fail:'Sorry, login failed',
        not_authorized:'Please log into this app.',
        fb_not_logged_in:'Please log into Facebook.',
        wp_login_error:'WordPress login error',
        login_fail:'Login error, please try again.'
      }
    }

  }

  // init() {

  //   let debug = this.fbconnectvars.debug;

  //   // (<any>) syntax is to avoid typescript errors
  //   this.iframedoc = (<any>document.getElementById('ap3-iframe')).contentWindow.document;
  //   this.iframewin = (<any>document.getElementById('ap3-iframe')).contentWindow.window;
      
  //   if( typeof this.iframewin.apppfb == 'undefined' ) {
  //     return;
  //   }

  //   if( typeof this.iframewin.apppfb.l10n !== 'undefined' ) {
  //     this.fbconnectvars.l10n = this.iframewin.apppfb.l10n
  //   }

  //   let fbParams: FacebookInitParams = {
  //     appId: this.iframewin.apppfb.app_id,
  //     xfbml: true,
  //     version: 'v2.6'
  //   }

  //   this.FB.init( fbParams );

  // }

  login() {

    Facebook.login( this.fbconnectvars.login_scope ).then( result => {
      // we get back an auth response here, should save it or something
      console.log(result);
    });

    // return false; // so not to submit the form
  }

  // This is called with the results from from FB.getLoginStatus().
  statusChangeCallback(response) {

    console.log('statusChangeCallback', response);

    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      this.fbMe();
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.not_authorized;
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.fb_not_logged_in;
    }
  }

  fbMe() {

    /*
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
       *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
       *  params:  queryString parameters as a map - Optional
       *  success: callback function when operation succeeds - Optional
       *  error:   callback function when operation fails - Optional
     */

    // let loginOptions: FacebookApiMethod = { post: 1 };

    // this.FB.api( 
    //   "/me",
    //   loginOptions,
    //   {fields:this.iframewin.apppfb.me_fields}
    // ).then( response => {
    //   this.fetchUser_Callback(response);
    // });
  }

  // This function is called after a callback
  // from retreiving the user's email and fb_id
  fetchUser_Callback(response) {

    console.log('fetchUser_Callback', response);
    
    if( this.iframedoc.getElementById('status') ) {
      this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.login_msg.replace('{{USERNAME}}', response.name);
    }
    // Send user info to WordPress login function
    if( typeof response.name != 'undefined' && typeof response.email != 'undefined') {
      this.wplogin( response.name, response.email ).then( data => {

        // successfully logged in
        let context = this.iframewin.location.pathname.substring(0, this.iframewin.location.pathname.lastIndexOf("/"));
        let baseURL = this.iframewin.location.protocol + '//' + this.iframewin.location.hostname + (this.iframewin.location.port ? ':' + this.iframewin.location.port : '') + context;
        let app_ver = ( this.iframewin.apppCore.ver ) ? this.iframewin.apppCore.ver : '2';

        if(data && data.redirect_url) {
          let redirect_url = data.redirect_url;
          if( redirect_url.indexOf('?') === -1 && redirect_url.indexOf('appp=') === -1 ) {
            this.iframewin.location.href = redirect_url+ "?appp=" + app_ver;
            return;
          } else if( redirect_url.indexOf('appp=') === -1 ) {
            this.iframewin.location.href = redirect_url+ "&appp=" + app_ver;
            return;
          } else {
            this.iframewin.location.href = data.redirect_url;
            return;
          }
        }

        this.iframewin.location.href = baseURL + "?appp=" + app_ver;
      });
    } else {
      console.log( response );
    }
  }

  // This function is called after a callback
  // from retreiving the user's email and fb_id
  fetchUser_CallbackError(response) {

    console.log( response );
    this.iframedoc.getElementById('status').innerHTML = this.fbconnectvars.l10n.fetch_user_fail;
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  checkLoginState() {
    Facebook.getLoginStatus().then( result => {
      this.statusChangeCallback(result);
    })
  }

  /* Returns promise.
   * Usage: this.wplogin(name,email).then( response => { // do something });
   */
  wplogin( name, email ) {

    let options = {
      'action':'appp_wp_fblogin',
      'user_email': email,
      'security' : this.iframewin.apppfb.security,
      'full_name': name,
     }

    return new Promise(resolve => {

      this.http.get( this.iframewin.apppCore.ajaxurl, options )
        .map(res => res.json())
        .subscribe(
          data => {
          console.log(data);
          resolve(data);
          },
          error => alert(this.fbconnectvars.l10n.wp_login_error) 
        );
    });

  }

}