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
import { withTranslation, useTranslation } from 'react-i18next';


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

function LangSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: any) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select onChange={event => changeLanguage(event.target.value)}>
      <option value={'en'}>Eng</option>
      <option value={'tchin'}>T Chin</option>
      <option value={'schin'}>S Chin</option>
    </select>
  );
}

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
    //@ts-ignore
    const { t } = this.props;
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
          <TrainingTooltip overlay={t("tooltips.viewYourPersonalFeed")} placement="bottomRight">
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
    <li><a href="https://snglsdao.io/">{t("header.dao")}</a></li>
                <li><a href="https://forum.snglsdao.io/" target="_blank">{t('header.forum')}</a></li>
                <li className={css.submenu}><span>{t('header.consumerProtection.consumer')}</span>
                    <ul>
                      <li><a href="https://github.com/SingularDTV/snglsdao-whitepaper" target="_blank">{t('header.consumerProtection.tokenEconomics')}</a></li>
    <li><a href="https://snglsdao.io/#roadmap" target="_blank">{t('header.consumerProtection.roadmap')}</a></li>
    <li className={css.submenu}><span>{t('header.consumerProtection.code.code')}</span>
                        <ul>
                          <li><a href="https://etherscan.io/address/0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009#code" target="_blank">{t('header.consumerProtection.code.SNGLS')}</a></li>
                          <li><a href="https://snglsdao.io/" target="_blank">{t('header.consumerProtection.code.SGT')}</a></li>
                          <li><a href="https://github.com/SingularDTV/snglsDAO-smartcontracts" target="_blank">{t('header.consumerProtection.code.snglsDAO')}</a></li>
                        </ul>
                      </li>
    <li className={css.submenu}><span>{t('header.consumerProtection.transHistory.history')}</span>
                        <ul>
                          <li><a href="https://etherscan.io/token/0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009" target="_blank">{t('header.consumerProtection.transHistory.SNGLS')}</a></li>
                          <li><a href="https://snglsdao.io/" target="_blank">{t('header.consumerProtection.transHistory.SGT')}</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><span>{t('header.consumerProtection.historyPassTokenSales')}</span>
                        <ul>
                          <li><a href="https://etherscan.io/address/0xbdf5c4f1c1a9d7335a6a68d9aa011d5f40cf5520" target="_blank">{t('header.SNGLS')}</a></li>
                          <li><a href="https://snglsdao.io/" target="_blank">{t('header.SGT')}</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><span>{t('header.consumerProtection.tokenHolder')}</span>
                        <ul>
                          <li><a href="https://etherscan.io/token/0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009#balances" target="_blank">{t('header.SNGLS')}</a></li>
                          <li><a href="https://snglsdao.io/" target="_blank">{t('header.SGT')}</a></li>
                        </ul>
                      </li>
                      <li className={css.submenu}><span>{t('header.consumerProtection.appSec')}</span>
                        <ul>
                          <li><a href="https://snglsdao.io/" target="_blank">{t('header.snglsDAO')}</a></li>
                        </ul>
                      </li>
                    </ul>
                </li>
                <li className={css.submenu}><span>{t('header.news.news')}</span>
                  <ul>
                    <li><a href="https://twitter.com/SNGLSDAO" target="_blank">{t('header.news.twitter')}</a></li>
                    <li><a href="https://medium.com/singulardtv" target="_blank">{t('header.news.medium')}</a></li>
                    <li><a href="https://weibo.com/snglsdao" target="_blank">{t('header.news.weibo')}</a></li>
                  </ul>
                </li>
                <li><a href="https://snglsdao.io/#contacts">{t('header.sub')}</a></li>
                <li><a href="https://github.com/SingularDTV/snglsdao-pm" target="_blank"><svg className={css.gitIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M5.156 12.438c0-.063-.062-.126-.156-.126s-.156.063-.156.126c0 .062.062.124.156.093.094 0 .156-.031.156-.094zm-.968-.157c0 .063.062.156.156.156a.15.15 0 00.187-.062c0-.063-.031-.125-.125-.156-.093-.031-.187 0-.218.062zm1.406-.031c-.094 0-.157.063-.157.156 0 .063.094.094.188.063s.156-.063.125-.125c0-.063-.094-.125-.156-.094zm2.031-12C3.312.25 0 3.563 0 7.875c0 3.469 2.156 6.438 5.281 7.5.407.063.532-.188.532-.375v-1.938s-2.188.47-2.657-.937c0 0-.344-.906-.844-1.125 0 0-.718-.5.032-.5 0 0 .781.063 1.219.813.687 1.218 1.812.874 2.28.656.063-.5.25-.844.5-1.063-1.75-.187-3.53-.437-3.53-3.437 0-.875.25-1.282.75-1.844-.094-.219-.344-1.031.093-2.125.625-.188 2.156.844 2.156.844.625-.188 1.282-.25 1.938-.25.688 0 1.344.062 1.969.25 0 0 1.5-1.063 2.156-.844.438 1.094.156 1.906.094 2.125.5.563.812.969.812 1.844 0 3-1.844 3.25-3.594 3.437.282.25.532.719.532 1.469 0 1.031-.031 2.344-.031 2.594 0 .219.156.469.562.375 3.125-1.031 5.25-4 5.25-7.469C15.5 3.562 11.969.25 7.625.25zM3.031 11.031c-.062.031-.031.125 0 .188.063.031.125.062.188.031.031-.031.031-.125-.031-.188-.063-.03-.126-.062-.157-.03zm-.344-.25c-.03.063 0 .094.063.125s.125.031.156-.031c0-.031-.031-.063-.094-.094-.062-.031-.093-.031-.124 0zm1 1.125c-.03.031-.03.125.063.188.063.062.156.094.188.031.03-.031.03-.125-.032-.188-.062-.062-.156-.093-.219-.03zm-.343-.469c-.063.032-.063.126 0 .188.062.063.125.094.187.063.031-.032.031-.126 0-.188-.062-.063-.125-.094-.187-.063z"></path>
                </svg>{t('header.git')}</a></li>
                <LangSwitcher/>

                <li className={css.submenu + ' ' + css.langSelector}>
                    <span className={css.menu__link}>ENG</span>
                    <ul>
                        <li><a href="#">Eng</a></li>
                        <li><a href="#">Chin</a></li>
                    </ul>
                </li>
                
              </ul>
            </div>
          </div>


          <TrainingTooltip placement="left" overlay={t('tooltips.showHide')} alwaysAvailable>
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
                      {t("fullProfile")}
                      </Link>
                    </div>
                  </div>
                  <AccountBalances dao={dao} address={currentAccountAddress} />
                  <div className={css.logoutButtonContainer}>
                    { accountIsEnabled ?
                      <div className={css.web3ProviderLogoutSection}>
                        <div className={css.provider}>
                          <div className={css.title}>{t('header.provider')}</div>
                          <div className={css.name}>{web3ProviderInfo.name}</div>
                        </div>
                        { providerHasConfigUi(web3Provider) ?
                          <div className={css.providerconfig}><ProviderConfigButton provider={web3Provider} providerName={web3ProviderInfo.name}></ProviderConfigButton></div>
                          : ""
                        }
                        <div className={css.web3ProviderLogInOut}  onClick={this.handleClickLogout}><div className={css.text}>{t('header.logOut')}</div> <img src="/assets/images/Icon/logout.svg"/></div>
                      </div> :
                      <div className={css.web3ProviderLogInOut}  onClick={this.handleConnect}><div className={css.text}>{t('header.connect')}</div> <img src="/assets/images/Icon/login.svg"/></div> }
                  </div>
                </div>
              </span> : <span></span>
            }
            {!currentAccountAddress ?
              <div className={css.web3ProviderLogin}>
                <TrainingTooltip placement="bottomLeft" overlay={t('header.trainingTooltip')}>
                  <button onClick={this.handleClickLogin} data-test-id="loginButton">
                  {t('header.logIn')}<img src="/assets/images/Icon/login-black.svg"/>
                  </button>
                </TrainingTooltip>
              </div>
              : (!accountIsEnabled) ?
                <div className={css.web3ProviderLogin}>
                  <TrainingTooltip placement="bottomLeft" overlay={t('header.trainingTooltip')}>
                    <button onClick={this.handleConnect} data-test-id="connectButton">
                      <span className={css.connectButtonText}>{t('header.connect')}</span><img src="/assets/images/Icon/login-black.svg"/>
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
            <span>{t("header.dao")}</span>}
        </div>




      </div>
    );
  }
}

const SubscribedHeader = withSubscription({
  // @ts-ignore
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


//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedHeader));
