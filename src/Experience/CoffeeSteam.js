import * as THREE from 'three'

import Experience from './Experience.js'
import vertexShader from './shaders/coffeeSteam/vertex.glsl'
import fragmentShader from './shaders/coffeeSteam/fragment.glsl'

export default class CoffeeSteam
{
    constructor()
    {
        this.experience = new Experience()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.time = this.experience.time

        // Debug
        if(this.debug)
        {
            this.debugFolder = this.debug.addFolder({
                title: '咖啡蒸汽',
                expanded: false
            })
        }

        this.setModel()
    }

    setModel()
    {
        this.model = {}
        
        this.model.color = '#d2958a'

        // Material
        this.model.material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            vertexShader,
            fragmentShader,
            uniforms:
            {
                uTime: { value: 0 },
                uTimeFrequency: { value: 0.0004 },
                uUvFrequency: { value: new THREE.Vector2(4, 5) },
                uColor: { value: new THREE.Color(this.model.color) }
            }
        })

        // Mesh
        this.model.mesh = this.resources.items.coffeeSteamModel.scene.children[0]
        this.model.mesh.material = this.model.material
        this.scene.add(this.model.mesh)

        if(this.debug)
        {
            this.debugParams = {
                color: this.model.color,
                timeFrequency: this.model.material.uniforms.uTimeFrequency.value,
                uvX: this.model.material.uniforms.uUvFrequency.value.x,
                uvY: this.model.material.uniforms.uUvFrequency.value.y
            }

            this.debugFolder.addInput(
                this.debugParams,
                'color',
                {
                    view: 'color', label: '蒸汽颜色'
                }
            )
            .on('change', () =>
            {
                this.model.material.uniforms.uColor.value.set(this.debugParams.color)
            })
            
            
            this.debugFolder.addInput(
                this.debugParams,
                'timeFrequency',
                {
                    label: '时间频率', min: 0.0001, max: 0.001, step: 0.0001
                }
            )
            .on('change', () => {
                this.model.material.uniforms.uTimeFrequency.value = this.debugParams.timeFrequency
            })
            
            this.debugFolder.addInput(
                this.debugParams,
                'uvX',
                {
                    label: 'UV 频率 X', min: 0.001, max: 20, step: 0.001
                }
            )
            .on('change', () => {
                this.model.material.uniforms.uUvFrequency.value.x = this.debugParams.uvX
            })
            
            this.debugFolder.addInput(
                this.debugParams,
                'uvY',
                {
                    label: 'UV 频率 Y', min: 0.001, max: 20, step: 0.001
                }
            )
            .on('change', () => {
                this.model.material.uniforms.uUvFrequency.value.y = this.debugParams.uvY
            })
        }
    }

    update()
    {
        this.model.material.uniforms.uTime.value = this.time.elapsed
    }
}