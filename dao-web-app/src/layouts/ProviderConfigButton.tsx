import * as React from "react";
import * as css from "./ProviderConfigButton.scss";
import Tooltip from "rc-tooltip";
import { withTranslation } from 'react-i18next';


interface IExternalProps {
  providerName: string;
  provider: any; 
}

class ProviderConfigButton extends React.Component<IExternalProps, null> {

  private handleClick = () => {
    const provider = this.props.provider;

    if (provider.isTorus) {
      provider.torus.showWallet();
    }
  }

  public render(): RenderOutput {
  //@ts-ignore
  const { t } = this.props
  return <Tooltip placement="bottom" trigger={["hover"]} overlay={t("provider.open", { providerName: this.props.providerName })}> 
      <button className={css.button} onClick={this.handleClick}>
        <img src="/assets/images/gear.svg"/>
      </button>
    </Tooltip>;
  }
}

//@ts-ignore
export default withTranslation()(ProviderConfigButton)