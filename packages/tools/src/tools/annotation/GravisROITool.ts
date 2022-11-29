import { string } from "prop-types";
import EllipticalROITool from "./EllipticalROITool";

class GravisROITool extends EllipticalROITool {
  _getTextLines = (data, targetId: string, isPreScaled: boolean): string[] => {
    return [data.label]
  }
}
GravisROITool.toolName = 'GravisROI';
export default GravisROITool;
