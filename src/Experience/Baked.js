import * as THREE from 'three'

import Experience from './Experience.js'
import vertexShader from './shaders/baked/vertex.glsl'
import fragmentShader from './shaders/baked/fragment.glsl'

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
                title: '烘焙场景',
                expanded: true
            })
        }

        this.setModel()
    }

    setModel()
    {
        this.model = {}
        
        this.model.mesh = this.resources.items.roomModel.scene.children[0]

        this.model.bakedDayTexture = this.resources.items.bakedDayTexture
        this.model.bakedDayTexture.encoding = THREE.sRGBEncoding
        this.model.bakedDayTexture.flipY = false

        this.model.bakedNightTexture = this.resources.items.bakedNightTexture
        this.model.bakedNightTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNightTexture.flipY = false

        this.model.bakedNeutralTexture = this.resources.items.bakedNeutralTexture
        this.model.bakedNeutralTexture.encoding = THREE.sRGBEncoding
        this.model.bakedNeutralTexture.flipY = false

        this.model.lightMapTexture = this.resources.items.lightMapTexture
        this.model.lightMapTexture.flipY = false

        this.colors = {}
        this.colors.tv = '#ff115e'
        this.colors.desk = '#ff6700'
        this.colors.pc = '#0082ff'

        this.model.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uBakedDayTexture: { value: this.model.bakedDayTexture },
                uBakedNightTexture: { value: this.model.bakedNightTexture },
                uBakedNeutralTexture: { value: this.model.bakedNeutralTexture },
                uLightMapTexture: { value: this.model.lightMapTexture },

                uNightMix: { value: 1 },
                uNeutralMix: { value: 0 },

                uLightTvColor: { value: new THREE.Color(this.colors.tv) },
                uLightTvStrength: { value: 1.47 },

                uLightDeskColor: { value: new THREE.Color(this.colors.desk) },
                uLightDeskStrength: { value: 1.9 },

                uLightPcColor: { value: new THREE.Color(this.colors.pc) },
                uLightPcStrength: { value: 1.4 }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.model.mesh.traverse((_child) =>
        {
            if(_child instanceof THREE.Mesh)
            {
                _child.material = this.model.material

                if(_child.position.distanceTo(new THREE.Vector3(4.19, 2.67, 1.82)) < 0.1)
                {
                    this.tvMesh = _child
                }
            }
        })

        this.scene.add(this.model.mesh)
        
        // Debug
        if(this.debug)
        {
            this.debugParams = {
                nightMix: this.model.material.uniforms.uNightMix.value,
                neutralMix: this.model.material.uniforms.uNeutralMix.value,
                tvStrength: this.model.material.uniforms.uLightTvStrength.value,
                deskStrength: this.model.material.uniforms.uLightDeskStrength.value,
                pcStrength: this.model.material.uniforms.uLightPcStrength.value,
            }

            this.debugFolder
                .addInput(
                    this.debugParams,
                    'nightMix',
                    { label: '昼夜混合', min: 0, max: 1 }
                )
                .on('change', () => {
                    this.model.material.uniforms.uNightMix.value = this.debugParams.nightMix
                })

            this.debugFolder
                .addInput(
                    this.debugParams,
                    'neutralMix',
                    { label: '中性混合', min: 0, max: 1 }
                )
                .on('change', () => {
                    this.model.material.uniforms.uNeutralMix.value = this.debugParams.neutralMix
                })

            this.debugFolder
                .addInput(
                    this.colors,
                    'tv',
                    { view: 'color', label: 'tv' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightTvColor.value.set(this.colors.tv)
                })

            this.debugFolder
                .addInput(
                    this.debugParams,
                    'tvStrength',
                    { label: '电视光强度', min: 0, max: 3 }
                )
                .on('change', () => {
                    this.model.material.uniforms.uLightTvStrength.value = this.debugParams.tvStrength
                })

            this.debugFolder
                .addInput(
                    this.colors,
                    'desk',
                    { view: 'color', label: 'desk' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightDeskColor.value.set(this.colors.desk)
                })

            this.debugFolder
                .addInput(
                    this.debugParams,
                    'deskStrength',
                    { label: '桌面光强度', min: 0, max: 3 }
                )
                .on('change', () => {
                    this.model.material.uniforms.uLightDeskStrength.value = this.debugParams.deskStrength
                })

            this.debugFolder
                .addInput(
                    this.colors,
                    'pc',
                    { view: 'color', label: 'pc' }
                )
                .on('change', () =>
                {
                    this.model.material.uniforms.uLightPcColor.value.set(this.colors.pc)
                })

            this.debugFolder
                .addInput(
                    this.debugParams,
                    'pcStrength',
                    { label: '电脑光强度', min: 0, max: 3 }
                )
                .on('change', () => {
                    this.model.material.uniforms.uLightPcStrength.value = this.debugParams.pcStrength
                })
        }
    }
}