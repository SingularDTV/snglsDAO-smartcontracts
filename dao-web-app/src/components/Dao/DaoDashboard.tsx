import { Address, IDAOState, IProposalStage, Proposal, Vote, Scheme, Stake/*, Member*/ } from "@daostack/client";
import { enableWalletProvider,  getArc } from "arc";
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
import classNames from "classnames";
import { withTranslation } from 'react-i18next';


// import { IProfilesState } from "reducers/profilesReducer";

// import DaoMember from "./DaoMember";


const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

type SubscriptionData = Proposal[];

type IProps = IExternalProps & ISubscriptionProps<SubscriptionData>;

interface IState {
  transactionFee: string;
  listingFee: string;
  validationFee: string;
  membershipFee: string;
}

class DaoHistoryPage extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      transactionFee: "0",
      listingFee: "0",
      validationFee: "0",
      membershipFee: "0"
    };
  }

  private async handleNewProposal(): Promise<void> {
    if (!await enableWalletProvider({ showNotification: true })) { return; }

    this.props.history.push(`/dao/dashboard/join/`);
    // this.props.history.push(`/dao/dashboard/join`);
  }

  private _handleNewProposal = (e: any): void => {
    this.handleNewProposal();
    e.preventDefault();
  };

  public async componentDidMount() {
    const arc = getArc();
    const feeContract = new arc.web3.eth.Contract([ { "constant": true, "inputs": [], "name": "listingFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "membershipFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "transactionFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "validationFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" } ],
      "0x58dC7440A7D37F200aFf06060DebedA2998d5B60"
    );
    
    this.setState( 
      { 
        transactionFee: arc.web3.utils.fromWei(await feeContract.methods.transactionFee().call()),
        listingFee: arc.web3.utils.fromWei(await feeContract.methods.listingFee().call()),
        validationFee: arc.web3.utils.fromWei(await feeContract.methods.validationFee().call()),
        membershipFee:  arc.web3.utils.fromWei(await feeContract.methods.membershipFee().call())
      }
    );
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress, t } = this.props;

    console.log("HISTORY render <<<<<<<<<<<==============================", this.props)
    
    // const members = data.members;

    const proposals = data;

    const proposalsHTML = proposals.map((proposal: Proposal) => {
      return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    });
    
    // const daoTotalRseputation = this.props.daoState.reputationTotalSupply;

    // const membersHTML = members.map((member) =>
    //   <DaoMember key={member.staticState.address} dao={daoState} daoTotalReputation={daoTotalReputation} member={member} profile={profiles[member.staticState.address]} />);

    return(
       <div className={css.membersContainer}>
         <BreadcrumbsItem to={"/dao/members"}>DAO Members</BreadcrumbsItem>
        
         <div className={css.pageHead}>
    <h1>{t("sidebar.dashboard")}</h1>
          <div>
            <a className={classNames({
                [css.redButton]: true,
                // [css.disabled]: !isActive,
              })}
              href="#!"
              onClick={/*isActive*/ true ? this._handleNewProposal : null}
              data-test-id="openJoin"
              > {t("daojoin.getRep")} </a>
          </div>
        </div>
         {/* Key parameters div */}
           <div> 
            <h3>{t('dashboard.keyParams')}</h3>




           <div className={css.keyParametrs}>

             <div className={css.dashBlock}>
                 <div className={css.icon}>
                         <img src="/assets/images/Icon/dash_listing_rate.png" />
                 </div>
                 <div className={css.count}>
                     { this.state.listingFee }
                 </div>
                 <div className={css.cont}>
            <h4>{t('dashboard.listingRate')}</h4>
                     <p>{t('dashboard.amountToTreasury')} <br/>{t('dashboard.toAddToProtocol')}</p>
                 </div>
             </div>

             {/* <p className={css.description}>These proposals might change the rate</p> */}

            
             <div className={css.dashBlock}>
                 <div className={css.icon}>
                         <img src="/assets/images/Icon/dash_transaction.png" />
                 </div>
                 <div className={css.count}>
                     { this.state.transactionFee }
                 </div>
                 <div className={css.cont}>
                     <h4>{t('dashboard.transFee')}</h4>
                     <p>{t('dashboard.transFeeDescription')}</p>
                 </div>
             </div>

           </div>


         <div className={css.comingSoon}>
             <h3>{t('dashboard.comingSoon')}</h3>
             <div className={css.dashBlock}>
                 <div className={css.icon}>
                     <img src="/assets/images/Icon/dash_validation.png" />
                 </div>
                 <div className={css.count}>
                     { this.state.validationFee }
                 </div>
                 <div className={css.cont}>
                     <h4>{t('dashboard.validationFee')}</h4>
                     <p>{t('dashboard.minimumAmount')}</p>
                 </div>
             </div>
         </div>


         <div className={css.columnsTwo}>

             <div className={css.dashBlock}>
                 <div className={css.icon}>
                     <img src="/assets/images/Icon/dash_treasury.png" />
                 </div>
                 <div className={css.cont}>
                     <h4>{t('sidebar.treasury')}</h4>
                 </div>
                 <div className={css.count}>
                     <ul>
                         <li><span>Sngls:</span><p>2960</p></li>
                         <li><span>SGT:</span><p>543</p></li>
                         <li><span>ETH:</span><p>0</p></li>
                         <li><span>GEN:</span><p>0</p></li>
                         <li><span>USDC:</span><p>103</p></li>
                         <li><span>DAI:</span><p>0</p></li>
                     </ul>
                 </div>
             </div>

             <div className={css.dashBlock}>
                 <div className={css.icon}>
                     <img src="/assets/images/Icon/dash_holdings.png" />
                 </div>
                 <div className={css.cont}>
                     <h4>{t('sidebar.stakes')}</h4>
                 </div>
                 <div className={css.count}>
                     <ul>
                         <li><span>SGT:</span><p>2960</p></li>
                         <li><span>Sngls:</span><p>140000</p></li>
                     </ul>
                 </div>
             </div>

         </div>

           </div>
           <br/>
           <h4>{t('dashboard.boostedProposals')}</h4>
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
            <span>{t('dashboard.notPassedProposals')}<Link to={"/dao/proposal/"}>DAO&apos;s installed schemes</Link></span> :
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

        {/* <Sticky enabled top={50} innerZ={10000}> */}
          <div className={css.daoHistoryHeader}>
            {t('sidebar.history')}
          </div>
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
            <span>This DAO hasn&apos;t passed any proposals yet. Checkout the <Link to={"/dao/proposal/"}>DAO&apos;s installed schemes</Link> for any open proposals.</span> :
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



        {/* <h2>TOP MEMBERS</h2>
           <table className={css.memberHeaderTable}>
           <tbody className={css.memberTable + " " + css.memberTableHeading}>
             <tr>
               <td className={css.memberAvatar}></td>
               <td className={css.memberName}>Name</td>
               <td className={css.memberAddress}>Address</td>
               <td className={css.memberReputation}>Reputation</td>
               <td className={css.memberSocial}>Social Verification</td>
             </tr>
           </tbody>
         </table>
         <InfiniteScroll
          dataLength={members.length} //This is important field to render the next data
          next={this.props.fetchMore}
          hasMore={members.length < this.props.daoState.memberCount}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{textAlign: "center"}}>
              <b>&mdash;</b>
            </p>
          }
        >
          {membersHTML}
        </InfiniteScroll> */}
      </div>

    );
  }
}

const dashboardWithSubscription = withSubscription({
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
            dao: "${"0x230C5B874F85b62879DfBDC857D2230B2A0EBBC9"}"
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
    const proposals = dao.proposals({
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
    // const members = dao.members({
    //   orderBy: "balance",
    //   orderDirection: "desc",
    //   first: PAGE_SIZE,
    //   skip: 0,
    // });
    return proposals
  },

  // used for hacky pagination tracking
  pageSize: PAGE_SIZE,

  getFetchMoreObservable: (props: IExternalProps, data: SubscriptionData) => {
    const dao = props.daoState.dao;
    const proposals = dao.proposals({
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
    // const members = dao.members({
    //   orderBy: "balance",
    //   orderDirection: "desc",
    //   first: PAGE_SIZE,
    //   skip: data.members.length,
    // });
    return proposals
  },
});
//@ts-ignore
const dashboardWithTranslation = withTranslation()(dashboardWithSubscription)
export default dashboardWithTranslation
