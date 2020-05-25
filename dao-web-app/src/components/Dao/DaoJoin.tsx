import { IDAOState, ISchemeState /*, IProposalCreateOptionsCompetition */ } from "@daostack/client";
import * as arcActions from "../../actions/arcActions";
import { enableWalletProvider, getArc } from "../../arc";
import withSubscription, { ISubscriptionProps } from "../../components/Shared/withSubscription";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { /* baseTokenName, supportedTokens,  toBaseUnit, tokenDetails, */ toWei,  isValidUrl/*, getLocalTimezone */ } from "lib/util";
import * as React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { showNotification } from "../../reducers/notifications";
// import TagsSelector from "../../components/Proposal/Create/SchemeForms/TagsSelector";
import TrainingTooltip from "../../components/Shared/TrainingTooltip";
import * as css from "./DaoJoin.scss";
// import MarkdownField from "../../components/Proposal/Create/SchemeForms/MarkdownField";
// import { checkTotalPercent } from "../../lib/util";
// import * as Datetime from "react-datetime";

// imporsst moment = require("moment");
// import BN = require("bn.js");

interface IExternalProps {
  scheme: ISchemeState;
  daoAvatarAddress: string;
  history: History;

  handleClose: () => any;
}

interface IStateProps {
  tags: Array<string>;
}

interface IDispatchProps {
  createProposal: typeof arcActions.createProposal;
  showNotification: typeof showNotification;
}

// const MAX_NUMBER_OF_WINNERS=100;

const mapDispatchToProps = {
  createProposal: arcActions.createProposal,
  showNotification,
};

type IProps = IExternalProps & IDispatchProps & ISubscriptionProps<IDAOState>;

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

// const CustomDateInput: React.SFC<any> = ({ field, form }) => {
//   const onChange = (date: moment.Moment) => {
//     form.setFieldValue(field.name, date);
//     return true;
//   };

//   return <Datetime
//     value={field.value}
//     onChange={onChange}
//     dateFormat="MMMM D, YYYY"
//     timeFormat="HH:mm"
//     viewDate={moment()}
//     // used by tests
//     inputProps={{ name: field.name }}
//   />;
// };

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

class CreateProposal extends React.Component<IProps, IStateProps> {

