import { ReposEntries } from 'types/repos'
import repos from './data/repos.json'
import { pullBranchesAndGetNbCommitsBehind } from './pullBranchesAndGetNbCommitsBehind'

// Change to true to debug
const debug = false

async function main() {
    const features = Object.entries(repos) as ReposEntries
    await pullBranchesAndGetNbCommitsBehind(features, debug)
}

main()
