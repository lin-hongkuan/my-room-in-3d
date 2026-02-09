import * as THREE from 'three'
import { gsap } from 'gsap'

import Experience from './Experience.js'

export default class TopChair
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.scene = this.experience.scene
        this.time = this.experience.time

        this.opacity = { value: 1.0 }
        this.fadeTween = null
        this.setModel()
    }

    setModel()
    {
        this.model = {}

        this.model.group = this.resources.items.topChairModel.scene.children[0]
        this.scene.add(this.model.group)

        const bakedTex = this.resources.items.bakedDayTexture

        this.model.materials = []

        this.model.group.traverse((_child) =>
        {
            if (_child instanceof THREE.Mesh)
            {
                const mat = new THREE.MeshBasicMaterial({
                    map: bakedTex || null,
                    transparent: true,
                    opacity: 1.0,
                    depthWrite: false,
                    polygonOffset: true,
                    polygonOffsetFactor: -2,
                    polygonOffsetUnits: -2
                })
                _child.material = mat
                _child.renderOrder = 10
                this.model.materials.push(mat)
            }
        })
    }

    fadeTo(targetOpacity, duration)
    {
        if (!this.model || !this.model.materials.length) return
        if (this.fadeTween) this.fadeTween.kill()

        this.fadeTween = gsap.to(this.opacity, {
            value: targetOpacity,
            duration: duration || 0.6,
            ease: 'power2.inOut',
            onComplete: () => { this.fadeTween = null },
            onKill: () => { this.fadeTween = null }
        })
    }

    update()
    {
        if (this.model && this.model.materials.length)
        {
            for (let i = 0; i < this.model.materials.length; i++)
            {
                this.model.materials[i].opacity = this.opacity.value
            }
        }
        this.model.group.rotation.y = Math.sin(this.time.elapsed * 0.0005) * 0.5
    }
}
