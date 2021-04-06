import Events from './../enums/events'
import VIEWPORT_TYPE from './../constants/viewportType'
import { IViewport, ICamera, ViewportInput } from './../types'
import _cloneDeep from 'lodash.clonedeep'
import renderingEngineCache from './renderingEngineCache'
import RenderingEngine from './RenderingEngine'
import Scene, { VolumeActorEntry } from './Scene'
import triggerEvent from '../utilities/triggerEvent'
import * as vtkMath from 'vtk.js/Sources/Common/Core/Math'
import { vec3 } from 'gl-matrix'
import vtkMatrixBuilder from 'vtk.js/Sources/Common/Core/MatrixBuilder'
import { ViewportInputOptions, Point2, Point3 } from './../types'
import vtkSlabCamera from './vtkClasses/vtkSlabCamera'

/**
 * An object representing a single viewport, which is a camera
 * looking into a scene, and an associated target output `canvas`.
 */
class Viewport implements IViewport {
  readonly uid: string
  readonly sceneUID: string
  readonly renderingEngineUID: string
  readonly type: string
  readonly canvas: HTMLCanvasElement
  sx: number
  sy: number
  sWidth: number
  sHeight: number
  readonly defaultOptions: any
  options: ViewportInputOptions

  constructor(props: ViewportInput) {
    this.uid = props.uid
    this.sceneUID = props.sceneUID
    this.renderingEngineUID = props.renderingEngineUID
    this.type = props.type
    this.canvas = props.canvas
    this.sx = props.sx
    this.sy = props.sy
    this.sWidth = props.sWidth
    this.sHeight = props.sHeight

    // Set data attributes for render events
    this.canvas.setAttribute('data-viewport-uid', this.uid)
    this.canvas.setAttribute('data-scene-uid', this.sceneUID)
    this.canvas.setAttribute(
      'data-rendering-engine-uid',
      this.renderingEngineUID
    )

    const options = _cloneDeep(props.defaultOptions)
    const defaultOptions = _cloneDeep(props.defaultOptions)

    this.defaultOptions = defaultOptions
    this.options = options
  }

  canvasToWorld: (canvasPos: Point2) => Point3
  worldToCanvas: (worldPos: Point3) => Point2

  /**
   * @method getRenderingEngine Returns the rendering engine driving the `Scene`.
   *
   * @returns {RenderingEngine} The RenderingEngine instance.
   */
  public getRenderingEngine(): RenderingEngine {
    return renderingEngineCache.get(this.renderingEngineUID)
  }

  /**
   * @method getRenderer Returns the `vtkRenderer` responsible for rendering the `Viewport`.
   *
   * @returns {object} The `vtkRenderer` for the `Viewport`.
   */
  public getRenderer() {
    const renderingEngine = this.getRenderingEngine()

    return renderingEngine.offscreenMultiRenderWindow.getRenderer(this.uid)
  }

  /**
   * @method render Renders the `Viewport` using the `RenderingEngine`.
   */
  public render() {
    const renderingEngine = this.getRenderingEngine()

    renderingEngine.renderViewport(this.uid)
  }

  /**
   * @method getScene Gets the `Scene` object that the `Viewport` is associated with.
   *
   * @returns {Scene} The `Scene` object.
   */
  public getScene(): Scene {
    const renderingEngine = this.getRenderingEngine()

    return renderingEngine.getScene(this.sceneUID)
  }

  /**
   * @method setOptions Sets new options and (TODO) applies them.
   *
   * @param {ViewportInputOptions} options The viewport options to set.
   * @param {boolean} [immediate=false] If `true`, renders the viewport after the options are set.
   */
  public setOptions(options: ViewportInputOptions, immediate = false) {
    this.options = <ViewportInputOptions>_cloneDeep(options)

    // TODO When this is needed we need to move the camera position.
    // We can steal some logic from the tools we build to do this.

    if (immediate) {
      this.render()
    }
  }

  /**
   * @method reset Resets the options the `Viewport`'s `defaultOptions`.`
   *
   * @param {boolean} [immediate=false] If `true`, renders the viewport after the options are reset.
   */
  public reset(immediate = false) {
    this.options = _cloneDeep(this.defaultOptions)

    // TODO When this is needed we need to move the camera position.
    // We can steal some logic from the tools we build to do this.

    if (immediate) {
      this.render()
    }
  }

