import * as React from "react";
// import { useEffect} from "react";
// import { connect } from "redux"
import { IDAOState } from "@daostack/client";
// import { DiscussionEmbed } from "disqus-react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
// import * as Sticky from "react-stickynode";
// import { connect } from "react-redux";
import * as css from "./Dao.scss";
// import Box = require("3box");
import { IProfileState } from "reducers/profilesReducer";

interface IProps {
  dao: IDAOState;
  currentAccountAddress: string;
  threeBox?: any;
  currentAccountProfile: IProfileState;
}



const DaoDiscussionPage = ({ dao}: IProps) => {

  return(
    <div>
      <BreadcrumbsItem to={"/dao/" + dao.address + "/discussion"}>Discussion</BreadcrumbsItem>

      {/* <Sticky enabled top={50} innerZ={10000}> */}
      <div className={css.daoHistoryHeader}>
        Discuss {dao.name}
      </div>
      {/* </Sticky> */}

    </div>
  );
}

// class DaoDiscussionPage extends React.Component<IProps, null> {
//
//   // public async componentDidMount() {
//   //   const provider = await  Box.get3idConnectProvider(); // recomended provider
//   //   const box = await Box.openBox(this.props.currentAccountAddress, provider)
//   //   const space = await box.openSpace('snglsGeneral')
//   //   const thread = await space.joinThread('myThread', {
//   //     firstModerator: "0x4699f05bF35Ba6820F8393C44F780fBe00fe7aa9",
//   //     members: true
//   //   });
//   //   await thread.addMember(this.props.currentAccountAddress);
//   //
//   //   await thread.post('hello world')
//   //
//   //   console.log("Thread posts: ", await thread.getPosts());
//   //
//   //   await space.syncDone
//   //
//   //   localStorage.setItem(`daoWallEntryDate_${this.props.dao.address}`, moment().toISOString());
//   // }
//
//   public render(): RenderOutput {
//
//   }
// }
//@ts-ignore
export default DaoDiscussionPage
