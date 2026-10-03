export default class ObservableSet extends Set
{
    constructor(callback, ...args)
    {
        super(...args)
        this.callback = callback
    }

    add(value)
    {
        const existed = this.has(value)
        const result = super.add(value)
        if (!existed)
        {
            this.callback({ type: "add", value })
        }
        return result
    }

    delete(value)
    {
        const existed = this.has(value)
        const result = super.delete(value)
        if (existed)
        {
            this.callback({ type: "delete", value })
        }
        return result
    }

    clear()
    {
        const hadItems = this.size > 0
        const previousValues = [...this]
        super.clear()
        if (hadItems)
        {
            this.callback({ type: "clear", previousValues: previousValues })
        }
    }
}
