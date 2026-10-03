import { abs, atan, float, Fn, If, max, min, PI, positionGeometry, positionWorld, step, uniform, vec2, vec3, vec4 } from 'three/tsl'
import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { smallestAngle } from '../utilities/maths.js'
import gsap from 'gsap'
import { Events } from '../Events.js'
import { Inputs } from './Inputs.js'

export class Nipple
{
    constructor()
    {
        this.game = Game.getInstance()

        this.events = new Events()
        this.position = new THREE.Vector3()
        this.raycaster = new THREE.Raycaster()

        this.active = false
        this.animated = false
        this.angle = 0
        this.progress = 0
        this.smallestAngle = 0
        this.targetAngle = 0
        this.forward = true
        this.inRadiusLow = false

        this.setMeshes()
    }

    setMeshes()
    {
        this.group = new THREE.Group()
        this.group.visible = false
        this.game.scene.add(this.group)

        this.edgesThickness = 0.1
        this.outlineThickness = 0.2
        this.progressRadiusLow = 2
        this.progressRadiusHigh = 4.5
        this.forwardAmplitude = Math.PI * 1.5

        const geometry = new THREE.RingGeometry(this.progressRadiusLow - this.edgesThickness - this.outlineThickness, this.progressRadiusHigh + this.edgesThickness + this.outlineThickness, 20, 1)
        geometry.rotateX(- Math.PI * 0.5)

        this.uniforms = {}
        this.uniforms.position = uniform(vec3())
        this.uniforms.progress = uniform(1)
        this.uniforms.forward = uniform(1)
        this.uniforms.progressStartAngle = uniform(0)
        this.uniforms.progressEndAngle = uniform(0)
        this.uniforms.colorMultiplier = uniform(1)
        
        const material = new THREE.MeshBasicNodeMaterial({ transparent: true, wireframe: false, depthWrite: false })

        material.outputNode = Fn(() =>
        {
            const radialCoord = vec2(positionGeometry.xz)
            const radialAngle = atan(radialCoord.y, radialCoord.x)

            // Angle
            const directionAngleSDF = abs(radialAngle).sub(this.forwardAmplitude * 0.5).toVar()
            
            If(this.uniforms.forward.lessThan(0.5), () =>
            {
                directionAngleSDF.assign(directionAngleSDF.negate())
            })
            const directionAngle = step(directionAngleSDF, 0)

            // Edges
            const innerEdgeSDF = abs(radialCoord.length().sub(this.progressRadiusLow)).toVar()
            const outerEdgeSDF = abs(radialCoord.length().sub(this.progressRadiusHigh)).toVar()

            const innerEdgeFill = step(innerEdgeSDF, this.edgesThickness / 2).toVar()
            const innerEdgeOutline = step(innerEdgeSDF, this.outlineThickness / 2).toVar()

            const outerEdgeFill = step(outerEdgeSDF, this.edgesThickness / 2).mul(directionAngle).toVar()
            const outerEdgeOutline = step(outerEdgeSDF, this.outlineThickness / 2).toVar()

            const edgesFill = max(innerEdgeFill, outerEdgeFill)
            const edgesOutline = max(innerEdgeOutline, outerEdgeOutline)

            // Progress
            const progressSDF = radialCoord.length().sub(this.progressRadiusLow).sub(this.uniforms.progress.mul(this.progressRadiusHigh - this.progressRadiusLow - this.outlineThickness / 2)).toVar() // Distance between edges minus outlines

            const progressLowSDF = radialCoord.length().sub(this.progressRadiusLow + this.outlineThickness / 2).negate()
            progressSDF.assign(max(progressSDF, progressLowSDF))

            const progressFill = step(progressSDF, 0).toVar()

            const inAngle = float(0).toVar()
            If(radialAngle.greaterThan(this.uniforms.progressStartAngle).and(radialAngle.lessThan(this.uniforms.progressEndAngle)), () =>
            {
                inAngle.assign(1)
            })
            progressFill.assign(progressFill.mul(inAngle))

            const progressOutline = step(progressSDF, this.outlineThickness / 4).mul(directionAngle)

            // Final fill and outline
            const outline = max(edgesOutline, progressOutline)
            const fill = max(edgesFill, progressFill).toVar()

            // Discard
            outline.lessThan(0.00001).discard()

            // Alpha
            const alpha = outline.mul(0.35).add(fill.mul(0.75))

            return vec4(vec3(fill).mul(this.uniforms.colorMultiplier), alpha)
        })()
        
        this.mesh = new THREE.Mesh(geometry, material)

        this.group.add(this.mesh)
    }

