import state from './initialState'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default (store, moduleName = 'WebThree') => {
  store.registerModule(moduleName, {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
  })
  store.dispatch(`${moduleName}/init`)
}
