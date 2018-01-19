import { APPROVED_NETWORK_ID, NETWORKS } from './constants'

export default {
  address: state => state.web3.address,
  coinbase: state => state.web3.coinbase,
  instance: state => state.web3.instance,
  isInjected: state => state.web3.isInjected,
  networkId: state => state.web3.networkId,
  isLocal: state => state.web3.isLocal,
  balance: state => state.web3.balance,
  isApprovedNetwork: state =>
    state.web3.networkId && state.web3.networkId !== '' && state.web3.networkId === APPROVED_NETWORK_ID,
  networkName: state => state.web3.networkId && NETWORKS[state.web3.networkId],
}
