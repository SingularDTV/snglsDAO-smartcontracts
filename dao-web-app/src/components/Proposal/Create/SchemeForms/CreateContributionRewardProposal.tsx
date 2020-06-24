import * as React from "react";
import { connect } from "react-redux";
import { IDAOState, ISchemeState } from "@daostack/client";
import { createProposal } from "actions/arcActions";
import { enableWalletProvider, getArc } from "arc";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import UserSearchField from "components/Shared/UserSearchField";
import TagsSelector from "components/Proposal/Create/SchemeForms/TagsSelector";
import TrainingTooltip from "components/Shared/TrainingTooltip";
import Analytics from "lib/analytics";
import { baseTokenName, supportedTokens, toBaseUnit, tokenDetails, toWei, isValidUrl } from "lib/util";
import { showNotification, NotificationStatus } from "reducers/notifications";
import { exportUrl, importUrlValues } from "lib/proposalUtils";
import * as css from "../CreateProposal.scss";
import MarkdownField from "./MarkdownField";
import { withTranslation } from 'react-i18next';



const Select = React.lazy(() => import("react-select"));

interface IExternalProps {
  scheme: ISchemeState;
  daoAvatarAddress: string;
  handleClose: () => any;
}

interface IStateProps {
  tags: Array<string>;
}

interface IDispatchProps {
  createProposal: typeof createProposal;
  showNotification: typeof showNotification;
}

const mapDispatchToProps = {
  createProposal,
  showNotification,
};

type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<IDAOState>;

interface IFormValues {
  beneficiary: string;
  description: string;
  ethReward: number;
  externalTokenAddress: string;
  externalTokenReward: number;
  nativeTokenReward: number;
  reputationReward: number;
  title: string;
  url: string;

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

export const SelectField: React.SFC<any> = ({options, field, form }) => (
  <React.Suspense fallback={<div>Loading...</div>}>
    <Select
      options={options}
      name={field.name}
      value={options ? options.find((option: any) => option.value === field.value) : ""}
      maxMenuHeight={100}
      onChange={(option: any) => form.setFieldValue(field.name, option.value)}
      onBlur={field.onBlur}
      className="react-select-container"
      classNamePrefix="react-select"
      styles={customStyles}
    />
  </React.Suspense>
);

class CreateContributionReward extends React.Component<IProps, IStateProps> {

  initialFormValues: IFormValues;

  constructor(props: IProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.initialFormValues = importUrlValues<IFormValues>({
      beneficiary: "",
      description: "",
      ethReward: 0,
      externalTokenAddress: getArc().GENToken().address,
      externalTokenReward: 0,
      nativeTokenReward: 0,
      reputationReward: 0,
      title: "",
      url: "",
      tags: [],
    });
    this.state = {
      tags: this.initialFormValues.tags,
    };
  }

  private fnDescription = (<span>Short description of the proposal.<ul><li>What are you proposing to do?</li><li>Why is it important?</li><li>How much will it cost the DAO?</li><li>When do you plan to deliver the work?</li></ul></span>);

  public handleSubmit = async (values: IFormValues, { setSubmitting }: any ): Promise<void> => {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

    if (!values.beneficiary.startsWith("0x")) { values.beneficiary = "0x" + values.beneficiary; }

    const externalTokenDetails = tokenDetails(values.externalTokenAddress);
    let externalTokenReward;

    // If we know the decimals for the token then multiply by that
    if (externalTokenDetails) {
      externalTokenReward = toBaseUnit(values.externalTokenReward.toString(), externalTokenDetails.decimals);
    // Otherwise just convert to Wei and hope for the best
    } else {
      externalTokenReward = toWei(Number(values.externalTokenReward));
    }

    const proposalValues = {...values,
      scheme: this.props.scheme.address,
      dao: this.props.daoAvatarAddress,
      ethReward: toWei(Number(values.ethReward)),
      externalTokenReward,
      nativeTokenReward: toWei(Number(values.nativeTokenReward)),
      reputationReward: toWei(Number(values.reputationReward)),
      tags: this.state.tags,
    };

    setSubmitting(false);
    await this.props.createProposal(proposalValues);

    Analytics.track("Submit Proposal", {
      "DAO Address": this.props.daoAvatarAddress,
      "Proposal Title": values.title,
      "Scheme Address": this.props.scheme.address,
      "Scheme Name": this.props.scheme.name,
      "Reputation Requested": values.reputationReward,
      "ETH Requested": values.ethReward,
      "External Token Requested": values.externalTokenAddress,
      "DAO Token Requested": values.externalTokenReward,
      "Tags": proposalValues.tags,
    });

    this.props.handleClose();
  }

