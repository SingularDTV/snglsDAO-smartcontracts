import { IDAOState, Member } from "@daostack/client";
import { getProfile } from "actions/profilesActions";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import Analytics from "lib/analytics";
import { Page } from "pages";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import * as InfiniteScroll from "react-infinite-scroll-component";
import { connect } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { IRootState } from "reducers";
import { IProfilesState } from "reducers/profilesReducer";
// import Web3 from 'web3'  

import { getArc } from "arc";


import DaoMember from "./DaoMember";
import * as css from "./Dao.scss";

interface IExternalProps extends RouteComponentProps<any> {
  daoState: IDAOState;
}

interface IStateProps {
  profiles: IProfilesState;
}

interface IState {
  transactionFee: string;
  listingFee: string;
  validationFee: string;
  membershipFee: string;
}

const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {

  return {
    ...ownProps,
    profiles: state.profiles,
  };
};

interface IDispatchProps {
  getProfile: typeof getProfile;
}

const mapDispatchToProps = {
  getProfile,
};

type IProps = IExternalProps & IStateProps & ISubscriptionProps<Member[]> & IDispatchProps & IState;

const PAGE_SIZE = 100; 

class DaoMembersPage extends React.Component<IProps, IState> {
  
  constructor(props: IProps) {
    super(props);

    this.state = {
      transactionFee: "0",
      listingFee: "0",
      validationFee: "0",
      membershipFee: "0"
    };
  }

  public async componentDidMount() {
    console.log("%%%: ", this.props)
    this.props.data.forEach((member) => {
      if (!this.props.profiles[member.staticState.address]) {
        this.props.getProfile(member.staticState.address);
      }
    });
    
    const arc = getArc();
    const feeContract = new arc.web3.eth.Contract(
        [
          {
            "constant": true,
            "inputs": [],
            "name": "listingFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "membershipFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "transactionFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "validationFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          }
        ],
      "0x0fbc1939BFF4550b8596c668cb2B8fdcA1C73305"
    );
  
    console.log("Hallo niggas")
  
    console.log("oooooooooooooooooooooo: ", await feeContract.methods.transactionFee().call());
    console.log("oooooooooooooooooooooo: ", await feeContract.methods.listingFee().call());
    console.log("oooooooooooooooooooooo: ", await feeContract.methods.transactionFee().call());
    console.log("oooooooooooooooooooooo: ", await feeContract.methods.validationFee().call());
    // this.props.ff = "hallo";
    this.setState( 
      { 
        transactionFee: await feeContract.methods.transactionFee().call(),
        listingFee: await feeContract.methods.listingFee().call(),
        validationFee: await feeContract.methods.validationFee().call(),
        membershipFee:  await feeContract.methods.membershipFee().call()
      }
    );

    Analytics.track("Page View", {
      "Page Name": Page.DAOMembers,
      "DAO Address": "0x5de00a6af66f8e6838e3028c7325b4bdfe5d329d",
      "DAO Name": this.props.daoState.name,
    });
  }

