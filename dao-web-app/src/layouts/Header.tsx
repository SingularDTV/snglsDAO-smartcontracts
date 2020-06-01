import * as uiActions from "actions/uiActions";
import { threeBoxLogout } from "actions/profilesActions";
import { enableWalletProvider, getAccountIsEnabled, getArc, logout, getWeb3ProviderInfo, getWeb3Provider, providerHasConfigUi } from "arc";
import AccountBalances from "components/Account/AccountBalances";
import AccountImage from "components/Account/AccountImage";
import AccountProfileName from "components/Account/AccountProfileName";
import RedemptionsButton from "components/Redemptions/RedemptionsButton";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import { copyToClipboard } from "lib/util";
import { IRootState } from "reducers";
import { NotificationStatus, showNotification } from "reducers/notifications";
import { IProfileState } from "reducers/profilesReducer";
import TrainingTooltip from "components/Shared/TrainingTooltip";
import { parse } from "query-string";
import * as React from "react";
import { connect } from "react-redux";
import { Link, matchPath, NavLink, RouteComponentProps } from "react-router-dom";
import { Breadcrumbs } from "react-breadcrumbs-dynamic";
import { of } from "rxjs";
import Toggle from "react-toggle";
import { RefObject } from "react";
import classNames from "classnames";
import { Address, IDAOState } from "@daostack/client";
import { ETHDENVER_OPTIMIZATION } from "../settings";
import * as css from "./App.scss";
import ProviderConfigButton from "layouts/ProviderConfigButton";

interface IExternalProps extends RouteComponentProps<any> {
}

interface IStateProps {
  showRedemptionsButton: boolean;
  currentAccountProfile: IProfileState;
  currentAccountAddress: string | null;
  daoAvatarAddress: Address;
  menuOpen: boolean;
  sidebarOpen: boolean;
  threeBox: any;
}

const mapStateToProps = (state: IRootState & IStateProps, ownProps: IExternalProps): IExternalProps & IStateProps => {
  const match = matchPath(ownProps.location.pathname, {
    path: "/dao",
    strict: false,
  });
  const queryValues = parse(ownProps.location.search);

  // TODO: this is a temporary hack to send less requests during the ethDenver conference: 
  // we hide the demptionsbutton when the URL contains "crx". Should probably be disabled at later date..
  let showRedemptionsButton;
  if (ETHDENVER_OPTIMIZATION) {
    showRedemptionsButton = (ownProps.location.pathname.indexOf("crx") === -1);
  } else {
    showRedemptionsButton = true;
  }

  return {
    ...ownProps,
    showRedemptionsButton,
    currentAccountProfile: state.profiles[state.web3.currentAccountAddress],
    currentAccountAddress: state.web3.currentAccountAddress,
    daoAvatarAddress: match && match.params ? (match.params as any).daoAvatarAddress : queryValues.daoAvatarAddress,
    menuOpen: state.ui.menuOpen,
    sidebarOpen: state.ui.sidebarOpen,
    threeBox: state.profiles.threeBox,
  };
};

interface IDispatchProps {
  showNotification: typeof showNotification;
  toggleMenu: typeof uiActions.toggleMenu;
  toggleSidebar: typeof uiActions.toggleSidebar;
  toggleTrainingTooltipsOnHover: typeof uiActions.toggleTrainingTooltipsOnHover;
  enableTrainingTooltipsOnHover: typeof uiActions.enableTrainingTooltipsOnHover;
  disableTrainingTooltipsOnHover: typeof uiActions.disableTrainingTooltipsOnHover;
  enableTrainingTooltipsShowAll: typeof  uiActions.enableTrainingTooltipsShowAll;
  disableTrainingTooltipsShowAll: typeof uiActions.disableTrainingTooltipsShowAll;
  threeBoxLogout: typeof threeBoxLogout;
}

