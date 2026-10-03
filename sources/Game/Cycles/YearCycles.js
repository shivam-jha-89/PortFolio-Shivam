import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

export class YearCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = import.meta.env.VITE_YEAR_CYCLE_PROGRESS ? parseFloat(import.meta.env.VITE_YEAR_CYCLE_PROGRESS) : null
        super('🕜 Year Cycles', 60 * 60 * 24 * 365, forcedProgress, false)
    }

    getKeyframesDescriptions()
    {
        const presets = {
            winter: { leaves: 0.25, temperature: 5,  humidity: 0.8, clouds: 0.65, wind: 0.3 },
            spring: { leaves: 0, temperature: 15, humidity: 0.65, clouds: 0.45, wind: 0.2 },
            summer: { leaves: 0.25, temperature: 25, humidity: 0.5, clouds: 0.3,  wind: 0.1 },
            fall:   { leaves: 1, temperature: 15, humidity: 0.65, clouds: 0.65, wind: 0.25 },
        }
        
        return [
            [
                { properties: presets.winter, stop: 0 + 0.125 },
                { properties: presets.spring, stop: 0.25 + 0.125 },
                { properties: presets.summer, stop: 0.5 + 0.125 },
                { properties: presets.fall, stop: 0.75 + 0.125 },
            ]
        ]
    }
}