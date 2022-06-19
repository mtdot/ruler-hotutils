import { Store } from "redux";
import { InjectedIntl } from "react-intl";
import { StateType } from "@gl-commonui/reducers/index";
import { OidcProxy, ensureIntlSupport, PrimaryLanguageLocale, PrimaryLanguageType, LoginIdType } from "@gl-commonui/index";
import * as querystring from 'query-string'
import pathToRegexp from 'path-to-regexp'
import { matchPath, RouteProps } from 'react-router-dom'
import * as Cookies from 'js-cookie';
import ReactGA from 'react-ga';
import * as moment from 'moment';
import * as Bowser from "bowser";
import { GLRegistrationLoginIdValidationLocalization, LoginId } from "@gl-commonui/components/gl-registration/Model";

export class GLGlobal {
    public static store: Store<StateType>
    public static intl: InjectedIntl
    public static processEnv = () => process.env;
    public static apiPrefix = () => GLGlobal.processEnv().apiPrefix
    public static multipleApiPrefixes = () => ''//process.env.multipleApiPrefixes
    public static portals = () => GLGlobal.processEnv().portals as any as { [key: string]: string }
    public static portalUrl = () => GLGlobal.processEnv().portalUrl
    public static authorityUrl = () => GLGlobal.processEnv().authorityUrl
    public static authorityClientId = () => GLGlobal.processEnv().authorityClientId
    public static authorityClientSecret = () => GLGlobal.processEnv().authorityClientSecret
    public static loginInfo = () => OidcProxy.getLoginInfo()
    public static refreshLoginInfo = () => OidcProxy.signinSilent()
    public static initGoogleAnalytics = () => ReactGA.initialize(GLGlobal.processEnv().googleAnalytics, { gaOptions: { cookieDomain: 'auto', siteSpeedSampleRate: 100 } });
    private static permissionInfo = () => OidcProxy.getPermissionInfo();
    public static isActionValid = (action: string, permissions?: string[]): boolean => { return permissions ? new Set(permissions).has(action) : new Set(GLGlobal.permissionInfo()).has(action); }
    public static workEnv = () => ({
        isDevelopment: () => GLGlobal.processEnv().WORK_ENV === 'uat',
        isTest: () => GLGlobal.processEnv().WORK_ENV === 'jptest',
        isProdction: () => GLGlobal.processEnv().WORK_ENV === 'pub',
    });
}
export class GLUtil {
    static queryStringify<T = any>(obj: T, opts?: { strict?: boolean, encode?: boolean, arrayFormat?: 'none' | 'bracket' | 'index' }): string {
        return querystring.stringify(obj, opts);
    }
    //query will be setted with browser url query string when query is undefined
    static queryParse<T = any>(query?: string, opts?: { arrayFormat?: 'none' | 'bracket' | 'index' }): T {
        query = query || GLUtil.parsePath().search;
        return querystring.parse(query, opts) as any as T;
    }
    static queryExtract(query: string): string {
        return querystring.extract(query);
    }
    //pathname could be router template that user defined in pathconfig.ts
    static pathStringify<T = any>(pathname: string, obj: T, opts?: { encode: (value) => any }): string {
        const toPath = pathToRegexp.compile(pathname);
        return toPath(obj as any, opts)
    }
    //location.path could be router template that user defined in pathconfig.ts
    //pathname will be setted with browser path string when pathname is undefined
    static pathParse<T = any>(location: { path: string, exact?: boolean, strict?: boolean, sensitive?: boolean } | string, pathname?: string): T {
        pathname = pathname || GLUtil.parsePath().pathname;
        const match = matchPath(pathname, location as RouteProps);
        return (match ? match.params : {}) as T;
    }
    static parsePath(path?: string) {
        var origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + '/#/';
        if (window.location.href.indexOf(origin) >= 0) {
            let pathname = path || window.location.href.substr(window.location.href.indexOf('#') + 1);
            let search = '';
            let hash = '';

            let hashIndex = pathname.indexOf('#');
            if (hashIndex !== -1) {
                hash = pathname.substr(hashIndex);
                pathname = pathname.substr(0, hashIndex);
            }

            let searchIndex = pathname.indexOf('?');
            if (searchIndex !== -1) {
                search = pathname.substr(searchIndex);
                pathname = pathname.substr(0, searchIndex);
            }

            return {
                pathname: pathname,
                search: search === '?' ? '' : search,
                hash: hash === '#' ? '' : hash
            };
        } else {
            return {
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
            }
        }

    }
    static isNullOrUndefined(obj: any): boolean {
        return obj === null || obj === undefined;
    }
    static getStaticImage(imgUrl: string) {
        if (!imgUrl) {
            throw 'image url is empty'
        }
        return imgUrl.startsWith("http") || imgUrl.startsWith("data:") ? imgUrl : `${GLGlobal.processEnv().CDN}${imgUrl}`;
    }
    static cookies: CookiesFn = { ...Cookies }

