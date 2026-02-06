import * as THREE from 'three'
import Experience from './Experience.js'
import normalizeWheel from 'normalize-wheel'

export default class Navigation
{
    constructor()
    {
        this.experience = new Experience()
        this.targetElement = this.experience.targetElement
        this.camera = this.experience.camera
        this.config = this.experience.config
        this.time = this.experience.time

        this.viewState = 'default'
        this.onViewStateChange = null

        this.setPresets()
        this.setView()
    }

    setPresets()
    {
        this.presets = {
            default: {
                spherical: new THREE.Spherical(30, Math.PI * 0.35, -Math.PI * 0.25),
                target: new THREE.Vector3(0, 2, 0),
                limits: {
                    radius: { min: 10, max: 50 },
                    phi: { min: 0.01, max: Math.PI * 0.5 },
                    theta: { min: -Math.PI * 0.5, max: 0 },
                    targetX: { min: -4, max: 4 },
                    targetY: { min: 1, max: 6 },
                    targetZ: { min: -4, max: 4 }
                },
                allowDrag: true,
                allowZoom: true
            },
            pcScreen: {
                spherical: new THREE.Spherical(12, Math.PI * 0.32, -Math.PI * 0.35),
                target: new THREE.Vector3(-1.5, 1.8, 0.5),
                limits: {
                    radius: { min: 10, max: 14 },
                    phi: { min: 0.2, max: 0.45 },
                    theta: { min: -0.5, max: -0.2 },
                    targetX: { min: -2.5, max: -0.5 },
                    targetY: { min: 1.2, max: 2.4 },
                    targetZ: { min: -0.5, max: 1.5 }
                },
                allowDrag: false,
                allowZoom: false
            },
            macScreen: {
                spherical: new THREE.Spherical(14, Math.PI * 0.38, -Math.PI * 0.15),
                target: new THREE.Vector3(1.5, 1.5, 1),
                limits: {
                    radius: { min: 12, max: 16 },
                    phi: { min: 0.25, max: 0.5 },
                    theta: { min: -0.3, max: 0 },
                    targetX: { min: 0.5, max: 2.5 },
                    targetY: { min: 1, max: 2 },
                    targetZ: { min: 0, max: 2 }
                },
                allowDrag: false,
                allowZoom: false
            },
            tv: {
                spherical: new THREE.Spherical(12, Math.PI * 0.35, -Math.PI * 0.25),
                target: new THREE.Vector3(4.2, 2.7, 1.6),
                limits: {
                    radius: { min: 10, max: 14 },
                    phi: { min: 0.25, max: 0.45 },
                    theta: { min: -0.5, max: 0 },
                    targetX: { min: 3, max: 5 },
                    targetY: { min: 2, max: 3.5 },
                    targetZ: { min: 0.5, max: 2.5 }
                },
                allowDrag: false,
                allowZoom: false
            }
        }
    }

    setViewState(state)
    {
        if (this.viewState === state) return
        this.viewState = state
        const preset = this.presets[state]
        if (preset)
        {
            this.view.spherical.value.copy(preset.spherical)
            this.view.target.value.copy(preset.target)
            this.view.spherical.limits.radius = preset.limits.radius
            this.view.spherical.limits.phi = preset.limits.phi
            this.view.spherical.limits.theta = preset.limits.theta
            this.view.target.limits.x = preset.limits.targetX
            this.view.target.limits.y = preset.limits.targetY
            this.view.target.limits.z = preset.limits.targetZ
        }

        // 聚焦屏幕时加大 FOV 以在近距离看全屏幕，返回时恢复
        const cam = this.camera.modes.default.instance
        if (state !== 'default')
        {
            cam.fov = 45
        }
        else
        {
            cam.fov = 20
        }
        cam.updateProjectionMatrix()

        // 聚焦时椅子淡出半透明，返回时淡入恢复
        const world = this.experience.world
        if (world && world.topChair && world.topChair.fadeTo)
        {
            world.topChair.fadeTo(state === 'default' ? 1.0 : 0.15, 0.6)
        }

        if (this.onViewStateChange) this.onViewStateChange(state)
    }

    goToDefault()
    {
        this.setViewState('default')
    }

