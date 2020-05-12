import { Address, IDAOState, IProposalStage, Proposal, Vote, Scheme, Stake } from "@daostack/client";
import { getArc } from "arc";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import gql from "graphql-tag";
import Analytics from "lib/analytics";
import { Page } from "pages";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
// import * as InfiniteScroll from "react-infinite-scroll-component";
import { /* Link, */ RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { first } from "rxjs/operators";
// import ProposalHistoryRow from "../Proposal/ProposalHistoryRow";
import * as css from "./Dao.scss";

const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

type SubscriptionData = Proposal[];
type IProps = IExternalProps & ISubscriptionProps<SubscriptionData>;

class DaoHistoryPage extends React.Component<IProps, null> {

  public componentDidMount() {
    console.log("HISTORY componentDidMount <<<<<<<<<<<==============================")
    Analytics.track("Page View", {
      "Page Name": Page.DAOHistory,
      "DAO Address": "0x5de00a6af66f8e6838e3028c7325b4bdfe5d329d",
      "DAO Name": this.props.daoState.name,
    });
  }

  public render(): RenderOutput {
    // const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress } = this.props;

    // console.log("HISTORY render <<<<<<<<<<<==============================", this.props)


    // const proposals = data;

    // const proposalsHTML = proposals.map((proposal: Proposal) => {
    //   return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    // });

    return(
      <div className={css.Membership}>
        <BreadcrumbsItem to={"/dao/history"}>History</BreadcrumbsItem>

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
            <h2>DAO Reputation</h2>
            <p>The amount of SNGLS needed to stake in the DAO <br/>so you don't have to pay the transaction fee.</p>

            <h5>Min amount required: <strong>9.85</strong></h5>

            <hr/>

            <div className={css.content}>
              <p>Confirm auto <strong>(9.85)</strong> or enter the amount manually:</p>
              <div className={css.bigInput}>
                <form action="">
                  <label>SNGLS</label>
                  <input type="text" max="7" />
                  <button>auto</button>
                </form>
                <div className={css.bigInputFoot}>
                  <span>Already staked: 0.00</span>
                  <span>Balance: 5.564 SNGLS</span>
                </div>
                <hr />
              </div>
              <button className={css.submit}>Stake</button>
              <button className={css.unstake}>unstake</button>
            </div>

          </div>




{/* v2 */}


          <div className={css.MembershipBlock}>
            <div className={css.MembershipBlockHead}>
                <div className={css.icon}>
                    <img src="/assets/images/Icon/dash_holdings.png" />
                </div>
                <div>
                    <h2>Membership fee</h2>
                    <p>The amount of SNGLS needed to stake in the DAO <br />so you don't have to pay the transaction fee.</p>

                    <p>Min amount required: <strong>9.85</strong></p>
                </div>
            </div>
            <hr />

            <div className={css.content}>
              <p>Confirm auto <strong>(9.85)</strong> or enter the amount manually:</p>
              <div className={css.bigInput}>
                <form action="">
                  <label>SNGLS</label>
                  <input type="text" max="7" className={css.white} />
                    <button className={css.disable}>auto</button>
                </form>
                <div className={css.bigInputFoot}>
                  <span>Already staked: 0.00</span>
                  <span>Balance: 5.564 SNGLS</span>
                </div>
                <hr />
              </div>
              <button className={css.submit}>Stake</button>
              <button className={css.unstake}>unstake</button>
            </div>

          </div>

















        </div>
        
      </div>
    );
  }
}

export default withSubscription({
  wrappedComponent: DaoHistoryPage,
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
            dao: "${"0x5de00a6af66f8e6838e3028c7325b4bdfe5d329d"}"
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
