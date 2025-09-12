import platform from '../../utils/platform';

let DatePicker;

if (platform.isWeb) {
  DatePicker = require("./DatePicker.web").default;
} else {
  DatePicker = require("./DatePicker.native").default;
}

export default DatePicker;
