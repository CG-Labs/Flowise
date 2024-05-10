import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses, getCredentialData, getCredentialParam } from '../../../src/utils'

class TavilySearchAPI_Tools implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]

    constructor() {
        this.label = 'Tavily Search API'
        this.name = 'tavilySearchAPI'
        this.version = 1.0
        this.type = 'TavilySearchAPI'
        this.icon = 'tavily.svg'
        this.category = 'Tools'
        this.description = 'Wrapper around Tavily Search API - a real-time API to review multiple search engine search results'
        this.inputs = [
            {
                label: 'Max Results',
                name: 'max_results',
                type: 'number',
                default: 5,
                optional: true,
                description: 'The number of maximum search results to return. Default is 5'
            }
        ]
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            credentialNames: ['tavilySearchApi']
        }
        this.baseClasses = [this.type, ...getBaseClasses(TavilySearchResults)]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const credentialData = await getCredentialData(nodeData.credential ?? '', options)
        const tavilySearchApiKey = getCredentialParam('tavilySearchApiKey', credentialData, nodeData)
        return new TavilySearchResults({ apiKey: tavilySearchApiKey })
    }
}

module.exports = { nodeClass: TavilySearchAPI_Tools }
