import axios, { AxiosResponse } from "axios";
import { IDAOState, Token } from "@daostack/client";
import { hideMenu, hideSidebar } from "actions/uiActions";
import { getArc, getArcSettings } from "arc";
import TrainingTooltip from "components/Shared/TrainingTooltip";

import BN = require("bn.js");
import classNames from "classnames";
// import FollowButton from "components/Shared/FollowButton";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
// import { generate } from "geopattern";
import { baseTokenName, ethErrorHandler, formatTokens, genName, getExchangesList, getExchangesListSNGLS, supportedTokens/*, fromWei*/ } from "lib/util";
// import { parse } from "query-string";
import * as React from "react";
import { /* matchPath,*/ Link, RouteComponentProps } from "react-router-dom";
import { first } from "rxjs/operators";
import { IRootState } from "reducers";
import { connect } from "react-redux";
import { combineLatest, of, from } from "rxjs";
import { withTranslation } from 'react-i18next';

// import Tooltip from "rc-tooltip";
import * as css from "./SidebarMenu.scss";

type IExternalProps = RouteComponentProps<any>;

interface IStateProps {
  daoAvatarAddress: string;
  sidebarOpen: boolean;
}

interface IHasNewPosts {
  hasNewPosts: boolean;
}

interface IDispatchProps {
  hideMenu: typeof hideMenu;
  hideSidebar: typeof hideSidebar;
}

const mapDispatchToProps = {
  hideMenu,
  hideSidebar,
};

type IProps = IExternalProps & IStateProps & IDispatchProps & ISubscriptionProps<[IDAOState, IHasNewPosts]>;

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {
  return {
    ...ownProps,
    daoAvatarAddress: getArcSettings().daoAvatarContractAddress, // match && match.params ? (match.params as any).daoAvatarAddress : queryValues.daoAvatarAddress,
    sidebarOpen: state.ui.sidebarOpen,
  };
};
class SidebarMenu extends React.Component<IProps, IStateProps> {

  constructor(props: IProps) {
    super(props);
  }

  public componentDidMount() {

  }

  private handleCloseMenu = (_event: any): void => {
    this.props.hideMenu();
    this.props.hideSidebar();
  }

