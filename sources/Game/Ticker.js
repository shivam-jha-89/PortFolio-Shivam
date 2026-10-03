import { uniform } from 'three/tsl'
import { Events } from './Events.js'
import { Game } from './Game.js'
import gsap from 'gsap'

export class Ticker
{
    constructor()
    {
        this.game = Game.getInstance()

        this.elapsed = 0
        this.delta = 1 / 60
        this.maxDelta = 1 / 30
        this.scale = 2
        this.deltaScaled = this.delta * this.scale
        this.elapsedScaled = 0
        this.waits = []
        this.lastDeltas = []

        this.elapsedUniform = uniform(this.elapsed)
        this.deltaUniform = uniform(this.delta)
        this.elapsedScaledUniform = uniform(this.elapsedScaled)
        this.deltaScaledUniform = uniform(this.deltaScaled)

        this.events = new Events()
    }

    update(elapsed)
    {
        const elapsedSeconds = elapsed / 1000
        this.delta = Math.min(elapsedSeconds - this.elapsed, this.maxDelta)
        this.elapsed = elapsedSeconds
        this.deltaScaled = this.delta * this.scale
        this.elapsedScaled += this.deltaScaled

        this.lastDeltas.unshift(this.delta)
        const arrayLength = this.lastDeltas.length
        const count = 30
        if(arrayLength > count)
        {
            this.lastDeltas.splice(count, arrayLength - count)
        }
        this.deltaAverage = this.lastDeltas.reduce((total, value) => total + value) / arrayLength


        this.elapsedUniform.value = this.elapsed
        this.deltaUniform.value = this.delta
        this.elapsedScaledUniform.value = this.elapsedScaled
        this.deltaScaledUniform.value = this.deltaScaled

        for(let i = 0; i < this.waits.length; i++)
        {
            const wait = this.waits[i]
            wait[0]--

            if(wait[0] === 0)
            {
                wait[1]()
                this.waits.splice(i, 1)
                i--
            }
        }
        
        this.events.trigger('tick')
    }

    wait(frames, callback)
    {
        this.waits.push([ frames, callback ])
    }
}