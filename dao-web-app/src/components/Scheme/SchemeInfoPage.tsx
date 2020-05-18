/* tslint:disable:max-classes-per-file */

import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { Address, ISchemeState, IGenesisProtocolParams, IDAOState } from "@daostack/client";
import { copyToClipboard, fromWei, linkToEtherScan, roundUp } from "lib/util";
import { schemeName } from "lib/schemeUtils";
import * as moment from "moment";
import { NotificationStatus, showNotification } from "reducers/notifications";
import { connect } from "react-redux";
import Tooltip from "rc-tooltip";
import * as css from "./SchemeInfo.scss";

interface IDispatchProps {
  showNotification: typeof showNotification;
}

interface IExternalProps {
  daoState: IDAOState;
  scheme: ISchemeState;
}

type IProps = IExternalProps & IDispatchProps;

const mapDispatchToProps = {
  showNotification,
};

class SchemeInfo extends React.Component<IProps, null> {

  private copyToClipboardHandler = (str: string) => (_event: any) => {
    copyToClipboard(str);
    this.props.showNotification(NotificationStatus.Success, "Copied to clipboard!");
  };

  public render(): RenderOutput {
    const { /*daoState,*/ scheme } = this.props;
    // const daoAvatarAddress = daoState.address;

    const duration = (durationSeconds: number): any => {
      if (!durationSeconds) {
        return "";
      }

      const duration = moment.duration(durationSeconds * 1000);

      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();
      // there won't ever be milliseconds
      const colon = <span className={css.colon}>: </span>;

      const first = days ? "days" : hours ? "hours" : minutes ? "minutes" : seconds ? "seconds" : null;

      return <span>
        {
          days ? <span className={css.timeSection}><strong>{days} day{days > 1 ? "s" : ""}</strong></span> : ""
        }
        {
          hours ? <span className={css.timeSection}>{first !== "hours" ? colon : ""}<strong>{hours} hour{hours > 1 ? "s" : ""}</strong></span> : ""
        }
        {
          minutes ? <span className={css.timeSection}><span>{first !== "minutes" ? colon : ""}<strong>{minutes} minute{minutes > 1 ? "s" : ""}</strong></span></span> : ""
        }
        {
          seconds ? <span className={css.timeSection}><span>{first !== "seconds" ? colon : ""}<strong>{seconds} second{seconds > 1 ? "s" : ""}</strong></span></span> : ""
        }
      </span>;
    };

    const renderVotingMachineLink = (votingMachine: Address) => {
      if (votingMachine) {
        return <tr>
          <th><span>Address:</span></th>
          <td><span>
            <a href={linkToEtherScan(votingMachine)} target="_blank" rel="noopener noreferrer">{ votingMachine }</a>
          </span></td>
        </tr>;
      }
    };
    const renderGpParams = (params: IGenesisProtocolParams): any => {

      // represent time in locale-independent UTC format
      const activationTime = moment.unix(params.activationTime).utc();

      return <tbody>
        <tr><th><span>Activation Time:</span></th><td className={css.ellipsis}><span>{
          `${ activationTime.format("h:mm A [UTC] on MMMM Do, YYYY")} ${activationTime.isSameOrBefore(moment()) ? "(active)" : "(inactive)"}`
        }</span></td></tr>
        <tr><th><span>Boosted Vote Period Limit:</span></th><td><span>{duration(params.boostedVotePeriodLimit)} ({params.boostedVotePeriodLimit} seconds)</span></td></tr>
        <tr><th><span>DAO Bounty Constant:</span></th><td><span>{params.daoBountyConst}</span></td></tr>
        <tr><th><span>Proposal Reputation Reward:</span></th><td><span>{fromWei(params.proposingRepReward)} REP</span></td></tr>
        <tr><th><span>Minimum DAO Bounty:</span></th><td><span>{fromWei(params.minimumDaoBounty)} GEN</span></td></tr>
        <tr><th><span>Pre-Boosted Vote Period Limit:</span></th><td><span>{duration(params.preBoostedVotePeriodLimit)} ({params.preBoostedVotePeriodLimit} seconds)</span></td></tr>
        <tr><th><span>Queued Vote Period Limit:</span></th><td><span>{duration(params.queuedVotePeriodLimit)} ({params.queuedVotePeriodLimit} seconds)</span></td></tr>
        <tr><th><span>Queued Vote Required:</span></th><td><span>{params.queuedVoteRequiredPercentage}%</span></td></tr>
        <tr><th><span>Quiet Ending Period:</span></th><td><span>{duration(params.quietEndingPeriod)} ({params.quietEndingPeriod} seconds)</span></td></tr>
        <tr><th><span>Threshold Constant</span></th><td><span>
          <Tooltip
            placement="top"
            overlay={
              <span>{params.thresholdConst.toString()}</span>
            }
            trigger={["hover"]}
          >
            <span>{roundUp(params.thresholdConst, 3).toString()}</span>
          </Tooltip>
        </span></td></tr>
        <tr><th><span>Voters Reputation Loss:</span></th><td><span>{params.votersReputationLossRatio}%</span></td></tr>
      </tbody>;
    };

    const votingMachine = (
      (scheme.genericSchemeParams && scheme.genericSchemeParams.votingMachine) ||
      (scheme.uGenericSchemeParams && scheme.uGenericSchemeParams.votingMachine) ||
      (scheme.contributionRewardParams && scheme.contributionRewardParams.votingMachine) ||
      (scheme.schemeRegistrarParams && scheme.schemeRegistrarParams.votingMachine)
    );
    return <div>
      <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/info`}>Info</BreadcrumbsItem>

      <div className={css.schemeInfoContainer}>
        <h3>{schemeName(scheme, scheme.address)}</h3>
        <div className={css.schemeInfoContainerTable}>
        <table className={css.infoCardContent}>
          <tbody>
            <tr>
                <th><span>Address of plugin: <a href={linkToEtherScan(scheme.address)} target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/Link-blue.svg" /></a></span></th>
              <td><span>
                  <div className={css.copyButton}><img src="/assets/images/Icon/t-copy.svg" onClick={this.copyToClipboardHandler(scheme.address)} /></div> <span>{scheme.address}</span>
              </span></td>
            </tr>
            { scheme.genericSchemeParams ?
              <tr>
                  <th><span>will call this contract: <a href={linkToEtherScan(scheme.genericSchemeParams.contractToCall)} target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/Link-blue.svg" /></a></span></th>
                <td><span>
                  <div className={css.copyButton}><img src="/assets/images/Icon/t-copy.svg" onClick={this.copyToClipboardHandler(scheme.genericSchemeParams.contractToCall)} /></div> <span>{scheme.genericSchemeParams.contractToCall}</span>
                </span></td>
              </tr> : undefined
            }
            { scheme.uGenericSchemeParams ?
              <tr>
                  <th><span>will call this contract: <a href={linkToEtherScan(scheme.uGenericSchemeParams.contractToCall)} target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/Link-blue.svg" /></a></span></th>
                <td><span>
                  <div className={css.copyButton}><img src="/assets/images/Icon/t-copy.svg" onClick={this.copyToClipboardHandler(scheme.uGenericSchemeParams.contractToCall)} /></div> <span>{scheme.uGenericSchemeParams.contractToCall}</span>
                </span></td>
              </tr> : undefined
            }

            <tr>
              <th><span>Param Hash:</span></th>           
              <td><span>
                <div className={css.copyButton}><img src="/assets/images/Icon/t-copy.svg" onClick={this.copyToClipboardHandler(scheme.paramsHash)} /></div> <span>{scheme.paramsHash}</span>
              </span></td>
            </tr>
            <tr>
              <th><span>Can Register Plugins?</span></th>
              <td><span>
                {scheme.canRegisterSchemes ? "Yes" : "No"}
              </span></td>
            </tr>
            <tr>
              <th><span>Can Upgrade Controller?</span></th>
              <td><span>
                {scheme.canUpgradeController ? "Yes" : "No"}
              </span></td>
            </tr>
            <tr>
              <th><span>Can Delegate Call?</span></th>
              <td><span>
                {scheme.canDelegateCall ? "Yes" : "No"}
              </span></td>
            </tr>
            <tr>
              <th><span>Can Manage Global Constraints?</span></th>
              <td><span>
                {scheme.canManageGlobalConstraints ? "Yes" : "No"}
              </span></td>
            </tr>
            <tr>
              <th><span>Can Mint or Burn Reputation?</span></th>
              <td><span>Yes</span></td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      {scheme.contributionRewardParams || scheme.genericSchemeParams ?
        <div className={css.schemeInfoContainer}>
          <h3>Genesis Protocol Params - <a href="https://daostack.zendesk.com/hc/en-us/articles/360002000537" target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/leanMore.svg" onClick={this.copyToClipboardHandler(scheme.address)} /></a></h3>
          <div className={css.schemeInfoContainerTable}>
          <table className={css.infoCardContent}>
            {renderVotingMachineLink(votingMachine)}
            {renderGpParams(scheme.contributionRewardParams ? scheme.contributionRewardParams.voteParams : scheme.genericSchemeParams.voteParams)}
          </table>
          </div>
        </div>
        : ""
      }
      { scheme.uGenericSchemeParams ?
        <div className={css.schemeInfoContainer}>
          <h3>Genesis Protocol Params - <a href="https://daostack.zendesk.com/hc/en-us/articles/360002000537" target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/leanMore.svg" onClick={this.copyToClipboardHandler(scheme.address)} /></a></h3>
          <div className={css.schemeInfoContainerTable}>
          <table className={css.infoCardContent}>
            {renderVotingMachineLink(votingMachine)}
            {renderGpParams(scheme.uGenericSchemeParams.voteParams)}
          </table>
          </div>
        </div>
        : ""
      }

      {scheme.schemeRegistrarParams ?
        <div className={css.schemeInfoContainer}>
          <h3>Genesis Protocol Params for Plugin Registration - <a href="https://daostack.zendesk.com/hc/en-us/articles/360002000537" target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/leanMore.svg" onClick={this.copyToClipboardHandler(scheme.address)} /></a></h3>
          <div className={css.schemeInfoContainerTable}>
          <table className={css.infoCardContent}>
            {renderVotingMachineLink(votingMachine)}
            {renderGpParams(scheme.schemeRegistrarParams.voteRegisterParams)}
          </table>
          </div>
        </div>
        : ""
      }

      {scheme.schemeRegistrarParams ?
        <div className={css.schemeInfoContainer}>
          <h3>Genesis Protocol Params for Plugin Removal - <a href="https://daostack.zendesk.com/hc/en-us/articles/360002000537" target="_blank" rel="noopener noreferrer"><img src="/assets/images/Icon/leanMore.svg" onClick={this.copyToClipboardHandler(scheme.address)} /></a></h3>
          <div className={css.schemeInfoContainerTable}>
          <table className={css.infoCardContent}>
            {renderVotingMachineLink(votingMachine)}
            {renderGpParams(scheme.schemeRegistrarParams.voteRemoveParams)}
          </table>
          </div>
        </div>
        : ""
      }
    </div>;
  }
}

export default connect(null, mapDispatchToProps)(SchemeInfo);
