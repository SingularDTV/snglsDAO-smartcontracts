import { Address, IDAOState, IProposalStage, Proposal, Vote, Scheme, Stake } from "@daostack/client";
import { getArc, getArcSettings } from "arc";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import gql from "graphql-tag";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import * as InfiniteScroll from "react-infinite-scroll-component";
import { Link, RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { first } from "rxjs/operators";
import ProposalHistoryRow from "../Proposal/ProposalHistoryRow";
import * as css from "./Dao.scss";
import { withTranslation } from 'react-i18next';


const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

type SubscriptionData = Proposal[];
type IProps = IExternalProps & ISubscriptionProps<SubscriptionData>;

class DaoHistoryPage extends React.Component<IProps, null> {

  public render(): RenderOutput {
    const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress } = this.props;
    //@ts-ignore
    const { t } = this.props;



    const proposals = data;

    const proposalsHTML = proposals.map((proposal: Proposal) => {
      return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    });

    return(
      <div>
        <BreadcrumbsItem to={"/dao/history"}>{t("sidebar.history")}</BreadcrumbsItem>

        {/* <Sticky enabled top={50} innerZ={10000}> */}
          <h2 className={css.daoHistoryHeader}>
          {t("sidebar.history")}
          </h2>
        {/* </Sticky> */}

        <InfiniteScroll
          dataLength={proposals.length} //This is important field to render the next data
          next={fetchMore}
          hasMore={hasMoreToLoad}
          loader=""
          style={{overflow: "visible"}}
          endMessage={
            <p style={{textAlign: "center"}}>
              <b>&mdash;</b>
            </p>
          }
        >
          { proposals.length === 0 ?
            <span>{t('dashboard.notPassedProposals')}<Link to={"/dao/proposal/"}></Link></span> :
            <table className={css.proposalHistoryTable}>
              <thead>
                <tr className={css.proposalHistoryTableHeader}>
                <th>{t('dashboard.proposedBy')}</th>
                  <th>{t('dashboard.endDate')}</th>
                  <th>{t('dashboard.plugin')}</th>
                  <th>{t('dashboard.title')}</th>
                  <th>{t('dashboard.votes')}</th>
                  <th>{t('dashboard.predictions')}</th>
                  <th>{t('dashboard.status')}</th>
                  <th>{t('dashboard.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {proposalsHTML}
              </tbody>
            </table>
          }
        </InfiniteScroll>

      </div>
    );
  }
}

const DaoHistoryWithSubscription = withSubscription({
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
            dao: "${getArcSettings().daoAvatarContractAddress}"
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
export default withTranslation()(DaoHistoryWithSubscription)