  constructor(props: IProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      tags: new Array<string>()
    };
  }

  // public handleClose = (e: any) => {
  //   e.preventDefault();
  //   this.doClose();
  // }

  // public doClose = () => {
  //   const history = this.props;
  //   history.push("/dao/dashboard/");
  // }  

  public handleSubmit = async (values: IFormValues, { _setSubmitting }: any ): Promise<void> => {
    console.log("SUBMIT PROPOSAL ===========================__)_)_)_)_====================")
    if (!await enableWalletProvider({ showNotification: this.props.showNotification })) {
      return;
    }
    console.log("SUBMIT PROPOSAL ===========================__)_)_)_)_====================")
    const arc = getArc();

    const memfeeContract = new arc.web3.eth.Contract(
      [ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "Lock", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_beneficiary", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Release", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lockers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "releaseTime", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minLockingPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "sgtToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalLocked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "contract IERC20", "name": "_sgtToken", "type": "address" }, { "internalType": "uint256", "name": "_minLockingPeriod", "type": "uint256" } ], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ],
    "0x4F999d00b201603FDDB543F26B483ab024DC3aaf"
  );

    console.log(memfeeContract);

    // Get the contract ABI from compiled smart contract json
    const erc20TokenContractAbi = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "cap", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "mint", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    // Create contract object
    const tokenContract = new arc.web3.eth.Contract(erc20TokenContractAbi, '0x591C82da1AedCF0c9Ce29112483D4c4969CFc053');

    // Instantiate contract    
    const toAddress = '0x4F999d00b201603FDDB543F26B483ab024DC3aaf';

    // Calculate contract compatible value for approve with proper decimal points using BigNumber
    const tokenDecimals = arc.web3.utils.toBN(18);
    const tokenAmountToApprove = arc.web3.utils.toBN(1);
    const calculatedApproveValue = arc.web3.utils.toHex(tokenAmountToApprove.mul(arc.web3.utils.toBN(10).pow(tokenDecimals)));

    // Get user account wallet address first
    arc.web3.eth.getAccounts(function(error: any, accounts: any) {
      console.log(error)
      if (error) throw error;
      // Send ERC20 transaction with web3
      tokenContract.methods.approve(toAddress, calculatedApproveValue).send({from: accounts[0]}, function(error: any, txnHash: any) {
        if (error) throw error;
        console.log(txnHash);
        console.log(values.nativeTokenReward, Number(values.nativeTokenReward), toWei(Number(values.nativeTokenReward)))
        memfeeContract.methods.lock(toWei(Number(values.nativeTokenReward)), /* min locking period */ 604800).send({from: accounts[0]}, function(error: any, txnHash: any) {
          if (error) throw error;
          console.log(txnHash);
        });
      });
    });

    // const externalTokenDetails = tokenDetails(values.externalTokenAddress);
    // let externalTokenReward;

    // // If we know the decimals for the token then multiply by that
    // if (externalTokenDetails) {
    //   externalTokenReward = toBaseUnit(values.externalTokenReward.toString(), externalTokenDetails.decimals);
    // // Otherwise just convert to Wei and hope for the best
    // } else {
    //   externalTokenReward = toWei(Number(values.externalTokenReward));
    // }


    // // TODO: reward split should be fixed in client for now split here
    // let rewardSplit = [];
    // if (values.rewardSplit === "") {
    //   const unit = 100.0 / Number(values.numWinners);
    //   rewardSplit = Array(values.numWinners).fill(unit);
    // } else {
    //   rewardSplit = values.rewardSplit.split(",").map((s: string) => Number(s));
    // }
    // let reputationReward = toWei(Number(values.reputationReward));

    // // This is a workaround around https://github.com/daostack/arc/issues/712
    // // which was for contract versions rc.40. It is resolved in rc.41
    // if (reputationReward.isZero()) {
    //   reputationReward = new BN(1);
    // }
    // // Parameters to be passed to client
    // const proposalOptions: IProposalCreateOptionsCompetition  = {
    //   dao: "0x886e0Ec6e601c0013b025e2e6f38C52c79D3a829",
    //   description: values.description,
    //   endTime: values.compEndTimeInput.toDate(),
    //   ethReward: toWei(Number(values.ethReward)),
    //   externalTokenReward,
    //   nativeTokenReward: toWei(Number(values.nativeTokenReward)),
    //   numberOfVotesPerVoter:  Number(values.numberOfVotesPerVoter),
    //   proposalType: "competition", // this makes `createPRoposal` create a competition rather then a 'normal' contributionRewardExt
    //   proposerIsAdmin: values.proposerIsAdmin,
    //   reputationReward,
    //   rewardSplit,
    //   scheme: "0x9998c70f34c7cb64401ed47487703abee1ca2300b009680a6e3b4080d67ab3a9",
    //   startTime: values.compStartTimeInput.toDate(),
    //   suggestionsEndTime: values.suggestionEndTimeInput.toDate(),
    //   tags: this.state.tags,
    //   title: values.title,
    //   votingStartTime: values.votingStartTimeInput.toDate(),
    // };

    // await this.props.createProposal(proposalOptions);
    // this.props.handleClose();
  }

  // private onTagsChange = (tags: string[]): void => {
  //   this.setState({tags});
  // }

  // private fnDescription = (<span>Short description of the proposal.<ul><li>What are you proposing to do?</li><li>Why is it important?</li><li>How much will it cost the DAO?</li><li>When do you plan to deliver the work?</li></ul></span>);

  public render(): RenderOutput {
    const { data, handleClose } = this.props;

    if (!data) {
      return null;
    }
    const dao = data;
    // const arc = getArc();
    // const localTimezone = getLocalTimezone();
    // const now = moment();
    console.log("DAO JOIN RENDER FUNC <<<<<<<<<<<<<<<<<,,")
    return (
      <div className={css.createProposalWrapper}>
      {/* <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/proposals/create`}>Create {schemeTitle} Proposal</BreadcrumbsItem> */}
      <div className={css.header}>
        <h2><span> DAO REPUTATION </span></h2>
        <button className={css.closeButton} aria-label="Close Create Proposal Modal" /* onClick={this.handleClose} */ ><img src="/assets/images/close.svg" alt=""/></button>
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

            // const require = (name: string): void => {
            //   if (!(values as any)[name]) {
            //     errors[name] = "Required";
            //   }
            // };

            const nonNegative = (name: string): void => {
              if ((values as any)[name] < 0) {
                errors[name] = "Please enter a non-negative value";
              }
            };

            // const nonZero = (name: string): void => {
            //   if ((values as any)[name] === 0) {
            //     errors[name] = "Please enter a non-zero value";
            //   }
            // };

            // if (values.title.length > 120) {
            //   errors.title = "Title is too long (max 120 characters)";
            // }

            // Check rewardSplit add upto 100 and number of winners match the winner distribution
            // if (values.rewardSplit !== "") {
            //   const split = values.rewardSplit.split(",");

            //   if (split.length !== values.numWinners) {
            //     errors.numWinners = "Number of winners should match the winner distribution";
            //   }

            //   if (!checkTotalPercent(split))
            //     errors.rewardSplit = "Please provide reward split summing upto 100";
            // } else {
            //   const unit = (100.0 / Number(values.numWinners)).toFixed(4);
            //   if((Number(unit)) * values.numWinners !== 100.0)
            //     errors.rewardSplit = "Please provide reward split summing upto 100 or use num winner that can have equal split";
            // }

            // // Number of winners less than MAX_NUMBER_OF_WINNERS
            // if ( values.numWinners > MAX_NUMBER_OF_WINNERS) {
            //   errors.numWinners = "Number of winners should be max 100";
            // }

            // const now = moment();
            // // Check valid time
            // const compStartTimeInput = values.compStartTimeInput;
            // const compEndTimeInput = values.compEndTimeInput;
            // const votingStartTimeInput = values.votingStartTimeInput;
            // const suggestionEndTimeInput = values.suggestionEndTimeInput;

            // if (!(compStartTimeInput instanceof moment)) {
            //   errors.compStartTimeInput = "Invalid datetime format";
            // } else {
            //   if (compStartTimeInput && compStartTimeInput.isSameOrBefore(now)) {
            //     errors.compStartTimeInput = "Competition must start in the future";
            //   }
            // }

            // if (!(suggestionEndTimeInput instanceof moment)) {
            //   errors.suggestionEndTimeInput = "Invalid datetime format";
            // } else {
            //   if (suggestionEndTimeInput && (suggestionEndTimeInput.isSameOrBefore(compStartTimeInput))) {
            //     errors.suggestionEndTimeInput = "Submission period must end after competition starts";
            //   }
            // }

            // if (!(votingStartTimeInput instanceof moment)) {
            //   errors.votingStartTimeInput = "Invalid datetime format";
            // } else {
            //   if (votingStartTimeInput && suggestionEndTimeInput && (votingStartTimeInput.isBefore(suggestionEndTimeInput))) {
            //     errors.votingStartTimeInput = "Voting must start on or after submission period ends";
            //   }
            // }

            // if (!(compEndTimeInput instanceof moment)) {
            //   errors.compEndTimeInput = "Invalid datetime format";
            // } else {
            //   if (compEndTimeInput && compEndTimeInput.isSameOrBefore(votingStartTimeInput)) {
            //     errors.compEndTimeInput = "Competion must end after voting starts";
            //   }
            // }

            if (!isValidUrl(values.url)) {
              errors.url = "Invalid URL";
            }

            nonNegative("ethReward");
            // nonNegative("externalTokenReward");
            // nonNegative("nativeTokenReward");
            // nonNegative("numWinners");
            // nonNegative("numberOfVotesPerVoter");

            // nonZero("numWinners");
            // nonZero("numberOfVotesPerVoter");

            // require("description");
            // require("title");
            // require("numWinners");
            // require("numberOfVotesPerVoter");
            // require("compStartTimeInput");
            // require("compEndTimeInput");
            // require("votingStartTimeInput");
            // require("suggestionEndTimeInput");

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
              <label className={css.description}>What to Expect</label>
              <div className={css.description}>This competition proposal can distribute funds, mint new DAO tokens, or assign Reputation. Additionally, you may determine how many winners are rewarded, as well as their proportional distribution.
                  Each proposal may specify one of each action, e.g. &quot;3 ETH and 100 Reputation in total rewards, 3 total winners, 50/25/25% reward distribution&quot;.</div>
              </div>

              <div className={css.content}>


              {/* <TrainingTooltip overlay="The title is the header of the proposal card and will be the first visible information about your proposal" placement="right">
                <label htmlFor="titleInput">
                  <div className={css.requiredMarker}>*</div>
                  Title
                  <ErrorMessage name="title">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                </label>
              </TrainingTooltip>
              <Field
                autoFocus
                id="titleInput"
                maxLength={120}
                placeholder="Summarize your proposal"
                name="title"
                type="text"
                className={touched.title && errors.title ? css.error : null}
              /> */}

              {/* <TrainingTooltip overlay={this.fnDescription} placement="right">
                <label htmlFor="descriptionInput">
                  <div className={css.requiredMarker}>*</div>
                  Description
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
              /> */}

              {/* <TrainingTooltip overlay="Add some tags to give context about your proposal e.g. idea, signal, bounty, research, etc" placement="right">
                <label className={css.tagSelectorLabel}>
                Tags
                </label>
              </TrainingTooltip>

              <div className={css.tagSelectorContainer}>
                <TagsSelector onChange={this.onTagsChange}></TagsSelector>
              </div> */}

              {/* <TrainingTooltip overlay="Link to the fully detailed description of your proposal" placement="right">
                <label htmlFor="urlInput">
                URL
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
              /> */}

              {/* <div>
                <TrainingTooltip overlay="The anticipated number of winning Submissions for this competition" placement="right">
                  <label htmlFor="numWinnersInput">
                    <div className={css.requiredMarker}>*</div>
                    Number of winners
                    <ErrorMessage name="numWinners">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                </TrainingTooltip>

                <Field
                  id="numWinnersInput"
                  maxLength={120}
                  placeholder={"The anticipated number of winning Submissions for this competition"}
                  name="numWinners"
                  type="number"
                  className={touched.numWinners && errors.numWinners ? css.error : null}
                />
              </div> */}

              {/* <div>
                <TrainingTooltip overlay="Percentage distribution of rewards to beneficiaries" placement="right">
                  <label htmlFor="rewardSplitInput">
                  Winner reward distribution (%)
                    <ErrorMessage name="rewardSplit">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                </TrainingTooltip>

                <Field
                  id="rewardSplitInput"
                  maxLength={120}
                  placeholder={"Reward split (like: \"30,10,60\", summing to 100)"}
                  name="rewardSplit"
                  type="number[]"
                  className={touched.rewardSplit && errors.rewardSplit ? css.error : null}
                />
              </div> */}

              {/* <div>
                <TrainingTooltip overlay="Number of Submissions for which each member can vote" placement="right">
                  <label htmlFor="numVotesInput">
                    <div className={css.requiredMarker}>*</div>
                    Number of votes per reputation holder
                    <ErrorMessage name="numberOfVotesPerVoter">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                </TrainingTooltip>

                <Field
                  id="numVotesInput"
                  maxLength={120}
                  placeholder={"Number of Submissions for which each member can vote"}
                  name="numberOfVotesPerVoter"
                  type="number"
                  className={touched.numberOfVotesPerVoter && errors.numberOfVotesPerVoter ? css.error : null}
                />
              </div> */}

              {/* <div className={css.proposerIsAdminCheckbox}>
                <TrainingTooltip overlay="You are the only account that will be able to create submissions" placement="right">
                  <label htmlFor="proposerIsAdmin">
                    <div className={css.requiredMarker}>*</div>
                    Submissions can only be created by you
                    <ErrorMessage name="proposerIsAdmin">{(msg: string) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                </TrainingTooltip>
                <Field
                  id="proposerIsAdmin"
                  name="proposerIsAdmin"
                  type="checkbox"
                  className={touched.proposerIsAdmin && errors.proposerIsAdmin ? css.error : null}
                />
              </div> */}

              <div className={css.rewards}>
                {/* <div className={css.reward}>
                  <label htmlFor="ethRewardInput">
                    {baseTokenName()} Reward to split
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
                  <label htmlFor="reputationRewardInput">
                    Reputation Reward to split
                    <ErrorMessage name="reputationReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    id="reputationRewardInput"
                    placeholder="How much reputation to reward"
                    name="reputationReward"
                    type="number"
                    className={touched.reputationReward && errors.reputationReward ? css.error : null}
                    step={0.1}
                  />
                </div>

                <div className={css.reward}>
                  <label htmlFor="externalRewardInput">
                        External Token Reward to split
                    <ErrorMessage name="externalTokenReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <div className={css.externalTokenInput}>
                    <div className={css.amount}>
                      <Field
                        id="externalRewardInput"
                        placeholder={"How many tokens to reward"}
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
                </div> */}



                <div className={css.reward}>
                  <div className={css.newInput}>
                    <label htmlFor="nativeTokenRewardInput">
                      DAO token ({dao.tokenSymbol})
                      <ErrorMessage name="nativeTokenReward">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                    </label>
                    <Field
                      id="nativeTokenRewardInput"
                      maxLength={10}
                      placeholder="How many tokens to reward"
                      name="nativeTokenReward"
                      type="number"
                      className={touched.nativeTokenReward && errors.nativeTokenReward ? css.error : null}
                    />
                  </div>
                </div>
              </div>

              {/* <div className={css.dates}>
                <div className={css.date}>
                  <label htmlFor="compStartTimeInput">
                    <div className={css.requiredMarker}>*</div>
                    Competition start time {localTimezone}
                    <ErrorMessage name="compStartTimeInput">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    name="compStartTimeInput"
                    component={CustomDateInput}
                    className={touched.compStartTimeInput && errors.compStartTimeInput ? css.error : null}
                  />
                </div>

                <div className={css.date}>
                  <label htmlFor="suggestionEndTimeInput">
                    <div className={css.requiredMarker}>*</div>
                    Submission end time {localTimezone}
                    <ErrorMessage name="suggestionEndTimeInput">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    name="suggestionEndTimeInput"
                    component={CustomDateInput}
                    className={touched.suggestionEndTimeInput && errors.suggestionEndTimeInput ? css.error : null}
                  />
                </div>

                <div className={css.date}>
                  <label htmlFor="votingStartTimeInput">
                    <div className={css.requiredMarker}>*</div>
                    Voting start time {localTimezone}
                    <ErrorMessage name="votingStartTimeInput">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    name="votingStartTimeInput"
                    component={CustomDateInput}
                    className={touched.votingStartTimeInput && errors.votingStartTimeInput ? css.error : null}
                  />
                </div>

                <div className={css.date}>
                  <label htmlFor="compEndTimeInput">
                    <div className={css.requiredMarker}>*</div>
                    Competition end time {localTimezone}
                    <ErrorMessage name="compEndTimeInput">{(msg) => <span className={css.errorMessage}>{msg}</span>}</ErrorMessage>
                  </label>
                  <Field
                    name="compEndTimeInput"
                    component={CustomDateInput}
                    className={touched.compEndTimeInput && errors.compEndTimeInput ? css.error : null}
              />
                </div> 
              </div> */}

              {(touched.ethReward || touched.externalTokenReward || touched.reputationReward || touched.nativeTokenReward)
                    && touched.reputationReward && errors.rewards &&
                <span className={css.errorMessage + " " + css.someReward}><br/> {errors.rewards}</span>
              }
              <div className={css.createProposalActions}>
                <div>
                <TrainingTooltip overlay="Once the proposal is submitted it cannot be edited or deleted" placement="top">
                  <button className={css.submitProposal} type="submit" disabled={isSubmitting} onClick={handleClose}>
                  GET REPUTATION
                  </button>
                </TrainingTooltip>
                </div>
                <div>
                  <button className={css.exitProposalCreation} type="button" onClick={handleClose}>
                    Cancel
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

const SubscribedCreateContributionRewardExProposal = withSubscription({
  wrappedComponent: CreateProposal,
  checkForUpdate: ["daoAvatarAddress"],
  createObservable: (props: IExternalProps) => {
    const arc = getArc();
    return arc.dao("0x886e0Ec6e601c0013b025e2e6f38C52c79D3a829").state();
  },
});

export default connect(null, mapDispatchToProps)(SubscribedCreateContributionRewardExProposal);
