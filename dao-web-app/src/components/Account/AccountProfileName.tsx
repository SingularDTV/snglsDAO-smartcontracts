import * as React from "react";
import { Link } from "react-router-dom";

import { IProfileState } from "reducers/profilesReducer";

import * as classNames from "classnames";

import * as css from "./Account.scss";
import { withTranslation } from 'react-i18next';



interface IProps {
  accountAddress: string;
  accountProfile?: IProfileState;
  daoAvatarAddress?: string;
  detailView?: boolean;
  historyView?: boolean;
}

class AccountProfileName extends React.Component<IProps, null> {

  public render(): RenderOutput {
    const { accountAddress, accountProfile, daoAvatarAddress, historyView, detailView } = this.props;

    const accountNameClass = classNames({
      [css.accountName]: true,
      [css.detailView]: detailView,
      [css.historyView]: historyView,
    });

    return (
      <Link className={accountNameClass} to={"/profile/" + accountAddress + (daoAvatarAddress ? "?daoAvatarAddress=" + daoAvatarAddress : "")}>
        {accountProfile && accountProfile.name ? accountProfile.name : accountAddress.substr(0, 8) + "..."}
      </Link>
    );
  }
}
//@ts-ignore
export default withTranslation()(AccountProfileName)
