import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { FragmentObject } from './FragmentObject.js'

export class BlackFriday
{
    constructor()
    {
        this.game = Game.getInstance()

        this.element = document.querySelector('.black-friday')

        this.setIntro()
        this.setOutro()
        this.setFragments()
        this.setMobile()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 10)

        this.game.inputs.events.on('close', (action) =>
        {
            if(action.active)
            {
                if(this.outro.visible)
                    this.outro.hide()
                else if(this.intro.visible)
                    this.intro.hide()
                else
                {
                    if(this.fragments.allCaught)
                        this.outro.show()
                    else
                        this.intro.show()
                }
            }
        })

        if(this.game.debug.active)
            this.intro.hide()
    }

    checkMobile()
    {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera)
        return check
    }

    setMobile()
    {
        this.isMobile = this.checkMobile()
        
        if(this.isMobile)
        {
            this.element.querySelector('.no-mobile-container').style.display = 'block'
            this.intro.closeElements[1].style.display = 'none'
        }
    }

    setIntro()
    {
        this.intro = {}
        this.intro.visible = true
        this.intro.element = this.element.querySelector('.intro')
        this.intro.closeElements = this.intro.element.querySelectorAll('.close')

        this.intro.show = () =>
        {
            if(this.intro.visible)
                return

            this.intro.element.classList.add('is-active')
            this.intro.visible = true
        }

        this.intro.hide = () =>
        {
            if(!this.intro.visible)
                return

            this.game.sounds.start()
                
            this.intro.element.classList.remove('is-active')
            this.intro.visible = false
        }

        for(const _closeElement of this.intro.closeElements)
        {
            _closeElement.classList.remove('is-muted')
            _closeElement.innerText = 'Start searching'

            if(!this.isMobile)
                _closeElement.addEventListener('click', (event) =>
                {
                    event.preventDefault()
                    this.intro.hide()
                })
        }
    }

    setOutro()
    {
        this.outro = {}
        this.outro.visible = false
        this.outro.element = this.element.querySelector('.outro')
        this.outro.linkElement = this.outro.element.querySelector('.join')
        this.outro.closeElement = this.outro.element.querySelector('.close')

        this.outro.show = () =>
        {
            if(this.outro.visible)
                return

            this.outro.linkElement.href = this.outro.linkElement.href.replace('XXX', this.fragments.code)
            this.outro.element.classList.add('is-active')
            this.outro.visible = true
        }

        this.outro.hide = () =>
        {
            if(!this.outro.visible)
                return
                
            this.outro.element.classList.remove('is-active')
            this.outro.visible = false
        }

        this.outro.closeElement.addEventListener('click', (event) =>
        {
            event.preventDefault()
            this.outro.hide()
        })
    }

    setFragments()
    {
        this.fragments = {}
        this.fragments.allCaught = false
        this.fragments.catchDistance = 2
        this.fragments.containerElement = this.element.querySelector('.fragments')
        this.fragments.fragmentElements = this.fragments.containerElement.querySelectorAll('.fragment')
        this.fragments.closest = null

        this.fragments.code = 'bf2024'
        this.fragments.list = [
            { position: this.game.resources.fragments.scene.children[0].position, character: this.fragments.code[0] },
            { position: this.game.resources.fragments.scene.children[1].position, character: this.fragments.code[1] },
            { position: this.game.resources.fragments.scene.children[2].position, character: this.fragments.code[2] },
            { position: this.game.resources.fragments.scene.children[3].position, character: this.fragments.code[3] },
            { position: this.game.resources.fragments.scene.children[4].position, character: this.fragments.code[4] },
            { position: this.game.resources.fragments.scene.children[5].position, character: this.fragments.code[5] },
        ]

        let i = 0
        for(const _fragment of this.fragments.list)
        {
            _fragment.distance = Infinity
            _fragment.caught = false
            _fragment.element = this.fragments.fragmentElements[i]

            _fragment.object = new FragmentObject(_fragment.position)

            i++
        }

        this.fragments.getClosest = () =>
        {
            let closest = null
            let minDistance = Infinity
            for(const _fragment of this.fragments.list)
            {
                if(!_fragment.caught)
                {
                    _fragment.distance = _fragment.position.distanceTo(this.game.vehicle.position)

                    if(closest === null || _fragment.distance < minDistance)
                    {
                        closest = _fragment
                        minDistance = _fragment.distance
                    }
                }
            }

            return closest
        }

        this.fragments.tryCatch = (_fragment) =>
        {
            if(_fragment.distance < this.fragments.catchDistance && !_fragment.caught)
                this.fragments.catch(_fragment)
        }

        this.fragments.catch = (_fragment) =>
        {
            this.game.sounds.fragments.catch()
            _fragment.object.catch()
            _fragment.caught = true
            _fragment.element.innerHTML = /* html */`
                <div class="character">${_fragment.character}</div>
                <div class="bottom"></div>
                <div class="stroke"></div>
                <div class="particles">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
            `
            requestAnimationFrame(() =>
            {
                _fragment.element.classList.add('is-caught')
            })
            this.fragments.testOver()
        }

        this.fragments.testOver = () =>
        {
            this.fragments.allCaught = this.fragments.list.reduce((accumulator, fragment) => { return fragment.caught && accumulator }, true)

            if(this.fragments.allCaught)
            {
                setTimeout(this.outro.show, 2500)
            }
        }
    }

    update()
    {
        this.fragments.closest = this.fragments.getClosest()

        if(this.fragments.closest)
        {
            this.game.vehicle.antenna.target.copy(this.fragments.closest.position)
            this.fragments.tryCatch(this.fragments.closest)
        }
        else
        {
            const forwardTarget = this.game.vehicle.position.clone().add(this.game.vehicle.forward.clone().multiplyScalar(35))
            forwardTarget.y += 1
            this.game.vehicle.antenna.target.copy(forwardTarget)
        }
    }
}