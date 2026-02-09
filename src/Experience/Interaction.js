import * as THREE from 'three'
import Experience from './Experience.js'

export default class Interaction
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.navigation = this.experience.navigation
        this.targetElement = this.experience.targetElement
        this.config = this.experience.config

        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
        this.hotspotList = []
        this.hotspotMap = new WeakMap()

        this.hoveredMesh = null
        this.hoverColor = new THREE.Color(1.6, 1.65, 1.85)
        this.normalColor = new THREE.Color(1, 1, 1)

        this.onViewStateChange = null

        this.setListeners()
    }

    setHotspots(hotspots)
    {
        this.hotspotList = []
        this.hotspotMap = new WeakMap()
        if (hotspots)
        {
            if (hotspots.pcScreen)
            {
                this.hotspotList.push(hotspots.pcScreen)
                this.hotspotMap.set(hotspots.pcScreen, 'pcScreen')
            }
            if (hotspots.macScreen)
            {
                this.hotspotList.push(hotspots.macScreen)
                this.hotspotMap.set(hotspots.macScreen, 'macScreen')
            }
if (hotspots.tv)
            {
                this.hotspotList.push(hotspots.tv)
                this.hotspotMap.set(hotspots.tv, 'tv')
            }
            if (hotspots.bookshelf)
            {
                this.hotspotList.push(hotspots.bookshelf)
                this.hotspotMap.set(hotspots.bookshelf, 'bookshelf')
            }
        }
    }

    getPointerNDC(clientX, clientY)
    {
        const rect = this.targetElement.getBoundingClientRect()
        const w = rect.width
        const h = rect.height
        this.pointer.x = ((clientX - rect.left) / w) * 2 - 1
        this.pointer.y = -((clientY - rect.top) / h) * 2 + 1
    }

    getHitState(clientX, clientY)
    {
        const hit = this.getHitMesh(clientX, clientY)
        return hit ? this.hotspotMap.get(hit) : null
    }

    getHitMesh(clientX, clientY)
    {
        if (this.hotspotList.length === 0) return null
        this.getPointerNDC(clientX, clientY)
        this.raycaster.setFromCamera(this.pointer, this.camera.instance)
        const intersects = this.raycaster.intersectObjects(this.hotspotList, true)
        return intersects.length > 0 ? intersects[0].object : null
    }

setMeshHover(mesh, hovered)
    {
        if (!mesh || !mesh.material) return
        
        if (mesh.userData.debugMode) return
        
        if (mesh.userData.isTransparentHotspot)
        {
            mesh.material.opacity = hovered ? 0.2 : 0
            mesh.material.color.setHex(hovered ? 0x88aaff : 0xffffff)
        }
        else
        {
            mesh.material.color.copy(hovered ? this.hoverColor : this.normalColor)
        }
    }

    setListeners()
    {
        this.boundMouseDown = (e) => this.onMouseDown(e)
        this.boundMouseMove = (e) => this.onMouseMove(e)
        this.boundMouseLeave = () => this.onMouseLeave()
        this.boundTouchStart = (e) => this.onTouchStart(e)
        this.boundTouchMove = (e) => this.onTouchMove(e)

        this.targetElement.addEventListener('mousedown', this.boundMouseDown, { capture: true })
        this.targetElement.addEventListener('mousemove', this.boundMouseMove)
        this.targetElement.addEventListener('mouseleave', this.boundMouseLeave)
        this.targetElement.addEventListener('touchstart', this.boundTouchStart, { passive: false, capture: true })
        this.targetElement.addEventListener('touchmove', this.boundTouchMove, { passive: false })
    }

    onMouseDown(event)
    {
        if (this.hotspotList.length === 0) return
        const state = this.getHitState(event.clientX, event.clientY)
        if (state && this.navigation.viewState === 'default')
        {
            event.preventDefault()
            event.stopPropagation()
            this.navigation.setViewState(state)
            if (this.onViewStateChange) this.onViewStateChange(state)
        }
        else if (!state && this.navigation.viewState !== 'default')
        {
            this.navigation.goToDefault()
            if (this.onViewStateChange) this.onViewStateChange('default')
        }
    }

    onMouseMove(event)
    {
        if (this.hotspotList.length === 0)
        {
            document.body.style.cursor = 'auto'
            this.clearHoverHighlight()
            return
        }
        const mesh = this.getHitMesh(event.clientX, event.clientY)
        const state = mesh ? this.hotspotMap.get(mesh) : null
        const showPointer = state && this.navigation.viewState === 'default'
        document.body.style.cursor = showPointer ? 'pointer' : 'auto'

        if (mesh !== this.hoveredMesh)
        {
            if (this.hoveredMesh) this.setMeshHover(this.hoveredMesh, false)
            this.hoveredMesh = mesh
            if (this.hoveredMesh) this.setMeshHover(this.hoveredMesh, true)
        }
    }

    onMouseLeave()
    {
        document.body.style.cursor = 'auto'
        this.clearHoverHighlight()
    }

    clearHoverHighlight()
    {
        if (this.hoveredMesh)
        {
            this.setMeshHover(this.hoveredMesh, false)
            this.hoveredMesh = null
        }
    }

onTouchStart(event)
    {
        if (this.hotspotList.length === 0) return
        if (event.touches.length > 0)
        {
            const touch = event.touches[0]
            const state = this.getHitState(touch.clientX, touch.clientY)
            if (state && this.navigation.viewState === 'default')
            {
                event.preventDefault()
                this.navigation.setViewState(state)
                if (this.onViewStateChange) this.onViewStateChange(state)
            }
            else if (!state && this.navigation.viewState !== 'default')
            {
                this.navigation.goToDefault()
                if (this.onViewStateChange) this.onViewStateChange('default')
            }
        }
    }

    onTouchMove(event)
    {
        if (event.touches.length > 0 && this.hotspotList.length > 0)
        {
            const touch = event.touches[0]
            const state = this.getHitState(touch.clientX, touch.clientY)
            document.body.style.cursor = state && this.navigation.viewState === 'default' ? 'pointer' : 'auto'
        }
    }

    update()
    {
        // Cursor is updated in pointer events; no per-frame work needed
    }

    destroy()
    {
        this.targetElement.removeEventListener('mousedown', this.boundMouseDown, { capture: true })
        this.targetElement.removeEventListener('mousemove', this.boundMouseMove)
        this.targetElement.removeEventListener('mouseleave', this.boundMouseLeave)
        this.targetElement.removeEventListener('touchstart', this.boundTouchStart, { capture: true })
        this.targetElement.removeEventListener('touchmove', this.boundTouchMove)
        this.clearHoverHighlight()
        document.body.style.cursor = 'auto'
    }
}