  public daoMenu() {
    //@ts-ignore
    const { t } = this.props;
    const [ dao, { hasNewPosts } ] = this.props.data ;
    const daoHoldingsAddress = "https://etherscan.io/tokenholdings?a=" + dao.address;
    const arcSettings = getArcSettings();

    return (
      <div>
      <div className={css.daoNavigation}>
      <span className={css.daoNavHeading}><b>{t('sidebar.menu')}</b></span>
          <ul>
            <li>
              <Link to={"/dao/dashboard/"} onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.homeNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                <img src="/assets/images/Icon/menu/_home.svg" />
                {t('sidebar.dashboard')}
                </span>
              </Link>
            </li>
            <li>
              <Link to={"/dao/membership/"} onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.homeNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                <img src="/assets/images/Icon/menu/_badge.svg" />
                {t('sidebar.protocolMembership')}

                </span>
              </Link>
            </li>
            <li>
              <Link to={"/dao/applications/"} onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.homeNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                  <img src="/assets/images/Icon/menu/_apps.svg" />
                  {t('sidebar.applications')}
                </span>
              </Link>
            </li>
            <li>
              <Link to={ "/dao/scheme/" + arcSettings.protocolParametersSchemeID } onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.homeNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                <img src="/assets/images/Icon/menu/_parameters.svg" />
                { t('sidebar.protocolParams') }

                </span>
              </Link>
            </li>
          
            <li>
              <Link to={"/dao/scheme/" + arcSettings.grantsSchemeID} onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.homeNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                  <img src="/assets/images/Icon/menu/_membership.svg" />
                  { t("sidebar.grants") }

                </span>
              </Link>
            </li>
            <li>
              <TrainingTooltip placement="right" overlay={t("tooltips.listOfEntities")}>
                <Link to={"/dao/members/"} onClick={this.handleCloseMenu}>
                  <span className={css.menuDot} />
                  <span className={
                    classNames({
                      [css.notification]: true,
                      [css.holdersNotification]: true,
                    })
                  }></span>
                  <span className={css.menuIcon}>
                  <img src="/assets/images/Icon/menu/_members.svg" />
                  {t('sidebar.members')}
                  </span>
                </Link>
              </TrainingTooltip>
            </li>
            <li>
              <Link to={"/dao/history/"} onClick={this.handleCloseMenu}>
                <span className={css.menuDot} />
                <span className={
                  classNames({
                    [css.notification]: true,
                    [css.historyNotification]: true,
                  })
                }></span>
                <span className={css.menuIcon}>
                <img src="/assets/images/Icon/menu/_history.svg" />
                {t('sidebar.history')}
                </span>
              </Link>
            </li>
            <li>
              <TrainingTooltip placement="right" overlay={t("tooltips.spaceDesignated")}>
                <Link to={"/dao/discussion/"} onClick={this.handleCloseMenu}>
                  <span className={
                    classNames({
                      [css.menuDot]: true,
                      [css.red]: hasNewPosts,
                    })} />
                  <span className={
                    classNames({
                      [css.notification]: true,
                      [css.discussionNotification]: true,
                    })
                  }></span>
                  <span className={css.menuIcon}>
                  <img src="/assets/images/Icon/menu/_wall.svg" />
                  {t('sidebar.wall')}
                  </span>
                </Link>
              </TrainingTooltip>
            </li>
          </ul>
        </div>


        <div className={css.daoHoldings}>
          <span className={css.daoNavHeading}>
            <b>{t('sidebar.treasury')}</b>
            <a className="externalLink" href={daoHoldingsAddress} target="_blank">
              <img src="/assets/images/Icon/link-white.svg" />
            </a>
          </span>
          <ul>
            <SubscribedEthBalance dao={dao} />

            {Object.keys(supportedTokens()).map((tokenAddress) => {
              return <SubscribedTokenBalance tokenAddress={tokenAddress} dao={dao} key={"token_" + tokenAddress} />;
            })}
          </ul>
        </div>
        <div className={css.daoHoldings}>
          <span className={css.daoNavHeading}>
            <b>{t('sidebar.stakes')}</b>
            {/* <a className="externalLink" href={daoHoldingsAddress} target="_blank">
              <img src="/assets/images/Icon/link-white.svg" />
            </a> */}
          </span>
          <ul>
            <SubscribedTotalStakedBalance stakingContractAddress={arcSettings.lockingSGT4ReputationContractAddress} tokenAddress={arcSettings.sgtTokenContractAddress} key={"staked_token_" + arcSettings.sgtTokenContractAddress} />
            <SubscribedTotalStakedBalance   stakingContractAddress={arcSettings.membershipFeeStakingContractAddress} tokenAddress={arcSettings.snglsTokenContractAddress} key={"staked_token_" + arcSettings.snglsTokenContractAddress} />
          </ul>
        </div>


      </div>
    );
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const sidebarClass = classNames({
      [css.menuOpen]: this.props.sidebarOpen,
      [css.sidebarWrapper]: true,
      [css.noDAO]: !this.props.daoAvatarAddress,
      clearfix: true,
    });

    return (
      <div className={sidebarClass}>
        <div className={css.menuContent}>
          { this.props.daoAvatarAddress && this.props.data ? this.daoMenu() : ""}

          <div className={css.siteLinksWrapper}>
            <ul>
              <li>
              <a>{t("sidebar.buy")}</a>
                <ul>
                  <div className={css.diamond}></div>
                  {
                    getExchangesListSNGLS().map((item: any) => {
                      return (
                        <li key={item.name}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="buyGenLink">
                            <b><img src={item.logo} /></b>
                            <span>{item.name}</span>
                          </a>
                        </li>
                      );
                    })
                  }
                </ul>
              </li>
              <li>
                <a href="https://uniswap.exchange/swap?inputCurrency=0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009&outputCurrency=0xc4199fb6ffdb30a829614beca030f9042f1c3992">{t("sidebar.buySgt")}</a>
                {/* <ul>
                  <div className={css.diamond}></div>
                  <span className={css.soon}>{
                    "  Comming soon!"
                  }</span>
                </ul> */}
              </li>
              <li>
                <a>{t("sidebar.buyGen")}</a>
                <ul>
                  <div className={css.diamond}></div>
                  {
                    getExchangesList().map((item: any) => {
                      return (
                        <li key={item.name}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="buyGenLink">
                            <b><img src={item.logo} /></b>
                            <span>{item.name}</span>
                          </a>
                        </li>
                      );
                    })
                  }
                </ul>
              </li>
              <li className={css.daoStack}>
                <a className="externalLink" href="https://snglsdao.io/" target="_blank" rel="noopener noreferrer">
                  <img src={"/assets/images/logo_icon.svg"} /> {t("sidebar.sngls")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

/***** DAO ETH Balance *****/
interface IEthProps extends ISubscriptionProps<BN|null> {
  dao: IDAOState;
}

const ETHBalance = (props: IEthProps) => {
  const { data } = props;
  return <li key="ETH"><strong>{formatTokens(data)}</strong> {baseTokenName()}</li>;
};

const SubscribedEthBalance = withSubscription({
  wrappedComponent: ETHBalance,
  loadingComponent: <li key="ETH">... {baseTokenName()}</li>,
  errorComponent: null,
  checkForUpdate: (oldProps: IEthProps, newProps: IEthProps) => {
    return oldProps.dao.address !== newProps.dao.address;
  },
  createObservable: (props: IEthProps) => {
    const arc = getArc();
    return arc.dao(props.dao.address).ethBalance().pipe(ethErrorHandler());
  },
});

/***** Total Staked Balance *****/

interface IStakedProps extends ISubscriptionProps<any> {
  stakingContractAddress: string;
  tokenAddress: string;
}
const TotalStakedBalance = (props: IStakedProps) => {
  const { data, error, isLoading, tokenAddress } = props;

  const tokenData = supportedTokens()[tokenAddress];

  if (isLoading || error || ((data === null || isNaN(data) || data.isZero()) && tokenData.symbol !== genName())) {
    return null;
  }
  return (
    <li key={tokenAddress}>
      <strong>{formatTokens(data, tokenData["symbol"], tokenData["decimals"])}</strong>
    </li>
  );
};

const SubscribedTotalStakedBalance = withSubscription({
  wrappedComponent: TotalStakedBalance,
  checkForUpdate: (oldProps: IStakedProps, newProps: IStakedProps) => {
    return oldProps.stakingContractAddress !== newProps.stakingContractAddress;
  },
  createObservable: async (props: IStakedProps) => {
    const arc = getArc();
    const token = new Token(props.tokenAddress, arc);

    return token.balanceOf((props.stakingContractAddress)).pipe(ethErrorHandler());
  },
});

/***** Token Balance *****/
interface ITokenProps extends ISubscriptionProps<any> {
  dao: IDAOState;
  tokenAddress: string;
}
const TokenBalance = (props: ITokenProps) => {
  const { data, error, isLoading, tokenAddress } = props;

  const tokenData = supportedTokens()[tokenAddress];
  if (isLoading || error || ((data === null || isNaN(data)) && tokenData.symbol !== genName())) {
    return null;
  }

  return (
    <li key={tokenAddress}>
      <strong>{formatTokens(data, tokenData["symbol"], tokenData["decimals"])}</strong>
    </li>
  );
};

const SubscribedTokenBalance = withSubscription({
  wrappedComponent: TokenBalance,
  checkForUpdate: (oldProps: ITokenProps, newProps: ITokenProps) => {
    return oldProps.dao.address !== newProps.dao.address || oldProps.tokenAddress !== newProps.tokenAddress;
  },
  createObservable: async (props: ITokenProps) => {
    // General cache priming for the DAO we do here
    // prime the cache: get all members fo this DAO -
    const daoState = props.dao;
    await daoState.dao.members({ first: 1000, skip: 0 }).pipe(first()).toPromise();

    const arc = getArc();
    const token = new Token(props.tokenAddress, arc);

    return token.balanceOf(props.dao.address).pipe(ethErrorHandler());
  },
});

const SubscribedSidebarMenu = withSubscription({
  wrappedComponent: SidebarMenu,
  checkForUpdate: ["daoAvatarAddress"],
  loadingComponent: <div></div>,
  createObservable: (props: IProps) => {
    if (props.daoAvatarAddress) {
      const lastAccessDate = localStorage.getItem(`daoWallEntryDate_` + props.daoAvatarAddress) || "0";

      const promise = axios.get(`https://disqus.com/api/3.0/threads/listPosts.json?api_key=KVISHbDLtTycaGw5eoR8aQpBYN8bcVixONCXifYcih5CXanTLq0PpLh2cGPBkM4v&forum=${process.env.DISQUS_SITE}&thread:ident=${props.daoAvatarAddress}&since=${lastAccessDate}&limit=1&order=asc`)
        .then((response: AxiosResponse<any>): IHasNewPosts => {
          if (response.status) {
            const posts = response.data.response;
            return { hasNewPosts : posts && posts.length };
          } else {
            // eslint-disable-next-line no-console
            console.error(`request for disqus posts failed: ${response.statusText}`);
            return { hasNewPosts : false };
          }
        })
        .catch((error: Error): IHasNewPosts => {
          // eslint-disable-next-line no-console
          console.error(`request for disqus posts failed: ${error.message}`);
          return { hasNewPosts : false };
        });

      const arc = getArc();
      return combineLatest(arc.dao(props.daoAvatarAddress).state({ subscribe: true }), from(promise));
    } else {
      return of(null);
    }
  },
});
//@ts-ignore
const withTrans = withTranslation()(SubscribedSidebarMenu)
export default connect(mapStateToProps, mapDispatchToProps)(withTrans);
