import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";

import ThreeBoxTread from "./ThreeBoxTread"

import * as style from './ThreeBoxTreadPage.scss'
import {getWeb3Provider} from "../../../arc";

interface IProps {
  currentAccountAddress: string;
}

const ThreeBoxTreadPage = ({ currentAccountAddress }: IProps) => {
    const web3Provider = getWeb3Provider();
  return(
    <div>
      <h2 className={style.title}>
        Common Discuss
      </h2>
      <div className={style.page}>
        <BreadcrumbsItem to={"/dao/discussion"}>Discussion</BreadcrumbsItem>
        <ThreeBoxTread chatName="commonTread" web3Provider={web3Provider} currentAccountAddress={currentAccountAddress}/>
      </div>
    </div>
  );
}

export default ThreeBoxTreadPage
