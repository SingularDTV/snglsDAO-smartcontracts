import { History } from "history";
import { first, filter, toArray, mergeMap } from "rxjs/operators";
import { Address, IProposalStage, IDAOState, ISchemeState, IProposalState, IProposalOutcome } from "@daostack/client";
import {enableWalletProvider, getArc, getArcSettings} from "arc";
import classNames from "classnames";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import { schemeName, getSchemeIsActive, PROPOSAL_SCHEME_NAMES } from "lib/schemeUtils";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { Helmet } from "react-helmet";
import { Link, Route, RouteComponentProps, Switch } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { showNotification } from "reducers/notifications";
import { IRootState } from "reducers";
import { connect } from "react-redux";
import TrainingTooltip from "components/Shared/TrainingTooltip";
import { combineLatest, Observable, of } from "rxjs";
import { ICrxRewarderProps, getCrxRewarderProps, hasRewarderContract, CrxRewarderComponentType, getCrxRewarderComponent } from "components/Scheme/ContributionRewardExtRewarders/rewardersProps";
import ReputationFromToken from "./ReputationFromToken";
import SchemeInfoPage from "./SchemeInfoPage";
import SchemeProposalsPage from "./SchemeProposalsPage";
import SchemeOpenBountyPage from "./SchemeOpenBountyPage";
import * as css from "./Scheme.scss";
import { withTranslation } from 'react-i18next';


interface IDispatchProps {
  showNotification: typeof showNotification;
}

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  history: History;
  daoState: IDAOState;
}

interface IExternalState {
  schemeId: Address;
}

interface IState {
  crxListComponent: any;
  crxRewarderProps: ICrxRewarderProps;
  transactionFee: number;
  listingFee: number;
  validationFee: number;
  membershipFee: number;
}

type IProps = IExternalProps & IDispatchProps & IExternalState & ISubscriptionProps<[ISchemeState, Array<IProposalState>]>;

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IExternalState => {
  const match = ownProps.match;

  return {
    ...ownProps,
    schemeId: match.params.schemeId,
  };
};

const mapDispatchToProps = {
  showNotification,
};

