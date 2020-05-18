import { IProposalState } from "@daostack/client";
import classNames from "classnames";
import { formatTokens, fromWei } from "lib/util";
import * as React from "react";

import * as css from "./StakeGraph.scss";

interface IProps {
  detailView?: boolean;
  historyView?: boolean;
  proposal: IProposalState;
}

export default class StakeGraph extends React.Component<IProps, null> {

  public render(): RenderOutput {
    const {
      detailView,
      historyView,
      proposal,
    } = this.props;

    // round second decimal up
    const stakesFor = fromWei(proposal.stakesFor);
    const stakesAgainst = fromWei(proposal.stakesAgainst);
    const isPassing = stakesFor >= stakesAgainst;
    const isFailing = stakesAgainst >= stakesFor;
    const maxWidth = Math.max(stakesFor, stakesAgainst);
    const passWidth = stakesFor <= 0.0001 ? 0 : Math.max(stakesFor / maxWidth * 100, 3);
    const failWidth = stakesAgainst <= 0.0001 ? 0 : Math.max(stakesAgainst / maxWidth * 100, 3);

    const wrapperClass = classNames({
      [css.wrapper] : true,
      [css.detailView] : detailView,
      [css.historyView] : historyView,
      [css.isPassing] : isPassing,
      [css.isFailing] : isFailing,
    });

    return (
      <div className={wrapperClass}>

        <div className={css.stakeGraph}>
          <div className={css.leftColumn}>
            <div className={css.stakesFor}>
              <div className={css.stakesForTitle}>
              <img className={css.defaultIcon} src="/assets/images/Icon/v-small-line.svg"/>
              <img className={css.detailIcon} src="/assets/images/Icon/v-small.svg"/>
                <b>{formatTokens(proposal.stakesFor)} Pass</b>
              </div>
              <div className={css.stakesForLine}><span style={{ width: passWidth + "%" }}></span></div>
            </div>
            <div className={css.stakesAgainst}>
              <div className={css.stakesAgainstTitle}>
              <img className={css.defaultIcon} src="/assets/images/Icon/x-small-line.svg"/>
              <img className={css.detailIcon} src="/assets/images/Icon/x-small.svg"/>
                <b>{formatTokens(proposal.stakesAgainst)} Fail</b>
              </div>
              <div className={css.stakesAgainstLine}><span style={{ width: failWidth + "%" }}></span></div>
            </div>
          </div>
          {/* <div className={css.rightColumn}>
            <div className={css.forBar}>
              <b>Pass</b>
              <div><span style={{width: passWidth + "%"}}></span></div>
            </div>
            <div className={css.againstBar}>
              <b>Fail</b>
              <div><span style={{width: failWidth + "%"}}></span></div>
            </div>
          </div> */}
        </div>
      </div>
    );
  }
}