    static getCookie(cookieName) {
        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    static doImpersonate = () =>{
        if (!GLUtil.isImpersonating()) {
            GLUtil.removeImpersonationSwitchBackCode();
            return;
        }
        const code = GLUtil.getImpersonationSwitchBackCode();
        location.href = GLGlobal.processEnv().authorityUrl + "/Impersonation/SwitchBack?code=" + code.switchBackCode + "&uid=" + code.impersonatedByUserId;
    }

    static getImpersonationBackName = () =>{
        if (window.location.href.indexOf('https://test-') === 0) {
            return 'GrapeSeed.Impersonation.Back.Test';
        }
        return 'GrapeSeed.Impersonation.Back';
    }

    static getImpersonationSwitchBackCode() {
        const code = this.getCookie(GLUtil.getImpersonationBackName());
        if (!code || code && !code.trim().length) {
            return null;
        }

        const items = code.split('|');
        const name = items[0] ? items[0].replace('n=', '') : "";
        const switchBackCode = items[1] ? items[1].replace('c=', '') : "";
        const userId = items[2] ? items[2].replace('uid=', '') : "";

        return {
            impersonationUserName: name,
            switchBackCode: switchBackCode,
            impersonatedByUserId: userId
        }
    }
    static isImpersonating() {
        const code = this.getImpersonationSwitchBackCode();
        if (!code) {
            return false;
        }

        const loginInfo = GLGlobal.loginInfo();
        const currentUserId = loginInfo && loginInfo.profile ? loginInfo.profile.sub : '';
        return code.impersonatedByUserId && code.switchBackCode && code.impersonatedByUserId !== currentUserId;
    }
    static removeImpersonationSwitchBackCode() {
        const cookieOption = { domain: GLGlobal.processEnv().portalsDomain || GLGlobal.authorityUrl().replace(/.*?\.(.*?\.[com|net])/, "$1") };
        GLUtil.cookies.remove('GrapeSeed.Impersonation.Back', cookieOption);
    }

    static getCurrentSiteUrl(includedPath: boolean = true) {
        if (includedPath) {
            return location.href;
        }
        let onlySiteUrl = window.location.protocol + "//" + window.location.hostname;
        if (location.port) {
            onlySiteUrl += ":" + location.port;
        }
        return onlySiteUrl;
    }

    static setLocaleCookie(language) {
        if (language.startsWith('zh')) {
            language = 'zh-Hans';
        } else if (language.startsWith('ar')) {
            language = 'ar-SA';
        } else {
            language = language.split(/[_-]+/)[0];
        }
        const cookieOption = { domain: GLGlobal.processEnv().portalsDomain || GLGlobal.authorityUrl().replace(/.*?\.(.*?\.[com|net])/, "$1") };
        GLUtil.cookies.set('GrapeSeed.Culture', `c=${language}|uic=${language}`, cookieOption);
        const info = this.getCookie('GrapeSeed.Info');
        if (info && info.indexOf('|')) {
            const cookieInfo = info.split('|');
            const cookieValue = "language=" + language + "|" + cookieInfo[1];
            GLUtil.cookies.set('GrapeSeed.Info', cookieValue, cookieOption);
        }
    }

    static getLanguageFromCookie() {
        let culture = GLUtil.cookies.get('GrapeSeed.Culture');
        return culture ? (culture = culture.match(/^.*\|.*=(.*?)$/)[1], (culture.startsWith('zh') ? 'zh-cn' : culture)).toLowerCase() : '';
    }
    static arrayToArrayBuffer(array) {
        const buf = new ArrayBuffer(array.length);
        const bytes = new Uint8Array(buf);
        bytes.set(array);
        return buf;
    }
    static arrayBufferToArray(buf) {
        return Array.from(new Uint8Array(buf));
    }
    static arrayToBlob(array) {
        return new Blob([GLUtil.arrayToArrayBuffer(array)])
    }
    static blobToArray(blob, callback?) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                const arrayBuffer = this.result;
                const array = GLUtil.arrayBufferToArray(arrayBuffer);
                callback && callback(array);
                resolve(array);
            };
            fileReader.readAsArrayBuffer(blob);
        });
    }
    static isInternetExplorer() {
        return !!(document as any).documentMode;
    }
    static base64Encode(str) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }));
    }
    static base64Decode(str) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}
