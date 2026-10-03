import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import CubeRenderTarget from 'three/src/renderers/common/CubeRenderTarget.js'

export class PreRenderer
{
    static render()
    {
        const game = Game.getInstance()

        // Setup
        const renderTarget = new CubeRenderTarget(32)
        
        const cubeCamera = new THREE.CubeCamera(1, 100000, renderTarget)
        game.scene.add(cubeCamera)

        // Make all visible
        const invisibles = []
        game.scene.traverse((child) =>
        {
            if(child.visible === false && typeof child.userData.preventPreRender === 'undefined')
            {
                child.visible = true
                invisibles.push(child)
            }
        })

        // Force render
        cubeCamera.update(game.rendering.renderer, game.scene)

        // Hide back
        for(const child of invisibles)
            child.visible = false
    }
}