  // Exports data from form to a shareable url.
  public exportFormValues(values: IFormValues) {
    exportUrl({ ...values, ...this.state });
    this.props.showNotification(NotificationStatus.Success, "Exportable url is now in clipboard :)");
  }

  private onTagsChange = () => (tags: string[]): void => {
    this.setState({ tags });
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { data, daoAvatarAddress, handleClose } = this.props;

    if (!data) {
      return null;
    }
    const arc = getArc();

    return (
      <div className={css.contributionReward}>
        <Formik
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          initialValues={this.initialFormValues}
          // eslint-disable-next-line react/jsx-no-bind
          validate={(values: IFormValues): void => {
            const errors: any = {};

            const require = (name: string): void => {
              if (!(values as any)[name]) {
                errors[name] = "Required";
              }
            };

            const nonNegative = (name: string): void => {
              if ((values as any)[name] < 0) {
                errors[name] = "Please enter a non-negative reward";
              }
            };

            if (values.title.length > 120) {
              errors.title = "Title is too long (max 120 characters)";
            }

            if (!arc.web3.utils.isAddress(values.beneficiary)) {
              errors.beneficiary = "Invalid address";
            }

            if (!isValidUrl(values.url)) {
              errors.url = t('errors.invalidUrl');;
            }

            nonNegative("ethReward");
            nonNegative("externalTokenReward");
            nonNegative("nativeTokenReward");

            require("description");
            require("title");
            require("beneficiary");

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
            isSubmitting,
            setFieldTouched,
            setFieldValue,
            values,
          }: FormikProps<IFormValues>) =>
            <Form noValidate>
              <label className={css.description}>{t("schema.whatToExpect")}</label>
              <div className={css.description}>{t("proposal.thisProposalCanSendEth")}</div>
              <TrainingTooltip overlay={t("tooltips.theTitleIsTHeHeaderOfTheProposal")} placement="right">
                <label htmlFor="titleInput">
                  <div className={css.requiredMarker}>*</div>
                  {t("dashboard.title")}
                  <ErrorMessage name="title">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                </label>
              </TrainingTooltip>
              <Field
                autoFocus
                id="titleInput"
                maxLength={120}
                placeholder={t('proposal.summarizeYourProposal')}
                name="title"
                type="text"
                className={touched.title && errors.title ? css.error : null}
              />

              <TrainingTooltip overlay={this.fnDescription} placement="right">
                <label htmlFor="descriptionInput">
                  <div className={css.requiredMarker}>*</div>
                {t('account.desc')}
                  <img className={css.infoTooltip} src="/assets/images/Icon/Info.svg"/>
                  <ErrorMessage name="description">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                </label>
              </TrainingTooltip>
              <Field
                component={MarkdownField}
                onChange={(value: any) => { setFieldValue("description", value); }}
                id="descriptionInput"
                placeholder="Describe your proposal in greater detail"
                name="description"
                className={touched.description && errors.description ? css.error : null}
              />

              <TrainingTooltip overlay={t("tooltips.addSomeTags")} placement="right">
                <label className={css.tagSelectorLabel}>
                {t("schema.tags")}
                </label>
              </TrainingTooltip>

              <div className={css.tagSelectorContainer}>
                <TagsSelector onChange={this.onTagsChange()} tags={this.state.tags}></TagsSelector>
              </div>

              <TrainingTooltip overlay={t("tooltips.linkToTheFullyDetailedDesc")} placement="right">
                <label htmlFor="urlInput">
                {t("schema.url")}
                  <ErrorMessage name="url">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                </label>
              </TrainingTooltip>
              <Field
                id="urlInput"
                maxLength={120}
                placeholder={t('proposal.descriptionUrl')}
                name="url"
                type="text"
                className={touched.url && errors.url ? css.error : null}
              />

              <div>
                <TrainingTooltip overlay={t('tooltips.etherAddressOrAlchemyUserToReceiveRewards')} placement="right">
                  <label htmlFor="beneficiary">
                    <div className={css.requiredMarker}>*</div>
                    {t('proposal.recipient')}
                    <ErrorMessage name="beneficiary">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                </TrainingTooltip>
                <UserSearchField
                  daoAvatarAddress={daoAvatarAddress}
                  name="beneficiary"
                  onBlur={(touched) => { setFieldTouched("beneficiary", touched); }}
                  onChange={(newValue) => { setFieldValue("beneficiary", newValue); }}
                  defaultValue={this.initialFormValues.beneficiary}
                />
              </div>

              <div className={css.rewards}>
                <div className={css.reward}>
                  <label htmlFor="ethRewardInput">
                    {baseTokenName()} {t('proposal.treasuryAllocation')}
                    <ErrorMessage name="ethReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    id="ethRewardInput"
                    placeholder={`How much ${baseTokenName()} to reward`}
                    name="ethReward"
                    type="number"
                    className={touched.ethReward && errors.ethReward ? css.error : null}
                    min={0}
                    step={0.1}
                  />
                </div>

                <div className={css.reward}>
                  <label htmlFor="externalRewardInput">
                  {t('proposal.tokenTreasuryAllocation')}
                    <ErrorMessage name="externalTokenReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <div className={css.externalTokenInput}>
                    <div className={css.amount}>
                      <Field
                        id="externalRewardInput"
                        placeholder={t('proposal.howManyTokensToReward')}
                        name="externalTokenReward"
                        type="number"
                        className={touched.externalTokenReward && errors.externalTokenReward ? css.error : null}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <div className={css.select}>
                      <Field
                        id="externalTokenAddress"
                        name="externalTokenAddress"
                        component={SelectField}
                        options={Object.keys(supportedTokens()).map((tokenAddress) => {
                          const token = supportedTokens()[tokenAddress];
                          return { value: tokenAddress, label: token["symbol"] };
                        })}
                      />
                    </div>
                  </div>
                </div>

                {(touched.ethReward || touched.externalTokenReward || touched.reputationReward || touched.nativeTokenReward)
                    && touched.reputationReward && errors.rewards &&
                  <span className={css.errorMessage + " " + css.someReward}><br/> {errors.rewards}</span>
                }
              </div>
              <div className={css.createProposalActions}>
                <TrainingTooltip overlay="Export proposal" placement="top">
                  <button id="export-proposal" className={css.exportProposal} type="button" onClick={() => this.exportFormValues(values)}>
                    <img src="/assets/images/Icon/share-blue.svg" />
                  </button>
                </TrainingTooltip>
                <button className={css.exitProposalCreation} type="button" onClick={handleClose}>
                  {t('daojoin.cancel')}
                </button>
                <TrainingTooltip overlay={t('tooltips.onceTheProposalSubmitted')} placement="top">
                  <button className={css.submitProposal} type="submit" disabled={isSubmitting}>
                  {t('schema.submitProposal')}
                  </button>
                </TrainingTooltip>
              </div>
            </Form>
          }
        />
      </div>
    );
  }
}

const SubscribedCreateContributionReward = withSubscription({
  wrappedComponent: CreateContributionReward,
  checkForUpdate: ["daoAvatarAddress"],
  createObservable: (props: IExternalProps) => {
    const arc = getArc();
    return arc.dao(props.daoAvatarAddress).state();
  },
});
//@ts-ignore
export default connect(null, mapDispatchToProps)(withTranslation()(SubscribedCreateContributionReward));
