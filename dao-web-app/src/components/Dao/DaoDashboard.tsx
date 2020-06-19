import { Address, IDAOState, Token, IProposalStage, Proposal, Vote, Scheme, Stake /*, Member*/ } from "@daostack/client";
import { enableWalletProvider,  getArc } from "arc";
import * as arcActions from "../../actions/arcActions";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import gql from "graphql-tag";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import * as InfiniteScroll from "react-infinite-scroll-component";
import { Link, RouteComponentProps } from "react-router-dom";
import { showNotification } from "reducers/notifications";
// import * as Sticky from "react-stickynode";
import { first } from "rxjs/operators";
import ProposalHistoryRow from "../Proposal/ProposalHistoryRow";
import * as css from "./Dao.scss";
import classNames from "classnames";
import { withTranslation } from 'react-i18next';

import { connect } from "react-redux";
import { baseTokenName, ethErrorHandler, formatTokens, genName, supportedTokens/*, fromWei*/ } from "lib/util";
// import { createGraphQlQuery, isAddress
//   // stringToUint8Array
//  } from './utils'
//  import { map } from 'rxjs/operators'

import BN = require("bn.js");

// import { IProfilesState } from "reducers/profilesReducer";

// import DaoMember from "./DaoMember";


const PAGE_SIZE = 50;

interface IExternalProps extends RouteComponentProps<any> {
  currentAccountAddress: Address;
  daoState: IDAOState;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

type SubscriptionData = Proposal[];

type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<SubscriptionData>;

interface IState {
  transactionFee: string;
  listingFee: string;
  validationFee: string;
  membershipFee: string;
  stakedSGT: string;
  stakedSNGLS: string;
  // snglsBalance: string;
  // sgtBalance: string;
  // ethBalance: string;
  // genBalance: string;
  // usdcBalance: string;
  // daiBalance: string;
  userReputation: string;
}

// const getUserRep = (daoAddress: string, userAddress: string, context: any) => {
  
//   let options: any = {
//     where: {

//     }
//   }
//     if (options.where.id) {
//       return new Member(options.where.id, context).state().pipe(map((r: any) => [r]))
//     } else {
//       let where = ''
//       for (const key of Object.keys(options.where)) {
//         if (options.where[key] === undefined) {
//           continue
//         }

//         if (key === 'address' || key === 'dao') {
//           const option = options.where[key] as string
//           isAddress(option)
//           options.where[key] = option.toLowerCase()
//         }

//         where += `${key}: "${options.where[key] as string}"\n`
//       }
//       where += ' dao_not: null\n'

//       const query = gql`
//         query ReputationHolderSearch {
//           reputationHolders ${createGraphQlQuery(options, where)} {
//             ...ReputationHolderFields
//           }
//         }
//         ${Member.fragments.ReputationHolderFields}
//       `

//       return context.getObservableList(
//           query,
//           (r: any) => new Member({ id: r.id, address: r.address, dao: r.dao.id, contract: r.contract}, context),
//           apolloQueryOptions
//         )
// }

class DaoDashboard extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      transactionFee: "0",
      listingFee: "0",
      validationFee: "0",
      membershipFee: "0",

      stakedSGT: "0.00",
      stakedSNGLS: "0",

