import * as THREE from 'three/webgpu'
import { Events } from './Events.js'
import { Game } from './Game.js'
import { remapClamp } from './utilities/maths.js'

export class Explosions
{
    constructor()
    {
        this.game = new Game()

        this.events = new Events()
    }

    explode(coordinates, radius = 7, strength = 4, vehicleOnly = false, bulletTimeStrengthThreshold = 3)
    {
        // View roll
        const distance = this.game.view.focusPoint.position.distanceTo(coordinates)
        const rollKickStrength = remapClamp(distance, 2, 15, 1, 0)
        this.game.view.roll.kick(rollKickStrength)

        // Leaves
        this.game.world.leaves?.explode(coordinates, radius)

        // Objects physics
        const applyPhysicsExplosion = (physicalObject) =>
        {
            const position = new THREE.Vector3()
            position.copy(physicalObject.body.translation())
            const direction = position.clone().sub(coordinates)
            direction.y = 0
            const distance = Math.hypot(direction.x, direction.z)

            const fadedStrength = remapClamp(distance, 1, radius, 1, 0)
            const impulse = direction.clone().setLength(0.5)
            impulse.y = 1
            // impulse.x = 0.25
            // impulse.z = 0.25
            impulse.normalize()

            const finalStrength = fadedStrength * strength
            
            impulse.setLength(finalStrength * physicalObject.body.mass())

            if(fadedStrength > 0)
            {
                // const point = direction.negate().setLength(0).add(position)
                const point = position
                this.game.ticker.wait(1, () =>
                {
                    physicalObject.body.applyImpulseAtPoint(impulse, point, true)
                })

                // Is vehicle
                if(physicalObject === this.game.physicalVehicle.chassis.physical)
                {
                    if(finalStrength > bulletTimeStrengthThreshold)
                    {
                        this.game.time.bulletTime.activate()

                        return true
                    }
                }
            }

            return false
        }

        let vehicleHit = false
        if(vehicleOnly)
            vehicleHit = applyPhysicsExplosion(this.game.physicalVehicle.chassis.physical)
        else
            this.game.objects.list.forEach((object) =>
            {
                if(object.physical && object.physical.type === 'dynamic' && object.physical.body.isEnabled())
                    vehicleHit = vehicleHit | applyPhysicsExplosion(object.physical)
            })
        // console.log('vehicleHit', vehicleHit)

        return vehicleHit
    }
}