  public render(): RenderOutput {
    const { data } = this.props;
    console.log("FDSJKLFJSDLKFJDSKLJFKLSDJFLKSDJFLKSDJFKLSDJFLKSDJFLKSDJFLKS", this.props, this.state);
    const members = data;
    const daoTotalReputation = this.props.daoState.reputationTotalSupply;
    const { daoState, profiles } = this.props;

    const membersHTML = members.map((member) =>
      <DaoMember key={member.staticState.address} dao={daoState} daoTotalReputation={daoTotalReputation} member={member} profile={profiles[member.staticState.address]} />);

    return (
      <div className={css.membersContainer}>

        <BreadcrumbsItem to={"/dao/members"}>DAO Members</BreadcrumbsItem>
        <div className={css.pageHead}>
          <h1>DASHBOARD</h1>
          <div><button>Join</button></div>
        </div>
        {/* Key parameters div */}
          <div> 
            <h2>KEY PARAMETERS</h2>




          <div className={css.keyParametrs}>

            <div className={css.dashBlock}>
                <div className={css.icon}>
                        <img src="/assets/images/Icon/dash_listing_rate.png" />
                </div>
                <div className={css.count}>
                    { this.state.listingFee }
                </div>
                <div className={css.cont}>
                    <h4>Listing Rate: SNGLS</h4>
                    <p>The minimum amount of SNGLS needed to <br/>be staked to have content mined onto the protocol.</p>
                </div>
            </div>

            <p className={css.description}>These proposals might change the rate</p>

            
            <div className={css.dashBlock}>
                <div className={css.icon}>
                        <img src="/assets/images/Icon/dash_transaction.png" />
                </div>
                <div className={css.count}>
                    { this.state.transactionFee }
                </div>
                <div className={css.cont}>
                    <h4>Transaction Fee: %</h4>
                    <p>The % of the transaction that the protocol puts into the <br/>treasury.</p>
                </div>
            </div>

          </div>


        <div className={css.comingSoon}>
            <h2>COMING SOON</h2>
            <div className={css.dashBlock}>
                <div className={css.icon}>
                    <img src="/assets/images/Icon/dash_validation.png" />
                </div>
                <div className={css.count}>
                    { this.state.validationFee }
                </div>
                <div className={css.cont}>
                    <h4>Validation Fee: SNGLS</h4>
                    <p>Minimum amount paid to validators.</p>
                </div>
            </div>
        </div>


        <div className={css.columnsTwo}>

            <div className={css.dashBlock}>
                <div className={css.icon}>
                    <img src="/assets/images/Icon/dash_treasury.png" />
                </div>
                <div className={css.cont}>
                    <h4>DAO Treasury</h4>
                </div>
                <div className={css.count}>
                    <ul>
                        <li><span>Sngls:</span><p>0</p></li>
                        <li><span>SGT:</span><p>0</p></li>
                        <li><span>USDC:</span><p>0</p></li>
                        <li><span>DAI:</span><p>0</p></li>
                        <li><span>SAI:</span><p>0</p></li>
                    </ul>
                </div>
            </div>

            <div className={css.dashBlock}>
                <div className={css.icon}>
                    <img src="/assets/images/Icon/dash_holdings.png" />
                </div>
                <div className={css.cont}>
                    <h4>DAO Holdings</h4>
                </div>
                <div className={css.count}>
                    <ul>
                        <li><span>SGT:</span><p>0</p></li>
                        <li><span>Sngls:</span><p>0</p></li>
                        <li><span>GEN:</span><p>0</p></li>
                    </ul>
                </div>
            </div>

        </div>

          </div>

          <h2>TOP PROPOSALS</h2>
        <h3>Boosted proposals (3)</h3>
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
        </InfiniteScroll>



          <h2>TOP MEMBERS</h2>

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
        </InfiniteScroll>



<div className={css.daoModalBlock}>


        <div className={css.daoModal}>

          <div className={css.head}>
            <h4>DAO Reputation</h4>
            <a href="#"><img src="/assets/images/close.svg" alt=""/></a>
          </div>

          <div className={css.subhead}>
            <p>You need to stake tokens to become a member of the DAO</p>
            <div><a className={css.btn} href="#">LEAVE</a></div>
          </div>

          <div className={css.content}>
            <p>The amount you have staked will be your reputation <br/>in the DAO</p>
            <div className={css.bigInput}>
              <form action="">
                <label>SGT</label>
                <input type="text" value="0.00"/>
              </form>
              <span>Holdings <strong>0.00% Rep.</strong></span>
            </div>
            <button className={css.submit}>Join</button>
            <button className={css.remove}>remove</button>
          </div>

        </div>


</div> 


      </div>

    );
  }
}


const SubscribedDaoMembersPage = withSubscription({
  wrappedComponent: DaoMembersPage,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <div>{ props.error.message }</div>,

  checkForUpdate: [], // (oldProps, newProps) => { return oldProps.daoState.address !== newProps.daoState.address; },

  createObservable: async (props: IExternalProps) => {
    const dao = props.daoState.dao;

    return dao.members({
      orderBy: "balance",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: 0,
    });
  },

  // used for hacky pagination tracking
  pageSize: PAGE_SIZE,

  getFetchMoreObservable: (props: IExternalProps, data: Member[]) => {
    const dao = props.daoState.dao;
    return dao.members({
      orderBy: "balance",
      orderDirection: "desc",
      first: PAGE_SIZE,
      skip: data.length,
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SubscribedDaoMembersPage);
