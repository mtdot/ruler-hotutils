import { match } from "react-router";
import { Location, History } from 'history';

export interface RouteHandlerContext<P = any> {
    match: match<P>;
    location: Location;
    history: History;
    path: string;
    exact: boolean;
    strict: boolean;
    [prop: string]: any;
}
export interface IRouteHandler {
    //no need to set value by user code
    next?: IRouteHandler;
    //invoke func could be callback in async
    invoke?: (context?: RouteHandlerContext) => void;
    //invokeOnLeave func should be execed in sync
    invokeOnLeave?: (context?: RouteHandlerContext) => void;
}
// export interface GLRouteProps extends RouteProps {
//     title?: string;
//     handlers?: IRouteHandler[];
// }
// export interface RoutePipelineState {
//     pipeEnded: boolean;
// }