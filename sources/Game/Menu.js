import { Events } from './Events.js'
import { Game } from './Game.js'
import { Inputs } from './Inputs/Inputs.js'
import { Tabs } from './Tabs.js'
import { CircuitArea } from './World/Areas/CircuitArea.js'

export class Menu
{
    static OPEN = 1
    static OPENING = 2
    static CLOSED = 3
    static CLOSING = 4
    
    constructor()
    {
        this.game = Game.getInstance()
        this.state = Menu.CLOSED
        this.element = document.querySelector('.js-menu')
        this.current = null
        // this.pending = null
        this.default = null
        this.events = new Events()

        this.setTrigger()
        this.setClose()
        this.setItems()
        this.setGamepad()
        
        this.element.addEventListener('transitionend', () =>
        {
            this.onTransitionEnded()
        })
    }

    onTransitionEnded()
    {
        if(this.state === Menu.OPENING)
        {
            this.state = Menu.OPEN
            this.events.trigger('opened')
            this.current.events.trigger('opened')
        }
        else if(this.state === Menu.CLOSING)
        {
            this.state = Menu.CLOSED
            this.events.trigger('closed')
            this.current.events.trigger('closed')
            
            this.element.classList.remove('is-displayed')
        }
    }

    setTrigger()
    {
        const element = document.querySelector('.js-menu-trigger')

        element.addEventListener('click', (event) =>
        {
            event.preventDefault()

            if(this.game.world.areas?.circuit?.state === CircuitArea.STATE_RUNNING || this.game.world.areas?.circuit?.state === CircuitArea.STATE_STARTING)
                this.open('circuit')
            else
                this.open()
        })
        element.addEventListener('keydown', (event) =>
        {
            event.preventDefault()
        })
    }

    setClose()
    {
        const closeElements = this.element.querySelectorAll('.js-close')

        for(const element of closeElements)
        {
            element.addEventListener('click', () =>
            {
                this.pending = null
                this.close()
            })
        }

        this.element.addEventListener('click', (event) =>
        {
            if(event.target === this.element)
                this.close()
        })
    }

    setItems()
    {
        const navigationElement = this.element.querySelector('.js-navigation')
        const previewElement = this.element.querySelector('.js-previews')
        const contentElement = this.element.querySelector('.js-contents')
        this.items = new Map()

        const navigationElements = navigationElement.querySelectorAll('.js-navigation-item')
        const previewElements = [...previewElement.querySelectorAll('.js-preview')]
        const contentElements = [...contentElement.querySelectorAll('.js-content')]

        for(const navigationElement of navigationElements)
        {
            const item = {}
            item.navigationElement = navigationElement
            item.name = item.navigationElement.dataset.name
            item.previewElement = previewElements.find(element => element.classList.contains(`${item.name}-preview`))
            item.contentElement = contentElements.find(element => element.classList.contains(`${item.name}-content`))
            item.mainFocus = item.contentElement.querySelector('.js-main-focus')
            item.isOpen = false
            item.events = new Events()

            // Tabs
            const tabsElement = item.contentElement.querySelector('.js-tabs')

            if(tabsElement)
                item.tabs = new Tabs(tabsElement)

            item.navigationElement.addEventListener('click', (event) =>
            {
                event.preventDefault()

                this.open(item.name)
            })

            this.items.set(item.name, item)

            if(this.default === null)
                this.default = item
        }

        const keys = [...this.items.keys()]

        for(let i = 0; i < keys.length; i++)
        {
            const prevName = keys[i - 1 < 0 ? keys.length - 1 : i - 1]
            const nextName = keys[(i + 1) % keys.length]
            const item = this.items.get(keys[i])

            item.prevName = prevName
            item.nextName = nextName
        }
    }

    setGamepad()
    {
        this.game.inputs.addActions([
            { name: 'next', categories: [ 'menu' ], keys: [ 'Gamepad.r1' ] },
            { name: 'prev', categories: [ 'menu' ], keys: [ 'Gamepad.l1' ] }
        ])

        // Respawn
        this.game.inputs.events.on('next', (action) =>
        {
            if(action.active)
            {
                this.open(this.current.nextName)
            }
        })
        this.game.inputs.events.on('prev', (action) =>
        {
            if(action.active)
            {
                this.open(this.current.prevName)
            }
        })

    }

    open(name = null)
    {
        let _name = name

        if(_name === null)
        {
            if(this.current)
                _name = this.current.name
            else
                _name = this.default.name
        }

        const item = this.items.get(_name)

        // Not found
        if(!item)
            return

        // Same
        if(
            (this.state === Menu.OPEN || this.state === Menu.OPENING) &&
            item === this.current
        )
            return
        
        // Sound
        const sound = this.game.audio.groups.get('click')
        if(sound)
            sound.play(true)

        // Leaving item
        if(this.current)
        {
            this.current.navigationElement.classList.remove('is-active')
            this.current.previewElement.classList.remove('is-visible')
            this.current.contentElement.classList.remove('is-visible')
            
            this.current.isOpen = false
        }

        // Entering item
        item.navigationElement.classList.add('is-active')
        item.previewElement.classList.add('is-visible')
        item.contentElement.classList.add('is-visible')
        
        item.isOpen = true
        
        this.current = item
        
        // // Tabs resize
        // if(item.tabs)
        //     item.tabs.resize()

        if(item.mainFocus && this.game.inputs.mode !== Inputs.MODE_TOUCH)
        {
            requestAnimationFrame(() =>
            {
                item.mainFocus.focus()
            })
        }

        // Input filters
        this.game.inputs.filters.clear()
        this.game.inputs.filters.add('menu')

        // Events
        this.events.trigger('open')
        this.current.events.trigger('open')
        
        // Need open
        if(this.state === Menu.CLOSED || this.state === Menu.CLOSING)
        {
            this.state = Menu.OPENING

            this.element.classList.add('is-displayed')
            requestAnimationFrame(() =>
            {
                requestAnimationFrame(() =>
                {
                    this.element.classList.add('is-visible')
                })
            })
        }
    }

    close()
    {
        if(this.state === Menu.CLOSING || this.state === Menu.CLOSED)
            return

        // Sound
        const sound = this.game.audio.groups.get('click')
        if(sound)
            sound.play(false)

        this.element.classList.remove('is-visible')

        this.state = Menu.CLOSING
        this.events.trigger('close')
        this.current.isOpen = false
        this.current.events.trigger('close')
    }

    preopen()
    {
        this.items.forEach((item) => 
        {
            // Is preopened
            if(typeof item.navigationElement.dataset.preopen !== 'undefined')
            {
                this.open(item.name)
            }
        })
    }
}