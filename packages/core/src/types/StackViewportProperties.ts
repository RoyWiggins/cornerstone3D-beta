import InterpolationType from '../enums/InterpolationType';
import { ViewportProperties } from './ViewportProperties';

/**
 * Stack Viewport Properties
 */
type StackViewportProperties = ViewportProperties & {
  /** interpolation type - linear or nearest neighbor */
  interpolationType?: InterpolationType;
  /** image rotation */
  rotation?: number;
  /** suppress events (optional) */
  suppressEvents?: boolean;
  RGBTransferFunction?: any;
  /** Indicates if the voi is a computed VOI (not user set) */
  isComputedVOI?: boolean;
};

export default StackViewportProperties;
