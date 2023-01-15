import { Entries, PartialDeep } from 'type-fest'
import repos from '../src/data/repos.json'

export type Repos = typeof repos
export type ReposEntries = Entries<Repos>
export type PartialRepos = PartialDeep<Repos, { recurseIntoArrays: true }>
