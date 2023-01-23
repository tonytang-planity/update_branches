import { ReposEntries } from 'types/repos'
import repos from './data/repos.json'
import { pullBranchesAndGetNbCommitsBehind } from './pullBranchesAndGetNbCommitsBehind'
import { mergeBranches } from './mergeBranches'

// Change to true to debug
const debug = false

async function main() {
    const features = Object.entries(repos) as ReposEntries
    const featuresToUpdate = await pullBranchesAndGetNbCommitsBehind(
        features,
        debug
    )
}

main()