      userReputation: "0",
    };
  }

  private async handleNewProposal(): Promise<void> {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

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
      "0xc7F243ccEEC5d8bD325cF159dbe7ad7a2B9384D9"
    );

    // const reputationStakingContractAddress = "0x1E44072256F56527F22134604C9c633eC4cEc86B";
    // const memFeeStakingContractAddress = "0x877fF27181f814a6249285f312ed708EEaC961b5";

    // const reputationContractAbi = [ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "Lock", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_beneficiary", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Release", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lockers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "releaseTime", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minLockingPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "sgtToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalLocked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "contract IERC20", "name": "_sgtToken", "type": "address" }, { "internalType": "uint256", "name": "_minLockingPeriod", "type": "uint256" } ], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];
    // const memFeeContractAbi = [ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "Lock", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_beneficiary", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Release", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lockers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "releaseTime", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minLockingPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "sgtToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalLocked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "contract IERC20", "name": "_sgtToken", "type": "address" }, { "internalType": "uint256", "name": "_minLockingPeriod", "type": "uint256" } ], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    // const reputationContract = new arc.web3.eth.Contract(reputationContractAbi, reputationStakingContractAddress);
    // const memFeeStakingContract = new arc.web3.eth.Contract(memFeeContractAbi, memFeeStakingContractAddress);

    // const reputationTotalStaked = arc.web3.utils.toBN(await reputationContract.methods.totalLocked().call());
    // const memFeeTotalStaked = arc.web3.utils.toBN(await memFeeStakingContract.methods.totalLocked().call());
    
    this.setState( 
      { 
        transactionFee: arc.web3.utils.fromWei(await feeContract.methods.transactionFee().call()),
        listingFee: arc.web3.utils.fromWei(await feeContract.methods.listingFee().call()),
        validationFee: arc.web3.utils.fromWei(await feeContract.methods.validationFee().call()),
        membershipFee:  arc.web3.utils.fromWei(await feeContract.methods.membershipFee().call()),

        // stakedSGT: (formatTokens(reputationTotalStaked, "SGT", 18)).split(' ')[0],
        // stakedSNGLS: (formatTokens(memFeeTotalStaked, "SNGLS", 18)).split(' ')[0]
      }
    );

    // console.log("DASHBOARD props ", this.props)
    // const daoMember = await this.props.daoState.dao.member("0x4fbeA1BECD2F3F24dcbdd59b2b609ABCDCDD6956"/* this.props.currentAccountAddress */)

    // console.log("MEMBER STATE ", await daoMember.state());




    // const daoMembers = await this.props.daoState.dao.members({
    //   orderBy: "balance",
    //   orderDirection: "desc",
    //   first: 5, 
    //   skip: 0,
    //   // address: this.props.currentAccountAddress
    // }).pipe(first()).toPromise();

    // console.log("DAOMEMBERS ON DASHBOARD", daoMember);
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { data, hasMoreToLoad, fetchMore, daoState, currentAccountAddress, t } = this.props;
    const proposals = data;



    console.log
    const proposalsHTML = proposals.map((proposal: Proposal) => {
      return (<ProposalHistoryRow key={"proposal_" + proposal.id} history={this.props.history} proposal={proposal} daoState={daoState} currentAccountAddress={currentAccountAddress} />);
    });
    
    // const daoTotalRseputation = this.props.daoState.reputationTotalSupply;

    // const membersHTML = members.map((member) =>
    //   <DaoMember key={member.staticState.address} dao={daoState} daoTotalReputation={daoTotalReputation} member={member} profile={profiles[member.staticState.address]} />);

    return(
       <div className={css.membersContainer}>
         <BreadcrumbsItem to={"/dao/members"}>{t("yourReputation")}</BreadcrumbsItem>
        
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
              <span className={css.reputationBalance}>{t("yourReputation")}<strong> 0.00% </strong></span>
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
                        <li key={ "ETH_balance" }><span>ETH:</span><p><SubscribedEthBalance dao={daoState} /></p></li>

                        {Object.keys(supportedTokens()).map((tokenAddress) => {
                          return  <li key={ supportedTokens()[tokenAddress]["symbol"] + "_balance" }>
                                    <span> 
                                      {  supportedTokens()[tokenAddress]["symbol"] } :
                                    </span>
                                    <p>
                                      <SubscribedTokenBalance tokenAddress={tokenAddress} dao={daoState} key={"token_" + tokenAddress} />
                                    </p>
                                  </li>;
                        })}
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
                         <li>
                            <span>SGT:</span>
                            <p>     
                             <SubscribedTotalStakedBalance stakingContractAddress={"0x1E44072256F56527F22134604C9c633eC4cEc86B"} tokenAddress={"0x498EE93981A2453a3F8b8939458977DF86dCce42"} key={"staked_token_" + "0x498EE93981A2453a3F8b8939458977DF86dCce42"} />       
                            </p>
                          </li>
                         <li>
                            <span>Sngls:</span>
                            <p>
                              <SubscribedTotalStakedBalance stakingContractAddress={"0x877fF27181f814a6249285f312ed708EEaC961b5"} tokenAddress={"0x4f0cF2Ca2BB02F76Ed298Da6b584AfeBeC1E44Ab"} key={"staked_token_" + "0x4f0cF2Ca2BB02F76Ed298Da6b584AfeBeC1E44Ab"} />
                            </p>
                          </li>
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
      </div>
    );
  }
}

const SubscribedGetRep = withSubscription({
  wrappedComponent: DaoDashboard,
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
            dao: "${"0xBAc15F5E55c0f0eddd2270BbC3c9b977A985797f"}"
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


/***** DAO ETH Balance *****/
interface IEthProps extends ISubscriptionProps<BN|null> {
  dao: IDAOState;
}

const ETHBalance = (props: IEthProps) => {
  const { data } = props;
  return <strong>{formatTokens(data)}</strong>;
};

const SubscribedEthBalance = withSubscription({
  wrappedComponent: ETHBalance,
  loadingComponent: <strong>... {baseTokenName()}</strong>,
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
    <strong>{formatTokens(data, tokenData["symbol"], tokenData["decimals"])}</strong>
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
  if (isLoading || error || ((data === null || isNaN(data) || data.isZero()) && tokenData.symbol !== genName())) {
    return null;
  }

  return (
      <strong>{ (formatTokens(data, tokenData["symbol"], tokenData["decimals"])).split(' ')[0] }</strong>
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
    return token.balanceOf(props.dao.address).pipe(ethErrorHandler())
  },
});

//@ts-ignore
const dashboardWithTranslation = withTranslation()(SubscribedGetRep)
export default connect(null, mapDispatchToProps)(dashboardWithTranslation);
