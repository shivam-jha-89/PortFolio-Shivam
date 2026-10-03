import { Events } from '../Events.js'
import { remapClamp } from '../utilities/maths.js'

export class Gamepad
{
    constructor()
    {
        this.events = new Events()
        
        this.setMappings()
        this.setType()
        this.setButtons()
        this.setJoysticks()
    }

    /**
     * Actions:
     * - buttonRaw: Take the value directly from the buttons at specified index
     * - axesToCircle: Convert two axes at specified indexes to circle coordinates
     * - axisToArrow: Convert axes at specified index according to specified angles
     * - axisToTrigger: Convert axis at specified index to button with value from 0 to 1
     */
    setMappings()
    {
        this.mappings = {}
        
        this.mappings.list = {}
        this.mappings.list.standard = [
            { name: 'cross',    type: 'button', action: 'buttonRaw', index: 0 },
            { name: 'circle',   type: 'button', action: 'buttonRaw', index: 1 },
            { name: 'square',   type: 'button', action: 'buttonRaw', index: 2 },
            { name: 'triangle', type: 'button', action: 'buttonRaw', index: 3 },
            { name: 'l1',       type: 'button', action: 'buttonRaw', index: 4 },
            { name: 'r1',       type: 'button', action: 'buttonRaw', index: 5 },
            { name: 'l2',       type: 'button', action: 'buttonRaw', index: 6 },
            { name: 'r2',       type: 'button', action: 'buttonRaw', index: 7 },
            { name: 'select',   type: 'button', action: 'buttonRaw', index: 8 },
            { name: 'start',    type: 'button', action: 'buttonRaw', index: 9 },
            { name: 'l3',       type: 'button', action: 'buttonRaw', index: 10 },
            { name: 'r3',       type: 'button', action: 'buttonRaw', index: 11 },
            { name: 'up',       type: 'button', action: 'buttonRaw', index: 12 },
            { name: 'down',     type: 'button', action: 'buttonRaw', index: 13 },
            { name: 'left',     type: 'button', action: 'buttonRaw', index: 14 },
            { name: 'right',    type: 'button', action: 'buttonRaw', index: 15 },

            { name: 'left',  type: 'joystick', action: 'axesToCircle', indexes: [ 0, 1 ] },
            { name: 'right', type: 'joystick', action: 'axesToCircle', indexes: [ 2, 3 ] },
        ]
        this.mappings.list.windowsFirefoxPS5 = [
            { name: 'cross',    type: 'button', action: 'buttonRaw', index: 1 },
            { name: 'circle',   type: 'button', action: 'buttonRaw', index: 2 },
            { name: 'square',   type: 'button', action: 'buttonRaw', index: 0 },
            { name: 'triangle', type: 'button', action: 'buttonRaw', index: 3 },
            { name: 'l1',       type: 'button', action: 'buttonRaw', index: 4 },
            { name: 'r1',       type: 'button', action: 'buttonRaw', index: 5 },
            { name: 'l2',       type: 'button', action: 'axisToTrigger', index: 3 },
            { name: 'r2',       type: 'button', action: 'axisToTrigger', index: 4 },
            { name: 'select',   type: 'button', action: 'buttonRaw', index: 8 },
            { name: 'start',    type: 'button', action: 'buttonRaw', index: 9 },
            { name: 'l3',       type: 'button', action: 'buttonRaw', index: 10 },
            { name: 'r3',       type: 'button', action: 'buttonRaw', index: 11 },
            { name: 'up',       type: 'button', action: 'axisToArrow', index: 9, angles: [ -1, -0.7142857142857143, 1 ] },
            { name: 'down',     type: 'button', action: 'axisToArrow', index: 9, angles: [ -0.1428571428571429, 0.1428571428571428, 0.4285714285714286  ] },
            { name: 'left',     type: 'button', action: 'axisToArrow', index: 9, angles: [ 0.4285714285714286, 0.7142857142857142, 1 ] },
            { name: 'right',    type: 'button', action: 'axisToArrow', index: 9, angles: [ -0.7142857142857143, -0.4285714285714286, -0.1428571428571429 ] },

            { name: 'left',  type: 'joystick', action: 'axesToCircle', indexes: [ 0, 1 ] },
            { name: 'right', type: 'joystick', action: 'axesToCircle', indexes: [ 2, 5 ] },
        ]
        this.mappings.list.macOSFirefoxPS5 = [
            { name: 'cross',    type: 'button', action: 'buttonRaw', index: 1 },
            { name: 'circle',   type: 'button', action: 'buttonRaw', index: 2 },
            { name: 'square',   type: 'button', action: 'buttonRaw', index: 0 },
            { name: 'triangle', type: 'button', action: 'buttonRaw', index: 3 },
            { name: 'l1',       type: 'button', action: 'buttonRaw', index: 4 },
            { name: 'r1',       type: 'button', action: 'buttonRaw', index: 5 },
            { name: 'l2',       type: 'button', action: 'axisToTrigger', index: 4 },
            { name: 'r2',       type: 'button', action: 'axisToTrigger', index: 5 },
            { name: 'select',   type: 'button', action: 'buttonRaw', index: 8 },
            { name: 'start',    type: 'button', action: 'buttonRaw', index: 9 },
            { name: 'l3',       type: 'button', action: 'buttonRaw', index: 10 },
            { name: 'r3',       type: 'button', action: 'buttonRaw', index: 11 },
            { name: 'up',       type: 'button', action: 'axisToArrow', index: 6, angles: [ -1, -0.7142857142857143, 1 ] },
            { name: 'down',     type: 'button', action: 'axisToArrow', index: 6, angles: [ -0.1428571428571429, 0.1428571428571428, 0.4285714285714286  ] },
            { name: 'left',     type: 'button', action: 'axisToArrow', index: 6, angles: [ 0.4285714285714286, 0.7142857142857142, 1 ] },
            { name: 'right',    type: 'button', action: 'axisToArrow', index: 6, angles: [ -0.7142857142857143, -0.4285714285714286, -0.1428571428571429 ] },

            { name: 'left',  type: 'joystick', action: 'axesToCircle', indexes: [ 0, 1 ] },
            { name: 'right', type: 'joystick', action: 'axesToCircle', indexes: [ 2, 3 ] },
        ]

        const joystickDeadZone = 0.2
        const buttonPressedZone = 0.2

        this.mappings.getNameForGamepad = (gamepad) =>
        {
            if(gamepad.mapping === 'standard')
                return 'standard'

            if(gamepad.axes.length === 10)
                return 'windowsFirefoxPS5'
            else if(gamepad.axes.length === 7)
                return 'macOSFirefoxPS5'

            return 'standard'
        }

        this.mappings.parseGamepad = (gamepad) =>
        {
            // Find mapping
            const mappingName = this.mappings.getNameForGamepad(gamepad)
            const mapping = this.mappings.list[mappingName]

            // Data
            const data = {}
            data.buttons = {}
            data.joysticks = {}

            for(const map of mapping)
            {
                // Buttons
                if(map.type === 'button')
                {
                    const button = { name: map.name, value: 0 }
                    data.buttons[map.name] = button

                    if(map.action === 'buttonRaw')
                    {
                        const mapButton = gamepad.buttons[map.index]

                        if(mapButton)
                            button.value = mapButton.value
                    }

                    else if(map.action === 'axisToTrigger')
                    {
                        const mapAxes = gamepad.axes[map.index]

                        if(mapAxes)
                            button.value = mapAxes * 0.5 + 0.5
                    }

                    else if(map.action === 'axisToArrow')
                    {
                        const mapAxes = gamepad.axes[map.index]

                        if(mapAxes)
                        {
                            const arrowAngle = mapAxes
                            let isInAngles = false

                            for(const angle of map.angles)
                            {
                                if(Math.abs(angle - arrowAngle) < 0.1)
                                    isInAngles = true
                            }
                            
                            if(isInAngles)
                                button.value = 1
                        }
                    }

                    button.pressed = button.value > buttonPressedZone
                }

                // Joysticks
                if(map.type === 'joystick')
                {
                    const joystick = {
                        name: map.name,
                        x: 0,
                        y: 0,
                        safeX: 0,
                        safeY: 0,
                        angle: 0,
                        radius: 0,
                        safeRadius: 0,
                        active: false
                    }
                    data.joysticks[map.name] = joystick

                    if(map.action === 'axesToCircle')
                    {
                        joystick.x = gamepad.axes[map.indexes[0]]
                        joystick.safeX = remapClamp(Math.abs(joystick.x), joystickDeadZone, 1, 0, 1) * Math.sign(joystick.x)

                        joystick.y = gamepad.axes[map.indexes[1]]
                        joystick.safeY = remapClamp(Math.abs(joystick.y), joystickDeadZone, 1, 0, 1) * Math.sign(joystick.y)

                        joystick.angle = Math.atan2(joystick.y, joystick.x)
                        joystick.radius = Math.hypot(joystick.y, joystick.x)

                        joystick.safeRadius = remapClamp(joystick.radius, joystickDeadZone, 1, 0, 1)

                        joystick.active = joystick.radius > joystickDeadZone
                    }
                }
            }

            return data
        }
    }