    setPresetFromMesh(state, mesh, radius)
    {
        const preset = this.presets[state]
        const defaultPreset = this.presets.default
        if (!preset || !mesh || !defaultPreset) return

        mesh.updateMatrixWorld(true)

        // 1. target = mesh 世界中心
        const target = new THREE.Vector3()
        mesh.getWorldPosition(target)
        preset.target.copy(target)

        // 2. 从第一个三角面的世界坐标算面法线
        const geo = mesh.geometry
        const pos = geo.attributes.position
        const idx = geo.index
        let i0 = 0, i1 = 1, i2 = 2
        if (idx) { i0 = idx.getX(0); i1 = idx.getX(1); i2 = idx.getX(2) }

        const v0 = new THREE.Vector3().fromBufferAttribute(pos, i0).applyMatrix4(mesh.matrixWorld)
        const v1 = new THREE.Vector3().fromBufferAttribute(pos, i1).applyMatrix4(mesh.matrixWorld)
        const v2 = new THREE.Vector3().fromBufferAttribute(pos, i2).applyMatrix4(mesh.matrixWorld)

        const edge1 = new THREE.Vector3().subVectors(v1, v0)
        const edge2 = new THREE.Vector3().subVectors(v2, v0)
        const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()

        // 3. 保证法线指向默认相机那一侧（面向观众）
        const defaultCamPos = new THREE.Vector3().setFromSpherical(defaultPreset.spherical)
        defaultCamPos.add(defaultPreset.target)
        const toCamera = new THREE.Vector3().subVectors(defaultCamPos, target)
        if (normal.dot(toCamera) < 0) normal.negate()

        // 4. 相机偏移 = 法线方向 × radius（正对屏幕）
        const offset = normal.multiplyScalar(radius)
        preset.spherical.setFromVector3(offset)

        // 5. 锁紧 limits
        const r = radius * 0.12
        preset.limits.targetX = { min: target.x - r, max: target.x + r }
        preset.limits.targetY = { min: target.y - r, max: target.y + r }
        preset.limits.targetZ = { min: target.z - r, max: target.z + r }
        preset.limits.radius = { min: radius * 0.92, max: radius * 1.08 }
        const s = preset.spherical
        preset.limits.phi = { min: s.phi - 0.06, max: s.phi + 0.06 }
        preset.limits.theta = { min: s.theta - 0.06, max: s.theta + 0.06 }
    }

