import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import { bool, color, float, Fn, If, mix, positionGeometry, texture, uniform, vec2, vec3, vec4, viewportCoordinate, viewportSize, screenUV, min, max, mul } from 'three/tsl'
import gsap from 'gsap'

export class Overlay
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setSounds()

        // Uniforms
        const colorA = uniform(color('#251f2b'))
        const colorB = uniform(color('#1d1721'))
        this.progress = uniform(0)
        this.patternSize = uniform(200 * this.game.viewport.pixelRatio)
        this.strokeSize = uniform(10)
        this.inverted = uniform(0)
        const diagonalAmplitude = 0.5
        const diagonalInvertMultipilier = 1 + diagonalAmplitude * 2

        // Geometry
        const geometry = new THREE.PlaneGeometry(2, 2)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false })
        material.outputNode = Fn(() =>
        {
            // Stroke
            const strokeMask = viewportCoordinate.x.add(viewportCoordinate.y).div(this.strokeSize).mod(1).sub(0.5).mul(2).abs()

            // Pattern
            const patternUv = viewportCoordinate.div(this.patternSize).mod(1)
            const patternMask = texture(this.game.resources.overlayPatternTexture, patternUv).a.remap(0, 0.68, 0, 1).toVar()

            If(this.inverted.greaterThan(0.5), () =>
            {
                patternMask.assign(patternMask.oneMinus())
            })

            // Final
            const mask = patternMask.add(strokeMask.mul(0.2)).mul(1 / (1 + 0.2))

            // Diagonal
            const diagonalRatio = screenUV.length().div(1.414).toVar() // Hypot 1, 1
            If(this.inverted.greaterThan(0.5), () =>
            {
                diagonalRatio.assign(diagonalRatio.oneMinus())
            })
            const diagonalProgress = this.progress.sub(diagonalRatio.mul(diagonalAmplitude)).mul(diagonalInvertMultipilier)

            // Discard
            diagonalProgress.lessThan(mask).discard()

            // Gradient
            const colorHash = texture(this.game.noises.hash, viewportCoordinate.div(this.game.noises.resolution)).r.sub(0.5).mul(0.2)
            const colorMix = screenUV.length().add(colorHash)
            const finalColor = mix(colorA, colorB, colorMix)

            return vec4(finalColor, 1)
        })()
        material.vertexNode = vec4(positionGeometry.x, positionGeometry.y, 0, 1)

        // Mesh
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.frustumCulled = false
        this.mesh.renderOrder = 99
        this.mesh.visible = true
        this.game.scene.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '⬛️ Overlay',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, colorA.value, 'colorA')
            this.game.debug.addThreeColorBinding(debugPanel, colorB.value, 'colorB')
            debugPanel.addBinding(this.progress, 'value', { label: 'progress', min: 0, max: 1, step: 0.001 }).on('change', () => { this.mesh.visible = true })
            debugPanel.addBinding(this.patternSize, 'value', { label: 'patternSize', min: 0, max: 500, step: 1 })
            debugPanel.addBinding(this.strokeSize, 'value', { label: 'strokeSize', min: 0, max: 50, step: 1 })
            debugPanel.addBinding(this.inverted, 'value', { label: 'inverted', min: 0, max: 1, step: 1 })
            debugPanel.addButton({ title: 'show' }).on('click', () => { this.show() })
            debugPanel.addButton({ title: 'hide' }).on('click', () => { this.hide() })
        }
        this.game.viewport.events.on('change', () =>
        {
            this.patternSize.value = 200 * this.game.viewport.pixelRatio
        })
    }

    setSounds()
    {
        this.sounds = {}

        this.sounds.show = this.game.audio.register({
            path: 'sounds/swoosh/Swoosh 02.mp3',
            autoplay: false,
            loop: false,
            volume: 0.25
        })

        this.sounds.hide = this.game.audio.register({
            path: 'sounds/swoosh/Swoosh 05.mp3',
            autoplay: false,
            loop: false,
            volume: 0.25
        })
    }

    show(callback)
    {
        this.inverted.value = 0
        this.mesh.visible = true
        this.sounds.show.play()
        gsap.to(this.progress, { value: 1, ease: 'power1.inOut', overwrite: true, duration: 2, onComplete: () =>
        {
            if(typeof callback === 'function')
                callback()
        } })
    }

    hide(callback)
    {
        this.inverted.value = 1
        this.sounds.hide.play()
        gsap.to(this.progress, { value: 0, ease: 'power1.inOut', overwrite: true, duration: 4, onComplete: () =>
        {
            this.mesh.visible = false

            if(typeof callback === 'function')
                callback()
        } })
    }

    moveOnTop()
    {
        this.game.scene.add(this.mesh)
    }
}