    setType()
    {
        this.type = 'default'
        document.documentElement.classList.add(`is-gamepad-${this.type}`)
    }

    setButtons()
    {
        this.buttons = {}

        for(const map of this.mappings.list.standard)
        {
            if(map.type === 'button')
                this.buttons[ map.name ] = { name: map.name, value: 0, pressed: 0 }
        }
    }

    setJoysticks()
    {
        this.joysticks = {}

        for(const map of this.mappings.list.standard)
        {
            if(map.type === 'joystick')
            {
                this.joysticks[ map.name ] = {
                    name: map.name,
                    x: 0,
                    y: 0,
                    radius: 0,
                    angle: 0,
                    active: false
                }
            }
        }
    }

    update()
    {
        // Get the last non-null gamepad from navigator.getGamepads
        let gamepad = null
        for(const _gamepad of navigator.getGamepads())
        {
            if(_gamepad !== null)
                gamepad = _gamepad
        }

        // Didn't find gamepad
        if(gamepad === null)
            return

        // Parse gamepad data
        const gamepadData = this.mappings.parseGamepad(gamepad)

        /**
         * Buttons
         */
        for(const buttonName in this.buttons)
        {
            const savedButton = this.buttons[ buttonName ]
            const newButton = gamepadData.buttons[ buttonName ]

            const oldValue = savedButton.value
            const oldPressed = savedButton.pressed

            Object.assign(savedButton, newButton)

            if(newButton.pressed)
            {
                if(!oldPressed)
                    this.events.trigger('down', [ savedButton ])
            }
            else
            {
                if(oldPressed)
                    this.events.trigger('up', [ savedButton ])
            }

            if(newButton.value !== oldValue)
                this.events.trigger('change', [ savedButton ])
        }

        /**
         * Joysticks
         */
        for(const joystickName in this.joysticks)
        {
            const savedJoystick = this.joysticks[ joystickName ]
            const newJoystick = gamepadData.joysticks[ joystickName ]

            Object.assign(savedJoystick, newJoystick)
        }

        /**
         * Type
         */
        let type = 'default'
        
        if(/xbox/i.test(gamepad.id))
            type = 'xbox'
        else if(/playstation|dualshock|dualsense|ps\d/i.test(gamepad.id))
            type = 'playstation'

        if(type !== this.type)
        {
            const oldType = this.type
            this.type = type
            document.documentElement.classList.remove(`is-gamepad-${oldType}`)
            document.documentElement.classList.add(`is-gamepad-${this.type}`)
            this.events.trigger('typeChange', [ this.type ])
        }
    }
}