const mapDispatchToProps = {
  showNotification,
  toggleMenu: uiActions.toggleMenu,
  toggleSidebar: uiActions.toggleSidebar,
  toggleTrainingTooltipsOnHover: uiActions.toggleTrainingTooltipsOnHover,
  enableTrainingTooltipsOnHover: uiActions.enableTrainingTooltipsOnHover,
  disableTrainingTooltipsOnHover: uiActions.disableTrainingTooltipsOnHover,
  enableTrainingTooltipsShowAll: uiActions.enableTrainingTooltipsShowAll,
  disableTrainingTooltipsShowAll: uiActions.disableTrainingTooltipsShowAll,
  threeBoxLogout,
};

type IProps = IExternalProps & IStateProps & IDispatchProps & ISubscriptionProps<IDAOState>;

class Header extends React.Component<IProps, null> {

  constructor(props: IProps) {
    super(props);
    this.copyAddress = this.copyAddress.bind(this);
    this.toggleDiv = React.createRef();
    this.initializeTrainingTooltipsToggle();
  }

  private static trainingTooltipsEnabledKey = "trainingTooltipsEnabled";
  private toggleDiv: RefObject<HTMLDivElement>;

  public componentDidMount() {
    this.toggleDiv.current.onmouseenter = (_ev: MouseEvent) => {
      this.props.enableTrainingTooltipsShowAll();
    };
    this.toggleDiv.current.onmouseleave = (_ev: MouseEvent) => {
      this.props.disableTrainingTooltipsShowAll();
    };
  }

  public copyAddress(e: any): void {
    const { showNotification, currentAccountAddress } = this.props;
    copyToClipboard(currentAccountAddress);
    showNotification(NotificationStatus.Success, "Copied to clipboard!");
    e.preventDefault();
  }

  public handleClickLogin = async (_event: any): Promise<void> => {
    enableWalletProvider({
      suppressNotifyOnSuccess: true,
      showNotification: this.props.showNotification,
    });
  }

  public handleConnect = async (_event: any): Promise<void> => {
    enableWalletProvider({
      suppressNotifyOnSuccess: true,
      showNotification: this.props.showNotification,
    });
  }

  public handleClickLogout = async (_event: any): Promise<void> => {
    await logout(this.props.showNotification);
    await this.props.threeBoxLogout();
  }

  private handleToggleMenu = (_event: any): void => {
    this.props.toggleMenu();
  }

  private handleToggleSidebar = (_event: any): void => {
    this.props.toggleSidebar();
  }

  private handleTrainingTooltipsEnabled = (event: any): void => {
    /**
     * maybe making this asynchronous can address reports of the button responding very slowly
     */
    const checked =  event.target.checked;
    setTimeout(() => {
      localStorage.setItem(Header.trainingTooltipsEnabledKey, checked);
      this.props.toggleTrainingTooltipsOnHover();
    }, 0);
  }

  private getTrainingTooltipsEnabled(): boolean {
    const trainingTooltipsOnSetting = localStorage.getItem(Header.trainingTooltipsEnabledKey);
    return (trainingTooltipsOnSetting === null) || trainingTooltipsOnSetting === "true";
  }

  private initializeTrainingTooltipsToggle() {
    const trainingTooltipsOn = this.getTrainingTooltipsEnabled();
    if (trainingTooltipsOn) {
      this.props.enableTrainingTooltipsOnHover();
    } else {
      this.props.disableTrainingTooltipsOnHover();
    }
  }

  private breadCrumbCompare = (a: any, b: any): number => a.weight ? a.weight - b.weight : a.to.length - b.to.length;

