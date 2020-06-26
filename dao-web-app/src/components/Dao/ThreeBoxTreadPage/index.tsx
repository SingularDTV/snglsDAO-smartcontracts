import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";

import ThreeBoxTread from "./ThreeBoxTread"

import * as style from './ThreeBoxTreadPage.scss'

interface IProps {
  currentAccountAddress: string;
}

const ThreeBoxTreadPage = ({ currentAccountAddress }: IProps) => {

  return(
    <div className={style.page}>
      <BreadcrumbsItem to={"/dao/discussion"}>Discussion</BreadcrumbsItem>
      <h2 className={style.title}>
        Common Discuss
      </h2>
      <ThreeBoxTread chatName="commonTread" currentAccountAddress={currentAccountAddress}/>
    </div>
  );
}

export default ThreeBoxTreadPage
