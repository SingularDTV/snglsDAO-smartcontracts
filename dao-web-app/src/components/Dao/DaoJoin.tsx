import { IDAOState, ISchemeState, Member /*, IProposalCreateOptionsCompetition */ } from "@daostack/client";
import * as arcActions from "../../actions/arcActions";
import { enableWalletProvider, getArc, getArcSettings } from "../../arc";
import withSubscription, { ISubscriptionProps } from "../../components/Shared/withSubscription";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { /* baseTokenName, supportedTokens,  toBaseUnit, tokenDetails,  toWei, */ isValidUrl/*, getLocalTimezone */ } from "lib/util";
import Loading from "components/Shared/Loading";
import { Tabs, Checkbox, Statistic } from 'antd';
import * as React from "react";
import { fromWei } from "lib/util";
import { Trans } from 'react-i18next';
// import { RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import * as moment from "moment";
import { History } from "history";
import { showNotification, NotificationStatus } from "reducers/notifications";
// import TagsSelector from "../../components/Proposal/Create/SchemeForms/TagsSelector";
import * as css from "./DaoJoin.scss";
import "./ant.global.scss";
import { withTranslation } from 'react-i18next';
import { IRootState } from "reducers";
import { zip} from "rxjs";
import {map} from "rxjs/operators";
import Reputation from "../Account/Reputation";
// import { any } from "prop-types";


const { Countdown } = Statistic;
const { TabPane } = Tabs;

interface IExternalStateProps {
  daoAvatarAddress: string;
  member: Member;
  daoState?: IDAOState;
  currentAccountAddress: string;
  agreementHash: any;
  history: History;
}

interface IExternalProps {
  currentAccountAddress: String;
  scheme: ISchemeState;
  daoAvatarAddress: string;
  history: History;
  agreementHash: any;
}

interface IStateProps {
  // currentAccountAddress: String;
  releaseTime?: string;
  balance?: string;
  agreementHash: any;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<Member> & IExternalStateProps;

interface IFormValues {
  nativeTokenReward: number;
  [key: string]: any;
}

const customStyles = {
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided: any) => ({
    ... provided,
    borderTop: "none",
    borderRadius: "0 0 5px 5px",
    marginTop: 1,
    backgroundColor: "rgba(255,255,255,1)",
  }),
};

export const SelectField: React.SFC<any> = ({options, field, form, _value }) => {
  // value={options ? options.find((option: any) => option.value === field.value) : ""}
  return <Select
    options={options}
    name={field.name}
    defaultValue={options[0]}
    maxMenuHeight={100}
    onChange={(option: any) => form.setFieldValue(field.name, option.value)}
    onBlur={field.onBlur}
    className="react-select-container"
    classNamePrefix="react-select"
    styles={customStyles}
  />;
};


const mapStateToProps = (state: IRootState, ownProps: IExternalProps): IExternalProps & IStateProps => {
  return {...ownProps,
    currentAccountAddress: state.web3.currentAccountAddress,
  };
};



class GetReputation extends React.Component<IProps, IStateProps> {


  constructor(props: IProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleUnstake = this.handleUnstake.bind(this);
    this.state = {
      releaseTime: null,
      agreementHash: "",
    };
  }

  public handleClose = (e: any) => {
    const { history } = this.props;
    history.push("/dao/dashboard/");
  }

  public async componentDidMount() {
    const arc = getArc();
    const settings = getArcSettings();
    const lockingSGT4ReputationContract = new arc.web3.eth.Contract(settings.lockingSGT4ReputationContractABI, settings.lockingSGT4ReputationContractAddress);
    const staked = await lockingSGT4ReputationContract.methods.lockers(this.props.currentAccountAddress).call()
    console.log("dfd ", await lockingSGT4ReputationContract.methods.getAgreementHash().call())
    this.setState(
      {
         releaseTime: staked?.releaseTime,
         agreementHash: await lockingSGT4ReputationContract.methods.getAgreementHash().call()
      });
    this.fetchBalances();
  }

  public async fetchBalances() {
    const arc = getArc();
    const settings = getArcSettings();

    // Create contract object
    const sgtTokenContract = new arc.web3.eth.Contract(settings.erc20TokenContractABI, settings.sgtTokenContractAddress);

    const staked = await sgtTokenContract.methods.balanceOf(this.props.currentAccountAddress).call()
    this.setState(
      {
        balance: arc.web3.utils.fromWei(staked, 'ether'),
      }
    );
  }

