import * as React from "react";
import { useEffect, useState} from "react";
// @ts-ignore
// import { Comment, Tooltip, List } from 'antd';
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { connect } from "react-redux";
import * as css from "../Dao.scss";
// import Box = require("3box");
import { IProfileState } from "reducers/profilesReducer";

import ThreeBoxMessageList from "./ThreeBoxMessageList"

// import moment = require("moment");
// @ts-ignore
import {getWeb3Provider} from "../../../arc";

interface IProps {
  currentAccountAddress: string;
  threeBox?: any;
  currentAccountProfile: IProfileState;
}


const ThreeBoxTreadPage = ({ currentAccountAddress, threeBox }: IProps) => {
  const provider = getWeb3Provider()
  const [web3Provider, setWeb3Provider] = useState(null)
  const [thread, setThread] = useState(null)

  useEffect(() =>{
    provider && setWeb3Provider(provider)
  }, [provider])

  useEffect(() => {
    threeBox && openTread()
  }, [threeBox, web3Provider])

  const openTread = async () => {
    // const currDID = await threeBox.DID
    const space = await threeBox.openSpace("treads")
    const thread = await space.joinThread('commonTread', {
      firstModerator: currentAccountAddress
    })
    setThread(thread)
  }


  return(
    <div style={{ backgroundColor: 'white' }}>
      <BreadcrumbsItem to={"/dao/discussion"}>Discussion</BreadcrumbsItem>

      {/* <Sticky enabled top={50} innerZ={10000}> */}
      <div className={css.daoHistoryHeader}>
        Common Discuss
      </div>
      {!web3Provider
        ? <h3>Please connect to wallet</h3>
        : !threeBox
          ? <h3>Loading...</h3>
          : (<div>
            <ThreeBoxMessageList thread={thread}/>
          </div>)}
    </div>
  );
}

// @ts-ignore
export default connect(({profiles: {  threeBox}} ) => ({threeBox}))(ThreeBoxTreadPage)