    setCoordinates(x, y, z, angle)
    {
        const clampedY = clamp(y - 0.25, 0.1, 0.65)
        this.position.set(x, clampedY, z)
        this.group.position.copy(this.position)
        this.uniforms.position.value.copy(this.position)

        this.angle = angle
        this.mesh.rotation.y = - angle
    }

    updateFromPointer(pointer, action)
    {
        // Start
        if(action.trigger === 'start')
        {
            if(pointer.touches.length == 1)
                this.active = true
        }

        // End
        else if(action.trigger === 'end')
        {
            this.active = false

            if(this.inRadiusLow)
                this.events.trigger('tap')

            this.inRadiusLow = false
        }

        // Change
        if(action.trigger === 'start' || action.trigger === 'change')
        {
            if(this.active)
            {
                // One finger => Handle it
                if(pointer.touches.length == 1)
                {
                    // Intersect
                    const ndcPointer = new THREE.Vector2(
                        (pointer.current.x / this.game.viewport.width) * 2 - 1,
                        - ((pointer.current.y / this.game.viewport.height) * 2 - 1),
                    )
                    this.raycaster.setFromCamera(ndcPointer, this.game.view.defaultCamera)

                    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), - this.position.y)
                    const intersect = new THREE.Vector3()
                    this.raycaster.ray.intersectPlane(plane, intersect)

                    // Distance
                    const distance = this.position.distanceTo(intersect)

                    // Target angle
                    this.targetAngle = Math.atan2(intersect.z - this.position.z, intersect.x - this.position.x)

                    // Progress
                    this.progress = clamp((distance - this.progressRadiusLow) / (this.progressRadiusHigh - this.progressRadiusLow), 0, 1)
                    this.uniforms.progress.value = this.progress

                    // Tap
                    if(action.trigger === 'start')
                    {
                        if(this.progress === 0)
                            this.inRadiusLow = true
                    }
                    else if(action.trigger === 'change')
                    {
                        if(this.progress > 0)
                            this.inRadiusLow = false
                    }
                }
                // More than one finger => End
                else
                {
                    this.active = false
                }
            }
        }
    }

    jump()
    {
        this.animated = true
        
        gsap.to(
            this.mesh.position,
            {
                y: 1,
                duration: 0.1,
                ease: 'power2.out',
                overwrite: true,
                onComplete: () =>
                {
                    gsap.to(
                        this.mesh.position,
                        {
                            y: 0,
                            duration: 0.6,
                            ease: 'power4.inOut',
                            overwrite: true,
                            onComplete: () =>
                            {
                                this.animated = false
                            }
                        }
                    )
                }
            }
        )
    }

    update()
    {
        if(this.active || this.animated)
        {
            // Smallest angle and forward
            this.smallestAngle = smallestAngle(this.angle, this.targetAngle)
            let smallestAngleAbs = Math.abs(this.smallestAngle)

            this.forward = smallestAngleAbs < this.forwardAmplitude / 2
                
            this.uniforms.forward.value = this.forward ? 1 : 0

            // Recalculate, but backward
            if(!this.forward)
                this.smallestAngle = smallestAngle(this.angle + Math.PI, this.targetAngle)

            if(this.forward)
            {
                this.uniforms.progressStartAngle.value = Math.min(0, this.smallestAngle)
                this.uniforms.progressEndAngle.value = Math.max(0, this.smallestAngle)
            }
            else
            {
                if(this.smallestAngle > 0)
                {
                    this.uniforms.progressStartAngle.value = - Math.PI
                    this.uniforms.progressEndAngle.value = - Math.PI + this.smallestAngle
                }
                else
                {
                    this.uniforms.progressStartAngle.value = Math.PI + this.smallestAngle
                    this.uniforms.progressEndAngle.value = Math.PI
                }
            }

            // Color multiplier
            this.uniforms.colorMultiplier.value = this.progress === 1 ? 1.5 : 1

            // Group visiblity
            this.group.visible = true
        }

        else
        {
            // Hide
            this.group.visible = false
        }
    }
}