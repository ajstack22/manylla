import { Platform } from "react-native";

let DatePicker;

if (Platform.OS === "web") {
  DatePicker = require("./DatePicker.web").default;
} else {
  DatePicker = require("./DatePicker.native").default;
}

export default DatePicker;