  public handleUnstake = async (): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) {
      return;
    }
    const arc = getArc();
    const settings = getArcSettings();
    const currentAccountAddress = this.props.currentAccountAddress;

    const reputationContract = new arc.web3.eth.Contract(settings.lockingSGT4ReputationContractABI, settings.lockingSGT4ReputationContractAddress);

    await reputationContract.methods.release().send({from: currentAccountAddress})
    this.handleClose({});
  }

  public handleSubmit = async (values: IFormValues, { _setSubmitting }: any ): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) {
      return;
    }
    const arc = getArc();
    const settings = getArcSettings();

    const reputationContract = new arc.web3.eth.Contract(settings.lockingSGT4ReputationContractABI, settings.lockingSGT4ReputationContractAddress);
    const sgtTokenContract = new arc.web3.eth.Contract(settings.erc20TokenContractABI, settings.sgtTokenContractAddress);

    const tokenDecimals = arc.web3.utils.toBN(18);
    const tokenAmountToApprove = arc.web3.utils.toBN(values.nativeTokenReward);
    const calculatedApproveValue = arc.web3.utils.toHex(tokenAmountToApprove.mul(arc.web3.utils.toBN(10).pow(tokenDecimals)));

    const currentAccountAddress = this.props.currentAccountAddress;
    const agreementHash = this.state.agreementHash;

    console.log("agreementHash ", this.state.agreementHash);
    //todo move methods to store
    let txDescription: string;
    let msg;

    try{
      txDescription = 'Get reputation approve'
      msg = `${txDescription} transaction sent! Please wait for it to be processed`;

      this.props.showNotification(NotificationStatus.Success, msg)
      await sgtTokenContract.methods.approve(settings.lockingSGT4ReputationContractAddress, calculatedApproveValue).send({from: currentAccountAddress})
      msg = `${txDescription} transaction confirmed`;
      this.props.showNotification(NotificationStatus.Success, msg);

      txDescription = 'Get reputation lock'
      await reputationContract.methods.lock(calculatedApproveValue, settings.sgtLockingPeriod, agreementHash).send({from: currentAccountAddress})
      msg = `${txDescription} transaction confirmed`;
      this.props.showNotification(NotificationStatus.Success, msg);
    } catch (error) {
      const msg = `${txDescription}: transaction failed :-( - ${error.message}`;
      this.props.showNotification(NotificationStatus.Failure, msg)
    }

    this.handleClose({});
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    //@ts-ignore
    const { data: { dao, member } } = this.props;
    const { releaseTime } = this.state;

    if (!dao) {
      return null;
    }
    // console.log('this.state', this.state)
    const percentageBn = fromWei(member.reputation)

    return (
      <div className={css.createProposalWrapper}>
      {/* <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/proposals/create`}>Create {schemeTitle} Proposal</BreadcrumbsItem> */}
      <div className={css.header}>
        <h2><span> {t("daojoin.rep")} </span></h2>
        <button className={css.closeButton} aria-label="Close Create Proposal Modal"  onClick={this.handleClose}  ><img src="/assets/images/close.svg" alt=""/></button>
      </div>
      {!!percentageBn && (
        <div className={css.releaseTime}>
          <Countdown title="Token defrosting will be available in"
              // @ts-ignore
              value={moment(releaseTime*1000).format()}
              format="DD:HH:mm:ss"
              valueStyle={{ display: 'flex',justifyContent: 'center' }}
            />
        </div>
      )}

        <div className={css.contributionReward}>
          <Tabs defaultActiveKey="1">
            <TabPane tab={t("daojoin.Stake")} key="1">
              <Formik
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                initialValues={{
                  nativeTokenReward: 0,
                } as IFormValues}
                // eslint-disable-next-line react/jsx-no-bind
                validate={(values: IFormValues): void => {
                  const errors: any = {};
                  const nonNegative = (name: string): void => {
                    if ((values as any)[name] < 0) {
                      errors[name] = t("errors.nonNegative");
                    }
                  };

                  if (!isValidUrl(values.url)) {
                    errors.url = t("errors.invalidUrl");
                  }

                  nonNegative("ethReward");
                  if (!values.ethReward && !values.reputationReward && !values.externalTokenReward && !values.nativeTokenReward) {
                    errors.rewards = t("proposal.pleaseSelectAtLeastSomeReward");
                  }

                  return errors;
                }}
                onSubmit={this.handleSubmit}
                // eslint-disable-next-line react/jsx-no-bind
                render={({
                           errors,
                           touched,
                           values,
                           // eslint-disable-next-line @typescript-eslint/no-unused-vars
                           handleSubmit,
                           isSubmitting,
                           // eslint-disable-next-line @typescript-eslint/no-unused-vars
                           setFieldTouched,
                           setFieldValue,
                         }: FormikProps<IFormValues>) =>
                  <Form noValidate>

                    <div className={css.content}>
                      <p>{t("daojoin.haveAmountStaked")}</p>
                      <p> {t("daojoin.yourCurrentBalance")} {this.state.balance } {t("header.SGT")}</p>
                      <div className={css.rewards}>
                        <div className={css.reward}>
                          <div className={css.bigInput}>
                            <label htmlFor="nativeTokenRewardInput">
                              {
                                //@ts-ignore
                                dao.tokenSymbol}
                              <ErrorMessage name="nativeTokenReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                            </label>
                            <Field
                              id="nativeTokenRewardInput"
                              maxLength={10}
                              placeholder="How many SGT to stake"
                              name="nativeTokenReward"
                              type="number"
                              className={touched.nativeTokenReward && errors.nativeTokenReward ? css.error : null}
                            />
                            <div className={css.btnMax}>
                              <button type="button" onClick={ () => { setFieldValue("nativeTokenReward",  this.state.balance) }}>
                                {t('daojoin.max')}
                              </button>
                            </div>
                          </div>
                          <div className={css.balances}>
                            <span className={css.tokens}>{t('daojoin.sgtTokens')}
                              {percentageBn}{' '}
                              (
                              <Reputation daoName={dao.name}
                                //@ts-ignore
                                          totalReputation={dao.reputationTotalSupply}
                                          reputation={
                                            //@ts-ignore
                                            member.reputation}/>
                               )
                            </span>
                          </div>
                          <span className={css.holdings}>{t("daojoin.haveAmountStaked")}</span>
                        </div>
                      </div>
                      <Field
                        value={values?.term}
                        onChange={(e: any) => setFieldValue('term', e.target.checked)}
                        component={Checkbox}
                      >
                        <Trans i18nKey="agreementCheckbox">
                          By checking this you agree to our <a target="_blank" rel="noopener noreferrer" href="https://ipfs.io/ipfs/QmVixgD9gSkWt8tN3Uk93D3KHUCB1UT47WBJqXfo6bcZ6U">Participation Agreement</a> and tokens will be locked for 30 days
                        </Trans>
                      </Field>
                      {(touched.ethReward || touched.externalTokenReward || touched.reputationReward || touched.nativeTokenReward)
                      && touched.reputationReward && errors.rewards &&
                      <span className={css.errorMessage + " " + css.someReward}><br/> {errors.rewards}</span>
                      }
                      <div className={css.createProposalActions}>
                        <div>
                            <button className={css.submitProposal} type="submit" disabled={isSubmitting || !values?.term}>
                              {t('daojoin.getRep')}
                            </button>
                        </div>
                      </div>
                    </div>
                  </Form>
                }
              />
            </TabPane>
            <TabPane tab={t("daojoin.Unstake")} key="2">
              {/*TODO add text for TrainingTooltip and add handling*/}
             <div style={{ display: 'flex',justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{ marginBottom: 10}}>
                <div className={css.balances}>
                            <span className={css.tokens}>{t('daojoin.sgtTokens')}
                              {percentageBn}{' '}
                              (
                              <Reputation daoName={dao.name}
                                //@ts-ignore
                                          totalReputation={dao.reputationTotalSupply}
                                          reputation={
                                            //@ts-ignore
                                            member.reputation}/>
                               )
                            </span>
                </div>
              </div>
                 <button className={css.submitProposal} type="submit"  onClick={this.handleUnstake} disabled={Math.round((new Date()).getTime() / 1000) < parseInt(releaseTime)}>
                   {t('daojoin.removeRep')}
                 </button>
             </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

    );
  }
}

const SubscribedGetReputation = withSubscription({
  //@ts-ignore
  wrappedComponent: GetReputation,
  checkForUpdate: [],
  loadingComponent: <Loading/>,
  createObservable: async (props: IExternalStateProps) => {
    const dao = props.daoState.dao;
    const member =  dao.member(props.currentAccountAddress)
    const arc = getArc();
    return zip(
      member.state(),
      arc.dao(getArcSettings().daoAvatarContractAddress).state()
    ).pipe(
      map(([member, dao]) => ({member, dao}))
    )
  },
});
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedGetReputation));
