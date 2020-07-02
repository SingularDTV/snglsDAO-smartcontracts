import { IProposalStage, IProposalState } from "@daostack/clientc";
import classNames from "classnames";
import * as React from "react";
import { proposalExpired, proposalFailed, proposalPassed } from "lib/proposalHelpers";
import * as css from "./ProposalStatus.scss";
import { withTranslation } from 'react-i18next';


class ProposalStatus extends React.Component<IProps, null> {

  constructor(props: IProps) {
    super(props);
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const {
      proposalState,
    } = this.props;

    const expiredInQueue = proposalExpired(proposalState); // expired in queue
    const passed = proposalPassed(proposalState);
    const failedByVote = !expiredInQueue && proposalFailed(proposalState);

    const wrapperClass = classNames({
      [css.wrapper]: true,
    });

    return (
      <div className={wrapperClass}>
        {(
          expiredInQueue ?
            <div className={classNames({
              [css.status]: true,
              [css.expired]: true,
            })}>Expired</div> :

            (proposalState.stage === IProposalStage.Queued) ?
              <div className={classNames({
                [css.status]: true,
                [css.regular]: true,
              })}>Regular</div> :

              (passed) ?
                <div className={classNames({
                  [css.status]: true,
                  [css.passed]: true,
                })}><img src="/assets/images/Icon/vote/for-fill-green.svg" />{t("proposa.pass")}</div> :

                (failedByVote) ?
                  <div className={classNames({
                    [css.status]: true,
                    [css.failed]: true,
                  })}><img src="/assets/images/Icon/vote/against-btn-fill-red.svg" />Failed</div> :

                  (proposalState.stage === IProposalStage.PreBoosted) ?
                    <div className={classNames({
                      [css.status]: true,
                      [css.pending]: true,
                    })}><img src="/assets/images/Icon/pending.svg" />Pending Boosting</div> :

                    (proposalState.stage === IProposalStage.Boosted) ?
                      <div className={classNames({
                        [css.status]: true,
                        [css.boosted]: true,
                      })}><img src="/assets/images/Icon/boosted.svg" />Boosted</div> :

                      (proposalState.stage === IProposalStage.QuietEndingPeriod) ?
                        <div className={classNames({
                          [css.status]: true,
                          [css.quietEnding]: true,
                        })}><img src="/assets/images/Icon/boosted.svg" />Boosted (overtime)</div> :

                        <div className={classNames({
                          [css.status]: true,
                          [css.expired]: true,
                        })}>[unknown status]</div>
        )
        }
      </div>
    );
  }
}

interface IProps {
  proposalState: IProposalState;
}
//@ts-ignore
export default withTranslation()(ProposalStatus)
