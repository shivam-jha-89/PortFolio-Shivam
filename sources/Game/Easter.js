import { Game } from './Game.js'

export class Easter
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setMenu()
        this.setData()
    }

    setMenu()
    {
        this.menu = {}
        this.menu.instance = this.game.menu.items.get('easter')
        this.menu.needsUpdate = false
        this.menu.eggsElement = this.menu.instance.contentElement.querySelector('.js-eggs')
        this.menu.eggs = {}

        this.menu.instance.events.on('open', () =>
        {
            if(this.menu.needsUpdate)
                this.menu.updateEggs(this.menu.needsUpdate)
        })

        this.menu.updateEggs = (eggsData = null) =>
        {
            if(!this.menu.instance.isOpen)
            {
                this.menu.needsUpdate = eggsData
            }

            // Menu open => Update content
            else
            {
                for(const eggDataKey in eggsData)
                {
                    const eggData = eggsData[eggDataKey]
                    let egg = this.menu.eggs[eggDataKey]

                    // Create
                    if(typeof egg === 'undefined')
                    {
                        const html = /* html */`
                            <div class="top">
                                <div class="js-discount title discount"></div>
                                <div class="js-description description"></div>
                                <div class="uses">Used <span class="js-uses-current current"></span>/<span class="js-uses-total total"></span></div>
                            </div>
                            <div class="bar">
                                <div class="fill js-bar-fill"></div>
                            </div>
                        `

                        const element = document.createElement('div')
                        element.classList.add('egg')
                        element.innerHTML = html

                        this.menu.eggsElement.append(element)

                        egg = {
                            element: element,
                            discountElement: element.querySelector('.js-discount'),
                            descriptionElement: element.querySelector('.js-description'),
                            usesCurrentElement: element.querySelector('.js-uses-current'),
                            usesTotalElement: element.querySelector('.js-uses-total'),
                            barFillElement: element.querySelector('.js-bar-fill'),
                        }

                        this.menu.eggs[eggDataKey] = egg
                    }

                    // Update
                    egg.discountElement.innerHTML = eggData.discount
                    egg.usesCurrentElement.innerHTML = eggData.uses
                    egg.usesTotalElement.innerHTML = eggData.max_uses

                    if(eggData.uses >= eggData.max_uses)
                    {
                        egg.descriptionElement.innerHTML = eggData.description ? eggData.description : '...'
                        egg.element.classList.add('is-used')
                    }
                    else
                    {
                        egg.descriptionElement.innerHTML = '...'
                        egg.element.classList.remove('is-used')
                    }

                    const scale = eggData.uses / eggData.max_uses
                    egg.barFillElement.style.transform = `scaleX(${scale})`
                }

                // let html = ''
                // let rank = 1
                
                // for(const score of scores)
                // {
                //     let flag = ''
                //     const country = this.menu.inputFlag.countries.get(score[1])

                //     if(country)
                //         flag = /* html */`<img width="27" height="18" src="${country.imageUrl}" loading="lazy">`

                //     html += /* html */`
                //         <tr>
                //             <td>${rank}</td>
                //             <td>${flag}</td>
                //             <td>${score[0]}</td>
                //             <td>${timeToRaceString(score[2] / 1000)}</td>
                //         </tr>
                //     `

                //     rank++
                // }

                // this.menu.leaderboardElement.innerHTML = html


                // <div class="egg is-used">
                //     <div class="top">
                //         <div class="title discount">30%</div>
                //         <div class="description">In the sky</div>
                //         <div class="uses">Used <span class="current">X</span>/<span class="total">X</span></div>
                //     </div>
                //     <div class="bar">
                //         <div class="fill"></div>
                //     </div>
                // </div>

                this.menu.needsUpdate = false
            }
        }
    }

    setData()
    {
        // Server message event
        this.game.server.events.on('message', (data) =>
        {
            // Init and insert
            if(data.type === 'init')
            {
                this.menu.updateEggs(data.easterEggs)
            }
            else if(data.type === 'easterUpdate')
            {
                this.menu.updateEggs(data.easterEggs)
            }
        })

        // // Server disconnected
        // this.game.server.events.on('disconnected', () =>
        // {
        //     this.resetTime.deactivate()
        //     this.leaderboard.update(null)
        //     this.menu.updateLeaderboard(null)
        // })

        // // Message already received
        // if(this.game.server.initData)
        // {
        //     this.resetTime.activate(this.game.server.initData.circuitResetTime)
        //     this.leaderboard.update(this.game.server.initData.circuitLeaderboard)
        //     this.menu.updateLeaderboard(this.game.server.initData.circuitLeaderboard)
        // }
    }
}

