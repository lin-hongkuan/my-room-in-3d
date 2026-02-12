import * as THREE from 'three'
import Experience from './Experience.js'
import Baked from './Baked.js'
import GoogleLeds from './GoogleLeds.js'
import LoupedeckButtons from './LoupedeckButtons.js'
import CoffeeSteam from './CoffeeSteam.js'
import TopChair from './TopChair.js'
import ElgatoLight from './ElgatoLight.js'
import Screen from './Screen.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.init()
            }
        })

        // 预防：如果资源已经加载完了（groupEnd 已经发生过），手动触发初始化
        if(this.resources.groups.base && this.resources.groups.base.loaded)
        {
            this.init()
        }
    }

    init()
    {
        if(this.initiated) return
        this.initiated = true

        this.setBaked()
        this.setGoogleLeds()
        this.setLoupedeckButtons()
        this.setCoffeeSteam()
        this.setTopChair()
        this.setElgatoLight()
        this.setScreens()
        this.setTV()
        this.setBookshelf()
        if (this.experience.interaction)
        {
            this.experience.interaction.setHotspots({
                pcScreen: this.pcScreen.model.mesh,
                macScreen: this.macScreen.model.mesh,
                tv: this.tvMesh,
                bookshelf: this.bookshelfMesh
            })
        }
        const nav = this.experience.navigation
        if (nav && nav.setPresetFromMesh)
        {
            nav.setPresetFromMesh('pcScreen', this.pcScreen.model.mesh, 6)
            nav.setPresetFromMesh('macScreen', this.macScreen.model.mesh, 6)
            nav.setPresetFromMesh('tv', this.tvMesh, 5)
            nav.setPresetFromMesh('bookshelf', this.bookshelfMesh, 5)
        }
    }

    setBaked()
    {
        this.baked = new Baked()
    }

    setGoogleLeds()
    {
        this.googleLeds = new GoogleLeds()
    }

    setLoupedeckButtons()
    {
        this.loupedeckButtons = new LoupedeckButtons()
    }

    setCoffeeSteam()
    {
        this.coffeeSteam = new CoffeeSteam()
    }

    setTopChair()
    {
        this.topChair = new TopChair()
    }

    setElgatoLight()
    {
        this.elgatoLight = new ElgatoLight()
    }

    setScreens()
    {
        // 尝试从 API 配置中获取视频路径，如果没有则使用默认值
        const pcVideo = (this.experience.projectsConfig && this.experience.projectsConfig.pcScreen && this.experience.projectsConfig.pcScreen.video) 
            ? this.experience.projectsConfig.pcScreen.video 
            : '/assets/videoPortfolio.mp4'
            
        const macVideo = (this.experience.projectsConfig && this.experience.projectsConfig.macScreen && this.experience.projectsConfig.macScreen.video)
            ? this.experience.projectsConfig.macScreen.video
            : '/assets/videoStream.mp4'

        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            pcVideo
        )
        this.macScreen = new Screen(
            this.resources.items.macScreenModel.scene.children[0],
            macVideo
        )
    }

    setTV()
    {
        if(this.baked.tvMesh)
        {
            this.tvMesh = this.baked.tvMesh
        }
        else
        {
            const geo = new THREE.PlaneGeometry(4.28, 2.42)
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide
            })
            this.tvMesh = new THREE.Mesh(geo, mat)
            this.tvMesh.position.set(4.19, 2.67, 1.82)
            this.tvMesh.rotation.y = -1.57
        }
        
        const tvVideo = (this.experience.projectsConfig && this.experience.projectsConfig.tv && this.experience.projectsConfig.tv.video)
            ? this.experience.projectsConfig.tv.video
            : '/assets/videoGame.mp4'

        this.tvScreen = new Screen(
            this.tvMesh,
            tvVideo
        )
    }

    setBookshelf()
    {
        const geo = new THREE.PlaneGeometry(2.2, 1.0)
        const mat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        })
        this.bookshelfMesh = new THREE.Mesh(geo, mat)
        this.bookshelfMesh.position.set(-3.7, 4.7, -4.0)
        this.bookshelfMesh.rotation.y = 0
        this.bookshelfMesh.userData.isTransparentHotspot = true
        this.scene.add(this.bookshelfMesh)
    }

    resize()
    {
    }

    update()
    {
        if(this.googleLeds)
            this.googleLeds.update()

        if(this.loupedeckButtons)
            this.loupedeckButtons.update()

        if(this.coffeeSteam)
            this.coffeeSteam.update()

        if(this.topChair)
            this.topChair.update()

    }

    destroy()
    {
    }
}
