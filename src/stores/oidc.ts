import { LoginInfo } from '@/features/oidc';
import create, { GetState, SetState } from 'zustand';

export type OidcState = {
  loginInfo?: LoginInfo;
  //   showLogo?: boolean;
  signin: (loginInfo: LoginInfo) => void;
  signout: () => void;
};

export const useOidcState = create<OidcState>((set: SetState<OidcState>) => ({
  loginInfo: null,
  signin: (loginInfo: LoginInfo) =>
    set((state: OidcState) => ({
      loginInfo: state.loginInfo,
    })),
  signout: () => ({
    loginInfo: null,
  }),
}));

// export default {
//   namespace: 'oidc',
//   state: {
//     loginInfo: null,
//     showLogo: false,
//   },
//   reducers: {
//     signin(state, action) {
//       return { ...state, loginInfo: action.payload };
//     },
//     signout(state, action) {
//       return { ...state, loginInfo: action.payload };
//     },
//     showLogo(state, action) {
//       return { ...state, showLogo: action.payload };
//     },
//   },
// };

// export function signin(state) {
//   return { type: 'oidc/signin', payload: state };
// }
// export function signout(state) {
//   return { type: 'oidc/signout', payload: state };
// }
