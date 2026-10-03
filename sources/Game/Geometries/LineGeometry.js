import * as THREE from 'three/webgpu'

export class LineGeometry extends THREE.BufferGeometry
{
    constructor(points = [])
    {
        super()

        this.type = 'LineGeometry'

        this.parameters = {
            points
        }

        const count = points.length
        
        const positions = new Float32Array(count * 3 * 2)
        const directions = new Float32Array(count * 3 * 2)
        const ratios = new Float32Array(count * 2)
        const indices = new Uint16Array((count - 1) * 2 * 3)
        
        for(let i = 0; i < count; i++)
        {
            const i2 = i * 2
            const i6 = i * 6

            const point = points[i]
            const nextPoint = points[Math.min(i + 1, count - 1)]
            // TODO: handle latest point

            // Position
            positions[i6 + 0] = point.x
            positions[i6 + 1] = point.y
            positions[i6 + 2] = point.z

            positions[i6 + 3] = point.x
            positions[i6 + 4] = point.y
            positions[i6 + 5] = point.z

            // Direction
            const direction = nextPoint.clone().sub(point).normalize()

            directions[i6 + 0] = direction.x
            directions[i6 + 1] = direction.y
            directions[i6 + 2] = direction.z

            directions[i6 + 3] = direction.x
            directions[i6 + 4] = direction.y
            directions[i6 + 5] = direction.z

            // Progress
            ratios[i2 + 0] = i / (count - 1)
            ratios[i2 + 1] = i / (count - 1)

            // Index
            indices[i6 + 0] = i2 + 2
            indices[i6 + 1] = i2
            indices[i6 + 2] = i2 + 1
            indices[i6 + 3] = i2 + 1
            indices[i6 + 4] = i2 + 3
            indices[i6 + 5] = i2 + 2
        }

        // Attributes
        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 3))
        this.setAttribute('ratio', new THREE.Float32BufferAttribute(ratios, 1))
        this.setIndex(new THREE.Uint16BufferAttribute(indices, 1))
    }
}