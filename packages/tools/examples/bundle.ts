// import {
//   RenderingEngine,
//   Types,
//   Enums,
//   setVolumesForViewports,
//   volumeLoader,
//   CONSTANTS,
// } from '@cornerstonejs/core';
// import {
//   addTool,
//   BrushTool,
//   SegmentationDisplayTool,
//   BidirectionalTool,
//   ToolGroupManager,
//   WindowLevelTool,
//   ZoomTool,
//   segmentation,
//   Enums as csToolsEnums,
// } from '@cornerstonejs/tools';
// import {
//   initDemo,
//   createImageIdsAndCacheMetaData,
//   setTitleAndDescription,
// } from '../../../utils/demo/helpers';

// This is for debugging purposes
console.warn(
  'Test --------->'
);

// const { ViewportType } = Enums;
// const { ORIENTATION } = CONSTANTS;

import { api as dwcApi } from 'dicomweb-client';
import dcmjs from 'dcmjs';

import * as cornerstone from '@cornerstonejs/core'
import * as tools from '@cornerstonejs/tools'
import * as helpers from '../../../utils/demo/helpers'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as WADORSHeaderProvider from '../../../utils/demo/helpers/WADORSHeaderProvider';

window.cornerstone = cornerstone
window.cornerstone.tools = tools
window.cornerstone.helpers = helpers
window.cornerstone.cornerstoneWADOImageLoader = cornerstoneWADOImageLoader
window.cornerstone.WADORSHeaderProvider = WADORSHeaderProvider

window.dicomweb = dwcApi
window.dcmjs = dcmjs

export { cornerstone as Cornerstone, tools as CornerstoneTools, helpers as Helpers }


// // ============================= //
// // ======== Set up page ======== //
// setTitleAndDescription(
//   'Tutorial Playground',
//   'The playground for you to copy paste the codes in the tutorials and run it'
// );

// /**
//  * Runs the demo
//  */
// async function run() {
//   // Init Cornerstone and related libraries
//   await initDemo();

//   // Get Cornerstone imageIds and fetch metadata into RAM
//   const imageIds = await createImageIdsAndCacheMetaData({
//     StudyInstanceUID:
//       '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
//     SeriesInstanceUID:
//       '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
//     wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
//     type: 'VOLUME',
//   });

//   /**
//    *
//    *
//    *
//    *
//    *
//    *
//    *
//    *
//    * Copy-paste the code from tutorials below to try them locally.
//    * You can run the tutorial after by running `yarn run example tutorial` when
//    * you are at the root of the tools package directory.
//    *
//    *
//    *
//    *
//    *
//    *
//    *
//    */
// }

// run();
