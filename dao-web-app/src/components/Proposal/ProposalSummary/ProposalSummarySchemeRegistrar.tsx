import { IDAOState, IProposalState, IProposalType, ISchemeRegistrar } from "@daostack/clientc";
import classNames from "classnames";
import { copyToClipboard, getNetworkName, linkToEtherScan } from "lib/util";
import { schemeNameAndAddress } from "lib/schemeUtils";
import * as React from "react";
import { IProfileState } from "reducers/profilesReducer";
import * as css from "./ProposalSummary.scss";
import { withTranslation } from 'react-i18next';


interface IProps {
  beneficiaryProfile?: IProfileState;
  detailView?: boolean;
  dao: IDAOState;
  proposal: IProposalState;
  transactionModal?: boolean;
}

interface IState {
  network: string;

}

class ProposalSummary extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      network: "",
    };

  }

  public async componentDidMount (): Promise<void> {
    this.setState({ network: (await getNetworkName()).toLowerCase() });
  }

  private copySchemeAddressOnClick = (schemeRegistrar: ISchemeRegistrar) => (): void => copyToClipboard(schemeRegistrar.schemeToRegister);
  private copySchemeParamsHashOnClick = (schemeRegistrar: ISchemeRegistrar) => (): void => copyToClipboard(schemeRegistrar.schemeToRegisterParamsHash);

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { proposal, detailView, transactionModal } = this.props;

    const proposalSummaryClass = classNames({
      [css.detailView]: detailView,
      [css.transactionModal]: transactionModal,
      [css.proposalSummary]: true,
      [css.withDetails]: true,
    });

    const schemeRegistrar = proposal.schemeRegistrar;
    // const permissions = parseInt(schemeRegistrar.schemeToRegisterPermission, 16);

    return (
      <div className={proposalSummaryClass}>
        { schemeRegistrar.schemeToRemove  ?
          <div>
            <span className={css.summaryTitle}>
              <img src="/assets/images/Icon/delete.svg"/>&nbsp;
              {t("proposal.removeScheme")}
              <a href={linkToEtherScan(schemeRegistrar.schemeToRemove)} target="_blank" rel="noopener noreferrer">{schemeNameAndAddress(schemeRegistrar.schemeToRemove)}</a>
            </span>
            { detailView ?
              <div className={css.summaryDetails}>
                <table><tbody>
                  <tr>
                    <th>
                    {t("membership.address")}:
                      <a href={linkToEtherScan(schemeRegistrar.schemeToRemove)} target="_blank" rel="noopener noreferrer">
                        <img src="/assets/images/Icon/Link-blue.svg"/>
                      </a>
                    </th>
                    <td>{schemeRegistrar.schemeToRemove}</td>
                  </tr>
                </tbody></table>
              </div>
              : ""
            }
          </div>
          : schemeRegistrar.schemeToRegister ?
            <div>
              <span className={css.summaryTitle}>
                <b className={css.schemeRegisterIcon}>{proposal.type === IProposalType.SchemeRegistrarEdit ? <img src="/assets/images/Icon/edit-sm.svg"/> : "+"}</b>&nbsp;
          {proposal.type === IProposalType.SchemeRegistrarEdit ? t("proposal.edit") : t("proposal.add") } {t('proposal.scheme')}&nbsp;
                <a href={linkToEtherScan(schemeRegistrar.schemeToRegister)} target="_blank" rel="noopener noreferrer">{schemeNameAndAddress(schemeRegistrar.schemeToRegister)}</a>
              </span>
              { detailView ?
                <div className={css.summaryDetails}>
                  <table>
                    <tbody>
                      <tr>
                        <th>
                        {t("membership.address")}:
                          <a href={linkToEtherScan(schemeRegistrar.schemeToRegister)} target="_blank" rel="noopener noreferrer">
                            <img src="/assets/images/Icon/Link-blue.svg"/>
                          </a>
                        </th>
                        <td>
                          <div className={css.hashCopy}>
                            <div className={css.hash}><span>{schemeRegistrar.schemeToRegister}</span></div>
                          <img src="/assets/images/Icon/Copy-white_nobg.svg" onClick={this.copySchemeAddressOnClick(schemeRegistrar)} />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>{t("schema.paramHash")}:</th>
                        <td>
                          <div className={css.hashCopy}>
                          <div className={css.hash}><span>{schemeRegistrar.schemeToRegisterParamsHash.slice(0, 43)}</span></div>
                          <img src="/assets/images/Icon/Copy-white_nobg.svg" onClick={this.copySchemeParamsHashOnClick(schemeRegistrar)} />
                          </div>
                        </td>
                      </tr>
                      {/* <tr>
                        <th>{t("proposal.permissions")}</th>
                        <td className={css.description}>
                          {
                            // eslint-disable-next-line no-bitwise
                          permissions & 2 ? <div>{t("proposal.registerOtherSchemes")}</div> : ""
                          }
                          {
                            // eslint-disable-next-line no-bitwise
                            permissions & 4 ? <div>{t("proposal.changeConstraints")}</div> : ""
                          }
                          {
                            // eslint-disable-next-line no-bitwise
                            permissions & 8 ? <div>{t("proposal.upgradeTheController")}</div> : ""
                          }
                          {
                            // eslint-disable-next-line no-bitwise
                            permissions & 16 ? <div>{t("proposal.callGenericCall")}</div> : ""
                          }
                          {
                            <div>{t("proposal.mintOrBurnRep")}</div>
                          }
                        </td>
                      </tr> */}
                    </tbody>
                  </table>
                </div>
                : ""
              }
            </div>
            :
            ""
        }
      </div>
    );
    // } else if (proposal.genericScheme) {
    //   return (
    //     <div className={proposalSummaryClass}>Unknown function call
    //     to contract at <a href={linkToEtherScan(proposal.genericScheme.contractToCall)}>{proposal.genericScheme.contractToCall.substr(0, 8)}...</a>
    //     with callData: <em>{proposal.genericScheme.callData}</em>
    //     </div>
    //   );
    // } else {
    //   return <div> Unknown scheme...</div>;
    // }
  }
}
//@ts-ignore
export default withTranslation()(ProposalSummary)
