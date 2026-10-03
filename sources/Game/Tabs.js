import { Game } from './Game.js'

export class Tabs
{
    constructor(element)
    {
        this.game = Game.getInstance()
        this.element = element

        this.setItems()
        // this.setResize()
    }

    setItems()
    {
        this.items = {}
        
        this.items.navigationContainer = this.element.querySelector('.js-tabs-navigation')
        this.items.navigationItems = [ ...this.items.navigationContainer.querySelectorAll('.js-tabs-navigation-item') ]
        this.items.contentContainer = this.element.querySelector('.js-tabs-content')
        this.items.contentItems = [ ...this.items.contentContainer.querySelectorAll('.js-tabs-content-item') ]

        this.items.list = new Map()
        this.items.current = null

        let defaultItem = null

        for(const navigationElement of this.items.navigationItems)
        {
            const item = {}
            item.name = navigationElement.dataset.tabsName
            item.navigationElement = navigationElement
            item.contentElement = this.items.contentItems.find(element => element.classList.contains(item.name))
            item.innerElement = item.contentElement.querySelector('.js-tabs-content-inner')

            item.navigationElement.addEventListener('click', () =>
            {
                this.goTo(item.name)
            })

            if(typeof item.contentElement.dataset.tabsDefault !== 'undefined')
                defaultItem = item

            this.items.list.set(
                item.name,
                item
            )
        }

        // Default
        if(defaultItem)
            this.goTo(defaultItem.name)
    }

    // setResize()
    // {
    //     this.game.viewport.events.on('throttleChange', () =>
    //     {
    //         this.resize()
    //     })

    //     this.resize()
    // }

    // resize()
    // {
    //     let height = 0

    //     this.items.list.forEach((item) =>
    //     {
    //         const bounding = item.innerElement.getBoundingClientRect()
            
    //         if(bounding.height > height)
    //             height = bounding.height
    //     })

    //     if(height > 0)
    //     {
    //         this.items.contentContainer.style.height = `${height}px`
    //     }
    // }

    goTo(itemName)
    {
        // Same
        if(itemName === this.items.current?.name)
            return

        // Couldn't find content
        const contentItem = this.items.list.get(itemName)
        if(!contentItem)
            return

        // Old content
        if(this.items.current)
        {
            this.items.current.contentElement.classList.remove('is-active')
            this.items.current.navigationElement.classList.remove('is-active')
        }

        // New content
        this.items.current = contentItem
        this.items.current.contentElement.classList.add('is-active')
        this.items.current.navigationElement.classList.add('is-active')
    }
}