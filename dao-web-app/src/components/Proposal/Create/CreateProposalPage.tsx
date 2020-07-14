import { ISchemeState } from "@daostack/client";
import { getArc } from "arc";
import CreateKnownGenericSchemeProposal from "components/Proposal/Create/SchemeForms/CreateKnownGenericSchemeProposal";
import CreateSchemeRegistrarProposal from "components/Proposal/Create/SchemeForms/CreateSchemeRegistrarProposal";
import CreateUnknownGenericSchemeProposal from "components/Proposal/Create/SchemeForms/CreateUnknownGenericSchemeProposal";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import { GenericSchemeRegistry } from "genericSchemeRegistry";
import { History } from "history";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { connect } from "react-redux";
import { IRootState } from "reducers";
import { RouteComponentProps } from "react-router-dom";
import { CrxRewarderComponentType, getCrxRewarderComponent, rewarderContractName } from "components/Scheme/ContributionRewardExtRewarders/rewardersProps";
import CreateContributionRewardProposal from "components/Proposal/Create/SchemeForms/CreateContributionRewardProposal";
import { schemeName } from "lib/schemeUtils";
import * as css from "./CreateProposal.scss";
import { withTranslation } from 'react-i18next';


type IExternalProps = RouteComponentProps<any>;

interface IExternalStateProps {
  daoAvatarAddress: string;
  history: History;
  schemeId: string;
}

interface IStateProps {
  createCrxProposalComponent: any;
}

type IProps = IExternalProps & IExternalStateProps & ISubscriptionProps<ISchemeState>;

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IExternalStateProps => {
  return {
    ...ownProps,
    daoAvatarAddress: ownProps.match.params.daoAvatarAddress,
    schemeId: ownProps.match.params.schemeId,
  };
};

class CreateProposalPage extends React.Component<IProps, IStateProps> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      createCrxProposalComponent: null,
    };
  }

  public handleClose = (e: any) => {
    e.preventDefault();
    this.doClose();
  }

  public doClose = () => {
    const { history, schemeId } = this.props;
    history.push("/dao/scheme/" + schemeId);
  }

  public async componentDidMount() {
    document.addEventListener("keydown", this.handleKeyPress, false);
    const newState = {};

    /**
     * Get the "CreateProposal" modal dialog component supplied by the rewarder contract associated
     * with this CrExt scheme (if it is a CrExt scheme -- very cheap if not a CrExt).
     */
    if (!this.state.createCrxProposalComponent) {
      Object.assign(newState, { createCrxProposalComponent: await getCrxRewarderComponent(this.props.data, CrxRewarderComponentType.CreateProposal) });
    }

    this.setState(newState);
  }

  public componentWillUnmount(){
    document.removeEventListener("keydown", this.handleKeyPress, false);
  }

  private handleKeyPress = (e: any) => {
    // Close modal on ESC key press
    if (e.keyCode === 27) {
      this.doClose();
    }
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const daoAvatarAddress = this.props.data.dao;
    let scheme = this.props.data;

    let createSchemeComponent = <div />;
    


    const props = {
      daoAvatarAddress,
      handleClose: this.doClose,
      scheme,
    };
    const schemeTitle = this.state.createCrxProposalComponent ? rewarderContractName(scheme) : schemeName(scheme);
    scheme.name = schemeName(scheme);

    console.log("Proposals page: ", props, scheme)

    if (this.state.createCrxProposalComponent) {
      createSchemeComponent = <this.state.createCrxProposalComponent {...props} />;
    } else if (scheme.name === "ContributionReward" || scheme.name === "Grants") {
      createSchemeComponent = <CreateContributionRewardProposal {...props}  />;
    } else if (scheme.name === "SchemeRegistrar") {
      createSchemeComponent = <CreateSchemeRegistrarProposal {...props} />;
    } else if (scheme.name === "GenericScheme") {
      const genericSchemeRegistry = new GenericSchemeRegistry();
      let contractToCall: string;
      if (scheme.genericSchemeParams) {
        contractToCall  = scheme.genericSchemeParams.contractToCall;
      } else if (scheme.uGenericSchemeParams) {
        // TODO: these lins are a workaround because of a  subgraph bug: https://github.com/daostack/subgraph/issues/342
        contractToCall  = scheme.uGenericSchemeParams.contractToCall;
      } else {
        throw Error("No contractToCall for this genericScheme was found!");
      }
      const genericSchemeInfo = genericSchemeRegistry.getSchemeInfo(contractToCall);
      if (genericSchemeInfo) {
        createSchemeComponent = <CreateKnownGenericSchemeProposal  {...props} genericSchemeInfo={genericSchemeInfo} />;
      } else {
        createSchemeComponent = <CreateUnknownGenericSchemeProposal {...props} />;
      }
    } else if (scheme.name === "UGenericScheme") {
      const genericSchemeRegistry = new GenericSchemeRegistry();
      const genericSchemeInfo = genericSchemeRegistry.getSchemeInfo(props.scheme.uGenericSchemeParams.contractToCall);
      if (genericSchemeInfo) {
        createSchemeComponent = <CreateKnownGenericSchemeProposal  {...props} genericSchemeInfo={genericSchemeInfo} />;
      } else {
        createSchemeComponent = <CreateUnknownGenericSchemeProposal {...props} />;
      }
    }

    return (
      <div className={css.createProposalWrapper}>
        <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/proposals/create`}>{t('notifications.create')}</BreadcrumbsItem>
        <h2 className={css.header}>
          <span>{t("schema.newProposal")} <b>| {schemeTitle}</b></span>
          <button className={css.closeButton} aria-label={t('proposal.closeCreateModal')} onClick={this.handleClose}>&times;</button>
        </h2>
        { createSchemeComponent }
      </div>
    );
  }
}

const SubscribedCreateProposalPage = withSubscription({
  wrappedComponent: CreateProposalPage,
  loadingComponent: <Loading/>,
  errorComponent: null,
  checkForUpdate: ["daoAvatarAddress"],
  createObservable: (props: IExternalStateProps) => {
    const arc = getArc();
    const scheme = arc.scheme(props.schemeId);
    return scheme.state();
  },
});
//@ts-ignore
export default connect(mapStateToProps)(withTranslation()(SubscribedCreateProposalPage));
