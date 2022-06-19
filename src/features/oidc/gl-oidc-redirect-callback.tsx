import * as React from 'react'
import { Route } from "react-router-dom";
import { OidcProxy, OidcCallbackPath } from './index';
import { RoutePipeline, GLRouteComponentProps, GLGlobal, IRouteHandler } from '@gl-commonui/index';
// import { signin, signout } from '@gl-commonui/states/oidc';
// import { diagnosticLogError } from '@gl-commonui/service/diagnosticsservice';
import { gaSendPageView, GLUtil, hasEnabledLocation, hasCountryCode, removeCountryCode } from './utility';
// import { storeRegionCountryCode } from '@gl-commonui/service/locationservice';

export function OidcSigninCallback({ history }) {
    OidcProxy.signinRedirectCallback().then((user) => {
        try {
            const page = OidcProxy.getPageAfterSignin();
            OidcProxy.setLoginInfo(signin(user), (loginInfo) => {

                const replaceToSite = () => locationReplace(page ? page.afterSignin || page.shouldSignin : '/');

                try {

                    if (hasEnabledLocation() && !hasCountryCode()) {

                        storeRegionCountryCode(loginInfo)
                            .then(_ => {
                                replaceToSite();
                            })
                            .catch(e => {
                                replaceToSite();
                                console.log(e);
                            });

                    } else {
                        return replaceToSite()
                    }
                } catch (e) {
                    replaceToSite()
                }

            });
        } catch (e) {
            locationReplace('/')
        }
    }).catch((e) => {
        diagnosticLogError({ error: e })
        console.error(e);
    });
}
function isTokenExpired() {
    const { getTokenParam } = OidcProxy.getTokenUrlParams();
    const exp = getTokenParam('id_token').exp;
    return !GLUtil.isNullOrUndefined(exp) && new Date(exp * 1000) < new Date();
};
function varifySession() {
    if (isTokenExpired()) {
        const abortSignin = () => {
            locationReplace('/');
            return Promise.reject();
        }
        return OidcProxy.clearState()
            .then(_ => abortSignin())
            .catch(_ => abortSignin());
    }
    OidcProxy.trySetSigninVerifyToken();
    return Promise.resolve();
}
function locationReplace(pageUrl: string) {
    window.location.replace(buildUrl(pageUrl))
}
function buildSuffix(suffix: string, key: string) {
    return suffix ? (suffix.startsWith(key) ? suffix : `${key}${suffix}`) : ''
}
function buildUrl(pageUrl: string) {
    try {
        if (typeof pageUrl === 'string') {
            return pageUrl
        } else {
            const { pathname, search, hash } = pageUrl as { pathname: string, search: string, hash: string };
            return `${pathname}${buildSuffix(search, '?')}${buildSuffix(hash, '#')}`
        }
    } catch (e) {
        diagnosticLogError({ error: e, message: 'buildUrl' })
        console.error(e);
        return '/'
    }
}
export function OidcSigninSilentCallback({ history }) {
    OidcProxy.signinSilentCallback().then(() => {
        console.log('signinSilentCallback');
    }).catch((e) => {
        console.error(e);
    });
}

export function OidcSignoutCallback({ history }) {
    OidcProxy.signoutRedirectCallback().then((err) => {
        OidcProxy.clearSignStorage();
        const page = OidcProxy.getPageAfterSignout();
        locationReplace(page ? page.afterSignout || page.currentSignout : '/')
    }).catch((e) => {
        console.error(e);
    });
}

export function OidcSSoSignoutCallback() {
    console.log('OidcSSoSignoutCallback');
    OidcProxy.clearState();
}

/**
 * Clears application specific data from local storage.
 */
export function clearAppLocalStorageData() {
    try {
        removeCountryCode();
    } catch (e) {
        console.error(e);
    }
}

class GARouteHandler implements IRouteHandler {
    constructor() { }
    next: IRouteHandler;
    invoke(context) {
        gaSendPageView({ pathTemplate: context.match.path })
        this.next.invoke(context);
    }
}
const gaRouteHandler = new GARouteHandler();

const OidcDefaultCallbackRoutes = [
    <Route render={(props: GLRouteComponentProps) => {
        props.handlers = [gaRouteHandler, { invoke: (context) => { varifySession().then(() => { OidcSigninCallback(context) }) } }]
        return <RoutePipeline {...props}></RoutePipeline>
    }} key={OidcCallbackPath.signin} path={OidcCallbackPath.signin} exact ></Route>,
    <Route render={(props: GLRouteComponentProps) => {
        props.handlers = [gaRouteHandler, { invoke: (context) => OidcSignoutCallback(context) }]
        return <RoutePipeline {...props}></RoutePipeline>
    }} key={OidcCallbackPath.signout} path={OidcCallbackPath.signout} exact ></Route>,
    <Route render={(props: GLRouteComponentProps) => {
        props.handlers = [{ invoke: () => OidcSSoSignoutCallback() }]
        return <RoutePipeline {...props}></RoutePipeline>
    }} key={OidcCallbackPath.ssoSignout} path={OidcCallbackPath.ssoSignout} exact ></Route>,
    <Route render={(props: GLRouteComponentProps) => {
        props.handlers = [{ invoke: (context) => OidcSigninSilentCallback(context) }]
        return <RoutePipeline {...props}></RoutePipeline>
    }} key={OidcCallbackPath.signinSilent} path={OidcCallbackPath.signinSilent} exact ></Route>
]
export { OidcDefaultCallbackRoutes }