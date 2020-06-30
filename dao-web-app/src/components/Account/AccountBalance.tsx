import BN = require("bn.js");
import { formatTokens } from "lib/util";
import * as React from "react";
import * as css from "./Account.scss";
import { withTranslation } from 'react-i18next';


interface IProps {
  accountAddress: string;
  balance: BN;
  tokenSymbol: string;
}

class Balance extends React.Component<IProps, null>  {

  constructor(props: IProps) {
    super(props);
  }

  public render(): RenderOutput {
    const { balance, tokenSymbol } = this.props;

    return (
      <span className={css.accountBalance}>
        {formatTokens(balance, tokenSymbol)}
      </span>
    );
  }
}
//@ts-ignore
export default withTranslation()(Balance)
