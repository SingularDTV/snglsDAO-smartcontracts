import { Address, IDAOState, IMemberState, IProposalOutcome, IProposalStage, IProposalState } from "@daostack/clientc";
import { voteOnProposal } from "actions/arcActions";
import { enableWalletProvider } from "arc";

import BN = require("bn.js");
import classNames from "classnames";
import Reputation from "components/Account/Reputation";
import { ActionTypes, default as PreTransactionModal } from "components/Shared/PreTransactionModal";
import Analytics from "lib/analytics";
import { fromWei } from "lib/util";
import { Page } from "pages";
import * as React from "react";
import { connect } from "react-redux";
import { showNotification } from "reducers/notifications";
import * as css from "./VoteButtons.scss";
import { withTranslation } from 'react-i18next'

interface IExternalProps {
  altStyle?: boolean;
  contextMenu?: boolean;
  currentAccountAddress: Address;
  currentAccountState: IMemberState;
  currentVote: IProposalOutcome|undefined;
  dao: IDAOState;
  expired?: boolean;
  parentPage: Page;
  proposal: IProposalState;
}

interface IDispatchProps {
  voteOnProposal: typeof voteOnProposal;
  showNotification: typeof showNotification;
}

type IProps = IExternalProps & IDispatchProps;

interface IState {
  contextMenu?: boolean;
  currentVote: IProposalOutcome|undefined;
  showPreVoteModal: boolean;
}

const mapDispatchToProps = {
  showNotification,
  voteOnProposal,
};

