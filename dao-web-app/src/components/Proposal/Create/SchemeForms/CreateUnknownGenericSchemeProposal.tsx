import { ISchemeState } from "@daostack/client";
import { createProposal } from "actions/arcActions";
import { enableWalletProvider } from "arc";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import Analytics from "lib/analytics";
import * as React from "react";
import { connect } from "react-redux";
import { showNotification, NotificationStatus } from "reducers/notifications";
// import { baseTokenName, isValidUrl } from "lib/util";
import { isValidUrl } from "lib/util";
import { exportUrl, importUrlValues } from "lib/proposalUtils";
import TagsSelector from "components/Proposal/Create/SchemeForms/TagsSelector";
import TrainingTooltip from "components/Shared/TrainingTooltip";
import * as css from "../CreateProposal.scss";
import MarkdownField from "./MarkdownField";
import { withTranslation } from 'react-i18next';


interface IExternalProps {
  daoAvatarAddress: string;
  handleClose: () => any;
  scheme: ISchemeState;
}

interface IDispatchProps {
  createProposal: typeof createProposal;
  showNotification: typeof showNotification;
}

interface IStateProps {
  tags: Array<string>;
}

type IProps = IExternalProps & IDispatchProps;

const mapDispatchToProps = {
  createProposal,
  showNotification,
};

interface IFormValues {
  description: string;
  callData: string;
  title: string;
  url: string;
  value: number;
  [key: string]: any;
}

class CreateGenericScheme extends React.Component<IProps, IStateProps> {

  initialFormValues: IFormValues;