/*
    https://w3c.github.io/gamepad/#remapping
    PS5
        Firefox on Windows
            Mapping
                ""
            Axes
                0: Left joystick H [-1, +1]
                1: Left joystick V [-1, +1]
                2: Right joystick H [-1, +1]
                3: L2 [-1, +1]
                4: L2 [-1, +1]
                5: Right joystick V [-1, +1]
                6: ???
                7: ???
                8: ???
                9: Arrows (-1, 1.2857, -0.4286, 0.7142, 0.1429)
            Buttons
                0: square
                1: cross
                2: circle
                3: triangle
                4: l1
                5: r1
                6: l2
                7: r2
                8: select
                9: start
                10: l3
                11: r3
                12: home
                13: pad
                14: microphone
                15: ???

        Firefox on MacOS
            Mapping
                ""
            Axes
                0: Left joystick H [-1, +1]
                1: Left joystick V [-1, +1]
                2: Right joystick H [-1, +1]
                3: Right joystick V [-1, +1]
                4: L2 [-1, +1]
                5: R2 [-1, +1]
                6: Arrows (-1, 1.2857, -0.4286, 0.7142, 0.1429)
            Buttons
                0: square
                1: cross
                2: circle
                3: triangle
                4: l1
                5: r1
                6: l2
                7: r2
                8: select
                9: start
                10: l3
                11: r3
                12: home
                13: pad
                14: microphone

        Chrome & Safari on MacOS & Windows
            Mapping
                "standard"
            Axes
                0: Left joystick H [-1, +1]
                1: Left joystick V [-1, +1]
                2: Right joystick H [-1, +1]
                3: Right joystick V [-1, +1]
            Buttons
                0: cross
                1: circle
                2: square
                3: triangle
                4: l1
                5: r1
                6: l2
                7: r2
                8: select
                9: start
                10: l3
                11: r3
                12: up
                13: down
                14: left
                15: right
                16: home
                17: pad

    Xbox
        *
            Mapping
                "standard"
            Axes
                0: Left joystick H [-1, +1]
                1: Left joystick V [-1, +1]
                2: Right joystick H [-1, +1]
                3: Right joystick V [-1, +1]
            Buttons
                0: cross
                1: circle
                2: square
                3: triangle
                4: l1
                5: r1
                6: l2
                7: r2
                8: select
                9: start
                10: l3
                11: r3
                12: up
                13: down
                14: left
                15: right
                16: home

*/
