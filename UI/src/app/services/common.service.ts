import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  public toogleThemeS: Subject<boolean> = new Subject<boolean>();
  private isRemember: boolean = false;
  private isLogged: boolean = false;
  constructor() {
    const isRemember = !!localStorage.getItem('monsta-rememberLogin')
      ? localStorage.getItem('monsta-rememberLogin')
      : null;
    if (isRemember == 'true') {
      this.isLogged = true;
      localStorage.setItem('monsta-isAuthenticated', 'true');
    }
  }
  public isAuthenticated = () => this.isLogged;
  public isJSONString = (str: string): boolean => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };
  public isValidArray(arr: any): boolean {
    if (Array.isArray(arr)) {
      return arr.length > 0;
    }
    return false;
  }
  public filterHyperlinks(text: any) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
      /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;']*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = text.replace(
      replacePattern1,
      '<a href="$1" target="_blank">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank">$2</a>'
    );

    //Change email addresses to mailto:: links.
    replacePattern3 =
      /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(
      replacePattern3,
      '<a href="mailto:$1">$1</a>'
    );

    return replacedText;
  }

  isValidHttpUrl(str: string) {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  isValidUrlWithoutScheme(str: string) {
    const regex = new RegExp(
      '^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?'
    );
    const without_regex = new RegExp(
      '^([0-9A-Za-z-\\.@:%_+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?'
    );

    return regex.test(str) || without_regex.test(str);
  }
}
