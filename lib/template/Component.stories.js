import CLASSNAME from '../FILEPATH'
import * as css from '../../public/css/compiled/style.css' // eslint-disable-line

export default {
  title: 'Desech/CLASSNAME',
  component: CLASSNAME
}

export const CLASSNAMEStory = (args) => ({
  components: { CLASSNAME },
  setup () {
    return { args }
  },
  template: '<CLASSNAME v-bind="args" />'
})
CLASSNAMEStory.storyName = 'CLASSNAME'
