import * as THREE from 'three/webgpu'
import { Events } from '../Events.js'

export class Pointer
{
    static MODE_MOUSE = 1
    static MODE_TOUCH = 2

    constructor(element)
    {
        this.element = element

        this.events = new Events()
        this.current = { x: 0, y: 0 }
        this.delta = { x: 0, y: 0 }
        this.upcoming = { x: 0, y: 0 }
        this.isDown = false
        this.mode = Pointer.MODE_MOUSE
        this.upcomingDown = false
        this.hasMoved = false
        this.upcomingTouches = []
        this.touches = []
        this.pinch = {
            ratio: 1,
            ratioDelta: 0,
            baseDistance: 0,
            distance: 0,
            distanceDelta: 0
        }

        this.element.addEventListener('mousemove', (_event) =>
        {
            _event.preventDefault()

            this.mode = Pointer.MODE_MOUSE
            
            this.upcoming.x = _event.clientX
            this.upcoming.y = _event.clientY
        })

        this.element.addEventListener('mousedown', (_event) =>
        {
            _event.preventDefault()

            this.mode = Pointer.MODE_MOUSE

            this.upcomingDown = true

            this.current.x = _event.clientX
            this.current.y = _event.clientY
            this.upcoming.x = _event.clientX
            this.upcoming.y = _event.clientY
        })

        addEventListener('mouseup', (_event) =>
        {
            _event.preventDefault()

            this.upcomingDown = false
        })

        this.element.addEventListener('touchmove', (_event) =>
        {
            // _event.preventDefault()

            this.mode = Pointer.MODE_TOUCH
            this.upcomingTouches = [ ..._event.touches ]
            
            // Calculate average
            let x = 0
            let y = 0

            for(const touch of this.upcomingTouches)
            {
                x += touch.clientX
                y += touch.clientY
            }
            x /= this.upcomingTouches.length
            y /= this.upcomingTouches.length

            this.upcoming.x = x
            this.upcoming.y = y
        }, { passive: true })

        this.element.addEventListener('touchstart', (_event) =>
        {
            // _event.preventDefault()

            this.mode = Pointer.MODE_TOUCH
            this.upcomingDown = true
            this.upcomingTouches = [ ..._event.touches ]

            // Calculate average
            let x = 0
            let y = 0

            for(const touch of this.upcomingTouches)
            {
                x += touch.clientX
                y += touch.clientY
            }
            x /= this.upcomingTouches.length
            y /= this.upcomingTouches.length

            this.current.x = x
            this.current.y = y
            this.upcoming.x = x
            this.upcoming.y = y
        }, { passive: true })

        this.element.addEventListener('touchend', (_event) =>
        {
            _event.preventDefault()

            this.upcomingTouches = [ ..._event.touches ]

            if(this.upcomingTouches.length === 0 || this.upcomingTouches.length === 1)
                this.upcomingDown = false
        })

        this.element.addEventListener('contextmenu', (_event) =>
        {
            _event.preventDefault()
        })
    }

    update()
    {
        // Update from upcoming
        this.delta.x = this.upcoming.x - this.current.x
        this.delta.y = this.upcoming.y - this.current.y

        this.current.x = this.upcoming.x
        this.current.y = this.upcoming.y

        // Pinch from upcoming touches
        if(this.upcomingTouches.length >= 2)
        {
            let maxDistance = 0
            for(let i = 0; i < this.upcomingTouches.length; i++)
            {
                for(let j = i + 1; j < this.upcomingTouches.length; j++)
                {
                    const dX = this.upcomingTouches[i].clientX - this.upcomingTouches[j].clientX
                    const dY = this.upcomingTouches[i].clientY - this.upcomingTouches[j].clientY
                    const distance = Math.sqrt(dX * dX, dY * dY)

                    if(distance > maxDistance)
                        maxDistance = distance
                }
            }

            this.pinch.distanceDelta = maxDistance - this.pinch.distance
            this.pinch.distance = maxDistance

            if(this.upcomingTouches.length > this.touches.length)
            {
                this.pinch.distanceDelta = 0
                this.pinch.baseDistance = this.pinch.distance
            }
        
            const pinchRatio = this.pinch.distance / this.pinch.baseDistance

            if(pinchRatio !== this.pinch.ratio)
            {
                this.pinch.ratioDelta = pinchRatio - this.pinch.ratio
                this.pinch.ratio = pinchRatio
                this.events.trigger('pinch')
            }
        }
        else
        {
            this.pinch.baseDistance = 0
            this.pinch.distance = 0
            this.pinch.distanceDelta = 0
        }

        this.touches = [ ...this.upcomingTouches ]

        // Define what has changed and trigger events
        this.hasMoved = this.delta.x !== 0 || this.delta.y !== 0
        
        if(this.upcomingDown !== this.isDown)
        {
            this.isDown = this.upcomingDown

            if(this.isDown)
                this.events.trigger('down')
            else
                this.events.trigger('up')
        }

        if(this.hasMoved)
            this.events.trigger('move')
    }
}