export interface IResourceOperation<T> {
    default(value?: T | any)
    create(value?: T | any)
    update(value?: T | any)
    delete(value?: T | any)
    select(value?: T | any)
}
export interface CookiesOptions {
    expires?: number | Date
    path?: string
    domain?: string
    secure?: boolean
}
export interface CookiesFn {
    set(name: string, value: any, options?: CookiesOptions)
    get()
    get(name: string)
    getJSON()
    getJSON(name: string)
    remove(name: string)
    remove(name: string, options?: CookiesOptions)
}
function nestedClone(myObj) {
    if (typeof (myObj) != 'object' || myObj == null) return myObj;
    let newObj = {};
    for (let i in myObj) {
        newObj[i] = nestedClone(myObj[i]);
    }
    return newObj;
}
export function SimplyProxy(target, handle) {
    let targetCopy = nestedClone(target);
    Object.keys(targetCopy).forEach((key) => {
        Object.defineProperty(targetCopy, key, {
            get: () => {
                return handle.get && handle.get(target, key);
            },
            set: (newVal) => {
                handle.set && handle.set();
                target[key] = newVal;
            }
        });
    })
    return targetCopy;
}

export class MergeDocHelper {
    static buildDoc(op, obj, path) {
        const arr: any[] = Object.getOwnPropertyNames(obj).map(key => {
            const value = obj[key];
            if (value === null || value === undefined) return [];
            if (value instanceof Object) {
                return MergeDocHelper.buildDoc(op, value, `${path}${key}/`);
            }
            return [{ op, path: `${path}${key}`, value }];
        });
        return arr.reduce((pre, cur) => pre.concat(cur));
    }

    //{a:1,b:{c:'2'}} -> [{op:'replace',path:'/a',value:1},{op:'replace',path:'/b/c',value:'2'}]
    static replace(obj: any, path: string = '/') {
        return MergeDocHelper.buildDoc('replace', obj, path);
    }
    
    //{a:1,b:{c:'2'}} -> [{op:'add',path:'/a',value:1},{op:'add',path:'/b/c',value:'2'}]
    static add(obj: any, path: string = '/') {
        return MergeDocHelper.buildDoc('add', obj, path);
    }
}

export function alignPop({ type, querySelector, getPopupContainer = (node) => node.parentElement }: { type?: string, querySelector?: string, getPopupContainer?: any } = {}) {
    const getContainer = (key) => {
        if (querySelector) {
            return { [key]: () => document.querySelector(querySelector) };
        } else {
            return { [key]: getPopupContainer };
        }
    }
    if (type === 'DatePicker') {
        return getContainer('getCalendarContainer')
    } else {
        return getContainer('getPopupContainer')
    }
}

export function isPC() {
    const userAgentInfo = navigator.userAgent;
    const Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
    let flag = true;
    Agents.forEach((v, k) => {
        if (userAgentInfo.indexOf(v) > 0) {
            return flag = false;
        }
    });
    return flag;
}

export function afterDate(date: moment.MomentInput = moment()) {
    return (current) => {
        return moment(current, 'YYYY/MM/DD').isAfter(moment(date, 'YYYY/MM/DD'));
    }
}
export function beforeDate(date: moment.MomentInput = moment()) {
    return (current) => {
        return moment(current, 'YYYY/MM/DD').isBefore(moment(date, 'YYYY/MM/DD'));
    }
}
export function betweenDate(min: moment.MomentInput = moment(), max: moment.MomentInput = moment()) {
    return (current) => {
        return moment(current, 'YYYY/MM/DD').isBetween(moment(min, 'YYYY/MM/DD'), moment(max, 'YYYY/MM/DD'));
    }
}

export function polyfillSupport() {
    return Promise.resolve({}).then(ensureIntlSupport)
}
export function openPage(pathname: string, query?: string) {
    let url = `${pathname}${query ? `?${query}` : ""}`;
    if (isPC()) {
        window.open(url);
    } else {
        document.location.href = url;
    }
}

