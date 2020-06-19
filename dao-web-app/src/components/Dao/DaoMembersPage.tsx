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
import * as Sticky from "react-stickynode";
import { IRootState } from "reducers";
import { IProfilesState } from "reducers/profilesReducer";
import { withTranslation } from 'react-i18next';

import DaoMember from "./DaoMember";
import * as css from "./Dao.scss";

interface IExternalProps extends RouteComponentProps<any> {
  daoState: IDAOState;
}

interface IStateProps {
  profiles: IProfilesState;
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

type IProps = IExternalProps & IStateProps & ISubscriptionProps<Member[]> & IDispatchProps;

const PAGE_SIZE = 100; 

class DaoMembersPage extends React.Component<IProps, null> {

  public componentDidMount() {
    this.props.data.forEach((member) => {
      if (!this.props.profiles[member.staticState.address]) {
        this.props.getProfile(member.staticState.address);
      }
    });

    Analytics.track("Page View", {
      "Page Name": Page.DAOMembers,
      "DAO Address": this.props.daoState.address,
      "DAO Name": this.props.daoState.name,
    });
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { data } = this.props;
    const members = data;
    const daoTotalReputation = this.props.daoState.reputationTotalSupply;
    const { daoState, profiles } = this.props;
    console.log("MEMBERs => ", members);
    const membersHTML = members.map((member) =>
      <DaoMember key={member.staticState.address} dao={daoState} daoTotalReputation={daoTotalReputation} member={member} profile={profiles[member.staticState.address]} />);

    return (
      <div className={css.membersContainer}>
        <BreadcrumbsItem to={"/dao/" + daoState.address + "/members"}>{t("membership.daoMembers")}</BreadcrumbsItem>
        <Sticky enabled top={50} innerZ={10000}>
          <h2>{t("membership.daoMembers")}</h2>
        </Sticky>
        <table className={css.memberHeaderTable}>
          <tbody className={css.memberTable + " " + css.memberTableHeading}>
            <tr>
              <td className={css.memberAvatar}></td>
              <td className={css.memberName}>{t("membership.name")}</td>
              <td className={css.memberAddress}>{t("membership.address")}</td>
              <td className={css.memberReputation}>{t("membership.reputation")}</td>
              <td className={css.memberSocial}>{t("membership.socVerification")}</td>
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
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedDaoMembersPage));
