import * as THREE from 'three'
import { gsap } from 'gsap'

import Experience from './Experience.js'

export default class TopChair
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        this.opacity = { value: 1.0 }
        this.setModel()
    }

    setModel()
    {
        this.model = {}

        this.model.group = this.resources.items.topChairModel.scene.children[0]
        this.scene.add(this.model.group)

        // 用简单 MeshBasicMaterial 替代烘焙材质，支持透明度
        this.model.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1.0,
            depthWrite: true
        })

        // 从烘焙贴图取日间纹理作为椅子底色
        const bakedTex = this.resources.items.bakedDayTexture
        if (bakedTex)
        {
            this.model.material.map = bakedTex
        }

        this.model.group.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.model.material
            }
        })
    }

    fadeTo(targetOpacity, duration)
    {
        if (!this.model.material) return
        gsap.to(this.opacity, {
            value: targetOpacity,
            duration: duration || 0.6,
            ease: 'power2.inOut',
            onUpdate: () =>
            {
                this.model.material.opacity = this.opacity.value
                this.model.material.depthWrite = this.opacity.value > 0.9
            }
        })
    }

    update()
    {
        this.model.group.rotation.y = Math.sin(this.time.elapsed * 0.0005) * 0.5
    }
}