    setView()
    {
        this.view = {}

        this.view.spherical = {}
        this.view.spherical.value = new THREE.Spherical(30, Math.PI * 0.35, - Math.PI * 0.25)
        // this.view.spherical.value.radius = 5
        this.view.spherical.smoothed = this.view.spherical.value.clone()
        this.view.spherical.smoothing = 0.005
        this.view.spherical.limits = {}
        this.view.spherical.limits.radius = { min: 10, max: 50 }
        this.view.spherical.limits.phi = { min: 0.01, max: Math.PI * 0.5 }
        this.view.spherical.limits.theta = { min: - Math.PI * 0.5, max: 0 }

        this.view.target = {}
        this.view.target.value = new THREE.Vector3(0, 2, 0)
        // this.view.target.value.set(0, 3, -3)
        this.view.target.smoothed = this.view.target.value.clone()
        this.view.target.smoothing = 0.005
        this.view.target.limits = {}
        this.view.target.limits.x = { min: - 4, max: 4 }
        this.view.target.limits.y = { min: 1, max: 6 }
        this.view.target.limits.z = { min: - 4, max: 4 }

        this.view.drag = {}
        this.view.drag.delta = {}
        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0
        this.view.drag.previous = {}
        this.view.drag.previous.x = 0
        this.view.drag.previous.y = 0
        this.view.drag.sensitivity = 1
        this.view.drag.alternative = false

        this.view.zoom = {}
        this.view.zoom.sensitivity = 0.01
        this.view.zoom.delta = 0

        /**
         * Methods
         */
        this.view.down = (_x, _y) =>
        {
            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.move = (_x, _y) =>
        {
            this.view.drag.delta.x += _x - this.view.drag.previous.x
            this.view.drag.delta.y += _y - this.view.drag.previous.y

            this.view.drag.previous.x = _x
            this.view.drag.previous.y = _y
        }

        this.view.up = () =>
        {

        }

        this.view.zoomIn = (_delta) =>
        {
            this.view.zoom.delta += _delta
        }

        /**
         * Mouse events
         */
        this.view.onMouseDown = (_event) =>
        {
            _event.preventDefault()

            this.view.drag.alternative = _event.button === 2 || _event.button === 1 || _event.ctrlKey || _event.shiftKey

            this.view.down(_event.clientX, _event.clientY)

            window.addEventListener('mouseup', this.view.onMouseUp)
            window.addEventListener('mousemove', this.view.onMouseMove)
        }

        this.view.onMouseMove = (_event) =>
        {
            _event.preventDefault()
            
            this.view.move(_event.clientX, _event.clientY)
        }

        this.view.onMouseUp = (_event) =>
        {
            _event.preventDefault()
            
            this.view.up()

            window.removeEventListener('mouseup', this.view.onMouseUp)
            window.removeEventListener('mousemove', this.view.onMouseMove)
        }

        this.targetElement.addEventListener('mousedown', this.view.onMouseDown)
        
        /**
         * Touch events
         */
        this.view.onTouchStart = (_event) =>
        {
            _event.preventDefault()

            this.view.drag.alternative = _event.touches.length > 1

            this.view.down(_event.touches[0].clientX, _event.touches[0].clientY)

            window.addEventListener('touchend', this.view.onTouchEnd)
            window.addEventListener('touchmove', this.view.onTouchMove)
        }

        this.view.onTouchMove = (_event) =>
        {
            _event.preventDefault()
            
            this.view.move(_event.touches[0].clientX, _event.touches[0].clientY)
        }

        this.view.onTouchEnd = (_event) =>
        {
            _event.preventDefault()
            
            this.view.up()

            window.removeEventListener('touchend', this.view.onTouchEnd)
            window.removeEventListener('touchmove', this.view.onTouchMove)
        }

        window.addEventListener('touchstart', this.view.onTouchStart)

        /**
         * Context menu
         */
        this.view.onContextMenu = (_event) =>
        {
            _event.preventDefault()
        }
        
        window.addEventListener('contextmenu', this.view.onContextMenu)

        /**
         * Wheel
         */
        this.view.onWheel = (_event) =>
        {
            _event.preventDefault()

            const normalized = normalizeWheel(_event)
            this.view.zoomIn(normalized.pixelY)
        }
        
        window.addEventListener('mousewheel', this.view.onWheel, { passive: false })
        window.addEventListener('wheel', this.view.onWheel, { passive: false })
    }

    update()
    {
        const preset = this.presets[this.viewState]
        const allowZoom = preset && preset.allowZoom
        const allowDrag = preset && preset.allowDrag

        /**
         * View
         */
        // Zoom (only when allowed)
        if (allowZoom)
        {
            this.view.spherical.value.radius += this.view.zoom.delta * this.view.zoom.sensitivity
        }

        // Apply limits
        this.view.spherical.value.radius = Math.min(Math.max(this.view.spherical.value.radius, this.view.spherical.limits.radius.min), this.view.spherical.limits.radius.max)

        // Drag (only when allowed)
        if (allowDrag)
        {
            if(this.view.drag.alternative)
            {
                const up = new THREE.Vector3(0, 1, 0)
                const right = new THREE.Vector3(- 1, 0, 0)

                up.applyQuaternion(this.camera.modes.default.instance.quaternion)
                right.applyQuaternion(this.camera.modes.default.instance.quaternion)

                up.multiplyScalar(this.view.drag.delta.y * 0.01)
                right.multiplyScalar(this.view.drag.delta.x * 0.01)

                this.view.target.value.add(up)
                this.view.target.value.add(right)

                // Apply limits
                this.view.target.value.x = Math.min(Math.max(this.view.target.value.x, this.view.target.limits.x.min), this.view.target.limits.x.max)
                this.view.target.value.y = Math.min(Math.max(this.view.target.value.y, this.view.target.limits.y.min), this.view.target.limits.y.max)
                this.view.target.value.z = Math.min(Math.max(this.view.target.value.z, this.view.target.limits.z.min), this.view.target.limits.z.max)
            }
            else
            {
                this.view.spherical.value.theta -= this.view.drag.delta.x * this.view.drag.sensitivity / this.config.smallestSide
                this.view.spherical.value.phi -= this.view.drag.delta.y * this.view.drag.sensitivity / this.config.smallestSide

                // Apply limits
                this.view.spherical.value.theta = Math.min(Math.max(this.view.spherical.value.theta, this.view.spherical.limits.theta.min), this.view.spherical.limits.theta.max)
                this.view.spherical.value.phi = Math.min(Math.max(this.view.spherical.value.phi, this.view.spherical.limits.phi.min), this.view.spherical.limits.phi.max)
            }
        }

        this.view.drag.delta.x = 0
        this.view.drag.delta.y = 0
        this.view.zoom.delta = 0

        // Smoothing
        this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.spherical.smoothing * this.time.delta
        this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * this.time.delta
        this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * this.time.delta

        this.view.target.smoothed.x += (this.view.target.value.x - this.view.target.smoothed.x) * this.view.target.smoothing * this.time.delta
        this.view.target.smoothed.y += (this.view.target.value.y - this.view.target.smoothed.y) * this.view.target.smoothing * this.time.delta
        this.view.target.smoothed.z += (this.view.target.value.z - this.view.target.smoothed.z) * this.view.target.smoothing * this.time.delta

        const viewPosition = new THREE.Vector3()
        viewPosition.setFromSpherical(this.view.spherical.smoothed)
        viewPosition.add(this.view.target.smoothed)

        this.camera.modes.default.instance.position.copy(viewPosition)
        this.camera.modes.default.instance.lookAt(this.view.target.smoothed)
    }
}