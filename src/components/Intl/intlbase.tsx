import * as React from 'react'
import { LocaleProvider } from "antd-min";
import { injectIntl, IntlProvider } from "react-intl";
import { getLocale, GLGlobal, StateType, connect } from "@gl-commonui/index";
import { langLoaded } from '@gl-commonui/states/intl';
import { delayMaskView } from '@gl-commonui/states/spin';

export interface IntlBaseProps {
    specifiedLanguage?: string
    language?: string
    intlLoaded?: (appLocale: any) => Promise<{}>
    delayMaskView?: (toggle: boolean, time: number) => void
    langLoaded?: (d) => void
}
export interface IntlBaseStates {
    locale?: any
}
@connect((state: StateType) => {
    return {
        language: state.intl.langLoading
    }
}, {
        delayMaskView,
        langLoaded
    }, ({ state: { language }, own: { specifiedLanguage } }) => ({
        language: language || specifiedLanguage,
    }))
export class IntlBase extends React.Component<IntlBaseProps, IntlBaseStates> {
    injectIntlComponent
    constructor(props, context) {
        super(props, context);
        this.state = {
            locale: null
        };
        this.initInjectIntlComponent();
    }
    componentDidMount() {
        this.loadLanguage(this.props.language);
    }
    componentWillReceiveProps(nextProps: IntlBaseProps, nextContext: any) {
        this.props.language !== nextProps.language && this.loadLanguage(nextProps.language);
    }
    loadLanguage(language?) {
        const langLoaded = (data, resolve) => {
            this.setState({ locale: data }, () => {
                this.forceUpdate();
                this.props.langLoaded(data.locale);
                this.props.delayMaskView(false, 500);
                return resolve();
            });
        }
        return new Promise((resolve, reject) => {
            getLocale(language).then((data) => {
                if (this.props.intlLoaded) {
                    this.props.intlLoaded(data).then(d => {
                        data.messages = { ...data.messages, ...d };
                        langLoaded(data, resolve);
                    })
                } else {
                    langLoaded(data, resolve);
                }
            })
        })
    }
    private initInjectIntlComponent() {
        const Component: any = (props) => {
            GLGlobal.intl = props.intl;
            return React.Children.only(this.props.children);
        };
        this.injectIntlComponent = injectIntl(Component);
    }
    render() {
        const locale = this.state.locale;
        return locale ? <LocaleProvider locale={locale.antd}>
            <IntlProvider locale={locale.locale} messages={locale.messages}><this.injectIntlComponent></this.injectIntlComponent></IntlProvider>
        </LocaleProvider>
            : <div></div>
    }
}
