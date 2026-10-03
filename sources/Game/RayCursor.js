import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

export class RayCursor
{
    constructor()
    {
        this.game = Game.getInstance()

        this.currentIntersect = null
        this.intersects = []
        this.isAnyIntersecting = false
        this.needsTest = false

        this.raycaster = new THREE.Raycaster()

        this.setPointerTesting()
    }

    addIntersect(description)
    {
        const intersect = { ...description }
        intersect.isIntersecting = false
        intersect.isDown = false

        if(intersect.shape instanceof THREE.Mesh)
        {
            intersect.position = new THREE.Vector3()
            intersect.shape.getWorldPosition(intersect.position)
        }
        else
            intersect.position = intersect.shape.center

        this.intersects.push(intersect)
        this.needsTest = intersect.active

        if(this.needsTest)
        {
            this.game.ticker.wait(1, () =>
            {
                if(this.needsTest)
                {
                    this.testIntersects('change')
                    this.needsTest = false
                }
            })
        }

        return intersect
    }

    removeIntersect(intersect)
    {
        this.intersects = this.intersects.filter(_intersect => _intersect !== intersect)
    }

    testIntersects(actionTrigger)
    {
        // Start
        if(actionTrigger === 'start' || actionTrigger === 'change')
        {
            if(actionTrigger === 'start')
            {
                this.deltaCursor.y = 0
                this.deltaCursor.x = 0
            }
            else if(actionTrigger === 'change')
            {
                this.deltaCursor.x += Math.abs(this.game.inputs.pointer.delta.x)
                this.deltaCursor.y += Math.abs(this.game.inputs.pointer.delta.y)
            }

            const intersects = this.intersects.filter((intersect) =>
            {
                // Test active
                if(!intersect.active)
                    return false

                // Test too far
                const distance = Math.hypot(
                    this.game.view.focusPoint.position.x - intersect.position.x,
                    this.game.view.focusPoint.position.z - intersect.position.z
                )

                if(distance > this.game.view.optimalArea.radius)
                    return false

                return true
            })
            let isAnyIntersecting = false

            if(intersects.length)
            {
                const ndcPointer = new THREE.Vector2(
                    (this.game.inputs.pointer.current.x / this.game.viewport.width) * 2 - 1,
                    - ((this.game.inputs.pointer.current.y / this.game.viewport.height) * 2 - 1),
                )
                this.raycaster.setFromCamera(ndcPointer, this.game.view.camera)

                // Each intersect
                for(const intersect of intersects)
                {
                    let isIntersecting = false

                    if(intersect.shape instanceof THREE.Sphere)
                        isIntersecting = this.raycaster.ray.intersectsSphere(intersect.shape)
                    if(intersect.shape instanceof THREE.Box3)
                        isIntersecting = this.raycaster.ray.intersectsBox(intersect.shape)
                    if(intersect.shape instanceof THREE.Plane)
                        isIntersecting = this.raycaster.ray.intersectsPlane(intersect.shape)
                    if(intersect.shape instanceof THREE.Mesh)
                        isIntersecting = this.raycaster.intersectObject(intersect.shape).length

                    // Intersect status changed
                    if(isIntersecting !== intersect.isIntersecting)
                    {
                        intersect.isIntersecting = isIntersecting

                        if(intersect.isIntersecting)
                        {
                            this.currentIntersect = intersect

                            if(typeof intersect.onEnter === 'function')
                                intersect.onEnter()
                        }

                        else
                        {
                            if(typeof intersect.onLeave === 'function')
                                intersect.onLeave()
                        }
                    }

                    // Save global intersect status
                    if(isIntersecting)
                    {
                        isAnyIntersecting = true
                    }
                }

                // Global intersect status changed
                if(isAnyIntersecting !== this.isAnyIntersecting)
                {
                    this.isAnyIntersecting = isAnyIntersecting
                    
                    if(this.isAnyIntersecting)
                        this.game.canvasElement.style.cursor = 'pointer'
                    else
                        this.game.canvasElement.style.cursor = null
                }

                if(!isAnyIntersecting)
                    this.currentIntersect = null
            }

            if(actionTrigger === 'start')
            {
                if(this.currentIntersect)
                {
                    this.currentIntersect.isDown = true

                    if(typeof this.currentIntersect.onDown === 'function')
                        this.currentIntersect.onDown()
                }
            }
        }

        // End
        else if(actionTrigger === 'end')
        {
            const intersects = this.intersects.filter(intersect => intersect.active)

            const distance = Math.hypot(this.deltaCursor.x, this.deltaCursor.y)
            
            // Each intersect
            for(const intersect of intersects)
            {
                if(intersect.isIntersecting)
                {
                    if(typeof intersect.onUp === 'function')
                    {
                        intersect.onUp()
                    }
                    
                    if(intersect.isDown)
                    {
                        intersect.isDown = false

                        if(typeof intersect.onClick === 'function' && distance < 25)
                            intersect.onClick()
                    }
                }
                else
                {
                    if(intersect.isDown)
                    {
                        intersect.isDown = false

                        if(typeof intersect.onUp === 'function')
                            intersect.onUp()
                    }
                }
            }
        }
    }

    setPointerTesting()
    {
        this.game.inputs.addActions([
            { name: 'rayPointer', categories: [ 'intro', 'wandering', 'racing', 'cinematic' ], keys: [ 'Pointer.any' ] },
        ])

        this.deltaCursor = { x: 0, y: 0 }

        this.game.inputs.events.on('rayPointer', (action) =>
        {
            this.testIntersects(action.trigger)
        })
    }
}