import * as React from "react";
import { useEffect, useState } from "react";
import { updateThreeBox } from "actions/profilesActions";
import { connect } from "react-redux";
import { Button } from "antd"
import {getConfig, getProfile, openBox} from '3box';

import Loading from "components/Shared/Loading";
import ThreeBoxMessageList from "./ThreeBoxMessageList"
import ThreeBoxAddMessage from "./ThreeBoxAddMessage"
import { IProfileState } from "reducers/profilesReducer";
import * as style from "./ThreeBoxTreadPage.scss";
import { useTranslation} from "react-i18next";

interface IProps {
  currentAccountAddress: string;
  threeBox?: any;
  updateThreeBox: () => void;
  threeBoxTimeOutErr?: string;
  web3Provider?: any;
  chatName: string;
  currentAccountProfile: IProfileState;
}

const ThreeBoxTread = ({ currentAccountAddress, threeBox, chatName, web3Provider, threeBoxTimeOutErr, updateThreeBox: onUpdateThreeBox }: IProps) => {

  const [loading, setLoading] = useState(false);
  const [isConnect, setIsConnect] = useState(false);
  const [thread, setThread] = useState(null);
  const [currDID, setCurrDID] = useState(null);
  const [currProfile, setCurrProfile] = useState(null);
  const [currConfig, setCurrConfig] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    onGetCurrUser()
  }, [])

  useEffect(() => {
    threeBox && openTread()
  }, [threeBox])

  const openTread = async () => {
    const currDID = await threeBox.DID
    setCurrDID(currDID)
    await threeBox.auth(['treads', chatName], { address: currentAccountAddress });
    const thread = await threeBox.openThread("treads", chatName,
      {
        //TODO add moderator address
        firstModerator: '0x4fbea1becd2f3f24dcbdd59b2b609abcdcdd6956'
      })
    setThread(thread)
  }

  const onGetCurrUser = async () => {
    const resConfig = await getConfig(currentAccountAddress)
    const resProfile = await getProfile(currentAccountAddress)
    setCurrConfig(resConfig)
    setCurrProfile(resProfile)
  }

  const handleConnect = async () => {
    if(threeBox) {
      setIsConnect(true)
      return;
    }
    const boxPromise = Promise.race([
      openBox(currentAccountAddress, web3Provider),
      new Promise((resolve, reject) => setTimeout(() => reject(), 10000)),
    ]);
    setLoading(true);
    try{
      const box = await boxPromise
      updateThreeBox({threeBox:box})
      setLoading(false)
      setIsConnect(true)
    }catch(err){
      updateThreeBox({boxTimeout: true})
    }
  }

  if(loading) {
    return <Loading />
  }

  if(!web3Provider) {
    return (<div>
      <h5>{t("3box.connectWarning")}</h5>
    </div>)
  }

  if(isConnect) {
    return (<div>
      <ThreeBoxAddMessage profile={currProfile} thread={thread} currentAddress={currentAccountAddress} />
      <ThreeBoxMessageList currDID={currDID} currConfig={currConfig} thread={thread}/>
    </div>)
  }

  return(
    <div>
      {!isConnect && <Button onClick={handleConnect} className={style.antFormButton}>{t("3box.connectButton")}</Button>}
      {threeBoxTimeOutErr && <h5 style={{color :"red"}}>{t("3box.errorConnection")}</h5>}
    </div>
  );
}

// @ts-ignore
export default connect(({profiles: {  threeBox, threeBoxTimeOutErr}} ) => ({threeBox, threeBoxTimeOutErr}), { updateThreeBox })(ThreeBoxTread)
