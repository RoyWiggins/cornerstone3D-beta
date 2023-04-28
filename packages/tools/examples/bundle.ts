import { api as dwcApi } from 'dicomweb-client';
import dcmjs from 'dcmjs';

import * as cornerstone from '@cornerstonejs/core'
import * as tools from '@cornerstonejs/tools'
import * as helpers from '../../../utils/demo/helpers'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

import "@kitware/vtk.js/index.js";

window.cornerstone = cornerstone
window.cornerstone.tools = tools
window.cornerstone.helpers = helpers
window.cornerstone.cornerstoneWADOImageLoader = cornerstoneWADOImageLoader

window.dicomweb = dwcApi
window.dcmjs = dcmjs

export { cornerstone as Cornerstone, tools as CornerstoneTools, helpers as Helpers }
