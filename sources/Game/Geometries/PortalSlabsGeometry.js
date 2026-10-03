import * as THREE from 'three/webgpu'


export class PortalSlabGeometry extends THREE.BufferGeometry
{
    constructor(size = 1)
    {
        super()

        this.type = 'PortalSlabsGeometry'

        this.parameters = {
            size
        }

        // Positions
        const positions = new Float32Array(8 * 3)

        positions[0] = -size
        positions[1] = 0
        positions[2] = -size

        positions[3] = -size
        positions[4] = 0
        positions[5] = -size

        positions[6] = size
        positions[7] = 0
        positions[8] = -size

        positions[9]  = size
        positions[10] = 0
        positions[11] = -size

        positions[12] = size
        positions[13] = 0
        positions[14] = size

        positions[15] = size
        positions[16] = 0
        positions[17] = size

        positions[18] = -size
        positions[19] = 0
        positions[20] = size

        positions[21] = -size
        positions[22] = 0
        positions[23] = size

        // Edges
        const edges = new Float32Array(8)

        edges[0] = 0
        edges[1] = 1
        edges[2] = 0
        edges[3] = 1
        edges[4] = 0
        edges[5] = 1
        edges[6] = 0
        edges[7] = 1

        // Indices
        const indices = new Uint16Array(6 * 4)

        indices[0] = 0
        indices[1] = 3
        indices[2] = 2

        indices[3] = 3
        indices[4] = 0
        indices[5] = 1

        indices[6] = 2
        indices[7] = 5
        indices[8] = 4

        indices[9]  = 5
        indices[10] = 2
        indices[11] = 3

        indices[12] = 4
        indices[13] = 7
        indices[14] = 6

        indices[15] = 7
        indices[16] = 4
        indices[17] = 5

        indices[18] = 6
        indices[19] = 1
        indices[20] = 0

        indices[21] = 1
        indices[22] = 6
        indices[23] = 7

        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.setAttribute('edge', new THREE.Float32BufferAttribute(edges, 3))
        this.setIndex(new THREE.Uint16BufferAttribute(indices, 1))
    }
}
export class PortalSlabsGeometry extends THREE.BufferGeometry
{
    constructor(size = 1, columnsCount = 5)
    {
        super()

        this.type = 'PortalSlabsGeometry'

        this.parameters = {
            size,
            columnsCount
        }

        // Instantiate one unique slab as a reference
        const slabGeometry = new PortalSlabGeometry()

        const verticesCount = slabGeometry.attributes.position.count
        const indicesCount = slabGeometry.index.count

        const slabPositions = slabGeometry.attributes.position.array
        const slabEdges = slabGeometry.attributes.edge.array
        const slabIndices = slabGeometry.index.array

        // Grid of slabs
        const slabsCount = columnsCount * columnsCount
        
        const positions = new Float32Array(verticesCount * slabsCount * 3)
        const centers = new Float32Array(verticesCount * slabsCount * 2)
        const edges = new Float32Array(verticesCount * slabsCount)
        const randoms = new Float32Array(verticesCount * slabsCount)
        const distanceToCenters = new Float32Array(verticesCount * slabsCount)
        const indices = new Uint16Array(indicesCount * slabsCount)

        for(let x = 0; x < columnsCount; x++)
        {
            for(let z = 0; z < columnsCount; z++)
            {
                const slabX = (x - (columnsCount - 1) * 0.5) * size
                const slabZ = (z - (columnsCount - 1) * 0.5) * size
                const random = Math.random()

                let slabIndex = z + x * columnsCount
                for(let i = 0; i < verticesCount; i++)
                {
                    positions[(slabIndex * verticesCount + i) * 3 + 0] = slabPositions[i * 3 + 0] * size / 2 + slabX
                    positions[(slabIndex * verticesCount + i) * 3 + 1] = slabPositions[i * 3 + 1]
                    positions[(slabIndex * verticesCount + i) * 3 + 2] = slabPositions[i * 3 + 2] * size / 2 + slabZ

                    centers[(slabIndex * verticesCount + i) * 2 + 0] = slabX
                    centers[(slabIndex * verticesCount + i) * 2 + 1] = slabZ

                    edges[slabIndex * verticesCount + i] = slabEdges[i]
                    randoms[slabIndex * verticesCount + i] = random
                    distanceToCenters[slabIndex * verticesCount + i] = Math.hypot(slabX, slabZ)
                }

                for(let i = 0; i < indicesCount; i++)
                {
                    indices[slabIndex * indicesCount + i] = slabIndex * verticesCount + slabIndices[i + 0]
                }
            }
        }

        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        this.setAttribute('center', new THREE.Float32BufferAttribute(centers, 2))
        this.setAttribute('edge', new THREE.Float32BufferAttribute(edges, 1))
        this.setAttribute('random', new THREE.Float32BufferAttribute(randoms, 1))
        this.setAttribute('distanceToCenter', new THREE.Float32BufferAttribute(distanceToCenters, 1))
        this.setIndex(new THREE.Uint16BufferAttribute(indices, 1))
    }
}