class VoteButtons extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      currentVote: this.props.currentVote,
      showPreVoteModal: false,
    };
  }

  public handleClickVote = (vote: number) => async (): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

    const currentAccountState = this.props.currentAccountState;
    if (currentAccountState.reputation.gt(new BN(0))) {
      this.setState({ showPreVoteModal: true, currentVote: vote });
    }
  }

  private closePreVoteModal = (_event: any): void => { this.setState({ showPreVoteModal: false }); }

  private handleVoteOnProposal = (): void => {
    //@ts-ignore
    const { currentAccountState, dao, proposal, t } = this.props;

    this.props.voteOnProposal(dao.address, proposal.id, this.state.currentVote);

    Analytics.track("Vote", {
      "DAO Address": dao.address,
      "DAo Name": dao.name,
      "Proposal Hash": proposal.id,
      "Proposal Title": proposal.title,
      "Reputation Voted": fromWei(currentAccountState.reputation),
      "Scheme Address": proposal.scheme.address,
      "Scheme Name": proposal.scheme.name,
      "Vote Type": this.state.currentVote === IProposalOutcome.Fail ? t('proposal.fail') : this.state.currentVote === IProposalOutcome.Pass ? t('proposal.pass') : t('proposal.none') ,
    });
  };

  public render(): RenderOutput {
    const {
      altStyle,
      contextMenu,
      currentVote,
      currentAccountState,
      parentPage,
      proposal,
      dao,
      expired,
          //@ts-ignore

      t
    } = this.props;

    const votingDisabled = proposal.stage === IProposalStage.ExpiredInQueue ||
                            proposal.stage === IProposalStage.Executed ||
                            (proposal.stage === IProposalStage.Queued && expired) ||
                            (proposal.stage === IProposalStage.Boosted && expired) ||
                            (proposal.stage === IProposalStage.QuietEndingPeriod && expired) ||
                            (currentAccountState && currentAccountState.reputation.eq(new BN(0))) ||
                            currentVote === IProposalOutcome.Pass ||
                            currentVote === IProposalOutcome.Fail
                            ;

    /**
     * only used when votingDisabled
     */
    const disabledMessage =
      ((currentVote === IProposalOutcome.Pass) || (currentVote === IProposalOutcome.Fail)) ?
        t('proposal.cantChangeYourVOte') :
        (currentAccountState && currentAccountState.reputation.eq(new BN(0))) ?
        t('proposal.requiresReputation')  :
          proposal.stage === IProposalStage.ExpiredInQueue ||
              (proposal.stage === IProposalStage.Boosted && expired) ||
              (proposal.stage === IProposalStage.QuietEndingPeriod && expired)  ||
              (proposal.stage === IProposalStage.Queued && expired) ?
              t('proposal.cantVoteOnExpired')  :
            proposal.stage === IProposalStage.Executed ?
            t('proposal.cannotVote', {status: proposal.winningOutcome === IProposalOutcome.Pass ? t("proposal.passed") : t("proposal.failed") }) : "";

    const voteUpButtonClass = classNames({
      [css.votedFor]: currentVote === IProposalOutcome.Pass,
      [css.disabled]: votingDisabled,
    });
    const voteDownButtonClass = classNames({
      [css.votedAgainst]: currentVote === IProposalOutcome.Fail,
      [css.disabled]: votingDisabled,
    });
    const wrapperClass = classNames({
      [css.altStyle] : altStyle,
      [css.contextMenu] : contextMenu,
      [css.wrapper]: true,
      [css.hasVoted]: ((currentVote === IProposalOutcome.Pass) || (currentVote === IProposalOutcome.Fail)),
      [css.votedFor]: currentVote === IProposalOutcome.Pass,
      [css.votedAgainst]: currentVote === IProposalOutcome.Fail,
      [css.hasNotVoted]: ((currentVote === undefined) || (currentVote === IProposalOutcome.None)),
      [css.detailView]: parentPage === Page.ProposalDetails,
    });

    return (
      <div className={wrapperClass}>
        {this.state.showPreVoteModal ?
          <PreTransactionModal
          //@ts-ignore
            actionType={this.state.currentVote === IProposalOutcome.Pass ? ActionTypes.VoteUp : ActionTypes.VoteDown}
            action={this.handleVoteOnProposal}
            closeAction={this.closePreVoteModal}
            currentAccount={currentAccountState}
            dao={dao}
            effectText={<span>{t('proposal.yourInfluence')} <strong><Reputation daoName={dao.name} totalReputation={dao.reputationTotalSupply} reputation={currentAccountState.reputation} /></strong></span>}
            parentPage={parentPage}
            proposal={proposal}
          /> : ""
        }
        {contextMenu ?
          <div>
            <div className={css.contextTitle}>
              <div>
                <span className={css.hasVoted}>
                {t('proposal.uVoted')}
                </span>
                <span className={css.hasNotVoted}>
                {t('notifications.vote')}
                </span>
              </div>
            </div>
            <div className={css.contextContent}>
              <div className={css.hasVoted}>
                <div className={css.voteRecord}>
                  <span className={css.castVoteFor} data-test-id="youVotedFor">
                    <img src="/assets/images/Icon/vote/for-fill-green.svg"/>
                    <br/>
                 {t('proposal.for')}
                  </span>
                  <span className={css.castVoteAgainst}>
                    <img src="/assets/images/Icon/vote/against-btn-fill-red.svg"/>
                    <br/>
                    {t('proposal.against')}
                  </span>
                </div>
              </div>
              <div className={css.hasNotVoted}>
                {!votingDisabled ?
                  <div>
                    <button onClick={this.handleClickVote(1)} className={voteUpButtonClass} data-test-id="voteFor">
                      <img src={`/assets/images/Icon/vote/for-btn-selected${altStyle ? "-w" : ""}.svg`} />
                      <img className={css.buttonLoadingImg} src="/assets/images/Icon/buttonLoadingBlue.gif"/>
                      <span> {t('proposal.for')}</span>
                    </button>
                    <button onClick={this.handleClickVote(2)} className={voteDownButtonClass}>
                      <img src={`/assets/images/Icon/vote/against-btn-selected${altStyle ? "-w" : ""}.svg`}/>
                      <img className={css.buttonLoadingImg} src="/assets/images/Icon/buttonLoadingBlue.gif"/>
                      <span> {t('proposal.against')}</span>
                    </button>
                  </div>
                  :
                  <div className={css.votingDisabled}>
                    <span><img src="/assets/images/Icon/Alert-yellow-b.svg"/> {disabledMessage}</span>
                  </div>
                }
              </div>
            </div>
          </div>
          :
          <div>
            <div className={css.castVote}>
              {!votingDisabled ?
                <div>
                  <button onClick={this.handleClickVote(1)} className={voteUpButtonClass} data-test-id="voteFor">
                    <img src={`/assets/images/Icon/vote/for-btn-selected${altStyle ? "-w" : ""}.svg`} />
                    <img className={css.buttonLoadingImg} src="/assets/images/Icon/buttonLoadingBlue.gif"/>
                    <span> {t('proposal.for')}</span>
                  </button>
                  <button onClick={this.handleClickVote(2)} className={voteDownButtonClass}>
                    <img src={`/assets/images/Icon/vote/against-btn-selected${altStyle ? "-w" : ""}.svg`}/>
                    <img className={css.buttonLoadingImg} src="/assets/images/Icon/buttonLoadingBlue.gif"/>
                    <span> {t('proposal.against')}</span>
                  </button>
                </div>
                :
                <div className={css.votingDisabled}>
                  <span>{disabledMessage}</span>
                </div>
              }
            </div>

            <div className={css.voteRecord}>
            {t('proposal.uVoted')}
              <span className={css.castVoteFor} data-test-id="youVotedFor">
              - {t('proposal.for')}
              </span>
              <span className={css.castVoteAgainst}>
              - {t('proposal.against')}
              </span>
            </div>
          </div>
        }
      </div>
    );
  }
}
//@ts-ignore
export default connect(null, mapDispatchToProps)(withTranslation()(VoteButtons));
