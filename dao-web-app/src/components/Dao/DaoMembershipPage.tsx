import { Address, IDAOState, IProposalStage, Proposal, Vote, Scheme, Stake } from "@daostack/client";
import { getArc, enableWalletProvider, getArcSettings } from "arc";
import * as arcActions from "../../actions/arcActions";
import { showNotification } from "../../reducers/notifications";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import gql from "graphql-tag";
import * as React from "react";
// import * as InfiniteScroll from "react-infinite-scroll-component";
import { /* Link, */ RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { first } from "rxjs/operators";
// import ProposalHistoryRow from "../Proposal/ProposalHistoryRow";
import { /*ErrorMessage, */ Field, Form, Formik, FormikProps } from "formik";
import * as css from "./Dao.scss";
import * as errCss from "./DaoJoin.scss"
import { IRootState } from "reducers";
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';


const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

interface IStateProps {
  currentAccountAddress: String;
}

interface IState {
  membershipFee: string;
  alreadyStaked: string;
  snglsBalance: string;
  fieldValue: number
}

interface IFormValues {
  snglsToSend: number;
  [key: string]: any;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

type SubscriptionData = Proposal[];
type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<SubscriptionData>;

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {
  return {...ownProps,
    currentAccountAddress: state.web3.currentAccountAddress,
  };
};


class DaoMembershipFeeStakingPage extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.autoAmount = this.autoAmount.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.fetchBalances = this.fetchBalances.bind(this);
    this.state = {
      membershipFee: "0.00",
      alreadyStaked: "0.00",
      snglsBalance: "0.00",
      fieldValue: 0.00
    };
  }

  public autoAmount() {
    this.setState({
      fieldValue: parseFloat(this.state.membershipFee) - parseFloat(this.state.alreadyStaked)
    });
  }

  public onChangeHandler(e: any) {

  }
  public async fetchBalances() {
    const arc = getArc();
    const settings = getArcSettings();

    const feeContract = new arc.web3.eth.Contract(
      settings.feesContractABI,
      settings.feesContractAddress
    );
    const memFeeStakingContract = new arc.web3.eth.Contract(settings.membershipFeeStakingContractABI, settings.membershipFeeStakingContractAddress);

    // Create contract object
    const snglsTokenContract = new arc.web3.eth.Contract(settings.snglsTokenContractABI, settings.snglsTokenContractAddress);

    const staked = await memFeeStakingContract.methods.lockers(this.props.currentAccountAddress).call()
    this.setState( 
      { 
        membershipFee:  arc.web3.utils.fromWei(await feeContract.methods.membershipFee().call(), 'ether'),
        alreadyStaked: arc.web3.utils.fromWei(staked.amount, 'ether'),
        snglsBalance: arc.web3.utils.fromWei(await snglsTokenContract.methods.balanceOf(this.props.currentAccountAddress).call(), 'ether'),
        fieldValue: 0
      }
    );
  }

  public async componentDidMount() {
    this.fetchBalances();
  }

  public handleSubmit = async (values: IFormValues, { _setSubmitting }: any ): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) {
      return;
    }
    const arc = getArc();
    const settings = getArcSettings();

    const memFeeStakingContract = new arc.web3.eth.Contract(settings.membershipFeeStakingContractABI, settings.membershipFeeStakingContractAddress);
    const tokenContract = new arc.web3.eth.Contract(settings.snglsTokenContractABI, settings.snglsTokenContractAddress);

    const tokenDecimals = arc.web3.utils.toBN(18);
    const tokenAmountToApprove = arc.web3.utils.toBN(values.snglsToSend);
    const calculatedApproveValue = arc.web3.utils.toHex(tokenAmountToApprove.mul(arc.web3.utils.toBN(10).pow(tokenDecimals)));

    const currentAccountAddress = this.props.currentAccountAddress;
    tokenContract.methods.approve(settings.membershipFeeStakingContractAddress, calculatedApproveValue).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
      if (error) throw error;
    }).then(function () {
      memFeeStakingContract.methods.lock(calculatedApproveValue, settings.minLockingPeriod).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
        console.log(error);
        if (error) throw error;
         this.fetchBalances();
      });
    });
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    // const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress } = this.props;

    // console.log("HISTORY render <<<<<<<<<<<==============================", this.props)


    // const proposals = data;

    // const proposalsHTML = proposals.map((proposal: Proposal) => {
    //   return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    // });

    return(
      <div className={css.Membership}>
        {/* <Sticky enabled top={50} innerZ={10000}> */}
          {/* <h2 className={css.daoHistoryHeader}>
            Membership
          </h2> */}
        {/* </Sticky> */}

        <div>
        { /* create membership control here */ }







          <div className={css.MembershipBlock}>
            <div className={css.icon}>
              <img src="/assets/images/Icon/dash_holdings.png" />
            </div>
        <h2>{t("membership.memFee")}</h2>
            <p>{t("membership.amountNeedToStake")}</p>

            <h5>{t("membership.minAmountRequired")} <strong> { this.state.membershipFee.toString() } </strong></h5>

            <hr/>

            <div className={css.content}>
              <p>{t("membership.confAuto")} <strong>( { parseInt(this.state.membershipFee) - parseInt(this.state.alreadyStaked) < 0 ? 0 : parseInt(this.state.membershipFee) - parseInt(this.state.alreadyStaked) } )</strong> {t("membership.orEnterManually")}</p>
              <Formik
                
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                initialValues={{
                  snglsToSend: 0,
                } as IFormValues}
                /*
                validate={(values: IFormValues): void => {
                  const errors: any = {};
                  const nonNegative = (name: string): void => {
                    if ((values as any)[name] < 0) {
                      errors[name] = t("errors.nonNegative");
                    }
                  };
   
                  nonNegative("ethReward");
                  if (!values.ethReward && !values.reputationReward && !values.externalTokenReward && !values.snglsToSend) {
                    errors.rewards = t("proposal.pleaseSelectAtLeastSomeReward");
                  }
      
                  // return errors;
                }}
                */
                onSubmit={this.handleSubmit}

                // eslint-disable-next-line react/jsx-no-bind
                render={({
                  errors,
                  touched,
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  handleSubmit,
                  isSubmitting,
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  setFieldTouched,
                  setFieldValue,
                }: FormikProps<IFormValues>) =>
                <div className={css.bigInput}>
                  <Form noValidate>
                    <div className={css.formLabel}>

                      <label>SNGLS</label>
                      <Field
                        id="snglsToSendInput"
                        maxLength={10}
                        placeholder=""
                        name="snglsToSend"
                        type="number"
                        className={touched.snglsToSend && errors.nativeTokenReward ? errCss.error : null}
                      />
                      <button type="button" className={css.auto} onClick= { () => { setFieldValue("snglsToSend",  (parseInt(this.state.membershipFee) - parseInt(this.state.alreadyStaked) < 0 ? 0 : parseInt(this.state.membershipFee) - parseInt(this.state.alreadyStaked))) }} >
                        auto
                      </button>
                    </div>
                    <div className={css.bigInputFoot}>
                      <span>{t("membership.alreadyStaked")}  {parseInt(this.state.alreadyStaked)} </span>
                      <span>{t("membership.balance")}  {parseInt(this.state.snglsBalance)} {"SNGLS"}</span>
                    </div>
                    <hr />
                    <button type="submit" className={css.stakeSubmit}>{t("membership.stake")}</button>
                    <hr />
                    <button type="button" className={css.unstake}>{t("membership.unstake")}</button>
                  </Form>
                </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const SubscribedDaoMembershipFeeStakingPage = withSubscription({
  wrappedComponent: DaoMembershipFeeStakingPage,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <div>{ props.error.message }</div>,

  checkForUpdate: [],

  createObservable: async (props: IExternalProps) => {
    const arc = getArc();
    const dao = props.daoState.dao;
    // this query will fetch al data we need before rendering the page, so we avoid hitting the server
    // with all separate queries for votes and stakes and stuff...
    let voterClause = "";
    let stakerClause = "";
    if (props.currentAccountAddress) {
      voterClause = `(where: { voter: "${props.currentAccountAddress}"})`;
      stakerClause = `(where: { staker: "${props.currentAccountAddress}"})`;

    }
    const prefetchQuery = gql`
      query prefetchProposalDataForDAOHistory {
        proposals (
          first: ${PAGE_SIZE}
          skip: 0
          orderBy: "closingAt"
          orderDirection: "desc"
          where: {
            dao: "${props.daoState.address}"
            stage_in: [
              "${IProposalStage[IProposalStage.ExpiredInQueue]}",
              "${IProposalStage[IProposalStage.Executed]}",
              "${IProposalStage[IProposalStage.Queued]}"
            ]
            closingAt_lte: "${Math.floor(new Date().getTime() / 1000)}"
          }
        ){
          ...ProposalFields
          votes ${voterClause} {
            ...VoteFields
          }
          stakes ${stakerClause} {
            ...StakeFields
          }
        }
      }
      ${Proposal.fragments.ProposalFields}
      ${Vote.fragments.VoteFields}
      ${Stake.fragments.StakeFields}
      ${Scheme.fragments.SchemeFields}
    `;
    await arc.getObservable(prefetchQuery, { subscribe: true }).pipe(first()).toPromise();
    return dao.proposals({
      where: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        stage_in: [IProposalStage.ExpiredInQueue, IProposalStage.Executed, IProposalStage.Queued],
        // eslint-disable-next-line @typescript-eslint/camelcase
        closingAt_lte: Math.floor(new Date().getTime() / 1000),
      },
      orderBy: "closingAt",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: 0,
    }, { fetchAllData: true } // get and subscribe to all data, so that subcomponents do nto have to send separate queries
    );
  },

  // used for hacky pagination tracking
  pageSize: PAGE_SIZE,

  getFetchMoreObservable: (props: IExternalProps, data: SubscriptionData) => {
    const dao = props.daoState.dao;
    return dao.proposals({
      where: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        stage_in: [IProposalStage.ExpiredInQueue, IProposalStage.Executed, IProposalStage.Queued],
        // eslint-disable-next-line @typescript-eslint/camelcase
        closingAt_lte: Math.floor(new Date().getTime() / 1000),
      },
      orderBy: "closingAt",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: data.length,
    }, { fetchAllData: true } // get and subscribe to all data, so that subcomponents do nto have to send separate queries
    );
  },
});

//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedDaoMembershipFeeStakingPage));