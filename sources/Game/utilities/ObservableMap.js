export default class ObservableMap extends Map
{
    constructor(callback, ...args)
    {
        super(...args)
        this.callback = callback
    }

    set(key, value)
    {
        const result = super.set(key, value)
        this.callback({ type: "set", key, value })
        return result
    }

    delete(key)
    {
        const result = super.delete(key)
        this.callback({ type: "delete", key })
        return result
    }

    clear()
    {
        super.clear()
        this.callback({ type: "clear" })
    }
}