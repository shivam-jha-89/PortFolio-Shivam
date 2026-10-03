import normalizeWheel from 'normalize-wheel'
import { Events } from '../Events.js'

export class Wheel
{
    constructor()
    {
        this.events = new Events()

        addEventListener('wheel', (_event) =>
        {
            const normalized = normalizeWheel(_event)

            this.events.trigger('roll', [ _event.shiftKey ? normalized.spinX : normalized.spinY ])
        }, { passive: true })
    }
}