export const timeToRaceString = (time) =>
{
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor((time % 60))
    const milliseconds = Math.floor((time * 1000) % 1000)

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`
}

export function timeToReadableString(time, withHours = true, widthMinutes = true, withSeconds = true)
{
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor((time % 60))
    // const milliseconds = (time * 1000) % 1000
    
    const parts = []

    if(hours > 0 && withHours)
        parts.push(`${hours}h`)

    if((hours > 0 || minutes > 0) && widthMinutes)
        parts.push(`${minutes}m`)

    if((hours > 0 || minutes > 0 || seconds > 0) && withSeconds)
        parts.push(`${seconds}s`)

    return parts.join(' ')
}