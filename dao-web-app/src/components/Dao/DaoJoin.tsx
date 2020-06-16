import { IDAOState, ISchemeState /*, IProposalCreateOptionsCompetition */ } from "@daostack/client";
import * as arcActions from "../../actions/arcActions";
import { enableWalletProvider, getArc } from "../../arc";
import withSubscription, { ISubscriptionProps } from "../../components/Shared/withSubscription";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import { /* baseTokenName, supportedTokens,  toBaseUnit, tokenDetails,  toWei, */ isValidUrl/*, getLocalTimezone */ } from "lib/util";
import * as React from "react";
import { connect } from "react-redux";
import Select from "react-select";
import { History } from "history";
import { showNotification } from "../../reducers/notifications";
// import TagsSelector from "../../components/Proposal/Create/SchemeForms/TagsSelector";
import TrainingTooltip from "../../components/Shared/TrainingTooltip";
import * as css from "./DaoJoin.scss";

import { IRootState } from "reducers";


// import MarkdownField from "../../components/Proposal/Create/SchemeForms/MarkdownField";
// import { checkTotalPercent } from "../../lib/util";
// import * as Datetime from "react-datetime";

// imporsst moment = require("moment");
// import BN = require("bn.js");

interface IExternalStateProps {
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

class CreateProposal extends React.Component<IProps, IStateProps> {
  

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
    const reputationContractAbi = [ { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "Lock", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_beneficiary", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "Release", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "lockers", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "releaseTime", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minLockingPeriod", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "sgtToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalLocked", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "uint256", "name": "_period", "type": "uint256" } ], "name": "lock", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "contract IERC20", "name": "_sgtToken", "type": "address" }, { "internalType": "uint256", "name": "_minLockingPeriod", "type": "uint256" } ], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    const reputationContract = new arc.web3.eth.Contract(reputationContractAbi, "0x1E44072256F56527F22134604C9c633eC4cEc86B");
    // Get the contract ABI from compiled smart contract json
    const erc20TokenContractAbi = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "uint256", "name": "_cap", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "cap", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "mint", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ];

    // Create contract object
    const tokenContract = new arc.web3.eth.Contract(erc20TokenContractAbi, '0x498EE93981A2453a3F8b8939458977DF86dCce42');

    // Instantiate contract    
    const toAddress = '0x1E44072256F56527F22134604C9c633eC4cEc86B';

    // Calculate contract compatible value for approve with proper decimal points using BigNumber
    const tokenDecimals = arc.web3.utils.toBN(18);
    const tokenAmountToApprove = arc.web3.utils.toBN(values.nativeTokenReward);
    const calculatedApproveValue = arc.web3.utils.toHex(tokenAmountToApprove.mul(arc.web3.utils.toBN(10).pow(tokenDecimals)));

    const currentAccountAddress = this.props.currentAccountAddress;

    // Get user account wallet address first
    tokenContract.methods.approve(toAddress, calculatedApproveValue).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
      if (error) throw error;
    }).then(function () {
      reputationContract.methods.lock(calculatedApproveValue, /* min locking period */ 700000).send({from: currentAccountAddress}, function(error: any, txnHash: any) {
        if (error) throw error;
      });
    });

    this.handleClose({});
  }

  public render(): RenderOutput {
    const { data } = this.props;

    if (!data) {
      return null;
    }
    const dao = data;
    // const arc = getArc();
    // const localTimezone = getLocalTimezone();
    // const now = moment();
    console.log("DAO GET REP LOG", this.props, this.state);
    return (
      <div className={css.createProposalWrapper}>
      {/* <BreadcrumbsItem to={`/dao/scheme/${scheme.id}/proposals/create`}>Create {schemeTitle} Proposal</BreadcrumbsItem> */}
      <div className={css.header}>
        <h2><span> DAO REPUTATION </span></h2>
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
                    <p>You need to stake tokens to become a member of the DAO</p>
                </div>
                  <div>
                  <a href="#" className={css.btn}>LEAVE</a>
                  </div>
              </div>

              <div className={css.content}>
                <p>The amount you have staked will be your reputation in the DAO</p>
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
                  GET REPUTATION
                  </button>
                </TrainingTooltip>
                </div>
                <div>
                  <button className={css.exitProposalCreation} type="button" onClick={this.handleClose}>
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
    return arc.dao("0xBAc15F5E55c0f0eddd2270BbC3c9b977A985797f").state();
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SubscribedCreateContributionRewardExProposal);
