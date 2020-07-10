import BN = require("bn.js");
import { IDAOState, IMemberState, Member } from "@daostack/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AccountImage from "components/Account/AccountImage";
import AccountProfileName from "components/Account/AccountProfileName";
import Reputation from "components/Account/Reputation";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import { fromWei } from "lib/util";
import * as React from "react";
import { Link } from "react-router-dom";
import { IProfileState } from "reducers/profilesReducer";
import * as css from "./Dao.scss";
import { withTranslation } from 'react-i18next';


interface IProps extends ISubscriptionProps<IMemberState> {
  dao: IDAOState;
  member: Member;
  daoTotalReputation: BN;
  currentAccountAddress: string;
  profile: IProfileState;
}

class DaoMember extends React.Component<IProps, null> {

  private openSocial = (url: string) => (e: any) => {
    e.preventDefault();
    window.open(url, "_blank");
  }

  public render(): RenderOutput {
    const { dao, daoTotalReputation, profile, currentAccountAddress } = this.props;
    const memberState = this.props.data;
    //@ts-ignore
    const { t } = this.props;
    return (
      <div className={css.member + " clearfix"}
        key={"member_" + memberState.address}
        data-test-id={"member_" + memberState.address}>

          <table className={css.memberTable}>
            <tbody>
              <tr>
                <td className={css.memberAvatar}>
                  <Link to={memberState.address === currentAccountAddress
            ? "/profile/" + currentAccountAddress
            : "/profile/" + memberState.address + (dao ? "?daoAvatarAddress=" + dao.address : "")}>
                    <AccountImage
                      accountAddress={memberState.address}
                      profile={profile}
                      width={40}
                    />
                  </Link>
                </td>
                <td className={css.memberName}>
                <Link to={memberState.address === currentAccountAddress
            ? "/profile/" + currentAccountAddress
            : "/profile/" + memberState.address + (dao ? "?daoAvatarAddress=" + dao.address : "")}>
                  { profile ?
                    <div>
                      <AccountProfileName currentAccountAddress={memberState.address === currentAccountAddress && currentAccountAddress} accountAddress={memberState.address} accountProfile={profile} daoAvatarAddress={dao.address} />
                      <br/>
                    </div>
                    : <div className={css.noProfile}>No Profile</div>
                  }
                  </Link>
                </td>
                <td className={css.memberAddress}>
                  {memberState.address}
                </td>
                <td className={css.memberReputation}>
                  <span className={css.reputationAmount}>{fromWei(memberState.reputation).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</span>
                  <div className={css.reputationAmounts}>
                    (<Reputation daoName={dao.name} totalReputation={daoTotalReputation} reputation={memberState.reputation}/>)
                  </div>
                </td>
                <td className={css.memberSocial}>
                  {profile && Object.keys(profile.socialURLs).length > 0 ?
                    <span>
                      { profile.socialURLs.twitter ?
                        <span onClick={this.openSocial("https://twitter.com/" + profile.socialURLs.twitter.username)} className={css.socialButton}>
                          <FontAwesomeIcon icon={["fab", "twitter"]} className={css.icon} />
                        </span> : ""}
                      { profile.socialURLs.github ?
                        <span onClick={this.openSocial("https://github.com/" + profile.socialURLs.github.username)} className={css.socialButton}>
                          <FontAwesomeIcon icon={["fab", "github"]} className={css.icon} />
                        </span> : ""}
                    </span>
                    : ""
                  }
                </td>
              </tr>
            </tbody>
          </table>

      </div>
    );
  }
}

const DaoMemberWithSubscription = withSubscription({
  wrappedComponent: DaoMember,
  loadingComponent: <div>Loading...</div>,
  errorComponent: (props) => <div>{ props.error.message }</div>,
  checkForUpdate: (oldProps, newProps) => { return oldProps.member.id !== newProps.member.id; },
  createObservable: (props: IProps) => props.member.state(),
});
//@ts-ignore
export default withTranslation()(DaoMemberWithSubscription)

