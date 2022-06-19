import { GLUtil, GLGlobal } from '@gl-commonui/utility/utility';
import { addLocaleData } from "react-intl";
import * as en from 'react-intl/locale-data/en'
import * as zh from 'react-intl/locale-data/zh'
import * as ru from 'react-intl/locale-data/ru'
import * as vi from 'react-intl/locale-data/vi'
import * as mn from 'react-intl/locale-data/mn'
import * as ms from 'react-intl/locale-data/ms'
import * as ja from 'react-intl/locale-data/ja'
import * as ko from 'react-intl/locale-data/ko'
import * as es from 'react-intl/locale-data/es'
import * as ar from 'react-intl/locale-data/ar'
import * as th from 'react-intl/locale-data/th'
import * as mm from 'react-intl/locale-data/my'

import * as moment from 'moment';
import 'moment/locale/zh-cn';
import 'moment/locale/ru';
import 'moment/locale/vi';
import 'moment/locale/ms';
import 'moment/locale/ja';
import 'moment/locale/ko';
import 'moment/locale/es';
import 'moment/locale/th';
import 'moment/locale/my';

import antdZh from "antd/es/locale-provider/zh_CN"
import antdRu from "antd/es/locale-provider/ru_RU"
import antdVi from "antd/es/locale-provider/vi_VN"
import antdMn from "./mn_MN"
import antdMs from "./ms_MS"
import antdJa from "antd/es/locale-provider/ja_JP"
import antdKo from "./ko"
import antdEs from "antd/es/locale-provider/es_ES"
import antdAr from "antd/es/locale-provider/ar_EG"
import antdTh from "antd/es/locale-provider/th_TH"


import { GLLocale } from "./localeid"
import { PrimaryLanguageLocale } from '..';

export interface LocalePackage {
    locale?: string
    messages?: any
    antd?: any
}
export { GLLocale }
export function getLocale(language): Promise<LocalePackage> {
    if (!language) {
        language = GLUtil.getLanguageFromCookie() || navigator.language || 'en-US';
    }
    language = formatLocaleCode(language);
    //begin --- change es,ar-sa to en by school site for now
    if ((location.hostname.indexOf("school") >= 0 || location.hostname.indexOf("report") >= 0 || location.hostname.indexOf("gsadmin") >= 0)
        && (language == 'es' || language == 'ar-sa')) {
        language = 'en'
    }
    //end
    GLUtil.setLocaleCookie(language);
    return new Promise((resolve, reject) => {
        switch (language) {
            case 'zh-cn':
                addLocaleData(zh);
                moment.locale('zh-cn');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/zh.js')
                    resolve({
                        locale: language,
                        messages: require("./zh-cn.json"),
                        antd: antdZh
                    })
                }, 'zh-cn.json');
                break;
            case 'ru':
                addLocaleData(ru);
                moment.locale('ru');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/ru.js')
                    resolve({
                        locale: language,
                        messages: require("./ru.json"),
                        antd: antdRu
                    })
                }, 'ru.json');
                break;
            case 'vi':
                addLocaleData(vi);
                moment.locale('vi');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/vi.js')
                    resolve({
                        locale: language,
                        messages: require("./vi.json"),
                        antd: antdVi
                    })
                }, 'vi.json');
                break;
            case 'mn':
                addLocaleData(mn);
                //Mogolian local file not in moment local files
                moment.locale('mn', antdMn.CalendarFormater);
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/mn.js')
                    resolve({
                        locale: language,
                        messages: require("./mn.json"),
                        antd: antdMn
                    })
                }, 'mn.json');
                break;
            case 'ms':
                addLocaleData(ms);
                //Mogolian local file not in moment local files
                moment.locale('zh-cn');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/zh.js')
                    resolve({
                        locale: language,
                        messages: require("./ms.json"),
                        antd: antdMs
                    })
                }, 'ms.json');
                break;
            case 'ja':
                addLocaleData(ja);
                moment.locale('ja');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/ja.js')
                    resolve({
                        locale: language,
                        messages: require("./ja.json"),
                        antd: antdJa
                    })
                }, 'ja.json');
                break;
            case 'ko':
                addLocaleData(ko);
                moment.locale('ko');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/ko.js')
                    resolve({
                        locale: language,
                        messages: require("./ko.json"),
                        antd: antdKo
                    })
                }, 'ko.json');
                break;
            case 'es':
                addLocaleData(es);
                moment.locale('es');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/es.js')
                    resolve({
                        locale: language,
                        messages: require("./es.json"),
                        antd: antdEs
                    })
                }, 'es.json');
                break;
            case 'ar-sa':
                addLocaleData(ar);
                moment.locale('ar-sa');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/ar.js')
                    resolve({
                        locale: language,
                        messages: require("./ar-sa.json"),
                        antd: antdAr
                    })
                }, 'ar-sa.json');
                break;
            case 'th':
                addLocaleData(th);
                moment.locale('th');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/th.js')
                    resolve({
                        locale: language,
                        messages: require("./th.json"),
                        antd: antdTh
                    })
                }, 'th.json');
                break;
            case 'my':
                addLocaleData(mm);
                moment.locale('my');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/my.js')
                    resolve({
                        locale: language,
                        messages: require("./my.json"),
                        antd: null
                    })
                }, 'my.json');
                break;
            case 'en':
            default:
                addLocaleData(en);
                moment.locale('en');
                require.ensure([], () => {
                    isSupportIntl() || require('intl/locale-data/jsonp/en.js')
                    resolve({
                        locale: language,
                        messages: require("./en.json"),
                        antd: null
                    })
                }, 'en.json');
                break;
        }
    })
}
export function formatLocaleCode(language: string): PrimaryLanguageLocale {
    
    // Fallback language as English
    if (!language) {
        return PrimaryLanguageLocale.English
    };
    
    // Handling of Chinese/Arabic browser locale codes
    language = language.toLowerCase().replace('_', '-');
    const locale = SpecialCodeMap[language] || language.split(/[_-]+/)[0];

    // Check whether the finalized local does exists in our application
    if((<any>Object).values(PrimaryLanguageLocale).includes(locale)) {
        return locale;
    }

    // Fallback language as English
    return PrimaryLanguageLocale.English;
}
export function isSupportIntl() {
    return !!(window as any).Intl
}
export function ensureIntlSupport() {
    if (isSupportIntl()) return Promise.resolve({});
    return import("intl");
}
export enum SpecialCodeMap {
    'zh-cn' = 'zh-cn',
    'ar-sa' = 'ar-sa'
}

export enum LanguageLocale {
    en = 'English',
    'zh-cn' = '中文',
    ms = '中文(马来西亚)',
    ja = '日本語',
    ko = '한국어',
    ru = 'Русский',
    vi = 'Tiếng Việt',
    es = 'Español',
    mn = 'Монгол',
    'ar-sa' = 'العربية',
    th = 'ภาษาไทย',
    my = 'Myanmar'
}