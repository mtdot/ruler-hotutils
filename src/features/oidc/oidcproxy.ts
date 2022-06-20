import Oidc from 'oidc-client';
import { GLGlobal, GLUtil } from './utility';
import { clearAppLocalStorageData } from './gl-oidc-redirect-callback';
// import { IRouteHandler, RouteHandlerContext, PermissionService, UserService, PathConfig, diagnosticLogError, logError } from '@gl-commonui/index';
// import { signin, signout } from '@/stores/oidc';
import { useOidcState } from '@/stores/oidc';
import { Location } from 'history';
import { PathConfig } from '@/config';
// import { ResourcePropagation } from '@gl-commonui/service';
// import { ResourcePermissionType } from '@gl-commonui/utility';
// import { setSplash } from '@gl-commonui/states';

export interface Role {
  id: string;
  name: string;
}

export interface Profile extends Oidc.Profile {
  amr: string[];
  auth_time: number;
  email: string;
  idp: string;
  name: string;
  sid: string;
  sub: string;
  roles: string[];
  roleInfos: Role[];
  actions: string[];
  [prop: string]: any;
  avatarUrl?: string;
}

export enum OidcStorageKeys {
  pageaftersignin = 'bpr-oidc-pageaftersignin',
  pageaftersignout = 'bpr-oidc-pageaftersignout',
  logininfo = 'bpr-oidc-logininfo',
}

export interface OidcProxySettings extends Oidc.UserManagerSettings { }

export interface LoginInfo extends Oidc.User {
  profile: Profile;
  loggedin?: boolean;
}

class ClientStorage {
  constructor(private logger: Console) { }
  private getStorage(storage: Storage, key: string) {
    try {
      return storage.getItem(key);
    } catch (error) {
      this.logger.warn(error);
      return null;
    }
  }
  private setStorage(storage: Storage, key: string, value: string) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (error) {
      this.logger.warn(error);
      return false;
    }
  }
  private removeStorage(storage: Storage, key: string) {
    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      this.logger.warn(error);
      return false;
    }
  }
  private getStorageLength(storage: Storage) {
    try {
      return storage.length;
    } catch (error) {
      this.logger.warn(error);
      return 0;
    }
  }
  private getStorageByIndex(storage: Storage, index: number) {
    try {
      return storage.key(index);
    } catch (error) {
      this.logger.warn(error);
      return null;
    }
  }
  private getStorageKeys(storage: Storage) {
    try {
      return Object.getOwnPropertyNames(storage);
    } catch (error) {
      this.logger.warn(error);
      return [];
    }
  }
  get length() {
    var value = 0;
    value = this.getStorageLength(sessionStorage);
    if (value === 0) {
      value = this.getStorageLength(localStorage);
    }
    return value;
  }
  keys() {
    var value = [];
    value = this.getStorageKeys(sessionStorage);
    if (value.length === 0) {
      value = this.getStorageKeys(localStorage);
    }
    return value;
  }
  key(index: number) {
    var value = null;
    value = this.getStorageByIndex(sessionStorage, index);
    if (value == null) {
      value = this.getStorageByIndex(localStorage, index);
    }
    return value;
  }
  getItem(key: string) {
    var value = null;
    value = this.getStorage(sessionStorage, key);
    if (value == null) {
      value = this.getStorage(localStorage, key);
    }
    return value;
  }
  setItem(key: string, value: string) {
    var success = false;
    success = this.setStorage(sessionStorage, key, value);
    success = this.setStorage(localStorage, key, value);
    return success;
  }
  removeItem(key: string) {
    var success = false;
    success = this.removeStorage(sessionStorage, key);
    success = this.removeStorage(localStorage, key);
    return success;
  }
  removeOidc() {
    try {
      this.keys()
        .filter(
          (key) =>
            key.startsWith('oidc.') || key.startsWith('gl.cdio.') || key.startsWith('signinstateid')
        )
        .forEach((key) => {
          this.removeItem(key);
        });
    } catch (error) {
      console.warn(error);
    }
  }
}
const root = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''
  }/#/`;
const defaultSettings = {
  authority: GLGlobal.authorityUrl(),
  client_id: GLGlobal.authorityClientId(),
  client_secret: GLGlobal.authorityClientSecret(),
  redirect_uri: `${root}oidc/signin#`,
  silent_redirect_uri: `${root}oidc/signin-silent#`,
  response_type: 'id_token token',
  scope: 'openid profile basicinfo offline_access',
  post_logout_redirect_uri: `${root}oidc/signout`,
  userStore: new Oidc.WebStorageStateStore({ store: new ClientStorage(console) }),
  stateStore: new Oidc.WebStorageStateStore({ store: new ClientStorage(console) }),
  clockSkew: 3600,
};

