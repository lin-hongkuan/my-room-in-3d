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
        })
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
        this.pcScreen = new Screen(
            this.resources.items.pcScreenModel.scene.children[0],
            '/assets/videoPortfolio.mp4'
        )
        this.macScreen = new Screen(
            this.resources.items.macScreenModel.scene.children[0],
            '/assets/videoStream.mp4'
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
        
        this.tvScreen = new Screen(
            this.tvMesh,
            '/assets/videoGame.mp4'
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
