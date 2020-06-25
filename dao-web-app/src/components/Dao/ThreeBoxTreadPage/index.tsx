import * as React from "react";
import { useEffect, useState } from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { connect } from "react-redux";
import { getConfig, getProfile } from '3box';

import Loading from "components/Shared/Loading";
import ThreeBoxMessageList from "./ThreeBoxMessageList"
import ThreeBoxAddMessage from "./ThreeBoxAddMessage"
import { IProfileState } from "reducers/profilesReducer";
import { getWeb3Provider } from "../../../arc";

import * as style from './ThreeBoxTreadPage.scss'

interface IProps {
  currentAccountAddress: string;
  threeBox?: any;
  currentAccountProfile: IProfileState;
}

const ThreeBoxTreadPage = ({ currentAccountAddress, threeBox }: IProps) => {
  const provider = getWeb3Provider()
  const [web3Provider, setWeb3Provider] = useState(null)
  const [thread, setThread] = useState(null)
  const [currDID, setCurrDID] = useState(null)
  const [currProfile, setCurrProfile] = useState(null)
  const [currConfig, setCurrConfig] = useState(null)

  useEffect(() => {
    onGetCurrUser()
  }, [])

  useEffect(() =>{
    provider && setWeb3Provider(provider)
  }, [provider])

  useEffect(() => {
    threeBox && openTread()
  }, [threeBox])

  const openTread = async () => {
    const currDID = await threeBox.DID
    setCurrDID(currDID)
    const space = await threeBox.openSpace("treads")
    const thread = await space.joinThread('commonTread', {
      firstModerator: currentAccountAddress
    })
    setThread(thread)
  }

  const onGetCurrUser = async () => {
    const resConfig = await getConfig(currentAccountAddress)
    const resProfile = await getProfile(currentAccountAddress)
    setCurrConfig(resConfig)
    setCurrProfile(resProfile)
  }


  return(
    <div className={style.page}>
      <BreadcrumbsItem to={"/dao/discussion"}>Discussion</BreadcrumbsItem>
      <h2 className={style.title}>
        Common Discuss
      </h2>
      {!web3Provider
        ? <h3>Please connect to wallet</h3>
        : !threeBox
          ? <Loading />
          : (<div>
            <ThreeBoxAddMessage profile={currProfile} thread={thread} currentAddress={currentAccountAddress} />
            <ThreeBoxMessageList currDID={currDID} currConfig={currConfig} thread={thread}/>
          </div>)}
    </div>
  );
}

// @ts-ignore
export default connect(({profiles: {  threeBox}} ) => ({threeBox}))(ThreeBoxTreadPage)
