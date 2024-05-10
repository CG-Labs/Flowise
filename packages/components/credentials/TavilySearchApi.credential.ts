import { INodeParams, INodeCredential } from '../src/Interface'

class TavilySearchApi implements INodeCredential {
    label: string
    name: string
    version: number
    description: string
    inputs: INodeParams[]

    constructor() {
        this.label = 'Tavily Search API'
        this.name = 'tavilySearchApi'
        this.version = 1.0
        this.inputs = [
            {
                label: 'Tavily Search Api Key',
                name: 'tavilySearchApiKey',
                type: 'password'
            }
        ]
    }
}

module.exports = { credClass: TavilySearchApi }
