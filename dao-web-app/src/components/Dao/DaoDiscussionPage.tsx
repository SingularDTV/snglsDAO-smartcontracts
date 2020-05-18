import { IDAOState } from "@daostack/client";
import { DiscussionEmbed } from "disqus-react";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
// import * as Sticky from "react-stickynode";
import * as css from "./Dao.scss";
import Box = require("3box");
import { IProfileState } from "reducers/profilesReducer";
// import { getWeb3Provider } from "arc";

import moment = require("moment");

interface IProps {
  dao: IDAOState;
  currentAccountAddress: string;
  currentAccountProfile: IProfileState;
}

export default class DaoDiscussionPage extends React.Component<IProps, null> {

  public async componentDidMount() {
    console.log("Discuss props ", this.props);
    const provider = await  Box.get3idConnectProvider(); // recomended provider
    const box = await Box.openBox(this.props.currentAccountAddress, provider)
    const space = await box.openSpace('snglsGeneral')
    const thread = await space.joinThread('myThread', {
      firstModerator: "0x4699f05bF35Ba6820F8393C44F780fBe00fe7aa9",
      members: true
    });
    await thread.addMember(this.props.currentAccountAddress);

    await thread.post('hello world')

    console.log("Thread posts: ", await thread.getPosts());

    await space.syncDone

    localStorage.setItem(`daoWallEntryDate_${this.props.dao.address}`, moment().toISOString());
  }

  public render(): RenderOutput {
    const dao = this.props.dao;

    const disqusConfig = {
      url: process.env.BASE_URL + "/dao/" + dao.address + "/discussion",
      identifier: dao.address,
      title: "Discuss " + dao.name,
    };

    return(
      <div>
        <BreadcrumbsItem to={"/dao/" + dao.address + "/discussion"}>Discussion</BreadcrumbsItem>

        {/* <Sticky enabled top={50} innerZ={10000}> */}
          <div className={css.daoHistoryHeader}>
            Discuss {dao.name}
          </div>
        {/* </Sticky> */}

        <div>
          <DiscussionEmbed shortname={process.env.DISQUS_SITE} config={disqusConfig}/>
        </div>
      </div>
    );
  }
}
