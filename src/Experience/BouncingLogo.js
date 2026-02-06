import * as THREE from 'three'

import Experience from './Experience.js'

export default class BouncingLogo
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.scene = this.experience.scene

        this.setModel()
    }

    setModel()
    {
        this.model = {}

        this.model.group = new THREE.Group()
        this.model.group.position.set(4.17, 2.717, 1.64)
        this.scene.add(this.model.group)
        // 电视 logo 固定位置，略前于屏幕平面避免被挡住

        this.model.texture = this.resources.items.threejsJourneyLogoTexture
        this.model.texture.encoding = THREE.sRGBEncoding

        this.model.geometry = new THREE.PlaneGeometry(4, 1, 1, 1)
        this.model.geometry.rotateY(- Math.PI * 0.5)

        this.model.material = new THREE.MeshBasicMaterial({
            transparent: true,
            premultipliedAlpha: true,
            map: this.model.texture,
            depthWrite: false
        })

        this.model.mesh = new THREE.Mesh(this.model.geometry, this.model.material)
        this.model.mesh.scale.y = 0.359
        this.model.mesh.scale.z = 0.424
        this.model.mesh.position.z = 0
        this.model.mesh.position.y = 0
        this.model.mesh.renderOrder = 1
        this.model.group.add(this.model.mesh)
    }

    update()
    {
        // 电视 logo 固定居中，不再弹跳，避免移出屏幕或被挡住
        this.model.mesh.position.z = 0
        this.model.mesh.position.y = 0
    }
}