// import * as React from 'react';
// // import { RouteComponentProps, RouteProps, match, RedirectProps } from 'react-router';
// import { Route, matchPath } from 'react-router-dom';
// import { Location, History } from 'history';
// import { AuthRouteHandler } from '@gl-commonui/oidc';
// import { GLGlobal } from '@gl-commonui/utility';
// import { setSplash } from '@gl-commonui/states';
// import { GLRouteProps, RoutePipelineState } from '@/utils/router';

// // export type GLLocation = Location;
// // export type GLHistory = History;
// // export type GLRouteComponentProps = RouteComponentProps<any> & GLRouteProps;


// // export class RoutePipeline extends React.Component<GLRouteComponentProps, RoutePipelineState> {
// //   pipeline: any;
// //   constructor(props) {
// //     super(props);
// //     this.state = {
// //       pipeEnded: false,
// //     };
// //   }

// //   componentDidMount() {
// //     if (!this.props.handlers.find((handler) => handler instanceof AuthRouteHandler)) {
// //       // Hide the splash screen if route is public
// //       GLGlobal.store.dispatch(setSplash(false));
// //     }
// //     if (this.props.match) {
// //       this.linkHandlers();
// //       this.invokeHandlers();
// //     }
// //   }
// //   componentWillUnmount() {
// //     this.linkLeaveHandlers();
// //     this.invokeLeaveHandlers();
// //   }
// //   getRouteContext() {
// //     return {
// //       match: this.props.match,
// //       location: this.props.location,
// //       history: this.props.history,
// //       path: this.props.path,
// //       exact: this.props.exact,
// //       strict: this.props.strict,
// //     } as RouteHandlerContext;
// //   }
// //   linkHandlers() {
// //     this.pipeline = this.props.handlers.reduceRight(
// //       (pre, cur) => {
// //         cur.next = pre;
// //         cur.invoke ||
// //           (cur.invoke = (context) => {
// //             cur.next.invoke(context);
// //           });
// //         return cur;
// //       },
// //       { invoke: this.invokeEnded.bind(this) }
// //     );
// //   }
// //   invokeHandlers() {
// //     this.pipeline.invoke(this.getRouteContext());
// //   }
// //   linkLeaveHandlers() {
// //     this.pipeline = this.props.handlers.reduce(
// //       (pre, cur) => {
// //         cur.next = pre;
// //         cur.invokeOnLeave ||
// //           (cur.invokeOnLeave = (context) => {
// //             cur.next.invokeOnLeave(context);
// //           });
// //         return cur;
// //       },
// //       { invokeOnLeave: () => { } }
// //     );
// //   }
// //   invokeLeaveHandlers() {
// //     this.pipeline.invokeOnLeave(this.getRouteContext());
// //   }
// //   invokeEnded() {
// //     this.setState({ pipeEnded: true });
// //   }
// //   static renderComponent(Component, children, title) {
// //     title && title !== document.title && (document.title = title);
// //     return Component ? <Component>{children}</Component> : <>{children}</>;
// //   }
// //   render() {
// //     return this.state.pipeEnded
// //       ? RoutePipeline.renderComponent(this.props.component, this.props.children, this.props.title)
// //       : null;
// //   }
// // }

// // export const GLRoute = ({ component, children, title, handlers, ...rest }: GLRouteProps) => {
// //   return (
// //     <Route
// //       {...rest}
// //       key={rest.path ? rest.path.toString() : `route-random-key-${Math.random()}`}
// //       render={(props: GLRouteComponentProps) => {
// //         props.component = component;
// //         props.children = children;
// //         props.title = title;
// //         props.handlers = handlers;

// //         if (rest.path) return <RoutePipeline {...{ ...rest, ...props }} />;

// //         if (!handlers) return RoutePipeline.renderComponent(component, children, title);

// //         let match;
// //         React.Children.forEach(children, (element) => {
// //           if (match == null && React.isValidElement(element)) {
// //             const {
// //               path: pathProp,
// //               exact,
// //               strict,
// //               from,
// //             } = element.props as RouteProps & RedirectProps;
// //             const path = pathProp || from;

// //             path && (match = matchPath(props.location.pathname, { path, exact, strict }));
// //           }
// //         });
// //         return match ? (
// //           <RoutePipeline {...{ ...rest, ...props, match }} />
// //         ) : (
// //           RoutePipeline.renderComponent(component, children, title)
// //         );
// //       }}
// //     ></Route>
// //   );
// // };