  resetCamera = () => {
    const renderer = this.getRenderer()

    const bounds = renderer.computeVisiblePropBounds()
    const focalPoint = [0, 0, 0]

    const activeCamera = this.getVtkActiveCamera()
    const viewPlaneNormal = activeCamera.getViewPlaneNormal()
    const viewUp = activeCamera.getViewUp()

    // Reset the perspective zoom factors, otherwise subsequent zooms will cause
    // the view angle to become very small and cause bad depth sorting.
    activeCamera.setViewAngle(30.0)

    focalPoint[0] = (bounds[0] + bounds[1]) / 2.0
    focalPoint[1] = (bounds[2] + bounds[3]) / 2.0
    focalPoint[2] = (bounds[4] + bounds[5]) / 2.0

    const {
      widthWorld,
      heightWorld,
    } = this._getWorldDistanceViewupAndViewRight(
      bounds,
      viewUp,
      viewPlaneNormal
    )

    const canvasSize = [this.sWidth, this.sHeight]

    const boundsAspectRatio = widthWorld / heightWorld
    const canvasAspectRatio = canvasSize[0] / canvasSize[1]

    let radius

    if (boundsAspectRatio < canvasAspectRatio) {
      // can fit full height, so use it.
      radius = heightWorld / 2
    } else {
      const scaleFactor = boundsAspectRatio / canvasAspectRatio

      radius = (heightWorld * scaleFactor) / 2
    }

    const angle = vtkMath.radiansFromDegrees(activeCamera.getViewAngle())
    const parallelScale = radius

    let distance

    if (activeCamera.getParallelProjection()) {
      // Stick the camera just outside of the bounding sphere of all the volumeData so that MIP behaves correctly.

      let w1 = bounds[1] - bounds[0]
      let w2 = bounds[3] - bounds[2]
      let w3 = bounds[5] - bounds[4]

      w1 *= w1
      w2 *= w2
      w3 *= w3

      distance = w1 + w2 + w3

      // If we have just a single point, pick a radius of 1.0
      distance = distance === 0 ? 1.0 : distance

      // compute the radius of the enclosing sphere
      distance = 1.1 * (Math.sqrt(distance) / 2)
    } else {
      distance = radius / Math.sin(angle * 0.5)
    }

    // check view-up vector against view plane normal

    if (Math.abs(vtkMath.dot(viewUp, viewPlaneNormal)) > 0.999) {
      activeCamera.setViewUp(-viewUp[2], viewUp[0], viewUp[1])
    }

    // update the camera
    activeCamera.setFocalPoint(...focalPoint)
    activeCamera.setPosition(
      focalPoint[0] + distance * viewPlaneNormal[0],
      focalPoint[1] + distance * viewPlaneNormal[1],
      focalPoint[2] + distance * viewPlaneNormal[2]
    )

    renderer.resetCameraClippingRange(bounds)

    // setup default parallel scale
    activeCamera.setParallelScale(parallelScale)

    // update reasonable world to physical values
    activeCamera.setPhysicalScale(radius)
    activeCamera.setPhysicalTranslation(
      -focalPoint[0],
      -focalPoint[1],
      -focalPoint[2]
    )

    const RESET_CAMERA_EVENT = {
      type: 'ResetCameraEvent',
      renderer,
    }

    // Here to let parallel/distributed compositing intercept
    // and do the right thing.
    renderer.invokeEvent(RESET_CAMERA_EVENT)

    return true
  }

  /**
   * @method getCanvas Gets the target ouput canvas for the `Viewport`.
   *
   * @returns {HTMLCanvasElement}
   */
  public getCanvas(): HTMLCanvasElement {
    return <HTMLCanvasElement>this.canvas
  }
  /**
   * @method getActiveCamera Gets the active vtkCamera for the viewport.
   *
   * @returns {object} the vtkCamera.
   */
  public getVtkActiveCamera(): ICamera {
    const renderer = this.getRenderer()

    return renderer.getActiveCamera()
  }