const { loginInfo, signin, signout } = useOidcState();
let mgr: Oidc.UserManager;
export class OidcProxy {
  static accessToken: string | null = null;
  static createOidcProxy(settings?: OidcProxySettings) {
    settings = { ...defaultSettings, ...settings };
    mgr = new Oidc.UserManager(settings);
    mgr.events.addAccessTokenExpired(function () {
      console.log('addAccessTokenExpired');
    });
    mgr.events.addUserSignedOut(() => {
      // when sso signout
      console.log('addUserSignedOut');
      OidcProxy.clearSignStorage();
    });
  }
  static clearSignStorage() {
    signout();
    OidcProxy.setLoginInfo(loginInfo);
    clearAppLocalStorageData();
    return OidcProxy.clearState();
  }

  static isExpired({ expires_at, expired }: LoginInfo) {
    if (expired === undefined && expires_at) {
      return expires_at - Math.floor(Date.now() / 1000) <= 0;
    }
    return expired;
  }

  // static getExpiringInMinutes({ expires_at, expired }: LoginInfo): any {
  //     if (expired === undefined && expires_at) {
  //         return Math.floor((expires_at - Math.floor(Date.now() / 1000)) / 60);
  //     }

  //     return null;
  // }

  static processUser(user: LoginInfo | null) {
    if (user && !OidcProxy.isExpired(user)) {
      if (!user.profile.roles || user.profile.roles.length === 0) {
        const role = user.profile.role;
        user.profile.roles = role ? (role instanceof Array ? role : [role]) : [];
        user.profile.roleInfos = (
          user.profile.roleinfos ? JSON.parse(user.profile.roleinfos) : []
        ).map((info: Role) => ({ id: info.id, name: info.name }));
      }
      return { ...user, loggedin: true };
    }
    return {
      ...user,
      loggedin: false,
      profile: {
        roles: [],
        roleInfos: [],
        actions: [],
        avatarUrl: null,
      }
    };
  }
  static getUser(): Promise<LoginInfo> {
    return mgr
      .getUser()
      .then((user) => Promise.resolve(OidcProxy.processUser(user as LoginInfo)) as any);
  }
  static signinRedirect(args?: undefined): Promise<any> {
    // // Add extra parameter in request for codelogin
    // const extraParams = localStorage.getItem("codeloginstart") ? {extraQueryParams: { from: "codelogin"}} : {};
    // extraParams.extraQueryParams && localStorage.removeItem("codeloginstart"); // Remove Item as we have detected the codelogin
    // args = args ? Object.assign({}, args, extraParams) : extraParams.extraQueryParams ? extraParams : undefined; // merge args and extraParams
    // return mgr.signinRedirect(args);

    return mgr.signinRedirect(undefined);
  }
  static signinRedirectCallback(url?: string): Promise<LoginInfo> {
    return mgr.signinRedirectCallback(url).then((user) => Promise.resolve(user as LoginInfo));
  }

