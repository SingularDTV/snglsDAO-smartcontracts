import { threeBoxLogout } from "actions/profilesActions";
import { setCurrentAccount } from "actions/web3Actions";
import AccountProfilePage from "components/Account/AccountProfilePage";
import DaosPage from "components/Daos/DaosPage";
import Notification, { NotificationViewStatus } from "components/Notification/Notification";
// import DaoCreator from "components/DaoCreator";
import DaoContainer from "components/Dao/DaoContainer";
import RedemptionsPage from "components/Redemptions/RedemptionsPage";
import Analytics from "lib/analytics";
import Header from "layouts/Header";
import SidebarMenu from "layouts/SidebarMenu";
import { IRootState } from "reducers";
import { dismissNotification, INotificationsState, NotificationStatus, showNotification, INotification } from "reducers/notifications";
import { getCachedAccount, cacheWeb3Info, logout, pollForAccountChanges, getArcSettings } from "arc";
import ErrorUncaught from "components/Errors/ErrorUncaught";
import { parse } from "query-string";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { connect } from "react-redux";
import { matchPath, Link, Route, RouteComponentProps, Switch, Redirect } from "react-router-dom";
import { ModalContainer } from "react-router-modal";
import { History } from "history";
import classNames from "classnames";
import { captureException, withScope } from "@sentry/browser";
import { Address } from "@daostack/client";
import { sortedNotifications } from "../selectors/notifications";
import * as css from "./App.scss";
import * as Sticky from "react-stickynode";
import { withTranslation } from 'react-i18next';


interface IExternalProps extends RouteComponentProps<any> {
  history: History;
}

interface IStateProps {
  currentAccountAddress: string;
  daoAvatarAddress: string;
  sortedNotifications: INotificationsState;
  threeBox: any;
}

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IStateProps & IExternalProps => {
  const match = matchPath(ownProps.location.pathname, {
    path: "/",
    strict: false,
  });
  const queryValues = parse(ownProps.location.search);
  console.log("lalala: ", ownProps, match, queryValues)
  console.log("==========================>><><>K<><><>><>< ", getArcSettings().daoAvatarContractAddress)

  console.log("map state to props: ", state.web3.currentAccountAddress)
  return {
    ...ownProps,
    currentAccountAddress: state.web3.currentAccountAddress,
    daoAvatarAddress: getArcSettings().daoAvatarContractAddress,
    sortedNotifications: sortedNotifications()(state),
    threeBox: state.profiles.threeBox,
  };
};

interface IDispatchProps {
  dismissNotification: typeof dismissNotification;
  setCurrentAccount: typeof setCurrentAccount;
  showNotification: typeof showNotification;
  threeBoxLogout: typeof threeBoxLogout;
}

const mapDispatchToProps = {
  dismissNotification,
  setCurrentAccount,
  showNotification,
  threeBoxLogout,
};

type IProps = IExternalProps & IStateProps & IDispatchProps;

interface IState {
  error: Error;
  sentryEventId: string;
}

class AppContainer extends React.Component<IProps, IState> {
  public unlisten: any;

  private static hasAcceptedCookiesKey = "acceptedCookies";