export interface IBowser extends Bowser.Parser.Parser {

}
export function browser(userAgent?: string): IBowser {
    return Bowser.getParser(userAgent || window.navigator.userAgent);
}

export function isGuid(str: string) {
    return str && str.match(/[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}/) !== null;
}
export function isNumber(str: string) {
    return str && typeof str === 'string' && str.match(/(^[\-0-9][0-9]*(.[0-9]+)?)$/) !== null;
}
function buildPathTemplate(pathname: string) {
    if (pathname) {
        return pathname.split('/')
            .map((path: string) => {
                if (isGuid(path)) {
                    return '{guid}'
                }
                if (isNumber(path)) {
                    return '{number}'
                }
                return path
            }).join('/')
    }
    return pathname
}
export function convertToLanguageType(localeString: PrimaryLanguageLocale) {
    return ({
        [PrimaryLanguageLocale.English]: PrimaryLanguageType.English,
        [PrimaryLanguageLocale.Chinese]: PrimaryLanguageType.Chinese,
        [PrimaryLanguageLocale.Vietnamese]: PrimaryLanguageType.Vietnamese,
        [PrimaryLanguageLocale.Mongolian]: PrimaryLanguageType.Mongolian,
        [PrimaryLanguageLocale.Russian]: PrimaryLanguageType.Russian,
        [PrimaryLanguageLocale.Korean]: PrimaryLanguageType.Korean,
        [PrimaryLanguageLocale.Japanese]: PrimaryLanguageType.Japanese,
        [PrimaryLanguageLocale.Malaysia]: PrimaryLanguageType.Malaysia,
        [PrimaryLanguageLocale.Spanish]: PrimaryLanguageType.Spanish,
        [PrimaryLanguageLocale.Arabic]: PrimaryLanguageType.Arabic,
        [PrimaryLanguageLocale.Thai]: PrimaryLanguageType.Thai,
    }[localeString])
}
const CountryCode = "gl-common.countrycode";
export function removeCountryCode() {
    localStorage.removeItem(CountryCode);
}
export function setCountryCode(code) {
    return !!code && localStorage.setItem(CountryCode, code);
}
export function getCountryCode() {
    return localStorage.getItem(CountryCode) || '';
}
export function hasCountryCode() {
    return !!getCountryCode();
}
export function getLocationConfig() {
    return GLGlobal.processEnv().locationConfig as any
}
export function hasEnabledLocation() {
    const config = getLocationConfig();
    return config && config.enabled;
}
export function gaSendPageView({ path, pathTemplate }: { path?: string, pathTemplate?: string }) {
    ReactGA.ga()('set', 'page', pathTemplate ? pathTemplate : buildPathTemplate(path))
    ReactGA.ga()('send', 'pageview')
}
GLGlobal.initGoogleAnalytics();

export const mergeClasses = (...classes: string[]) => {
    return classes.filter(c => !!c).join(" ");
};

export const passwordValidationRegex = /^(?=.*\d)(?=.*\D).{8,}$/i
export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
export const emailStartRegex = /^_/;
export const phoneValidationRegex = /^\d{8,12}$/i


export const validateLoginId = (registrationLocalization: GLRegistrationLoginIdValidationLocalization, required: boolean = true) => {
    return (rule: any, value: LoginId, callback: (error?: any)=> void) => {
        if (
            !required &&
            (!value ||
                (value.type === LoginIdType.Email
                    ? !value.email || !value.email.length
                    : !value.phone || !value.phone.length))
        ) {
            callback();
            return;
        }
        let result = validateLoginIdCore(value, registrationLocalization);
        callback(result);
    }
};

export const validateLoginIdCore = (value: LoginId, registrationLocalization: GLRegistrationLoginIdValidationLocalization) : any => {
    if (value.type === LoginIdType.Email){
        if (!value.email)
            return registrationLocalization.emailPhoneRequired
        
        if (!emailRegex.test(value.email!))
            return registrationLocalization.emailFormatError;
        if (emailStartRegex.test(value.email.trim()))
            return registrationLocalization.emailStartError;
    }

    if (value.type === LoginIdType.Phone){
        if (!phoneValidationRegex.test(value.phone!))
            return registrationLocalization.phoneFormatError;
    }

    return undefined;
}