  // TODO: ?
  static getTokenUrlParams() {
    var vals = window.location.hash.replace(/^#?(.*)$/, '$1').split('&');
    var getParam = (key: string) => {
      var params = vals.filter((p) => p.startsWith(`${key}=`)).map((p) => p.split('=')[1]);
      return params.length > 0 ? params[0] : null;
    };
    var getTokenParam = (key: string) => {
      let value = getParam(key);
      return value ? JSON.parse(GLUtil.base64Decode(value.split('.')[1]) || '{}') : null;
    };
    return { getParam, getTokenParam };
  }

  // TODO: ?
  static trySetSigninVerifyToken() {
    try {
      const { getParam, getTokenParam } = OidcProxy.getTokenUrlParams();
      const storage = new ClientStorage(console);
      const id = getParam('state');
      const oidcKey = `oidc.${id}`;
      if (GLUtil.isNullOrUndefined(storage.getItem(oidcKey))) {
        const tokens = getTokenParam('id_token');

        storage.setItem(
          oidcKey,
          JSON.stringify({
            authority: defaultSettings.authority,
            client_id: defaultSettings.client_id,
            created: tokens.exp - 10,
            id: id,
            nonce: tokens.nonce,
            redirect_uri: defaultSettings.redirect_uri,
          })
        );
      }
    } catch (e) {
      // diagnosticLogError({ error: e })
      console.error(e);
    }
  }
  static signinSilent(): Promise<LoginInfo> {
    return mgr
      .signinSilent()
      .then((user) => OidcProxy.mergeLoginInfo(user as LoginInfo))
      .catch((e) => Promise.reject(e));
  }
  static signinSilentCallback(url?: string): Promise<any> {
    return mgr.signinSilentCallback(url);
  }
  static signoutRedirect(): Promise<any> {
    return mgr.signoutRedirect();
  }
  static signoutRedirectCallback(): Promise<any> {
    return mgr.signoutRedirectCallback();
  }
  static storePageAfterSignin(pageAfterSignin?: Location) {
    sessionStorage.setItem(
      OidcStorageKeys.pageaftersignin,
      JSON.stringify({
        afterSignin: pageAfterSignin,
        shouldSignin: OidcProxy.getRedirectPath(GLUtil.parsePath()),
      })
    );
  }
  static getPageAfterSignin() {
    let stored = sessionStorage.getItem(OidcStorageKeys.pageaftersignin);
    return stored ? JSON.parse(stored) : null;
  }
  static storePageAfterSignout(pageAfterSignout?: Location) {
    sessionStorage.setItem(
      OidcStorageKeys.pageaftersignout,
      JSON.stringify({
        afterSignout: pageAfterSignout,
        currentSignout: OidcProxy.getRedirectPath(GLUtil.parsePath()),
      })
    );
  }
  static getRedirectPath(path: { pathname: string; hash: string }) {
    const oidcPaths = [
      OidcCallbackPath.signin,
      OidcCallbackPath.signinSilent,
      OidcCallbackPath.signout,
      OidcCallbackPath.ssoSignout,
    ];
    return oidcPaths.some(
      (oidcPath) => path.pathname.indexOf(oidcPath) > -1 || path.hash.indexOf(oidcPath) > -1
    )
      ? '/'
      : path;
  }
  static getPageAfterSignout() {
    let stored = sessionStorage.getItem(OidcStorageKeys.pageaftersignout);
    return stored ? JSON.parse(stored) : null;
  }
  static storePagethenSigninRedirect(pageAfterSignin?: Location) {
    const signinRedirect = (_: any) => {
      OidcProxy.storePageAfterSignin(pageAfterSignin);

      OidcProxy.signinRedirect().catch((e) => {
        // diagnosticLogError({ error: e })
        console.error(e);
      });
    };
    OidcProxy.clearState().then(signinRedirect).catch(signinRedirect);
  }

  // static getSessionKey() {
  //     return `oidc.user:${GLGlobal.authorityUrl()}:${GLGlobal.authorityClientId()}`
  // }
  // static getSessionFromStorage() {
  //     return sessionStorage.getItem(OidcProxy.getSessionKey());
  // }

  static storePagethenSignoutRedirect(pageAfterSignout?: Location) {
    OidcProxy.storePageAfterSignout(pageAfterSignout);
    OidcProxy.signoutRedirect();
  }
  static setLoginInfo(payload: LoginInfo | null, callback?: (d: any) => void) {
    const processedPayload = OidcProxy.processUser(payload);
    if (callback) {
      // const unSubscribe = GLGlobal.store.subscribe(() => {
      //   if (GLGlobal.store.getState().oidc.loginInfo) {
      //     unSubscribe();
      //     callback(processedPayload);
      //   }
      // });
      callback(processedPayload);
    }
    // GLGlobal.store.dispatch({ ...action, payload });
  }
  static getLoginInfo(): LoginInfo {
    return GLGlobal.store.getState().oidc.loginInfo || ({} as LoginInfo);
  }
  static clearState() {
    return Promise.all([mgr.removeUser(), mgr.clearStaleState()]);
  }
  static mergeLoginInfo(user: LoginInfo) {
    return (
      Promise.resolve(OidcProxy.processUser(user))
        //   .then(OidcProxy.accessTokenScope(OidcProxy.appendPermissions) as any)
        .then((loginInfo: any) => {
          signin(loginInfo);
          OidcProxy.setLoginInfo(loginInfo);
          return Promise.resolve(loginInfo);
        })
        .catch((e) => Promise.reject(e))
    );
  }
  static useLocalStoreToLogin() {
    return OidcProxy.getUser()
      .then(OidcProxy.mergeLoginInfo)
      .catch((e) => Promise.reject(e));
  }
  //   static accessTokenScope(func: (loginInfo: LoginInfo) => Promise<LoginInfo>) {
  //     return (loginInfo: LoginInfo) => {
  //       OidcProxy.accessToken = loginInfo.access_token;
  //       return func(loginInfo).then((formatted) => {
  //         OidcProxy.accessToken = null;
  //         return Promise.resolve(formatted);
  //       });
  //     };
  //   }
  static hasActions(loginInfo: LoginInfo) {
    return loginInfo.profile.actions && loginInfo.profile.actions.length > 0;
  }
  //   static appendPermissions(loginInfo: LoginInfo) {
  //     return new Promise<LoginInfo>((resolve, reject) => {
  //       if (!loginInfo.loggedin || OidcProxy.isExpired(loginInfo)) {
  //         resolve(loginInfo);
  //       } else if (!OidcProxy.hasActions(loginInfo)) {
  //         // OidcProxy.setPermissionInfo(loginInfo).then((result) => {
  //         //     OidcProxy.setUserAvatar(result).then((avatarResult) => {
  //         //         resolve(avatarResult);
  //         //     });
  //         // });
  //         OidcProxy.setPermissions(loginInfo).then((result) => {
  //           resolve(result);
  //         });
  //       } else {
  //         resolve(loginInfo);
  //       }
  //     });
  //   }
  static localSilentLogin() {
    if (!window.location.href.includes('oidc')) {
      OidcProxy.getUser().then((loginInfo) => {
        if (loginInfo.loggedin) {
          OidcProxy.setLoginInfo(signin(loginInfo));
        } else {
          OidcProxy.setLoginInfo(signout(null));
          OidcProxy.signinSilent();
        }
      });
    }
  }
  //   static getPermissions(): string[] {
  //     const logininfo = GLGlobal.store.getState().oidc.loginInfo || ({} as LoginInfo);
  //     return logininfo && logininfo.profile ? logininfo.profile.actions : [];
  //   }
  //   static setPermissions(loginInfo?: LoginInfo): Promise<LoginInfo> {
  //     return new Promise((resolve, reject) => {
  //       const info = loginInfo ?? OidcProxy.getLoginInfo();
  //       OidcProxy.getUserPermission(info.profile.roleInfos.map((roleinfo: Role) => roleinfo.id))
  //         .then((permissions: string[]) => {
  //           info.profile.actions = permissions;
  //           resolve(info);
  //         })
  //         .catch(() => {
  //           reject(info);
  //         });
  //     });
  //   }

  // static setUserAvatar(loginInfo: LoginInfo): Promise<LoginInfo> {
  //     return new Promise((resolve, reject) => {
  //         OidcProxy.getUserAvatarUrl(loginInfo.profile.sub, OidcProxy.getExpiringInMinutes(loginInfo)).then((userAvatarUrl) => {
  //             loginInfo.profile.avatarUrl = userAvatarUrl;
  //             resolve(loginInfo);
  //         }).catch((e) => {
  //             reject(loginInfo);
  //         });
  //     });
  // }

  // static getUserAvatarUrl(userId, expirationInMinutes): any {
  //     const userRequest = new UserService();
  //     return userRequest.getUserAvatarUrl(userId, expirationInMinutes);
  // }

  //   static getUserPermission(roleIds: string[]): any {
  //     const permissionRequest = new PermissionService();
  //     return permissionRequest.getPermissionNames({ roleIds: roleIds });
  //   }
  //   static getPropagationPermissions(resourcePropagation: ResourcePropagation): any {
  //     const permissionRequest = new PermissionService();
  //     return permissionRequest.propagation(resourcePropagation);
  //   }
}

export enum OidcCallbackPath {
  signin = '/oidc/signin',
  signinSilent = '/oidc/signin-silent',
  signout = '/oidc/signout',
  ssoSignout = '/oidc/sso-signout',
}

export function OidcRouteRoleGuard(
  next: IRouteHandler,
  context: RouteHandlerContext,
  roles: string[]
) {
  const loginInfo = OidcProxy.getLoginInfo();
  if (loginInfo.loggedin) {
    const userRoles: string[] = loginInfo.profile.roles;
    if (roles && roles.length > 0) {
      roles.some((role) => userRoles.indexOf(role) > -1)
        ? next.invoke(context)
        : context.history.replace({ pathname: PathConfig.AccessDenied });
    } else {
      next.invoke(context);
    }
  } else {
    next.invoke(context);
  }
}

// export async function OidcRouteActionGuard(next: IRouteHandler, context: RouteHandlerContext, actions: string[], resourcePropagation: ResourcePropagation) {
//     const loginInfo = OidcProxy.getLoginInfo();
//     if (loginInfo.loggedin) {
//         const permissions = await OidcProxy.getPropagationPermissions(resourcePropagation);
//         loginInfo.profile.actions = permissions;
//         if (actions && actions.length > 0) {
//             actions.some(action => GLGlobal.isActionValid(action, permissions)) ? next.invoke(context) : context.history.replace({ pathname: PathConfig.AccessDenied });
//         } else {
//             next.invoke(context);
//         }
//     } else {
//         next.invoke(context);
//     }
// }

// export async function OwnerRouteGuard(next: IRouteHandler, context: RouteHandlerContext, resourcePermissionType: ResourcePermissionType, resourceId: string) {
//     const loginInfo = OidcProxy.getLoginInfo();
//     if (loginInfo.loggedin) {
//         const pService = new PermissionService();
//         const isValid = await pService.isOwner({ resourcePermissionType, entityId: resourceId });
//         if (isValid) {
//             next.invoke(context);
//         } else {
//             context.history.replace({ pathname: PathConfig.AccessDenied });
//         }
//     } else {
//         next.invoke(context);
//     }
// }

// export async function AccessibleRouteGuard(next: IRouteHandler, context: RouteHandlerContext, resourcePermissionType: ResourcePermissionType, resourceId: string) {
//     const loginInfo = OidcProxy.getLoginInfo();
//     if (loginInfo.loggedin) {
//         const pService = new PermissionService();
//         const isValid = await pService.isAccessable({ resourcePermissionType, entityId: resourceId });
//         if (isValid) {
//             next.invoke(context);
//         } else {
//             context.history.replace({ pathname: PathConfig.AccessDenied });
//         }
//     } else {
//         next.invoke(context);
//     }
// }

export function OidcRouteAuthGuard(next: IRouteHandler, context: RouteHandlerContext) {
  const routeAuth = (loginInfo: LoginInfo) => {
    if (!loginInfo.loggedin || OidcProxy.isExpired(loginInfo)) {
      // GLGlobal.store.dispatch(setSplash(true));
      OidcProxy.storePagethenSigninRedirect();
    } else {
      // GLGlobal.store.dispatch(setSplash(false));
      //render component after authrization
      // OidcRouteRoleGuard(nextState, replace, callback);
      next.invoke(context);
    }
  };
  let loginInfo = GLGlobal.store.getState().oidc.loginInfo;
  if (loginInfo && OidcProxy.hasActions(loginInfo)) {
    routeAuth(loginInfo);
  } else {
    OidcProxy.useLocalStoreToLogin().then((loginInfo) => routeAuth(loginInfo));
  }
}

export class AuthRouteHandler implements IRouteHandler {
  next: IRouteHandler;
  invoke(context: RouteHandlerContext) {
    OidcRouteAuthGuard(this.next, context);
  }
}
export class RoleRouteHandler implements IRouteHandler {
  constructor(private roles: string[]) { }
  next: IRouteHandler;
  invoke(context: RouteHandlerContext) {
    OidcRouteRoleGuard(this.next, context, this.roles);
  }
}
// export class ActionRouteHandler implements IRouteHandler {
//     constructor(private actions: string[]) { }
//     next: IRouteHandler
//     resourcePropagation: ResourcePropagation
//     invoke(context: RouteHandlerContext) {
//         OidcRouteActionGuard(this.next, context, this.actions, this.resourcePropagation);
//     }
// }

// export class OwnerRouteHandler implements IRouteHandler {
//     constructor(private resourcePermissionType: ResourcePermissionType, private resourceId: string) { }
//     next: IRouteHandler
//     invoke(context: RouteHandlerContext) {
//         OwnerRouteGuard(this.next, context, this.resourcePermissionType, this.resourceId);
//     }
// }

// export class AccessibleRouteHandler implements IRouteHandler {
//     constructor(private resourcePermissionType: ResourcePermissionType, private resourceId: string) { }
//     next: IRouteHandler
//     invoke(context: RouteHandlerContext) {
//         AccessibleRouteGuard(this.next, context, this.resourcePermissionType, this.resourceId);
//     }
// }

OidcProxy.createOidcProxy();