  public render(): RenderOutput {
    const navigationClass = classNames({
      [css.menuOpen]: this.props.menuOpen,
      [css.navigation]: true
    });
    const menuClass = classNames({
      [css.open]: this.props.sidebarOpen,
      [css.sidebarToggle]: true
    });
    const {
      currentAccountProfile,
      currentAccountAddress,
    } = this.props;
    const dao = this.props.data;

    const daoAvatarAddress = dao ? dao.address : null;
    const accountIsEnabled = getAccountIsEnabled();
    const web3ProviderInfo = getWeb3ProviderInfo();
    const web3Provider = getWeb3Provider();
    const trainingTooltipsOn = this.getTrainingTooltipsEnabled();

    return(
      <div className={css.headerContainer}>
        <nav id="header" className={css.header}>
          <TrainingTooltip overlay="View your personal feed" placement="bottomRight">
            <div className={css.menu}>
              <Link to="/">
                {/* <img src="/assets/images/alchemy-logo-white.svg" /> */}
                <img className={css.desktop} src="/assets/images/logo.svg" />
                <img className={css.mobile} src="/assets/images/logo_mobile.svg" />
              </Link>
            </div>
          </TrainingTooltip>

          
          <div className={css.topInfo}>
            <div className={css.breadcrumbs}>
              <Breadcrumbs
                separator={<b> &gt;   </b>}
                item={NavLink}
                finalItem={"b"}
                compare={this.breadCrumbCompare}
              />
            </div>
            <div className={navigationClass}>
              <ul>
                <li><a href="#">DAO</a></li>
                <li><a href="#">Forum</a></li>
                <li className={css.submenu}><a href="#">Consumer protection</a>
                    <ul>
                      <li><a href="#">Token Economics</a></li>
                      <li><a href="#">Roadmap</a></li>
                      <li className={css.submenu}><a href="#">Source Code</a>
                        <ul>
                          <li><a href="#">SNGLS</a></li>
                          <li><a href="#">SGT</a></li>
                          <li><a href="#">snglsDAO</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><a href="#">Transaction History</a>
                        <ul>
                          <li><a href="#">SNGLS</a></li>
                          <li><a href="#">SGT</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><a href="#">History of Past Token Sales</a>
                        <ul>
                          <li><a href="#">SNGLS</a></li>
                          <li><a href="#">SGT</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><a href="#">Token Holders</a>
                        <ul>
                          <li><a href="#">SNGLS</a></li>
                          <li><a href="#">SGT</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><a href="#">Security Audit</a>
                        <ul>
                          <li><a href="#">snglsDAO</a></li>
                        </ul>
                      </li>
                    </ul>
                </li>
                <li className={css.submenu}><a href="#">News</a>
                  <ul>
                    <li><a href="#">Twitter</a></li>
                    <li><a href="#">Medium</a></li>
                    <li><a href="#">WeiBo</a></li>
                  </ul>
                </li>
                <li><a href="#">Subscribe</a></li>
                <li><a href="#">Github</a></li>
              </ul>
            </div>
          </div>


          <TrainingTooltip placement="left" overlay={"Show / hide tooltips on hover"} alwaysAvailable>
            <div className={css.toggleButton} ref={this.toggleDiv}>
              <Toggle
                defaultChecked={trainingTooltipsOn}
                onChange={this.handleTrainingTooltipsEnabled}
                icons={{ checked: <img src='/assets/images/Icon/checked.svg'/>, unchecked: <img src='/assets/images/Icon/unchecked.svg'/> }}/>
            </div>
          </TrainingTooltip>
          {
            this.props.showRedemptionsButton ? <div className={css.redemptionsButton}>
              <RedemptionsButton currentAccountAddress={currentAccountAddress} />
            </div> : ""
          }
          <div className={css.accountInfo}>
            { currentAccountAddress ?
              <span>
                <div className={css.accountInfoContainer}>
                  <div className={css.accountImage}>
                    <div className={classNames({ [css.profileLink]: true, [css.noAccount]: !accountIsEnabled })}>
                      <AccountProfileName accountAddress={currentAccountAddress}
                        accountProfile={currentAccountProfile} daoAvatarAddress={daoAvatarAddress} />
                      <span className={classNames({ [css.walletImage]: true, [css.greyscale]: !accountIsEnabled })}>
                        <AccountImage accountAddress={currentAccountAddress} profile={currentAccountProfile} width={50} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className={css.wallet}>
                  <div className={css.pointer}></div>
                  <div className={css.walletDetails}>
                    <div className={classNames({ [css.walletImage]: true, [css.greyscale]: !accountIsEnabled })}>
                      <AccountImage accountAddress={currentAccountAddress} profile={currentAccountProfile} width={50} />
                    </div>
                    <div className={css.profileName}>
                      <AccountProfileName accountAddress={currentAccountAddress}
                        accountProfile={currentAccountProfile} daoAvatarAddress={daoAvatarAddress} />
                    </div>
                    <div className={css.copyAddress} style={{cursor: "pointer"}} onClick={this.copyAddress}>
                      <span>{currentAccountAddress ? currentAccountAddress.slice(0, 40) : "No account known"}</span>
                      <img src="/assets/images/Icon/Copy-gray.svg"/>
                    </div>
                    <div className={css.fullProfile}>
                      <Link className={css.profileLink} to={"/profile/" + currentAccountAddress + (daoAvatarAddress ? "?daoAvatarAddress=" + daoAvatarAddress : "")}>
                      Full Profile
                      </Link>
                    </div>
                  </div>
                  <AccountBalances dao={dao} address={currentAccountAddress} />
                  <div className={css.logoutButtonContainer}>
                    { accountIsEnabled ?
                      <div className={css.web3ProviderLogoutSection}>
                        <div className={css.provider}>
                          <div className={css.title}>Provider</div>
                          <div className={css.name}>{web3ProviderInfo.name}</div>
                        </div>
                        { providerHasConfigUi(web3Provider) ?
                          <div className={css.providerconfig}><ProviderConfigButton provider={web3Provider} providerName={web3ProviderInfo.name}></ProviderConfigButton></div>
                          : ""
                        }
                        <div className={css.web3ProviderLogInOut}  onClick={this.handleClickLogout}><div className={css.text}>Log out</div> <img src="/assets/images/Icon/logout.svg"/></div>
                      </div> :
                      <div className={css.web3ProviderLogInOut}  onClick={this.handleConnect}><div className={css.text}>Connect</div> <img src="/assets/images/Icon/login.svg"/></div> }
                  </div>
                </div>
              </span> : <span></span>
            }
            {!currentAccountAddress ?
              <div className={css.web3ProviderLogin}>
                <TrainingTooltip placement="bottomLeft" overlay={"Click here to connect your wallet provider"}>
                  <button onClick={this.handleClickLogin} data-test-id="loginButton">
                    Log in <img src="/assets/images/Icon/login-black.svg"/>
                  </button>
                </TrainingTooltip>
              </div>
              : (!accountIsEnabled) ?
                <div className={css.web3ProviderLogin}>
                  <TrainingTooltip placement="bottomLeft" overlay={"Click here to connect your wallet provider"}>
                    <button onClick={this.handleConnect} data-test-id="connectButton">
                      <span className={css.connectButtonText}>Connect</span><img src="/assets/images/Icon/login-black.svg"/>
                    </button>
                  </TrainingTooltip>
                </div>
                : ""
            }
          </div>

          <div className={css.menuToggle} onClick={this.handleToggleMenu}>
            {this.props.menuOpen ?
              <img src="/assets/images/Icon/Close.svg" /> :
              <img src="/assets/images/Icon/Menu.svg" />}
          </div>

        </nav>



        <div className={menuClass} onClick={this.handleToggleSidebar}>
          {this.props.sidebarOpen ?
            <img src="/assets/images/Icon/close-grey.svg" /> :
            <span>DAO</span>}
        </div>




      </div>
    );
  }
}

const SubscribedHeader = withSubscription({
  wrappedComponent: Header,
  loadingComponent: null,
  errorComponent: (props) => <div>{props.error.message}</div>,
  checkForUpdate: ["daoAvatarAddress"],
  createObservable: (props: IProps) => {
    if (props.daoAvatarAddress) {
      const arc = getArc();
      // subscribe if only to get DAO reputation supply updates
      return arc.dao(props.daoAvatarAddress).state({ subscribe: true });
    } else {
      return of(null);
    }
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SubscribedHeader);
