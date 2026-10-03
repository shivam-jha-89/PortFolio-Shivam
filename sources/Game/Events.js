export class Events
{
    constructor()
    {
        this.callbacks = {}
    }

    on(_name, _callback, _order = 1)
    {
        // Create callbacks array if needed
        if(!(this.callbacks[_name] instanceof Array))
            this.callbacks[_name] = []

        // Create order array if needed
        if(!(this.callbacks[_name][_order] instanceof Array))
            this.callbacks[_name][_order] = []

        // Save callback
        this.callbacks[_name][_order].push(_callback)

        return this
    }

    off(_name, _callback = null)
    {
        // Remove specific
        if(typeof _callback === 'function')
        {
            for(const order in this.callbacks[_name])
            {
                // Find
                const callbacks = this.callbacks[_name][order]
                const index = callbacks.indexOf(_callback)

                if(index !== -1)
                    callbacks.splice(index, 1)
            }
        }

        // Remove all
        else
        {
            if(this.callbacks[_name] instanceof Array)
                delete this.callbacks[_name]
        }

        return this
    }

    trigger(_name, _arguments = [])
    {
        if(this.callbacks[_name] instanceof Array)
        {
            for(const order in this.callbacks[_name])
            {
                for(const _callbackFunction of this.callbacks[_name][order])
                {
                    _callbackFunction.apply(this, _arguments)
                }
            }
        }
        
        return this
    }
}