class SchemeContainer extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      crxListComponent: null,
      crxRewarderProps: null,

      transactionFee: 0,
      listingFee: 0,
      validationFee: 0,
      membershipFee: 0,
    };
  }

  public handleNewProposal = async (): Promise<void> => {
    const { schemeId, showNotification, /*daoState*/ } = this.props;

    if (!await enableWalletProvider({ showNotification })) { return; }

    this.props.history.push(`/dao/scheme/${schemeId}/proposals/create/`);
  };

  private schemeInfoPageHtml = (props: any) => <SchemeInfoPage {...props} daoState={this.props.daoState} scheme={this.props.data[0]} />;
  private schemeProposalsPageHtml = (isActive: boolean) => (props: any) => <SchemeProposalsPage {...props} isActive={isActive} daoState={this.props.daoState} currentAccountAddress={this.props.currentAccountAddress} scheme={this.props.data[0]} />;
  private contributionsRewardExtTabHtml = () => (props: any) =>
  {
    if (!this.state.crxListComponent) {
      return null;
    }

    return <this.state.crxListComponent {...props} daoState={this.props.daoState} scheme={this.props.data[0]} proposals={this.props.data[1]} />;
  };

  public async componentDidMount() {
    const arc = getArc();

    const feesContract = new arc.web3.eth.Contract(getArcSettings().feesContractABI, getArcSettings().feesContractAddress);

    this.setState(
      {
        transactionFee: arc.web3.utils.fromWei(await feesContract.methods.transactionFee().call()),
        listingFee: arc.web3.utils.fromWei(await feesContract.methods.listingFee().call()),
        validationFee: arc.web3.utils.fromWei(await feesContract.methods.validationFee().call()),
        membershipFee:  arc.web3.utils.fromWei(await feesContract.methods.membershipFee().call()),

      }
    );

    if (!this.state.crxRewarderProps) {
      this.setState({ crxRewarderProps: await getCrxRewarderProps(this.props.data[0]) })
    }

    if (!this.state.crxListComponent) {
      this.setState({ crxListComponent: await getCrxRewarderComponent(this.props.data[0], CrxRewarderComponentType.List) })
    }
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { transactionFee, listingFee, validationFee, membershipFee } = this.state;
    const { schemeId, daoState } = this.props;
    const daoAvatarAddress = daoState.address;
    let schemeState = this.props.data[0];
    const approvedProposals = this.props.data[1];

    if (schemeState.name === "ReputationFromToken") {
      return <ReputationFromToken {...this.props} daoAvatarAddress={daoAvatarAddress} schemeState={schemeState} />;
    }
    
    let isActive = getSchemeIsActive(schemeState);

    if (schemeState.id === getArcSettings().grantsSchemeID) {
      schemeState.name = "Grants";
      isActive = true;
    }

    const isProposalScheme = PROPOSAL_SCHEME_NAMES.includes(schemeState.name);

    const proposalsTabClass = classNames({
      [css.proposals]: true,
      [css.active]: isProposalScheme && !this.props.location.pathname.includes("info") && !this.props.location.pathname.includes("crx") && !this.props.location.pathname.includes("open"),
    });
    const infoTabClass = classNames({
      [css.info]: true,
      [css.active]: !isProposalScheme || this.props.location.pathname.includes("info"),
    });
    const openBountiesTabClass = classNames({
      [css.openbounty]: true,
      [css.active]: this.props.location.pathname.includes("openbounties"),
    });

    const crxTabClass = classNames({
      [css.crx]: true,
      [css.active]: this.props.location.pathname.includes("crx"),
    });
    const schemeFriendlyName = schemeName(schemeState, schemeState.address);


    return (
      <div className={css.schemeContainer}>

        <BreadcrumbsItem to={`/dao/scheme/${schemeId}`}>{schemeFriendlyName}</BreadcrumbsItem>
        <Helmet>
          <meta name="description" content={daoState.name + " | " + schemeState.name + " proposals | Managed on Alchemy by DAOstack"} />
          <meta name="og:description" content={daoState.name + " | " + schemeState.name + " proposals | Managed on Alchemy by DAOstack"} />
          <meta name="twitter:description" content={daoState.name + " | " + schemeState.name + " proposals | Managed on Alchemy by DAOstack"} />
        </Helmet>

        {/* <Sticky enabled top={50} innerZ={10000}> */}
          <h2 className={css.schemeName}>
              {t(schemeFriendlyName)}
          </h2>
          {
            schemeFriendlyName === "Protocol Parameters" &&
            <div className={css.schemeTop}>
              <div className={css.Item}>
                <div className={css.icon}><img src="/assets/images/Icon/dash_validation.png" /></div>
                <div>{t('membership.memFee')}: {membershipFee} SNGLS</div>
              </div>
              <div className={css.Item}>
                <div className={css.icon}><img src="/assets/images/Icon/dash_listing_rate.png" /></div>
                <div>{t('proposal.listingFee')}: {listingFee} SNGLS</div>
              </div>
              <div className={css.Item}>
                <div className={css.icon}><img src="/assets/images/Icon/dash_transaction.png" /></div>
                <div>{t('proposal.transFee')}: {transactionFee} %</div>
              </div>
              <div className={css.Item}>
                <div className={css.icon}><img src="/assets/images/Icon/dash_validation.png" /></div>
                <div>{t('dashboard.validationFee')}: {validationFee} SNGLS</div>
              </div>
            </div>
          }
          <div className={css.schemeMenu}>
            {isProposalScheme
              ? <Link className={proposalsTabClass} to={`/dao/scheme/${schemeId}/proposals/`}>{t("schema.proposal")}</Link>
              : ""}

            { // if Bounties Scheme, create new tab
              (schemeName(schemeState, schemeState.address) === "Standard Bounties") &&
              <Link className={openBountiesTabClass} to={`/dao/scheme/${schemeId}/openbounties/`}>{t("schema.openBounties")}</Link>
            }

            <TrainingTooltip placement="top" overlay={t("tooltips.learnAboutSchemaProtParams")}>
              <Link className={infoTabClass} to={`/dao/scheme/${schemeId}/info/`}>{t("schema.Information")}</Link>
            </TrainingTooltip>
            {
              this.state.crxRewarderProps ?
                <TrainingTooltip placement="top" overlay={this.state.crxRewarderProps.shortDescription}>
                  <Link className={crxTabClass} to={`/dao/scheme/${schemeId}/crx/`}>{this.state.crxRewarderProps.friendlyName} ({approvedProposals.length})</Link>
                </TrainingTooltip>
                : ""
            }

          {isProposalScheme ?
            <div className={css.createProposal}>
              <a className={
                classNames({
                  [css.createProposal]: true,
                  [css.disabled]: !isActive,
                })}
                 data-test-id="createProposal"
                 href="#!"
                 onClick={isActive ? this.handleNewProposal : null}
              >
                {t('schema.newProposal', { proposal: this.state.crxRewarderProps ? this.state.crxRewarderProps.contractName : schemeFriendlyName })}
              </a>
            </div>
            : ""}


          </div>


        {/* </Sticky> */}

        <div className={css.blockCont}>
        <div>
        <Switch>

          <Route exact path="/dao/scheme/:schemeId/openbounties"
            render={(props) => <SchemeOpenBountyPage {...props} daoAvatarAddress={daoAvatarAddress} scheme={schemeState} />} />
          <Route exact path="/dao/scheme/:schemeId/info" render={this.schemeInfoPageHtml} />
          {
            this.state.crxRewarderProps ?
              <Route exact path="/dao/scheme/:schemeId/crx" render={this.contributionsRewardExtTabHtml()} />
              : ""
          }
          <Route path="/dao/scheme/:schemeId" render={isProposalScheme ? this.schemeProposalsPageHtml(isActive) : this.schemeInfoPageHtml} />
        </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const SubscribedSchemeContainer = withSubscription({
  wrappedComponent: SchemeContainer,
  loadingComponent: <Loading/>,
  errorComponent: null,
  checkForUpdate: ["schemeId"],
  createObservable: async (props: IProps) => {
    const arc = getArc();
    const scheme = arc.scheme(props.schemeId) as any;

    // TODO: this may NOT be the best place to do this - we'd like to do this higher up
    // why are we doing this for all schemes and not just the scheme we care about here?
    await props.daoState.dao.proposals(
      // eslint-disable-next-line @typescript-eslint/camelcase
      {where: { stage_in: [IProposalStage.Boosted, IProposalStage.QuietEndingPeriod, IProposalStage.Queued, IProposalStage.PreBoosted, IProposalStage.Executed ]}},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      { fetchAllData: true, subscribe: true }).subscribe(()=>{});
    // end cache priming

    const schemeState = await scheme.state().pipe(first()).toPromise();
    /**
     * hack alert.  These approvaed proposals are for the Competition scheme.
     * Doesn't smell right to be doing Competition-specific stuff in the
     * context of this component.
     * However, it seems likely that this could be needed by other CrExt rewarder
     * contracts that might come along.
     */
    let  approvedProposals: Observable<Array<IProposalState>>;
    if (hasRewarderContract(schemeState)) {
      approvedProposals = props.daoState.dao.proposals(
        // eslint-disable-next-line @typescript-eslint/camelcase
        { where: { scheme: scheme.id, stage_in: [IProposalStage.Executed]},
          orderBy: "closingAt",
          orderDirection: "desc",
        },
        { subscribe: true, fetchAllData: true })
        .pipe(
          // work on each array individually so that toArray can perceive closure on the stream of items in the array
          mergeMap(proposals => of(proposals).pipe(
            mergeMap(proposals => proposals),
            mergeMap(proposal => proposal.state().pipe(first())),
            filter((proposal: IProposalState) => proposal.winningOutcome === IProposalOutcome.Pass ),
            toArray())
          )
        );
    } else {
      approvedProposals = of([]);
    }

    return combineLatest(
      of(schemeState),
      approvedProposals
    );
  },
});
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedSchemeContainer));
