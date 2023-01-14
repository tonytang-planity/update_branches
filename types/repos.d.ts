import { Entries } from 'type-fest'
import repos from '../src/data/repos.json'

export type Repos = typeof repos
export type ReposEntries = Entries<Repos>
