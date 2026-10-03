export class References
{
    constructor(model)
    {
        this.items = new Map()

        if(model)
            this.parse(model)
    }

    parse(object)
    {
        object.traverse(_child =>
        {
            const name = _child.name

            // Anything starting with "reference"
            const matches = name.match(/^ref(?:erence)?([^0-9]+)([0-9]+)?$/)
            if(matches)
            {
                // Extract name without "reference" and without number at the end
                const referenceName = matches[1].charAt(0).toLowerCase() + matches[1].slice(1)
                
                // Create / save in array
                if(!this.items.has(referenceName))
                    this.items.set(referenceName, [_child])
                else
                    this.items.get(referenceName).push(_child)
            }
        })
    }

    getStartingWith(searched)
    {
        const items = new Map()

        this.items.forEach((value, name) =>
        {
            if(name.startsWith(searched))
            {
                // Strip name from searched value
                let stripName = name.replace(new RegExp(`^${searched}(.+)$`), '$1')
                stripName = stripName.charAt(0).toLowerCase() + stripName.slice(1)

                items.set(stripName, value)
            }
        })

        return items
    }
}