  constructor(props: IProps) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.initialFormValues = importUrlValues<IFormValues>({
      description: "",
      callData: "",
      title: "",
      url: "",
      value: 0,
      tags: [],
    });
    this.state = {
      tags: this.initialFormValues.tags,
    };
  }

  public async handleSubmit(values: IFormValues, { setSubmitting }: any ): Promise<void> {
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) { return; }

    const proposalValues = {...values,
      dao: this.props.daoAvatarAddress,
      scheme: this.props.scheme.address,
      tags: this.state.tags,
    };

    setSubmitting(false);
    await this.props.createProposal(proposalValues);

    Analytics.track("Submit Proposal", {
      "DAO Address": this.props.daoAvatarAddress,
      "Proposal Title": values.title,
      "Scheme Address": this.props.scheme.address,
      "Scheme Name": this.props.scheme.name,
    });

    this.props.handleClose();
  }

  // Exports data from form to a shareable url.
  public exportFormValues(values: IFormValues) {
    exportUrl({ ...values, ...this.state });
    this.props.showNotification(NotificationStatus.Success, "Exportable url is now in clipboard :)");
  }

  private onTagsChange = (tags: any[]): void => {
    this.setState({tags});
  }

  public render(): RenderOutput {
    //@ts-ignore
    const { t } = this.props;
    const { handleClose } = this.props;

    const fnDescription = () => (<span>Short description of the proposal.<ul><li>What are you proposing to do?</li><li>Why is it important?</li><li>How much will it cost the DAO?</li><li>When do you plan to deliver the work?</li></ul></span>);

    return (
      <div className={css.contributionReward}>
        <Formik
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          initialValues={this.initialFormValues}
          // eslint-disable-next-line react/jsx-no-bind
          validate={(values: IFormValues): void => {
            const errors: any = {};

            const require = (name: string) => {
              if (!(values as any)[name]) {
                errors[name] = "Required";
              }
            };

            const nonEmpty = (name: string) => {
              if (!(values as any)[name].toString()) {
                errors[name] = "Required";
              }
            };

            const nonNegative = (name: string) => {
              if ((values as any)[name] < 0) {
                errors[name] = t('errors.nonNegative');
              }
            };

            if (values.title.length > 120) {
              errors.title = t('errors.isToLong');
            }

            if (!isValidUrl(values.url)) {
              errors.url = t('errors.invalidUrl');
            }

            const bytesPattern = new RegExp("0x[0-9a-f]+", "i");
            if (values.callData && !bytesPattern.test(values.callData)) {
              errors.callData = t('errors.invalidEncoded');
            }

            require("callData");
            require("title");
            require("description");
            require("value");
            nonEmpty("value");
            nonNegative("value");

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
            values,
          }: FormikProps<IFormValues>) =>
            <Form noValidate>
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
                placeholder={t("proposal.summarizeYourProposal")}
                name="title"
                type="text"
                className={touched.title && errors.title ? css.error : null}
              />

              <TrainingTooltip overlay={fnDescription} placement="right">
                <label htmlFor="descriptionInput">
                  <div className={css.requiredMarker}>*</div>
                {t("account.description")}
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

              <TrainingTooltip overlay="Add some tags to give context about your proposal e.g. idea, signal, bounty, research, etc" placement="right">
                <label className={css.tagSelectorLabel}>
                {t('schema.tags')}
                </label>
              </TrainingTooltip>

              <div className={css.tagSelectorContainer}>
                <TagsSelector onChange={this.onTagsChange}></TagsSelector>
              </div>

              <TrainingTooltip overlay="Link to the fully detailed description of your proposal" placement="right">
                <label htmlFor="urlInput">
                {t('schema.url')}
                  <ErrorMessage name="url">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                </label>
              </TrainingTooltip>
              <Field
                id="urlInput"
                maxLength={120}
                placeholder="Description URL"
                name="url"
                type="text"
                className={touched.url && errors.url ? css.error : null}
              />

              <div className={css.encodedData}>
                <div>
                  <label htmlFor="callData">
                    <div className={css.requiredMarker}>*</div>
                    {t('proposal.paramsToChange')}
                    <ErrorMessage name="callData">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>


                  <div className={css.labelInput}>
                    <label htmlFor="Transactionfee">{t('proposal.transFee')}</label>
                    <Field
                      id="Transactionfee"
                      maxLength={120}
                      placeholder="New value (%)"
                      name="Transactionfee"
                      type="text"
                    />
                  </div>

                  <div className={css.labelInput}>
                    <label htmlFor="Listingfee">{t('proposal.listingFee')}</label>
                    <Field
                      id="Listingfee"
                      maxLength={120}
                      placeholder="New value (SNGLS)"
                      name="Listingfee"
                      type="text"
                    />
                  </div>

                  <div className={css.labelInput}>
                    <label htmlFor="Validationfee">{t('dashboard.validationFee')}</label>
                    <Field
                      id="Validationfee"
                      maxLength={120}
                      placeholder="New value (SNGLS)"
                      name="Validationfee"
                      type="text"
                      disabled={true}
                    />
                  </div>

                  <div className={css.labelInput}>
                    <label htmlFor="Membershipfee">{t('membership.memFee')}</label>
                    <Field
                      id="Membershipfee"
                      maxLength={120}
                      placeholder="New value (SNGLS)"
                      name="Membershipfee"
                      type="text"
                    />
                  </div>

                  {/* <label className={css.radio}>
                    <input
                      type="radio"
                      name="test"
                      value="Transaction fee"
                      checked={values.test === "Transactionfee"}
                      onChange={() => setFieldValue("test", "Transactionfee")}
                    />Transaction fee
                  </label>
                  <label className={css.radio}>
                    <input
                      type="radio"
                      name="test"
                      value="Listing fee"
                      checked={values.test === "Listingfee"}
                      onChange={() => setFieldValue("test", "Listingfee")}
                    />Listing fee
                  </label>
                  <label className={css.radio}>
                    <input
                      type="radio"
                      name="test"
                      value="Validation fee"
                      checked={values.test === "Validationfee"}
                      onChange={() => setFieldValue("test", "Validationfee")}
                    />Validation fee
                  </label> */}

                  {/* <label htmlFor="callDataInput">
                    <div className={css.requiredMarker}>*</div>
                    Enter new fee value
                    <ErrorMessage name="callDataInput">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>

                  <Field
                    id="callDataInput"
                    placeholder="Value"
                    name="callDataInput"
                    type="number"
                    className={touched.callData && errors.callData ? css.error : null}
                    min={0}
                    step={0.1}
                  /> */}


                  {/* <Field
                    id="callDataInput"
                    component="textarea"
                    placeholder="The encoded function call data of the contract function call"
                    name="callData"
                    className={touched.callData && errors.callData ? css.error : null}
                  /> */}

                </div>

                {/* <div>
                  <label htmlFor="value">
                    <div className={css.requiredMarker}>*</div>
                    {baseTokenName()} Value
                    <ErrorMessage name="value">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    id="valueInput"
                    placeholder={`How much ${baseTokenName()} to transfer with the call`}
                    name="value"
                    type="number"
                    className={touched.value && errors.value ? css.error : null}
                    min={0}
                    step={0.1}
                  />
                </div> */}
              </div>

              <div className={css.createProposalActions}>
                <TrainingTooltip overlay="Export proposal" placement="top">
                  <button id="export-proposal" className={css.exportProposal} type="button" onClick={() => this.exportFormValues(values)}>
                    <img src="/assets/images/Icon/share-blue.svg" />
                  </button>
                </TrainingTooltip>
                <button className={css.exitProposalCreation} type="button" onClick={handleClose}>
                {t("schema.submitProposal")}
                </button>
                <TrainingTooltip overlay={t('tooltips.onceTheProposalSubmitted')} placement="top">
                  <button className={css.submitProposal} type="submit" disabled={isSubmitting}>
                  {t("daojoin.cancel")}
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
//@ts-ignore
export default connect(null, mapDispatchToProps)(withTranslation()(CreateGenericScheme));