  constructor(props: IProps) {
    super(props);
    this.state = {
      error: null,
      sentryEventId: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: any): void {
    this.setState({ error });

    if (process.env.NODE_ENV === "production") {
      withScope((scope): void => {
        scope.setExtras(errorInfo);
        const sentryEventId = captureException(error);
        this.setState({ sentryEventId });
      });
    }
  }

  public async componentDidMount (): Promise<void> {
    this.unlisten = this.props.history.listen((location) => {
      Analytics.register({
        URL: process.env.BASE_URL + location.pathname,
      });
    });

    /**
     * Heads up that there is a chance this cached account may differ from an account
     * that the user has already selected in a provider but have
     * not yet made available to the app.
     */
    const currentAddress = getCachedAccount();
    let accountWasCached = false;
    if (currentAddress) {
      accountWasCached = true;
      // eslint-disable-next-line no-console
      console.log(`using account from local storage: ${currentAddress}`);
    }

    this.props.setCurrentAccount(currentAddress);
    /**
     * Only supply currentAddress if it was obtained from a provider.  The poll
     * is only comparing changes with respect to the provider state.  Passing it a cached state
     * will only cause it to get the wrong impression and misbehave.
     */
    pollForAccountChanges(accountWasCached ? null : currentAddress).subscribe(
      (newAddress: Address | null): void => {
        // eslint-disable-next-line no-console
        console.log(`new account: ${newAddress}`);
        this.props.setCurrentAccount(newAddress);
        if (newAddress) {
          cacheWeb3Info(newAddress);
        } else {
          logout(this.props.showNotification);

          // TODO: save the threebox for each profile separately so we dont have to logout here
          this.props.threeBoxLogout();
        }
      });
  }

  private clearError = () => {
    this.setState({ error: null, sentryEventId: null });
  }

  private dismissNotif = (id: string) => () => this.props.dismissNotification(id);
  private headerHtml = ( props: any ): any => <Header {...props} />;
  private sidebarHtml = ( props: any ): any => <SidebarMenu {...props} />;

  private notificationHtml = (notif: INotification): any => {
    return <div key={notif.id}>
      <Notification
        title={(notif.title || notif.status).toUpperCase()}
        status={
          notif.status === NotificationStatus.Failure ?
            NotificationViewStatus.Failure :
            notif.status === NotificationStatus.Success ?
              NotificationViewStatus.Success :
              NotificationViewStatus.Pending
        }
        message={notif.message}
        fullErrorMessage={notif.fullErrorMessage}
        url={notif.url}
        timestamp={notif.timestamp}
        dismiss={this.dismissNotif(notif.id)}
        showNotification={this.props.showNotification}
      />
    </div>;
  }

  public componentWillUnmount() {
    this.unlisten();
  }

  public render(): RenderOutput {
    //@ts-ignore
    const  { t } = this.props;
    console.log("APP CONTANER: ", this.props);
    const {
      /*daoAvatarAddress,*/
      sortedNotifications,
    } = this.props;
    if (this.state.error) {
      // Render error fallback UI
      // eslint-disable-next-line no-console
      console.error(this.state.error);
      return <div>
        <ErrorUncaught errorMessage={this.state.error.message} sentryEventId={this.state.sentryEventId} goHome={this.clearError}></ErrorUncaught>
      </div>;
    } else {
      const hasAcceptedCookies = !!localStorage.getItem(AppContainer.hasAcceptedCookiesKey);

      return (
        <div className={classNames({[css.outer]: true, [css.withDAO]: !!getArcSettings().daoAvatarContractAddress})}>
          <BreadcrumbsItem to="/">Alchemy</BreadcrumbsItem>

          <div className={css.container}>
            <Route path="/" render={this.headerHtml} />

            <div id="wrapper" className={css.pageWrapper}>
              <div className={css.sidebarWrapper}>

                
                <Sticky enabled={true} top='#header' bottomBoundary='#wrapper' innerZ={10000}>
                <Route path="/" render={this.sidebarHtml} />
                </Sticky>
              </div>

              <div className={css.contentWrapper}>
                <Switch>
                  <Route path="/daos/create" component={DaosPage} />
                  {/* <Route path="/dao/:daoAvatarAddress" component={DaoContainer} /> */}
                  <Route path="/profile/:accountAddress" component={AccountProfilePage} />
                  <Route path="/redemptions" component={RedemptionsPage} />
                  <Route path="/dao" component={DaoContainer} />
                  <Route path="/history" component={RedemptionsPage} />
                  <Redirect exact from="/" to="/dao"></Redirect>
                </Switch>
              </div>
            </div>
            <ModalContainer
              backdropClassName={css.backdrop}
              containerClassName={css.modalContainer}
              bodyModalClassName={css.modalBody}
            />

          </div>

          <div id="footer" className={css.footer}>
            <div className={css.footerDescr}>
              <h4>{t('disclaimer')}</h4>
              <p>{t('disclaimerDescription')}</p>
            </div>
            <div className={css.footerImg}>
              <img src="/assets/images/foot_img.png" alt=""/>
            </div>
            <div className={css.footerLinks}>
              <div className={css.footerLinksLogo}>
                <Link to="/"><img src="/assets/images/logo.svg" alt="" /></Link>
              </div>
              <div className={css.footerLinksSocials}>
                <ul>
                  <li><a href="https://github.com/SingularDTV/snglsdao-pm" target="_blank"><img src="/assets/images/Icon/icon_git.svg" alt="" /></a></li>
                  <li><a href="https://weibo.com/snglsdao" target="_blank"><img src="/assets/images/Icon/soc_icon.svg" alt="" /></a></li>
                  <li><a href="https://twitter.com/snglsdao" target="_blank"><img src="/assets/images/Icon/icon_twitter.svg" alt="" /></a></li>
                  <li><a href="https://medium.com/singulardtv/" target="_blank"><img src="/assets/images/Icon/icon_medium.svg" alt=""/></a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={css.pendingTransactions}>
            { sortedNotifications.map(this.notificationHtml) }
          </div>
          <div className={css.background}></div>
          { hasAcceptedCookies ? "" :
            <div className={css.cookieDisclaimerContainer}>
              <div className={css.cookieDisclaimer}>
                <div className={css.body}>{t("cookieStart")}
                  <Link to="/cookie-policy" target="_blank" rel="noopener noreferrer">{t("cookieLinkPolicy")}</Link>{t("cookieMoreInformation")}</div>
      <div className={css.accept}><a href="#" onClick={this.handleAccept} className={css.blueButton} data-test-id="acceptCookiesButton"><img src="/assets/images/Icon/v-white-thick.svg"></img>{t("iAccept")}</a></div>
              </div>
            </div>
          }
        </div>
      );
    }
  }

  private handleAccept(): void {
    localStorage.setItem(AppContainer.hasAcceptedCookiesKey, "1");
  }
}
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AppContainer));