  public getCamera(): ICamera {
    const vtkCamera = this.getVtkActiveCamera()

    // TODO: Make sure these are deep copies.

    return {
      viewUp: vtkCamera.getViewUp(),
      viewPlaneNormal: vtkCamera.getViewPlaneNormal(),
      clippingRange: vtkCamera.getClippingRange(),
      // TODO: I'm really not sure about this, it requires a calculation, and
      // how useful is this without the renderer context?
      // Lets add it back if we find we need it.
      //compositeProjectionMatrix: vtkCamera.getCompositeProjectionMatrix(),
      position: vtkCamera.getPosition(),
      focalPoint: vtkCamera.getFocalPoint(),
      parallelProjection: vtkCamera.getParallelProjection(),
      parallelScale: vtkCamera.getParallelScale(),
      viewAngle: vtkCamera.getViewAngle(),
      slabThickness: vtkCamera.getSlabThickness(),
    }
  }

  public setCamera(cameraInterface: ICamera): void {
    const vtkCamera = this.getVtkActiveCamera()
    const previousCamera = JSON.parse(JSON.stringify(this.getCamera()))
    const updatedCamera = Object.assign({}, previousCamera, cameraInterface)
    const {
      viewUp,
      viewPlaneNormal,
      clippingRange,
      position,
      focalPoint,
      parallelScale,
      viewAngle,
      slabThickness,
    } = cameraInterface

    if (viewUp !== undefined) {
      vtkCamera.setViewUp(viewUp)
    }

    if (viewPlaneNormal !== undefined) {
      vtkCamera.setDirectionOfProjection(
        -viewPlaneNormal[0],
        -viewPlaneNormal[1],
        -viewPlaneNormal[2]
      )
    }

    if (clippingRange !== undefined) {
      vtkCamera.setClippingRange(clippingRange)
    }

    if (position !== undefined) {
      vtkCamera.setPosition(...position)
    }

    if (focalPoint !== undefined) {
      vtkCamera.setFocalPoint(...focalPoint)
    }

    if (parallelScale !== undefined) {
      vtkCamera.setParallelScale(parallelScale)
    }

    if (viewAngle !== undefined) {
      vtkCamera.setViewAngle(viewAngle)
    }

    if (slabThickness !== undefined) {
      vtkCamera.setSlabThickness(slabThickness)
    }

    const eventDetail = {
      previousCamera,
      camera: updatedCamera,
      canvas: this.canvas,
      viewportUID: this.uid,
      sceneUID: this.sceneUID,
      renderingEngineUID: this.renderingEngineUID,
    }

    triggerEvent(this.canvas, Events.CAMERA_MODIFIED, eventDetail)

    if (this.type == VIEWPORT_TYPE.PERSPECTIVE) {
      const renderer = this.getRenderer()

      renderer.resetCameraClippingRange()
    }
  }

  private _getWorldDistanceViewupAndViewRight(bounds, viewUp, viewPlaneNormal) {
    const viewUpCorners = this._getCorners(bounds)
    const viewRightCorners = this._getCorners(bounds)

    let viewRight = vec3.create()

    vec3.cross(viewRight, viewUp, viewPlaneNormal)

    viewRight = [-viewRight[0], -viewRight[1], -viewRight[2]]

    let transform = vtkMatrixBuilder
      .buildFromDegree()
      .identity()
      .rotateFromDirections(viewUp, [1, 0, 0])

    viewUpCorners.forEach((pt) => transform.apply(pt))

    // range is now maximum X distance
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < 8; i++) {
      const y = viewUpCorners[i][0]
      if (y > maxY) {
        maxY = y
      }
      if (y < minY) {
        minY = y
      }
    }

    transform = vtkMatrixBuilder
      .buildFromDegree()
      .identity()
      .rotateFromDirections(viewRight, [1, 0, 0])

    viewRightCorners.forEach((pt) => transform.apply(pt))

    // range is now maximum Y distance
    let minX = Infinity
    let maxX = -Infinity
    for (let i = 0; i < 8; i++) {
      const x = viewRightCorners[i][0]
      if (x > maxX) {
        maxX = x
      }
      if (x < minX) {
        minX = x
      }
    }

    return { widthWorld: maxX - minX, heightWorld: maxY - minY }
  }

  _getCorners(bounds: Array<number>): Array<number>[] {
    return [
      [bounds[0], bounds[2], bounds[4]],
      [bounds[0], bounds[2], bounds[5]],
      [bounds[0], bounds[3], bounds[4]],
      [bounds[0], bounds[3], bounds[5]],
      [bounds[1], bounds[2], bounds[4]],
      [bounds[1], bounds[2], bounds[5]],
      [bounds[1], bounds[3], bounds[4]],
      [bounds[1], bounds[3], bounds[5]],
    ]
  }
}

export default Viewport