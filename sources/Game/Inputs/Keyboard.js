import { Events } from '../Events.js'

export default class Keyboard
{
    constructor()
    {
        this.events = new Events()

        this.pressed = []

        // Trigger up when tab visibility changes to visible
        window.addEventListener('blur', () =>
        {
            for(const key of this.pressed)
                this.events.trigger('up', [ key ])

            this.pressed = []
        })

        // Key down event
        addEventListener('keydown', (_event) =>
        {
            // On input, but not Escape key
            if(document.activeElement.matches('input, textarea, [contenteditable]') && _event.code !== 'Escape')
                return
                
            this.pressed.push(_event.code, _event.key)
            this.events.trigger('down', [ _event.code, _event.key ])
        })

        // Key up event
        addEventListener('keyup', (_event) =>
        {
            // Code
            const indexCode = this.pressed.indexOf(_event.code)

            if(indexCode !== -1)
                this.pressed.splice(indexCode, 1)

            // Key
            const indexKey = this.pressed.indexOf(_event.key)

            if(indexKey !== -1)
                this.pressed.splice(indexKey, 1)

            this.events.trigger('up', [ _event.code, _event.key ])
        })
    }
}