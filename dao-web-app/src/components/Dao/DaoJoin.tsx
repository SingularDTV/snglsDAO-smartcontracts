import { IDAOState, ISchemeState /*, IProposalCreateOptionsCompetition */ } from "@daostack/client";
import * as arcActions from "../../actions/arcActions";
import { enableWalletProvider, getArc, getArcSettings } from "../../arc";
import withSubscription, { ISubscriptionProps } from "../../components/Shared/withSubscription";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { /* baseTokenName, supportedTokens,  toBaseUnit, tokenDetails,  toWei, */ isValidUrl/*, getLocalTimezone */ } from "lib/util";
import Loading from "components/Shared/Loading";
import * as React from "react";
// import { RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import Select from "react-select";
import { History } from "history";
import { showNotification } from "../../reducers/notifications";
// import TagsSelector from "../../components/Proposal/Create/SchemeForms/TagsSelector";
import TrainingTooltip from "../../components/Shared/TrainingTooltip";
import * as css from "./DaoJoin.scss";
import { withTranslation } from 'react-i18next';
import { IRootState } from "reducers";

interface IExternalStateProps {
  daoAvatarAddress: string;
  history: History;
}

interface IExternalProps {
  currentAccountAddress: String;
  scheme: ISchemeState;
  daoAvatarAddress: string;
  history: History;
}

interface IStateProps {
  currentAccountAddress: String;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<IDAOState> & IExternalStateProps;

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
  }

  public handleClose = (e: any) => {
    const { history } = this.props;
    history.push("/dao/dashboard/");
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

    sgtTokenContract.methods.approve(settings.lockingSGT4ReputationContractAddress, calculatedApproveValue).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
      if (error) throw error;
    }).then(function () {
      reputationContract.methods.lock(calculatedApproveValue, settings.minLockingPeriod).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
        if (error) throw error;
      });
    });

    this.handleClose({});
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { data } = this.props;

    if (!data) {
      return null;
    }
    const dao = data;
    // const arc = getArc();
    // const localTimezone = getLocalTimezone();
    // const now = moment();
    return (
      <div className={css.createProposalWrapper}>
      {/* <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/proposals/create`}>Create {schemeTitle} Proposal</BreadcrumbsItem> */}
      <div className={css.header}>
        <h2><span> {t("daojoin.rep")} </span></h2>
        <button className={css.closeButton} aria-label="Close Create Proposal Modal"  onClick={this.handleClose}  ><img src="/assets/images/close.svg" alt=""/></button>
      </div>
      <div className={css.contributionReward}>
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
                errors[name] = "Please enter a non-negative value";
              }
            };

            if (!isValidUrl(values.url)) {
              errors.url = "Invalid URL";
            }

            nonNegative("ethReward");
            if (!values.ethReward && !values.reputationReward && !values.externalTokenReward && !values.nativeTokenReward) {
              errors.rewards = "Please select at least some reward";
            }

            return errors;
          }}
          onSubmit={this.handleSubmit}
          // eslint-disable-next-line react/jsx-no-bind
          render={({
            errors,
            touched,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            handleSubmit,
            isSubmitting,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            setFieldTouched,
            setFieldValue,
          }: FormikProps<IFormValues>) =>
            <Form noValidate>
              <div className={css.subhead}>
                <div className={css.description}>
                    <p>{t("daojoin.needStake")}</p>
                </div>
                  <div>
                  <a href="#" className={css.btn}>{t("daojoin.cancel")}</a>
                  </div>
              </div>

              <div className={css.content}>
                <p>{t("daojoin.haveAmountStaked")}</p>
              <div className={css.rewards}>
                <div className={css.reward}>
                  <div className={css.bigInput}>
                    <label htmlFor="nativeTokenRewardInput">{dao.tokenSymbol}
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
                      <button type="button">max</button>
                    </div>
                  </div>
                  <div className={css.balances}>
                    <span className={css.tokens}>SGT Tokens: <strong>0.00</strong></span>
                    <span className={css.holdings}>Reputation: <strong>0.00% Rep.</strong></span>
                  </div>
                  <span className={css.holdings}>{t("daojoin.haveAmountStaked")}</span>
                </div>
              </div>

              {(touched.ethReward || touched.externalTokenReward || touched.reputationReward || touched.nativeTokenReward)
                    && touched.reputationReward && errors.rewards &&
                <span className={css.errorMessage + " " + css.someReward}><br/> {errors.rewards}</span>
              }
              <div className={css.createProposalActions}>
                <div>
                <TrainingTooltip overlay="Once the proposal is submitted it cannot be edited or deleted" placement="top">
                  <button className={css.submitProposal} type="submit" disabled={isSubmitting}>
                  {t('daojoin.getRep')}
                  </button>
                </TrainingTooltip>
                </div>
                <div>
                  <button className={css.exitProposalCreation} type="button" onClick={this.handleClose}>
                  {t('daojoin.cancel')}
                  </button>
                </div>
              </div>

            </div>

            </Form>
          }
        />
      </div>
      </div>

    );
  }
}

const SubscribedGetReputation = withSubscription({
  wrappedComponent: GetReputation,
  checkForUpdate: ["daoAvatarAddress"],
  loadingComponent: <Loading/>,
  createObservable: (props: IExternalStateProps) => {
    const arc = getArc();
    return arc.dao(getArcSettings().daoAvatarContractAddress).state();
  },
});
//@ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SubscribedGetReputation));
