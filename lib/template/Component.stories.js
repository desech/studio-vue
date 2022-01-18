import CLASSNAME from '../FILEPATH'
import * as css from '../../public/css/compiled/style.css' // eslint-disable-line

export default {
  title: 'Desech/CLASSNAME',
  component: CLASSNAME
}

export const CLASSNAMEStory = (args, { argTypes }) => ({
  components: { CLASSNAME },
  props: Object.keys(argTypes),
  template: '<CLASSNAME v-bind="$props" />'
})
CLASSNAMEStory.storyName = 'CLASSNAME'
